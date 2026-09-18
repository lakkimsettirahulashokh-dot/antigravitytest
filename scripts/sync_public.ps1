# TechPath PowerShell Build & Public Sync Script
$ErrorActionPreference = "Stop"

$root = $PSScriptRoot | Split-Path -Parent
$publicDir = Join-Path $root "public"

Write-Host "[TechPath Sync] Syncing files to public distribution directory..."

if (!(Test-Path $publicDir)) {
    New-Item -ItemType Directory -Path $publicDir -Force | Out-Null
}

# 1. Sync directories: css, js, assets, data
$dirs = @("css", "js", "assets", "data")
foreach ($d in $dirs) {
    $src = Join-Path $root $d
    if (Test-Path $src) {
        $dest = Join-Path $publicDir $d
        if (!(Test-Path $dest)) {
            New-Item -ItemType Directory -Path $dest -Force | Out-Null
        }
        Copy-Item -Path (Join-Path $src "*") -Destination $dest -Recurse -Force
        Write-Host "  [OK] Synced $d/"
    }
}

# 2. Sync root files (HTML, sw.js, manifest.json, etc.)
Get-ChildItem -Path $root -File | Where-Object {
    $_.Extension -eq ".html" -or
    $_.Name -in @("favicon.ico", "manifest.json", "robots.txt", "sitemap.xml", "sw.js")
} | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $publicDir $_.Name) -Force
}
Write-Host "  [OK] Synced root HTML and asset files."

# 3. Create public/api/config fallback
$apiDir = Join-Path $publicDir "api"
if (!(Test-Path $apiDir)) {
    New-Item -ItemType Directory -Path $apiDir -Force | Out-Null
}

$configContent = @'
{
  "supabaseUrl": "https://kkdqahqcochicfvkfyan.supabase.co",
  "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZHFhaHFjb2NoaWNmdmtmeWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTMyNjEsImV4cCI6MjEwNDA4OTI2MX0.jMTz-nEpA-GfOqrGvYCC22gmZ7oiMe1e6Sf5z7GqDvc",
  "appUrl": "https://tech-path-six.vercel.app",
  "isSupabaseConfigured": true,
  "supportEmail": "lakkimsettirahulashokh@gmail.com"
}
'@

Set-Content -Path (Join-Path $apiDir "config") -Value $configContent -Encoding UTF8
Set-Content -Path (Join-Path $apiDir "config.json") -Value $configContent -Encoding UTF8
Write-Host "  [OK] Generated public/api/config static fallback."

Write-Host "[TechPath Sync] Complete! Public directory synchronized."
