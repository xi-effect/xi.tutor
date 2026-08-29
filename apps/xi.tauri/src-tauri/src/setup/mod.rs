//! One-shot setup logic executed from `tauri::Builder::setup`.
//!
//! Add platform conditional logic here rather than inside `lib.rs` so that the
//! top-level builder stays declarative and easy to audit.

use tauri::App;

#[cfg(desktop)]
mod menu;

pub fn setup(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    // Place for: deep-link registration, custom URI scheme handling, tray icon
    // setup on desktop, window decoration tweaks, theme bridging, etc.
    //
    // Each concern should land here as its own module under `setup/` (for
    // example `setup/deep_links.rs`) and be invoked conditionally:
    //
    //   #[cfg(desktop)]
    //   self::deep_links::register(app)?;
    //
    // Keeping the dispatcher this small makes it trivial to spot platform
    // forks during code review.

    // Debug / `tauri build --debug` only: open Web Inspector so auth/CORS
    // issues in the bundled app are visible without hunting for a shortcut.
    #[cfg(debug_assertions)]
    {
        use tauri::Manager;
        if let Some(window) = app.get_webview_window("main") {
            window.open_devtools();
        }
    }

    #[cfg(desktop)]
    crate::call_pip::install_close_guard(&app.handle());

    #[cfg(desktop)]
    menu::install(app)?;

    #[cfg(desktop)]
    {
        use tauri::Manager;
        let theme = crate::theme::read_shell_theme(app.handle());
        let (r, g, b) = theme.page_background();
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.set_background_color(Some(tauri::window::Color(r, g, b, 255)));
        }
    }

    let _ = app;
    Ok(())
}
