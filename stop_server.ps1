Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$connections = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue

if (-not $connections) {
    Write-Host "No process is listening on port 5000."
    exit 0
}

$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($pid in $pids) {
    Write-Host "Stopping process on port 5000 (PID: $pid)..."
    Stop-Process -Id $pid -Force
}
