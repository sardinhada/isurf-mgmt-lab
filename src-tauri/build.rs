fn main() {
    // Read log dir from log.conf and expose as a compile-time env var.
    // Edit log.conf before building to redirect log output.
    let raw = std::fs::read_to_string("log.conf")
        .expect("build.rs: could not read src-tauri/log.conf");
    let log_dir = raw
        .lines()
        .filter(|l| !l.trim_start().starts_with('#') && !l.trim().is_empty())
        .find_map(|l| l.strip_prefix("dir="))
        .expect("build.rs: missing 'dir=' in log.conf")
        .trim();

    println!("cargo:rustc-env=ISURF_LOG_DIR={log_dir}");
    println!("cargo:rerun-if-changed=log.conf");

    tauri_build::build()
}
