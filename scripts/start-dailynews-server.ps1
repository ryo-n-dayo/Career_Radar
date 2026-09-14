$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$logsDirectory = Join-Path $projectRoot "logs"
$nextCli = Join-Path $projectRoot "node_modules\next\dist\bin\next"
$buildId = Join-Path $projectRoot ".next\BUILD_ID"
$outputLog = Join-Path $logsDirectory "dailynews-ui-out.log"
$errorLog = Join-Path $logsDirectory "dailynews-ui-error.log"

New-Item -ItemType Directory -Path $logsDirectory -Force | Out-Null

# Do not create a second server when DailyNews is already open.
$listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
  Write-Output "DailyNews is already listening on port 3000 (PID $($listener.OwningProcess))."
  exit 0
}

if (-not (Test-Path -LiteralPath $nextCli)) {
  throw "Next.js was not found. Run npm install in $projectRoot first."
}

$node = Get-Command node -ErrorAction Stop
if (-not (Test-Path -LiteralPath $buildId)) {
  Write-Output "No production build exists. Building DailyNews first..."
  & $node.Source $nextCli build
  if ($LASTEXITCODE -ne 0) { throw "DailyNews build failed." }
}

Start-Process -FilePath $node.Source `
  -ArgumentList @($nextCli, "start", "-H", "127.0.0.1", "-p", "3000") `
  -WorkingDirectory $projectRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $outputLog `
  -RedirectStandardError $errorLog

Write-Output "Started DailyNews at http://127.0.0.1:3000."
