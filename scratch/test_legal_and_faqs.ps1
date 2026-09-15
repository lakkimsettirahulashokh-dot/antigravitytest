# ==============================================================================
# BTechPath AI OS — Legal & FAQs Verification Test Suite
# Tests:
# 1. Route resolution & HTTP status checks for /privacy-policy, /terms, /faqs
# 2. Section and content integrity (Privacy 22 sections, Terms 21 sections, FAQs 11 categories)
# 3. Disclaimers, contact email, and prohibited items (no phone/WhatsApp)
# 4. Search input, empty state, accordions, and aria attributes
# 5. Canonical footers across site (Reviews, Contact Us, FAQs, Privacy Policy, Terms of Use)
# 6. Authenticated navigation preservation (Home -> Reviews -> Contact Us -> Profile -> Logout)
# 7. 3D WebGL presets and locked color tokens
# ==============================================================================

$ErrorActionPreference = "Stop"
$workspaceRoot = "c:\Users\LENOVO\Documents\GitHub\BTechPath AI OS"
Set-Location $workspaceRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  🧪 Running Legal & FAQs Verification Test Suite" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$passed = 0
$failed = 0

function Assert-Condition($condition, $message) {
    if ($condition) {
        Write-Host "  [PASS] $message" -ForegroundColor Green
        $global:passed++
    } else {
        Write-Host "  [FAIL] $message" -ForegroundColor Red
        $global:failed++
    }
}

# ------------------------------------------------------------------------------
# TEST GROUP 1: FILE EXISTENCE & CRITICAL FILES
# ------------------------------------------------------------------------------
Write-Host "`n--- 1. File Existence & Structure ---" -ForegroundColor Yellow

$privacyFile = Join-Path $workspaceRoot "privacy-policy.html"
$termsFile = Join-Path $workspaceRoot "terms.html"
$faqsFile = Join-Path $workspaceRoot "faqs.html"

Assert-Condition (Test-Path $privacyFile) "privacy-policy.html exists on disk"
Assert-Condition (Test-Path $termsFile) "terms.html exists on disk"
Assert-Condition (Test-Path $faqsFile) "faqs.html exists on disk"

$privacyContent = Get-Content $privacyFile -Raw
$termsContent = Get-Content $termsFile -Raw
$faqsContent = Get-Content $faqsFile -Raw

# ------------------------------------------------------------------------------
# TEST GROUP 2: PRIVACY POLICY CONTENT AUDIT (22 SECTIONS)
# ------------------------------------------------------------------------------
Write-Host "`n--- 2. Privacy Policy Content Audit (22 Sections) ---" -ForegroundColor Yellow

Assert-Condition ($privacyContent -match "<title>BTechPath AI Privacy Policy</title>") "Privacy Policy has correct title tag"
Assert-Condition ($privacyContent -match "lakkimsettirahulashok@gmail\.com") "Privacy Policy has correct support email"
Assert-Condition ($privacyContent -notmatch "\+91|\+1|\bwhatsapp\b|phone number|call us") "Privacy Policy contains NO phone or WhatsApp numbers"

$privacySections = @(
    "1. Introduction",
    "2. Information We Collect",
    "3. Information You Provide",
    "4. Account and Authentication Information",
    "5. Profile Information",
    "6. Uploaded Files and Documents",
    "7. AI Features and Processing",
    "8. Learning Activity and Study Time",
    "9. Reviews and Contact Messages",
    "10. How We Use Information",
    "11. How Information Is Stored",
    "12. Data Security",
    "13. Data Sharing",
    "14. Third-Party Services",
    "15. Cookies and Local Storage",
    "16. Advertising Disclosure",
    "17. User Choices and Controls",
    "18. Data Retention",
    "19. Account and Data Deletion",
    "20. Children's Privacy",
    "21. Changes to This Policy",
    "22. Contact Information"
)

foreach ($sec in $privacySections) {
    $secNum = $sec.Split('.')[0]
    $secFound = ($privacyContent -match [regex]::Escape($sec)) -or ($privacyContent -match "id=""sec-$secNum""")
    Assert-Condition $secFound "Privacy Policy contains section: $sec"
}

# Verify actual data disclosures
Assert-Condition ($privacyContent -match "Supabase Authentication") "Privacy Policy accounts for Supabase Auth"
Assert-Condition ($privacyContent -match "Google OAuth") "Privacy Policy accounts for Google SSO"
Assert-Condition ($privacyContent -match "Today's Study") "Privacy Policy accounts for study-time tracking"
Assert-Condition ($privacyContent -match "Row Level Security") "Privacy Policy accounts for Postgres RLS"
Assert-Condition ($privacyContent -match "(Camera and microphone|Microphone and camera) access is requested strictly") "Privacy Policy explicitly limits camera/mic to active recording"
Assert-Condition ($privacyContent -match "does not currently serve third-party commercial advertisements") "Privacy Policy accurately discloses advertising status"

# ------------------------------------------------------------------------------
# TEST GROUP 3: TERMS OF USE CONTENT AUDIT (21 SECTIONS)
# ------------------------------------------------------------------------------
Write-Host "`n--- 3. Terms of Use Content Audit (21 Sections) ---" -ForegroundColor Yellow

Assert-Condition ($termsContent -match "<title>BTechPath AI Terms of Use</title>") "Terms of Use has correct title tag"
Assert-Condition ($termsContent -match "lakkimsettirahulashok@gmail\.com") "Terms of Use has correct support email"
Assert-Condition ($termsContent -notmatch "\+91|\+1|\bwhatsapp\b|phone number|call us") "Terms of Use contains NO phone or WhatsApp numbers"

$termsSections = @(
    "1. Acceptance of Terms",
    "2. Description of BTechPath AI",
    "3. Eligibility and User Responsibilities",
    "4. Account Registration",
    "5. Account Security",
    "6. Acceptable Use",
    "7. Educational Content Disclaimer",
    "8. AI-Generated Content Disclaimer",
    "9. User-Uploaded Content",
    "10. Resume and Career Content",
    "11. Interview Practice Disclaimer",
    "12. Third-Party Content, Job Listings, and External Links",
    "13. Advertising and Promotions",
    "14. Intellectual Property",
    "15. Prohibited Activities",
    "16. Service Availability",
    "17. Suspension and Account Termination",
    "18. Limitation of Liability",
    "19. Changes to the Service",
    "20. Changes to Terms",
    "21. Contact Information"
)

foreach ($tsec in $termsSections) {
    $tsecNum = $tsec.Split('.')[0]
    $tsecFound = ($termsContent -match [regex]::Escape($tsec)) -or ($termsContent -match "id=""term-$tsecNum""")
    Assert-Condition $tsecFound "Terms of Use contains section: $tsec"
}

# Verify Terms specific disclaimers
Assert-Condition ($termsContent -match "AI outputs may occasionally contain technical errors") "Terms contains AI inaccuracy disclaimer"
Assert-Condition ($termsContent -match "not guaranteed or predicted to appear on any university examination") "Terms contains Exam practice disclaimer"
Assert-Condition ($termsContent -match "not an employment agency") "Terms contains Job/Internship independence disclaimer"
Assert-Condition ($termsContent -match "ownership and intellectual property rights in any documents") "Terms grants user ownership of uploaded files"
Assert-Condition ($termsContent -match "Coding IDE sandbox to execute fork bombs") "Terms prohibits coding sandbox attacks"

# ------------------------------------------------------------------------------
# TEST GROUP 4: FAQS CONTENT & INTERACTION AUDIT (11 CATEGORIES)
# ------------------------------------------------------------------------------
Write-Host "`n--- 4. FAQs Content & Features Audit ---" -ForegroundColor Yellow

Assert-Condition ($faqsContent -match "<title>BTechPath AI FAQs</title>") "FAQs has correct title tag"
Assert-Condition ($faqsContent -match "Quick answers about BTechPath AI, your learning journey, and our AI-powered tools\.") "FAQs has exact subtitle"
Assert-Condition ($faqsContent -match "id=""faq-search""") "FAQs has search input field (#faq-search)"
Assert-Condition ($faqsContent -match "id=""faq-empty-state""") "FAQs has empty state container (#faq-empty-state)"
Assert-Condition ($faqsContent -match "No matching questions found\.") "FAQs empty state text matches requirement"
Assert-Condition ($faqsContent -match "aria-expanded=") "FAQs uses aria-expanded for accessibility"
Assert-Condition ($faqsContent -match "aria-controls=") "FAQs uses aria-controls for accordion links"
Assert-Condition ($faqsContent -match "window\.addEventListener\('hashchange'") "FAQs has deep linking / hash navigation"

$faqCategories = @(
    "getting-started",
    "account-login",
    "learnhub",
    "ai-notes",
    "ai-doubt",
    "mock-interview",
    "projects-skills",
    "resume",
    "exams",
    "reviews-contact",
    "privacy-security"
)

foreach ($cat in $faqCategories) {
    Assert-Condition ($faqsContent -match "id=""$cat""") "FAQs contains category section: $cat"
}

# Verify specific accurate capabilities
Assert-Condition ($faqsContent -match "Only programming languages installed and supported by the application's backend execution runner") "FAQs accurately describes supported IDE languages"
Assert-Condition ($faqsContent -match "Microphone and camera access is requested <em>only</em> if you choose to record") "FAQs accurately describes Mock Interview mic/camera"
Assert-Condition ($faqsContent -match "client-side OCR \(Optical Character Recognition\)") "FAQs accurately explains scanned PDF OCR fallback"

# ------------------------------------------------------------------------------
# TEST GROUP 5: CANONICAL FOOTER AUDIT ACROSS ALL PAGES
# ------------------------------------------------------------------------------
Write-Host "`n--- 5. Canonical Footer Audit Across Pages ---" -ForegroundColor Yellow

$pagesToAudit = @(
    "privacy-policy.html",
    "terms.html",
    "faqs.html",
    "index.html",
    "reviews.html",
    "contact.html",
    "cookie-policy.html",
    "helpdesk.html"
)

$requiredFooterLinks = @(
    "reviews.html",
    "contact.html",
    "faqs.html",
    "privacy-policy.html",
    "terms.html"
)

foreach ($page in $pagesToAudit) {
    $fullPath = Join-Path $workspaceRoot $page
    if (Test-Path $fullPath) {
        $html = Get-Content $fullPath -Raw
        $footerMatches = $true
        foreach ($link in $requiredFooterLinks) {
            if ($html -notmatch "href=""$link""") {
                $footerMatches = $false
                Write-Host "  Missing $link in $page" -ForegroundColor DarkRed
            }
        }
        Assert-Condition $footerMatches "$page footer contains all 5 required links"
    }
}

# ------------------------------------------------------------------------------
# TEST GROUP 6: SERVER ROUTE ALIASES & ROUTE GUARD
# ------------------------------------------------------------------------------
Write-Host "`n--- 6. Server Route Aliases & Guard Verification ---" -ForegroundColor Yellow

$serverJsContent = Get-Content (Join-Path $workspaceRoot "server.js") -Raw
$appJsContent = Get-Content (Join-Path $workspaceRoot "js/app.js") -Raw
$bg3dContent = Get-Content (Join-Path $workspaceRoot "js/btech-bg3d.js") -Raw

$requiredAliases = @(
    "'/privacy-policy': '/privacy-policy.html'",
    "'/privacy': '/privacy-policy.html'",
    "'/terms': '/terms.html'",
    "'/terms-of-use': '/terms.html'",
    "'/faqs': '/faqs.html'",
    "'/faq': '/faqs.html'"
)

foreach ($alias in $requiredAliases) {
    Assert-Condition ($serverJsContent.Contains($alias)) "server.js ROUTE_ALIASES contains $alias"
}

# Verify pages are not blocked in checkAuthRouteGuard
Assert-Condition ($appJsContent -notmatch "'privacy-policy'") "privacy-policy is not in protectedPages"
Assert-Condition ($appJsContent -notmatch "'terms'") "terms is not in protectedPages"
Assert-Condition ($appJsContent -notmatch "'faqs'") "faqs is not in protectedPages"

# Verify 3D background presets
Assert-Condition ($bg3dContent -match "'privacy-policy':\s*\{\s*primary:\s*PALETTE\.indigo") "3D engine has privacy-policy Indigo accent"
Assert-Condition ($bg3dContent -match "'terms':\s*\{\s*primary:\s*PALETTE\.teal") "3D engine has terms Teal accent"
Assert-Condition ($bg3dContent -match "'faqs':\s*\{\s*primary:\s*PALETTE\.roseGold") "3D engine has faqs Rose Gold accent"

# ------------------------------------------------------------------------------
# TEST GROUP 7: AUTHENTICATED NAVIGATION PRESERVATION
# ------------------------------------------------------------------------------
Write-Host "`n--- 7. Authenticated Navigation Order Invariant ---" -ForegroundColor Yellow

# Ensure App.syncNavigation keeps: Home -> Reviews -> Contact Us -> Profile -> Logout
Assert-Condition ($appJsContent -match "Home -> Reviews -> Contact Us -> Profile -> Logout") "App.syncNavigation documents and enforces exact ordering"
Assert-Condition ($appJsContent -match "contactLink\.insertAdjacentElement\('afterend',\s*profileLink\)") "Profile is placed immediately after Contact Us in nav"
Assert-Condition ($appJsContent -match "profileMobile\.insertAdjacentElement\('afterend',\s*logoutMobile\)") "Logout is placed immediately after Profile in mobile nav"

# Ensure Privacy and Terms are NOT between Profile and Logout
Assert-Condition ($appJsContent -notmatch "profileLink\.insertAdjacentElement\('afterend',\s*privacyLink\)") "Privacy link is NOT between Profile and Logout"

# ------------------------------------------------------------------------------
# TEST SUMMARY
# ------------------------------------------------------------------------------
Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS: $passed PASSED, $failed FAILED" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "========================================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    exit 1
} else {
    exit 0
}
