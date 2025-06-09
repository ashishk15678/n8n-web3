pub mod error;
pub mod logging;

pub use error::{AppError, AppResult};
pub use logging::{
    log_deployment, log_deployment_error, log_deployment_warning, DeploymentLog, DeploymentStage,
};

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct DeploymentLogEntry {
    pub timestamp: DateTime<Utc>,
    pub stage: String,
    pub message: String,
    pub details: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeploymentLogFile {
    pub deployment_id: Uuid,
    pub program_type: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub status: String,
    pub entries: Vec<DeploymentLogEntry>,
}

pub fn init_deployment_log(
    deployment_id: Uuid,
    program_type: &str,
) -> AppResult<DeploymentLogFile> {
    let log_dir = Path::new("deployment_logs");
    fs::create_dir_all(log_dir)?;

    let log_path = log_dir.join(format!("{}.json", deployment_id));

    // If log file already exists, return error
    if log_path.exists() {
        return Err(AppError::LogError(format!(
            "Log file already exists for deployment {}",
            deployment_id
        )));
    }

    let log = DeploymentLogFile {
        deployment_id,
        program_type: program_type.to_string(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
        status: "initialized".to_string(),
        entries: Vec::new(),
    };

    write_deployment_log(&log)?;
    Ok(log)
}

pub fn write_deployment_log(log: &DeploymentLogFile) -> AppResult<()> {
    let log_dir = Path::new("deployment_logs");
    fs::create_dir_all(log_dir)?;

    let log_path = log_dir.join(format!("{}.json", log.deployment_id));
    let mut file = File::create(log_path)?;

    let json = serde_json::to_string_pretty(log)?;
    file.write_all(json.as_bytes())?;

    Ok(())
}

pub fn append_deployment_log_entry(
    deployment_id: Uuid,
    stage: &str,
    message: &str,
    details: Option<serde_json::Value>,
) -> AppResult<()> {
    let log_dir = Path::new("deployment_logs");
    let log_path = log_dir.join(format!("{}.json", deployment_id));

    // If log file doesn't exist, return error instead of creating a new one
    if !log_path.exists() {
        return Err(AppError::LogError(format!(
            "Log file not found for deployment {}",
            deployment_id
        )));
    }

    let mut log: DeploymentLogFile = {
        let content = fs::read_to_string(&log_path)?;
        serde_json::from_str(&content)?
    };

    log.entries.push(DeploymentLogEntry {
        timestamp: Utc::now(),
        stage: stage.to_string(),
        message: message.to_string(),
        details,
    });

    log.updated_at = Utc::now();
    write_deployment_log(&log)
}
