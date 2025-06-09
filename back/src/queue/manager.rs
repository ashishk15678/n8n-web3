use super::types::{DeploymentQueue, QueueConfig, QueueStats};
use crate::common::{AppError, AppResult};
use crate::worker::types::{ActiveDeployment, DeploymentRequest, DeploymentStatus};
use crate::ThreadPool;
use chrono::Utc;
use log::{error, info, warn};
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;

pub struct QueueManager {
    queue: Arc<Mutex<DeploymentQueue>>,
    thread_pool: Arc<ThreadPool>,
}

impl QueueManager {
    pub fn new(queue_config: QueueConfig, thread_pool: ThreadPool) -> Self {
        Self {
            queue: Arc::new(Mutex::new(DeploymentQueue::new(queue_config))),
            thread_pool: Arc::new(thread_pool),
        }
    }

    pub async fn enqueue(&self, mut request: DeploymentRequest) -> AppResult<Uuid> {
        let mut queue = self.queue.lock().await;
        let stats = queue.stats();

        // Check queue limits
        if stats.pending >= queue.config.max_pending {
            warn!("Queue limit reached: {} pending requests", stats.pending);
            return Err(AppError::QueueFull);
        }

        // Check active deployments
        if stats.active >= queue.config.max_active {
            // Add to pending queue
            request.status = DeploymentStatus::Queued;
            request.created_at = Utc::now();
            request.updated_at = Utc::now();
            let id = request.id;
            queue.pending.push_back(request);
            info!("Deployment {} queued ({} pending)", id, stats.pending + 1);
            return Ok(id);
        }

        // Process immediately
        request.status = DeploymentStatus::Processing;
        request.created_at = Utc::now();
        request.updated_at = Utc::now();
        let id = request.id;

        // Add to active deployments
        queue.active.insert(
            id,
            ActiveDeployment {
                request: request.clone(),
                worker_id: 0,
            },
        );

        // Send to thread pool
        if let Err(e) = self.thread_pool.execute(request) {
            error!("Failed to execute deployment {}: {}", id, e);
            queue.active.remove(&id);
            return Err(e);
        }

        info!("Deployment {} started processing", id);
        Ok(id)
    }

    pub async fn get_status(&self, id: Uuid) -> AppResult<DeploymentStatus> {
        let queue = self.queue.lock().await;

        // Check active deployments
        if let Some(deployment) = queue.active.get(&id) {
            return Ok(deployment.request.status.clone());
        }

        // Check pending deployments
        if let Some(deployment) = queue.pending.iter().find(|d| d.id == id) {
            return Ok(deployment.status.clone());
        }

        Err(AppError::DeploymentNotFound(id.to_string()))
    }

    pub async fn get_stats(&self) -> QueueStats {
        let queue = self.queue.lock().await;
        queue.stats()
    }

    pub async fn process_queue(&self) -> AppResult<()> {
        let mut queue = self.queue.lock().await;

        // Process pending deployments if we have capacity
        while !queue.pending.is_empty() && queue.active.len() < queue.config.max_active {
            if let Some(mut request) = queue.pending.pop_front() {
                request.status = DeploymentStatus::Processing;
                request.updated_at = Utc::now();
                let id = request.id;

                // Add to active deployments
                queue.active.insert(
                    id,
                    ActiveDeployment {
                        request: request.clone(),
                        worker_id: 0, // Will be assigned by thread pool
                    },
                );

                // Send to thread pool
                if let Err(e) = self.thread_pool.execute(request) {
                    error!("Failed to execute deployment {}: {}", id, e);
                    queue.active.remove(&id);
                    return Err(e);
                }

                info!("Deployment {} started processing from queue", id);
            }
        }

        Ok(())
    }

    pub async fn shutdown(&self) -> AppResult<()> {
        info!("Shutting down queue manager...");
        let queue = self.queue.lock().await;

        // Log current state
        let stats = queue.stats();
        info!(
            "Queue state at shutdown: {} pending, {} active",
            stats.pending, stats.active
        );

        // Thread pool will be dropped automatically, triggering its Drop implementation
        // which sends shutdown messages to all workers
        Ok(())
    }
}

impl Drop for QueueManager {
    fn drop(&mut self) {
        // This will be called when the Arc<QueueManager> is dropped
        // The thread pool's Drop implementation will handle worker cleanup
        info!("Queue manager dropped, cleaning up resources...");
    }
}
