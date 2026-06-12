param(
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
  param([string]$NodePath)

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

$script:SystemNpm = Get-CommandPath @("npm.cmd", "npm")
$script:NodePath = Get-NodePath

if (!$script:SystemNpm) {
  $script:LocalNpmCli = Ensure-LocalNpmCli -NodePath $script:NodePath
  $NodeBin = Split-Path -Parent $script:NodePath
  $env:PATH = "$NodeBin;$env:PATH"
}

Write-Host "Node: $script:NodePath"
Write-Host "npm:  $(if ($script:SystemNpm) { $script:SystemNpm } else { $script:LocalNpmCli })"

if (!$SkipInstall) {
  Invoke-Npm "install"
}

Invoke-Npm "run" @("test")
Invoke-Npm "run" @("lint")
Invoke-Npm "run" @("typecheck")

$NextDir = Join-Path $RepoRoot ".next"
if (Test-Path -LiteralPath $NextDir) {
  Write-Host "Removing stale .next build output before production build..."
  Remove-Item -LiteralPath $NextDir -Recurse -Force
}

Invoke-Npm "run" @("build")

Write-Host "Verification completed successfully."
