use crate::common::{append_deployment_log_entry, init_deployment_log, AppResult, DeploymentStage};
use crate::deploy::solana::{
    deployer::SolanaProgramDeployer, SolanaDeployer, SolanaDeploymentConfig,
    SolanaDeploymentContext, SolanaDeploymentStatus,
};
use crate::worker::types::{DeploymentRequest, DeploymentStatus};
use log::{error, info};
use serde_json::json;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct SolanaDeploymentWorker {
    deployer: Arc<Mutex<SolanaProgramDeployer>>,
}

impl SolanaDeploymentWorker {
    pub fn new(rpc_url: &str) -> Self {
        Self {
            deployer: Arc::new(Mutex::new(SolanaProgramDeployer::new(rpc_url))),
        }
    }

    pub async fn process_deployment(&self, request: DeploymentRequest) -> AppResult<()> {
        // Early BPF format validation
        if request.program.is_empty() {
            return Err(crate::common::AppError::SolanaDeploymentError(
                "Program data is empty".to_string(),
            ));
        }

        if request.program.len() < 8 || &request.program[0..4] != b"ELF\x00" {
            return Err(crate::common::AppError::SolanaDeploymentError(
                "Program must be a valid BPF format (ELF binary)".to_string(),
            ));
        }

        // Initialize log file for this deployment
        init_deployment_log(request.id, &request.program_type)?;

        append_deployment_log_entry(
            request.id,
            "initializing",
            "Starting Solana deployment",
            Some(json!({
                "program_size": request.program.len(),
                "program_type": request.program_type
            })),
        )?;

        // Parse deployment configuration from request
        let config = self.parse_deployment_config(&request)?;

        // Log configuration details
        append_deployment_log_entry(
            request.id,
            "config",
            "Deployment configuration loaded",
            Some(json!({
                "rpc_url": config.rpc_url,
                "compute_unit_limit": config.compute_unit_limit,
                "compute_unit_price": config.compute_unit_price
            })),
        )?;

        // Initialize deployment context with program binary data
        let mut context = {
            let mut deployer = self.deployer.lock().await;
            deployer
                .initialize_with_program_data(config, request.program)
                .await?
        };

        // Execute deployment steps
        let result = self.execute_deployment(&mut context).await;

        // Update deployment status
        match result {
            Ok(_) => {
                append_deployment_log_entry(
                    request.id,
                    "completed",
                    "Solana deployment completed successfully",
                    Some(json!({
                        "program_id": context.program_id.map(|id| id.to_string()),
                        "buffer_pubkey": context.buffer_pubkey.map(|id| id.to_string())
                    })),
                )?;
                Ok(())
            }
            Err(e) => {
                append_deployment_log_entry(
                    request.id,
                    "failed",
                    &format!("Deployment failed: {}", e),
                    Some(json!({
                        "error": e.to_string(),
                        "stage": context.status
                    })),
                )?;
                error!("Solana deployment failed: {} - {}", request.id, e);
                Err(e)
            }
        }
    }

    fn parse_deployment_config(
        &self,
        request: &DeploymentRequest,
    ) -> AppResult<SolanaDeploymentConfig> {
        // Get keypair paths
        let payer_path =
            std::env::var("SOLANA_PAYER_KEYPAIR").expect("SOLANA_PAYER_KEYPAIR is not set");
        let program_path =
            std::env::var("SOLANA_PROGRAM_KEYPAIR").expect("SOLANA_PROGRAM_KEYPAIR is not set");

        info!("Using payer keypair path: {}", payer_path);
        info!("Using program keypair path: {}", program_path);
        info!(
            "Using program binary data (size: {} bytes)",
            request.program.len()
        );

        // Create deployment configuration
        Ok(SolanaDeploymentConfig {
            rpc_url: std::env::var("SOLANA_RPC_URL")
                .unwrap_or_else(|_| "https://api.devnet.solana.com".to_string()),
            payer_keypair_path: payer_path,
            program_keypair_path: program_path,
            compute_unit_limit: std::env::var("SOLANA_COMPUTE_UNIT_LIMIT")
                .unwrap_or_else(|_| "1000000".to_string())
                .parse()
                .unwrap_or(1_000_000),
            compute_unit_price: std::env::var("SOLANA_COMPUTE_UNIT_PRICE")
                .unwrap_or_else(|_| "1".to_string())
                .parse()
                .unwrap_or(1),
        })
    }

    async fn execute_deployment(&self, context: &mut SolanaDeploymentContext) -> AppResult<()> {
        let mut deployer = self.deployer.lock().await;

        // Create buffer
        append_deployment_log_entry(
            context.deployment_id,
            "creating_buffer",
            "Creating buffer account",
            None,
        )?;
        deployer.create_buffer(context).await?;
        append_deployment_log_entry(
            context.deployment_id,
            "buffer_created",
            "Buffer account created successfully",
            Some(json!({
                "buffer_pubkey": context.buffer_pubkey.map(|id| id.to_string())
            })),
        )?;

        // Write program data
        append_deployment_log_entry(
            context.deployment_id,
            "writing_program",
            "Writing program data to buffer",
            None,
        )?;
        deployer.write_program_data(context).await?;
        append_deployment_log_entry(
            context.deployment_id,
            "program_written",
            "Program data written successfully",
            None,
        )?;

        // Deploy program
        append_deployment_log_entry(
            context.deployment_id,
            "deploying",
            "Deploying program",
            None,
        )?;
        deployer.deploy_program(context).await?;
        append_deployment_log_entry(
            context.deployment_id,
            "deployed",
            "Program deployed successfully",
            Some(json!({
                "program_id": context.program_id.map(|id| id.to_string())
            })),
        )?;

        // Close buffer
        append_deployment_log_entry(
            context.deployment_id,
            "closing_buffer",
            "Closing buffer account",
            None,
        )?;
        deployer.close_buffer(context).await?;
        append_deployment_log_entry(
            context.deployment_id,
            "buffer_closed",
            "Buffer account closed successfully",
            None,
        )?;

        deployer.cleanup(context).await?;
        Ok(())
    }
}

impl From<SolanaDeploymentStatus> for DeploymentStatus {
    fn from(status: SolanaDeploymentStatus) -> Self {
        match status {
            SolanaDeploymentStatus::Initialized => DeploymentStatus::Processing,
            SolanaDeploymentStatus::BufferCreated => DeploymentStatus::Processing,
            SolanaDeploymentStatus::ProgramDataWritten => DeploymentStatus::Processing,
            SolanaDeploymentStatus::ProgramDeployed => DeploymentStatus::Completed,
            SolanaDeploymentStatus::BufferClosed => DeploymentStatus::Completed,
            SolanaDeploymentStatus::Failed(reason) => DeploymentStatus::Failed(reason),
        }
    }
}
