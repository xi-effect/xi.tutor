fn main() {
    let target_os = std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default();
    if target_os == "macos" {
        println!("cargo:rerun-if-changed=src/media_macos.m");
        cc::Build::new()
            .file("src/media_macos.m")
            .flag("-fobjc-arc")
            .compile("sovlium_media_macos");
        println!("cargo:rustc-link-lib=framework=AVFoundation");
        println!("cargo:rustc-link-lib=framework=CoreGraphics");
        println!("cargo:rustc-link-lib=framework=Foundation");
    }

    tauri_build::build();
}
