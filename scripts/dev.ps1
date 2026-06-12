param(
  [string]$Port = "3000",
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RepoRoot

$CacheDir = Join-Path $RepoRoot ".cache"
$NpmCacheDir = Join-Path $CacheDir "npm-cli"
$NpmVersion = "10.9.2"

function Get-CommandPath {
  param([string[]]$Names)

  foreach ($Name in $Names) {
    $Command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($Command) {
      return $Command.Source
    }
  }

  return $null
}

function Get-NodePath {
  $SystemNode = Get-CommandPath @("node.exe", "node")
  if ($SystemNode) {
    return $SystemNode
  }

  $BundledNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  if (Test-Path -LiteralPath $BundledNode) {
    return $BundledNode
  }

  throw "Node.js was not found. Install Node.js or run inside the Codex desktop runtime."
}

function Ensure-LocalNpmCli {
  $NpmCli = Join-Path $NpmCacheDir "package\bin\npm-cli.js"
  if (Test-Path -LiteralPath $NpmCli) {
    return $NpmCli
  }

  New-Item -ItemType Directory -Path $NpmCacheDir -Force | Out-Null
  $TempExtractDir = Join-Path $env:TEMP "worldcup-npm-$NpmVersion"
  Remove-Item -LiteralPath $TempExtractDir -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Path $TempExtractDir -Force | Out-Null

  $Archive = Join-Path $TempExtractDir "npm-$NpmVersion.tgz"
  $Url = "https://registry.npmjs.org/npm/-/npm-$NpmVersion.tgz"

  Write-Host "Downloading npm $NpmVersion to repo-local cache..."
  Invoke-WebRequest -Uri $Url -OutFile $Archive

  Push-Location $TempExtractDir
  try {
    tar -xzf $Archive
  } finally {
    Pop-Location
  }

  $TempPackageDir = Join-Path $TempExtractDir "package"
  if (!(Test-Path -LiteralPath $TempPackageDir)) {
    throw "Downloaded npm archive did not extract correctly."
  }

  Remove-Item -LiteralPath (Join-Path $NpmCacheDir "package") -Recurse -Force -ErrorAction SilentlyContinue
  Copy-Item -LiteralPath $TempPackageDir -Destination $NpmCacheDir -Recurse -Force

  if (!(Test-Path -LiteralPath $NpmCli)) {
    throw "Downloaded npm CLI was not found at $NpmCli"
  }

  return $NpmCli
}

function Invoke-Npm {
  param(
    [string]$NpmCommand,
    [string[]]$NpmArgs = @()
  )

  if ($script:SystemNpm) {
    & $script:SystemNpm $NpmCommand @NpmArgs
  } else {
    & $script:NodePath $script:LocalNpmCli $NpmCommand @NpmArgs
  }

  if ($LASTEXITCODE -ne 0) {
    throw "npm $NpmCommand $($NpmArgs -join ' ') failed with exit code $LASTEXITCODE"
  }
}

function Test-LocalPortInUse {
  param([int]$PortNumber)

  $Client = [System.Net.Sockets.TcpClient]::new()
  try {
    $Connect = $Client.BeginConnect("127.0.0.1", $PortNumber, $null, $null)
    if ($Connect.AsyncWaitHandle.WaitOne(300, $false)) {
      $Client.EndConnect($Connect)
      return $true
    }

    return $false
  } catch {
    return $false
  } finally {
    $Client.Close()
  }
}

$script:SystemNpm = Get-CommandPath @("npm.cmd", "npm")
$script:NodePath = Get-NodePath
$NodeBin = Split-Path -Parent $script:NodePath
$env:PATH = "$NodeBin;$env:PATH"

if (!$script:SystemNpm) {
  $script:LocalNpmCli = Ensure-LocalNpmCli
}

Write-Host "Node: $script:NodePath"
Write-Host "npm:  $(if ($script:SystemNpm) { $script:SystemNpm } else { $script:LocalNpmCli })"

if (!$SkipInstall) {
  Invoke-Npm "install"
}

Write-Host "Removing stale .next cache before starting dev server..."
Remove-Item -LiteralPath (Join-Path $RepoRoot ".next") -Recurse -Force -ErrorAction SilentlyContinue

$DefaultUrl = "http://localhost:$Port"
$PortInUse = Test-LocalPortInUse -PortNumber ([int]$Port)

Write-Host ""
Write-Host "PowerShell window must remain open. Close this window to stop the site."
Write-Host "If Next.js prints a different Local URL, use the terminal Local URL as the source of truth."

if ($PortInUse) {
  Write-Host "Port $Port is already in use."
  Write-Host "Starting Next dev server and allowing Next.js to choose an available port."
  Write-Host "Next.js may use 3001 or another available port."
  Write-Host "Use the 'Local:' URL shown in this terminal as the source of truth."
  Write-Host "Do not keep opening http://localhost:$Port unless Next.js says that is the Local URL."
  Invoke-Npm "run" @("dev")
} else {
  Write-Host "Starting Next dev server on $DefaultUrl"
  Write-Host "Opening browser at $DefaultUrl"
  Start-Job -ScriptBlock {
    param([string]$Url)
    Start-Sleep -Seconds 3
    Start-Process $Url
  } -ArgumentList $DefaultUrl | Out-Null

  Invoke-Npm "run" @("dev", "--", "-p", $Port)
}
