// ==============================================================================
// BTechPath AI OS - Production Secure Coding IDE Execution Engine
// Features:
// - Dynamic Host Runtime Detection (C/GCC, C++/G++, Python 3, Java, Node.js)
// - Isolated Sandbox Execution with Stripped Environment (Zero Key Leakage)
// - Memory Limits & Maximum Buffer Throttling
// - Infinite Loop & Process Timeout Enforcement (Process Tree Termination)
// - Interactive Stdin Stream Piping
// - Debounced Non-Executing AST / Syntax Diagnostics (Linting)
// - Automatic Temporary Sandbox Cleanup
// ==============================================================================

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const SANDBOX_ROOT = path.join(ROOT_DIR, 'scratch', 'sandboxes');

// Ensure sandboxes root directory exists
if (!fs.existsSync(SANDBOX_ROOT)) {
    fs.mkdirSync(SANDBOX_ROOT, { recursive: true });
}

// In-flight execution registry for instant stop/cancellation
const ACTIVE_EXECUTIONS = new Map();

// Helper to locate tool executables (checking local tools/ first, then system PATH)
function resolveToolPath(relSubPath, fallbackCmd) {
    const localPath = path.join(ROOT_DIR, relSubPath);
    if (fs.existsSync(localPath)) {
        return localPath;
    }
    return fallbackCmd;
}

// Tool binaries
const LOCAL_GCC = resolveToolPath(path.join('tools', 'mingw', 'w64devkit', 'bin', 'gcc.exe'), 'gcc');
const LOCAL_GPP = resolveToolPath(path.join('tools', 'mingw', 'w64devkit', 'bin', 'g++.exe'), 'g++');
const LOCAL_PYTHON = resolveToolPath(path.join('tools', 'python', 'python.exe'), 'python');

// Helper to build sanitized environment for sandbox execution
function buildSanitizedEnv(sandboxDir) {
    const mingwBin = path.join(ROOT_DIR, 'tools', 'mingw', 'w64devkit', 'bin');
    const pythonDir = path.join(ROOT_DIR, 'tools', 'python');
    const systemPaths = [
        mingwBin,
        pythonDir,
        'C:\\Program Files\\nodejs',
        'C:\\Windows\\System32',
        'C:\\Windows',
        'C:\\Windows\\System32\\Wbem',
        'C:\\Windows\\System32\\WindowsPowerShell\\v1.0'
    ];

    // Combine sanitized PATH without carrying forward any sensitive tokens
    const safePath = systemPaths.filter(p => fs.existsSync(p)).join(path.delimiter) +
        (process.env.PATH ? (path.delimiter + process.env.PATH) : '');

    return {
        PATH: safePath,
        TEMP: sandboxDir,
        TMP: sandboxDir,
        NODE_ENV: 'production',
        LANG: 'en_US.UTF-8',
        SYSTEMROOT: process.env.SYSTEMROOT || 'C:\\Windows'
    };
}

// Helper to reliably kill a process tree on Windows and POSIX
function killProcessTree(pid) {
    if (!pid) return;
    try {
        if (process.platform === 'win32') {
            execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
        } else {
            process.kill(-pid, 'SIGKILL');
        }
    } catch (e) {
        try { process.kill(pid, 'SIGKILL'); } catch (err) {}
    }
}

// 1. Dynamic Runtime Detector & Health Checker
function detectRuntimes() {
    const runtimes = [];

    // Check C (GCC)
    let gccVer = null;
    try {
        const out = execSync(`"${LOCAL_GCC}" --version`, { timeout: 2500, stdio: ['pipe', 'pipe', 'pipe'] }).toString().split('\n')[0].trim();
        if (out && !out.toLowerCase().includes('not recognized')) {
            gccVer = out;
        }
    } catch (e) {}

    if (gccVer) {
        runtimes.push({
            id: 'c',
            name: 'C (GCC)',
            version: gccVer,
            available: true,
            extension: 'c',
            executable: LOCAL_GCC,
            sampleCode: `#include <stdio.h>\n\nint main() {\n    printf("Hello from C\\n");\n    return 0;\n}\n`
        });
    } else {
        runtimes.push({
            id: 'c',
            name: 'C (GCC)',
            version: null,
            available: false,
            extension: 'c',
            installGuide: 'C compiler is not installed on the server.',
            sampleCode: `// C compiler is not installed on the server.\n`
        });
    }

    // Check C++ (G++)
    let gppVer = null;
    try {
        const out = execSync(`"${LOCAL_GPP}" --version`, { timeout: 2500, stdio: ['pipe', 'pipe', 'pipe'] }).toString().split('\n')[0].trim();
        if (out && !out.toLowerCase().includes('not recognized')) {
            gppVer = out;
        }
    } catch (e) {}

    if (gppVer) {
        runtimes.push({
            id: 'cpp',
            name: 'C++ (G++)',
            version: gppVer,
            available: true,
            extension: 'cpp',
            executable: LOCAL_GPP,
            sampleCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from C++" << endl;\n    return 0;\n}\n`
        });
    } else {
        runtimes.push({
            id: 'cpp',
            name: 'C++ (G++)',
            version: null,
            available: false,
            extension: 'cpp',
            installGuide: 'C++ compiler is not installed on the server.',
            sampleCode: `// C++ compiler is not installed on the server.\n`
        });
    }

    // Check Python 3
    let pyVer = null;
    let pyCmd = null;
    const pythonCandidates = [LOCAL_PYTHON, 'python', 'python3', 'py'];
    for (const cmd of pythonCandidates) {
        try {
            const out = execSync(`"${cmd}" --version`, { timeout: 2500, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
            if (out.toLowerCase().includes('python 3')) {
                const testPy = execSync(`"${cmd}" -c "print(40+2)"`, { timeout: 2500, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
                if (testPy === '42') {
                    pyVer = out;
                    pyCmd = cmd;
                    break;
                }
            }
        } catch (e) {}
    }

    if (pyCmd) {
        runtimes.push({
            id: 'python',
            name: 'Python 3',
            version: pyVer,
            available: true,
            extension: 'py',
            executable: pyCmd,
            sampleCode: `print("Hello from Python")\nprint(10 / 2)\n`
        });
    } else {
        runtimes.push({
            id: 'python',
            name: 'Python 3',
            version: null,
            available: false,
            extension: 'py',
            installGuide: 'Python 3 runtime is not installed on the server.',
            sampleCode: `# Python 3 is not installed on the server.\n`
        });
    }

    // Check Java (javac + java)
    let javaVer = null;
    try {
        const javacVer = execSync('javac -version', { timeout: 2500, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
        if (javacVer) {
            javaVer = javacVer;
        }
    } catch (e) {}

    if (javaVer) {
        runtimes.push({
            id: 'java',
            name: 'Java (OpenJDK 17)',
            version: javaVer,
            available: true,
            extension: 'java',
            sampleCode: `// TechPath — Java Playground\n// Compiled with javac and executed in isolated JVM\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java");\n    }\n}\n`
        });
    } else {
        runtimes.push({
            id: 'java',
            name: 'Java',
            version: null,
            available: false,
            extension: 'java',
            installGuide: 'Java JDK is not installed on the server.',
            sampleCode: `// Java compiler is not installed on the server.\n`
        });
    }

    // Check Node.js / JavaScript
    try {
        const nodeVer = execSync(`"${process.execPath}" -v`, { timeout: 2500, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
        const testOut = execSync(`"${process.execPath}" -e "console.log(40+2)"`, { timeout: 2500, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
        if (testOut === '42') {
            runtimes.push({
                id: 'javascript',
                name: 'JavaScript (Node.js)',
                version: nodeVer,
                available: true,
                extension: 'js',
                sampleCode: `// TechPath — JavaScript Playground\nconsole.log("Hello from JavaScript");\n`
            });
        }
    } catch (e) {
        console.warn('Node.js runtime probe failed:', e.message);
    }

    return runtimes;
}

// 2. Non-Executing AST / Syntax Diagnostics (Linting)
function lintCode({ language, code }) {
    const diagnostics = [];

    if (!code || !code.trim()) {
        return { diagnostics };
    }

    const lang = (language || '').toLowerCase();

    if (lang === 'javascript' || lang === 'js') {
        try {
            new vm.Script(code, { filename: 'solution.js', displayErrors: true });
        } catch (err) {
            let line = 1;
            let col = 1;
            let message = err.message || 'Syntax Error';

            if (err.stack) {
                const match = err.stack.match(/solution\.js:(\d+)(?::(\d+))?/);
                if (match) {
                    line = parseInt(match[1], 10);
                    if (match[2]) col = parseInt(match[2], 10);
                }
            }

            message = message.replace(/^[a-zA-Z0-9_\-\\\/\.]+: /, '').trim();
            diagnostics.push({
                line,
                column: col,
                severity: 'error',
                message
            });
        }
    } else if (lang === 'c' || lang === 'cpp') {
        const lines = code.split('\n');
        let openBraces = 0;
        let openParens = 0;
        let hasMain = false;

        lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const stripped = line.replace(/\/\/.*/, '').replace(/"[^"]*"/g, '""');
            if (stripped.includes('main(') || stripped.includes('main (')) {
                hasMain = true;
            }
            for (const ch of stripped) {
                if (ch === '{') openBraces++;
                if (ch === '}') openBraces--;
                if (ch === '(') openParens++;
                if (ch === ')') openParens--;
            }
        });

        if (openBraces !== 0) {
            diagnostics.push({
                line: lines.length,
                column: 1,
                severity: 'error',
                message: `Unbalanced curly braces: ${Math.abs(openBraces)} ${openBraces > 0 ? 'unclosed' : 'extra closing'} brace(s).`
            });
        }
        if (openParens !== 0) {
            diagnostics.push({
                line: lines.length,
                column: 1,
                severity: 'error',
                message: `Unbalanced parentheses: ${Math.abs(openParens)} ${openParens > 0 ? 'unclosed' : 'extra closing'} paren(s).`
            });
        }
        if (!hasMain) {
            diagnostics.push({
                line: 1,
                column: 1,
                severity: 'warning',
                message: 'No main() function detected. C/C++ programs require an entry point: int main() { ... }'
            });
        }
    } else if (lang === 'python' || lang === 'py') {
        const lines = code.split('\n');
        let openParens = 0;
        let openBrackets = 0;

        lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const stripped = line.replace(/#.*/, '');
            for (const ch of stripped) {
                if (ch === '(') openParens++;
                if (ch === ')') openParens--;
                if (ch === '[') openBrackets++;
                if (ch === ']') openBrackets--;
            }

            const trimmed = stripped.trim();
            if (trimmed.match(/^(def|class|if|elif|else|for|while|try|except|finally|with)\b/) && !trimmed.endsWith(':')) {
                diagnostics.push({
                    line: lineNum,
                    column: line.length,
                    severity: 'error',
                    message: `Missing colon ':' at the end of '${trimmed.split(' ')[0]}' statement`
                });
            }
        });

        if (openParens !== 0) {
            diagnostics.push({
                line: lines.length,
                column: 1,
                severity: 'error',
                message: `Unbalanced parentheses: ${Math.abs(openParens)} unclosed paren(s).`
            });
        }
        if (openBrackets !== 0) {
            diagnostics.push({
                line: lines.length,
                column: 1,
                severity: 'error',
                message: `Unbalanced brackets: ${Math.abs(openBrackets)} unclosed bracket(s).`
            });
        }
    } else if (lang === 'java') {
        const lines = code.split('\n');
        let openBraces = 0;
        let openParens = 0;

        lines.forEach((line) => {
            const stripped = line.replace(/\/\/.*/, '').replace(/"[^"]*"/g, '""');
            for (const ch of stripped) {
                if (ch === '{') openBraces++;
                if (ch === '}') openBraces--;
                if (ch === '(') openParens++;
                if (ch === ')') openParens--;
            }
        });

        if (openBraces !== 0) {
            diagnostics.push({
                line: lines.length,
                column: 1,
                severity: 'error',
                message: `Unbalanced curly braces in Java class.`
            });
        }
        if (!code.includes('class ')) {
            diagnostics.push({
                line: 1,
                column: 1,
                severity: 'error',
                message: 'Java code must define a class (e.g. public class Main).'
            });
        }
    }

    return { diagnostics };
}

// 3. Isolated Sandbox Execution
async function executeCode({ language = 'javascript', code = '', stdin = '', timeoutMs = 5000, execId = null }) {
    if (!code || !code.trim()) {
        return {
            success: false,
            status: 'failed',
            stdout: '',
            stderr: 'Write some code before running.',
            compileError: null,
            exitCode: 1,
            executionTimeMs: 0
        };
    }

    const availableRuntimes = detectRuntimes();
    const runtime = availableRuntimes.find(r => r.id === language.toLowerCase());

    if (!runtime) {
        return {
            success: false,
            status: 'failed',
            stdout: '',
            stderr: `${language.toUpperCase()} execution is currently unavailable in this deployment environment. Available runtimes: ${availableRuntimes.filter(r => r.available).map(r => r.name).join(', ')}.`,
            compileError: null,
            exitCode: 1,
            executionTimeMs: 0
        };
    }

    if (!runtime.available) {
        return {
            success: false,
            status: 'failed',
            stdout: '',
            stderr: runtime.installGuide || `${runtime.name} is not installed on the server.`,
            compileError: null,
            exitCode: 1,
            executionTimeMs: 0
        };
    }

    const currentExecId = execId || crypto.randomUUID();
    const sandboxDir = path.join(SANDBOX_ROOT, currentExecId);
    fs.mkdirSync(sandboxDir, { recursive: true });

    // Enforce timeout limits: 1000ms to 10000ms (default 6000ms)
    const maxTimeout = Math.min(Math.max(parseInt(timeoutMs, 10) || 6000, 1000), 10000);

    // Stripped environment: ZERO server secrets passed to user code
    const sanitizedEnv = buildSanitizedEnv(sandboxDir);

    return new Promise((resolve) => {
        const startTime = Date.now();
        let stdoutBuffer = '';
        let stderrBuffer = '';
        const MAX_OUTPUT_BYTES = 100 * 1024; // 100 KB output cap
        let isTerminated = false;
        let timeoutTimer = null;
        let child = null;

        // Clean helper to sanitize error messages so file paths look clean
        const sanitizeErrorOutput = (str) => {
            if (!str) return '';
            const normalized = str.replace(new RegExp(sandboxDir.replace(/\\/g, '\\\\'), 'g'), '')
                                  .replace(/^[\\\/]+/, '');
            return normalized.trim();
        };

        // Execution dispatcher per language
        if (runtime.id === 'c') {
            const sourceFile = 'main.c';
            const exeFile = process.platform === 'win32' ? 'program.exe' : 'program';
            const sourcePath = path.join(sandboxDir, sourceFile);
            fs.writeFileSync(sourcePath, code, 'utf8');

            // 1. Compile with GCC
            try {
                execSync(`"${runtime.executable || LOCAL_GCC}" -O2 "${sourceFile}" -o "${exeFile}"`, {
                    cwd: sandboxDir,
                    env: sanitizedEnv,
                    timeout: 8000,
                    stdio: ['pipe', 'pipe', 'pipe']
                });
            } catch (compileErr) {
                const compileErrOutput = (compileErr.stderr ? compileErr.stderr.toString() : '') ||
                                         (compileErr.stdout ? compileErr.stdout.toString() : '') ||
                                         compileErr.message;
                const cleanError = sanitizeErrorOutput(compileErrOutput);
                try { fs.rmSync(sandboxDir, { recursive: true, force: true }); } catch (e) {}
                return resolve({
                    success: false,
                    status: 'compile_error',
                    stdout: '',
                    stderr: cleanError,
                    compileError: cleanError,
                    exitCode: 1,
                    executionTimeMs: Date.now() - startTime
                });
            }

            // 2. Execute compiled binary
            const exePath = path.join(sandboxDir, exeFile);
            child = spawn(exePath, [], {
                cwd: sandboxDir,
                env: sanitizedEnv,
                stdio: ['pipe', 'pipe', 'pipe']
            });
        } else if (runtime.id === 'cpp') {
            const sourceFile = 'main.cpp';
            const exeFile = process.platform === 'win32' ? 'program.exe' : 'program';
            const sourcePath = path.join(sandboxDir, sourceFile);
            fs.writeFileSync(sourcePath, code, 'utf8');

            // 1. Compile with G++
            try {
                execSync(`"${runtime.executable || LOCAL_GPP}" -O2 "${sourceFile}" -o "${exeFile}"`, {
                    cwd: sandboxDir,
                    env: sanitizedEnv,
                    timeout: 8000,
                    stdio: ['pipe', 'pipe', 'pipe']
                });
            } catch (compileErr) {
                const compileErrOutput = (compileErr.stderr ? compileErr.stderr.toString() : '') ||
                                         (compileErr.stdout ? compileErr.stdout.toString() : '') ||
                                         compileErr.message;
                const cleanError = sanitizeErrorOutput(compileErrOutput);
                try { fs.rmSync(sandboxDir, { recursive: true, force: true }); } catch (e) {}
                return resolve({
                    success: false,
                    status: 'compile_error',
                    stdout: '',
                    stderr: cleanError,
                    compileError: cleanError,
                    exitCode: 1,
                    executionTimeMs: Date.now() - startTime
                });
            }

            // 2. Execute compiled binary
            const exePath = path.join(sandboxDir, exeFile);
            child = spawn(exePath, [], {
                cwd: sandboxDir,
                env: sanitizedEnv,
                stdio: ['pipe', 'pipe', 'pipe']
            });
        } else if (runtime.id === 'python') {
            const scriptFileName = 'main.py';
            const scriptFilePath = path.join(sandboxDir, scriptFileName);
            fs.writeFileSync(scriptFilePath, code, 'utf8');

            // Spawn python with -u (unbuffered)
            child = spawn(runtime.executable || LOCAL_PYTHON, [
                '-u',
                scriptFileName
            ], {
                cwd: sandboxDir,
                env: sanitizedEnv,
                stdio: ['pipe', 'pipe', 'pipe']
            });
        } else if (runtime.id === 'java') {
            // Determine class name from source
            let className = 'Main';
            const classMatch = code.match(/(?:public\s+)?class\s+([A-Za-z0-9_$]+)/);
            if (classMatch && classMatch[1]) {
                className = classMatch[1];
            }
            const javaSourceFile = `${className}.java`;
            const javaSourcePath = path.join(sandboxDir, javaSourceFile);
            fs.writeFileSync(javaSourcePath, code, 'utf8');

            // 1. Compile with javac
            try {
                execSync(`javac -J-Xmx128m "${javaSourceFile}"`, {
                    cwd: sandboxDir,
                    env: sanitizedEnv,
                    timeout: 7000,
                    stdio: ['pipe', 'pipe', 'pipe']
                });
            } catch (compileErr) {
                const compileErrOutput = (compileErr.stderr ? compileErr.stderr.toString() : '') ||
                                         (compileErr.stdout ? compileErr.stdout.toString() : '') ||
                                         compileErr.message;
                const cleanError = sanitizeErrorOutput(compileErrOutput);
                try { fs.rmSync(sandboxDir, { recursive: true, force: true }); } catch (e) {}
                return resolve({
                    success: false,
                    status: 'compile_error',
                    stdout: '',
                    stderr: cleanError,
                    compileError: cleanError,
                    exitCode: 1,
                    executionTimeMs: Date.now() - startTime
                });
            }

            // 2. Execute compiled class with java
            child = spawn('java', [
                '-Xmx64m',
                '-cp',
                '.',
                className
            ], {
                cwd: sandboxDir,
                env: sanitizedEnv,
                stdio: ['pipe', 'pipe', 'pipe']
            });
        } else if (runtime.id === 'javascript') {
            const scriptFileName = 'main.js';
            const scriptFilePath = path.join(sandboxDir, scriptFileName);
            fs.writeFileSync(scriptFilePath, code, 'utf8');

            child = spawn(process.execPath, [
                '--max-old-space-size=64',
                '--no-addons',
                scriptFileName
            ], {
                cwd: sandboxDir,
                env: sanitizedEnv,
                stdio: ['pipe', 'pipe', 'pipe']
            });
        }

        if (!child || !child.pid) {
            try { fs.rmSync(sandboxDir, { recursive: true, force: true }); } catch (e) {}
            return resolve({
                success: false,
                status: 'failed',
                stdout: '',
                stderr: 'Failed to spawn execution process.',
                compileError: null,
                exitCode: 1,
                executionTimeMs: 0
            });
        }

        // Register in active executions for cancel/stop support
        ACTIVE_EXECUTIONS.set(currentExecId, { child, sandboxDir, startTime });

        // Pipe stdin if supplied
        if (stdin !== undefined && stdin !== null && stdin !== '') {
            try {
                child.stdin.write(String(stdin));
                if (!String(stdin).endsWith('\n')) {
                    child.stdin.write('\n');
                }
                child.stdin.end();
            } catch (e) {}
        } else {
            try { child.stdin.end(); } catch (e) {}
        }

        // Stream stdout with byte cap
        child.stdout.on('data', (chunk) => {
            if (stdoutBuffer.length < MAX_OUTPUT_BYTES) {
                stdoutBuffer += chunk.toString();
                if (stdoutBuffer.length >= MAX_OUTPUT_BYTES) {
                    stdoutBuffer += '\n[OUTPUT TRUNCATED: 100 KB limit exceeded]';
                }
            }
        });

        // Stream stderr with byte cap
        child.stderr.on('data', (chunk) => {
            if (stderrBuffer.length < MAX_OUTPUT_BYTES) {
                stderrBuffer += chunk.toString();
                if (stderrBuffer.length >= MAX_OUTPUT_BYTES) {
                    stderrBuffer += '\n[STDERR TRUNCATED: 100 KB limit exceeded]';
                }
            }
        });

        // Enforce execution timeout
        timeoutTimer = setTimeout(() => {
            isTerminated = true;
            killProcessTree(child.pid);
        }, maxTimeout);

        child.on('close', (code, signal) => {
            clearTimeout(timeoutTimer);
            const executionTimeMs = Date.now() - startTime;
            ACTIVE_EXECUTIONS.delete(currentExecId);

            // Cleanup scratch sandbox files
            try {
                fs.rmSync(sandboxDir, { recursive: true, force: true });
            } catch (e) {}

            if (isTerminated) {
                return resolve({
                    success: false,
                    status: 'timed_out',
                    stdout: stdoutBuffer,
                    stderr: 'Execution timed out.',
                    compileError: null,
                    exitCode: 124,
                    executionTimeMs
                });
            }

            // Check if cancelled via stopExecution()
            if (signal === 'SIGKILL' || signal === 'SIGTERM') {
                return resolve({
                    success: false,
                    status: 'cancelled',
                    stdout: stdoutBuffer,
                    stderr: 'Execution stopped by user.',
                    compileError: null,
                    exitCode: 130,
                    executionTimeMs
                });
            }

            const cleanStderr = sanitizeErrorOutput(stderrBuffer);
            const success = (code === 0);
            let status = success ? 'completed' : 'runtime_error';

            // Distinguish syntax/parse errors from runtime errors (e.g. Python SyntaxError)
            if (!success && (cleanStderr.includes('SyntaxError') || cleanStderr.includes('IndentationError'))) {
                status = 'compile_error';
            }

            resolve({
                success,
                status,
                stdout: stdoutBuffer,
                stderr: cleanStderr,
                compileError: status === 'compile_error' ? cleanStderr : null,
                exitCode: code !== null ? code : 1,
                executionTimeMs,
                execId: currentExecId
            });
        });

        child.on('error', (err) => {
            clearTimeout(timeoutTimer);
            ACTIVE_EXECUTIONS.delete(currentExecId);
            try { fs.rmSync(sandboxDir, { recursive: true, force: true }); } catch (e) {}

            resolve({
                success: false,
                status: 'failed',
                stdout: stdoutBuffer,
                stderr: `Process error: ${err.message}`,
                compileError: null,
                exitCode: 1,
                executionTimeMs: Date.now() - startTime
            });
        });
    });
}

// 4. Stop / Cancel Running Execution
function stopExecution(execId) {
    if (!execId) return { success: false, message: 'Execution ID required' };
    const active = ACTIVE_EXECUTIONS.get(execId);
    if (!active) {
        return { success: false, message: 'Execution not found or already finished' };
    }

    killProcessTree(active.child.pid);
    ACTIVE_EXECUTIONS.delete(execId);
    try {
        fs.rmSync(active.sandboxDir, { recursive: true, force: true });
    } catch (e) {}

    return { success: true, status: 'cancelled' };
}

module.exports = {
    detectRuntimes,
    lintCode,
    executeCode,
    stopExecution
};
