const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TOOLS_DIR = path.resolve(__dirname, '..', 'tools');
if (!fs.existsSync(TOOLS_DIR)) {
    fs.mkdirSync(TOOLS_DIR, { recursive: true });
}

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading from ${url} to ${destPath}...`);
        const fileStream = fs.createWriteStream(destPath);
        
        function get(currUrl) {
            const client = currUrl.startsWith('https') ? https : http;
            const req = client.get(currUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    return get(res.headers.location);
                }
                if (res.statusCode !== 200) {
                    return reject(new Error(`Failed with status code: ${res.statusCode}`));
                }
                const totalBytes = parseInt(res.headers['content-length'] || 0, 10);
                let receivedBytes = 0;
                let lastLog = 0;

                res.on('data', chunk => {
                    receivedBytes += chunk.length;
                    const now = Date.now();
                    if (now - lastLog > 2000) {
                        lastLog = now;
                        const pct = totalBytes ? Math.round((receivedBytes / totalBytes) * 100) : '?';
                        console.log(`Progress: ${(receivedBytes / 1024 / 1024).toFixed(1)}MB / ${(totalBytes / 1024 / 1024).toFixed(1)}MB (${pct}%)`);
                    }
                });

                res.pipe(fileStream);

                fileStream.on('finish', () => {
                    fileStream.close(() => {
                        console.log(`Download completed: ${destPath}`);
                        resolve();
                    });
                });
            });

            req.on('error', err => {
                fs.unlink(destPath, () => {});
                reject(err);
            });
        }

        get(url);
    });
}

function extractZip(zipPath, targetDir) {
    console.log(`Extracting ${zipPath} to ${targetDir}...`);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    // Use PowerShell Expand-Archive or tar
    const cmd = `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force"`;
    execSync(cmd, { stdio: 'inherit' });
    console.log(`Extraction complete.`);
}

async function setupRuntimes() {
    console.log('=== TechPath Runtime Provisioner ===');
    console.log('Tools directory:', TOOLS_DIR);

    // 1. Python 3.12 Embeddable
    const pythonDir = path.join(TOOLS_DIR, 'python');
    const pythonExe = path.join(pythonDir, 'python.exe');
    if (!fs.existsSync(pythonExe)) {
        console.log('\n--- Provisioning Python 3.12 ---');
        const pyZip = path.join(TOOLS_DIR, 'python-3.12.8-embed-amd64.zip');
        await downloadFile('https://www.python.org/ftp/python/3.12.8/python-3.12.8-embed-amd64.zip', pyZip);
        extractZip(pyZip, pythonDir);
        fs.unlinkSync(pyZip);
    } else {
        console.log('\nPython already provisioned at:', pythonExe);
    }

    // 2. GCC / G++ (w64devkit 1.20.0)
    const mingwDir = path.join(TOOLS_DIR, 'mingw');
    const gccExe = path.join(mingwDir, 'w64devkit', 'bin', 'gcc.exe');
    if (!fs.existsSync(gccExe)) {
        console.log('\n--- Provisioning GCC / G++ (w64devkit) ---');
        const gccZip = path.join(TOOLS_DIR, 'w64devkit-1.20.0.zip');
        await downloadFile('https://github.com/skeeto/w64devkit/releases/download/v1.20.0/w64devkit-1.20.0.zip', gccZip);
        extractZip(gccZip, mingwDir);
        fs.unlinkSync(gccZip);
    } else {
        console.log('\nGCC already provisioned at:', gccExe);
    }

    // Verify
    console.log('\n--- Verification ---');
    try {
        const pyOut = execSync(`"${pythonExe}" -c "print('Python OK: ' + str(2+2))"`).toString().trim();
        console.log(pyOut);
    } catch (e) {
        console.error('Python test failed:', e.message);
    }

    try {
        const gccOut = execSync(`"${gccExe}" --version`).toString().split('\n')[0].trim();
        console.log('GCC OK:', gccOut);
    } catch (e) {
        console.error('GCC test failed:', e.message);
    }

    console.log('\nAll required IDE compilers and runtimes provisioned successfully!');
}

setupRuntimes().catch(err => {
    console.error('Provisioning error:', err);
    process.exit(1);
});
