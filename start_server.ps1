Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

try {
    python -c "import waitress" | Out-Null
} catch {
    Write-Host "Missing dependency: waitress"
    Write-Host "Run: .\scripts\install_deps.ps1"
    exit 1
}

Write-Host "Starting certificate verification backend on http://127.0.0.1:5000 ..."
python Backend/app.py
