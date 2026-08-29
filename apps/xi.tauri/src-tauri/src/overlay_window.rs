//! Native "above everything" window tuning that Tauri's cross-platform API
//! cannot express.
//!
//! `set_always_on_top(true)` maps to `NSFloatingWindowLevel` on macOS. That is
//! enough to float over regular windows, but such a window is still bound to a
//! single Space and vanishes the moment any other app enters full screen —
//! which is the common case during a lesson (browser, Keynote, Zoom). Getting a
//! true overlay needs `NSWindowCollectionBehaviorFullScreenAuxiliary` plus an
//! elevated window level, neither of which Tauri exposes.
//!
//! On Windows `HWND_TOPMOST` is re-asserted explicitly because other topmost
//! windows steal the top slot whenever they are activated.

use tauri::{Runtime, WebviewWindow};

/// Relative stacking of our own overlay surfaces.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum OverlayLevel {
    /// Floating call window — above apps, below the annotation surfaces.
    Call,
    /// Full-screen annotation canvas that must cover the shared display.
    Annotation,
    /// Annotation toolbar — always the topmost surface we own.
    Toolbar,
}

#[cfg(target_os = "macos")]
mod platform {
    use super::OverlayLevel;
    use objc2::runtime::{AnyClass, AnyObject};
    use objc2::{class, msg_send};
    use tauri::{Runtime, WebviewWindow};

    // NSWindowLevel values (CGWindowLevelForKey). `NSPopUpMenuWindowLevel` is
    // above the menu bar (24) and above every ordinary and floating window, which
    // is what it takes to stay visible once another app owns the screen.
    const NS_POPUP_MENU_WINDOW_LEVEL: isize = 101;

    // NSWindowCollectionBehavior bits.
    const CAN_JOIN_ALL_SPACES: usize = 1 << 0;
    const MANAGED: usize = 1 << 2;
    const STATIONARY: usize = 1 << 4;
    const IGNORES_CYCLE: usize = 1 << 6;
    const FULL_SCREEN_PRIMARY: usize = 1 << 7;
    /// The bit that actually makes a window render over another app's
    /// full-screen Space instead of being hidden behind it.
    const FULL_SCREEN_AUXILIARY: usize = 1 << 8;

    const NS_WINDOW_STYLE_MASK_NONACTIVATING_PANEL: usize = 1 << 7;

    extern "C" {
        fn object_setClass(obj: *mut AnyObject, cls: *const AnyClass) -> *const AnyClass;
    }

    fn level_value(level: OverlayLevel) -> isize {
        match level {
            // Keep the call window below the annotation surfaces so a running
            // demonstration is never occluded by the mini meeting.
            OverlayLevel::Call => NS_POPUP_MENU_WINDOW_LEVEL,
            OverlayLevel::Annotation => NS_POPUP_MENU_WINDOW_LEVEL + 1,
            OverlayLevel::Toolbar => NS_POPUP_MENU_WINDOW_LEVEL + 2,
        }
    }

    fn ns_window<R: Runtime>(window: &WebviewWindow<R>) -> Option<*mut AnyObject> {
        let ptr = window.ns_window().ok()?;
        if ptr.is_null() {
            None
        } else {
            Some(ptr.cast::<AnyObject>())
        }
    }

    pub fn apply<R: Runtime>(window: &WebviewWindow<R>, level: OverlayLevel) {
        let Some(ns) = ns_window(window) else {
            return;
        };
        let behavior =
            CAN_JOIN_ALL_SPACES | STATIONARY | IGNORES_CYCLE | FULL_SCREEN_AUXILIARY;

        unsafe {
            let _: () = msg_send![ns, setLevel: level_value(level)];
            let _: () = msg_send![ns, setCollectionBehavior: behavior];
            // Overlays must survive the user switching to the app they demo.
            let _: () = msg_send![ns, setHidesOnDeactivate: false];

            let applied: usize = msg_send![ns, collectionBehavior];
            if applied != behavior {
                log::warn!("overlay collection behavior not applied: {applied:#x}");
            }
        }
    }

    /// A decorationless window is a hard rectangle on macOS; the rounding has to
    /// come from the content view's layer, and the window has to stop being
    /// opaque or the corners paint black.
    pub fn set_corner_radius<R: Runtime>(window: &WebviewWindow<R>, radius: f64) {
        let Some(ns) = ns_window(window) else {
            return;
        };
        unsafe {
            let rounded = radius > 0.0;
            let _: () = msg_send![ns, setOpaque: !rounded];
            let _: () = msg_send![ns, setHasShadow: true];

            let content: *mut AnyObject = msg_send![ns, contentView];
            if content.is_null() {
                return;
            }
            let _: () = msg_send![content, setWantsLayer: true];
            let layer: *mut AnyObject = msg_send![content, layer];
            if layer.is_null() {
                return;
            }
            let _: () = msg_send![layer, setCornerRadius: radius];
            let _: () = msg_send![layer, setMasksToBounds: rounded];
        }
    }

    /// Re-classes the window as an `NSPanel` with the non-activating style bit so
    /// clicking it (e.g. picking a pen colour) does not pull focus away from the
    /// application being demonstrated. `NSPanel` declares no extra ivars over
    /// `NSWindow`, so swapping the isa pointer is layout-safe.
    pub fn make_non_activating<R: Runtime>(window: &WebviewWindow<R>) {
        let Some(ns) = ns_window(window) else {
            return;
        };
        let panel_class: &AnyClass = class!(NSPanel);

        unsafe {
            let is_panel: bool = msg_send![ns, isKindOfClass: panel_class];
            if !is_panel {
                object_setClass(ns, panel_class as *const AnyClass);
            }
            let mask: usize = msg_send![ns, styleMask];
            let _: () = msg_send![ns, setStyleMask: mask | NS_WINDOW_STYLE_MASK_NONACTIVATING_PANEL];
            let _: () = msg_send![ns, setFloatingPanel: true];
            let _: () = msg_send![ns, setBecomesKeyOnlyIfNeeded: true];
        }
    }

    pub fn reset<R: Runtime>(window: &WebviewWindow<R>) {
        set_corner_radius(window, 0.0);
        let Some(ns) = ns_window(window) else {
            return;
        };
        unsafe {
            let _: () = msg_send![ns, setLevel: 0isize];
            // Back to what tao gives a normal resizable window — clearing the
            // mask entirely would also kill the green full-screen button.
            let _: () = msg_send![ns, setCollectionBehavior: MANAGED | FULL_SCREEN_PRIMARY];
        }
    }
}

#[cfg(target_os = "windows")]
mod platform {
    use super::OverlayLevel;
    use tauri::{Runtime, WebviewWindow};
    use windows::Win32::Graphics::Dwm::{
        DwmSetWindowAttribute, DWMWA_WINDOW_CORNER_PREFERENCE, DWMWCP_DEFAULT, DWMWCP_ROUND,
    };
    use windows::Win32::UI::WindowsAndMessaging::{
        GetWindowLongPtrW, SetWindowLongPtrW, SetWindowPos, GWL_EXSTYLE, HWND_NOTOPMOST,
        HWND_TOPMOST, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE, WS_EX_NOACTIVATE, WS_EX_TOOLWINDOW,
    };

    pub fn apply<R: Runtime>(window: &WebviewWindow<R>, _level: OverlayLevel) {
        let Ok(hwnd) = window.hwnd() else {
            return;
        };
        unsafe {
            let _ = SetWindowPos(
                hwnd,
                Some(HWND_TOPMOST),
                0,
                0,
                0,
                0,
                SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE,
            );
        }
    }

    pub fn make_non_activating<R: Runtime>(window: &WebviewWindow<R>) {
        let Ok(hwnd) = window.hwnd() else {
            return;
        };
        unsafe {
            let ex = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
            let flags = (WS_EX_NOACTIVATE.0 | WS_EX_TOOLWINDOW.0) as isize;
            SetWindowLongPtrW(hwnd, GWL_EXSTYLE, ex | flags);
        }
    }

    /// Windows 11 rounds the frame itself; the radius value is not honoured, so
    /// anything non-zero simply opts into the system corner style.
    pub fn set_corner_radius<R: Runtime>(window: &WebviewWindow<R>, radius: f64) {
        let Ok(hwnd) = window.hwnd() else {
            return;
        };
        let preference = if radius > 0.0 {
            DWMWCP_ROUND
        } else {
            DWMWCP_DEFAULT
        };
        unsafe {
            let _ = DwmSetWindowAttribute(
                hwnd,
                DWMWA_WINDOW_CORNER_PREFERENCE,
                &preference as *const _ as *const _,
                std::mem::size_of_val(&preference) as u32,
            );
        }
    }

    pub fn reset<R: Runtime>(window: &WebviewWindow<R>) {
        set_corner_radius(window, 0.0);
        let Ok(hwnd) = window.hwnd() else {
            return;
        };
        unsafe {
            let _ = SetWindowPos(
                hwnd,
                Some(HWND_NOTOPMOST),
                0,
                0,
                0,
                0,
                SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE,
            );
        }
    }
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
mod platform {
    use super::OverlayLevel;
    use tauri::{Runtime, WebviewWindow};

    pub fn apply<R: Runtime>(_window: &WebviewWindow<R>, _level: OverlayLevel) {}
    pub fn make_non_activating<R: Runtime>(_window: &WebviewWindow<R>) {}
    pub fn set_corner_radius<R: Runtime>(_window: &WebviewWindow<R>, _radius: f64) {}
    pub fn reset<R: Runtime>(_window: &WebviewWindow<R>) {}
}

/// The commands that drive the overlays are `async`, so they run on the Tauri
/// async runtime rather than the UI thread. AppKit window mutation off the main
/// thread is undefined behaviour, hence every platform call is marshalled.
fn on_main_thread<R: Runtime, F>(window: &WebviewWindow<R>, action: F)
where
    F: FnOnce(&WebviewWindow<R>) + Send + 'static,
{
    let target = window.clone();
    let _ = window.run_on_main_thread(move || action(&target));
}

/// Pins the window above other applications, including full-screen ones.
///
/// Must be re-applied after `show()`, `set_decorations()` and any other call
/// that rebuilds the native window chrome, because those reset the level and
/// collection behaviour back to the defaults.
pub fn pin_above_everything<R: Runtime>(window: &WebviewWindow<R>, level: OverlayLevel) {
    let _ = window.set_always_on_top(true);
    let _ = window.set_visible_on_all_workspaces(true);
    on_main_thread(window, move |w| platform::apply(w, level));
}

/// Lets the window take clicks without activating the app behind it.
pub fn make_non_activating<R: Runtime>(window: &WebviewWindow<R>) {
    on_main_thread(window, platform::make_non_activating);
}

/// Rounds a decorationless window so it does not read as a bare rectangle.
/// Pass `0.0` to go back to square corners.
pub fn set_corner_radius<R: Runtime>(window: &WebviewWindow<R>, radius: f64) {
    on_main_thread(window, move |w| platform::set_corner_radius(w, radius));
}

/// Returns the window to ordinary stacking (used when leaving PiP).
pub fn unpin<R: Runtime>(window: &WebviewWindow<R>) {
    on_main_thread(window, platform::reset);
    let _ = window.set_always_on_top(false);
    let _ = window.set_visible_on_all_workspaces(false);
}
