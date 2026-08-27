//! WebView policy for the native shell: mark the page as native and keep
//! browser-only analytics (Yandex Metrika) from running inside Tauri.

use tauri::{
    plugin::{Builder, TauriPlugin},
    webview::PageLoadEvent,
    Manager, Runtime,
};

use crate::theme;

fn native_os() -> &'static str {
    #[cfg(target_os = "ios")]
    {
        "ios"
    }
    #[cfg(target_os = "android")]
    {
        "android"
    }
    #[cfg(target_os = "macos")]
    {
        "macos"
    }
    #[cfg(target_os = "windows")]
    {
        "windows"
    }
    #[cfg(target_os = "linux")]
    {
        "linux"
    }
    #[cfg(not(any(
        target_os = "ios",
        target_os = "android",
        target_os = "macos",
        target_os = "windows",
        target_os = "linux"
    )))]
    {
        "unknown"
    }
}

/// Runs before page scripts — sets the native flag and a no-op `ym` so even an
/// already-deployed remote `index.html` cannot usefully init Metrika if our
/// page-load cleanup races slightly. Prefer the `xi.web` index.html guard too.
fn init_native_flag_script() -> String {
    let os = native_os();
    format!(
        r#"
(function () {{
  try {{
    Object.defineProperty(window, '__SOVLIUM_NATIVE__', {{
      value: true,
      configurable: false,
      enumerable: false,
      writable: false,
    }});
  }} catch (_) {{
    window.__SOVLIUM_NATIVE__ = true;
  }}
  try {{
    Object.defineProperty(window, '__SOVLIUM_NATIVE_OS__', {{
      value: '{os}',
      configurable: false,
      enumerable: false,
      writable: false,
    }});
  }} catch (_) {{
    window.__SOVLIUM_NATIVE_OS__ = '{os}';
  }}
  window.ym = function () {{}};
}})();
"#
    )
}

const DISABLE_METRIKA_SCRIPT: &str = r#"
(function () {
  try {
    window.__SOVLIUM_NATIVE__ = true;
  } catch (_) {}
  window.ym = function () {};
  try {
    document
      .querySelectorAll(
        'script[src*="mc.yandex.ru"], script[src*="mc.yandex.com"], img[src*="mc.yandex.ru"], img[src*="mc.yandex.com"]'
      )
      .forEach(function (node) {
        node.remove();
      });
  } catch (_) {}
})();
"#;

#[cfg(desktop)]
const PIP_SHIM: &str = include_str!("pip_shim.js");
#[cfg(not(desktop))]
const PIP_SHIM: &str = "";

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    let theme = theme::read_shell_theme_from_disk();
    let init_script = format!(
        "{}\n{}\n{}",
        init_native_flag_script(),
        theme::document_theme_script(theme),
        PIP_SHIM
    );

    Builder::new("sovlium-webview-policy")
        .js_init_script(init_script)
        .on_page_load(|webview, payload| {
            match payload.event() {
                PageLoadEvent::Started => {
                    let theme = theme::read_shell_theme(webview.app_handle());
                    let _ = webview.eval(&theme::document_theme_script(theme));
                }
                PageLoadEvent::Finished => {
                    // Remote UI may still ship Metrika until xi.web deploy picks up the
                    // native guard — strip counters after load as a belt-and-suspenders.
                    let _ = webview.eval(DISABLE_METRIKA_SCRIPT);
                }
            }
        })
        .build()
}
