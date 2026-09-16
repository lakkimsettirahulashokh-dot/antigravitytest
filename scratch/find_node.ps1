$paths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe",
    "C:\tools\node.exe"
)
foreach ($p in $paths) {
    if (Test-Path $p) {
        Write-Host "FOUND_NODE: $p"
        exit 0
    }
}

$fromPath = (Get-Command node.exe -ErrorAction SilentlyContinue).Source
if ($fromPath) {
    Write-Host "FOUND_NODE: $fromPath"
    exit 0
}

Write-Host "Node not found in standard paths"
