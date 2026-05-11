//! Rust-side command implementations exposed to the frontend via
//! `tauri::generate_handler!`. The TypeScript wrappers live in
//! `apps/xi.tauri/src/tauri/commands.ts` — keep both sides in sync.

use serde::Serialize;
use tauri::AppHandle;

#[derive(Serialize)]
pub struct AppInfo {
    name: String,
    version: String,
    platform: &'static str,
    #[serde(rename = "isDebug")]
    is_debug: bool,
}

#[cfg(target_os = "windows")]
const PLATFORM: &str = "windows";
#[cfg(target_os = "macos")]
const PLATFORM: &str = "macos";
#[cfg(target_os = "linux")]
const PLATFORM: &str = "linux";
#[cfg(target_os = "ios")]
const PLATFORM: &str = "ios";
#[cfg(target_os = "android")]
const PLATFORM: &str = "android";
#[cfg(not(any(
    target_os = "windows",
    target_os = "macos",
    target_os = "linux",
    target_os = "ios",
    target_os = "android"
)))]
const PLATFORM: &str = "unknown";

#[tauri::command]
pub fn app_info(app: AppHandle) -> AppInfo {
    let pkg = app.package_info();
    AppInfo {
        name: pkg.name.clone(),
        version: pkg.version.to_string(),
        platform: PLATFORM,
        is_debug: cfg!(debug_assertions),
    }
}

/// Forwards a log line from the frontend into the Rust logger. This is a tiny
/// utility that we keep shipping in release builds because the volume is
/// developer-driven and bounded by capability scopes.
#[tauri::command]
pub fn log_message(message: String) {
    log::info!(target: "frontend", "{}", message);
}
