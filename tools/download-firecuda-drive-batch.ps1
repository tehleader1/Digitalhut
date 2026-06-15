param(
  [string]$Destination = "D:\UserBackups\Downloads\DigitalHutDriveBatch"
)

$ErrorActionPreference = "Stop"
$driveIds = @(
  "1EyJREaTttytp-uwVhai3ak9xq6eBxWiC",
  "1GgDlWpOhYqGASSezwDs3MJhlOWO4Wbd-",
  "1-YY7aB27KA26WHGy6a12EeyAVuGcr0J4",
  "1AM2qpyEasZaoIl2HJ5vooe4IL7YVvYN3",
  "14eTGRv5g0eZbnMtYoPqcYyOjGMuU40D6",
  "10l-R7SLRhu8NvGalmgYd0fZYLEF3jRuo",
  "1PubMVZHNLAYSHZTKOryAzhULqJFofZuT",
  "11prER3yXxDctKPns3Gv1Phg1Ljev8m71",
  "1JzuTT38zfUIOw83HeQPEDPUlhODWa7qt",
  "14Fb1eEYmvP-aZeesp1CE28-zbKet-g74",
  "1r7X8cCJqsbH3Bf6wtu1Qxa4Uc9lU5pVb",
  "1IYxIotMZaaItu2HJH87LxIfPCglFX5eE",
  "1YM4zbXIFgZ8raQF3SlP4f_y-QYLPuGAz",
  "1KUa1ALN8Hh2X9g-AXBZGsh0YNVMy6zOw",
  "1RzlUKwR9OIr58BRJT-FzoVf8IdbmNf6r",
  "1GJ_OpSvDmJhsocCVs4et2h-ZhsmaLxix",
  "1nuAOIuo_Z0DFkF1Qnj6JspZSg74fG2NU",
  "1kNz4SpYZU_vg94d-m4TTS8Ttg-7vr9Aj",
  "1emU0A12zgKmQDgkZdNcwwnzyIRSFs5qN",
  "10zpqqZCSGTw61GXKUrnhfpf8A0Qh3RID",
  "1N5af_WsmIef40JTnGnwh-XwWD6PxEm4D",
  "1iVhC4fgx7IabWtPR8aIuAo0uCwjJUxOo",
  "1YOLG3t-sMF2Qibf_HEkPvd9z8R4_K6Z0",
  "1ul4YMMdz9Q5Nx8P09HBiUo3qZaOIw41C",
  "1lYLHB4OggZZOSOxH6YRCQMDsPhn31Zov"
)

New-Item -ItemType Directory -Force -Path $Destination | Out-Null

function Get-FileNameFromResponse($response, $fallback){
  $disposition = $response.Headers["Content-Disposition"]
  if($disposition -and $disposition -match 'filename\*?=(?:UTF-8''''|")?([^";]+)'){
    return [System.Uri]::UnescapeDataString($matches[1]).Trim('"')
  }
  return "$fallback.download"
}

function Save-DriveFile($id){
  $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $baseUrl = "https://drive.google.com/uc?export=download&id=$id"
  $tempPath = Join-Path $Destination "$id.tmp"
  $response = Invoke-WebRequest -Uri $baseUrl -WebSession $session -UseBasicParsing -OutFile $tempPath -PassThru
  $contentType = $response.Headers["Content-Type"]

  if($contentType -and $contentType -notmatch "text/html"){
    $name = Get-FileNameFromResponse $response $id
    $finalPath = Join-Path $Destination $name
    Move-Item -LiteralPath $tempPath -Destination $finalPath -Force
    return Get-Item -LiteralPath $finalPath
  }

  $html = Get-Content -LiteralPath $tempPath -Raw
  Remove-Item -LiteralPath $tempPath -Force
  $confirm = ""
  $uuid = ""
  if($html -match 'confirm=([0-9A-Za-z_-]+)'){
    $confirm = $matches[1]
  }
  if($html -match 'uuid=([0-9A-Za-z_-]+)'){
    $uuid = $matches[1]
  }
  if(-not $confirm){
    throw "Google Drive did not expose a direct download for $id. Make sure the file is shared as Anyone with the link can view."
  }

  $downloadUrl = "https://drive.google.com/uc?export=download&id=$id&confirm=$confirm"
  if($uuid){ $downloadUrl = "$downloadUrl&uuid=$uuid" }
  $response = Invoke-WebRequest -Uri $downloadUrl -WebSession $session -UseBasicParsing -OutFile $tempPath -PassThru
  $name = Get-FileNameFromResponse $response $id
  $finalPath = Join-Path $Destination $name
  Move-Item -LiteralPath $tempPath -Destination $finalPath -Force
  return Get-Item -LiteralPath $finalPath
}

$downloaded = foreach($id in $driveIds){
  try{
    $file = Save-DriveFile $id
    [PSCustomObject]@{
      Id = $id
      Name = $file.Name
      SizeMB = [math]::Round($file.Length / 1MB, 2)
      Status = "Downloaded"
    }
  } catch {
    [PSCustomObject]@{
      Id = $id
      Name = ""
      SizeMB = ""
      Status = $_.Exception.Message
    }
  }
}

$downloaded | Format-Table -AutoSize
Write-Host ""
Write-Host "Saved downloads to $Destination"
Write-Host "Next: powershell -ExecutionPolicy Bypass -File .\tools\import-firecuda-library.ps1 -Source `"$Destination`""
