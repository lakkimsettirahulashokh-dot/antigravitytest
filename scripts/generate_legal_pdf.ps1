# PowerShell PDF Generator for TechPath Legal & Compliance Framework
# Generates a valid, standards-compliant multi-page PDF 1.4 document

$outputPath = Join-Path $PSScriptRoot "..\TechPath_Legal_Compliance_and_Policies.pdf"
$outputPath = [System.IO.Path]::GetFullPath($outputPath)

Write-Host "Building TechPath Legal Compliance PDF: $outputPath..."

# Content definition: List of sections
$sections = @(
    @{
        Title = "01. Master Privacy Policy & DPDP Act 2023 Governance"
        Lines = @(
            "TechPath operates under strict compliance with India's Digital Personal Data Protection (DPDP) Act, 2023,",
            "the Information Technology Act, 2000, and global data privacy standards. All consent obtained from students",
            "is free, specific, informed, unconditional, and unambiguous.",
            "",
            "Categories of Personal Data Collected:",
            "- Name, email address, password hash, and Google OAuth UID for identity segregation.",
            "- Academic profile: Engineering department, semester, and target skills to tailor learning modules.",
            "- Profile photos uploaded voluntarily, stored in isolated Supabase storage buckets.",
            "- Uploaded lecture slides and PDF notes, parsed locally or in transient buffers solely for study assistance.",
            "- AI queries submitted to AI Doubt Solver and AI Copilot, proxied securely without student identity headers.",
            "- Mock interview audio and video data, processed locally in session memory without surveillance retention.",
            "- Diagnostic telemetry: Browser user-agent and IP addresses utilized solely for security rate limiting.",
            "",
            "Cross-Border Processing & Third Parties:",
            "Infrastructure is hosted on enterprise cloud providers (Supabase PostgreSQL, Google Gemini API, OpenAI).",
            "Any cross-border transit is governed under standard contractual clauses with end-to-end TLS 1.3 encryption.",
            "",
            "Withdrawal of Consent & Erasure:",
            "Students maintain the statutory right to withdraw consent at any time by emailing lakkimsettirahulashokh@gmail.com.",
            "Upon withdrawal, active sessions are revoked immediately and account records are purged within 30 days."
        )
    },
    @{
        Title = "02. Master Terms of Use & Conditions"
        Lines = @(
            "These Terms of Use govern all access to TechPath web applications, databases, and microservices.",
            "By accessing the platform, users agree to the following enforceable terms:",
            "",
            "- Account Responsibility: Users are responsible for preserving credential confidentiality.",
            "- Acceptable Academic Use: Intended strictly for legitimate undergraduate engineering preparation.",
            "- Prohibited Activities: Automated crawling, scraping, denial-of-service attempts, reverse engineering,",
            "  and posting abusive, fraudulent, or malicious payloads are strictly prohibited.",
            "- Account Suspension: TechPath reserves the right to suspend accounts breaching platform guidelines.",
            "- Availability: The platform is provided on an 'as is' and 'as available' basis without warranties of",
            "  uninterrupted availability during emergency maintenance or third-party outages.",
            "- Limitation of Liability: TechPath's direct liability is limited to actual fees paid in the preceding",
            "  twelve months, disclaiming consequential, indirect, or punitive damages.",
            "- Jurisdiction: Governed under the laws of India, subject to the exclusive jurisdiction of the competent",
            "  courts in Hyderabad / Andhra Pradesh, India."
        )
    },
    @{
        Title = "03. Artificial Intelligence (AI) Technology Disclaimers"
        Lines = @(
            "TechPath incorporates advanced generative AI models (including Google Gemini and OpenAI architectures).",
            "Users must understand the technical nature and limitations of artificial intelligence:",
            "",
            "- Inherent Probabilistic Output: AI models may generate factual inaccuracies, outdated programming",
            "  syntax, mathematical errors, or hallucinations.",
            "- Independent Verification Mandatory: TechPath is an educational assistant and does not guarantee the",
            "  accuracy, completeness, suitability, or outcome of AI responses. Students must verify critical",
            "  formulas, theorems, and code against authoritative textbooks and official university syllabi.",
            "- Module Disclaimers: Applies to AI Doubt Solver, AI Copilot, PDF Analyzer, AI Notes, and Mock Interview.",
            "- Non-Expert Advice: AI output does not constitute certified legal, medical, financial, or engineering counsel."
        )
    },
    @{
        Title = "04. Uploaded PDF & Content Copyright Governance"
        Lines = @(
            "The PDF Analyzer and AI Notes generator allow students to extract learning insights from study materials.",
            "",
            "- No Ownership Transfer: Uploading documents DOES NOT transfer copyright ownership to TechPath. TechPath",
            "  acquires no proprietary claims over student materials and has no right to resell or redistribute them.",
            "- User Warranty: Users warrant that they possess legal ownership, license, or valid fair-dealing rights.",
            "- Indian Copyright Act 1957: Section 52(1)(a)(i) permits fair dealing for private study, non-commercial",
            "  research, and academic instruction. TechPath is engineered strictly to support individual research.",
            "- Ephemeral Retention: Uploaded documents are parsed in temporary memory and are never made public.",
            "- Notice and Takedown: Copyright holders may submit infringement notifications to:",
            "  lakkimsettirahulashokh@gmail.com. We acknowledge receipt within 24-48 hours and act promptly."
        )
    },
    @{
        Title = "05. Third-Party Content, Links & YouTube Attribution"
        Lines = @(
            "TechPath references third-party educational resources to enrich undergraduate study pathways:",
            "",
            "- YouTube Video Player: External video lectures in LearnHub are embedded directly from YouTube via the",
            "  official player in compliance with YouTube Developer Terms. TechPath does not host or pirate video files.",
            "- No Implied Affiliation: Mentions of universities (IITs, MIT, Stanford) or corporate certifications",
            "  do not constitute endorsement, official sponsorship, or commercial affiliation.",
            "- Authentic Hyperlinks: TechPath only provides verified links and never fabricates false references."
        )
    },
    @{
        Title = "06. User Reviews & Community Standards"
        Lines = @(
            "TechPath features peer reviews to guide students across technical modules and career paths:",
            "",
            "- Truthful Representation: Reviews must reflect authentic, verifiable student experiences.",
            "- Prohibited Submissions: Defamatory, abusive, obscene, harassing, or commercial spam will be removed.",
            "- Moderation Authority: Platform administrators reserve the right to review and remove violating content.",
            "- Public Attribution: Submitting a review confirms consent to display chosen name, branch, and rating."
        )
    },
    @{
        Title = "07. Advertising & Sponsored Content Transparency"
        Lines = @(
            "Where commercial advertisements or sponsored educational resources appear on the platform:",
            "",
            "- Clear Labeling: All sponsored units are clearly marked with 'Sponsored' or 'Ad' labels.",
            "- No Disguised Ads: Advertisements will never be disguised as academic curricula or mandatory coursework.",
            "- Zero Artificial Clicks: Platform operators and users must not artificially click ads or deploy click-bots.",
            "- Policy Compliance: Ad operations adhere to Google AdSense guidelines and Indian advertising standards."
        )
    },
    @{
        Title = "08. Cookies, Local Storage & Telemetry Notice"
        Lines = @(
            "TechPath prioritizes client-side data isolation over intrusive tracking:",
            "",
            "- Essential Tokens: Secure cryptographic session tokens stored to maintain authenticated login sessions.",
            "- Client Preferences: LocalStorage keys preserving dark mode, 3D WebGL motion, and sidebar states.",
            "- Study Stopwatch: Local timestamps caching study duration counters across accidental browser reloads.",
            "- Zero Covert Tracking: TechPath does not sell tracking cookies, device fingerprints, or ad identifiers.",
            "- User Control: Students may wipe client storage at any time via browser settings."
        )
    },
    @{
        Title = "09. Account Deletion, Erasure & Retention Framework"
        Lines = @(
            "Students hold the statutory right to erase their accounts and purge all associated personal data:",
            "",
            "- Deletion Process: Send an email from your registered address to lakkimsettirahulashokh@gmail.com",
            "  with the subject 'Permanent Account Erasure Request'.",
            "- Backend Execution: Upon verification, profile records, saved study packs, and avatars are permanently",
            "  purged from PostgreSQL database storage within thirty (30) days.",
            "- Statutory Retention Exceptions: Minimal audit logs or dispute records are retained only where mandated",
            "  by statutory tax, security incident reporting, or cybersecurity laws."
        )
    },
    @{
        Title = "10. Platform Security & Data Protection Architecture"
        Lines = @(
            "TechPath employs a robust defense-in-depth architecture across all microservices:",
            "",
            "- Row Level Security (RLS): PostgreSQL database tables enforce strict tenant isolation policies so",
            "  students can access only their own records.",
            "- Cryptography: HTTPS/TLS 1.3 encryption in transit and AES-256 encryption at rest.",
            "- Zero Client API Keys: LLM provider secrets (Gemini, OpenAI) are strictly isolated on server runtimes.",
            "- File Validation: Uploads are restricted by MIME type and size capped at 25MB.",
            "- Vulnerability Reporting: Responsible researchers may report issues to lakkimsettirahulashokh@gmail.com."
        )
    },
    @{
        Title = "11. Statutory Grievance Redressal Mechanism & Officer"
        Lines = @(
            "Pursuant to Rule 3(2) of the Information Technology Intermediary Rules, 2021, and Section 13 of the",
            "DPDP Act, 2023, TechPath has appointed a designated Grievance Officer:",
            "",
            "- Grievance Officer: Rahul Ashok Lakkimsetti",
            "- Role: Lead Administrator & Data Protection Custodian",
            "- Official Desk: lakkimsettirahulashokh@gmail.com",
            "- Jurisdiction: Andhra Pradesh / Hyderabad, India",
            "- Service Level Agreements (SLAs): Formal acknowledgement within 24 to 48 hours; full investigation and",
            "  redressal communicated in writing within 15 calendar days.",
            "- Appellate Remedy: Appeals may be escalated to the Grievance Appellate Committee (GAC) or Data Protection Board."
        )
    },
    @{
        Title = "12. Intellectual Property & Brand Protection"
        Lines = @(
            "All original elements of TechPath are protected under intellectual property legislation:",
            "",
            "- Proprietary Assets: TechPath brand name, logos, typography, visual layouts, and curriculum hierarchies.",
            "- Code & Workflows: Source code, prompt pipelines, and IDE sandboxes are proprietary works.",
            "- Restrictions: Unauthorized mirroring, decompilation, scraping, or commercial resale is prohibited."
        )
    },
    @{
        Title = "13. Educational Outcomes, Career & Examination Disclaimers"
        Lines = @(
            "TechPath provides learning roadmaps and examination preparation materials for guidance only:",
            "",
            "- No Employment Guarantee: Mock interviews, roadmaps, and resume reviews do not guarantee jobs or placements.",
            "- No Academic Marks Warranty: Passing scores, college GPAs, and certifications depend on university grading.",
            "- Official Authority Verification: Exam dates, syllabus, and cutoffs for GATE, UPSC ESE, GRE, CAT, etc.,",
            "  must always be confirmed directly with official conducting bodies."
        )
    },
    @{
        Title = "14. Children's Privacy, Minor Users & Age Eligibility"
        Lines = @(
            "TechPath is engineered for undergraduate engineering, polytechnic, and university students:",
            "",
            "- Eligibility: Users must be at least 13 years old. Individuals under 13 are prohibited from registering.",
            "- Minors 13-18: Must review and accept these terms with parental or legal guardian consent.",
            "- Parental Inquiries: Guardians may contact lakkimsettirahulashokh@gmail.com for prompt account termination."
        )
    }
)

# Helper function to escape PDF string literal
function Escape-PdfString($str) {
    return $str.Replace("\", "\\").Replace("(", "\(").Replace(")", "\)")
}

# PDF Builder state
$objects = [System.Collections.ArrayList]::new()
$pageRefs = [System.Collections.ArrayList]::new()

# Object 1: Catalog (will be written at end)
# Object 2: Pages (will be written at end)
# Object 3: Font Helvetica
# Object 4: Font Helvetica-Bold

# Let's allocate IDs
# Obj 1: Catalog
# Obj 2: Pages
# Obj 3: Font Helvetica
# Obj 4: Font Helvetica-Bold
# For each page:
#   Obj 2n + 3: Page object
#   Obj 2n + 4: Content stream

# Let's layout pages
# Page dimension: 612 x 792 pt (US Letter)
# Printable height: 792 - 100 = 692 pt
# Y coordinates: top = 740, bottom = 60

$pagesContent = [System.Collections.ArrayList]::new()
$currentPageLines = [System.Collections.ArrayList]::new()
$currentY = 730

function Flush-Page {
    if ($currentPageLines.Count -gt 0) {
        $pagesContent.Add([string[]]$currentPageLines.ToArray()) | Out-Null
        $currentPageLines.Clear()
    }
}

# COVER PAGE
$coverLines = @(
    "BT",
    "/F2 26 Tf",
    "50 680 Td",
    "(TechPath AI Operating System) Tj",
    "ET",
    "BT",
    "/F2 16 Tf",
    "50 645 Td",
    "(Master Legal Compliance & Policy Charter) Tj",
    "ET",
    "BT",
    "/F1 11 Tf",
    "50 615 Td",
    "(Comprehensive 14-Point Governance Framework Under DPDP Act 2023 & IT Rules 2021) Tj",
    "ET",
    "BT",
    "/F1 10 Tf",
    "50 560 Td",
    "(Document Version: 2.4.0 Consolidated) Tj",
    "0 -18 Td",
    "(Effective Date: September 16, 2026) Tj",
    "0 -18 Td",
    "(Jurisdiction: Hyderabad / Andhra Pradesh, India) Tj",
    "0 -18 Td",
    "(Grievance Desk: lakkimsettirahulashokh@gmail.com) Tj",
    "0 -18 Td",
    "(Platform URL: https://TechPath.ai) Tj",
    "ET",
    "BT",
    "/F2 12 Tf",
    "50 430 Td",
    "(TABLE OF STATUTORY COMPLIANCE ARTICLES) Tj",
    "ET",
    "BT",
    "/F1 9 Tf",
    "50 405 Td",
    "(01. Master Privacy Policy & DPDP Act 2023 Governance) Tj",
    "0 -16 Td",
    "(02. Master Terms of Use & Platform Conditions) Tj",
    "0 -16 Td",
    "(03. Artificial Intelligence (AI) Technology Disclaimers) Tj",
    "0 -16 Td",
    "(04. Uploaded PDF & Content Copyright Governance) Tj",
    "0 -16 Td",
    "(05. Third-Party Content, Links & YouTube Attribution) Tj",
    "0 -16 Td",
    "(06. User Reviews & Community Standards) Tj",
    "0 -16 Td",
    "(07. Advertising & Sponsored Content Transparency) Tj",
    "0 -16 Td",
    "(08. Cookies, Local Storage & Telemetry Notice) Tj",
    "0 -16 Td",
    "(09. Account Deletion, Erasure & Retention Framework) Tj",
    "0 -16 Td",
    "(10. Platform Security & Data Protection Architecture) Tj",
    "0 -16 Td",
    "(11. Statutory Grievance Redressal Mechanism & Officer) Tj",
    "0 -16 Td",
    "(12. Intellectual Property & Brand Protection) Tj",
    "0 -16 Td",
    "(13. Educational Outcomes, Career & Examination Disclaimers) Tj",
    "0 -16 Td",
    "(14. Children's Privacy, Minor Users & Age Eligibility) Tj",
    "ET",
    "BT",
    "/F1 8.5 Tf",
    "50 100 Td",
    "(CONFIDENTIAL & STATUTORY CHARTER - PREPARED FOR REGULATORY GOVERNANCE & PUBLIC NOTICE) Tj",
    "ET"
)
$pagesContent.Add($coverLines) | Out-Null

# PAGE CONTENT GENERATION
$currentY = 720
$currentPageOps = [System.Collections.ArrayList]::new()

foreach ($sec in $sections) {
    # Check if section header fits (needs at least 100 pt)
    if ($currentY -lt 140) {
        $pagesContent.Add([string[]]$currentPageOps.ToArray()) | Out-Null
        $currentPageOps.Clear()
        $currentY = 720
    }

    # Section Header
    $escTitle = Escape-PdfString $sec.Title
    $currentPageOps.Add("BT /F2 12.5 Tf 50 $currentY Td ($escTitle) Tj ET") | Out-Null
    $currentY -= 20

    # Section Lines
    foreach ($line in $sec.Lines) {
        if ($currentY -lt 70) {
            $pagesContent.Add([string[]]$currentPageOps.ToArray()) | Out-Null
            $currentPageOps.Clear()
            $currentY = 720
        }

        if ([string]::IsNullOrWhiteSpace($line)) {
            $currentY -= 8
            continue
        }

        $escLine = Escape-PdfString $line
        $isBullet = $line.Trim().StartsWith("-")
        $font = if ($isBullet) { "/F1 9 Tf" } elseif ($line.EndsWith(":")) { "/F2 9.5 Tf" } else { "/F1 9 Tf" }
        $indent = if ($isBullet) { 60 } else { 50 }

        $currentPageOps.Add("BT $font $indent $currentY Td ($escLine) Tj ET") | Out-Null
        $currentY -= 13.5
    }
    $currentY -= 15
}

if ($currentPageOps.Count -gt 0) {
    $pagesContent.Add([string[]]$currentPageOps.ToArray()) | Out-Null
}

$totalPages = $pagesContent.Count

# Now compile raw PDF binary with proper xref table
$pdfStream = [System.IO.MemoryStream]::new()
$writer = [System.IO.StreamWriter]::new($pdfStream, [System.Text.Encoding]::ASCII)

$offsets = [System.Collections.Generic.List[long]]::new()
$offsets.Add(0) # 0th object

function Write-ObjHeader($objId) {
    $writer.Flush()
    $pos = $pdfStream.Position
    $offsets.Add($pos)
    $writer.WriteLine("$objId 0 obj")
}

$writer.WriteLine("%PDF-1.4")

# Obj 1: Catalog
Write-ObjHeader 1
$writer.WriteLine("<< /Type /Catalog /Pages 2 0 R >>")
$writer.WriteLine("endobj")

# Obj 2: Pages parent
Write-ObjHeader 2
$kids = (1..$totalPages | ForEach-Object { "$($_ * 2 + 3) 0 R" }) -join " "
$writer.WriteLine("<< /Type /Pages /Kids [$kids] /Count $totalPages >>")
$writer.WriteLine("endobj")

# Obj 3: Font Helvetica
Write-ObjHeader 3
$writer.WriteLine("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
$writer.WriteLine("endobj")

# Obj 4: Font Helvetica-Bold
Write-ObjHeader 4
$writer.WriteLine("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
$writer.WriteLine("endobj")

# Write each Page and its Content stream
for ($i = 0; $i -lt $totalPages; $i++) {
    $pageNum = $i + 1
    $pageObjId = $pageNum * 2 + 3
    $contentObjId = $pageObjId + 1

    # Page Object
    Write-ObjHeader $pageObjId
    $writer.WriteLine("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents $contentObjId 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>")
    $writer.WriteLine("endobj")

    # Content Stream Object
    $ops = [System.Collections.ArrayList]::new()
    $ops.AddRange($pagesContent[$i])

    # Add running header and footer for pages 2+
    if ($pageNum -gt 1) {
        $ops.Add("BT /F1 8 Tf 50 760 Td (TechPath AI OS - Master Legal & Compliance Framework v2.4) Tj ET") | Out-Null
        $ops.Add("BT /F1 8 Tf 480 760 Td (Statutory Notice) Tj ET") | Out-Null
        $ops.Add("BT /F1 8 Tf 50 35 Td (Grievance Officer: lakkimsettirahulashokh@gmail.com | Hyderabad, India) Tj ET") | Out-Null
        $ops.Add("BT /F1 8 Tf 510 35 Td (Page $pageNum of $totalPages) Tj ET") | Out-Null
    }

    $streamText = ($ops -join "`n") + "`n"
    $streamBytes = [System.Text.Encoding]::ASCII.GetBytes($streamText)
    $streamLen = $streamBytes.Length

    Write-ObjHeader $contentObjId
    $writer.WriteLine("<< /Length $streamLen >>")
    $writer.WriteLine("stream")
    $writer.Flush()
    $pdfStream.Write($streamBytes, 0, $streamLen)
    $writer.WriteLine("endstream")
    $writer.WriteLine("endobj")
}

# Write XREF Table
$writer.Flush()
$xrefOffset = $pdfStream.Position
$totalObjs = $totalPages * 2 + 5

$writer.WriteLine("xref")
$writer.WriteLine("0 $totalObjs")
$writer.WriteLine("0000000000 65535 f ")
for ($o = 1; $o -lt $totalObjs; $o++) {
    $off = $offsets[$o]
    $formatted = "{0:D10} 00000 n " -f $off
    $writer.WriteLine($formatted)
}

$writer.WriteLine("trailer")
$writer.WriteLine("<< /Size $totalObjs /Root 1 0 R >>")
$writer.WriteLine("startxref")
$writer.WriteLine($xrefOffset)
$writer.WriteLine("%%EOF")
$writer.Flush()

# Save output file
[System.IO.File]::WriteAllBytes($outputPath, $pdfStream.ToArray())

Write-Host "Success! Created PDF: $outputPath ($($pdfStream.Length) bytes, $totalPages pages)."
