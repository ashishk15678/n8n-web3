use chrono::Utc;
use log::{error, info, warn};
use serde_json::json;
use std::fmt;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct DeploymentLog {
    pub job_id: Uuid,
    pub stage: DeploymentStage,
    pub message: String,
    pub timestamp: chrono::DateTime<Utc>,
}

#[derive(Debug, Clone, serde::Serialize)]
pub enum DeploymentStage {
    Queued,
    Initializing,
    CreatingBuffer,
    WritingProgram,
    DeployingProgram,
    ClosingBuffer,
    Completed,
    Failed,
}

impl fmt::Display for DeploymentStage {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DeploymentStage::Queued => write!(f, "queued"),
            DeploymentStage::Initializing => write!(f, "initializing"),
            DeploymentStage::CreatingBuffer => write!(f, "creating_buffer"),
            DeploymentStage::WritingProgram => write!(f, "writing_program"),
            DeploymentStage::DeployingProgram => write!(f, "deploying_program"),
            DeploymentStage::ClosingBuffer => write!(f, "closing_buffer"),
            DeploymentStage::Completed => write!(f, "completed"),
            DeploymentStage::Failed => write!(f, "failed"),
        }
    }
}

pub fn log_deployment(log: DeploymentLog) {
    let log_entry = json!({
        "job_id": log.job_id.to_string(),
        "stage": log.stage.to_string(),
        "message": log.message,
        "timestamp": log.timestamp.to_rfc3339()
    });
    info!("{}", log_entry);
}

pub fn log_deployment_error(job_id: Uuid, stage: DeploymentStage, error: &str) {
    let log_entry = json!({
        "job_id": job_id.to_string(),
        "stage": stage.to_string(),
        "error": error,
        "timestamp": Utc::now().to_rfc3339()
    });
    error!("{}", log_entry);
}

pub fn log_deployment_warning(job_id: Uuid, stage: DeploymentStage, warning: &str) {
    let log_entry = json!({
        "job_id": job_id.to_string(),
        "stage": stage.to_string(),
        "warning": warning,
        "timestamp": Utc::now().to_rfc3339()
    });
    warn!("{}", log_entry);
}
