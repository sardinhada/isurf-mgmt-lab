// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::info;

fn base_url() -> String {
    let host = std::env::var("API_HOST").unwrap_or_else(|_| "localhost".into());
    let port = std::env::var("API_PORT").unwrap_or_else(|_| "3000".into());
    format!("http://{}:{}", host, port)
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn log_to_terminal(message: &str) {
    info!("{}", message);
}

// ── Sea forecast ─────────────────────────────────────────────────────────────

#[derive(serde::Serialize)]
struct SeaForecast {
    forecast_date: String,
    wave_height: f64,
    wave_dir: String,
    wave_period: f64,
    sst: f64,
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

    let forecast_date = resp["forecastDate"].as_str().unwrap_or("").to_string();

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

// ── Socios API ────────────────────────────────────────────────────────────────

fn api_client() -> reqwest::Client {
    reqwest::Client::new()
}

/// GET /api — health check.
#[tauri::command]
async fn health_check() -> bool {
    api_client()
        .get(format!("{}/api", base_url()))
        .send()
        .await
        .map(|r| r.status().is_success())
        .unwrap_or(false)
}

/// GET /api/socios — list with server-side filtering and pagination.
#[tauri::command]
async fn list_socios(
    page: Option<u32>,
    limit: Option<u32>,
    search: Option<String>,
    state: Option<String>,
    payment: Option<String>,
    board_store: Option<String>,
    utilization: Option<String>,
    surf_lessons: Option<String>,
) -> Result<serde_json::Value, String> {
    let mut query: Vec<(&str, String)> = vec![];

    if let Some(p) = page { query.push(("page", p.to_string())); }
    if let Some(l) = limit { query.push(("limit", l.to_string())); }
    if let Some(ref s) = search { if !s.is_empty() { query.push(("search", s.clone())); } }
    if let Some(ref s) = state { query.push(("state", s.clone())); }
    if let Some(ref p) = payment { query.push(("payment", p.clone())); }
    if let Some(ref b) = board_store { query.push(("board_store", b.clone())); }
    if let Some(ref u) = utilization { query.push(("utilization", u.clone())); }
    if let Some(ref s) = surf_lessons { query.push(("surf_lessons", s.clone())); }

    api_client()
        .get(format!("{}/api/socios", base_url()))
        .query(&query)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())
}

/// GET /api/socios/:id — single socio with status and monthly payments.
#[tauri::command]
async fn get_socio(id: i64) -> Result<serde_json::Value, String> {
    let resp = api_client()
        .get(format!("{}/api/socios/{}", base_url(), id))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if resp.status() == reqwest::StatusCode::NOT_FOUND {
        return Err("Sócio não encontrado".into());
    }
    if !resp.status().is_success() {
        return Err(format!("Erro ao obter sócio: {}", resp.status()));
    }

    resp.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

/// POST /api/socios then PATCH for status fields — creates a new socio.
#[tauri::command]
async fn create_socio(body: serde_json::Value) -> Result<serde_json::Value, String> {
    let client = api_client();

    // Step 1 — create the socio record (name + email required, rest optional)
    let socio_body = serde_json::json!({
        "name":        body["name"],
        "email":       body["email"],
        "phone":       body["phone"],
        "address":     body["address"],
        "ncc":         body["ncc"],
        "nif":         body["nif"],
        "birth_date":  body["birth_date"],
        "postal_code": body["postal_code"],
        "observacoes": body["observacoes"],
    });

    let create_resp = client
        .post(format!("{}/api/socios", base_url()))
        .json(&socio_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if create_resp.status() == reqwest::StatusCode::CONFLICT {
        return Err("Email já registado".into());
    }
    if !create_resp.status().is_success() {
        let status = create_resp.status();
        let text = create_resp.text().await.unwrap_or_default();
        return Err(format!("Erro ao criar sócio ({status}): {text}"));
    }

    let created: serde_json::Value = create_resp.json().await.map_err(|e| e.to_string())?;
    let id = created["id"]
        .as_i64()
        .ok_or_else(|| "ID não encontrado na resposta do servidor".to_string())?;

    // Step 2 — patch with status / membership fields
    let status_body = serde_json::json!({
        "joined_at":    body["joined_at"],
        "status":       body["status"],
        "paid_until":   body["paid_until"],
        "board_store":  body["board_store"],
        "utilization":  body["utilization"],
        "surf_lessons": body["surf_lessons"],
    });

    let patch_resp = client
        .patch(format!("{}/api/socios/{}", base_url(), id))
        .json(&status_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !patch_resp.status().is_success() {
        let status = patch_resp.status();
        let text = patch_resp.text().await.unwrap_or_default();
        return Err(format!("Sócio criado mas erro ao definir estado ({status}): {text}"));
    }

    info!("[socios] created socio id={id}");
    patch_resp.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

/// PATCH /api/socios/:id — partial update (fields, status, monthly payments).
#[tauri::command]
async fn update_socio(id: i64, body: serde_json::Value) -> Result<serde_json::Value, String> {
    let resp = api_client()
        .patch(format!("{}/api/socios/{}", base_url(), id))
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if resp.status() == reqwest::StatusCode::NOT_FOUND {
        return Err("Sócio não encontrado".into());
    }
    if resp.status().as_u16() == 422 {
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("Pedido inválido: {text}"));
    }
    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("Erro ao atualizar sócio ({status}): {text}"));
    }

    info!("[socios] updated socio id={id}");
    resp.json::<serde_json::Value>().await.map_err(|e| e.to_string())
}

// ── App entry ─────────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Load .env from the user's config directory (~/.config/isurf-mgmt-alpha/.env on Linux)
    if let Some(config_dir) = dirs::config_dir() {
        let env_path = config_dir.join("isurf-mgmt-alpha").join(".env");
        let _ = dotenvy::from_path_override(env_path); // silently ignore if file doesn't exist
    }

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
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            log_to_terminal,
            get_sea_forecast,
            health_check,
            list_socios,
            get_socio,
            create_socio,
            update_socio,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
