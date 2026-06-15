param(
  [string]$Source = "D:\UserBackups\Downloads",
  [string]$Target = "public\models\firecuda-library"
)

$ErrorActionPreference = "Stop"
$targetPath = Resolve-Path -LiteralPath "." | ForEach-Object { Join-Path $_.Path $Target }
New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
$modelExtensions = @(".glb", ".gltf", ".obj", ".fbx", ".stl")

function Copy-ModelFile($path){
  $name = [System.IO.Path]::GetFileName($path).ToLowerInvariant() -replace "[^a-z0-9._-]", "_"
  $dest = Join-Path $targetPath $name
  Copy-Item -LiteralPath $path -Destination $dest -Force
  return Get-Item -LiteralPath $dest
}

function Import-Zip($path){
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $archive = [System.IO.Compression.ZipFile]::OpenRead($path)
  try{
    foreach($entry in $archive.Entries){
      if([string]::IsNullOrWhiteSpace($entry.Name)){ continue }
      $extension = [System.IO.Path]::GetExtension($entry.Name).ToLowerInvariant()
      if($extension -notin $modelExtensions){ continue }
      $name = $entry.Name.ToLowerInvariant() -replace "[^a-z0-9._-]", "_"
      $dest = Join-Path $targetPath $name
      [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $dest, $true)
      Get-Item -LiteralPath $dest
    }
  } finally {
    $archive.Dispose()
  }
}

$imported = @()
$files = Get-ChildItem -LiteralPath $Source -File -Recurse | Where-Object {
  $extension = $_.Extension.ToLowerInvariant()
  $extension -eq ".zip" -or $extension -in $modelExtensions
}
foreach($file in $files){
  if($file.Extension.ToLowerInvariant() -eq ".zip"){
    $imported += Import-Zip $file.FullName
  } else {
    $imported += Copy-ModelFile $file.FullName
  }
}

$validated = foreach($file in ($imported | Sort-Object FullName -Unique)){
  $magic = ""
  if($file.Extension.ToLowerInvariant() -eq ".glb"){
    $stream = [System.IO.File]::OpenRead($file.FullName)
    try{
      $buffer = New-Object byte[] 4
      [void]$stream.Read($buffer, 0, 4)
      $magic = [Text.Encoding]::ASCII.GetString($buffer)
    } finally {
      $stream.Dispose()
    }
  }
  [PSCustomObject]@{
    Name = $file.Name
    SizeMB = [math]::Round($file.Length / 1MB, 2)
    Type = $file.Extension.ToLowerInvariant()
    ValidGlb = if($file.Extension.ToLowerInvariant() -eq ".glb"){ $magic -eq "glTF" } else { $null }
  }
}

$validated | Format-Table -AutoSize
Write-Host ""
Write-Host "Imported $($validated.Count) model files into $targetPath"
Write-Host "Next: add category tags in src/lib/firecudaLibraryManifest.js"
