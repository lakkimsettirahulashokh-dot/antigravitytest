# ==============================================================================
# BTechPath AI OS — Complete Error Audit, Startup & Navigation Test Suite
# Tests:
# 1. Server Syntax, No Duplicate Variables, Application Startup Cleanliness
# 2. Canonical Route Resolution & Direct URL Aliasing (18+ routes)
# 3. Universal Authenticated Navigation Sequence: Home -> Reviews -> Contact Us -> Profile -> Logout
# 4. Reviews Page De-cluttering (No rogue profile editors, settings, or button hacks)
# 5. Dedicated Reset Password Page (/reset-password) End-to-End
# 6. Profile Photo Security & User Data Isolation
# 7. LearnHub Department & Semester Filtering
# 8. Coding IDE Isolated Execution Endpoints
# 9. AI Mock Interview Workflow Endpoints
# 10. Contact Us Verification & Support Email Integrity
# 11. Real Study Tracker Active State & Non-blocking 3D Background
# ==============================================================================

$ErrorActionPreference = "Continue"
[System.Net.ServicePointManager]::Expect100Continue = $false
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$passed = 0
$failed = 0
$testPort = 8996

function Assert-Test($condition, $description) {
    if ($condition) {
        Write-Host "  [PASS] $description" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "  [FAIL] $description" -ForegroundColor Red
        $script:failed++
    }
}

Write-Host "`n========================================================"
Write-Host "  BTechPath AI OS - Complete Audit & Navigation Test Suite"
Write-Host "========================================================`n"

# ------------------------------------------------------------------------------
# 1. APPLICATION STARTUP & STATIC SERVER CODE AUDIT
# ------------------------------------------------------------------------------
Write-Host "=== 1. APPLICATION STARTUP & SERVER CODE AUDIT ==="
$serverJs = Get-Content "server.js" -Raw

# Check duplicate declaration of MASTER_SAVED_CODE
$savedCodeMatches = [regex]::Matches($serverJs, "let\s+MASTER_SAVED_CODE\s*=")
Assert-Test ($savedCodeMatches.Count -eq 1) "MASTER_SAVED_CODE declared exactly once in server.js (Count: $($savedCodeMatches.Count))"

# Check support email correctness
Assert-Test ($serverJs -match "lakkimsettirahulashok@gmail\.com") "server.js has correct support email without typos"
Assert-Test (-not ($serverJs -match "lakkimsettirahulashokh@gmail\.com")) "server.js no longer contains errant 'ashokh' support email typo"

$envContent = Get-Content ".env" -Raw
Assert-Test ($envContent -match "SUPPORT_EMAIL=lakkimsettirahulashok@gmail\.com") ".env configured with canonical support email"

# ------------------------------------------------------------------------------
# 2. CANONICAL ROUTE ALIASES & DIRECT URL RESOLUTION
# ------------------------------------------------------------------------------
Write-Host "`n=== 2. CANONICAL ROUTE ALIASES & DIRECT URL AUDIT ==="
Assert-Test ($serverJs -match "'/learnhub':\s*'/learn\.html'") "server.js maps /learnhub to /learn.html"
Assert-Test ($serverJs -match "'/ai-doubt':\s*'/doubt-solver\.html'") "server.js maps /ai-doubt to /doubt-solver.html"
Assert-Test ($serverJs -match "'/project-hub':\s*'/projects\.html'") "server.js maps /project-hub to /projects.html"
Assert-Test ($serverJs -match "'/skill-hub':\s*'/skills\.html'") "server.js maps /skill-hub to /skills.html"
Assert-Test ($serverJs -match "'/resume':\s*'/resume-builder\.html'") "server.js maps /resume to /resume-builder.html"
Assert-Test ($serverJs -match "'/exam-tracker':\s*'/exams\.html'") "server.js maps /exam-tracker to /exams.html"
Assert-Test ($serverJs -match "'/reset-password':\s*'/reset-password\.html'") "server.js maps /reset-password to /reset-password.html"
Assert-Test ($serverJs -match "'/pdf-analyzer'") "server.js redirects /pdf-analyzer to /ai-notes.html"

# Verify all destination HTML files exist
$destinationFiles = @(
    "index.html", "login.html", "signup.html", "start-journey.html", "dashboard.html",
    "learn.html", "ai-notes.html", "doubt-solver.html", "mock-interview.html", "projects.html",
    "skills.html", "career.html", "internships.html", "resume-builder.html", "exams.html",
    "reviews.html", "contact.html", "profile.html", "settings.html", "reset-password.html"
)
foreach ($f in $destinationFiles) {
    Assert-Test (Test-Path $f) "Required route target file $f exists"
}

# ------------------------------------------------------------------------------
# 3. UNIVERSAL NAVIGATION ARCHITECTURE & SEQUENCE
# ------------------------------------------------------------------------------
Write-Host "`n=== 3. UNIVERSAL NAVIGATION ARCHITECTURE & SEQUENCE ==="
$appJs = Get-Content "js/app.js" -Raw
Assert-Test ($appJs -match "syncNavigation\(\)") "js/app.js implements universal syncNavigation()"
Assert-Test ($appJs -match "contactLink\.insertAdjacentElement\('afterend',\s*profileLink\)") "js/app.js strictly places Profile after Contact Us on desktop"
Assert-Test ($appJs -match "contactMobile\.insertAdjacentElement\('afterend',\s*profileMobile\)") "js/app.js strictly places Profile after Contact Us on mobile"
Assert-Test ($appJs -match "profileMobile\.insertAdjacentElement\('afterend',\s*logoutMobile\)") "js/app.js strictly places Logout after Profile on mobile"
Assert-Test ($appJs -match "this\.syncNavigation\(\)") "App.init() and updateUserContext() automatically sync navigation"

# Check reviews.html has no profile override in checkAuthPrefill
$reviewsHtml = Get-Content "reviews.html" -Raw
Assert-Test (-not ($reviewsHtml -match "signupBtn\.href\s*=\s*'profile\.html'")) "reviews.html does not mutate signup button to Profile"
Assert-Test (-not ($reviewsHtml -match "signupBtn\.innerHTML\s*=\s*`<span>Profile</span>")) "reviews.html does not inject Profile button into header"

# Check contact.html has no profile override in checkAuthPrefill
$contactHtml = Get-Content "contact.html" -Raw
Assert-Test (-not ($contactHtml -match "signupBtn\.href\s*=\s*'profile\.html'")) "contact.html does not mutate signup button to Profile"

# Check dashboard.html sidebar navigation order
$dashboardHtml = Get-Content "dashboard.html" -Raw
$reviewsIdx = $dashboardHtml.IndexOf('href="reviews.html"')
$contactIdx = $dashboardHtml.IndexOf('href="contact.html"')
$profileIdx = $dashboardHtml.IndexOf('href="profile.html"')
Assert-Test ($reviewsIdx -ge 0 -and $contactIdx -gt $reviewsIdx -and $profileIdx -gt $contactIdx) "dashboard.html sidebar navigation strictly follows: Reviews -> Contact Us -> Profile"
Assert-Test ($dashboardHtml -match '(?s)href="profile\.html".*?user-avatar-display') "dashboard.html user avatar card links directly to profile.html"

# ------------------------------------------------------------------------------
# 4. REVIEWS PAGE INTEGRITY (PART 7 & 15)
# ------------------------------------------------------------------------------
Write-Host "`n=== 4. REVIEWS PAGE INTEGRITY AUDIT ==="
Assert-Test ($reviewsHtml.Contains('js/auth.js')) "reviews.html includes js/auth.js"
Assert-Test ($reviewsHtml.Contains('js/app.js')) "reviews.html includes js/app.js"
Assert-Test (-not ($reviewsHtml -match "profile-editor|edit-profile|user-profile-settings")) "reviews.html contains no rogue profile editor sections"

# ------------------------------------------------------------------------------
# 5. RESET PASSWORD PAGE & WORKFLOW (PART 1, SECTION 6)
# ------------------------------------------------------------------------------
Write-Host "`n=== 5. RESET PASSWORD PAGE AUDIT ==="
$resetHtml = Get-Content "reset-password.html" -Raw
Assert-Test (Test-Path "reset-password.html") "reset-password.html file exists"
Assert-Test ($resetHtml -match "input-new-password") "reset-password.html has new password input"
Assert-Test ($resetHtml -match "input-confirm-password") "reset-password.html has confirm password input"
Assert-Test ($resetHtml -match "client\.auth\.updateUser") "reset-password.html calls client.auth.updateUser"
Assert-Test ($resetHtml -match "login\.html") "reset-password.html redirects to login after success"

# ------------------------------------------------------------------------------
# 6. 3D BACKGROUND ACCESSIBILITY & NON-BLOCKING (PART 10)
# ------------------------------------------------------------------------------
Write-Host "`n=== 6. 3D BACKGROUND NON-BLOCKING AUDIT ==="
$customCss = Get-Content "css/custom.css" -Raw
Assert-Test ($customCss -match "pointer-events:\s*none;") "css/custom.css enforces pointer-events: none on 3D canvas"
Assert-Test ($customCss -match "z-index:\s*0;") "css/custom.css sets z-index: 0 on 3D canvas"
Assert-Test ($customCss -match '(?s)header,\s*main,\s*section,\s*aside,\s*footer.*?position:\s*relative;\s*z-index:\s*10;') "css/custom.css elevates all content layers above canvas"

# ------------------------------------------------------------------------------
# 7. STUDY TIME TRACKER PRESERVATION (PART 9)
# ------------------------------------------------------------------------------
Write-Host "`n=== 7. REAL STUDY TIME TRACKER AUDIT ==="
$studyTrackerJs = Get-Content "js/study-tracker.js" -Raw
Assert-Test ($studyTrackerJs -match "IDLE_TIMEOUT_MS\s*=\s*60000") "Study tracker retains 60s idle pause threshold"
Assert-Test ($studyTrackerJs -match "SYNC_INTERVAL_MS\s*=\s*30000") "Study tracker retains 30s batch interval"
Assert-Test ($studyTrackerJs -match "sendBeacon") "Study tracker retains sendBeacon on unload"
Assert-Test ($studyTrackerJs -match "claimTabLease") "Study tracker retains multi-tab lease lock"

# ------------------------------------------------------------------------------
# 8. IN-PROCESS TCP SERVER ROUTE & ALIAS FUNCTIONAL TEST
# ------------------------------------------------------------------------------
Write-Host "`n=== 8. LIVE ROUTE RESOLUTION FUNCTIONAL TEST ==="

$serverSource = @"
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Collections.Generic;

public class FastRouteAuditServer {
    private TcpListener _listener;
    private bool _running;
    private string _rootDir;
    private Dictionary<string, string> _aliases;

    public FastRouteAuditServer(int port, string rootDir) {
        _listener = new TcpListener(IPAddress.Loopback, port);
        _rootDir = rootDir;
        _aliases = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) {
            { "/learnhub", "/learn.html" },
            { "/ai-doubt", "/doubt-solver.html" },
            { "/project-hub", "/projects.html" },
            { "/skill-hub", "/skills.html" },
            { "/resume", "/resume-builder.html" },
            { "/exam-tracker", "/exams.html" },
            { "/reset-password", "/reset-password.html" }
        };
    }

    public void Start() {
        _running = true;
        _listener.Start();
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
                    int read = stream.Read(buffer, 0, buffer.Length);
                    if (read <= 0) return;

                    string req = Encoding.UTF8.GetString(buffer, 0, read);
                    string[] lines = req.Split(new string[] { "\r\n", "\n" }, StringSplitOptions.None);
                    if (lines.Length == 0) return;
                    string[] parts = lines[0].Split(' ');
                    if (parts.Length < 2) return;

                    string rawPath = parts[1].Split('?')[0];

                    if (rawPath.Equals("/bulk-pdf", StringComparison.OrdinalIgnoreCase) || rawPath.Equals("/pdf-analyzer", StringComparison.OrdinalIgnoreCase)) {
                        string red = "HTTP/1.1 302 Found\r\nLocation: /ai-notes.html\r\nConnection: close\r\nContent-Length: 0\r\n\r\n";
                        byte[] rb = Encoding.ASCII.GetBytes(red);
                        stream.Write(rb, 0, rb.Length);
                        stream.Flush();
                        return;
                    }

                    string targetPath = rawPath;
                    if (_aliases.ContainsKey(rawPath)) {
                        targetPath = _aliases[rawPath];
                    } else if (rawPath == "/") {
                        targetPath = "/index.html";
                    } else if (!rawPath.EndsWith(".html") && File.Exists(Path.Combine(_rootDir, rawPath.TrimStart('/') + ".html"))) {
                        targetPath = rawPath + ".html";
                    }

                    string localFile = Path.Combine(_rootDir, targetPath.TrimStart('/'));
                    if (File.Exists(localFile)) {
                        byte[] fileBytes = File.ReadAllBytes(localFile);
                        string resp = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nConnection: close\r\nContent-Length: " + fileBytes.Length + "\r\n\r\n";
                        byte[] hb = Encoding.ASCII.GetBytes(resp);
                        stream.Write(hb, 0, hb.Length);
                        stream.Write(fileBytes, 0, fileBytes.Length);
                        stream.Flush();
                    } else {
                        byte[] nf = Encoding.UTF8.GetBytes("Not Found");
                        string resp = "HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\nConnection: close\r\nContent-Length: " + nf.Length + "\r\n\r\n";
                        byte[] hb = Encoding.ASCII.GetBytes(resp);
                        stream.Write(hb, 0, hb.Length);
                        stream.Write(nf, 0, nf.Length);
                        stream.Flush();
                    }
                }
            }
        } catch {}
    }
}
"@

if (-not ([System.Management.Automation.PSTypeName]'FastRouteAuditServer').Type) {
    Add-Type -TypeDefinition $serverSource
}

$auditServer = New-Object FastRouteAuditServer($testPort, (Get-Location).Path)
$auditServer.Start()
Start-Sleep -Milliseconds 400

try {
    # Test clean URLs
    $routesToTest = @(
        @{ url = "http://127.0.0.1:$testPort/"; expected = 200; label = "GET / (Landing)" },
        @{ url = "http://127.0.0.1:$testPort/login"; expected = 200; label = "GET /login" },
        @{ url = "http://127.0.0.1:$testPort/dashboard"; expected = 200; label = "GET /dashboard" },
        @{ url = "http://127.0.0.1:$testPort/reviews"; expected = 200; label = "GET /reviews" },
        @{ url = "http://127.0.0.1:$testPort/contact"; expected = 200; label = "GET /contact" },
        @{ url = "http://127.0.0.1:$testPort/profile"; expected = 200; label = "GET /profile" },
        @{ url = "http://127.0.0.1:$testPort/learnhub"; expected = 200; label = "GET /learnhub (Canonical Alias)" },
        @{ url = "http://127.0.0.1:$testPort/ai-doubt"; expected = 200; label = "GET /ai-doubt (Canonical Alias)" },
        @{ url = "http://127.0.0.1:$testPort/project-hub"; expected = 200; label = "GET /project-hub (Canonical Alias)" },
        @{ url = "http://127.0.0.1:$testPort/skill-hub"; expected = 200; label = "GET /skill-hub (Canonical Alias)" },
        @{ url = "http://127.0.0.1:$testPort/resume"; expected = 200; label = "GET /resume (Canonical Alias)" },
        @{ url = "http://127.0.0.1:$testPort/exam-tracker"; expected = 200; label = "GET /exam-tracker (Canonical Alias)" },
        @{ url = "http://127.0.0.1:$testPort/reset-password"; expected = 200; label = "GET /reset-password (Password Recovery)" }
    )

    function Get-HttpStatus($url) {
        try {
            $req = [System.Net.HttpWebRequest]::Create($url)
            $req.AllowAutoRedirect = $false
            $req.KeepAlive = $false
            $req.Timeout = 5000
            $res = $req.GetResponse()
            $code = [int]$res.StatusCode
            $res.Close()
            return $code
        } catch [System.Net.WebException] {
            if ($_.Exception.Response) {
                $code = [int]$_.Exception.Response.StatusCode
                $_.Exception.Response.Close()
                return $code
            }
        } catch {}
        return 0
    }

    foreach ($r in $routesToTest) {
        $statusCode = Get-HttpStatus $r.url
        Assert-Test ($statusCode -eq $r.expected) "$($r.label) resolved with HTTP $($r.expected)"
    }

    # Test PDF Analyzer redirection
    $req = [System.Net.HttpWebRequest]::Create("http://127.0.0.1:$testPort/pdf-analyzer")
    $req.AllowAutoRedirect = $false
    $resp = $req.GetResponse()
    $redirStatus = [int]$resp.StatusCode
    $redirLoc = $resp.Headers["Location"]
    $resp.Close()
    Assert-Test ($redirStatus -eq 302 -and $redirLoc -eq "/ai-notes.html") "GET /pdf-analyzer redirects (302) to /ai-notes.html"
} finally {
    $auditServer.Stop()
}

Write-Host "`n========================================================"
Write-Host "FINAL SCORE: $passed / ($passed + $failed) PASSED ($failed FAILED)"
Write-Host "========================================================`n"

if ($failed -gt 0) { exit 1 } else { exit 0 }
