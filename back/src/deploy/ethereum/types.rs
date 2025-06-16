use crate::common::AppError;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fmt;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct EthereumDeploymentConfig {
    pub rpc_url: String,
    pub private_key_path: String,
    pub gas_limit: Option<u64>,
    pub gas_price: Option<u64>,
}

#[derive(Debug, Clone)]
pub struct EthereumDeploymentContext {
    pub deployment_id: Uuid,
    pub config: EthereumDeploymentConfig,
    pub contract_name: String,
    pub contract_address: Option<ethers::types::Address>,
    pub constructor_args: Option<Vec<ethers::abi::Token>>,
    pub status: EthereumDeploymentStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub enum EthereumDeploymentStatus {
    Initialized,
    Compiling,
    Compiled,
    Deploying,
    Deployed,
    Failed(String),
}

impl fmt::Display for EthereumDeploymentStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Initialized => write!(f, "initialized"),
            Self::Compiling => write!(f, "compiling"),
            Self::Compiled => write!(f, "compiled"),
            Self::Deploying => write!(f, "deploying"),
            Self::Deployed => write!(f, "deployed"),
            Self::Failed(reason) => write!(f, "failed: {}", reason),
        }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum EthereumDeploymentError {
    #[error("Invalid deployment state: {0}")]
    InvalidState(String),
    #[error("RPC error: {0}")]
    RpcError(String),
    #[error("Wallet error: {0}")]
    WalletError(String),
    #[error("Compilation error: {0}")]
    CompilationError(String),
    #[error("Deployment error: {0}")]
    DeploymentError(String),
    #[error("Insufficient funds for deployment")]
    InsufficientFunds,
}

impl From<EthereumDeploymentError> for AppError {
    fn from(error: EthereumDeploymentError) -> Self {
        AppError::EthereumDeploymentError(error.to_string())
    }
}

#[async_trait::async_trait]
pub trait EthereumDeployer: Send + Sync {
    async fn initialize(
        &mut self,
        config: EthereumDeploymentConfig,
        source_code: String,
        contract_name: String,
    ) -> crate::common::AppResult<EthereumDeploymentContext>;

    async fn deploy(
        &mut self,
        context: &mut EthereumDeploymentContext,
    ) -> crate::common::AppResult<()>;

    async fn cleanup(
        &mut self,
        context: &mut EthereumDeploymentContext,
    ) -> crate::common::AppResult<()>;
}
