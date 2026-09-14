$ErrorActionPreference = "Stop"
$projectPath = Split-Path -Parent $PSScriptRoot
$logDirectory = Join-Path $projectPath "logs"
$logPath = Join-Path $logDirectory "daily-scan.log"

if (-not (Test-Path -LiteralPath $logDirectory)) {
  New-Item -ItemType Directory -Path $logDirectory | Out-Null
}

Set-Location -LiteralPath $projectPath
"`n[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] DailyNews daily scan" | Out-File -FilePath $logPath -Append -Encoding utf8
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" }
$tsxPath = Join-Path $projectPath "node_modules\tsx\dist\cli.mjs"

if (-not (Test-Path -LiteralPath $nodePath)) {
  "Node.js was not found. Scan aborted." | Out-File -FilePath $logPath -Append -Encoding utf8
  exit 1
}

$oldPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$scanOutput = & $nodePath $tsxPath (Join-Path $projectPath "scripts\scan-sources.ts") 2>&1
$scanExitCode = $LASTEXITCODE
$ErrorActionPreference = $oldPreference
$scanOutput | ForEach-Object { $_.ToString() } | Out-File -FilePath $logPath -Append -Encoding utf8
exit $scanExitCode
