param([Parameter(Mandatory=$true)][string]$ExpectedSha)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$env:DIGITALHUT_GIT = 'C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'
$node = 'C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$runner = Join-Path $PSScriptRoot 'digitalhut-social-autopublisher.mjs'
$log = Join-Path $root '.cache\digitalhut-social-autopublisher.log'

Set-Location -LiteralPath $root
for($attempt = 1; $attempt -le 24; $attempt++) {
  Start-Sleep -Seconds 30
  $output = & $node $runner "--expected-sha=$ExpectedSha" 2>&1
  "$(Get-Date -Format o) release=$ExpectedSha attempt=$attempt $output" | Add-Content -LiteralPath $log
  if($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  $result = $output | ConvertFrom-Json
  if($result.ok -or $result.reason -in @('already-received','not-release-shaped','sensitive-or-unsupported-claim','daily-frequency-cap','adaptive-speed-limit')) { exit 0 }
}

"$(Get-Date -Format o) release=$ExpectedSha stopped=verification-window-expired" | Add-Content -LiteralPath $log
exit 1
