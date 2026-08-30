//! Zoom-like floating call window: the main WebView shrinks, stays always-on-top,
//! and keeps the LiveKit session (no second connection / no Document PiP).
//!
//! Chrome Document PiP is not available in WKWebView / WebView2. Resizing the
//! existing window is the only way to float CompactView over other apps.

use std::sync::Mutex;

use serde::Serialize;
use tauri::{
    AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, Runtime, WebviewWindow, WindowEvent,
};

#[cfg(desktop)]
use crate::overlay_window::{
    log_state, pin_above_everything, set_corner_radius, set_transparent, unpin, OverlayLevel,
};

/// Matches the `border-radius` of the PiP host overlay in `pip_shim.js`.
const PIP_CORNER_RADIUS: f64 = 12.0;
/// Floor for programmatic sizing; the user cannot drag the frame at all.
const PIP_FLOOR_W: f64 = 240.0;
const PIP_FLOOR_H: f64 = 120.0;

const MAIN_LABEL: &str = "main";
const MARGIN_PX: f64 = 16.0;
const DEFAULT_MIN_W: f64 = 1024.0;
const DEFAULT_MIN_H: f64 = 640.0;

pub const RESTORED_EVENT: &str = "call-pip-restored";

#[derive(Clone, Copy)]
struct SavedFrame {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    min_width: f64,
    min_height: f64,
    decorations: bool,
    resizable: bool,
    maximized: bool,
    fullscreen: bool,
}

struct PipInner {
    saved: Option<SavedFrame>,
}

impl PipInner {
    const fn new() -> Self {
        Self { saved: None }
    }
}

static STATE: Mutex<PipInner> = Mutex::new(PipInner::new());

#[derive(Serialize)]
pub struct CallPipSize {
    pub width: f64,
    pub height: f64,
}

fn main_window<R: Runtime>(app: &AppHandle<R>) -> Result<WebviewWindow<R>, String> {
    app.get_webview_window(MAIN_LABEL)
        .ok_or_else(|| "main window missing".into())
}

fn lock_state() -> Result<std::sync::MutexGuard<'static, PipInner>, String> {
    STATE
        .lock()
        .map_err(|_| "call pip state poisoned".to_string())
}

fn logical_inner_size<R: Runtime>(window: &WebviewWindow<R>) -> Result<(f64, f64), String> {
    let size = window
        .inner_size()
        .map_err(|err| format!("inner size: {err}"))?;
    let scale = window
        .scale_factor()
        .map_err(|err| format!("scale factor: {err}"))?;
    Ok((size.width as f64 / scale, size.height as f64 / scale))
}

fn logical_outer_position<R: Runtime>(window: &WebviewWindow<R>) -> Result<(f64, f64), String> {
    let pos = window
        .outer_position()
        .map_err(|err| format!("outer position: {err}"))?;
    let scale = window
        .scale_factor()
        .map_err(|err| format!("scale factor: {err}"))?;
    Ok((pos.x as f64 / scale, pos.y as f64 / scale))
}

fn current_monitor<R: Runtime>(
    app: &AppHandle<R>,
    window: &WebviewWindow<R>,
) -> Option<tauri::Monitor> {
    window
        .current_monitor()
        .ok()
        .flatten()
        .or_else(|| app.primary_monitor().ok().flatten())
}

fn position_bottom_right<R: Runtime>(
    app: &AppHandle<R>,
    window: &WebviewWindow<R>,
    width: f64,
    height: f64,
) {
    let Some(monitor) = current_monitor(app, window) else {
        return;
    };
    let scale = monitor.scale_factor();
    let work = monitor.work_area();
    let work_x = work.position.x as f64 / scale;
    let work_y = work.position.y as f64 / scale;
    let work_w = work.size.width as f64 / scale;
    let work_h = work.size.height as f64 / scale;
    let x = (work_x + work_w - width - MARGIN_PX).max(work_x + MARGIN_PX);
    let y = (work_y + work_h - height - MARGIN_PX).max(work_y + MARGIN_PX);
    let _ = window.set_position(LogicalPosition::new(x, y));
}

fn apply_pip_chrome<R: Runtime>(
    window: &WebviewWindow<R>,
    width: f64,
    height: f64,
) -> Result<(), String> {
    // The configured 1024x640 minimum would clamp the mini window, so it has to
    // be relaxed before the resize, not after.
    let _ = window.set_min_size(Some(LogicalSize::new(PIP_FLOOR_W, PIP_FLOOR_H)));
    let _ = window.set_max_size(None::<LogicalSize<f64>>);
    // The floating window has a fixed size: only the call UI changes it, and
    // only through `call_pip_resize`.
    window
        .set_resizable(false)
        .map_err(|err| format!("set resizable: {err}"))?;
    window
        .set_decorations(false)
        .map_err(|err| format!("set decorations: {err}"))?;
    window
        .set_size(LogicalSize::new(width, height))
        .map_err(|err| format!("set size: {err}"))?;
    // Dropping decorations recreates the native window chrome, so pinning and
    // rounding have to happen after it — otherwise both are reset.
    // The panel class would also float this window over other apps' full-screen
    // Spaces, but swapping the isa of a window that already hosts a WKWebView
    // destroys WebKit's KVO registration on `contentLayoutRect` and AppKit
    // throws on the next teardown. It is only safe on windows we re-class before
    // their webview attaches, which is not the case for the main window.
    pin_above_everything(window, OverlayLevel::Call);
    set_transparent(window, true);
    set_corner_radius(window, PIP_CORNER_RADIUS);
    Ok(())
}

fn restore_chrome<R: Runtime>(window: &WebviewWindow<R>, saved: SavedFrame) -> Result<(), String> {
    unpin(window);
    window
        .set_decorations(saved.decorations)
        .map_err(|err| format!("restore decorations: {err}"))?;
    window
        .set_resizable(saved.resizable)
        .map_err(|err| format!("restore resizable: {err}"))?;
    let _ = window.set_min_size(Some(LogicalSize::new(saved.min_width, saved.min_height)));
    let _ = window.set_max_size(None::<LogicalSize<f64>>);

    // The snapshot was taken while full screen, so its frame is the whole
    // display — AppKit already remembers the real one. Just go back.
    if saved.fullscreen {
        let _ = window.set_fullscreen(true);
        return Ok(());
    }

    window
        .set_size(LogicalSize::new(saved.width, saved.height))
        .map_err(|err| format!("restore size: {err}"))?;
    window
        .set_position(LogicalPosition::new(saved.x, saved.y))
        .map_err(|err| format!("restore position: {err}"))?;
    if saved.maximized {
        let _ = window.maximize();
    }
    Ok(())
}

fn snapshot_frame<R: Runtime>(window: &WebviewWindow<R>) -> Result<SavedFrame, String> {
    let (width, height) = logical_inner_size(window)?;
    let (x, y) = logical_outer_position(window)?;
    Ok(SavedFrame {
        x,
        y,
        width,
        height,
        min_width: DEFAULT_MIN_W,
        min_height: DEFAULT_MIN_H,
        decorations: window.is_decorated().unwrap_or(true),
        resizable: window.is_resizable().unwrap_or(true),
        maximized: window.is_maximized().unwrap_or(false),
        fullscreen: window.is_fullscreen().unwrap_or(false),
    })
}

/// A window inside a macOS full-screen Space ignores `setContentSize:`, so
/// entering PiP from full screen would leave a full-screen black frame with the
/// call panel floating in a corner. Leaving full screen is animated and
/// asynchronous, hence the poll instead of a plain call.
async fn leave_fullscreen_and_wait<R: Runtime>(window: &WebviewWindow<R>) {
    if !window.is_fullscreen().unwrap_or(false) {
        return;
    }
    let _ = window.set_fullscreen(false);
    for _ in 0..40 {
        tokio::time::sleep(std::time::Duration::from_millis(50)).await;
        if !window.is_fullscreen().unwrap_or(false) {
            // The AppKit animation still needs a beat to settle the frame.
            tokio::time::sleep(std::time::Duration::from_millis(150)).await;
            return;
        }
    }
}

pub fn is_active() -> bool {
    lock_state().map(|s| s.saved.is_some()).unwrap_or(false)
}

fn leave_pip_window<R: Runtime>(app: &AppHandle<R>, window: &WebviewWindow<R>) -> Result<(), String> {
    let saved = {
        let mut state = lock_state()?;
        state.saved.take()
    };
    let Some(saved) = saved else {
        return Ok(());
    };
    let _ = window.unminimize();
    restore_chrome(window, saved)?;
    let _ = app.emit(RESTORED_EVENT, ());
    Ok(())
}

/// CloseRequested while in pip should restore the meeting, not quit the app.
pub fn install_close_guard<R: Runtime>(app: &AppHandle<R>) {
    let Some(window) = app.get_webview_window(MAIN_LABEL) else {
        return;
    };
    let handle = app.clone();
    let _ = window.on_window_event(move |event| {
        let WindowEvent::CloseRequested { api, .. } = event else {
            return;
        };
        if !is_active() {
            return;
        }
        api.prevent_close();
        if let Ok(window) = main_window(&handle) {
            let _ = leave_pip_window(&handle, &window);
        }
    });
}

#[tauri::command]
pub async fn call_pip_enter<R: Runtime>(
    app: AppHandle<R>,
    width: f64,
    height: f64,
) -> Result<CallPipSize, String> {
    #[cfg(not(desktop))]
    {
        let _ = (app, width, height);
        return Err("call pip is desktop-only".into());
    }

    #[cfg(desktop)]
    {
        let width = width.max(280.0);
        let height = height.max(120.0);
        let window = main_window(&app)?;
        let _ = window.unminimize();

        {
            let mut state = lock_state()?;
            if state.saved.is_none() {
                state.saved = Some(snapshot_frame(&window)?);
            }
        }

        leave_fullscreen_and_wait(&window).await;
        let _ = window.unmaximize();

        apply_pip_chrome(&window, width, height)?;
        position_bottom_right(&app, &window, width, height);
        let _ = window.show();
        pin_above_everything(&window, OverlayLevel::Call);

        // tao reacts to show/resize by touching the window chrome again, and its
        // messages travel on a different queue than ours. Re-assert once the
        // dust settles, then report what actually stuck.
        tokio::time::sleep(std::time::Duration::from_millis(400)).await;
        pin_above_everything(&window, OverlayLevel::Call);
        log_state(&window, "call-pip");

        let (actual_w, actual_h) = logical_inner_size(&window).unwrap_or((width, height));
        if (actual_w - width).abs() > 2.0 || (actual_h - height).abs() > 2.0 {
            log::warn!(
                "call pip requested {width}x{height} but the window settled at {actual_w}x{actual_h}"
            );
        }
        Ok(CallPipSize {
            width: actual_w,
            height: actual_h,
        })
    }
}

#[tauri::command]
pub async fn call_pip_leave<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    #[cfg(not(desktop))]
    {
        let _ = app;
        return Ok(());
    }

    #[cfg(desktop)]
    {
        let window = main_window(&app)?;
        leave_pip_window(&app, &window)
    }
}

#[tauri::command]
pub async fn call_pip_resize<R: Runtime>(
    app: AppHandle<R>,
    width: f64,
    height: f64,
) -> Result<CallPipSize, String> {
    #[cfg(not(desktop))]
    {
        let _ = (app, width, height);
        return Err("call pip is desktop-only".into());
    }

    #[cfg(desktop)]
    {
        if !is_active() {
            return Ok(CallPipSize { width, height });
        }
        let width = width.max(280.0);
        let height = height.max(120.0);
        let window = main_window(&app)?;
        let (old_w, old_h) = logical_inner_size(&window).unwrap_or((width, height));
        let (old_x, old_y) = logical_outer_position(&window).unwrap_or((0.0, 0.0));
        let _ = old_w;
        let _ = window.set_min_size(Some(LogicalSize::new(PIP_FLOOR_W, PIP_FLOOR_H)));
        window
            .set_size(LogicalSize::new(width, height))
            .map_err(|err| format!("resize: {err}"))?;
        // Growing downwards would walk the window off the screen edge, so the
        // bottom stays put and the top moves instead.
        let new_y = old_y + old_h - height;
        let _ = window.set_position(LogicalPosition::new(old_x, new_y));
        Ok(CallPipSize { width, height })
    }
}
