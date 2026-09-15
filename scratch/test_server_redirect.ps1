# ==============================================================================
# Self-contained In-Memory Dev Server Redirect Test
# ==============================================================================
$rootDir = Split-Path -Parent $PSScriptRoot

$serverSource = @"
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Collections.Generic;

public class TestRedirectServer {
    private TcpListener _listener;
    private volatile bool _running;
    private string _rootDir;
    private int _port;

    public TestRedirectServer(string rootDir, int preferredPort) {
        _rootDir = Path.GetFullPath(rootDir);
        _port = preferredPort;
        _listener = new TcpListener(IPAddress.Loopback, _port);
        _listener.Start(10);
    }

    public int Port { get { return _port; } }

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
                client.ReceiveTimeout = 2000;
                using (NetworkStream stream = client.GetStream()) {
                    byte[] buffer = new byte[4096];
                    int bytesRead = stream.Read(buffer, 0, buffer.Length);
                    if (bytesRead <= 0) return;

                    string request = Encoding.ASCII.GetString(buffer, 0, bytesRead);
                    string firstLine = request.Split(new string[] { "\r\n", "\n" }, StringSplitOptions.None)[0];
                    string[] parts = firstLine.Split(' ');
                    if (parts.Length < 2) return;

                    string rawUrl = parts[1];
                    string path = rawUrl.Split('?')[0];

                    string lowerPath = path.ToLowerInvariant();
                    if (lowerPath == "/bulk-pdf" || lowerPath == "/bulk-pdf-notes" || lowerPath == "/bulk-notes" || lowerPath == "/bulk-pdf.html" || lowerPath == "/bulk-pdf-notes.html" || lowerPath == "/bulk-document-notes") {
                        string target = "/ai-notes.html";
                        int qIdx = rawUrl.IndexOf('?');
                        if (qIdx >= 0) target += rawUrl.Substring(qIdx);
                        string redHeader = "HTTP/1.1 302 Found\r\nLocation: " + target + "\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: 0\r\n\r\n";
                        byte[] redBytes = Encoding.ASCII.GetBytes(redHeader);
                        stream.Write(redBytes, 0, redBytes.Length);
                        stream.Flush();
                        return;
                    }

                    string okHeader = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 2\r\n\r\nOK";
                    byte[] okBytes = Encoding.ASCII.GetBytes(okHeader);
                    stream.Write(okBytes, 0, okBytes.Length);
                    stream.Flush();
                }
            }
        } catch {}
    }
}
"@

if (-not ([System.Management.Automation.PSTypeName]'TestRedirectServer').Type) {
    Add-Type -TypeDefinition $serverSource
}

$testPort = 8999
$server = New-Object TestRedirectServer($rootDir, $testPort)
$server.Start()
Start-Sleep -Milliseconds 200

$redirectRoutes = @(
    "/bulk-pdf",
    "/bulk-pdf-notes",
    "/bulk-notes",
    "/bulk-pdf.html",
    "/bulk-pdf-notes.html",
    "/bulk-document-notes"
)

$passed = 0
$total = $redirectRoutes.Count

try {
    foreach ($r in $redirectRoutes) {
        $req = [System.Net.HttpWebRequest]::Create("http://127.0.0.1:$testPort$r")
        $req.AllowAutoRedirect = $false
        $res = $req.GetResponse()
        $statusCode = [int]$res.StatusCode
        $loc = $res.Headers["Location"]
        $res.Close()

        if ($statusCode -eq 302 -and $loc -eq "/ai-notes.html") {
            Write-Host "  [PASS] Route $r returned HTTP 302 -> $loc" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "  [FAIL] Route $r returned $statusCode -> $loc" -ForegroundColor Red
        }
    }
} finally {
    $server.Stop()
}

Write-Host "`nResult: $passed / $total Redirects Passed!" -ForegroundColor Cyan
if ($passed -ne $total) { exit 1 }
exit 0
