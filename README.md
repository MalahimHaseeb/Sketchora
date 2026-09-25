# Sketchora

An unofficial cross-platform desktop app for [Excalidraw](https://github.com/excalidraw/excalidraw), the open-source, hand-drawn style whiteboard tool. Sketchora wraps Excalidraw in Electron so you get a native app with real file handling, instead of a browser tab.

![platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![license](https://img.shields.io/badge/license-MIT-green)

## Features

- The full Excalidraw whiteboard experience: shapes, freehand drawing, text, arrows, libraries, dark mode
- Native file handling: `File > New / Open / Save / Save As`, saves as real `.excalidraw` files on your disk
- Double-click a `.excalidraw` file to open it directly in Sketchora
- Cross-platform: Windows, macOS, and Linux, from one codebase
- Recent files remembered by your OS

## Download

Grab the latest build for your operating system directly from the Releases page:

**[github.com/MalahimHaseeb/sketchora/releases/latest](https://github.com/MalahimHaseeb/sketchora/releases/latest)**

Every tagged release is built automatically for all three platforms by our GitHub Actions workflow, so the installers you see there are always fresh off the latest tag.

| OS | File | Notes |
|---|---|---|
| Windows | `Sketchora-Setup-x.x.x.exe` | Installer |
| macOS | `Sketchora-x.x.x.dmg` | Universal build |
| Linux | `Sketchora-x.x.x.AppImage` or `.deb` | AppImage needs no install |

### Installation notes

**Windows**: SmartScreen may show "Windows protected your PC" since this build isn't code-signed yet. Click **More info**, then **Run anyway**.

**macOS**: Gatekeeper will block the app on first launch ("Apple could not verify..."). Right-click the app, choose **Open**, then confirm in the dialog. You only need to do this once.

**Linux (AppImage)**:
```bash
chmod +x Sketchora-x.x.x-linux-x86_64.AppImage
./Sketchora-x.x.x-linux-x86_64.AppImage
```

**Linux (deb)**:
```bash
sudo dpkg -i Sketchora-x.x.x-linux-amd64.deb
sudo apt-get install -f
```

## Reporting issues

Found a bug or something not working right? Open an issue here:

**[github.com/MalahimHaseeb/sketchora/issues/new](https://github.com/MalahimHaseeb/sketchora/issues/new)**

Please include:
- Your OS and version
- Steps to reproduce
- Screenshots if it's a visual bug

Check [existing issues](https://github.com/MalahimHaseeb/sketchora/issues) first in case it's already reported.

## Contributing

Contributions are welcome, whether it's a bug fix, a new feature, or a docs improvement.

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run checks before opening a PR:
   ```bash
   yarn prettier --check electron excalidraw-app/App.tsx excalidraw-app/types/electron.d.ts
   yarn test:typecheck
   yarn test:code
   ```
5. Open a pull request describing what you changed and why

## Development

Requires Node.js 18+ and Yarn.

```bash
git clone https://github.com/MalahimHaseeb/sketchora.git
cd sketchora
yarn install
yarn build:packages
```

Run the web dev server:
```bash
yarn start
```

In a separate terminal, run the Electron shell pointed at it:
```bash
yarn electron:dev
```

## Building a release yourself

```bash
yarn build:packages
yarn build:app
yarn desktop:linux
```

Swap `desktop:linux` for `desktop:win` or `desktop:mac` depending on your target. Packaged output lands in `release/`.

Official releases are built automatically for Windows, macOS, and Linux whenever a `v*.*.*` tag is pushed, see `.github/workflows/release.yml`.

## Credits

Sketchora is built entirely on top of [Excalidraw](https://github.com/excalidraw/excalidraw), created and maintained by the Excalidraw team and community. All the whiteboard functionality, hand-drawn rendering style, and core editor come from their work.

- Original project: [github.com/excalidraw/excalidraw](https://github.com/excalidraw/excalidraw)
- Official web app: [excalidraw.com](https://excalidraw.com)

Sketchora is an independent, unofficial packaging of that project as a desktop app and is not affiliated with or endorsed by the Excalidraw team.

## License

MIT, same as the upstream Excalidraw project. See [LICENSE](LICENSE) for details.