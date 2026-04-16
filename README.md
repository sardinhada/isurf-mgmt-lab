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

## Building installers

### Windows (NSIS installer)

```bash
npm run tauri build -- --target nsis
```

Produces a `.exe` installer under `src-tauri/target/release/bundle/nsis/`.

To uninstall: use **Add or Remove Programs** in Windows Settings, or run the uninstaller at `%LOCALAPPDATA%\Socios ADMS\uninstall.exe`.

---

### macOS (DMG)

```bash
npm run tauri build -- --target dmg
```

Produces a `.dmg` under `src-tauri/target/release/bundle/dmg/`. Open the DMG and drag the app to `/Applications`.

To uninstall: drag **Socios ADMS.app** from `/Applications` to the Trash. To also remove config and logs, delete:
- `~/Library/Application Support/Socios ADMS/`

---

### Linux (deb)

```bash
npm run tauri build -- --target deb
```

Produces a `.deb` under `src-tauri/target/release/bundle/deb/`.

Install:
```bash
sudo dpkg -i socios-adms_*.deb
```

To uninstall:
```bash
sudo dpkg -r socios-adms
```

To also remove config and logs, delete:
- `~/.config/Socios ADMS/`
- `~/.local/share/Socios ADMS/`

---

## Runtime configuration

The app reads its config from a `.env` file in the user's config directory.
**Do not run the app as root** — paths resolve relative to whoever launches it.

| Platform | Path |
|---|---|
| Linux | `~/.config/Socios ADMS/.env` |
| macOS | `~/Library/Application Support/Socios ADMS/.env` |
| Windows | `%APPDATA%\Socios ADMS\.env` |

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
| Linux | `~/.local/share/Socios ADMS/logs/` |
| macOS | `~/Library/Application Support/Socios ADMS/logs/` |
| Windows | `%LOCALAPPDATA%\Socios ADMS\logs\` |

## References

- [Figma design](https://www.figma.com/design/ziQMQACZ8Wfma93hhWAmp4/ADMS?node-id=0-1&p=f)
- API endpoints: see [ENDPOINTS.md](ENDPOINTS.md)
