param(
  [string]$DriveLetter = "",
  [string]$RepoPath = "",
  [switch]$Pull,
  [switch]$Install,
  [switch]$Build,
  [switch]$Audit,
  [switch]$Start,
  [switch]$CollectGlb,
  [string[]]$GlbUrl = @(),
  [string]$GlbManifest = "",
  [switch]$MarketUniverse,
  [string]$Universe = "all",
  [int]$UniverseLimit = 0
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
    "DigitalHut\glb-cache\incoming",
    "DigitalHut\glb-cache\tested",
    "DigitalHut\marketplace-exports",
    "DigitalHut\marketplace-exports\stock-profiles",
    "DigitalHut\mobile-handoffs",
    "DigitalHut\server-snapshots"
  )

  foreach ($dir in $dirs) {
    $path = Join-Path $root $dir
    if (!(Test-Path $path)) { New-Item -ItemType Directory -Path $path | Out-Null }
  }
}

function Save-Json($path, $content) {
  $content | ConvertTo-Json -Depth 14 | Out-File -FilePath $path -Encoding utf8
  Write-Host "Saved: $path" -ForegroundColor Green
}

function Save-Audit($root, $name, $content) {
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $path = Join-Path $root "DigitalHut\audit-logs\$stamp-$name.json"
  $content | Out-File -FilePath $path -Encoding utf8
  Write-Host "Saved: $path" -ForegroundColor Green
}

function Fetch-Endpoint($url) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 45
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

function Get-ManifestUrls($manifestPath) {
  if (!$manifestPath) { return @() }
  if (!(Test-Path $manifestPath)) { throw "GLB manifest not found: $manifestPath" }
  $raw = Get-Content -Raw -Path $manifestPath
  if ($raw.TrimStart().StartsWith("[")) {
    return @((ConvertFrom-Json $raw) | ForEach-Object { [string]$_ })
  }
  return @(Get-Content -Path $manifestPath | Where-Object { $_ -and !$_.TrimStart().StartsWith("#") })
}

function Safe-FileName($url) {
  $uri = [Uri]$url
  $name = [System.IO.Path]::GetFileName($uri.AbsolutePath)
  if (!$name -or !$name.ToLower().EndsWith(".glb")) {
    $hash = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($url))).Replace("-", "").Substring(0, 16).ToLower()
    return "$hash.glb"
  }
  return $name -replace "[^a-zA-Z0-9._-]", "_"
}

function Collect-GlbAssets($root, $urls) {
  $incoming = Join-Path $root "DigitalHut\glb-cache\incoming"
  $tested = Join-Path $root "DigitalHut\glb-cache\tested"
  $results = @()

  foreach ($url in $urls) {
    $started = Get-Date
    $fileName = Safe-FileName $url
    $target = Join-Path $incoming $fileName
    try {
      Write-Host "Collecting GLB: $url" -ForegroundColor Cyan
      Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 300 -OutFile $target
      $item = Get-Item $target
      $hash = Get-FileHash -Algorithm SHA256 -Path $target
      $result = @{
        url = $url
        ok = $true
        file = $target
        testedFile = Join-Path $tested $fileName
        bytes = $item.Length
        megabytes = [math]::Round($item.Length / 1MB, 2)
        sha256 = $hash.Hash
        extension = $item.Extension
        largeModel = $item.Length -ge 50MB
        collectedAt = $started.ToString("o")
        completedAt = (Get-Date).ToString("o")
      }
      Move-Item -LiteralPath $target -Destination $result.testedFile -Force
      $results += $result
    } catch {
      $results += @{
        url = $url
        ok = $false
        error = $_.Exception.Message
        collectedAt = $started.ToString("o")
      }
    }
  }

  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $report = Join-Path $root "DigitalHut\glb-cache\$stamp-glb-collection-report.json"
  Save-Json $report $results
  return $results
}

function Export-MarketUniverse($root, $universe, $limit) {
  $limitParam = if ($limit -gt 0) { "&limit=$limit" } else { "&limit=0" }
  $url = "https://digitalhut.app/api/market-universe?universe=$universe&profiles=true$limitParam"
  $result = Fetch-Endpoint $url
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $path = Join-Path $root "DigitalHut\marketplace-exports\stock-profiles\$stamp-$universe-stock-profiles.json"

  if ($result.ok) {
    $result.body | Out-File -FilePath $path -Encoding utf8
  } else {
    Save-Json $path $result
  }

  Write-Host "Stock profile export: $path" -ForegroundColor Green
  return $result
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
    "https://digitalhut.app/api/blog/daily",
    "https://digitalhut.app/api/agents/seo-observatory",
    "https://digitalhut.app/api/market-universe?universe=sp500&limit=25",
    "https://digitalhut.app/api/market?symbol=BTC",
    "https://digitalhut.app/api/market?symbol=AAPL",
    "https://digitalhut.app/api/adaptive-home?query=BTC"
  )
  $results = @()
  foreach ($url in $urls) { $results += Fetch-Endpoint $url }
  Save-Audit $root "server-endpoints" ($results | ConvertTo-Json -Depth 10)
}

if ($CollectGlb) {
  Step "Collecting and testing GLB files on FireCuda"
  $manifestUrls = Get-ManifestUrls $GlbManifest
  $allUrls = @($GlbUrl + $manifestUrls | Where-Object { $_ })
  if (!$allUrls -or $allUrls.Count -eq 0) {
    Write-Host "No GLB URLs supplied. Add -GlbUrl or -GlbManifest." -ForegroundColor Yellow
  } else {
    Collect-GlbAssets $root $allUrls | Out-Null
  }
}

if ($MarketUniverse) {
  Step "Exporting stock profile universe to FireCuda"
  Export-MarketUniverse $root $Universe $UniverseLimit | Out-Null
}

if ($Start) {
  Step "Starting DigitalHut local server from FireCuda"
  npm run dev
} else {
  Step "Ready"
  Write-Host "Full FireCuda cycle:" -ForegroundColor Cyan
  Write-Host ".\FireCuda-DigitalHut-OpsRunner.ps1 -DriveLetter F -Pull -Install -Build -Audit -MarketUniverse -Universe all -UniverseLimit 0"
  Write-Host "GLB collection cycle:" -ForegroundColor Cyan
  Write-Host ".\FireCuda-DigitalHut-OpsRunner.ps1 -DriveLetter F -CollectGlb -GlbManifest F:\DigitalHut\glb-cache\glb-urls.txt"
}
