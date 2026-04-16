#Requires -Version 5.1
<#
.SYNOPSIS
    Builds the Socios ADMS Windows NSIS installer and optionally configures the runtime .env.

.DESCRIPTION
    1. Verifies prerequisites (Node, Rust/Cargo, Tauri CLI).
    2. Runs `npm.cmd run tauri build`.
    3. Copies the produced .exe installer to the repo root for easy distribution.
    4. Optionally writes %APPDATA%\Socios ADMS\.env with API_HOST / API_PORT.

.PARAMETER ApiHost
    Hostname or IP of the backend API.  Default: localhost

.PARAMETER ApiPort
    Port of the backend API.  Default: 3000

.PARAMETER SkipEnvSetup
    Skip writing the runtime .env file.

.EXAMPLE
    .\Install.ps1
    .\Install.ps1 -ApiHost 192.168.1.66 -ApiPort 3000
    .\Install.ps1 -SkipEnvSetup
#>
param(
    [string]$ApiHost,
    [string]$ApiPort,
    [switch]$SkipEnvSetup
)

if (-not $SkipEnvSetup) {
    if (-not $ApiHost -or -not $ApiPort) {
        Write-Host "ERROR: Provide both -ApiHost and -ApiPort, or use -SkipEnvSetup to skip .env setup." -ForegroundColor Red
        exit 1
    }
}

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step([string]$msg) {
    Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Assert-Command([string]$name, [string]$hint) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: '$name' not found. $hint" -ForegroundColor Red
        exit 1
    }
}

# ---------------------------------------------------------------------------
# 1. Prerequisites
# ---------------------------------------------------------------------------
Write-Step "Checking prerequisites"

Assert-Command "node"    "Install Node 22 via nvm: https://github.com/coreybutler/nvm-windows"
Assert-Command "npm.cmd" "Install Node 22 via nvm: https://github.com/coreybutler/nvm-windows"
Assert-Command "cargo"   "Install Rust: https://rust-lang.org/tools/install"


$nodeVersion = node --version
Write-Host "  node   $nodeVersion"
Write-Host "  npm    $(npm.cmd --version)"
Write-Host "  cargo  $(cargo --version)"

# ---------------------------------------------------------------------------
# 2. npm.cmd install
# ---------------------------------------------------------------------------
Write-Step "Installing npm dependencies"
npm.cmd install

# ---------------------------------------------------------------------------
# 3. Build NSIS installer
# ---------------------------------------------------------------------------
Write-Step "Building NSIS installer (this may take a few minutes)"
npm.cmd run tauri build

# ---------------------------------------------------------------------------
# 4. Locate the produced .exe
# ---------------------------------------------------------------------------
Write-Step "Locating installer artifact"

$nsisDir = Join-Path $PSScriptRoot "src-tauri\target\release\bundle\nsis"
$installer = Get-ChildItem -Path $nsisDir -Filter "*.exe" -ErrorAction SilentlyContinue |
             Sort-Object LastWriteTime -Descending |
             Select-Object -First 1

if (-not $installer) {
    Write-Host "ERROR: No .exe found under $nsisDir" -ForegroundColor Red
    exit 1
}

Write-Host "  Found: $($installer.FullName)"

# Copy to repo root for easy distribution
$dest = Join-Path $PSScriptRoot $installer.Name
Copy-Item -Path $installer.FullName -Destination $dest -Force
Write-Host "  Copied to: $dest"

# ---------------------------------------------------------------------------
# 5. Runtime .env setup
# ---------------------------------------------------------------------------
if (-not $SkipEnvSetup) {
    Write-Step "Writing runtime configuration"

    $configDir = Join-Path $env:APPDATA "Socios ADMS"
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir | Out-Null
    }

    $envPath = Join-Path $configDir ".env"
    @"
API_HOST=$ApiHost
API_PORT=$ApiPort
"@ | Set-Content -Path $envPath -Encoding UTF8

    Write-Host "  Written: $envPath"
    Write-Host "  API_HOST=$ApiHost"
    Write-Host "  API_PORT=$ApiPort"
}

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
Write-Host "`nDone. Installer ready at: $dest" -ForegroundColor Green
Write-Host "Run it to install Socios ADMS, or distribute it to end users." -ForegroundColor Green
