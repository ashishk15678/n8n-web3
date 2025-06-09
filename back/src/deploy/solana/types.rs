use crate::common::AppError;
use solana_sdk::pubkey::Pubkey;
use std::fmt;

#[derive(Debug)]
pub enum SolanaDeploymentError {
    KeypairLoadError(String),
    ProgramBinaryReadError(String),
    RpcError(String),
    TransactionError(String),
    BufferCreationError(String),
    ProgramDeploymentError(String),
    BufferCloseError(String),
    InvalidProgramState(String),
    InsufficientFunds(Pubkey, u64),
}

impl fmt::Display for SolanaDeploymentError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SolanaDeploymentError::KeypairLoadError(e) => {
                write!(f, "Failed to load keypair: {}", e)
            }
            SolanaDeploymentError::ProgramBinaryReadError(e) => {
                write!(f, "Failed to read program binary: {}", e)
            }
            SolanaDeploymentError::RpcError(e) => write!(f, "RPC error: {}", e),
            SolanaDeploymentError::TransactionError(e) => write!(f, "Transaction error: {}", e),
            SolanaDeploymentError::BufferCreationError(e) => {
                write!(f, "Buffer creation error: {}", e)
            }
            SolanaDeploymentError::ProgramDeploymentError(e) => {
                write!(f, "Program deployment error: {}", e)
            }
            SolanaDeploymentError::BufferCloseError(e) => write!(f, "Buffer close error: {}", e),
            SolanaDeploymentError::InvalidProgramState(e) => {
                write!(f, "Invalid program state: {}", e)
            }
            SolanaDeploymentError::InsufficientFunds(pubkey, amount) => write!(
                f,
                "Insufficient funds for account {}: required {} lamports",
                pubkey, amount
            ),
        }
    }
}

impl std::error::Error for SolanaDeploymentError {}

impl From<SolanaDeploymentError> for AppError {
    fn from(error: SolanaDeploymentError) -> Self {
        AppError::SolanaDeploymentError(error.to_string())
    }
}

#[derive(Debug, Clone)]
pub struct SolanaDeploymentResult {
    pub program_id: Pubkey,
    pub buffer_pubkey: Pubkey,
    pub deployment_signature: String,
    pub buffer_close_signature: Option<String>,
    pub total_cost: u64,
}

#[derive(Debug, Clone)]
pub struct SolanaDeploymentConfig {
    pub rpc_url: String,
    pub payer_keypair_path: String,
    pub program_keypair_path: String,
    pub compute_unit_limit: u32,
    pub compute_unit_price: u64,
}

#[derive(Debug, Clone)]
pub enum SolanaDeploymentStatus {
    Initialized,
    BufferCreated,
    ProgramDataWritten,
    ProgramDeployed,
    BufferClosed,
    Failed(String),
}

impl std::fmt::Display for SolanaDeploymentStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SolanaDeploymentStatus::Initialized => write!(f, "initialized"),
            SolanaDeploymentStatus::BufferCreated => write!(f, "buffer_created"),
            SolanaDeploymentStatus::ProgramDataWritten => write!(f, "program_data_written"),
            SolanaDeploymentStatus::ProgramDeployed => write!(f, "program_deployed"),
            SolanaDeploymentStatus::BufferClosed => write!(f, "buffer_closed"),
            SolanaDeploymentStatus::Failed(reason) => write!(f, "failed: {}", reason),
        }
    }
}
