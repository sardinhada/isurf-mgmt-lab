fn main() {
    // Read ISURF_LOG_DIR from src-tauri/.env (machine-specific, not committed to git).
    // The build fails hard if .env is absent or the variable is missing.
    let raw = std::fs::read_to_string(".env")
        .expect("build.rs: src-tauri/.env not found — create it with ISURF_LOG_DIR=<absolute path>");
    let log_dir = raw
        .lines()
        .filter(|l| !l.trim_start().starts_with('#') && !l.trim().is_empty())
        .find_map(|l| l.strip_prefix("ISURF_LOG_DIR="))
        .expect("build.rs: ISURF_LOG_DIR not set in src-tauri/.env")
        .trim();

    println!("cargo:rustc-env=ISURF_LOG_DIR={log_dir}");
    println!("cargo:rerun-if-changed=.env");

    tauri_build::build()
}
