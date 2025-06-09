use super::{
    SolanaDeployer, SolanaDeploymentConfig, SolanaDeploymentContext, SolanaDeploymentStatus,
};
use crate::common::AppResult;
use crate::deploy::solana::types::SolanaDeploymentError;
use log::{error, info};
use serde_json;
use solana_client::rpc_client::RpcClient;
use solana_sdk::system_instruction::create_account;
use solana_sdk::{
    bpf_loader_upgradeable::{self, UpgradeableLoaderState},
    commitment_config::CommitmentConfig,
    compute_budget::ComputeBudgetInstruction,
    instruction::{AccountMeta, Instruction},
    message::Message,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    system_program,
    transaction::Transaction,
};
use std::{fs, sync::Arc};

// Constants for account sizes
const UPGRADEABLE_LOADER_STATE_SIZE: usize = 36;
const PROGRAM_ACCOUNT_METADATA_SIZE: usize = 45;

pub struct SolanaProgramDeployer {
    client: Arc<RpcClient>,
    payer_keypair: Option<Keypair>,
    program_keypair: Option<Keypair>,
    program_data: Option<Vec<u8>>,
}

impl SolanaProgramDeployer {
    pub fn new(rpc_url: &str) -> Self {
        Self {
            client: Arc::new(RpcClient::new_with_commitment(
                rpc_url.to_string(),
                CommitmentConfig::confirmed(),
            )),
            payer_keypair: None,
            program_keypair: None,
            program_data: None,
        }
    }

    async fn load_keypairs(&mut self, config: &SolanaDeploymentConfig) -> AppResult<()> {
        // Load payer keypair
        let payer_path = shellexpand::tilde(&config.payer_keypair_path).into_owned();
        info!("Loading payer keypair from: {}", payer_path);
        let payer_bytes: Vec<u8> =
            serde_json::from_reader(fs::File::open(&payer_path).map_err(|e| {
                info!("Failed to load payer keypair from {}: {}", payer_path, e);
                SolanaDeploymentError::KeypairLoadError(e.to_string())
            })?)
            .map_err(|e| {
                info!("Invalid payer keypair JSON format: {}", e);
                SolanaDeploymentError::KeypairLoadError(e.to_string())
            })?;

        self.payer_keypair = Some(Keypair::from_bytes(&payer_bytes).map_err(|e| {
            info!("Invalid payer keypair format: {}", e);
            SolanaDeploymentError::KeypairLoadError(e.to_string())
        })?);

        // Load program keypair
        let program_path = shellexpand::tilde(&config.program_keypair_path).into_owned();
        info!("Loading program keypair from: {}", program_path);
        let program_bytes: Vec<u8> =
            serde_json::from_reader(fs::File::open(&program_path).map_err(|e| {
                info!(
                    "Failed to load program keypair from {}: {}",
                    program_path, e
                );
                SolanaDeploymentError::KeypairLoadError(e.to_string())
            })?)
            .map_err(|e| {
                info!("Invalid program keypair JSON format: {}", e);
                SolanaDeploymentError::KeypairLoadError(e.to_string())
            })?;

        self.program_keypair = Some(Keypair::from_bytes(&program_bytes).map_err(|e| {
            info!("Invalid program keypair format: {}", e);
            SolanaDeploymentError::KeypairLoadError(e.to_string())
        })?);

        Ok(())
    }

    async fn send_transaction(
        &self,
        instructions: Vec<Instruction>,
        signers: Vec<&Keypair>,
        payer: &Pubkey,
    ) -> AppResult<solana_sdk::signature::Signature> {
        let recent_blockhash = self
            .client
            .get_latest_blockhash()
            .map_err(|e| SolanaDeploymentError::RpcError(e.to_string()))?;

        let message = Message::new(&instructions, Some(payer));
        let transaction = Transaction::new(&signers, message, recent_blockhash);

        let signature = self
            .client
            .send_and_confirm_transaction(&transaction)
            .map_err(|e| SolanaDeploymentError::TransactionError(e.to_string()))?;

        self.client
            .confirm_transaction_with_commitment(&signature, CommitmentConfig::finalized())
            .map_err(|e| SolanaDeploymentError::TransactionError(e.to_string()))?;

        Ok(signature)
    }
}

#[async_trait::async_trait]
impl SolanaDeployer for SolanaProgramDeployer {
    async fn initialize(
        &mut self,
        config: SolanaDeploymentConfig,
    ) -> AppResult<SolanaDeploymentContext> {
        info!("Initializing Solana program deployment...");

        // Load keypairs
        self.load_keypairs(&config).await?;

        let context = SolanaDeploymentContext {
            deployment_id: uuid::Uuid::new_v4(),
            config,
            program_id: None,
            buffer_pubkey: None,
            status: SolanaDeploymentStatus::Initialized,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };

        Ok(context)
    }

    async fn initialize_with_program_data(
        &mut self,
        config: SolanaDeploymentConfig,
        program_data: Vec<u8>,
    ) -> AppResult<SolanaDeploymentContext> {
        info!("Initializing Solana program deployment with program data...");

        // Validate program data
        if program_data.is_empty() {
            return Err(SolanaDeploymentError::InvalidProgramState(
                "Program data is empty".to_string(),
            )
            .into());
        }

        // Basic BPF program validation
        if program_data.len() < 8 || &program_data[0..4] != b"ELF\x00" {
            return Err(SolanaDeploymentError::InvalidProgramState(
                "Invalid BPF program format".to_string(),
            )
            .into());
        }

        // Load keypairs
        self.load_keypairs(&config).await?;

        // Store program data
        self.program_data = Some(program_data);

        let context = SolanaDeploymentContext {
            deployment_id: uuid::Uuid::new_v4(),
            config,
            program_id: None,
            buffer_pubkey: None,
            status: SolanaDeploymentStatus::Initialized,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };

        Ok(context)
    }

    async fn create_buffer(&mut self, context: &mut SolanaDeploymentContext) -> AppResult<()> {
        let program_data = self.program_data.as_ref().ok_or_else(|| {
            SolanaDeploymentError::InvalidProgramState("Program data not loaded".to_string())
        })?;

        let payer_keypair = self.payer_keypair.as_ref().ok_or_else(|| {
            SolanaDeploymentError::InvalidProgramState("Payer keypair not loaded".to_string())
        })?;

        let buffer_keypair = Keypair::new();
        let buffer_pubkey = buffer_keypair.pubkey();

        // Calculate buffer account size including UpgradeableLoaderState overhead
        let buffer_account_len = program_data.len() + UPGRADEABLE_LOADER_STATE_SIZE;

        let buffer_rent_exempt_lamports = self
            .client
            .get_minimum_balance_for_rent_exemption(buffer_account_len)
            .map_err(|e| SolanaDeploymentError::RpcError(e.to_string()))?;

        // Log buffer creation details
        crate::common::append_deployment_log_entry(
            context.deployment_id,
            "buffer_details",
            "Buffer account details calculated",
            Some(serde_json::json!({
                "buffer_pubkey": buffer_pubkey.to_string(),
                "buffer_size": buffer_account_len,
                "program_size": program_data.len(),
                "overhead_size": UPGRADEABLE_LOADER_STATE_SIZE,
                "rent_exempt_lamports": buffer_rent_exempt_lamports
            })),
        )?;

        // Create buffer account instructions
        let mut instructions = vec![
            ComputeBudgetInstruction::set_compute_unit_limit(context.config.compute_unit_limit),
            ComputeBudgetInstruction::set_compute_unit_price(context.config.compute_unit_price),
            create_account(
                &payer_keypair.pubkey(),
                &buffer_pubkey,
                buffer_rent_exempt_lamports,
                buffer_account_len as u64,
                &bpf_loader_upgradeable::id(),
            ),
        ];

        // Add buffer creation instructions with correct authority index
        instructions.extend(
            bpf_loader_upgradeable::create_buffer(
                &payer_keypair.pubkey(),
                &payer_keypair.pubkey(),
                &buffer_pubkey,
                program_data.len() as u64,
                0, // authority index (payer is first account)
            )
            .map_err(|e| SolanaDeploymentError::BufferCreationError(e.to_string()))?,
        );

        // Send transaction with correct signer order
        let signature = self
            .send_transaction(
                instructions,
                vec![payer_keypair, &buffer_keypair], // payer first, then buffer
                &payer_keypair.pubkey(),
            )
            .await?;

        // Log transaction details
        crate::common::append_deployment_log_entry(
            context.deployment_id,
            "buffer_transaction",
            "Buffer creation transaction sent",
            Some(serde_json::json!({
                "signature": signature.to_string(),
                "buffer_pubkey": buffer_pubkey.to_string(),
                "payer_pubkey": payer_keypair.pubkey().to_string()
            })),
        )?;

        // Verify buffer account
        match self.client.get_account(&buffer_pubkey) {
            Ok(account) => {
                crate::common::append_deployment_log_entry(
                    context.deployment_id,
                    "buffer_verification",
                    "Buffer account verified",
                    Some(serde_json::json!({
                        "account_size": account.data.len(),
                        "owner": account.owner.to_string(),
                        "lamports": account.lamports
                    })),
                )?;
            }
            Err(e) => {
                crate::common::append_deployment_log_entry(
                    context.deployment_id,
                    "buffer_verification_error",
                    "Failed to verify buffer account",
                    Some(serde_json::json!({
                        "error": e.to_string()
                    })),
                )?;
            }
        }

        context.buffer_pubkey = Some(buffer_pubkey);
        context.status = SolanaDeploymentStatus::BufferCreated;
        context.updated_at = chrono::Utc::now();

        Ok(())
    }

    async fn write_program_data(&mut self, context: &mut SolanaDeploymentContext) -> AppResult<()> {
        info!("Writing program data to buffer...");

        let program_data = self.program_data.as_ref().ok_or_else(|| {
            SolanaDeploymentError::InvalidProgramState("Program data not loaded".to_string())
        })?;

        let payer_keypair = self.payer_keypair.as_ref().ok_or_else(|| {
            SolanaDeploymentError::InvalidProgramState("Payer keypair not loaded".to_string())
        })?;

        let buffer_pubkey = context.buffer_pubkey.ok_or_else(|| {
            SolanaDeploymentError::InvalidProgramState("Buffer pubkey not set".to_string())
        })?;

        // Write program data in chunks with increased compute budget for larger chunks
        let mut offset = 0;
        const MAX_CHUNK_SIZE: usize = 900;

        while offset < program_data.len() {
            let chunk_size = (program_data.len() - offset).min(MAX_CHUNK_SIZE);
            let chunk = &program_data[offset..offset + chunk_size];

            let instructions = vec![
                ComputeBudgetInstruction::set_compute_unit_limit(
                    context.config.compute_unit_limit * 2, // Double compute budget for writes
                ),
                ComputeBudgetInstruction::set_compute_unit_price(context.config.compute_unit_price),
                bpf_loader_upgradeable::write(
                    &buffer_pubkey,
                    &payer_keypair.pubkey(),
                    offset as u32,
                    chunk.to_vec(),
                ),
            ];

            let signature = self
                .send_transaction(instructions, vec![payer_keypair], &payer_keypair.pubkey())
                .await?;

            info!(
                "Wrote chunk {}-{} (signature: {})",
                offset,
                offset + chunk_size,
                signature.to_string()
            );

            offset += chunk_size;
        }

        context.status = SolanaDeploymentStatus::ProgramDataWritten;
        context.updated_at = chrono::Utc::now();

        Ok(())
    }

    async fn deploy_program(&mut self, context: &mut SolanaDeploymentContext) -> AppResult<()> {
        let program_data = self.program_data.as_ref().ok_or_else(|| {
            SolanaDeploymentError::InvalidProgramState("Program data not loaded".to_string())
        })?;

        let payer_keypair = self.payer_keypair.as_ref().ok_or_else(|| {
            SolanaDeploymentError::InvalidProgramState("Payer keypair not loaded".to_string())
        })?;

        let program_keypair = self.program_keypair.as_ref().ok_or_else(|| {
            SolanaDeploymentError::InvalidProgramState("Program keypair not loaded".to_string())
        })?;

        let buffer_pubkey = context.buffer_pubkey.ok_or_else(|| {
            SolanaDeploymentError::InvalidProgramState("Buffer pubkey not set".to_string())
        })?;

        // Calculate program account size including metadata
        let program_account_data_size = program_data.len() + PROGRAM_ACCOUNT_METADATA_SIZE;

        // Get minimum balance for rent exemption
        let rent_exempt_lamports = self
            .client
            .get_minimum_balance_for_rent_exemption(program_account_data_size)
            .map_err(|e| SolanaDeploymentError::RpcError(e.to_string()))?;

        // Check if program account exists
        let program_account_exists = self.client.get_account(&program_keypair.pubkey()).is_ok();

        // Prepare deployment instructions
        let mut instructions = vec![
            // Set compute budget
            ComputeBudgetInstruction::set_compute_unit_limit(context.config.compute_unit_limit),
            ComputeBudgetInstruction::set_compute_unit_price(context.config.compute_unit_price),
        ];

        if !program_account_exists {
            // Create program account
            instructions.push(create_account(
                &payer_keypair.pubkey(),
                &program_keypair.pubkey(),
                rent_exempt_lamports,
                program_account_data_size as u64,
                &bpf_loader_upgradeable::id(),
            ));

            // Deploy program
            instructions.extend(
                bpf_loader_upgradeable::deploy_with_max_program_len(
                    &program_keypair.pubkey(),
                    &buffer_pubkey,
                    &payer_keypair.pubkey(),
                    &payer_keypair.pubkey(),
                    program_data.len() as u64,
                    0, // authority index (payer is first account)
                )
                .map_err(|e| SolanaDeploymentError::ProgramDeploymentError(e.to_string()))?,
            );
        } else {
            // Upgrade existing program
            instructions.push(bpf_loader_upgradeable::upgrade(
                &program_keypair.pubkey(),
                &buffer_pubkey,
                &payer_keypair.pubkey(),
                &payer_keypair.pubkey(),
            ));
        }

        // Send transaction with retries
        let mut retries = 3;
        let mut last_error = None;

        while retries > 0 {
            match self
                .send_transaction(
                    instructions.clone(),
                    vec![payer_keypair.clone(), program_keypair.clone()],
                    &payer_keypair.pubkey(),
                )
                .await
            {
                Ok(signature) => {
                    // Wait for confirmation
                    match self.client.confirm_transaction(&signature) {
                        Ok(true) => {
                            // Verify program account
                            match self.client.get_account(&program_keypair.pubkey()) {
                                Ok(account) => {
                                    if account.owner == bpf_loader_upgradeable::id() {
                                        context.program_id = Some(program_keypair.pubkey());
                                        context.status = SolanaDeploymentStatus::ProgramDeployed;
                                        context.updated_at = chrono::Utc::now();
                                        return Ok(());
                                    } else {
                                        last_error = Some(
                                            "Program account owner verification failed".to_string(),
                                        );
                                    }
                                }
                                Err(e) => {
                                    last_error =
                                        Some(format!("Failed to verify program account: {}", e));
                                }
                            }
                        }
                        Ok(false) => {
                            last_error = Some("Transaction failed to confirm".to_string());
                        }
                        Err(e) => {
                            last_error = Some(format!("Failed to confirm transaction: {}", e));
                        }
                    }
                }
                Err(e) => {
                    last_error = Some(e.to_string());
                }
            }

            retries -= 1;
            if retries > 0 {
                tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
            }
        }

        Err(SolanaDeploymentError::ProgramDeploymentError(
            last_error.unwrap_or_else(|| "Deployment failed after retries".to_string()),
        )
        .into())
    }

    async fn close_buffer(&mut self, context: &mut SolanaDeploymentContext) -> AppResult<()> {
        info!("Closing buffer account...");

        let payer_keypair = self.payer_keypair.as_ref().ok_or_else(|| {
            SolanaDeploymentError::InvalidProgramState("Payer keypair not loaded".to_string())
        })?;

        let buffer_pubkey = context.buffer_pubkey.ok_or_else(|| {
            SolanaDeploymentError::InvalidProgramState("Buffer pubkey not set".to_string())
        })?;

        let instructions = vec![bpf_loader_upgradeable::close(
            &buffer_pubkey,
            &payer_keypair.pubkey(),
            &payer_keypair.pubkey(),
        )];

        let signature = self
            .send_transaction(instructions, vec![payer_keypair], &payer_keypair.pubkey())
            .await?;

        info!(
            "Buffer account closed (signature: {})",
            signature.to_string()
        );

        context.status = SolanaDeploymentStatus::BufferClosed;
        context.updated_at = chrono::Utc::now();

        Ok(())
    }

    async fn cleanup(&mut self, context: &mut SolanaDeploymentContext) -> AppResult<()> {
        // Clean up any temporary resources
        self.program_data = None;
        Ok(())
    }
}
