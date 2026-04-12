# isurf-mgmt

Tauri + React desktop app for managing ADMS surf club members (sócios).

## Development

Prerequisites: [nvm](https://github.com/nvm-sh/nvm) → Node 22.14, [Rust](https://rust-lang.org/tools/install/), [Tauri CLI](https://v2.tauri.app/start/prerequisites/)

```bash
npm install
npm run tauri dev
```

On Linux, if you hit WebKit rendering issues:
```bash
GDK_BACKEND=x11 WEBKIT_DISABLE_COMPOSITING_MODE=1 npm run tauri dev
```

## Building

```bash
npm run tauri build
```

Produces a `.deb` package under `src-tauri/target/release/bundle/deb/`.

## Runtime configuration

The app reads its config from a `.env` file in the user's config directory.
**Do not run the app as root** — paths resolve relative to whoever launches it.

| Platform | Path |
|---|---|
| Linux | `~/.config/isurf-mgmt-alpha/.env` |
| macOS | `~/Library/Application Support/isurf-mgmt-alpha/.env` |
| Windows | `%APPDATA%\isurf-mgmt-alpha\.env` |

### Variables

| Variable | Default | Description |
|---|---|---|
| `API_HOST` | `localhost` | Hostname or IP of the backend API |
| `API_PORT` | `3000` | Port of the backend API |

### Example

```env
API_HOST=192.168.1.66
API_PORT=3000
```

## Logs

| Platform | Path |
|---|---|
| Linux | `~/.local/share/isurf-mgmt-alpha/logs/` |
| macOS | `~/Library/Application Support/isurf-mgmt-alpha/logs/` |
| Windows | `%LOCALAPPDATA%\isurf-mgmt-alpha\logs\` |

## References

- [Figma design](https://www.figma.com/design/ziQMQACZ8Wfma93hhWAmp4/ADMS?node-id=0-1&p=f)
- API endpoints: see [ENDPOINTS.md](ENDPOINTS.md)
