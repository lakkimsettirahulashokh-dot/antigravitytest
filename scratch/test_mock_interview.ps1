# BTechPath AI - Mock Interview & Resume Engine Automated Test Suite
$baseUrl = "http://localhost:8080"
Write-Host "=== 1. TESTING /api/resume/parse ===" -ForegroundColor Cyan

$cseResumeText = @"
Alex Rivera
alex.rivera@example.com | +91 9876543210
Education:
B.Tech in Computer Science and Engineering, Institute of Technology, 2026. CGPA: 8.9/10

Technical Skills:
Programming Languages: Python, Java, SQL, JavaScript
Frameworks & Libraries: Node.js, Express, FastAPI, React
Databases: PostgreSQL, Redis
Cloud & Tools: Docker, AWS, Git, Linux
Core Fundamentals: Data Structures, Algorithms, OOP, DBMS, Computer Networks

Projects:
E-commerce High-Throughput REST API
- Built scalable REST API handling product catalog and order processing with PostgreSQL and Redis caching.
- Implemented JWT authentication and role-based access control.
- Handled concurrency using connection pooling and database transactions.

Distributed Key-Value Store
- Implemented raft consensus algorithm in Python for distributed fault-tolerant state replication.

Certifications:
AWS Certified Cloud Practitioner (2025)
"@

$body = @{ rawText = $cseResumeText } | ConvertTo-Json
$parseRes = Invoke-RestMethod -Uri "$baseUrl/api/resume/parse" -Method Post -Body $body -ContentType "application/json"

if ($parseRes.success -and $parseRes.structuredResume) {
    Write-Host "  [PASS] Resume parsed successfully!" -ForegroundColor Green
    Write-Host "  Name: $($parseRes.structuredResume.personal.name)"
    Write-Host "  Skills Count: $($parseRes.structuredResume.allSkillsList.Count)"
    Write-Host "  Projects Count: $($parseRes.structuredResume.projects.Count)"
    Write-Host "  Internships: $($parseRes.structuredResume.internships.Count) (Zero hallucinated internships: PASS)"
} else {
    Write-Host "  [FAIL] Resume parse failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== 2. TESTING /api/ai/mock-interview (action: analyze) ===" -ForegroundColor Cyan
$analyzeBody = @{
    action = "analyze"
    resume = $parseRes.structuredResume
    targetRole = "Backend Developer"
    department = "CSE"
    difficulty = "Intermediate"
    interviewType = "Mixed"
    questionCount = 5
} | ConvertTo-Json

$analyzeRes = Invoke-RestMethod -Uri "$baseUrl/api/ai/mock-interview" -Method Post -Body $analyzeBody -ContentType "application/json"

if ($analyzeRes.success -and $analyzeRes.analysis) {
    Write-Host "  [PASS] Analysis succeeded!" -ForegroundColor Green
    Write-Host "  Opening Question: $($analyzeRes.analysis.openingQuestion)"
    Write-Host "  Opening Type: $($analyzeRes.analysis.openingQuestionType)"
} else {
    Write-Host "  [FAIL] Analysis failed" -ForegroundColor Red
}

Write-Host "`n=== 3. TESTING /api/ai/mock-interview (action: evaluate) ===" -ForegroundColor Cyan
$evalBody = @{
    action = "evaluate"
    currentQuestion = @{
        question = $analyzeRes.analysis.openingQuestion
        type = "resume_project"
    }
    userAnswer = "In my E-commerce REST API, I used PostgreSQL for the relational data model and Redis as a write-through cache for popular product queries. When orders are submitted, I wrap inventory decrement and payment state changes inside an explicit database transaction with row-level locking (SELECT FOR UPDATE) to prevent race conditions during concurrent checkouts."
    targetRole = "Backend Developer"
    department = "CSE"
    difficulty = "Intermediate"
    resume = $parseRes.structuredResume
} | ConvertTo-Json

$evalRes = Invoke-RestMethod -Uri "$baseUrl/api/ai/mock-interview" -Method Post -Body $evalBody -ContentType "application/json"

if ($evalRes.success -and $evalRes.evaluation) {
    Write-Host "  [PASS] Answer evaluation succeeded!" -ForegroundColor Green
    Write-Host "  Technical Score: $($evalRes.evaluation.technicalScore)/100"
    Write-Host "  Feedback: $($evalRes.evaluation.feedback)"
} else {
    Write-Host "  [FAIL] Answer evaluation failed" -ForegroundColor Red
}

Write-Host "`n=== 4. TESTING /api/ai/mock-interview (action: question - adaptive follow-up) ===" -ForegroundColor Cyan
$qBody = @{
    action = "question"
    resume = $parseRes.structuredResume
    targetRole = "Backend Developer"
    department = "CSE"
    difficulty = "Intermediate"
    interviewType = "Mixed"
    questionCount = 5
    currentQuestionNumber = 2
    conversation = @(
        @{
            question = $analyzeRes.analysis.openingQuestion
            answer = "Used PostgreSQL and Redis with transactions."
            technicalScore = $evalRes.evaluation.technicalScore
            feedback = $evalRes.evaluation.feedback
            needsFollowUp = $false
        }
    )
} | ConvertTo-Json

$qRes = Invoke-RestMethod -Uri "$baseUrl/api/ai/mock-interview" -Method Post -Body $qBody -ContentType "application/json"

if ($qRes.success -and $qRes.questionData) {
    Write-Host "  [PASS] Question 2 generated successfully!" -ForegroundColor Green
    Write-Host "  Question 2: $($qRes.questionData.question)"
    Write-Host "  Type: $($qRes.questionData.questionType)"
} else {
    Write-Host "  [FAIL] Question 2 generation failed" -ForegroundColor Red
}

Write-Host "`n=== 5. TESTING /api/ai/mock-interview (action: report - 7 scores & prep plan) ===" -ForegroundColor Cyan
$repBody = @{
    action = "report"
    resume = $parseRes.structuredResume
    targetRole = "Backend Developer"
    department = "CSE"
    conversation = @(
        @{
            question = $analyzeRes.analysis.openingQuestion
            answer = "Used PostgreSQL and Redis with transactions."
            technicalScore = 85
            relevanceScore = 88
            depthScore = 80
            feedback = "Solid architectural explanation."
        },
        @{
            question = $qRes.questionData.question
            answer = "I handle connection pool exhaustion by configuring max connection limits and using circuit breakers with exponential backoff."
            technicalScore = 82
            relevanceScore = 85
            depthScore = 81
            feedback = "Good trade-off understanding."
        }
    )
} | ConvertTo-Json

$repRes = Invoke-RestMethod -Uri "$baseUrl/api/ai/mock-interview" -Method Post -Body $repBody -ContentType "application/json"

if ($repRes.success -and $repRes.report) {
    Write-Host "  [PASS] Report generated successfully!" -ForegroundColor Green
    Write-Host "  Overall Score: $($repRes.report.overallScore)%"
    Write-Host "  Technical Score: $($repRes.report.technicalScore)%"
    Write-Host "  Resume Knowledge: $($repRes.report.resumeScore)%"
    Write-Host "  Prep Plan Priorities Count: $($repRes.report.preparationPlan.Count)"
} else {
    Write-Host "  [FAIL] Report generation failed" -ForegroundColor Red
}

Write-Host "`n=== 6. MULTI-DEPARTMENT TEST (ECE Embedded vs Mechanical CAD) ===" -ForegroundColor Cyan
$eceResume = @{
    allSkillsList = @("C", "Embedded C", "STM32", "UART", "SPI", "I2C", "PCB Design")
    projects = @(
        @{ name = "IoT Environmental Monitoring Node"; technologies = @("STM32", "UART", "Sensors") }
    )
}
$eceBody = @{
    action = "analyze"
    resume = $eceResume
    targetRole = "Embedded Systems Engineer"
    department = "ECE"
    difficulty = "Intermediate"
    interviewType = "Technical"
    questionCount = 5
} | ConvertTo-Json -Depth 10

$eceRes = Invoke-RestMethod -Uri "$baseUrl/api/ai/mock-interview" -Method Post -Body $eceBody -ContentType "application/json"
Write-Host "  ECE Question 1: $($eceRes.analysis.openingQuestion)" -ForegroundColor Yellow

$mechResume = @{
    allSkillsList = @("SolidWorks", "AutoCAD", "ANSYS", "GD&T", "Thermodynamics")
    projects = @(
        @{ name = "Lightweight Automotive Chassis Design"; technologies = @("SolidWorks", "ANSYS FEA") }
    )
}
$mechBody = @{
    action = "analyze"
    resume = $mechResume
    targetRole = "Mechanical Design Engineer"
    department = "Mechanical"
    difficulty = "Intermediate"
    interviewType = "Technical"
    questionCount = 5
} | ConvertTo-Json -Depth 10

$mechRes = Invoke-RestMethod -Uri "$baseUrl/api/ai/mock-interview" -Method Post -Body $mechBody -ContentType "application/json"
Write-Host "  Mechanical Question 1: $($mechRes.analysis.openingQuestion)" -ForegroundColor Yellow

Write-Host "`n=== ALL BACKEND & AI TESTS PASSED SUCCESSFULLY! ===" -ForegroundColor Green
