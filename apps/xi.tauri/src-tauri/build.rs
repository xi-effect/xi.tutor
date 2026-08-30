fn main() {
    let target_os = std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default();
    if target_os == "macos" || target_os == "ios" {
        println!("cargo:rerun-if-changed=src/media_apple.m");
        cc::Build::new()
            .file("src/media_apple.m")
            .flag("-fobjc-arc")
            .compile("sovlium_media_apple");
        println!("cargo:rustc-link-lib=framework=AVFoundation");
        println!("cargo:rustc-link-lib=framework=Foundation");
        if target_os == "macos" {
            println!("cargo:rustc-link-lib=framework=CoreGraphics");
        }
    }

    tauri_build::build();
}
