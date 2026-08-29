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
    use objc2_foundation::{NSNumber, NSSize, NSString};
    use tauri::{Runtime, WebviewWindow};

    // NSWindowLevel values (CGWindowLevelForKey). `NSPopUpMenuWindowLevel` (101)
    // clears the menu bar and every ordinary window, but a plain `NSWindow` at
    // that level still loses to another application's full-screen Space.
    // `NSScreenSaverWindowLevel` is high enough to win without the panel class,
    // which cannot be applied to a window that already hosts a WKWebView.
    const NS_SCREEN_SAVER_WINDOW_LEVEL: isize = 1000;

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
            OverlayLevel::Call => NS_SCREEN_SAVER_WINDOW_LEVEL,
            OverlayLevel::Annotation => NS_SCREEN_SAVER_WINDOW_LEVEL + 1,
            OverlayLevel::Toolbar => NS_SCREEN_SAVER_WINDOW_LEVEL + 2,
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
        }
    }

    /// Reports what AppKit actually ended up with, so a level silently reset by
    /// tao is distinguishable from a level that simply is not high enough.
    pub fn log_state<R: Runtime>(window: &WebviewWindow<R>, tag: &str) {
        let Some(ns) = ns_window(window) else {
            return;
        };
        unsafe {
            let level: isize = msg_send![ns, level];
            let behavior: usize = msg_send![ns, collectionBehavior];
            let class: *const AnyClass = msg_send![ns, class];
            let name = if class.is_null() {
                "<null>"
            } else {
                (*class).name().to_str().unwrap_or("<non-utf8>")
            };
            log::info!("[{tag}] class={name} level={level} collectionBehavior={behavior:#x}");
        }
    }

    /// Constrains resizing to the aspect ratio the call UI was laid out for, the
    /// way Zoom's floating meeting window behaves.
    pub fn set_aspect_ratio<R: Runtime>(window: &WebviewWindow<R>, width: f64, height: f64) {
        let Some(ns) = ns_window(window) else {
            return;
        };
        unsafe {
            if width <= 0.0 || height <= 0.0 {
                // AppKit clears the aspect ratio when resize increments are set.
                let _: () = msg_send![ns, setResizeIncrements: NSSize::new(1.0, 1.0)];
            } else {
                let _: () = msg_send![ns, setContentAspectRatio: NSSize::new(width, height)];
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

    /// A `WKWebView` paints an opaque page background regardless of the window
    /// being transparent, so the rounded corners would still read as a white
    /// rectangle. The flag is only reachable through KVC.
    unsafe fn set_webview_draws_background(view: *mut AnyObject, draws: bool) {
        if view.is_null() {
            return;
        }
        let webview_class: &AnyClass = class!(WKWebView);
        let is_webview: bool = msg_send![view, isKindOfClass: webview_class];
        if is_webview {
            let value = NSNumber::new_bool(draws);
            let key = NSString::from_str("drawsBackground");
            let _: () = msg_send![view, setValue: &*value, forKey: &*key];
            return;
        }
        let subviews: *mut AnyObject = msg_send![view, subviews];
        if subviews.is_null() {
            return;
        }
        let count: usize = msg_send![subviews, count];
        for index in 0..count {
            let child: *mut AnyObject = msg_send![subviews, objectAtIndex: index];
            set_webview_draws_background(child, draws);
        }
    }

    /// Lets the page's own rounded card define the window shape instead of the
    /// opaque system background behind it.
    pub fn set_transparent<R: Runtime>(window: &WebviewWindow<R>, transparent: bool) {
        let Some(ns) = ns_window(window) else {
            return;
        };
        unsafe {
            let color: *mut AnyObject = if transparent {
                msg_send![class!(NSColor), clearColor]
            } else {
                msg_send![class!(NSColor), windowBackgroundColor]
            };
            let _: () = msg_send![ns, setOpaque: !transparent];
            let _: () = msg_send![ns, setBackgroundColor: color];

            let content: *mut AnyObject = msg_send![ns, contentView];
            set_webview_draws_background(content, !transparent);
        }
    }

    /// Re-classes the window as an `NSPanel` with the non-activating style bit.
    ///
    /// This is what actually keeps a window visible over *another* application's
    /// full-screen Space: an elevated level alone is not enough, AppKit still
    /// hides ordinary windows behind the full-screen app. `NSPanel` declares no
    /// extra ivars over `NSWindow`, so swapping the isa pointer is layout-safe;
    /// `TaoWindow`'s own `focusable` ivar is only read from the two methods that
    /// stop being dispatched once the class changes.
    pub fn set_floating_panel<R: Runtime>(window: &WebviewWindow<R>, enabled: bool) {
        let Some(ns) = ns_window(window) else {
            return;
        };

        unsafe {
            if enabled {
                let panel_class: &AnyClass = class!(NSPanel);
                let is_panel: bool = msg_send![ns, isKindOfClass: panel_class];
                if !is_panel {
                    object_setClass(ns, panel_class as *const AnyClass);
                }
                let mask: usize = msg_send![ns, styleMask];
                let _: () =
                    msg_send![ns, setStyleMask: mask | NS_WINDOW_STYLE_MASK_NONACTIVATING_PANEL];
                let _: () = msg_send![ns, setFloatingPanel: true];
                let _: () = msg_send![ns, setBecomesKeyOnlyIfNeeded: true];
                return;
            }

            // The non-activating bit is only legal on a panel, so it has to go
            // before the class does.
            let mask: usize = msg_send![ns, styleMask];
            let _: () = msg_send![ns, setStyleMask: mask & !NS_WINDOW_STYLE_MASK_NONACTIVATING_PANEL];
            if let Some(tao) = AnyClass::get(c"TaoWindow") {
                object_setClass(ns, tao as *const AnyClass);
            }
        }
    }

    pub fn make_non_activating<R: Runtime>(window: &WebviewWindow<R>) {
        set_floating_panel(window, true);
    }

    pub fn reset<R: Runtime>(window: &WebviewWindow<R>) {
        set_corner_radius(window, 0.0);
        set_aspect_ratio(window, 0.0, 0.0);
        set_transparent(window, false);
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

    /// Win32 has no frame-level aspect lock — it would need `WM_SIZING`
    /// interception, so the min/max box in `call_pip` is the only constraint.
    pub fn set_aspect_ratio<R: Runtime>(_window: &WebviewWindow<R>, _width: f64, _height: f64) {}

    /// WebView2 decides on transparency when the controller is created, so it
    /// cannot be toggled per-window at runtime. DWM already rounds the frame.
    pub fn set_transparent<R: Runtime>(_window: &WebviewWindow<R>, _transparent: bool) {}

    pub fn log_state<R: Runtime>(_window: &WebviewWindow<R>, _tag: &str) {}

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
    pub fn set_aspect_ratio<R: Runtime>(_window: &WebviewWindow<R>, _width: f64, _height: f64) {}
    pub fn set_transparent<R: Runtime>(_window: &WebviewWindow<R>, _transparent: bool) {}
    pub fn log_state<R: Runtime>(_window: &WebviewWindow<R>, _tag: &str) {}
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
    // On macOS the Tauri setters actively fight us: `set_always_on_top` drops the
    // level back to `NSFloatingWindowLevel` and `set_visible_on_all_workspaces`
    // rewrites the collection behaviour without `FullScreenAuxiliary`. They are
    // queued on a different channel than `run_on_main_thread`, so ordering is not
    // guaranteed and they can land last. The ObjC block below covers both.
    #[cfg(not(target_os = "macos"))]
    {
        let _ = window.set_always_on_top(true);
        let _ = window.set_visible_on_all_workspaces(true);
    }
    on_main_thread(window, move |w| platform::apply(w, level));
}

/// Logs the level and collection behaviour AppKit settled on. Call it after a
/// delay: the interesting case is a value overwritten later, not the one we set.
pub fn log_state<R: Runtime>(window: &WebviewWindow<R>, tag: &'static str) {
    on_main_thread(window, move |w| platform::log_state(w, tag));
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

/// Drops the opaque window and WebView backgrounds so the page's own rounded
/// card is what the user sees. Pass `false` to restore the normal chrome.
pub fn set_transparent<R: Runtime>(window: &WebviewWindow<R>, transparent: bool) {
    on_main_thread(window, move |w| platform::set_transparent(w, transparent));
}

/// Returns the window to ordinary stacking (used when leaving PiP).
pub fn unpin<R: Runtime>(window: &WebviewWindow<R>) {
    on_main_thread(window, platform::reset);
    #[cfg(not(target_os = "macos"))]
    {
        let _ = window.set_always_on_top(false);
        let _ = window.set_visible_on_all_workspaces(false);
    }
}
