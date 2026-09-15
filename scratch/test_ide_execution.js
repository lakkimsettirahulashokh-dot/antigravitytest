const { detectRuntimes, executeCode, lintCode } = require('../scripts/ide_runner.js');

async function testIDE() {
    console.log('--- 1. Testing detectRuntimes() ---');
    const runtimes = detectRuntimes();
    console.log(runtimes.map(r => ({ id: r.id, name: r.name, available: r.available, version: r.version })));

    console.log('\n--- 2. Testing JavaScript Execution ---');
    const jsRes = await executeCode({
        language: 'javascript',
        code: 'const x = 20; const y = 22; console.log("Answer:", x + y);'
    });
    console.log('JS Result:', { success: jsRes.success, status: jsRes.status, stdout: jsRes.stdout.trim() });

    console.log('\n--- 3. Testing Java Execution (Compile + Run) ---');
    const javaCode = `
public class MatrixTest {
    public static void main(String[] args) {
        int a = 15;
        int b = 27;
        System.out.println("Java Computed Sum: " + (a + b));
    }
}
    `;
    const javaRes = await executeCode({
        language: 'java',
        code: javaCode
    });
    console.log('Java Result:', { success: javaRes.success, status: javaRes.status, stdout: javaRes.stdout.trim() });

    console.log('\n--- 4. Testing Java Compilation Error ---');
    const javaErrCode = `
public class Broken {
    public static void main(String[] args) {
        System.out.println("Missing semicolon")
    }
}
    `;
    const javaErrRes = await executeCode({
        language: 'java',
        code: javaErrCode
    });
    console.log('Java Error Result:', { success: javaErrRes.success, status: javaErrRes.status, compileError: Boolean(javaErrRes.compileError) });

    console.log('\n--- 5. Testing Infinite Loop Timeout ---');
    const loopRes = await executeCode({
        language: 'javascript',
        code: 'while(true){}',
        timeoutMs: 1500
    });
    console.log('Loop Result:', { success: loopRes.success, status: loopRes.status, exitCode: loopRes.exitCode });

    console.log('\n--- 6. Testing Stdin Input ---');
    const stdinRes = await executeCode({
        language: 'javascript',
        code: `
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log("Read input:", input);
        `,
        stdin: "Engineering 42"
    });
    console.log('Stdin Result:', { success: stdinRes.success, stdout: stdinRes.stdout.trim() });
}

testIDE().catch(console.error);
