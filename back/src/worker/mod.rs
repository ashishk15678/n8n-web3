mod pool;
mod solana;
pub mod types;

use crate::common::AppResult;
use crate::worker::types::{DeploymentRequest, DeploymentStatus};
use log::{error, info};
use std::sync::Arc;
use tokio::sync::Mutex;

pub use pool::ThreadPool;
pub use solana::SolanaDeploymentWorker;
pub use types::{ActiveDeployment, Message, Worker, WorkerConfig};

pub async fn process_deployment(request: DeploymentRequest) -> AppResult<()> {
    info!("Processing deployment request: {}", request.id);

    match request.program_type.to_lowercase().as_str() {
        "solana" => {
            let worker = SolanaDeploymentWorker::new(
                &std::env::var("SOLANA_RPC_URL")
                    .unwrap_or_else(|_| "https://api.devnet.solana.com".to_string()),
            );
            worker.process_deployment(request).await
        }
        "evm" => {
            // TODO: Implement EVM deployment
            Err(crate::common::AppError::SolanaDeploymentError(
                "EVM deployment not yet implemented".to_string(),
            ))
        }
        _ => Err(crate::common::AppError::SolanaDeploymentError(format!(
            "Unsupported program type: {}",
            request.program_type
        ))),
    }
}
