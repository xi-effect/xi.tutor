# Icons

Tauri expects a fixed set of bitmap and platform-native icon files in this
folder. Do NOT hand-edit them — they are generated from a single source PNG
via the Tauri CLI:

```bash
# Run from apps/xi.tauri (path is relative to src-tauri):
pnpm tauri icon ../../path/to/source-1024.png
```

The command produces the following files, all of which are referenced from
`tauri.conf.json -> bundle.icon`:

- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)
- `Square*.png`, `StoreLogo.png` (Windows Store)
- `android/` (created during `pnpm android:init`)
- `ios/` (created during `pnpm ios:init`)

Source recommendation: a 1024x1024 PNG with transparency, centred logo, ~10%
padding on each side. Keep the master file outside of this folder — for
example in `branding/` at the repo root — so we can re-export at any time.
