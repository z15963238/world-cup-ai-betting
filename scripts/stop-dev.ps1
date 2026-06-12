$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$Ports = @(3000, 3001, 3002)
$Candidates = @()

foreach ($Port in $Ports) {
  $Connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  foreach ($Connection in $Connections) {
    $Process = Get-Process -Id $Connection.OwningProcess -ErrorAction SilentlyContinue
    if ($Process -and ($Process.ProcessName -match "node|next")) {
      $Candidates += [pscustomobject]@{
        Port = $Port
        ProcessId = $Process.Id
        ProcessName = $Process.ProcessName
        Path = $Process.Path
      }
    }
  }
}

if ($Candidates.Count -eq 0) {
  Write-Host "No node/next dev server found on ports 3000, 3001, or 3002."
  exit 0
}

Write-Host "Found possible Next dev server processes:"
$Candidates | Format-Table -AutoSize

$Answer = Read-Host "Stop these node/next processes? Type YES to confirm"
if ($Answer -ne "YES") {
  Write-Host "Cancelled. No process was stopped."
  exit 0
}

$Candidates | Select-Object -ExpandProperty ProcessId -Unique | ForEach-Object {
  Write-Host "Stopping process $_..."
  Stop-Process -Id $_ -Force
}

Write-Host "Done."
