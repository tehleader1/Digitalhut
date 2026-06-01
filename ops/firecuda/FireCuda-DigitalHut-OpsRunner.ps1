param(
  [string]$DriveLetter = "",
  [string]$RepoPath = "",
  [switch]$Pull,
  [switch]$Install,
  [switch]$Build,
  [switch]$Audit,
  [switch]$Start
)

$ErrorActionPreference = "Stop"

function Step($message) {
  Write-Host ""
  Write-Host "== $message ==" -ForegroundColor Cyan
}

function Find-FireCudaVolume {
  if ($DriveLetter) {
    return Get-Volume -DriveLetter $DriveLetter.TrimEnd(":") -ErrorAction Stop
  }

  $matches = Get-Volume | Where-Object {
    ($_.FileSystemLabel -match "FireCuda|DigitalHut|Seagate") -or
    ($_.DriveLetter -and (Get-Disk -Number (Get-Partition -DriveLetter $_.DriveLetter).DiskNumber -ErrorAction SilentlyContinue).FriendlyName -match "FireCuda|Seagate")
  }

  if (!$matches) {
    Get-Volume | Format-Table DriveLetter,FileSystemLabel,FileSystem,HealthStatus,SizeRemaining,Size
    throw "FireCuda volume not found. Label it FireCuda_DigitalHut or pass -DriveLetter F."
  }

  if ($matches.Count -gt 1) {
    $matches | Format-Table DriveLetter,FileSystemLabel,FileSystem,HealthStatus,SizeRemaining,Size
    throw "Multiple possible FireCuda volumes found. Pass -DriveLetter."
  }

  return $matches
}

function Resolve-Repo($volume) {
  if ($RepoPath) {
    if (!(Test-Path $RepoPath)) { throw "RepoPath does not exist: $RepoPath" }
    return (Resolve-Path $RepoPath).Path
  }

  $root = "$($volume.DriveLetter):\"
  $candidates = @(
    (Join-Path $root "DigitalHut"),
    (Join-Path $root "Digitalhut"),
    (Join-Path $root "Repos\DigitalHut"),
    (Join-Path $root "Projects\DigitalHut"),
    (Join-Path $root "DigitalHut\repo")
  )

  foreach ($candidate in $candidates) {
    if (Test-Path (Join-Path $candidate "package.json")) { return $candidate }
  }

  throw "DigitalHut repo not found on $root. Clone it to F:\DigitalHut or pass -RepoPath."
}

function Ensure-BreathingSpace($root) {
  $dirs = @(
    "DigitalHut\builds",
    "DigitalHut\audit-logs",
    "DigitalHut\screenshots",
    "DigitalHut\observatory-assets",
    "DigitalHut\glb-cache",
    "DigitalHut\marketplace-exports",
    "DigitalHut\mobile-handoffs",
    "DigitalHut\server-snapshots"
  )

  foreach ($dir in $dirs) {
    $path = Join-Path $root $dir
    if (!(Test-Path $path)) { New-Item -ItemType Directory -Path $path | Out-Null }
  }
}

function Save-Audit($root, $name, $content) {
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $path = Join-Path $root "DigitalHut\audit-logs\$stamp-$name.json"
  $content | Out-File -FilePath $path -Encoding utf8
  Write-Host "Saved: $path" -ForegroundColor Green
}

function Fetch-Endpoint($url) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 25
    return @{
      url = $url
      ok = $true
      status = [int]$response.StatusCode
      body = $response.Content
      checkedAt = (Get-Date).ToString("o")
    }
  } catch {
    return @{
      url = $url
      ok = $false
      error = $_.Exception.Message
      checkedAt = (Get-Date).ToString("o")
    }
  }
}

Step "FireCuda DigitalHut operations runner"
$volume = Find-FireCudaVolume
$root = "$($volume.DriveLetter):\"
Ensure-BreathingSpace $root
$repo = Resolve-Repo $volume

Write-Host "FireCuda root: $root" -ForegroundColor Green
Write-Host "DigitalHut repo: $repo" -ForegroundColor Green

Set-Location $repo

Step "Repo state"
git status --short --branch

if ($Pull) {
  Step "Pulling latest code into FireCuda workspace"
  git pull --ff-only
}

Step "Runtime state"
node -v
npm -v

if ($Install) {
  Step "Installing dependencies on FireCuda"
  npm install
}

if ($Build) {
  Step "Building on FireCuda"
  npm run build
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $buildNote = Join-Path $root "DigitalHut\builds\$stamp-build.txt"
  "Build completed at $(Get-Date -Format o) from $repo" | Out-File -FilePath $buildNote -Encoding utf8
  Write-Host "Build note: $buildNote" -ForegroundColor Green
}

if ($Audit) {
  Step "Auditing live server endpoints"
  $urls = @(
    "https://digitalhut.app/health",
    "https://digitalhut.app/api/market?symbol=BTC",
    "https://digitalhut.app/api/market?symbol=AAPL",
    "https://digitalhut.app/api/adaptive-home?query=BTC"
  )
  $results = @()
  foreach ($url in $urls) { $results += Fetch-Endpoint $url }
  Save-Audit $root "server-endpoints" ($results | ConvertTo-Json -Depth 8)
}

if ($Start) {
  Step "Starting DigitalHut local server from FireCuda"
  npm run dev
} else {
  Step "Ready"
  Write-Host "For full FireCuda cycle:" -ForegroundColor Cyan
  Write-Host ".\FireCuda-DigitalHut-OpsRunner.ps1 -DriveLetter F -Pull -Install -Build -Audit -Start"
}
