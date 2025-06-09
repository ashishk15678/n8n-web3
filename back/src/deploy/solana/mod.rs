use crate::common::AppResult;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use solana_client::rpc_client::RpcClient;
use solana_sdk::{commitment_config::CommitmentConfig, pubkey::Pubkey, signature::Keypair};
use std::path::PathBuf;
use uuid::Uuid;

pub mod deployer;
pub mod types;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SolanaDeploymentConfig {
    pub rpc_url: String,
    pub payer_keypair_path: String,
    pub program_keypair_path: String,
    pub compute_unit_limit: u32,
    pub compute_unit_price: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SolanaDeploymentContext {
    pub deployment_id: Uuid,
    pub config: SolanaDeploymentConfig,
    pub program_id: Option<Pubkey>,
    pub buffer_pubkey: Option<Pubkey>,
    pub status: SolanaDeploymentStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SolanaDeploymentStatus {
    Initialized,
    BufferCreated,
    ProgramDataWritten,
    ProgramDeployed,
    BufferClosed,
    Failed(String),
}

#[async_trait::async_trait]
pub trait SolanaDeployer: Send + Sync {
    async fn initialize(
        &mut self,
        config: SolanaDeploymentConfig,
    ) -> AppResult<SolanaDeploymentContext>;

    async fn initialize_with_program_data(
        &mut self,
        config: SolanaDeploymentConfig,
        program_data: Vec<u8>,
    ) -> AppResult<SolanaDeploymentContext>;

    async fn create_buffer(&mut self, context: &mut SolanaDeploymentContext) -> AppResult<()>;
    async fn write_program_data(&mut self, context: &mut SolanaDeploymentContext) -> AppResult<()>;
    async fn deploy_program(&mut self, context: &mut SolanaDeploymentContext) -> AppResult<()>;
    async fn close_buffer(&mut self, context: &mut SolanaDeploymentContext) -> AppResult<()>;
    async fn cleanup(&mut self, context: &mut SolanaDeploymentContext) -> AppResult<()>;
}
