//! WebView policy for the native shell: mark the page as native and keep
//! browser-only analytics (Yandex Metrika) from running inside Tauri.

use tauri::{
    plugin::{Builder, TauriPlugin},
    webview::PageLoadEvent,
    Runtime,
};

/// Runs before page scripts — sets the native flag and a no-op `ym` so even an
/// already-deployed remote `index.html` cannot usefully init Metrika if our
/// page-load cleanup races slightly. Prefer the `xi.web` index.html guard too.
const INIT_SCRIPT: &str = r#"
(function () {
  try {
    Object.defineProperty(window, '__SOVLIUM_NATIVE__', {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false,
    });
  } catch (_) {
    window.__SOVLIUM_NATIVE__ = true;
  }
  window.ym = function () {};
})();
"#;

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

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("sovlium-webview-policy")
        .js_init_script(INIT_SCRIPT)
        .on_page_load(|webview, payload| {
            if payload.event() != PageLoadEvent::Finished {
                return;
            }
            // Remote UI may still ship Metrika until xi.web deploy picks up the
            // native guard — strip counters after load as a belt-and-suspenders.
            let _ = webview.eval(DISABLE_METRIKA_SCRIPT);
        })
        .build()
}
