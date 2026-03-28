use tauri_plugin_sql::{Migration, MigrationKind};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn log_to_terminal(message: &str) {
    println!("{}", message); // prints to terminal
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
    println!("[seed] dev data loaded from seed.sql");
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
    println!("[purge] all socios deleted");
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
        }
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:test.db", migrations)
                .build()
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            log_to_terminal,
            get_sea_forecast,
            #[cfg(debug_assertions)]
            seed_dev_data,
            #[cfg(debug_assertions)]
            purge_dev_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
