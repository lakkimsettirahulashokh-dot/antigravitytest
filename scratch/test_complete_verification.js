const http = require('http');
const fs = require('fs');
const path = require('path');

function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch(e) {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });
        req.on('error', reject);
        if (data) {
            req.write(typeof data === 'string' ? data : JSON.stringify(data));
        }
        req.end();
    });
}

async function runVerification() {
    console.log('====================================================');
    console.log('TECHPATH: CODING IDE & BRANCH LEARNING VERIFICATION');
    console.log('====================================================\n');

    const results = {};

    // ----------------------------------------------------
    // PART 1: CODING IDE TESTS
    // ----------------------------------------------------

    // 1. C Compilation & Execution
    console.log('[TEST 1] C: Real Compilation and Execution');
    const cExec = await request({
        hostname: '127.0.0.1', port: 8080, path: '/api/ide/execute', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'c',
        code: '#include <stdio.h>\nint main() {\n    printf("Hello from C\\n");\n    return 0;\n}'
    });
    const cPass = cExec.data.success === true && cExec.data.stdout.trim() === 'Hello from C';
    results['C Execution'] = cPass ? 'PASS' : 'FAIL';
    console.log(`  -> Output: "${cExec.data.stdout?.trim()}" | Status: ${cPass ? 'PASS' : 'FAIL'}`);

    // 2. C Compiler Error
    console.log('\n[TEST 2] C: Real Compiler Error (Invalid Code)');
    const cErr = await request({
        hostname: '127.0.0.1', port: 8080, path: '/api/ide/execute', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'c',
        code: '#include <stdio.h>\nint main() {\n    printf("Hello"\n    return 0;\n}'
    });
    const cErrPass = cErr.data.success === false && 
                     cErr.data.status === 'compile_error' && 
                     (cErr.data.compileError || cErr.data.stderr).includes('error:');
    results['C Compiler Errors'] = cErrPass ? 'PASS' : 'FAIL';
    console.log(`  -> Status: ${cErr.data.status} | CompileError: ${(cErr.data.compileError || cErr.data.stderr)?.split('\n')[1]} | ${cErrPass ? 'PASS' : 'FAIL'}`);

    // 3. C Stdin (10 20 -> 30)
    console.log('\n[TEST 3] C: Interactive Stdin (scanf)');
    const cStdin = await request({
        hostname: '127.0.0.1', port: 8080, path: '/api/ide/execute', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'c',
        code: '#include <stdio.h>\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("%d\\n", a + b);\n    return 0;\n}',
        stdin: '10 20'
    });
    const cStdinPass = cStdin.data.success === true && cStdin.data.stdout.trim() === '30';
    results['C Stdin'] = cStdinPass ? 'PASS' : 'FAIL';
    console.log(`  -> Stdin: "10 20" -> Stdout: "${cStdin.data.stdout?.trim()}" | ${cStdinPass ? 'PASS' : 'FAIL'}`);

    // 4. C++ Compilation & Execution
    console.log('\n[TEST 4] C++: Real Compilation and Execution');
    const cppExec = await request({
        hostname: '127.0.0.1', port: 8080, path: '/api/ide/execute', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'cpp',
        code: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello from C++" << endl;\n    return 0;\n}'
    });
    const cppPass = cppExec.data.success === true && cppExec.data.stdout.trim() === 'Hello from C++';
    results['C++ Execution'] = cppPass ? 'PASS' : 'FAIL';
    console.log(`  -> Output: "${cppExec.data.stdout?.trim()}" | ${cppPass ? 'PASS' : 'FAIL'}`);

    // 5. C++ Compiler Error
    console.log('\n[TEST 5] C++: Real Compiler Error');
    const cppErr = await request({
        hostname: '127.0.0.1', port: 8080, path: '/api/ide/execute', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'cpp',
        code: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello" << undefined_symbol;\n    return 0;\n}'
    });
    const cppErrPass = cppErr.data.success === false && 
                       cppErr.data.status === 'compile_error' && 
                       (cppErr.data.compileError || cppErr.data.stderr).includes('error:');
    results['C++ Compiler Errors'] = cppErrPass ? 'PASS' : 'FAIL';
    console.log(`  -> Status: ${cppErr.data.status} | CompileError: ${(cppErr.data.compileError || cppErr.data.stderr)?.split('\n')[1]} | ${cppErrPass ? 'PASS' : 'FAIL'}`);

    // 6. Python Execution
    console.log('\n[TEST 6] Python: Execution of print("Hello from Python") & print(10 / 2)');
    const pyExec = await request({
        hostname: '127.0.0.1', port: 8080, path: '/api/ide/execute', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'python',
        code: 'print("Hello from Python")\nprint(10 / 2)'
    });
    const pyPass = pyExec.data.success === true && 
                   pyExec.data.stdout.includes('Hello from Python') && 
                   pyExec.data.stdout.includes('5.0');
    results['Python Execution'] = pyPass ? 'PASS' : 'FAIL';
    console.log(`  -> Output: "${pyExec.data.stdout?.trim()}" | ${pyPass ? 'PASS' : 'FAIL'}`);

    // 7. Python Syntax Error
    console.log('\n[TEST 7] Python: Syntax Error');
    const pyErr = await request({
        hostname: '127.0.0.1', port: 8080, path: '/api/ide/execute', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'python',
        code: 'print("Hello"'
    });
    const pyErrPass = pyErr.data.success === false && 
                      pyErr.data.stderr.includes('SyntaxError');
    results['Python Syntax Errors'] = pyErrPass ? 'PASS' : 'FAIL';
    console.log(`  -> Stderr: "${pyErr.data.stderr?.split('\n').pop()}" | ${pyErrPass ? 'PASS' : 'FAIL'}`);

    // 8. Python Runtime Error
    console.log('\n[TEST 8] Python: Runtime Error (ZeroDivisionError)');
    const pyRuntimeErr = await request({
        hostname: '127.0.0.1', port: 8080, path: '/api/ide/execute', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'python',
        code: 'print("Starting...")\nprint(10 / 0)'
    });
    const pyRuntimePass = pyRuntimeErr.data.success === false && 
                          pyRuntimeErr.data.stderr.includes('ZeroDivisionError');
    results['Python Runtime Errors'] = pyRuntimePass ? 'PASS' : 'FAIL';
    console.log(`  -> Stderr: "${pyRuntimeErr.data.stderr?.split('\n').pop()}" | ${pyRuntimePass ? 'PASS' : 'FAIL'}`);

    // 9. Python Stdin
    console.log('\n[TEST 9] Python: Interactive Stdin');
    const pyStdin = await request({
        hostname: '127.0.0.1', port: 8080, path: '/api/ide/execute', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'python',
        code: 'a, b = map(int, input().split())\nprint(a + b)',
        stdin: '10 20'
    });
    const pyStdinPass = pyStdin.data.success === true && pyStdin.data.stdout.trim() === '30';
    results['Python Stdin'] = pyStdinPass ? 'PASS' : 'FAIL';
    console.log(`  -> Output: "${pyStdin.data.stdout?.trim()}" | ${pyStdinPass ? 'PASS' : 'FAIL'}`);

    // 10. Java Execution
    console.log('\n[TEST 10] Java: Execution via javac & JVM');
    const javaExec = await request({
        hostname: '127.0.0.1', port: 8080, path: '/api/ide/execute', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'java',
        code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java 17");\n    }\n}'
    });
    const javaPass = javaExec.data.success === true && javaExec.data.stdout.trim() === 'Hello from Java 17';
    results['Java Execution'] = javaPass ? 'PASS' : 'FAIL';
    console.log(`  -> Output: "${javaExec.data.stdout?.trim()}" | ${javaPass ? 'PASS' : 'FAIL'}`);

    // 11. JavaScript Execution
    console.log('\n[TEST 11] JavaScript: Execution via Node.js');
    const jsExec = await request({
        hostname: '127.0.0.1', port: 8080, path: '/api/ide/execute', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'javascript',
        code: 'console.log("Hello from JavaScript");'
    });
    const jsPass = jsExec.data.success === true && jsExec.data.stdout.trim() === 'Hello from JavaScript';
    results['JavaScript Execution'] = jsPass ? 'PASS' : 'FAIL';
    console.log(`  -> Output: "${jsExec.data.stdout?.trim()}" | ${jsPass ? 'PASS' : 'FAIL'}`);

    // 12. Infinite Loop Timeout Protection
    console.log('\n[TEST 12] Timeout Protection (while(1) infinite loop)');
    const timeoutRes = await request({
        hostname: '127.0.0.1', port: 8080, path: '/api/ide/execute', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'c',
        code: 'int main() { while(1) {} return 0; }',
        timeoutMs: 2000
    });
    const timeoutPass = timeoutRes.data.status === 'timed_out' && 
                        timeoutRes.data.stderr.includes('timed out');
    results['Timeout Enforcement'] = timeoutPass ? 'PASS' : 'FAIL';
    console.log(`  -> Status: ${timeoutRes.data.status} | Stderr: "${timeoutRes.data.stderr}" | Duration: ${timeoutRes.data.executionTimeMs}ms | ${timeoutPass ? 'PASS' : 'FAIL'}`);

    // 13. Sandbox Security (Zero Secret Leakage)
    console.log('\n[TEST 13] Sandbox Security: Verify No Access to Server Secrets');
    const secRes = await request({
        hostname: '127.0.0.1', port: 8080, path: '/api/ide/execute', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'c',
        code: '#include <stdio.h>\n#include <stdlib.h>\nint main() {\n    char *k = getenv("SUPABASE_ANON_KEY");\n    printf("KEY:%s\\n", k ? k : "NULL");\n    return 0;\n}'
    });
    const secPass = secRes.data.success === true && secRes.data.stdout.includes('KEY:NULL');
    results['Sandbox Security'] = secPass ? 'PASS' : 'FAIL';
    console.log(`  -> Output: "${secRes.data.stdout?.trim()}" (Keys are completely hidden) | ${secPass ? 'PASS' : 'FAIL'}`);

    // 14. Temporary Sandbox Directory Cleanup
    console.log('\n[TEST 14] Sandbox Cleanup: Verify Temporary Binaries are Purged');
    const sandboxesDir = path.join(__dirname, '..', 'scratch', 'sandboxes');
    const existingDirs = fs.existsSync(sandboxesDir) ? fs.readdirSync(sandboxesDir) : [];
    const cleanupPass = existingDirs.length === 0;
    results['Temp File Cleanup'] = cleanupPass ? 'PASS' : 'FAIL';
    console.log(`  -> Active Sandbox Directories Remaining: ${existingDirs.length} | ${cleanupPass ? 'PASS' : 'FAIL'}`);

    // ----------------------------------------------------
    // PART 2: BRANCH PERSONALIZATION TESTS
    // ----------------------------------------------------

    // 15. ECE -> Chips & Semiconductors
    console.log('\n[TEST 15] ECE Branch -> Chips & Semiconductors');
    const eceRes = await request({
        hostname: '127.0.0.1', port: 8080,
        path: '/api/branch-learning?branch=ECE&semester=2',
        method: 'GET'
    });
    const eceSpec = eceRes.data.specialization;
    const ecePass = eceRes.status === 200 && 
                    eceRes.data.resolvedBranch === 'ECE' &&
                    eceSpec.specializationTitle.includes('Chips & Semiconductors') &&
                    eceSpec.topicsCount === 25;
    results['ECE -> Chips & Semiconductors'] = ecePass ? 'PASS' : 'FAIL';
    console.log(`  -> Title: "${eceSpec.specializationTitle}" | Topics Count: ${eceSpec.topicsCount} | ${ecePass ? 'PASS' : 'FAIL'}`);

    // 16. Automobile Engineering -> Automobile Engines
    console.log('\n[TEST 16] Automobile Engineering Branch -> Automobile Engines');
    const autoRes = await request({
        hostname: '127.0.0.1', port: 8080,
        path: '/api/branch-learning?branch=Automobile%20Engineering&semester=6',
        method: 'GET'
    });
    const autoSpec = autoRes.data.specialization;
    const autoPass = autoRes.status === 200 && 
                     autoRes.data.resolvedBranch === 'AUTO' &&
                     autoSpec.specializationTitle.includes('Automobile Engines') &&
                     autoSpec.topicsCount === 24;
    results['Automobile -> Automobile Engines'] = autoPass ? 'PASS' : 'FAIL';
    console.log(`  -> Title: "${autoSpec.specializationTitle}" | Topics Count: ${autoSpec.topicsCount} | ${autoPass ? 'PASS' : 'FAIL'}`);

    // 17. No Unnecessary Branch Pages
    console.log('\n[TEST 17] Architecture Check: Single Dynamic Branch Learning Experience');
    const branchFiles = fs.readdirSync(path.join(__dirname, '..')).filter(f => f.startsWith('branch-') && f.endsWith('.html'));
    const singleExperiencePass = branchFiles.length === 1 && branchFiles[0] === 'branch-learning.html';
    results['Single Dynamic Branch Learning Experience'] = singleExperiencePass ? 'PASS' : 'FAIL';
    console.log(`  -> Branch HTML pages found: [${branchFiles.join(', ')}] (No redundant branch pages created) | ${singleExperiencePass ? 'PASS' : 'FAIL'}`);

    // Summary Table
    console.log('\n====================================================');
    console.log('SUMMARY OF ALL TEST RESULTS:');
    console.log('====================================================');
    for (const [testName, status] of Object.entries(results)) {
        console.log(`  ${testName.padEnd(45)}: ${status}`);
    }

    const allPassed = Object.values(results).every(s => s === 'PASS');
    console.log('\nOVERALL RESULT:', allPassed ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌');
}

runVerification().catch(console.error);
