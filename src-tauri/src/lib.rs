use log::{error, info};
use tauri_plugin_sql::{Migration, MigrationKind};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn log_to_terminal(message: &str) {
    info!("{}", message);
}

/* #[tauri::command]
async fn get_all_socios(
    db: tauri_plugin_sql::Database
) -> Result<(), String> {

} */

#[derive(serde::Serialize)]
struct SeaForecast {
    forecast_date: String,
    wave_height: f64,  // meters  (avg totalSeaMax across stations)
    wave_dir: String,  // most common predWaveDir
    wave_period: f64,  // seconds (avg wavePeriodMax)
    sst: f64,          // °C      (avg sstMax)
}

fn parse_f64(v: &serde_json::Value) -> Option<f64> {
    v.as_f64().or_else(|| v.as_str()?.parse().ok())
}

#[tauri::command]
async fn get_sea_forecast() -> Result<SeaForecast, String> {
    let url = "https://api.ipma.pt/open-data/forecast/oceanography/daily/hp-daily-sea-forecast-day0.json";

    let resp: serde_json::Value = reqwest::get(url)
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let forecast_date = resp["forecastDate"]
        .as_str()
        .unwrap_or("")
        .to_string();

    let data = resp["data"]
        .as_array()
        .ok_or_else(|| "missing data array in IPMA response".to_string())?;

    let mut heights: Vec<f64> = Vec::new();
    let mut periods: Vec<f64> = Vec::new();
    let mut ssts: Vec<f64> = Vec::new();
    let mut dirs: std::collections::HashMap<String, usize> = Default::default();

    for item in data {
        if let Some(v) = parse_f64(&item["totalSeaMax"]) { heights.push(v); }
        if let Some(v) = parse_f64(&item["wavePeriodMax"]) { periods.push(v); }
        if let Some(v) = parse_f64(&item["sstMax"]) { ssts.push(v); }
        if let Some(d) = item["predWaveDir"].as_str() {
            *dirs.entry(d.to_string()).or_default() += 1;
        }
    }

    let avg = |xs: &[f64]| if xs.is_empty() { 0.0 } else { xs.iter().sum::<f64>() / xs.len() as f64 };

    Ok(SeaForecast {
        forecast_date,
        wave_height: avg(&heights),
        wave_period: avg(&periods),
        sst: avg(&ssts),
        wave_dir: dirs.into_iter().max_by_key(|(_, n)| *n).map(|(d, _)| d).unwrap_or_else(|| "—".into()),
    })
}

/// Core logic: strips all products from inactive/suspended partners.
/// Operates on an already-open pool so it can be composed into larger flows.
async fn do_strip_products(pool: &sqlx::SqlitePool) -> Result<u64, String> {
    let n = sqlx::query(
        "UPDATE socio_status
         SET board_store = 0, utilization = 0, surf_lessons = 0
         WHERE status IN ('inactive', 'suspended')
           AND (board_store = 1 OR utilization = 1 OR surf_lessons = 1)",
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?
    .rows_affected();
    Ok(n)
}

/// Rule 1 — runs on app startup:
/// Partners whose `paid_until` is 2+ years in the past are set to inactive,
/// then rule 2 is applied to all inactive/suspended partners.
async fn enforce_inactivity_by_omission(app: &tauri::AppHandle) -> Result<(), String> {
    use sqlx::SqlitePool;
    use tauri::Manager;

    let db_path = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?
        .join("test.db");

    let pool = SqlitePool::connect(&format!("sqlite:{}", db_path.display()))
        .await
        .map_err(|e| format!("failed to connect: {e}"))?;

    let inactivated = sqlx::query(
        "UPDATE socio_status
         SET status = 'inactive'
         WHERE status != 'inactive'
           AND paid_until <= date('now', '-2 years')",
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?
    .rows_affected();

    let stripped = do_strip_products(&pool).await?;

    pool.close().await;
    info!("[membership] {inactivated} partner(s) set inactive by omission; {stripped} stripped of products");
    Ok(())
}

/// Rule 2 — Tauri command callable from the frontend:
/// Strips all products from any inactive or suspended partner.
/// Call this after saving a partner whose status is 'inactive' or 'suspended'.
#[tauri::command]
async fn strip_inactive_products(app: tauri::AppHandle) -> Result<(), String> {
    use sqlx::SqlitePool;
    use tauri::Manager;

    let db_path = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?
        .join("test.db");

    let pool = SqlitePool::connect(&format!("sqlite:{}", db_path.display()))
        .await
        .map_err(|e| format!("failed to connect: {e}"))?;

    let stripped = do_strip_products(&pool).await?;

    pool.close().await;
    info!("[membership] {stripped} partner(s) stripped of products");
    Ok(())
}

/// Populates the database with development seed data.
/// Resets socios and socio_status to a known state on each call.
/// Only compiled in debug builds — not available in release.
#[cfg(debug_assertions)]
#[tauri::command]
async fn seed_dev_data(app: tauri::AppHandle) -> Result<String, String> {
    use sqlx::SqlitePool;
    use tauri::Manager;

    let db_path = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?
        .join("test.db");

    let db_url = format!("sqlite:{}", db_path.display());
    let pool = SqlitePool::connect(&db_url)
        .await
        .map_err(|e| format!("failed to connect: {e}"))?;

    let seed_sql = include_str!("../db/seed.sql");

    // sqlx execute doesn't support multiple statements — split on ';' and run each.
    // Strip comment lines before deciding whether a chunk has real SQL to execute.
    for statement in seed_sql.split(';') {
        let sql: String = statement
            .lines()
            .filter(|l| !l.trim().starts_with("--"))
            .collect::<Vec<_>>()
            .join("\n");
        let sql = sql.trim();
        if sql.is_empty() {
            continue;
        }
        sqlx::query(sql)
            .execute(&pool)
            .await
            .map_err(|e| format!("seed failed on:\n{sql}\n\nError: {e}"))?;
    }

    pool.close().await;
    info!("[seed] dev data loaded from seed.sql");
    Ok("Seed data loaded successfully.".into())
}

/// Deletes all socios (cascade removes socio_status) and resets autoincrement counters.
/// Only compiled in debug builds — not available in release.
#[cfg(debug_assertions)]
#[tauri::command]
async fn purge_dev_data(app: tauri::AppHandle) -> Result<String, String> {
    use sqlx::SqlitePool;
    use tauri::Manager;

    let db_path = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?
        .join("test.db");

    let pool = SqlitePool::connect(&format!("sqlite:{}", db_path.display()))
        .await
        .map_err(|e| format!("failed to connect: {e}"))?;

    sqlx::query("DELETE FROM socio")
        .execute(&pool)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM sqlite_sequence WHERE name IN ('socio', 'socio_status')")
        .execute(&pool)
        .await
        .map_err(|e| e.to_string())?;

    pool.close().await;
    info!("[purge] all socios deleted");
    Ok("Purge completed.".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    // this is the migration for my intended db structure
    let migrations = vec![
        Migration {
            version: 1,
            description: "creates socio and socio_status tables",
            sql: include_str!("../db/init.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "replace nss with ncc, nif, birth_date, postal_code",
            sql: include_str!("../db/migrate_002.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "add utilization and surf_lessons products to socio_status",
            sql: include_str!("../db/migrate_003.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "replace paid_until date fields with monthly_payments table",
            sql: include_str!("../db/migrate_004.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "add observacoes field to socio",
            sql: include_str!("../db/migrate_005.sql"),
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Folder {
                        path: std::path::PathBuf::from(env!("ISURF_LOG_DIR")),
                        file_name: Some("isurf-mgmt".to_string()),
                    },
                ))
                .build(),
        )
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:test.db", migrations)
                .build()
        )
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = enforce_inactivity_by_omission(&handle).await {
                    error!("[inactivity] {e}");
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            log_to_terminal,
            get_sea_forecast,
            strip_inactive_products,
            #[cfg(debug_assertions)]
            seed_dev_data,
            #[cfg(debug_assertions)]
            purge_dev_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
