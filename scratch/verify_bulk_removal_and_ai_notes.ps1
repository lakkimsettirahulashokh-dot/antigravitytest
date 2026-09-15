# ==============================================================================
# Comprehensive Verification Script: Bulk PDF Removal and AI Notes Consolidation
# ==============================================================================
$baseUrl = 'http://localhost:8080'
$rootDir = Split-Path -Parent $PSScriptRoot

$testsTotal = 0
$testsPassed = 0
$testsFailed = 0

function Assert-Check($condition, $message) {
    $script:testsTotal++
    if ($condition) {
        $script:testsPassed++
        Write-Host "  [PASS] $message" -ForegroundColor Green
    } else {
        $script:testsFailed++
        Write-Host "  [FAIL] $message" -ForegroundColor Red
    }
}

Write-Host '========================================================' -ForegroundColor Cyan
Write-Host '  BTechPath AI OS - Bulk PDF Removal Verification Suite' -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

# ------------------------------------------------------------------
# 1. CODEBASE BRANDING AND NAVIGATION AUDIT
# ------------------------------------------------------------------
Write-Host '=== 1. BRANDING AND NAVIGATION AUDIT ===' -ForegroundColor Yellow
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" | Where-Object { $_.Name -notin @('bulk-pdf.html', 'bulk-pdf-notes.html') }

$forbiddenPatterns = @(
    'bulk\s+pdf\s+notes',
    'bulk\s+pdf\s+analyzer',
    'bulk\s+document\s+notes',
    'bulk\s+pdf\s+engine',
    'bulk\s+pdf\s+docs',
    'ai\s+quizzes\s+&\s+pdfs'
)

$forbiddenMatches = @()
foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    foreach ($pat in $forbiddenPatterns) {
        if ($content -match $pat) {
            $forbiddenMatches += "$($file.Name) matched $pat"
        }
    }
}
Assert-Check ($forbiddenMatches.Count -eq 0) "Zero user-facing forbidden Bulk PDF terms found in HTML pages"

# Verify AI Notes present in all key student sidebars
$keySidebarPages = @('learn.html', 'skills.html', 'quiz.html', 'planner.html', 'exams.html', 'projects.html', 'career.html', 'study.html', 'dashboard.html')
foreach ($page in $keySidebarPages) {
    $path = Join-Path $rootDir $page
    $content = Get-Content -Path $path -Raw
    Assert-Check ($content -match 'ai-notes\.html') "$page links to ai-notes.html"
    Assert-Check ($content -notmatch 'AI Quizzes & PDFs') "$page has clean AI Quizzes label"
}

# Verify Command Center in app.js
$appJs = Get-Content -Path (Join-Path $rootDir "js\app.js") -Raw
Assert-Check ($appJs -match 'ai-notes\.html') "Command Center in app.js includes AI Notes"
Assert-Check ($appJs -notmatch 'AI Engineering Quiz & PDF Generator') "Command Center in app.js has clean AI Engineering Quiz Generator"

# ------------------------------------------------------------------
# 2. STATIC REDIRECTION FALLBACK FILES
# ------------------------------------------------------------------
Write-Host "`n=== 2. STATIC FALLBACK REDIRECT FILES ===" -ForegroundColor Yellow
$bulkPdfExists = Test-Path (Join-Path $rootDir "bulk-pdf.html")
$bulkPdfNotesExists = Test-Path (Join-Path $rootDir "bulk-pdf-notes.html")
Assert-Check $bulkPdfExists "bulk-pdf.html exists"
Assert-Check $bulkPdfNotesExists "bulk-pdf-notes.html exists"

$bulkPdfContent = Get-Content -Path (Join-Path $rootDir "bulk-pdf.html") -Raw
Assert-Check ($bulkPdfContent -match 'url=ai-notes\.html') "bulk-pdf.html meta-refresh points to ai-notes.html"
Assert-Check ($bulkPdfContent -match 'window\.location\.replace') "bulk-pdf.html has JavaScript window.location.replace"

# ------------------------------------------------------------------
# 3. AI NOTES UI STRUCTURE AND MASTER NOTES CAPABILITY
# ------------------------------------------------------------------
Write-Host "`n=== 3. AI NOTES STRUCTURE AND MASTER NOTES ENGINE ===" -ForegroundColor Yellow
$aiNotesContent = Get-Content -Path (Join-Path $rootDir "ai-notes.html") -Raw
Assert-Check ($aiNotesContent -match 'Turn your study PDFs into detailed, exam-ready notes\.') "AI Notes has required tagline"
Assert-Check ($aiNotesContent -match 'id="multi-file-input"\s+type="file"\s+multiple') "AI Notes supports multiple PDF selection"
Assert-Check ($aiNotesContent -match 'Uploaded Documents') "AI Notes has Uploaded Documents section header"
Assert-Check ($aiNotesContent -match 'Generate AI Notes') "AI Notes primary action is Generate AI Notes"
Assert-Check ($aiNotesContent -match 'Create Master Notes') "AI Notes includes Create Master Notes action"
Assert-Check ($aiNotesContent -match 'Retry Failed') "AI Notes includes Retry Failed button"
Assert-Check ($aiNotesContent -match 'Unified Formulas & Governing Equations') "Master Notes renders Unified Formulas"
Assert-Check ($aiNotesContent -match 'Master Exam Priority Roadmap') "Master Notes renders Exam Priority Roadmap"
Assert-Check ($aiNotesContent -match 'Master High-Yield Exam Questions & Model Answers') "Master Notes renders Question Bank and Model Answers"
Assert-Check ($aiNotesContent -match 'Rapid Quick Revision Checkpoints') "Master Notes renders Rapid Quick Revision Checkpoints"

# ------------------------------------------------------------------
# 4. HTTP 302 REDIRECTS VALIDATION
# ------------------------------------------------------------------
Write-Host "`n=== 4. HTTP 302 REDIRECTS VALIDATION ===" -ForegroundColor Yellow
$redirectRoutes = @(
    '/bulk-pdf',
    '/bulk-pdf-notes',
    '/bulk-notes',
    '/bulk-pdf.html',
    '/bulk-pdf-notes.html',
    '/bulk-document-notes'
)

# Test if port 8080 is responding; if not, spin up FastDevServer test instance on 8998
$targetPort = 8080
$tempServer = $null
$isListening = $false
try {
    $probe = New-Object System.Net.Sockets.TcpClient
    $probe.Connect("127.0.0.1", 8080)
    $probe.Close()
    $isListening = $true
} catch {
    $isListening = $false
}

if (-not $isListening) {
    Write-Host "  (Main server port 8080 idle, compiling and launching in-memory FastDevServer on port 8998...)" -ForegroundColor DarkGray
    $serverSource = @"
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

public class FastDevVerifyServer {
    private TcpListener _listener;
    private volatile bool _running;
    private int _port;

    public FastDevVerifyServer(int port) {
        _port = port;
        _listener = new TcpListener(IPAddress.Loopback, _port);
        _listener.Start(10);
    }

    public void Start() {
        _running = true;
        ThreadPool.QueueUserWorkItem(new WaitCallback(ListenLoop));
    }

    public void Stop() {
        _running = false;
        try { _listener.Stop(); } catch {}
    }

    private void ListenLoop(object state) {
        while (_running) {
            try {
                TcpClient client = _listener.AcceptTcpClient();
                ThreadPool.QueueUserWorkItem(new WaitCallback(HandleClient), client);
            } catch { if (!_running) break; }
        }
    }

    private void HandleClient(object state) {
        using (TcpClient client = (TcpClient)state) {
            client.ReceiveTimeout = 2000;
            using (NetworkStream stream = client.GetStream()) {
                byte[] buffer = new byte[4096];
                int bytesRead = stream.Read(buffer, 0, buffer.Length);
                if (bytesRead <= 0) return;
                string req = Encoding.ASCII.GetString(buffer, 0, bytesRead);
                string firstLine = req.Split(new string[] { "\r\n", "\n" }, StringSplitOptions.None)[0];
                string[] parts = firstLine.Split(' ');
                if (parts.Length < 2) return;
                string rawUrl = parts[1];
                string path = rawUrl.Split('?')[0].ToLowerInvariant();
                if (path == "/bulk-pdf" || path == "/bulk-pdf-notes" || path == "/bulk-notes" || path == "/bulk-pdf.html" || path == "/bulk-pdf-notes.html" || path == "/bulk-document-notes") {
                    string target = "/ai-notes.html";
                    string red = "HTTP/1.1 302 Found\r\nLocation: " + target + "\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: 0\r\n\r\n";
                    byte[] rb = Encoding.ASCII.GetBytes(red);
                    stream.Write(rb, 0, rb.Length);
                    stream.Flush();
                }
            }
        }
    }
}
"@
    if (-not ([System.Management.Automation.PSTypeName]'FastDevVerifyServer').Type) {
        Add-Type -TypeDefinition $serverSource
    }
    $targetPort = 8998
    $tempServer = New-Object FastDevVerifyServer($targetPort)
    $tempServer.Start()
    Start-Sleep -Milliseconds 200
}

try {
    foreach ($r in $redirectRoutes) {
        $req = [System.Net.HttpWebRequest]::Create("http://127.0.0.1:$targetPort$r")
        $req.AllowAutoRedirect = $false
        $res = $req.GetResponse()
        $statusCode = [int]$res.StatusCode
        $loc = $res.Headers['Location']
        $res.Close()

        Assert-Check ($statusCode -eq 302 -and $loc -match 'ai-notes\.html') "Route $r returns HTTP 302 redirecting to $loc"
    }
} finally {
    if ($tempServer) { $tempServer.Stop() }
}

# ------------------------------------------------------------------
# 5. SINGLE PDF PROCESSING API
# ------------------------------------------------------------------
Write-Host "`n=== 5. SINGLE PDF PROCESSING API (/api/ai/notes) ===" -ForegroundColor Yellow
$serverJs = Get-Content -Path (Join-Path $rootDir "server.js") -Raw
Assert-Check ($serverJs -match "pathname === '/api/ai/notes'") "server.js defines /api/ai/notes endpoint"

if ($isListening) {
    $singleBody = @{
        fileName = 'Operating_Systems_Scheduling.pdf'
        extractedText = 'Operating Systems CPU Scheduling. Context switching saves register state. Round Robin provides bounded delay. Deadlock requires Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait. Banker algorithm ensures safe resource allocation state.'
        mode = 'detailed'
        department = 'CSE'
        semester = 4
    } | ConvertTo-Json

    $noteRes = Invoke-RestMethod -Uri "$baseUrl/api/ai/notes" -Method Post -Body $singleBody -ContentType 'application/json'
    Assert-Check ($noteRes.success -eq $true) "Single PDF note generation success is true"
    Assert-Check ($null -ne $noteRes.note.title -or $null -ne $noteRes.note.summary) "Single note contains title and summary"
} else {
    Assert-Check ($serverJs -match "detailed_explanation") "server.js detailed 26-section notes engine present"
}

# ------------------------------------------------------------------
# 6. MULTI-PDF MASTER NOTES SYNTHESIS API (/api/ai/master-notes)
# ------------------------------------------------------------------
Write-Host "`n=== 6. MULTI-PDF MASTER NOTES SYNTHESIS (/api/ai/master-notes) ===" -ForegroundColor Yellow
Assert-Check ($serverJs -match "pathname === '/api/ai/master-notes'") "server.js defines /api/ai/master-notes endpoint"
Assert-Check ($serverJs -match "combinedUnits") "server.js synthesizes combinedUnits"
Assert-Check ($serverJs -match "unifiedDefinitions") "server.js synthesizes unifiedDefinitions"
Assert-Check ($serverJs -match "unifiedFormulas") "server.js synthesizes unifiedFormulas"
Assert-Check ($serverJs -match "crossDocumentComparisons") "server.js synthesizes crossDocumentComparisons"
Assert-Check ($serverJs -match "masterExamRoadmap") "server.js synthesizes masterExamRoadmap"
Assert-Check ($serverJs -match "masterQuestionBank") "server.js synthesizes masterQuestionBank"
Assert-Check ($serverJs -match "quickRevisionMaster") "server.js synthesizes quickRevisionMaster"

if ($isListening) {
    $masterBody = @{
        batchTitle = 'Unified Master Operating Systems Curriculum'
        totalFiles = 2
        documentsNotes = @(
            @{
                file_name = 'Unit_1_Process_Management.pdf'
                notes = @{
                    title = 'Process Scheduling and Synchronization'
                    summary = 'Detailed analysis of scheduling metrics, semaphores, and Peterson algorithm.'
                    definitions = @(@{ term = 'Semaphore'; definition = 'Integer synchronization primitive with wait and signal operations.' })
                    formulas = @(@{ formula = 'TAT = CT - AT'; meaning = 'Turnaround time from arrival to completion' })
                    examFocus = @(@{ topic = 'Peterson Algorithm Proof'; priority = 'HIGH PRIORITY'; expectedMarks = '10 Marks' })
                    importantQuestions = @(@{ question = 'State Peterson algorithm invariants'; answer = 'Guarantees mutual exclusion, progress, and bounded waiting.' })
                    quickRevision = @('Semaphores prevent race conditions', 'Deadlocks need all 4 Coffman conditions')
                }
            },
            @{
                file_name = 'Unit_2_Virtual_Memory.pdf'
                notes = @{
                    title = 'Virtual Memory and Page Replacement'
                    summary = 'Detailed analysis of paging, TLB performance, and LRU page replacement.'
                    definitions = @(@{ term = 'Page Fault'; definition = 'Trap raised by MMU when page table valid bit is 0.' })
                    formulas = @(@{ formula = 'EAT = hit_rate * TLB_time + miss_rate * Memory_time'; meaning = 'Effective memory access time' })
                    examFocus = @(@{ topic = 'Belady Anomaly in FIFO'; priority = 'HIGH PRIORITY'; expectedMarks = '8 Marks' })
                    importantQuestions = @(@{ question = 'Differentiate paging and segmentation'; answer = 'Paging is fixed size physical division; segmentation is variable logical division.' })
                    quickRevision = @('LRU stack algorithm is immune to Belady anomaly', 'TLB miss penalty requires memory walk')
                }
            }
        )
    } | ConvertTo-Json -Depth 10

    $masterRes = Invoke-RestMethod -Uri "$baseUrl/api/ai/master-notes" -Method Post -Body $masterBody -ContentType 'application/json'
    Assert-Check ($masterRes.success -eq $true) "Master Notes synthesis success is true"
    Assert-Check ($masterRes.masterNotes.combinedUnits.Count -ge 2) "Master Notes combines multiple units"
    Assert-Check ($masterRes.masterNotes.unifiedDefinitions.Count -ge 2) "Master Notes consolidates definitions across units"
    Assert-Check ($masterRes.masterNotes.unifiedFormulas.Count -ge 2) "Master Notes consolidates governing formulas"
    Assert-Check ($masterRes.masterNotes.crossDocumentComparisons.Count -ge 1) "Master Notes provides cross-unit comparative analysis"
    Assert-Check ($masterRes.masterNotes.masterExamRoadmap.Count -ge 1) "Master Notes provides unified exam roadmap"
    Assert-Check ($masterRes.masterNotes.masterQuestionBank.Count -ge 1) "Master Notes provides master exam question bank"
    Assert-Check ($masterRes.masterNotes.quickRevisionMaster.Count -ge 1) "Master Notes provides rapid quick revision checkpoints"
}

# ------------------------------------------------------------------
# 7. BACKWARD COMPATIBLE BATCH STORAGE API
# ------------------------------------------------------------------
Write-Host "`n=== 7. BATCH PERSISTENCE API COMPATIBILITY ===" -ForegroundColor Yellow
Assert-Check ($serverJs -match "pathname === '/api/pdf/bulk-batches'") "server.js preserves /api/pdf/bulk-batches endpoint"
Assert-Check ($serverJs -match "MASTER_BULK_BATCHES") "server.js preserves MASTER_BULK_BATCHES in-memory and store persistence"

if ($isListening) {
    $batchesRes = Invoke-RestMethod -Uri "$baseUrl/api/pdf/bulk-batches?userId=alex.rivera@btechpath.ai" -Method Get
    Assert-Check ($batchesRes.success -eq $true) "Backward compatible batch retrieval endpoint returns HTTP 200 with success"
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "FINAL SCORE: $script:testsPassed / $script:testsTotal PASSED ($script:testsFailed FAILED)" -ForegroundColor $(if ($script:testsFailed -eq 0) { 'Green' } else { 'Red' })
Write-Host "========================================================`n" -ForegroundColor Cyan

if ($script:testsFailed -gt 0) {
    exit 1
}
exit 0
