$ErrorActionPreference = "Stop"

$taskName = "DailyNews Local Server"
$runnerPath = Join-Path $PSScriptRoot "start-dailynews-server.ps1"

if (-not (Test-Path -LiteralPath $runnerPath)) {
  throw "Startup script was not found: $runnerPath"
}

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$runnerPath`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

try {
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Starts the local DailyNews server at Windows sign-in." -Force | Out-Null
  Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name $taskName -ErrorAction SilentlyContinue
  Write-Output "Registered Windows task '$taskName' to start DailyNews when you sign in."
} catch {
  # Some personal Windows setups deny Scheduled Task registration without elevation.
  # HKCU\\Run has the same sign-in behavior for this user and needs no administrator access.
  $runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
  $command = "powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$runnerPath`""
  New-ItemProperty -Path $runKey -Name $taskName -PropertyType String -Value $command -Force | Out-Null
  Write-Output "Scheduled Task registration was denied. Registered DailyNews in this user's Windows startup items instead."
}
