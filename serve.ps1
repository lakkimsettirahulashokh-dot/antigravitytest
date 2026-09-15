# ==============================================================================
# BTechPath AI OS - High-Performance Zero-Dependency Local Dev Server
# Multi-threaded C# TCP HTTP Engine with Clean URL Routing & Instant Response
# ==============================================================================

$serverSource = @"
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Collections.Generic;

public class FastDevServer {
    private TcpListener _listener;
    private volatile bool _running;
    private string _rootDir;
    private int _port;

    private static readonly Dictionary<string, string> MimeTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) {
        { ".html", "text/html; charset=utf-8" },
        { ".htm",  "text/html; charset=utf-8" },
        { ".css",  "text/css; charset=utf-8" },
        { ".js",   "application/javascript; charset=utf-8" },
        { ".json", "application/json; charset=utf-8" },
        { ".svg",  "image/svg+xml" },
        { ".png",  "image/png" },
        { ".jpg",  "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".gif",  "image/gif" },
        { ".webp", "image/webp" },
        { ".ico",  "image/x-icon" },
        { ".woff2","font/woff2" },
        { ".woff", "font/woff" },
        { ".ttf",  "font/ttf" },
        { ".pdf",  "application/pdf" }
    };

    public FastDevServer(string rootDir, int preferredPort) {
        _rootDir = Path.GetFullPath(rootDir);
        int maxAttempts = 10;
        _port = preferredPort;
        for (int i = 0; i < maxAttempts; i++) {
            try {
                _listener = new TcpListener(IPAddress.Loopback, _port);
                _listener.Start(100);
                break;
            } catch {
                _port++;
            }
        }
    }

    public int Port { get { return _port; } }
    public string RootDir { get { return _rootDir; } }
    public bool IsRunning { get { return _running; } }

    public void Start() {
        if (_running) return;
        _running = true;
        ThreadPool.QueueUserWorkItem(new WaitCallback(ListenLoopWorker));
    }

    public void Stop() {
        _running = false;
        try { _listener.Stop(); } catch {}
    }

    private void ListenLoopWorker(object state) {
        while (_running) {
            try {
                TcpClient client = _listener.AcceptTcpClient();
                ThreadPool.QueueUserWorkItem(new WaitCallback(HandleClientWorker), client);
            } catch {
                if (!_running) break;
            }
        }
    }

    private void HandleClientWorker(object state) {
        TcpClient client = (TcpClient)state;
        try {
            using (client) {
                client.ReceiveTimeout = 4000;
                client.SendTimeout = 4000;
                using (NetworkStream stream = client.GetStream()) {
                    byte[] buffer = new byte[8192];
                    int bytesRead = stream.Read(buffer, 0, buffer.Length);
                    if (bytesRead <= 0) return;

                    string request = Encoding.ASCII.GetString(buffer, 0, bytesRead);
                    string firstLine = request.Split(new string[] { "\r\n", "\n" }, StringSplitOptions.None)[0];
                    string[] parts = firstLine.Split(' ');
                    if (parts.Length < 2) return;

                    string method = parts[0];
                    string rawUrl = parts[1];

                    string path = rawUrl.Split('?')[0];
                    try { path = Uri.UnescapeDataString(path); } catch {}

                    string lowerPath = path.ToLowerInvariant();
                    if (lowerPath == "/bulk-pdf" || lowerPath == "/bulk-pdf-notes" || lowerPath == "/bulk-notes" || lowerPath == "/bulk-pdf.html" || lowerPath == "/bulk-pdf-notes.html" || lowerPath == "/bulk-document-notes" || lowerPath == "/course-pdf" || lowerPath == "/course-pdf.html" || lowerPath == "/ai-pdf" || lowerPath == "/ai-pdf.html" || lowerPath == "/ai-notes" || lowerPath == "/ai-notes.html") {
                        string target = "/pdf-analyzer.html";
                        int qIdx = rawUrl.IndexOf('?');
                        if (qIdx >= 0) target += rawUrl.Substring(qIdx);
                        string redHeader = "HTTP/1.1 302 Found\r\nLocation: " + target + "\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: 0\r\n\r\n";
                        byte[] redBytes = Encoding.ASCII.GetBytes(redHeader);
                        stream.Write(redBytes, 0, redBytes.Length);
                        stream.Flush();
                        return;
                    }

                    if (lowerPath == "/doubt-solver" || lowerPath == "/doubt-solver.html" || lowerPath == "/ai-doubt" || lowerPath == "/ai-doubt.html" || lowerPath == "/ai-doubt-solver" || lowerPath == "/ai-doubt-solver.html" || lowerPath == "/ai-copilot" || lowerPath == "/ai-copilot.html") {
                        string target = "/copilot.html";
                        int qIdx = rawUrl.IndexOf('?');
                        if (qIdx >= 0) target += rawUrl.Substring(qIdx);
                        string redHeader = "HTTP/1.1 302 Found\r\nLocation: " + target + "\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: 0\r\n\r\n";
                        byte[] redBytes = Encoding.ASCII.GetBytes(redHeader);
                        stream.Write(redBytes, 0, redBytes.Length);
                        stream.Flush();
                        return;
                    }

                    if (path == "/" || string.IsNullOrEmpty(path)) {
                        path = "/index.html";
                    }

                    string relPath = path.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                    string filePath = Path.GetFullPath(Path.Combine(_rootDir, relPath));

                    // Security: prevent directory traversal
                    if (!filePath.StartsWith(_rootDir, StringComparison.OrdinalIgnoreCase)) {
                        SendResponse(stream, 403, "Forbidden", "text/plain", Encoding.UTF8.GetBytes("Access Denied"));
                        return;
                    }

                    // Clean URL support: /dashboard -> /dashboard.html
                    if (!File.Exists(filePath) && !Directory.Exists(filePath)) {
                        string htmlFallback = filePath + ".html";
                        if (File.Exists(htmlFallback)) {
                            filePath = htmlFallback;
                        }
                    }

                    // Directory index support
                    if (Directory.Exists(filePath)) {
                        string dirIndex = Path.Combine(filePath, "index.html");
                        if (File.Exists(dirIndex)) {
                            filePath = dirIndex;
                        }
                    }

                    if (File.Exists(filePath)) {
                        string ext = Path.GetExtension(filePath);
                        string mime = MimeTypes.ContainsKey(ext) ? MimeTypes[ext] : "application/octet-stream";
                        byte[] fileBytes = File.ReadAllBytes(filePath);
                        SendResponse(stream, 200, "OK", mime, fileBytes);
                    } else {
                        string notFoundPath = Path.Combine(_rootDir, "404.html");
                        byte[] notFoundBytes;
                        if (File.Exists(notFoundPath)) {
                            notFoundBytes = File.ReadAllBytes(notFoundPath);
                        } else {
                            notFoundBytes = Encoding.UTF8.GetBytes("<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>");
                        }
                        SendResponse(stream, 404, "Not Found", "text/html; charset=utf-8", notFoundBytes);
                    }
                }
            }
        } catch {}
    }

    private void SendResponse(NetworkStream stream, int statusCode, string statusMsg, string contentType, byte[] body) {
        try {
            string header = "HTTP/1.1 " + statusCode + " " + statusMsg + "\r\n" +
                            "Content-Type: " + contentType + "\r\n" +
                            "Content-Length: " + body.Length + "\r\n" +
                            "Access-Control-Allow-Origin: *\r\n" +
                            "Cache-Control: no-cache, no-store, must-revalidate\r\n" +
                            "Connection: close\r\n\r\n";

            byte[] headerBytes = Encoding.ASCII.GetBytes(header);
            stream.Write(headerBytes, 0, headerBytes.Length);
            stream.Write(body, 0, body.Length);
            stream.Flush();
        } catch {}
    }
}
"@

if (-not ([System.Management.Automation.PSTypeName]'FastDevServer').Type) {
    Add-Type -TypeDefinition $serverSource
}

$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = (Get-Location).Path }

$server = New-Object FastDevServer($rootDir, 8080)
$server.Start()

$url = "http://127.0.0.1:$($server.Port)/"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  >> BTechPath AI OS - High-Speed Local Dev Server Active" -ForegroundColor Green
Write-Host "  >> Serving from: $($server.RootDir)" -ForegroundColor DarkGray
Write-Host "  >> Local URL:    $url" -ForegroundColor Yellow
Write-Host "  >> Features:     Clean URLs, Multi-threaded, Zero-Reset" -ForegroundColor Magenta
Write-Host "  >> Press Ctrl+C in this terminal to stop the server" -ForegroundColor DarkYellow
Write-Host "========================================================" -ForegroundColor Cyan

# Open default browser
try {
    Start-Process $url
} catch {}

# Keep script alive when run from terminal
try {
    while ($server.IsRunning) {
        Start-Sleep -Seconds 1
    }
} finally {
    $server.Stop()
}
