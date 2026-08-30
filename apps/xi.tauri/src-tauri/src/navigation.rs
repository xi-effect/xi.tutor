//! Top-level navigation allowlist for the Sovlium shell.
//!
//! Remote UI lives under `*.sovlium.ru`. Any other http(s) navigation is opened
//! in the system browser instead of inside the WebView.

use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime, Url,
};

const ALLOWED_HOST_SUFFIXES: &[&str] = &["sovlium.ru"];

fn host_allowed(host: &str) -> bool {
    let host = host.trim_end_matches('.').to_ascii_lowercase();
    if host == "localhost" || host == "127.0.0.1" || host == "::1" {
        return true;
    }
    ALLOWED_HOST_SUFFIXES
        .iter()
        .any(|suffix| host == *suffix || host.ends_with(&format!(".{suffix}")))
}

fn scheme_allowed(scheme: &str) -> bool {
    matches!(
        scheme,
        "tauri" | "asset" | "data" | "blob" | "about" | "http" | "https"
    )
}

pub fn is_navigation_allowed(url: &Url) -> bool {
    if !scheme_allowed(url.scheme()) {
        return false;
    }

    match url.scheme() {
        "tauri" | "asset" | "data" | "blob" | "about" => true,
        "http" | "https" => url.host_str().is_some_and(host_allowed),
        _ => false,
    }
}

fn open_in_system_browser(url: &Url) {
    let href = url.as_str();
    let result = {
        #[cfg(target_os = "macos")]
        {
            std::process::Command::new("open").arg(href).spawn()
        }
        #[cfg(target_os = "windows")]
        {
            std::process::Command::new("cmd")
                .args(["/C", "start", "", href])
                .spawn()
        }
        #[cfg(target_os = "linux")]
        {
            std::process::Command::new("xdg-open").arg(href).spawn()
        }
        #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
        {
            Err(std::io::Error::new(
                std::io::ErrorKind::Unsupported,
                "external URL open is not supported on this platform",
            ))
        }
    };

    if let Err(err) = result {
        log::warn!("failed to open external URL {href}: {err}");
    }
}

/// Plugin that rejects navigations outside the Sovlium allowlist.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("sovlium-navigation")
        .on_navigation(|_webview, url| {
            if is_navigation_allowed(url) {
                return true;
            }

            if matches!(url.scheme(), "http" | "https") {
                log::info!("opening external URL outside WebView: {url}");
                open_in_system_browser(url);
            } else {
                log::warn!("blocked navigation to disallowed URL: {url}");
            }
            false
        })
        .build()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn allows_sovlium_hosts() {
        assert!(is_navigation_allowed(
            &Url::parse("https://app.sovlium.ru/signin").unwrap()
        ));
        assert!(is_navigation_allowed(
            &Url::parse("https://desktop.sovlium.ru/").unwrap()
        ));
        assert!(is_navigation_allowed(
            &Url::parse("https://api.sovlium.ru/").unwrap()
        ));
        assert!(is_navigation_allowed(
            &Url::parse("https://support.sovlium.ru/help").unwrap()
        ));
    }

    #[test]
    fn allows_local_schemes_and_dev() {
        assert!(is_navigation_allowed(
            &Url::parse("tauri://localhost/index.html").unwrap()
        ));
        assert!(is_navigation_allowed(
            &Url::parse("http://localhost:1420/").unwrap()
        ));
        assert!(is_navigation_allowed(&Url::parse("about:blank").unwrap()));
    }

    #[test]
    fn rejects_foreign_https() {
        assert!(!is_navigation_allowed(
            &Url::parse("https://evil.example/phish").unwrap()
        ));
        assert!(!is_navigation_allowed(
            &Url::parse("https://sovlium.ru.evil.com/").unwrap()
        ));
    }
}
