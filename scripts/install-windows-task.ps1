$ErrorActionPreference = "Stop"
$taskName = "DailyNews Daily Scan"
$previousTaskName = "EventGathering Daily Scan"
$runnerPath = Join-Path $PSScriptRoot "run-daily-scan.ps1"

if (-not (Test-Path -LiteralPath $runnerPath)) {
  throw "Runner script was not found: $runnerPath"
}

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$runnerPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At "05:00"
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -WakeToRun -ExecutionTimeLimit (New-TimeSpan -Minutes 20)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

if (Get-ScheduledTask -TaskName $previousTaskName -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $previousTaskName -Confirm:$false
}

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "DailyNews checks approved public company pages once daily at 05:00." -Force | Out-Null
Write-Output "Registered Windows task '$taskName' for 05:00 daily."
