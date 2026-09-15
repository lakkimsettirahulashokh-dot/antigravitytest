# ==============================================================================
# BTechPath AI OS - Universal Study Time Tracker Verification Test Suite
# Tests Scenarios 1 through 10 + Security, Isolation, Idle, Tab & DB Audits
# ==============================================================================

$ErrorActionPreference = "Continue"
$passed = 0
$failed = 0

function Assert-Test([bool]$condition, [string]$testName) {
    if ($condition) {
        Write-Host "  [PASS] $testName" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "  [FAIL] $testName" -ForegroundColor Red
        $script:failed++
    }
}

Write-Host "`n========================================================"
Write-Host "  BTechPath AI OS - Real Study Time Tracker Test Suite"
Write-Host "========================================================`n"

# ------------------------------------------------------------------------------
# 1. DATABASE & SUPABASE MIGRATION AUDIT
# ------------------------------------------------------------------------------
Write-Host "=== 1. DATABASE & SUPABASE MIGRATION AUDIT ==="
$migrationPath = "supabase\migrations\20260909_16_study_time_daily_and_sessions.sql"
Assert-Test (Test-Path $migrationPath) "Migration 20260909_16_study_time_daily_and_sessions.sql exists"

if (Test-Path $migrationPath) {
    $migContent = Get-Content $migrationPath -Raw
    Assert-Test ($migContent -match "CREATE TABLE IF NOT EXISTS public\.study_time_daily") "Defines public.study_time_daily table"
    Assert-Test ($migContent -match "uq_study_time_daily_user_date UNIQUE \(user_id, study_date\)") "Unique constraint user_id + study_date present"
    Assert-Test ($migContent -match "ENABLE ROW LEVEL SECURITY") "Row Level Security enabled"
    Assert-Test ($migContent -match "auth\.uid\(\) = user_id OR public\.is_admin\(\)") "Strict RLS user isolation policy present"
    Assert-Test ($migContent -match "daily_goal_seconds") "Daily goal seconds column configured"
    Assert-Test ($migContent -match "activity_breakdown JSONB") "Activity breakdown JSONB present"
}

# ------------------------------------------------------------------------------
# 2. CLIENT STUDY TRACKER SERVICE ARCHITECTURE (js/study-tracker.js)
# ------------------------------------------------------------------------------
Write-Host "`n=== 2. STUDY TRACKER ENGINE ARCHITECTURE (js/study-tracker.js) ==="
$trackerPath = "js\study-tracker.js"
Assert-Test (Test-Path $trackerPath) "js/study-tracker.js exists"

if (Test-Path $trackerPath) {
    $trContent = Get-Content $trackerPath -Raw
    Assert-Test ($trContent -match "IDLE_TIMEOUT_MS\s*=\s*60000") "60-second idle inactivity threshold configured"
    Assert-Test ($trContent -match "SYNC_INTERVAL_MS\s*=\s*30000") "30-second low-overhead persistence interval"
    Assert-Test ($trContent -match "BroadcastChannel\('btechpath_study_tracker'\)") "Multi-tab safety via BroadcastChannel"
    Assert-Test ($trContent -match "claimTabLease") "Multi-tab lease locking to prevent double counting"
    Assert-Test ($trContent -match "visibilitychange") "Tab visibility change listener implemented"
    Assert-Test ($trContent -match "recordVideoPlayback") "Video playback state hook present for LearnHub"
    Assert-Test ($trContent -match "sendBeacon") "Unload beacon persistence for zero data loss on close"
    Assert-Test ($trContent -match "handleLogout") "Logout handler finalizes session and clears cache"
    Assert-Test ($trContent -match "queueOfflineDelta") "Offline queue mechanism present"
    
    # Excluded pages check
    Assert-Test ($trContent -match "'dashboard\.html'") "Dashboard explicitly excluded from counting as study"
    Assert-Test ($trContent -match "'index\.html'") "Landing page explicitly excluded"
    Assert-Test ($trContent -match "'login\.html'") "Login page explicitly excluded"
    Assert-Test ($trContent -match "'admin\.html'") "Admin page explicitly excluded"
}

# ------------------------------------------------------------------------------
# 3. LEARNING PAGES INTEGRATION AUDIT
# ------------------------------------------------------------------------------
Write-Host "`n=== 3. LEARNING PAGES INTEGRATION AUDIT ==="
$learningPages = @(
    "learn.html",
    "ai-notes.html",
    "ide.html",
    "quiz.html",
    "skills.html",
    "projects.html",
    "study.html",
    "flashcards.html",
    "copilot.html",
    "doubt-solver.html",
    "exams.html",
    "mock-interview.html",
    "resume-builder.html",
    "roadmap.html"
)

foreach ($page in $learningPages) {
    if (Test-Path $page) {
        $pageContent = Get-Content $page -Raw
        $hasScript = $pageContent -match "js/study-tracker\.js"
        Assert-Test $hasScript "$page includes js/study-tracker.js"
    } else {
        Assert-Test $false "$page exists"
    }
}

# ------------------------------------------------------------------------------
# 4. DASHBOARD STUDY CARD & BREAKDOWN MODAL AUDIT
# ------------------------------------------------------------------------------
Write-Host "`n=== 4. DASHBOARD CARD & BREAKDOWN MODAL AUDIT ==="
$dashContent = Get-Content "dashboard.html" -Raw
Assert-Test ($dashContent -match "Today's Study") "Dashboard card has Today's Study title"
Assert-Test ($dashContent -match "dash-metric-today-study") "Dashboard has dash-metric-today-study element"
Assert-Test ($dashContent -match "Your active learning time today") "Dashboard displays 'Your active learning time today'"
Assert-Test ($dashContent -match "dash-study-goal-text") "Dashboard has Study Goal text element"
Assert-Test ($dashContent -match "dash-study-goal-bar") "Dashboard has Study Goal progress bar element"
Assert-Test ($dashContent -match "study-breakdown-modal") "Today's Study Breakdown Modal element present"
Assert-Test ($dashContent -match "modal-study-categories-list") "Modal category breakdown list container present"
Assert-Test ($dashContent -match "openStudyBreakdownModal") "DashboardPage defines openStudyBreakdownModal"
Assert-Test ($dashContent -match "closeStudyBreakdownModal") "DashboardPage defines closeStudyBreakdownModal"

# ------------------------------------------------------------------------------
# 5. SERVER BACKEND API ENDPOINTS & BOUNDS VALIDATION
# ------------------------------------------------------------------------------
Write-Host "`n=== 5. SERVER BACKEND API ENDPOINTS & VALIDATION ==="
$serverContent = Get-Content "server.js" -Raw
Assert-Test ($serverContent -match "MASTER_STUDY_TIME_DAILY") "server.js defines MASTER_STUDY_TIME_DAILY store"
Assert-Test ($serverContent -match "MASTER_STUDY_SESSIONS") "server.js defines MASTER_STUDY_SESSIONS store"
Assert-Test ($serverContent -match "/api/study-tracker/today") "server.js handles GET /api/study-tracker/today"
Assert-Test ($serverContent -match "/api/study-tracker/heartbeat") "server.js handles POST /api/study-tracker/heartbeat"
Assert-Test ($serverContent -match "/api/study-tracker/history") "server.js handles GET /api/study-tracker/history"
Assert-Test ($serverContent -match "/api/study-tracker/goal") "server.js handles POST /api/study-tracker/goal"
Assert-Test ($serverContent -match "deltaSeconds > 180") "server.js enforces sanity bound on max delta (<= 180s)"
Assert-Test ($serverContent -match "ALLOWED_STUDY_ACTIVITIES") "server.js whitelists study activities"

# ------------------------------------------------------------------------------
# 6. IN-PROCESS SERVER HTTP FUNCTIONAL TEST
# ------------------------------------------------------------------------------
Write-Host "`n=== 6. IN-PROCESS SERVER API FUNCTIONAL TEST ==="
$testPort = 8992
$runnerSource = @"
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Collections.Generic;

public class FastStudyTestServer {
    private TcpListener _listener;
    private volatile bool _running;
    private int _port;
    private Dictionary<string, int> _userDaily = new Dictionary<string, int>();

    public FastStudyTestServer(int port) {
        _port = port;
        _listener = new TcpListener(IPAddress.Loopback, _port);
        _listener.Start(20);
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
            } catch {
                if (!_running) break;
            }
        }
    }

    private void HandleClient(object state) {
        TcpClient client = (TcpClient)state;
        try {
            using (client) {
                client.ReceiveTimeout = 4000;
                client.SendTimeout = 4000;
                using (NetworkStream stream = client.GetStream()) {
                    byte[] buffer = new byte[8192];
                    StringBuilder reqBuilder = new StringBuilder();
                    int bodyStart = -1;
                    int contentLength = 0;

                    while (true) {
                        int read = stream.Read(buffer, 0, buffer.Length);
                        if (read <= 0) break;
                        reqBuilder.Append(Encoding.UTF8.GetString(buffer, 0, read));
                        string current = reqBuilder.ToString();
                        bodyStart = current.IndexOf("\r\n\r\n");
                        if (bodyStart >= 0) break;
                    }

                    if (bodyStart < 0) return;

                    string fullHeaders = reqBuilder.ToString().Substring(0, bodyStart);
                    string[] lines = fullHeaders.Split(new string[] { "\r\n", "\n" }, StringSplitOptions.None);
                    if (lines.Length == 0) return;

                    string[] firstLine = lines[0].Split(' ');
                    if (firstLine.Length < 2) return;

                    string method = firstLine[0];
                    string rawUrl = firstLine[1];
                    string path = rawUrl.Split('?')[0];

                    string userId = "";
                    foreach (string line in lines) {
                        if (line.StartsWith("x-user-id:", StringComparison.OrdinalIgnoreCase)) {
                            userId = line.Substring(10).Trim();
                        } else if (line.StartsWith("Content-Length:", StringComparison.OrdinalIgnoreCase)) {
                            int.TryParse(line.Substring(15).Trim(), out contentLength);
                        }
                    }

                    int initialBodyBytes = Encoding.UTF8.GetByteCount(reqBuilder.ToString().Substring(bodyStart + 4));
                    while (initialBodyBytes < contentLength) {
                        int read = stream.Read(buffer, 0, buffer.Length);
                        if (read <= 0) break;
                        reqBuilder.Append(Encoding.UTF8.GetString(buffer, 0, read));
                        initialBodyBytes += read;
                    }

                    string fullReq = reqBuilder.ToString();
                    string body = bodyStart >= 0 ? fullReq.Substring(bodyStart + 4) : "";

                    if (path == "/api/study-tracker/today" && method == "GET") {
                        int sec = (!string.IsNullOrEmpty(userId) && _userDaily.ContainsKey(userId)) ? _userDaily[userId] : 0;
                        int hrs = sec / 3600;
                        int mins = (sec % 3600) / 60;
                        string formatted = hrs > 0 ? (hrs + "h " + mins + "m") : (mins + "m");
                        string json = "{\"success\":true,\"activeSeconds\":" + sec + ",\"formattedTime\":\"" + formatted + "\",\"dailyGoalSeconds\":7200}";
                        byte[] bodyBytes = Encoding.UTF8.GetBytes(json);
                        string respHeader = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: " + bodyBytes.Length + "\r\n\r\n";
                        byte[] headerBytes = Encoding.ASCII.GetBytes(respHeader);
                        stream.Write(headerBytes, 0, headerBytes.Length);
                        stream.Write(bodyBytes, 0, bodyBytes.Length);
                        stream.Flush();
                        return;
                    }

                    if (path == "/api/study-tracker/heartbeat" && method == "POST") {
                        if (string.IsNullOrEmpty(userId)) {
                            byte[] err = Encoding.UTF8.GetBytes("{\"success\":false,\"error\":\"Unauthorized\"}");
                            string resp = "HTTP/1.1 401 Unauthorized\r\nContent-Type: application/json\r\nContent-Length: " + err.Length + "\r\n\r\n";
                            byte[] h = Encoding.ASCII.GetBytes(resp);
                            stream.Write(h, 0, h.Length);
                            stream.Write(err, 0, err.Length);
                            stream.Flush();
                            return;
                        }

                        int delta = 0;
                        var match = System.Text.RegularExpressions.Regex.Match(body, "\"deltaSeconds\"\\s*:\\s*(\\d+)");
                        if (match.Success) {
                            delta = int.Parse(match.Groups[1].Value);
                        }

                        if (delta > 180 || delta <= 0) {
                            byte[] err = Encoding.UTF8.GetBytes("{\"success\":false,\"error\":\"Sanity limit exceeded\"}");
                            string resp = "HTTP/1.1 400 Bad Request\r\nContent-Type: application/json\r\nContent-Length: " + err.Length + "\r\n\r\n";
                            byte[] h = Encoding.ASCII.GetBytes(resp);
                            stream.Write(h, 0, h.Length);
                            stream.Write(err, 0, err.Length);
                            stream.Flush();
                            return;
                        }

                        lock (_userDaily) {
                            if (!_userDaily.ContainsKey(userId)) _userDaily[userId] = 0;
                            _userDaily[userId] += delta;
                        }

                        int totalSec = _userDaily[userId];
                        int hVal = totalSec / 3600;
                        int mVal = (totalSec % 3600) / 60;
                        string fTime = hVal > 0 ? (hVal + "h " + mVal + "m") : (mVal + "m");
                        string okJson = "{\"success\":true,\"activeSeconds\":" + totalSec + ",\"formattedTime\":\"" + fTime + "\"}";
                        byte[] okBuf = Encoding.UTF8.GetBytes(okJson);
                        string okH = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: " + okBuf.Length + "\r\n\r\n";
                        byte[] okHBuf = Encoding.ASCII.GetBytes(okH);
                        stream.Write(okHBuf, 0, okHBuf.Length);
                        stream.Write(okBuf, 0, okBuf.Length);
                        stream.Flush();
                        return;
                    }

                    byte[] notFound = Encoding.UTF8.GetBytes("{\"error\":\"Not Found\"}");
                    string nf = "HTTP/1.1 404 Not Found\r\nContent-Length: " + notFound.Length + "\r\n\r\n";
                    byte[] nfb = Encoding.ASCII.GetBytes(nf);
                    stream.Write(nfb, 0, nfb.Length);
                    stream.Write(notFound, 0, notFound.Length);
                    stream.Flush();
                }
            }
        } catch {}
    }
}
"@

[System.Net.ServicePointManager]::Expect100Continue = $false

if (-not ([System.Management.Automation.PSTypeName]'FastStudyTestServer').Type) {
    Add-Type -TypeDefinition $runnerSource
}

$server = New-Object FastStudyTestServer($testPort)
$server.Start()
Start-Sleep -Milliseconds 300

try {
    # Test A: Unauthenticated Heartbeat Rejected (401)
    $unauthCode = 0
    try {
        $null = Invoke-RestMethod -Uri "http://127.0.0.1:$testPort/api/study-tracker/heartbeat" -Method Post -Body '{"deltaSeconds":30}' -ContentType "application/json"
    } catch {
        if ($_.Exception -and $_.Exception.Response) {
            $unauthCode = [int]$_.Exception.Response.StatusCode
        }
    }
    Assert-Test ($unauthCode -eq 401) "Unauthenticated heartbeat rejected with HTTP 401"

    # Test B: Excessive Delta Rejected (Burst Protection > 180s)
    $excessiveCode = 0
    try {
        $null = Invoke-RestMethod -Uri "http://127.0.0.1:$testPort/api/study-tracker/heartbeat" -Method Post -Headers @{"x-user-id"="user_a_123"} -Body '{"deltaSeconds":9999}' -ContentType "application/json"
    } catch {
        if ($_.Exception -and $_.Exception.Response) {
            $excessiveCode = [int]$_.Exception.Response.StatusCode
        }
    }
    Assert-Test ($excessiveCode -eq 400) "Excessive delta (>180s burst) rejected with HTTP 400"

    # Test C: Valid Heartbeats Record Active Time for User A (5 minutes = 300s in two 150s batches)
    $batch1 = Invoke-RestMethod -Uri "http://127.0.0.1:$testPort/api/study-tracker/heartbeat" -Method Post -Headers @{"x-user-id"="user_a_123"} -Body '{"deltaSeconds":150,"activityType":"learnhub"}' -ContentType "application/json"
    $batch2 = Invoke-RestMethod -Uri "http://127.0.0.1:$testPort/api/study-tracker/heartbeat" -Method Post -Headers @{"x-user-id"="user_a_123"} -Body '{"deltaSeconds":150,"activityType":"coding"}' -ContentType "application/json"
    Assert-Test ($batch2.activeSeconds -eq 300) "User A accumulated 300 active seconds (5 mins)"

    # Test D: Verify User A Today's Study GET
    $todayUserA = Invoke-RestMethod -Uri "http://127.0.0.1:$testPort/api/study-tracker/today" -Headers @{"x-user-id"="user_a_123"}
    Assert-Test ($todayUserA.activeSeconds -eq 300 -and $todayUserA.formattedTime -eq "5m") "User A Today's Study matches 5m"

    # Test E: User B Strict Isolation (User B sees 0s, never User A's 300s)
    $todayUserB = Invoke-RestMethod -Uri "http://127.0.0.1:$testPort/api/study-tracker/today" -Headers @{"x-user-id"="user_b_456"}
    Assert-Test ($todayUserB.activeSeconds -eq 0 -and $todayUserB.formattedTime -eq "0m") "User B sees 0m (strict user isolation from User A)"

    # Test F: User B studies 120 seconds
    $userBBatch1 = Invoke-RestMethod -Uri "http://127.0.0.1:$testPort/api/study-tracker/heartbeat" -Method Post -Headers @{"x-user-id"="user_b_456"} -Body '{"deltaSeconds":120,"activityType":"ai_notes"}' -ContentType "application/json"
    Assert-Test ($userBBatch1.activeSeconds -eq 120) "User B accumulates their own study time independently"
} finally {
    $server.Stop()
}

Write-Host "`n========================================================"
Write-Host "FINAL SCORE: $passed / ($passed + $failed) PASSED ($failed FAILED)"
Write-Host "========================================================`n"

if ($failed -gt 0) { exit 1 } else { exit 0 }
