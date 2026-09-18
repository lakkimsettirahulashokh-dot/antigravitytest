$gitPaths = @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
)
$git = $null
foreach ($p in $gitPaths) {
    if (Test-Path $p) {
        $git = $p
        break
    }
}

if ($git) {
    Write-Host "Found git at: $git"
    & $git status --short
} else {
    Write-Host "Searching for git across drives..."
    $found = Get-Command "git.exe" -ErrorAction SilentlyContinue
    if ($found) {
        & $found.Source status --short
    } else {
        Write-Host "Git binary not found in standard paths."
    }
}
