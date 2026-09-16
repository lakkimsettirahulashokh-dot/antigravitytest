# ==============================================================================
# Master Verification Test for TechPath 14 Legal Compliance Policies & PDF
# ==============================================================================

$ErrorActionPreference = "Stop"
$workspaceRoot = "c:\Users\LENOVO\Documents\GitHub\BTechPath AI OS"
Set-Location $workspaceRoot

$passed = 0
$failed = 0

function Assert-Test($cond, $msg) {
    if ($cond) {
        Write-Host "  [PASS] $msg" -ForegroundColor Green
        $global:passed++
    } else {
        Write-Host "  [FAIL] $msg" -ForegroundColor Red
        $global:failed++
    }
}

Write-Host "`n=== Testing Legal Compliance Documents & Pages ===" -ForegroundColor Cyan

# 1. File existence
$files = @(
    "privacy-policy.html",
    "terms.html",
    "cookie-policy.html",
    "disclaimer.html",
    "copyright-policy.html",
    "grievance.html",
    "security.html",
    "legal-print.html",
    "TechPath_Legal_Compliance_and_Policies.pdf"
)

foreach ($f in $files) {
    $exists = Test-Path (Join-Path $workspaceRoot $f)
    Assert-Test $exists "File exists: $f"
}

# 2. PDF Verification
$pdfPath = Join-Path $workspaceRoot "TechPath_Legal_Compliance_and_Policies.pdf"
$pdfBytes = [System.IO.File]::ReadAllBytes($pdfPath)
Assert-Test ($pdfBytes.Length -gt 15000) "PDF file size is healthy ($($pdfBytes.Length) bytes)"
$pdfHeader = [System.Text.Encoding]::ASCII.GetString($pdfBytes[0..7])
Assert-Test ($pdfHeader.StartsWith("%PDF-1.4")) "PDF starts with valid %PDF-1.4 magic bytes"
$pdfTail = [System.Text.Encoding]::ASCII.GetString($pdfBytes[($pdfBytes.Length - 100)..($pdfBytes.Length - 1)])
Assert-Test ($pdfTail.Contains("%%EOF")) "PDF ends with valid %%EOF trailer"

# 3. Content Integrity Checks
$privacy = Get-Content (Join-Path $workspaceRoot "privacy-policy.html") -Raw
$terms = Get-Content (Join-Path $workspaceRoot "terms.html") -Raw
$disclaimer = Get-Content (Join-Path $workspaceRoot "disclaimer.html") -Raw
$copyright = Get-Content (Join-Path $workspaceRoot "copyright-policy.html") -Raw
$grievance = Get-Content (Join-Path $workspaceRoot "grievance.html") -Raw
$security = Get-Content (Join-Path $workspaceRoot "security.html") -Raw

Assert-Test ($privacy -match "DPDP Act") "Privacy policy cites DPDP Act"
Assert-Test ($disclaimer -match "AI Doubt Solver" -and $disclaimer -match "Mock Interview") "Disclaimer covers AI Doubt Solver & Mock Interview"
Assert-Test ($copyright -match "Indian Copyright Act" -and $copyright -match "Section 52") "Copyright policy cites Indian Copyright Act Sec 52"
Assert-Test ($grievance -match "Rahul Ashok Lakkimsetti") "Grievance officer name is published"
Assert-Test ($grievance -match "IT Rules 2021" -and $grievance -match "DPDP Act") "Grievance redressal cites statutory rules"
Assert-Test ($security -match "Row Level Security" -and $security -match "RLS") "Security page covers Supabase RLS tenant isolation"

# 4. Prohibited numbers check
$allLegalText = "$privacy $terms $disclaimer $copyright $grievance $security"
Assert-Test ($allLegalText -notmatch "\+91|\+1|\bwhatsapp\b|call us on") "No fake phone or WhatsApp numbers present"
Assert-Test ($allLegalText -match "lakkimsettirahulashokh@gmail\.com") "Official contact email is consistently present"

Write-Host "`n========================================================"
Write-Host "  Results: $passed Passed, $failed Failed" -ForegroundColor Cyan
Write-Host "========================================================`n"

if ($failed -gt 0) { exit 1 }
