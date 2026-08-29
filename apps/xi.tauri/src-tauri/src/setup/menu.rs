//! Native menu so the call overlay can be invoked even when the remote UI
//! does not yet ship the in-call button.

use tauri::{
    menu::{Menu, MenuItem, Submenu},
    App, Manager,
};

const CALL_OVERLAY_ID: &str = "call-overlay";

pub fn install(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let overlay = MenuItem::with_id(
        app,
        CALL_OVERLAY_ID,
        "Оверлей звонка",
        true,
        Some("CmdOrCtrl+Shift+O"),
    )?;
    let call_menu = Submenu::with_items(app, "Звонок", true, &[&overlay])?;

    let menu = Menu::default(app.handle())?;
    menu.append(&call_menu)?;
    app.set_menu(menu)?;

    app.on_menu_event(|app, event| {
        if event.id().as_ref() != CALL_OVERLAY_ID {
            return;
        }
        toggle_call_overlay(app);
    });

    Ok(())
}

fn toggle_call_overlay(app: &tauri::AppHandle) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };

    if crate::call_pip::is_active() {
        let _ = window.eval(
            "try { window.dispatchEvent(new Event('sovlium:call-pip-close')); } catch (e) {}",
        );
        let handle = app.clone();
        tauri::async_runtime::spawn(async move {
            let _ = crate::call_pip::call_pip_leave(handle).await;
        });
        return;
    }

    // Let the call UI drive this: its handler enters PiP *and* mounts the
    // overlay host that the LiveKit tiles are portalled into. Calling
    // `call_pip_enter` directly here would shrink the window to an empty frame.
    let _ = window.eval(
        "try { window.dispatchEvent(new Event('sovlium:call-pip-request')); } catch (e) {}",
    );

    // Older remote builds of the web UI have no listener for that event, so fall
    // back to the bare native window if nothing picked it up.
    let handle = app.clone();
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(600));
        if crate::call_pip::is_active() {
            return;
        }
        tauri::async_runtime::spawn(async move {
            let _ = crate::call_pip::call_pip_enter(handle, 380.0, 300.0).await;
        });
    });
}
