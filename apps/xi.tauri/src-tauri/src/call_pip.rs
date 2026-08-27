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
    let _ = window.set_min_size(Some(LogicalSize::new(280.0, 120.0)));
    window
        .set_resizable(true)
        .map_err(|err| format!("set resizable: {err}"))?;
    window
        .set_decorations(false)
        .map_err(|err| format!("set decorations: {err}"))?;
    window
        .set_always_on_top(true)
        .map_err(|err| format!("set always on top: {err}"))?;
    let _ = window.set_visible_on_all_workspaces(true);
    window
        .set_size(LogicalSize::new(width, height))
        .map_err(|err| format!("set size: {err}"))?;
    Ok(())
}

fn restore_chrome<R: Runtime>(window: &WebviewWindow<R>, saved: SavedFrame) -> Result<(), String> {
    let _ = window.set_visible_on_all_workspaces(false);
    window
        .set_always_on_top(false)
        .map_err(|err| format!("restore always on top: {err}"))?;
    window
        .set_decorations(saved.decorations)
        .map_err(|err| format!("restore decorations: {err}"))?;
    window
        .set_resizable(saved.resizable)
        .map_err(|err| format!("restore resizable: {err}"))?;
    let _ = window.set_min_size(Some(LogicalSize::new(saved.min_width, saved.min_height)));
    window
        .set_size(LogicalSize::new(saved.width, saved.height))
        .map_err(|err| format!("restore size: {err}"))?;
    window
        .set_position(LogicalPosition::new(saved.x, saved.y))
        .map_err(|err| format!("restore position: {err}"))?;
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
    })
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

        apply_pip_chrome(&window, width, height)?;
        position_bottom_right(&app, &window, width, height);
        let _ = window.show();
        let _ = window.set_always_on_top(true);
        let _ = window.set_visible_on_all_workspaces(true);
        Ok(CallPipSize { width, height })
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
        window
            .set_size(LogicalSize::new(width, height))
            .map_err(|err| format!("resize: {err}"))?;
        let new_y = old_y + old_h - height;
        let _ = window.set_position(LogicalPosition::new(old_x, new_y));
        Ok(CallPipSize { width, height })
    }
}
