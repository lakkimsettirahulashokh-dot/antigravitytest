$gitExe = "C:\Users\LENOVO\AppData\Local\GitHubDesktop\app-3.6.5\resources\app\git\cmd\git.exe"
Write-Host "Git path: $gitExe"
if (Test-Path $gitExe) {
    Write-Host "Git exists"
} else {
    Write-Host "Git NOT found"
}

Write-Host "Checking .git directory:"
if (Test-Path ".git") {
    Write-Host ".git directory exists"
} else {
    Write-Host ".git directory does NOT exist"
}

Write-Host "Checking loose files in root:"
Get-ChildItem -Path . -Force | Where-Object { $_.Name -in @('HEAD', 'config', 'index', 'objects', 'refs', 'hooks', 'info', 'COMMIT_EDITMSG', 'description') } | Select-Object Name, Mode, Length | Format-Table -AutoSize
