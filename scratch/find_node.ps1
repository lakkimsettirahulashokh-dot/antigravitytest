np$paths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\node\node.exe",
    "$env:APPDATA\nvm\default\node.exe",
    "$env:ProgramW6432\nodejs\node.exe"
)
foreach ($p in $paths) {
    if (Test-Path $p) {
        Write-Host "FOUND: $p"
        exit 0
    }
}
Write-Host "NONE_FOUND"
