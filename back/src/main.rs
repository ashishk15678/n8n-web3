use actix_web::{middleware, web, App, HttpResponse, HttpServer, Responder};
use anyhow::Result;
use base64;
use chrono::Utc;
use dotenv::dotenv;
use log::{error, info};
use serde::{Deserialize, Serialize};
use std::env;
use std::sync::Arc;
use tokio::signal;
use uuid::Uuid;

mod common;
mod deploy;

mod queue;
mod worker;

use crate::common::{log_deployment, log_deployment_error, DeploymentLog, DeploymentStage};
use queue::{QueueConfig, QueueManager};
use worker::types::{DeploymentRequest, DeploymentStatus};
use worker::{ThreadPool, WorkerConfig};

// HTTP request types
#[derive(Debug, Serialize, Deserialize)]
pub struct DeployRequest {
    pub program: String, // Program source code
    pub program_type: String,
    pub redirect_uri: String,
    pub program_name: String, // Name of the program for compilation
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeployResponse {
    pub deployment_id: Uuid,
    pub status: String,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct DeploymentStatusResponse {
    pub deployment_id: Uuid,
    pub status: String,
    pub stage: String,
    pub message: Option<String>,
    pub error: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

// HTTP handlers
async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "timestamp": Utc::now().to_rfc3339()
    }))
}

async fn deploy_program(
    data: web::Json<DeployRequest>,
    queue_manager: web::Data<Arc<QueueManager>>,
) -> impl Responder {
    // Validate program type
    if !matches!(data.program_type.to_lowercase().as_str(), "solana" | "evm") {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Invalid program type",
            "details": "Program type must be either 'solana' or 'evm'"
        }));
    }

    // Create temporary directory for compilation
    let temp_dir = match tempfile::Builder::new().prefix("solana_program_").tempdir() {
        Ok(dir) => dir,
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create temporary directory",
                "details": e.to_string()
            }));
        }
    };

    // Write program source to file
    let program_path = temp_dir.path().join(format!("{}.rs", data.program_name));
    if let Err(e) = std::fs::write(&program_path, &data.program) {
        return HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to write program source",
            "details": e.to_string()
        }));
    }

    // Create Cargo.toml
    let cargo_toml = format!(
        r#"[package]
name = "{}"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[features]
no-entrypoint = []

[dependencies]
solana-program = "1.17.0"
"#,
        data.program_name
    );

    if let Err(e) = std::fs::write(temp_dir.path().join("Cargo.toml"), cargo_toml) {
        return HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to create Cargo.toml",
            "details": e.to_string()
        }));
    }

    // Compile program to BPF
    let output = match std::process::Command::new("cargo")
        .current_dir(temp_dir.path())
        .args([
            "build-bpf",
            "--manifest-path",
            "Cargo.toml",
            "--target-dir",
            "target",
        ])
        .output()
    {
        Ok(output) => output,
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to compile program",
                "details": format!("Compilation failed: {}", e)
            }));
        }
    };

    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Program compilation failed",
            "details": error.to_string()
        }));
    }

    // Read compiled program binary
    let program_binary = match std::fs::read(
        temp_dir
            .path()
            .join("target/deploy")
            .join(format!("{}.so", data.program_name)),
    ) {
        Ok(binary) => binary,
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to read compiled program",
                "details": e.to_string()
            }));
        }
    };

    // Create deployment request with compiled binary
    let request = DeploymentRequest {
        id: Uuid::new_v4(),
        program: program_binary,
        program_type: data.program_type.clone(),
        redirect_uri: data.redirect_uri.clone(),
        status: DeploymentStatus::Queued,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    // Log deployment start
    log_deployment(DeploymentLog {
        job_id: request.id,
        stage: DeploymentStage::Queued,
        message: "Deployment request received".to_string(),
        timestamp: Utc::now(),
    });

    // Enqueue the deployment
    match queue_manager.enqueue(request.clone()).await {
        Ok(deployment_id) => HttpResponse::Accepted().json(DeployResponse {
            deployment_id,
            status: "queued".to_string(),
            message: "Deployment request accepted".to_string(),
        }),
        Err(e) => {
            log_deployment_error(request.id, DeploymentStage::Failed, &e.to_string());
            error!("Failed to enqueue deployment: {}", e);
            HttpResponse::ServiceUnavailable().json(serde_json::json!({
                "error": "Failed to process deployment request",
                "details": e.to_string()
            }))
        }
    }
}

async fn get_deployment_status(
    deployment_id: web::Path<Uuid>,
    queue_manager: web::Data<Arc<QueueManager>>,
) -> impl Responder {
    let id = *deployment_id;
    match queue_manager.get_status(id).await {
        Ok(status) => {
            let stage = match status {
                DeploymentStatus::Queued => DeploymentStage::Queued,
                DeploymentStatus::Processing => DeploymentStage::Initializing,
                DeploymentStatus::Completed => DeploymentStage::Completed,
                DeploymentStatus::Failed(ref msg) => {
                    log_deployment_error(id, DeploymentStage::Failed, msg);
                    DeploymentStage::Failed
                }
            };

            HttpResponse::Ok().json(DeploymentStatusResponse {
                deployment_id: id,
                status: status.to_string(),
                stage: stage.to_string(),
                message: None,
                error: match status {
                    DeploymentStatus::Failed(ref msg) => Some(msg.clone()),
                    _ => None,
                },
                created_at: Utc::now().to_rfc3339(),
                updated_at: Utc::now().to_rfc3339(),
            })
        }
        Err(e) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Deployment not found",
            "details": e.to_string()
        })),
    }
}

async fn get_queue_stats(queue_manager: web::Data<Arc<QueueManager>>) -> impl Responder {
    let stats = queue_manager.get_stats().await;
    HttpResponse::Ok().json(stats)
}

#[actix_web::main]
async fn main() -> Result<()> {
    // Load environment variables
    dotenv().ok();

    // Initialize logging
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // Get server configuration
    let host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("Invalid port number");

    // Initialize thread pool and queue manager
    let worker_config = WorkerConfig {
        max_threads: 4,
        queue_size: 100,
    };

    let queue_config = QueueConfig {
        max_pending: 100,
        max_active: 4,
    };

    let thread_pool = ThreadPool::new(worker_config)?;
    let queue_manager = Arc::new(QueueManager::new(queue_config, thread_pool));
    let queue_manager_clone = queue_manager.clone();

    // Start HTTP server with graceful shutdown
    info!("Starting HTTP server on {}:{}", host, port);
    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(queue_manager.clone()))
            .wrap(middleware::Logger::default())
            .route("/health", web::get().to(health_check))
            .route("/deploy", web::post().to(deploy_program))
            .route("/deployments/{id}", web::get().to(get_deployment_status))
            .route("/stats", web::get().to(get_queue_stats))
    })
    .bind((host, port))?
    .workers(4)
    .shutdown_timeout(30); // 30 seconds for graceful shutdown

    // Start server and wait for shutdown signal
    let server = server.run();
    let server_handle = server.handle();

    tokio::select! {
        _ = server => {
            info!("Server stopped");
        }
        _ = signal::ctrl_c() => {
            info!("Shutdown signal received, starting graceful shutdown...");
            if let Err(e) = queue_manager_clone.shutdown().await {
                error!("Error during shutdown: {}", e);
            }
            server_handle.stop(true).await;
            info!("Server shutdown complete");
        }
    }

    Ok(())
}
