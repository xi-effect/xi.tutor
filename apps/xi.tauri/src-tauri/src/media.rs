//! OS-level media permission preflight (camera / microphone / screen).
//!
//! macOS uses TCC via AVFoundation + CoreGraphics. Windows / other targets
//! return `prompt` and let WebView2 / the platform WebView show the system
//! dialog on the subsequent `getUserMedia` / `getDisplayMedia` call.

use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MediaKind {
    Camera,
    Microphone,
    Screen,
}

#[derive(Serialize)]
#[serde(rename_all = "lowercase")]
pub enum MediaPermissionStatus {
    Granted,
    Denied,
    Prompt,
    #[allow(dead_code)]
    Unsupported,
}

#[cfg(target_os = "macos")]
mod macos {
    use super::{MediaKind, MediaPermissionStatus};

    const GRANTED: i32 = 0;
    const DENIED: i32 = 1;
    const PROMPT: i32 = 2;

    extern "C" {
        fn sovlium_media_permission_status(kind: i32) -> i32;
        fn sovlium_media_permission_request(kind: i32) -> i32;
        fn sovlium_screen_permission_status() -> i32;
        fn sovlium_screen_permission_request() -> i32;
    }

    fn map(code: i32) -> MediaPermissionStatus {
        match code {
            GRANTED => MediaPermissionStatus::Granted,
            DENIED => MediaPermissionStatus::Denied,
            PROMPT => MediaPermissionStatus::Prompt,
            _ => MediaPermissionStatus::Prompt,
        }
    }

    fn capture_kind(kind: MediaKind) -> i32 {
        match kind {
            MediaKind::Camera => 0,
            MediaKind::Microphone => 1,
            MediaKind::Screen => 2,
        }
    }

    pub fn status(kind: MediaKind) -> MediaPermissionStatus {
        unsafe {
            match kind {
                MediaKind::Screen => map(sovlium_screen_permission_status()),
                other => map(sovlium_media_permission_status(capture_kind(other))),
            }
        }
    }

    pub fn request(kind: MediaKind) -> MediaPermissionStatus {
        unsafe {
            match kind {
                MediaKind::Screen => map(sovlium_screen_permission_request()),
                other => map(sovlium_media_permission_request(capture_kind(other))),
            }
        }
    }
}

#[tauri::command]
pub fn media_permission_status(kind: MediaKind) -> MediaPermissionStatus {
    #[cfg(target_os = "macos")]
    {
        macos::status(kind)
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = kind;
        MediaPermissionStatus::Prompt
    }
}

#[tauri::command]
pub fn media_permission_request(kind: MediaKind) -> MediaPermissionStatus {
    #[cfg(target_os = "macos")]
    {
        macos::request(kind)
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = kind;
        MediaPermissionStatus::Prompt
    }
}
