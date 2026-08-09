//! Always-on-top "You are sharing" panel (Zoom-like), desktop only.
//!
//! Capture stays in LiveKit/`getDisplayMedia`. This module only owns the
//! floating chrome window and the stop/focus IPC events.

use tauri::{
    AppHandle, Emitter, LogicalPosition, Manager, Runtime, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder,
};

pub const OVERLAY_LABEL: &str = "share-overlay";
pub const STOP_EVENT: &str = "share-overlay-stop";

const OVERLAY_WIDTH: f64 = 420.0;
const OVERLAY_HEIGHT: f64 = 56.0;

fn position_top_center<R: Runtime>(app: &AppHandle<R>, window: &WebviewWindow<R>) {
    let monitor = app
        .get_webview_window("main")
        .and_then(|main| main.current_monitor().ok().flatten())
        .or_else(|| app.primary_monitor().ok().flatten());

    let Some(monitor) = monitor else {
        return;
    };

    let scale = monitor.scale_factor();
    let size = monitor.size();
    let pos = monitor.position();
    let width_logical = size.width as f64 / scale;
    let x = (pos.x as f64 / scale) + ((width_logical - OVERLAY_WIDTH) / 2.0).max(0.0);
    let y = (pos.y as f64 / scale) + 12.0;
    let _ = window.set_position(LogicalPosition::new(x, y));
}

#[cfg(desktop)]
fn ensure_overlay_window<R: Runtime>(app: &AppHandle<R>) -> Result<WebviewWindow<R>, String> {
    if let Some(existing) = app.get_webview_window(OVERLAY_LABEL) {
        return Ok(existing);
    }

    let window = WebviewWindowBuilder::new(
        app,
        OVERLAY_LABEL,
        WebviewUrl::App("share-overlay.html".into()),
    )
    .title("Sovlium")
    .inner_size(OVERLAY_WIDTH, OVERLAY_HEIGHT)
    .min_inner_size(OVERLAY_WIDTH, OVERLAY_HEIGHT)
    .max_inner_size(OVERLAY_WIDTH, OVERLAY_HEIGHT)
    .resizable(false)
    .maximizable(false)
    .minimizable(false)
    .closable(false)
    .decorations(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .focused(false)
    .visible(false)
    .build()
    .map_err(|err| format!("failed to create share overlay: {err}"))?;

    let _ = window.set_visible_on_all_workspaces(true);
    Ok(window)
}

/// Shows (or creates) the floating share overlay.
#[tauri::command]
pub async fn share_overlay_show<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    #[cfg(not(desktop))]
    {
        let _ = app;
        return Err("share overlay is desktop-only".into());
    }

    #[cfg(desktop)]
    {
        let window = ensure_overlay_window(&app)?;
        position_top_center(&app, &window);
        let _ = window.set_always_on_top(true);
        window
            .show()
            .map_err(|err| format!("failed to show share overlay: {err}"))?;
        Ok(())
    }
}

/// Hides the overlay without emitting a stop event (share already ended in UI).
#[tauri::command]
pub async fn share_overlay_hide<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    #[cfg(not(desktop))]
    {
        let _ = app;
        return Ok(());
    }

    #[cfg(desktop)]
    {
        if let Some(window) = app.get_webview_window(OVERLAY_LABEL) {
            window
                .hide()
                .map_err(|err| format!("failed to hide share overlay: {err}"))?;
        }
        Ok(())
    }
}

/// Focuses the main Sovlium window (e.g. "Return to call").
#[tauri::command]
pub async fn share_overlay_focus_main<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.unminimize();
        main.set_focus()
            .map_err(|err| format!("failed to focus main window: {err}"))?;
    }
    Ok(())
}

/// Overlay "Stop" button: notify the call UI, then hide the panel.
#[tauri::command]
pub async fn share_overlay_request_stop<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    let _ = app.emit(STOP_EVENT, ());
    share_overlay_hide(app).await
}
