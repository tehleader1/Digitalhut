import {execFileSync} from "node:child_process"
import {mkdirSync, writeFileSync} from "node:fs"
import {dirname, resolve} from "node:path"

const required = process.argv.includes("--required")
const skip = process.env.DIGITALHUT_SKIP_FIRECUDA_HEALTH === "1"
  || process.env.DIGITALHUT_CLOUD_BUILD === "true"
  || process.platform !== "win32"

const receiptPath = resolve("docs", "digitalhut-firecuda-health-latest.json")

function finish(receipt, {persist = true} = {}){
  console.log(JSON.stringify(receipt, null, 2))
  if(!persist) return
  mkdirSync(dirname(receiptPath), {recursive: true})
  writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8")
}

if(skip){
  finish({
    status: "skipped",
    reason: process.env.DIGITALHUT_CLOUD_BUILD === "true" ? "cloud-build-has-no-local-firecuda" : "non-windows-or-explicit-skip",
    required,
    checkedAt: new Date().toISOString()
  }, {persist: false})
  process.exit(0)
}

const agentPath = process.env.DIGITALHUT_FIRECUDA_PATH || "D:\\DigitalHutAgent"
const driveLetter = /^[a-z]:/i.test(agentPath) ? agentPath[0].toUpperCase() : "D"
const escapedPath = agentPath.replace(/'/g, "''")
const script = [
  "$ErrorActionPreference='Stop'",
  `$volume=Get-Volume -DriveLetter '${driveLetter}' -ErrorAction Stop`,
  `$partition=Get-Partition -DriveLetter '${driveLetter}' -ErrorAction Stop`,
  "$disk=Get-Disk -Number $partition.DiskNumber -ErrorAction Stop",
  "$boot=(Get-CimInstance Win32_OperatingSystem).LastBootUpTime",
  "$storageErrors=@(Get-WinEvent -FilterHashtable @{LogName='System';StartTime=$boot} -ErrorAction SilentlyContinue | Where-Object { $_.ProviderName -in @('disk','UASPStor') -and $_.Id -in @(7,51,129,153) })",
  `$path='${escapedPath}'`,
  "$pathReady=$false",
  "$enumerationReady=$false",
  "if($storageErrors.Count -eq 0){ $pathReady=Test-Path -LiteralPath $path -PathType Container; if($pathReady){ Get-ChildItem -LiteralPath $path -Force -ErrorAction Stop | Select-Object -First 1 | Out-Null; $enumerationReady=$true } }",
  "[pscustomobject]@{DriveLetter=$volume.DriveLetter;HealthStatus=[string]$volume.HealthStatus;OperationalStatus=([string[]]$volume.OperationalStatus -join ',');Size=$volume.Size;SizeRemaining=$volume.SizeRemaining;DiskNumber=$disk.Number;DiskName=$disk.FriendlyName;SerialNumber=$disk.SerialNumber;AgentPath=$path;PathReady=$pathReady;EnumerationReady=$enumerationReady;StorageErrorCount=$storageErrors.Count;StorageErrorIds=@($storageErrors | Select-Object -ExpandProperty Id -Unique)}|ConvertTo-Json -Compress"
].join("; ")

let disk
try {
  const output = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
    encoding: "utf8",
    windowsHide: true
  }).trim()
  disk = JSON.parse(output)
} catch(error){
  const errorText = String(error?.stderr || error?.message || error).trim()
  const accessDenied = /access denied|0x80041003/i.test(errorText)
  const receipt = {
    status: accessDenied ? "unavailable" : "unhealthy",
    required,
    agentPath,
    error: errorText,
    checkedAt: new Date().toISOString(),
    policy: accessDenied
      ? "The current process could not inspect FireCuda. Keep the last persisted hardware receipt; an explicit hardware audit is required for a new health claim."
      : "The hardware check failed before FireCuda health could be confirmed."
  }
  finish(receipt, {persist: required || !accessDenied})
  if(required) process.exit(1)
  process.exit(0)
}

const operational = String(disk.OperationalStatus || "")
const healthy = disk.HealthStatus === "Healthy"
  && /OK/i.test(operational)
  && !/Repair|Failed|Unknown|Degraded/i.test(operational)
  && Number(disk.StorageErrorCount || 0) === 0
  && disk.PathReady === true
  && disk.EnumerationReady === true

const receipt = {
  status: healthy ? "healthy" : "unhealthy",
  required,
  disk,
  freeTb: Number((Number(disk.SizeRemaining || 0) / 1e12).toFixed(2)),
  checkedAt: new Date().toISOString(),
  policy: "Read-only gate. A green volume label is insufficient when Windows has logged disk or UASP errors since boot. Repairs and dismounts require an explicit operator action."
}

finish(receipt)
if(required && !healthy) process.exit(1)
