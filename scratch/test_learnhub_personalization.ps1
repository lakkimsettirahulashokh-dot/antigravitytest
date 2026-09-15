# Test LearnHub Video Personalization End-to-End Test Suite

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "LEARNHUB VIDEO PERSONALIZATION VERIFICATION" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080"
$successCount = 0
$totalTests = 0

function Run-Test($name, [scriptblock]$action) {
    $global:totalTests++
    try {
        & $action
        Write-Host "  PASS: $name" -ForegroundColor Green
        $global:successCount++
    } catch {
        Write-Host "  FAIL: $name - $_" -ForegroundColor Red
    }
}

# 1. Test CSE Sem 4 Personalization
Run-Test "CSE Sem 4 Query Returns Correct Curated Subjects & Common Videos" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/videos?department=CSE&semester=4" -Method Get
    if (-not $res.success) { throw "API returned success=false" }
    if ($res.videos.Count -lt 4) { throw "Expected at least 4 videos for CSE Sem 4, got $($res.videos.Count)" }
    
    $subjects = $res.videos | ForEach-Object { $_.subject }
    if ($subjects -notcontains "Operating Systems") { throw "Missing 'Operating Systems' in CSE Sem 4" }
    if ($subjects -notcontains "Database Management Systems") { throw "Missing 'Database Management Systems' in CSE Sem 4" }
    if ($subjects -notcontains "Computer Networks") { throw "Missing 'Computer Networks' in CSE Sem 4" }
    
    # Check no Mechanical or Civil leaks
    if ($subjects -contains "Machine Design & Kinematics") { throw "Leaked Mechanical subject into CSE Sem 4!" }
    if ($subjects -contains "Structural Analysis & Mechanics") { throw "Leaked Civil subject into CSE Sem 4!" }
}

# 2. Test ECE Sem 4 Personalization
Run-Test "ECE Sem 4 Query Returns Digital Electronics & Microprocessors (No CSE leaks)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/videos?department=ECE&semester=4" -Method Get
    if (-not $res.success) { throw "API returned success=false" }
    
    $subjects = $res.videos | ForEach-Object { $_.subject }
    if ($subjects -notcontains "Digital Electronics & Logic Design") { throw "Missing 'Digital Electronics' in ECE Sem 4" }
    if ($subjects -notcontains "Microprocessors & Microcontrollers") { throw "Missing 'Microprocessors' in ECE Sem 4" }
    
    # Check no CSE leaks
    if ($subjects -contains "Operating Systems") { throw "Leaked CSE subject into ECE Sem 4!" }
}

# 3. Test MECH Sem 5 Personalization
Run-Test "MECH Sem 5 Query Returns Machine Design & Thermodynamics" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/videos?department=MECH&semester=5" -Method Get
    if (-not $res.success) { throw "API returned success=false" }
    
    $subjects = $res.videos | ForEach-Object { $_.subject }
    if ($subjects -notcontains "Machine Design & Kinematics") { throw "Missing 'Machine Design' in MECH Sem 5" }
    if ($subjects -notcontains "Applied Thermodynamics") { throw "Missing 'Thermodynamics' in MECH Sem 5" }
    
    if ($subjects -contains "Operating Systems") { throw "Leaked CSE subject into MECH Sem 5!" }
}

# 4. Test CIVIL Sem 6 Personalization
Run-Test "CIVIL Sem 6 Query Returns Structural Analysis & Concrete Design" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/videos?department=CIVIL&semester=6" -Method Get
    if (-not $res.success) { throw "API returned success=false" }
    
    $subjects = $res.videos | ForEach-Object { $_.subject }
    if ($subjects -notcontains "Structural Analysis & Mechanics") { throw "Missing 'Structural Analysis' in CIVIL Sem 6" }
    if ($subjects -notcontains "Design of Concrete Structures") { throw "Missing 'Concrete Design' in CIVIL Sem 6" }
}

# 5. Test COMMON Engineering Skills Availability Across All Departments
Run-Test "COMMON Videos (Interview Preparation, Resume) are Present in All Departments" {
    $cseRes = Invoke-RestMethod -Uri "$baseUrl/api/videos?department=CSE&semester=4" -Method Get
    $civilRes = Invoke-RestMethod -Uri "$baseUrl/api/videos?department=CIVIL&semester=6" -Method Get
    
    $cseTitles = $cseRes.videos | ForEach-Object { $_.title }
    $civilTitles = $civilRes.videos | ForEach-Object { $_.title }
    
    $hasCommonInCse = $cseTitles -match "Interview Strategy"
    $hasCommonInCivil = $civilTitles -match "Interview Strategy"
    
    if (-not $hasCommonInCse) { throw "COMMON video missing from CSE query" }
    if (-not $hasCommonInCivil) { throw "COMMON video missing from CIVIL query" }
}

# 6. Test Scoped Search and Topic Extraction
Run-Test "Scoped Search within Department & Semester" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/videos?department=CSE&semester=4&search=normalization" -Method Get
    if (-not $res.success) { throw "Search returned success=false" }
    if ($res.videos.Count -ne 1) { throw "Expected 1 matching video for 'normalization', got $($res.videos.Count)" }
    if ($res.videos[0].subject -ne "Database Management Systems") { throw "Unexpected matching subject: $($res.videos[0].subject)" }
}

# 7. Test Admin Security Guard (403 Forbidden for Non-Admin)
Run-Test "Admin Endpoint Blocks Unauthorized Non-Admin Request (403)" {
    $unauthBody = @{
        title = "Malicious Injection Video"
        video_url = "https://youtube.com/watch?v=bad"
        department = "CSE"
    } | ConvertTo-Json

    $statusCode = 0
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/videos" -Method Post -Body $unauthBody -ContentType "application/json" -Headers @{ "X-User-Email" = "hacker@test.com" }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
    }
    if ($statusCode -ne 403) { throw "Expected status code 403, got $statusCode" }
}

# 8. Test Admin Video Registration, Modification, and Deletion
Run-Test "Admin Video CRUD Lifecycle" {
    $adminEmail = "rahulashokhlakkimsetty@gmail.com"
    $testVideo = @{
        title = "Automated E2E Test Electrical Circuits"
        description = "Circuit analysis using Kirchhoff laws"
        video_url = "https://www.youtube.com/watch?v=e2eTest1234"
        provider = "YouTube"
        subject = "Network Analysis"
        topic = "Mesh & Nodal Analysis"
        unit = 1
        instructor = "Prof. E2E"
        duration = "35:00"
        difficulty_level = "Beginner"
        departments = @("EEE")
        semesters = @(3)
        is_published = $true
    } | ConvertTo-Json

    # Create Video
    $createRes = Invoke-RestMethod -Uri "$baseUrl/api/videos" -Method Post -Body $testVideo -ContentType "application/json" -Headers @{ "X-User-Email" = $adminEmail }
    if (-not $createRes.success) { throw "Admin video creation failed" }
    $createdId = $createRes.video.id
    if (-not $createdId) { throw "Missing created video ID" }

    # Verify Video is Queryable for EEE Sem 3
    $eeeRes = Invoke-RestMethod -Uri "$baseUrl/api/videos?department=EEE&semester=3" -Method Get
    $found = $eeeRes.videos | Where-Object { $_.id -eq $createdId }
    if (-not $found) { throw "Newly created video not found in EEE Sem 3 query" }

    # Toggle Published Status to False
    $updateBody = @{ is_published = $false } | ConvertTo-Json
    $putRes = Invoke-RestMethod -Uri "$baseUrl/api/videos/$createdId" -Method Put -Body $updateBody -ContentType "application/json" -Headers @{ "X-User-Email" = $adminEmail }
    if (-not $putRes.success) { throw "Failed to toggle published status" }

    # Verify it is no longer returned in published query
    $eeeResAfter = Invoke-RestMethod -Uri "$baseUrl/api/videos?department=EEE&semester=3" -Method Get
    $foundAfter = $eeeResAfter.videos | Where-Object { $_.id -eq $createdId }
    if ($foundAfter) { throw "Unpublished video is still visible in public query!" }

    # Clean Up: Delete Video
    $delRes = Invoke-RestMethod -Uri "$baseUrl/api/videos/$createdId" -Method Delete -Headers @{ "X-User-Email" = $adminEmail }
    if (-not $delRes.success) { throw "Failed to delete test video" }
}

# 9. Test User Video Progress Persistence
Run-Test "User Video Progress Tracking & Feed Persistence" {
    $testUserId = "user_e2e_student_42"
    $progressBody = @{
        userId = $testUserId
        videoId = "vid-cse-401"
        positionSeconds = 850
        durationSeconds = 2700
        isCompleted = $false
    } | ConvertTo-Json

    $saveRes = Invoke-RestMethod -Uri "$baseUrl/api/videos/progress" -Method Post -Body $progressBody -ContentType "application/json"
    if (-not $saveRes.success) { throw "Failed to save video progress" }

    # Fetch progress
    $getRes = Invoke-RestMethod -Uri "$baseUrl/api/videos/progress?userId=$testUserId" -Method Get
    if (-not $getRes.success) { throw "Failed to fetch video progress" }
    
    $rec = $getRes.progress | Where-Object { $_.video_id -eq "vid-cse-401" }
    if (-not $rec) { throw "Progress record not returned for vid-cse-401" }
    if ($rec.last_position_seconds -ne 850) { throw "Expected position 850, got $($rec.last_position_seconds)" }
}

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "RESULTS: $successCount / $totalTests Passed" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
if ($successCount -ne $totalTests) { exit 1 } else { exit 0 }
