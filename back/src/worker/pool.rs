use super::types::{DeploymentRequest, Message, Worker, WorkerConfig};
use crate::common::AppResult;
use crate::worker::process_deployment;
use crossbeam_channel::{bounded, Receiver, Sender};
use log::{error, info};
use std::sync::Arc;
use std::thread;
use tokio::runtime::Runtime;

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: Sender<Message>,
    config: WorkerConfig,
}

impl ThreadPool {
    pub fn new(config: WorkerConfig) -> AppResult<Self> {
        let (sender, receiver) = bounded(config.queue_size);
        let receiver = Arc::new(receiver);
        let mut workers = Vec::with_capacity(config.max_threads);

        for id in 0..config.max_threads {
            let receiver = Arc::clone(&receiver);
            let worker = Worker {
                id,
                thread: Some(thread::spawn(move || {
                    info!("Worker {} started", id);
                    let rt = Runtime::new().expect("Failed to create tokio runtime");

                    while let Ok(msg) = receiver.recv() {
                        match msg {
                            Message::NewDeployment(request) => {
                                info!("Worker {} processing deployment {}", id, request.id);
                                match rt.block_on(process_deployment(request.clone())) {
                                    Ok(_) => {
                                        info!(
                                            "Worker {} completed deployment {}",
                                            id,
                                            request.clone().id
                                        )
                                    }
                                    Err(e) => error!(
                                        "Worker {} failed deployment {}: {}",
                                        id, request.id, e
                                    ),
                                }
                            }
                            Message::DeploymentComplete(id) => {
                                info!("Worker {} completed deployment {}", id, id);
                            }
                            Message::DeploymentFailed(id, error) => {
                                error!("Worker {} failed deployment {}: {}", id, id, error);
                            }
                            Message::Shutdown => {
                                info!("Worker {} shutting down", id);
                                break;
                            }
                        }
                    }
                    info!("Worker {} stopped", id);
                })),
            };
            workers.push(worker);
        }

        Ok(Self {
            workers,
            sender,
            config,
        })
    }

    pub fn execute(&self, request: DeploymentRequest) -> AppResult<()> {
        self.sender
            .send(Message::NewDeployment(request))
            .map_err(|e| crate::common::AppError::ChannelError(e.to_string()))
    }

    pub fn shutdown(&mut self) -> AppResult<()> {
        for _ in &self.workers {
            if let Err(e) = self.sender.send(Message::Shutdown) {
                error!("Failed to send shutdown message: {}", e);
            }
        }

        for worker in std::mem::take(&mut self.workers) {
            if let Some(thread) = worker.thread {
                if let Err(e) = thread.join() {
                    error!("Worker {} failed to join: {:?}", worker.id, e);
                }
            }
        }

        Ok(())
    }
}
