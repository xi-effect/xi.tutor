//! One-shot setup logic executed from `tauri::Builder::setup`.
//!
//! Add platform conditional logic here rather than inside `lib.rs` so that the
//! top-level builder stays declarative and easy to audit.

use tauri::App;

pub fn setup(_app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    // Place for: deep-link registration, custom URI scheme handling, tray icon
    // setup on desktop, window decoration tweaks, theme bridging, etc.
    //
    // Each concern should land here as its own module under `setup/` (for
    // example `setup/deep_links.rs`) and be invoked conditionally:
    //
    //   #[cfg(desktop)]
    //   self::deep_links::register(_app)?;
    //
    // Keeping the dispatcher this small makes it trivial to spot platform
    // forks during code review.

    Ok(())
}
