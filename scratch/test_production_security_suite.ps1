# ==============================================================================
# TechPath AI OS: Production Security & Compliance Verification Suite (PowerShell)
# ==============================================================================

Write-Host "=== Starting TechPath Production & Security Verification ===" -ForegroundColor Cyan
$passed = 0
$failed = 0

function Assert-Check {
    param(
        [string]$Name,
        [bool]$Condition,
        [string]$Details = ""
    )
    if ($Condition) {
        Write-Host "[PASS] $Name $Details" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "[FAIL] $Name $Details" -ForegroundColor Red
        $script:failed++
    }
}

# 1. Check PWA Files
$swExists = Test-Path "sw.js"
$manifestExists = Test-Path "manifest.json"
$offlineExists = Test-Path "offline.html"
Assert-Check "PWA Files Present (sw.js, manifest.json, offline.html)" ($swExists -and $manifestExists -and $offlineExists)

# 2. Check Single H1 per HTML File
$htmlFiles = Get-ChildItem -Path . -Filter "*.html"
$h1Issues = @()
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $h1Count = ([regex]::Matches($content, "<h1[\s>]", "IgnoreCase")).Count
    if ($h1Count -ne 1) {
        $h1Issues += "$($file.Name) ($h1Count)"
    }
}
Assert-Check "Strict Single <h1> per page across all $($htmlFiles.Count) HTML files" ($h1Issues.Count -eq 0) "Issues: $($h1Issues -join ', ')"

# 3. Check Legal Compliance PDF
$pdfPath = "C:\Users\LENOVO\.gemini\antigravity-ide\brain\811ddb29-3676-4e0c-bfa4-a3a04ad1a51b\TechPath_Legal_Compliance_and_Policies.pdf"
$pdfExists = Test-Path $pdfPath
$pdfSize = 0
if ($pdfExists) { $pdfSize = (Get-Item $pdfPath).Length }
Assert-Check "Legal Compliance PDF Generated and Valid Size" ($pdfExists -and $pdfSize -gt 10000) "Size: $pdfSize bytes"

# 4. Check Support Email Standardized (Verify NO old misspellings remain in repo)
$searchOldEmail = Get-ChildItem -Path . -Recurse -Include *.html,*.js,*.json,*.sql,*.md -Exclude node_modules*,test_production_security_suite.ps1 | Select-String "lakkimsettirahulashok@gmail.com"
Assert-Check "Zero Instances of Obsolete Email (strictly lakkimsettirahulashokh@gmail.com)" ($searchOldEmail.Count -eq 0) "Count: $($searchOldEmail.Count)"

# 5. Check Server Security Guardrails in server.js
$serverCode = Get-Content "server.js" -Raw
$hasPromptInjection = $serverCode.Contains("isPromptInjection")
$hasHourlyAiCap = $serverCode.Contains("ai_cap_")
$hasCsrfTokens = $serverCode.Contains("CSRF_TOKENS_STORE")
$hasPricingRoute = $serverCode.Contains("/api/pricing")
$hasRevokeOnPasswordReset = $serverCode.Contains("REVOKED_TOKENS_STORE.add(token)")
$hasHsts = $serverCode.Contains("Strict-Transport-Security")
$hasDirectListingBlock = $serverCode.Contains("isFile()")
$hasPayloadLimit = $serverCode.Contains("maxBytes") -and $serverCode.Contains("25 * 1024 * 1024") -and $serverCode.Contains("2 * 1024 * 1024")

Assert-Check "Prompt Injection Guardrail in server.js" $hasPromptInjection
Assert-Check "Hourly AI Usage Cap (30 req/hr) in server.js" $hasHourlyAiCap
Assert-Check "CSRF Protection & Token Store in server.js" $hasCsrfTokens
Assert-Check "Server-Side Pricing Endpoint in server.js" $hasPricingRoute
Assert-Check "Session Invalidation on Password Change in server.js" $hasRevokeOnPasswordReset
Assert-Check "HSTS Security Header in server.js" $hasHsts
Assert-Check "Directory Listing Block in server.js" $hasDirectListingBlock
Assert-Check "Request Size Limits (2MB JSON, 25MB OCR) in server.js" $hasPayloadLimit

# 6. Check Row Level Security SQL Migration
$migrationPath = "supabase\migrations\20260916_production_rls_security.sql"
$migrationExists = Test-Path $migrationPath
$migrationContent = if ($migrationExists) { Get-Content $migrationPath -Raw } else { "" }
$hasRlsEnforcement = $migrationContent.Contains("ENABLE ROW LEVEL SECURITY")
$hasAuditLogs = $migrationContent.Contains("security_audit_logs")
$hasAnonRevocation = $migrationContent.Contains("REVOKE ALL ON SCHEMA public FROM anon")
Assert-Check "RLS Master SQL Migration Created" ($migrationExists -and $hasRlsEnforcement -and $hasAuditLogs -and $hasAnonRevocation)

# 7. Check SEO & Schema Markup in js/seo-metadata.js
$seoCode = Get-Content "js\seo-metadata.js" -Raw
$hasJsonLd = $seoCode.Contains("application/ld+json")
$hasCanonicalInject = $seoCode.Contains("canonical")
Assert-Check "Schema Markup & Dynamic Canonical Injection in js/seo-metadata.js" ($hasJsonLd -and $hasCanonicalInject)

# 8. Check CSS Skeleton Loading & Tap Animations
$motionCss = Get-Content "css\motion.css" -Raw
$hasSkeleton = $motionCss.Contains(".skeleton")
$hasTapEffect = $motionCss.Contains(".tap-effect")
$hasRipple = $motionCss.Contains(".ripple-wave")
Assert-Check "Skeletons & Mobile Tap Animations in css/motion.css" ($hasSkeleton -and $hasTapEffect -and $hasRipple)

Write-Host "`n=== Verification Complete: $passed Passed, $failed Failed ===" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
if ($failed -gt 0) { exit 1 }
