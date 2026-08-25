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

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpProbeResult {
    ok: bool,
    status: Option<u16>,
    /// Response body when `include_body` was true and the status was 2xx.
    body: Option<String>,
    error: Option<String>,
}

/// Server-side HTTP GET used by the remote splash. Avoids WebView CORS when the
/// document is still on `tauri://` / localhost. Only `https://*.sovlium.ru`
/// (and localhost in debug) are allowed — prevents SSRF via invoke.
#[tauri::command]
pub async fn http_probe(
    url: String,
    timeout_ms: Option<u64>,
    include_body: Option<bool>,
) -> HttpProbeResult {
    let parsed = match url.parse::<tauri::Url>() {
        Ok(u) => u,
        Err(err) => {
            return HttpProbeResult {
                ok: false,
                status: None,
                body: None,
                error: Some(format!("invalid url: {err}")),
            };
        }
    };

    if !crate::navigation::is_navigation_allowed(&parsed) {
        return HttpProbeResult {
            ok: false,
            status: None,
            body: None,
            error: Some("url is outside the Sovlium allowlist".into()),
        };
    }

    let timeout = std::time::Duration::from_millis(timeout_ms.unwrap_or(5_000).max(500));
    let want_body = include_body.unwrap_or(false);

    let client = match reqwest::Client::builder().timeout(timeout).build() {
        Ok(c) => c,
        Err(err) => {
            return HttpProbeResult {
                ok: false,
                status: None,
                body: None,
                error: Some(format!("http client error: {err}")),
            };
        }
    };

    match client.get(parsed).send().await {
        Ok(response) => {
            let status = response.status().as_u16();
            let ok = response.status().is_success()
                || response.status().is_redirection();
            let body = if want_body && response.status().is_success() {
                match response.text().await {
                    Ok(text) => Some(text),
                    Err(err) => {
                        return HttpProbeResult {
                            ok: false,
                            status: Some(status),
                            body: None,
                            error: Some(format!("body read error: {err}")),
                        };
                    }
                }
            } else {
                None
            };
            HttpProbeResult {
                ok,
                status: Some(status),
                body,
                error: if ok {
                    None
                } else {
                    Some(format!("HTTP {status}"))
                },
            }
        }
        Err(err) => HttpProbeResult {
            ok: false,
            status: None,
            body: None,
            error: Some(err.to_string()),
        },
    }
}

/// Shows a native save dialog and writes the (base64) payload. Returns `false`
/// if the user cancelled. Used because `<a download>` is unreliable in WKWebView
/// and WebView2.
#[tauri::command]
pub async fn save_file(
    app: tauri::AppHandle,
    default_name: String,
    contents_base64: String,
) -> Result<bool, String> {
    use base64::Engine;
    use tauri_plugin_dialog::DialogExt;

    let bytes = base64::engine::general_purpose::STANDARD
        .decode(contents_base64.as_bytes())
        .map_err(|err| format!("invalid file payload: {err}"))?;

    let (tx, rx) = std::sync::mpsc::sync_channel(1);
    app.dialog()
        .file()
        .set_file_name(&default_name)
        .save_file(move |file| {
            let _ = tx.send(file);
        });

    let file = tauri::async_runtime::spawn_blocking(move || rx.recv())
        .await
        .map_err(|err| err.to_string())?
        .map_err(|err| err.to_string())?;

    let Some(file_path) = file else {
        return Ok(false);
    };

    let path = file_path.into_path().map_err(|err| err.to_string())?;
    std::fs::write(&path, bytes).map_err(|err| format!("failed to write file: {err}"))?;
    Ok(true)
}
