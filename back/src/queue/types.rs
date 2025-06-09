use crate::worker::types::{ActiveDeployment, DeploymentRequest};
use serde::Serialize;
use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct QueueStats {
    pub pending: usize,
    pub active: usize,
    pub completed: usize,
    pub failed: usize,
}

#[derive(Debug)]
pub struct QueueConfig {
    pub max_pending: usize,
    pub max_active: usize,
}

#[derive(Debug)]
pub struct DeploymentQueue {
    pub pending: VecDeque<DeploymentRequest>,
    pub active: HashMap<Uuid, ActiveDeployment>,
    pub config: QueueConfig,
}

impl DeploymentQueue {
    pub fn new(config: QueueConfig) -> Self {
        Self {
            pending: VecDeque::new(),
            active: HashMap::new(),
            config,
        }
    }

    pub fn stats(&self) -> QueueStats {
        QueueStats {
            pending: self.pending.len(),
            active: self.active.len(),
            completed: 0, // TODO: Track completed deployments
            failed: 0,    // TODO: Track failed deployments
        }
    }
}
