//! Always-on-top screen-share chrome (Zoom-like), desktop only.
//!
//! Two local windows:
//! - `share-overlay` — control + annotation toolbar (excluded from capture)
//! - `share-annotate` — fullscreen transparent canvas (excluded from capture;
//!   strokes are mirrored to remotes over the LiveKit data channel)
//!
//! Capture itself stays in LiveKit/`getDisplayMedia`.

use serde::{Deserialize, Serialize};
use tauri::{
    AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, Runtime, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder,
};

#[cfg(desktop)]
use crate::overlay_window::{make_non_activating, pin_above_everything, OverlayLevel};

pub const OVERLAY_LABEL: &str = "share-overlay";
pub const ANNOTATE_LABEL: &str = "share-annotate";
pub const STOP_EVENT: &str = "share-overlay-stop";
pub const ANNOTATE_COMMAND_EVENT: &str = "share-annotate-command";

const OVERLAY_WIDTH: f64 = 760.0;
const OVERLAY_HEIGHT: f64 = 56.0;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnnotateCommand {
    #[serde(rename = "type")]
    pub kind: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
}

fn share_monitor<R: Runtime>(app: &AppHandle<R>) -> Option<tauri::Monitor> {
    app.get_webview_window("main")
        .and_then(|main| main.current_monitor().ok().flatten())
        .or_else(|| app.primary_monitor().ok().flatten())
}

fn position_top_center<R: Runtime>(app: &AppHandle<R>, window: &WebviewWindow<R>) {
    let Some(monitor) = share_monitor(app) else {
        return;
    };

    let scale = monitor.scale_factor();
    // `work_area` sits below the macOS menu bar; using the full monitor origin
    // puts this 56px bar under the menu and it looks like "there is no overlay".
    let work = monitor.work_area();
    let work_x = work.position.x as f64 / scale;
    let work_y = work.position.y as f64 / scale;
    let work_w = work.size.width as f64 / scale;
    let x = work_x + ((work_w - OVERLAY_WIDTH) / 2.0).max(0.0);
    let y = work_y + 16.0;
    let _ = window.set_position(LogicalPosition::new(x, y));
}

fn cover_monitor<R: Runtime>(app: &AppHandle<R>, window: &WebviewWindow<R>) {
    let Some(monitor) = share_monitor(app) else {
        return;
    };
    let scale = monitor.scale_factor();
    let size = monitor.size();
    let pos = monitor.position();
    let width = size.width as f64 / scale;
    let height = size.height as f64 / scale;
    let x = pos.x as f64 / scale;
    let y = pos.y as f64 / scale;
    let _ = window.set_size(LogicalSize::new(width, height));
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
    .transparent(true)
    .shadow(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .focused(false)
    .visible(false)
    .build()
    .map_err(|err| format!("failed to create share overlay: {err}"))?;

    // Clicking a pen or colour must not yank focus out of the app being shown.
    make_non_activating(&window);
    pin_above_everything(&window, OverlayLevel::Toolbar);
    // Hide the toolbar from the shared video so remotes only see drawings.
    let _ = window.set_content_protected(true);
    Ok(window)
}

#[cfg(desktop)]
fn ensure_annotate_window<R: Runtime>(app: &AppHandle<R>) -> Result<WebviewWindow<R>, String> {
    if let Some(existing) = app.get_webview_window(ANNOTATE_LABEL) {
        return Ok(existing);
    }

    let window = WebviewWindowBuilder::new(
        app,
        ANNOTATE_LABEL,
        WebviewUrl::App("share-annotate.html".into()),
    )
    .title("Sovlium annotate")
    .inner_size(800.0, 600.0)
    .resizable(false)
    .maximizable(false)
    .minimizable(false)
    .closable(false)
    .decorations(false)
    .transparent(true)
    .shadow(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .focused(false)
    .accept_first_mouse(true)
    .visible(false)
    .build()
    .map_err(|err| format!("failed to create share annotate overlay: {err}"))?;

    make_non_activating(&window);
    pin_above_everything(&window, OverlayLevel::Annotation);
    let _ = window.set_ignore_cursor_events(true);
    // Strokes reach remotes over the data channel and are re-drawn on their
    // side. Leaving the canvas in the capture would paint every stroke twice.
    let _ = window.set_content_protected(true);
    Ok(window)
}

fn raise_toolbar<R: Runtime>(app: &AppHandle<R>) {
    if let Some(bar) = app.get_webview_window(OVERLAY_LABEL) {
        pin_above_everything(&bar, OverlayLevel::Toolbar);
    }
}

/// Shows (or creates) the floating share overlay and annotation canvas.
#[tauri::command]
pub async fn share_overlay_show<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    #[cfg(not(desktop))]
    {
        let _ = app;
        return Err("share overlay is desktop-only".into());
    }

    #[cfg(desktop)]
    {
        let annotate = ensure_annotate_window(&app)?;
        cover_monitor(&app, &annotate);
        let _ = annotate.set_ignore_cursor_events(true);
        annotate
            .show()
            .map_err(|err| format!("failed to show share annotate overlay: {err}"))?;
        // `show()` rebuilds the native chrome and drops the level/collection
        // behaviour set at build time, so it has to be re-applied afterwards.
        pin_above_everything(&annotate, OverlayLevel::Annotation);

        let window = ensure_overlay_window(&app)?;
        position_top_center(&app, &window);
        window
            .show()
            .map_err(|err| format!("failed to show share overlay: {err}"))?;
        pin_above_everything(&window, OverlayLevel::Toolbar);

        let _ = app.emit(
            ANNOTATE_COMMAND_EVENT,
            AnnotateCommand {
                kind: "clear".into(),
                tool: None,
                color: None,
            },
        );
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
        let _ = app.emit(
            ANNOTATE_COMMAND_EVENT,
            AnnotateCommand {
                kind: "clear".into(),
                tool: None,
                color: None,
            },
        );
        if let Some(window) = app.get_webview_window(ANNOTATE_LABEL) {
            let _ = window.set_ignore_cursor_events(true);
            window
                .hide()
                .map_err(|err| format!("failed to hide share annotate overlay: {err}"))?;
        }
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

/// Pointer tool: clicks pass through to apps underneath. Drawing tools capture
/// the cursor so strokes land on the canvas (and in the shared video).
#[tauri::command]
pub async fn share_annotate_set_click_through<R: Runtime>(
    app: AppHandle<R>,
    ignore: bool,
) -> Result<(), String> {
    #[cfg(not(desktop))]
    {
        let _ = (app, ignore);
        return Ok(());
    }

    #[cfg(desktop)]
    {
        if let Some(window) = app.get_webview_window(ANNOTATE_LABEL) {
            window
                .set_ignore_cursor_events(ignore)
                .map_err(|err| format!("set ignore cursor events: {err}"))?;
            if !ignore {
                pin_above_everything(&window, OverlayLevel::Annotation);
            }
        }
        raise_toolbar(&app);
        Ok(())
    }
}
