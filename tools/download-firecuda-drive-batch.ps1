param(
  [ValidateSet("001", "002", "003")]
  [string]$Batch = "003",
  [string]$Destination = ""
)

$ErrorActionPreference = "Stop"
$driveBatch001 = @(
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

$driveBatch002 = @(
  "1PubMVZHNLAYSHZTKOryAzhULqJFofZuT",
  "1AM2qpyEasZaoIl2HJ5vooe4IL7YVvYN3",
  "14eTGRv5g0eZbnMtYoPqcYyOjGMuU40D6",
  "1nuAOIuo_Z0DFkF1Qnj6JspZSg74fG2NU",
  "1svVunRANrfFGISTjunayCZk54yKpwVpA",
  "1fEtS-ZjEn7qqZ-xJGxBujDA2FWO9vLCS",
  "1kNz4SpYZU_vg94d-m4TTS8Ttg-7vr9Aj",
  "1J-UsxfLhLOWuDYVy-zmyvne8q04osh6m",
  "1z5JvxiK0B0c22wRpDbsb06UxOHJeBukm",
  "186Bd5Mk94gGn2yUqlkt8Rx-qBQgsU-f9",
  "1YOLG3t-sMF2Qibf_HEkPvd9z8R4_K6Z0",
  "1GgDlWpOhYqGASSezwDs3MJhlOWO4Wbd-",
  "1KUa1ALN8Hh2X9g-AXBZGsh0YNVMy6zOw",
  "1dESiBN5AKFVW1TApkYfuNMQYUGQK7hDD",
  "1ul4YMMdz9Q5Nx8P09HBiUo3qZaOIw41C",
  "1ZekhMOTCq1DJtrFgJzKnvt32EHvG9Ou1",
  "1IYxIotMZaaItu2HJH87LxIfPCglFX5eE",
  "1nIVnjng9xxmNd1HDsnJaQyI8nuwcE7OO",
  "1yR-QKJ0jQ-fS7w9YKH6lwCsv_CSBNnOW",
  "1fASNAMhDLCcFOoGu9_1102q3qK4Icifl",
  "1HGV8v5o0BkKNbAX-c-wZlTQGVIq7HW0F",
  "124hPc06f0i6eQqcqevrIN2dMYG3EBToN",
  "1RUSc2VdaiHcAUwi6LYPEokj3n6ZRe3ki",
  "1jk-gPiD8RZRn_pUStKHOR-NaxDL1KDm7",
  "1N5af_WsmIef40JTnGnwh-XwWD6PxEm4D",
  "1RzlUKwR9OIr58BRJT-FzoVf8IdbmNf6r",
  "12TfLxDbYm1qQAiLltUvv8feW6eZj9B_g",
  "1JzuTT38zfUIOw83HeQPEDPUlhODWa7qt",
  "1nDoh9dMSEvum9p5tnpJSSxGhorZPikiK",
  "14Fb1eEYmvP-aZeesp1CE28-zbKet-g74"
)

$driveBatch003 = @(
  "1AM2qpyEasZaoIl2HJ5vooe4IL7YVvYN3",
  "14eTGRv5g0eZbnMtYoPqcYyOjGMuU40D6",
  "1nuAOIuo_Z0DFkF1Qnj6JspZSg74fG2NU",
  "1kNz4SpYZU_vg94d-m4TTS8Ttg-7vr9Aj",
  "186Bd5Mk94gGn2yUqlkt8Rx-qBQgsU-f9",
  "1svVunRANrfFGISTjunayCZk54yKpwVpA",
  "1fEtS-ZjEn7qqZ-xJGxBujDA2FWO9vLCS",
  "1YOLG3t-sMF2Qibf_HEkPvd9z8R4_K6Z0",
  "1z5JvxiK0B0c22wRpDbsb06UxOHJeBukm",
  "1GgDlWpOhYqGASSezwDs3MJhlOWO4Wbd-",
  "1J-UsxfLhLOWuDYVy-zmyvne8q04osh6m",
  "1KUa1ALN8Hh2X9g-AXBZGsh0YNVMy6zOw",
  "1ul4YMMdz9Q5Nx8P09HBiUo3qZaOIw41C",
  "1IYxIotMZaaItu2HJH87LxIfPCglFX5eE",
  "1ZekhMOTCq1DJtrFgJzKnvt32EHvG9Ou1",
  "1dESiBN5AKFVW1TApkYfuNMQYUGQK7hDD",
  "1JzuTT38zfUIOw83HeQPEDPUlhODWa7qt",
  "1PubMVZHNLAYSHZTKOryAzhULqJFofZuT",
  "14Fb1eEYmvP-aZeesp1CE28-zbKet-g74",
  "1N5af_WsmIef40JTnGnwh-XwWD6PxEm4D",
  "1RzlUKwR9OIr58BRJT-FzoVf8IdbmNf6r",
  "10l-R7SLRhu8NvGalmgYd0fZYLEF3jRuo",
  "1EyJREaTttytp-uwVhai3ak9xq6eBxWiC",
  "1-YY7aB27KA26WHGy6a12EeyAVuGcr0J4",
  "1yR-QKJ0jQ-fS7w9YKH6lwCsv_CSBNnOW",
  "1nDoh9dMSEvum9p5tnpJSSxGhorZPikiK",
  "1RUSc2VdaiHcAUwi6LYPEokj3n6ZRe3ki",
  "1fASNAMhDLCcFOoGu9_1102q3qK4Icifl",
  "1zupyRFIgXc8J8p4VukDQm7ZVMohNppCx",
  "1HGV8v5o0BkKNbAX-c-wZlTQGVIq7HW0F"
)

if(-not $Destination){
  $Destination = "D:\UserBackups\Downloads\DigitalHutDriveBatch$Batch"
}

$knownIds = @{}
foreach($id in $driveBatch001){ $knownIds[$id] = "001" }
foreach($id in $driveBatch002){ if(-not $knownIds.ContainsKey($id)){ $knownIds[$id] = "002" } }
$driveIds = if($Batch -eq "001"){ $driveBatch001 } elseif($Batch -eq "002"){ $driveBatch002 } else { $driveBatch003 }

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
      Batch = $Batch
      LibraryStatus = if($knownIds.ContainsKey($id) -and $Batch -ne "001"){ "Already in Batch $($knownIds[$id])" } else { "New to this library" }
      Status = "Downloaded"
    }
  } catch {
    [PSCustomObject]@{
      Id = $id
      Name = ""
      SizeMB = ""
      Batch = $Batch
      LibraryStatus = if($knownIds.ContainsKey($id) -and $Batch -ne "001"){ "Already in Batch $($knownIds[$id])" } else { "New to this library" }
      Status = $_.Exception.Message
    }
  }
}

$downloaded | Format-Table -AutoSize
$downloadedCount = @($downloaded | Where-Object { $_.Status -eq "Downloaded" }).Count
Write-Host ""
Write-Host "Batch $Batch has $($driveIds.Count) IDs."
Write-Host "Downloaded $downloadedCount files to $Destination"
if($downloadedCount -gt 0){
  Write-Host "Next: powershell -ExecutionPolicy Bypass -File .\tools\import-firecuda-library.ps1 -Source `"$Destination`""
} else {
  Write-Host "No files landed in the FireCuda batch folder yet. Check Drive sharing or download the files through Chrome into this folder."
}
