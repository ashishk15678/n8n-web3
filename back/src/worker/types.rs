use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fmt;
use std::thread::JoinHandle;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeploymentStatus {
    Queued,
    Processing,
    Completed,
    Failed(String),
}

impl fmt::Display for DeploymentStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DeploymentStatus::Queued => write!(f, "queued"),
            DeploymentStatus::Processing => write!(f, "processing"),
            DeploymentStatus::Completed => write!(f, "completed"),
            DeploymentStatus::Failed(_) => write!(f, "failed"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeploymentRequest {
    pub id: Uuid,
    pub program: Vec<u8>,
    pub program_type: String,
    pub redirect_uri: String,
    pub status: DeploymentStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug)]
pub struct ActiveDeployment {
    pub request: DeploymentRequest,
    pub worker_id: usize,
}

#[derive(Debug)]
pub enum Message {
    NewDeployment(DeploymentRequest),
    DeploymentComplete(Uuid),
    DeploymentFailed(Uuid, String),
    Shutdown,
}

#[derive(Debug)]
pub struct Worker {
    pub id: usize,
    pub thread: Option<JoinHandle<()>>,
}

#[derive(Debug)]
pub struct WorkerConfig {
    pub max_threads: usize,
    pub queue_size: usize,
}
