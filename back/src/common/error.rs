use std::fmt;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Queue is full")]
    QueueFull,

    #[error("Thread pool is at capacity")]
    ThreadPoolFull,

    #[error("Deployment not found: {0}")]
    DeploymentNotFound(String),

    #[error("Invalid program type: {0}")]
    InvalidProgramType(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Thread error: {0}")]
    ThreadError(String),

    #[error("Channel error: {0}")]
    ChannelError(String),

    #[error("Solana deployment error: {0}")]
    SolanaDeploymentError(String),

    #[error("Log error: {0}")]
    LogError(String),

    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("Invalid deployment state: {0}")]
    InvalidDeploymentState(String),

    #[error("Ethereum deployment error: {0}")]
    EthereumDeploymentError(String),

    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),

    #[error("Other error: {0}")]
    Other(String),
}

impl From<crossbeam_channel::SendError<()>> for AppError {
    fn from(err: crossbeam_channel::SendError<()>) -> Self {
        AppError::ChannelError(err.to_string())
    }
}

impl From<crossbeam_channel::RecvError> for AppError {
    fn from(err: crossbeam_channel::RecvError) -> Self {
        AppError::ChannelError(err.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
