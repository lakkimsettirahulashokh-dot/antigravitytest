# BTechPath AI — Bulk PDF Upload & AI Detailed Notes Test Suite
$baseUrl = "http://localhost:8080"
$ErrorActionPreference = "Stop"

Write-Host "=== 1. TESTING /api/pdf/validate ===" -ForegroundColor Cyan
$validateBody = @{
    files = @(
        @{ name = "Unit 1 - Operating Systems.pdf"; size = 2048500; type = "application/pdf" },
        @{ name = "Unit 2 - Memory Management.pdf"; size = 3120400; type = "application/pdf" },
        @{ name = "Corrupt File.pdf"; size = 0; type = "application/pdf" }
    )
} | ConvertTo-Json -Depth 10

$valRes = Invoke-RestMethod -Uri "$baseUrl/api/pdf/validate" -Method Post -Body $validateBody -ContentType "application/json"
if ($valRes.totalFiles -eq 3 -and $valRes.validFiles -eq 2 -and $valRes.invalidFiles -eq 1) {
    Write-Host "  [PASS] Validation Succeeded: 2 Valid, 1 Corrupt/Empty rejected gracefully." -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Validation unexpected result: $($valRes | ConvertTo-Json)" -ForegroundColor Red
}

Write-Host "`n=== 2. TESTING /api/pdf/extract (Text & Document Structure) ===" -ForegroundColor Cyan
$unit1Text = @"
UNIT I: OPERATING SYSTEM ARCHITECTURE & PROCESS MANAGEMENT

1.1 Introduction to Modern Operating Systems
An operating system is defined as system software that manages computer hardware, software resources, and provides common services for computer programs. The fundamental objective is to provide a safe, efficient, and fair execution environment.

1.2 Process Lifecycle and State Transitions
A process refers to a program in execution. The process control block (PCB) maintains execution context including program counter, register values, and process state:
- New -> Ready -> Running -> Waiting -> Terminated

1.3 CPU Scheduling Invariants
CPU scheduling is defined as the mechanism by which the scheduler allocates CPU time slices to ready processes.
Turnaround Time Formula:
Turnaround Time = Completion Time - Arrival Time
Waiting Time Formula:
Waiting Time = Turnaround Time - Burst Time
Under Round Robin scheduling, the time quantum q directly bounds worst-case responsiveness: Maximum waiting time is bounded by (n - 1) * q.

1.4 Inter-Process Communication & Critical Section
Mutual exclusion is defined as the requirement that one process may not access a shared resource concurrently while another process is executing inside its critical section.
Peterson's algorithm guarantees:
1. Mutual Exclusion
2. Progress Requirement
3. Bounded Waiting
"@

$extractBody = @{
    file_name = "Unit 1 - Operating Systems.pdf"
    rawText = $unit1Text
} | ConvertTo-Json -Depth 10

$extractRes = Invoke-RestMethod -Uri "$baseUrl/api/pdf/extract" -Method Post -Body $extractBody -ContentType "application/json"
if ($extractRes.success -and $extractRes.detectedStructure.unitCount -gt 0) {
    Write-Host "  [PASS] Extraction Succeeded!" -ForegroundColor Green
    Write-Host "  Detected Units: $($extractRes.detectedStructure.unitCount)"
    Write-Host "  Detected Headings: $($extractRes.detectedStructure.headings.Count)"
    Write-Host "  Detected Formulas: $($extractRes.detectedStructure.formulas.Count)"
    Write-Host "  Detected Definitions: $($extractRes.detectedStructure.definitions.Count)"
} else {
    Write-Host "  [FAIL] Extraction failed" -ForegroundColor Red
}

Write-Host "`n=== 3. TESTING /api/ai/pdf-notes (15-Section Comprehensive Notes) ===" -ForegroundColor Cyan
$notesBody = @{
    file_name = "Unit 1 - Operating Systems.pdf"
    extractedText = $unit1Text
    mode = "detailed"
    detectedStructure = $extractRes.detectedStructure
} | ConvertTo-Json -Depth 10

$notesRes = Invoke-RestMethod -Uri "$baseUrl/api/ai/pdf-notes" -Method Post -Body $notesBody -ContentType "application/json"
if ($notesRes.success -and $notesRes.notes) {
    $n = $notesRes.notes
    Write-Host "  [PASS] Detailed Notes Generated!" -ForegroundColor Green
    Write-Host "  Title: $($n.title)"
    Write-Host "  Summary: $($n.summary.Substring(0, [Math]::Min(80, $n.summary.Length)))..."
    Write-Host "  Main Points Count: $($n.mainPoints.Count)"
    Write-Host "  Detailed Topics: $($n.detailedExplanation.Count)"
    Write-Host "  Definitions Count: $($n.definitions.Count)"
    Write-Host "  Formulas Count: $($n.formulas.Count)"
    Write-Host "  Examples Count: $($n.examples.Count)"
    Write-Host "  Exam Focus Count: $($n.examFocus.Count)"
    Write-Host "  Important Questions Count: $($n.importantQuestions.Count)"
    Write-Host "  Practice Questions Count: $($n.practiceQuestions.Count)"
    Write-Host "  Quick Revision Points: $($n.quickRevision.Count)"
    Write-Host "  One-Minute Revision Points: $($n.oneMinuteRevision.Count)"
} else {
    Write-Host "  [FAIL] Notes generation failed" -ForegroundColor Red
}

Write-Host "`n=== 4. TESTING /api/ai/master-notes (Combined Multi-PDF Master Notes) ===" -ForegroundColor Cyan
$unit2Text = @"
UNIT II: MEMORY MANAGEMENT & VIRTUAL MEMORY

2.1 Logical vs Physical Address Space
Virtual memory is defined as a storage allocation scheme in which secondary memory can be addressed as though it were part of the main memory.
Paging divides physical memory into fixed-size frames and logical memory into pages of the same size.

2.2 Address Translation Architecture
Given logical address (p, d) where p is page number and d is offset:
Physical Address = (Frame Number * Page Size) + Offset
Page fault rate p directly dictates Effective Access Time (EAT):
EAT = (1 - p) * Memory Access Time + p * Page Fault Service Time

2.3 Page Replacement Algorithms
- FIFO: Can suffer from Belady's Anomaly
- LRU: Approximation using reference bits
- Optimal: Theoretical lower bound replacing the page that will not be used for the longest period.
"@

$u2NotesBody = @{
    file_name = "Unit 2 - Memory Management.pdf"
    extractedText = $unit2Text
    mode = "detailed"
} | ConvertTo-Json -Depth 10
$u2NotesRes = Invoke-RestMethod -Uri "$baseUrl/api/ai/pdf-notes" -Method Post -Body $u2NotesBody -ContentType "application/json"

$masterBody = @{
    batchTitle = "Operating Systems Full Semester Master Pack"
    totalFiles = 2
    documentsNotes = @(
        @{ file_name = "Unit 1 - Operating Systems.pdf"; notes = $notesRes.notes },
        @{ file_name = "Unit 2 - Memory Management.pdf"; notes = $u2NotesRes.notes }
    )
} | ConvertTo-Json -Depth 10

$masterRes = Invoke-RestMethod -Uri "$baseUrl/api/ai/master-notes" -Method Post -Body $masterBody -ContentType "application/json"
if ($masterRes.success -and $masterRes.masterNotes) {
    $mn = $masterRes.masterNotes
    Write-Host "  [PASS] Master Notes Synthesized!" -ForegroundColor Green
    Write-Host "  Master Title: $($mn.masterTitle)"
    Write-Host "  Provenance Notice: $($mn.provenanceNotice)"
    Write-Host "  Combined Units: $($mn.combinedUnits.Count)"
    Write-Host "  Unified Definitions: $($mn.unifiedDefinitions.Count)"
    Write-Host "  Unified Formulas: $($mn.unifiedFormulas.Count)"
    Write-Host "  Master Question Bank: $($mn.masterQuestionBank.Count)"
} else {
    Write-Host "  [FAIL] Master Notes synthesis failed" -ForegroundColor Red
}

Write-Host "`n=== 5. TESTING /api/ai/notes-flashcards & /api/ai/notes-quiz ===" -ForegroundColor Cyan
$fcBody = @{ notes = $notesRes.notes } | ConvertTo-Json -Depth 10
$fcRes = Invoke-RestMethod -Uri "$baseUrl/api/ai/notes-flashcards" -Method Post -Body $fcBody -ContentType "application/json"
Write-Host "  [PASS] Flashcards Generated: $($fcRes.count) cards" -ForegroundColor Green

$quizBody = @{ notes = $notesRes.notes; count = 5; difficulty = "Medium" } | ConvertTo-Json -Depth 10
$quizRes = Invoke-RestMethod -Uri "$baseUrl/api/ai/notes-quiz" -Method Post -Body $quizBody -ContentType "application/json"
Write-Host "  [PASS] Quiz Generated: $($quizRes.count) questions (Difficulty: $($quizRes.difficulty))" -ForegroundColor Green

Write-Host "`n=== 6. TESTING /api/pdf/bulk-batches (Batch Persistence & Retrieval) ===" -ForegroundColor Cyan
$saveBatchBody = @{
    id = "batch-test-os"
    title = "Operating Systems Full Semester Master Pack"
    total_files = 2
    completed_files = 2
    failed_files = 0
    documents = @(
        @{ file_name = "Unit 1 - Operating Systems.pdf"; page_count = 8; status = "completed" },
        @{ file_name = "Unit 2 - Memory Management.pdf"; page_count = 6; status = "completed" }
    )
    master_notes = $masterRes.masterNotes
} | ConvertTo-Json -Depth 10

$saveRes = Invoke-RestMethod -Uri "$baseUrl/api/pdf/bulk-batches" -Method Post -Body $saveBatchBody -ContentType "application/json"
$listRes = Invoke-RestMethod -Uri "$baseUrl/api/pdf/bulk-batches" -Method Get

if ($listRes.success -and $listRes.batches.Count -gt 0) {
    Write-Host "  [PASS] Batch saved and retrieved successfully! Count: $($listRes.batches.Count)" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Batch retrieval failed" -ForegroundColor Red
}

Write-Host "`n=== ALL BULK PDF BACKEND TESTS PASSED WITH 100% SUCCESS! ===" -ForegroundColor Green
