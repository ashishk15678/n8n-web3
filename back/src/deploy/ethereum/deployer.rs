use crate::common::AppResult;
use ethers::{
    prelude::{ContractFactory, Http, JsonRpcClient, LocalWallet, Provider, Signer, Wallet},
    providers::Middleware,
    types::{Bytes, U256},
    utils::hex,
};
use ethers_solc::{Artifact, Project, ProjectPathsConfig, Solc};
use eyre::Result;
use log::{error, info};
use serde_json::json;
use std::{fs, path::PathBuf, str::FromStr, sync::Arc, time::Duration};
use tokio::time::sleep;
use uuid::Uuid;

use super::types::{
    EthereumDeploymentConfig, EthereumDeploymentContext, EthereumDeploymentError,
    EthereumDeploymentStatus,
};

pub struct EthereumContractDeployer {
    provider: Arc<Provider<Http>>,
    wallet: Option<LocalWallet>,
    contract_data: Option<(Bytes, ethers::abi::Contract)>,
}

impl EthereumContractDeployer {
    pub fn new(rpc_url: &str) -> Self {
        Self {
            provider: Arc::new(
                Provider::<Http>::try_from(rpc_url).expect("Failed to create provider"),
            ),
            wallet: None,
            contract_data: None,
        }
    }

    async fn load_wallet(&mut self, config: &EthereumDeploymentConfig) -> AppResult<()> {
        let private_key = fs::read_to_string(&config.private_key_path).map_err(|e| {
            EthereumDeploymentError::WalletError(format!("Failed to read private key: {}", e))
        })?;

        let wallet: LocalWallet = private_key.parse().map_err(|e| {
            EthereumDeploymentError::WalletError(format!("Invalid private key: {}", e))
        })?;

        let chain_id = self.provider.get_chainid().await.map_err(|e| {
            EthereumDeploymentError::RpcError(format!("Failed to get chain ID: {}", e))
        })?;

        self.wallet = Some(wallet.with_chain_id(chain_id.as_u64()));
        Ok(())
    }

    async fn compile_contract(&mut self, source_code: &str, contract_name: &str) -> AppResult<()> {
        // Create temporary directory for compilation
        let temp_dir = tempfile::Builder::new()
            .prefix("eth_contract_")
            .tempdir()
            .map_err(|e| {
                EthereumDeploymentError::CompilationError(format!(
                    "Failed to create temp dir: {}",
                    e
                ))
            })?;

        // Write contract source to file
        let contract_path = temp_dir.path().join(format!("{}.sol", contract_name));
        fs::write(&contract_path, source_code).map_err(|e| {
            EthereumDeploymentError::CompilationError(format!("Failed to write contract: {}", e))
        })?;

        // Configure project paths
        let paths = ProjectPathsConfig::builder()
            .sources(temp_dir.path())
            .build()
            .map_err(|e| {
                EthereumDeploymentError::CompilationError(format!(
                    "Failed to configure paths: {}",
                    e
                ))
            })?;

        // Build and compile project
        let project = Project::builder()
            .paths(paths)
            .ephemeral()
            .no_artifacts()
            .build()
            .map_err(|e| {
                EthereumDeploymentError::CompilationError(format!("Failed to build project: {}", e))
            })?;

        let output = project.compile().map_err(|e| {
            EthereumDeploymentError::CompilationError(format!("Compilation failed: {}", e))
        })?;

        if output.has_errors() {
            return Err(EthereumDeploymentError::CompilationError(format!(
                "Compilation errors:\n{}",
                output.errors.join("\n")
            ))
            .into());
        }

        // Get contract artifact
        let contract = output.find_first(contract_name).ok_or_else(|| {
            EthereumDeploymentError::CompilationError(format!(
                "Contract {} not found",
                contract_name
            ))
        })?;

        let bytecode = contract
            .bytecode
            .ok_or_else(|| {
                EthereumDeploymentError::CompilationError("No bytecode found".to_string())
            })?
            .into_bytes()
            .ok_or_else(|| {
                EthereumDeploymentError::CompilationError("Invalid bytecode".to_string())
            })?;

        let abi = contract
            .abi
            .ok_or_else(|| EthereumDeploymentError::CompilationError("No ABI found".to_string()))?;

        self.contract_data = Some((bytecode, abi));
        Ok(())
    }

    async fn deploy_contract(&mut self, context: &mut EthereumDeploymentContext) -> AppResult<()> {
        let (bytecode, abi) = self.contract_data.as_ref().ok_or_else(|| {
            EthereumDeploymentError::InvalidState("Contract data not loaded".to_string())
        })?;

        let wallet = self.wallet.as_ref().ok_or_else(|| {
            EthereumDeploymentError::InvalidState("Wallet not loaded".to_string())
        })?;

        let client = Arc::new(self.provider.clone().with_signer(wallet.clone()));

        // Check wallet balance
        let balance = client
            .get_balance(client.address(), None)
            .await
            .map_err(|e| {
                EthereumDeploymentError::RpcError(format!("Failed to get balance: {}", e))
            })?;

        if balance.is_zero() {
            return Err(EthereumDeploymentError::InsufficientFunds.into());
        }

        // Create contract factory
        let factory = ContractFactory::new(abi.clone(), bytecode.clone(), client.clone());

        // Deploy contract with constructor arguments if any
        let deployer = if let Some(constructor_args) = &context.constructor_args {
            factory.deploy(constructor_args.clone())?
        } else {
            factory.deploy(())?
        };

        // Send deployment transaction
        let pending_tx = deployer.send().await.map_err(|e| {
            EthereumDeploymentError::DeploymentError(format!("Failed to send transaction: {}", e))
        })?;

        info!("Deployment transaction sent: {:?}", pending_tx.tx_hash());

        // Wait for confirmation
        let deployed_contract = pending_tx
            .confirmations(1)
            .await
            .map_err(|e| {
                EthereumDeploymentError::DeploymentError(format!(
                    "Failed to get confirmation: {}",
                    e
                ))
            })?
            .ok_or_else(|| {
                EthereumDeploymentError::DeploymentError("Deployment failed".to_string())
            })?;

        context.contract_address = Some(deployed_contract.address());
        context.status = EthereumDeploymentStatus::Deployed;
        context.updated_at = chrono::Utc::now();

        Ok(())
    }
}

#[async_trait::async_trait]
impl super::EthereumDeployer for EthereumContractDeployer {
    async fn initialize(
        &mut self,
        config: EthereumDeploymentConfig,
        source_code: String,
        contract_name: String,
    ) -> AppResult<EthereumDeploymentContext> {
        // Load wallet
        self.load_wallet(&config).await?;

        // Compile contract
        self.compile_contract(&source_code, &contract_name).await?;

        let context = EthereumDeploymentContext {
            deployment_id: Uuid::new_v4(),
            config,
            contract_name,
            contract_address: None,
            constructor_args: None,
            status: EthereumDeploymentStatus::Initialized,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };

        Ok(context)
    }

    async fn deploy(&mut self, context: &mut EthereumDeploymentContext) -> AppResult<()> {
        self.deploy_contract(context).await
    }

    async fn cleanup(&mut self, _context: &mut EthereumDeploymentContext) -> AppResult<()> {
        self.contract_data = None;
        Ok(())
    }
}
