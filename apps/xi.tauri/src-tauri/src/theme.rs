//! Persist UI theme preference across the remote-origin navigation.
//!
//! Production desktop boots a local splash, then `location.replace`s to
//! `*.sovlium.ru`. `localStorage` does not survive that origin change, so the
//! shell keeps the last chosen theme in the app config directory.

use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Runtime};

const THEME_FILE: &str = "shell-theme.json";
const APP_IDENTIFIER: &str = "ru.sovlium.app";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ShellTheme {
    Light,
    Dark,
}

impl ShellTheme {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Light => "light",
            Self::Dark => "dark",
        }
    }

    pub fn page_background(self) -> (u8, u8, u8) {
        match self {
            Self::Light => (0xF7, 0xF8, 0xFA),
            Self::Dark => (0x11, 0x13, 0x18),
        }
    }
}

#[derive(Serialize, Deserialize)]
struct ThemeFile {
    theme: ShellTheme,
}

fn parse_theme_file(raw: &str) -> Option<ShellTheme> {
    serde_json::from_str::<ThemeFile>(raw)
        .ok()
        .map(|file| file.theme)
}

/// Best-effort paths when `AppHandle` is not available yet (JS init script).
fn fallback_theme_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    let home = std::env::var_os("HOME").or_else(|| std::env::var_os("USERPROFILE"));
    let Some(home) = home.map(PathBuf::from) else {
        return paths;
    };

    #[cfg(target_os = "macos")]
    {
        paths.push(
            home.join("Library/Application Support")
                .join(APP_IDENTIFIER)
                .join(THEME_FILE),
        );
    }
    #[cfg(target_os = "windows")]
    {
        if let Some(appdata) = std::env::var_os("APPDATA") {
            paths.push(PathBuf::from(appdata).join(APP_IDENTIFIER).join(THEME_FILE));
        }
        paths.push(
            home.join("AppData")
                .join("Roaming")
                .join(APP_IDENTIFIER)
                .join(THEME_FILE),
        );
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let xdg = std::env::var_os("XDG_CONFIG_HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|| home.join(".config"));
        paths.push(xdg.join(APP_IDENTIFIER).join(THEME_FILE));
    }

    paths
}

fn read_theme_at(path: &PathBuf) -> Option<ShellTheme> {
    fs::read_to_string(path)
        .ok()
        .as_deref()
        .and_then(parse_theme_file)
}

/// Reads the persisted theme without an `AppHandle` (plugin init / first paint).
pub fn read_shell_theme_from_disk() -> ShellTheme {
    fallback_theme_paths()
        .into_iter()
        .find_map(|path| read_theme_at(&path))
        .unwrap_or(ShellTheme::Light)
}

pub fn document_theme_script(theme: ShellTheme) -> String {
    let bg = theme.page_background();
    format!(
        r#"(function () {{
  try {{
    // The share surfaces are transparent click-through overlays. Painting the
    // page background here would turn them into opaque sheets covering the
    // screen the tutor is demonstrating.
    var path = (window.location && window.location.pathname) || '';
    if (path.indexOf('share-annotate') !== -1 || path.indexOf('share-overlay') !== -1) return;
    var t = '{name}';
    var r = document.documentElement;
    r.classList.remove('light', 'dark', 'system');
    r.classList.add(t);
    r.setAttribute('data-theme', t);
    r.setAttribute('data-theme-preference', t);
    r.style.background = 'rgb({r},{g},{b})';
    r.style.colorScheme = t;
  }} catch (_) {{}}
}})();"#,
        name = theme.as_str(),
        r = bg.0,
        g = bg.1,
        b = bg.2,
    )
}

fn theme_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|err| format!("app config dir: {err}"))?;
    Ok(dir.join(THEME_FILE))
}

pub fn read_shell_theme<R: Runtime>(app: &AppHandle<R>) -> ShellTheme {
    if let Ok(path) = theme_path(app) {
        if let Some(theme) = read_theme_at(&path) {
            return theme;
        }
    }
    read_shell_theme_from_disk()
}

pub fn write_shell_theme<R: Runtime>(app: &AppHandle<R>, theme: ShellTheme) -> Result<(), String> {
    let path = theme_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("create config dir: {err}"))?;
    }
    let raw = serde_json::to_string_pretty(&ThemeFile { theme })
        .map_err(|err| format!("serialize theme: {err}"))?;
    fs::write(&path, raw).map_err(|err| format!("write theme: {err}"))?;
    Ok(())
}

#[tauri::command]
pub fn get_shell_theme<R: Runtime>(app: AppHandle<R>) -> String {
    read_shell_theme(&app).as_str().to_string()
}

#[tauri::command]
pub fn set_shell_theme<R: Runtime>(app: AppHandle<R>, theme: String) -> Result<(), String> {
    let parsed = match theme.as_str() {
        "dark" => ShellTheme::Dark,
        "light" => ShellTheme::Light,
        other => return Err(format!("unsupported theme: {other}")),
    };
    write_shell_theme(&app, parsed)
}
