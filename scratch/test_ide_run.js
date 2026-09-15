const ide = require('../scripts/ide_runner.js');

async function runTests() {
    console.log('=== TEST 1: JavaScript Normal Execution ===');
    const res1 = await ide.executeCode({
        language: 'javascript',
        code: 'console.log("Engineering Matrix Computed: " + (6 * 7));',
        timeoutMs: 3000
    });
    console.log('Success:', res1.success);
    console.log('Stdout:', res1.stdout ? res1.stdout.trim() : '');

    console.log('\n=== TEST 2: JavaScript Infinite Loop Timeout ===');
    const res2 = await ide.executeCode({
        language: 'javascript',
        code: 'while (true) { /* infinite loop */ }',
        timeoutMs: 2000
    });
    console.log('Timed out:', res2.timedOut);
    console.log('Status:', res2.status);
    console.log('Message:', res2.stderr || res2.message);

    console.log('\n=== TEST 3: Java Normal Execution ===');
    const javaCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Java OpenJDK 17 execution successful: 100 * 20 = " + (100 * 20));
    }
}`;
    const res3 = await ide.executeCode({
        language: 'java',
        code: javaCode,
        timeoutMs: 6000
    });
    console.log('Success:', res3.success);
    console.log('Stdout:', res3.stdout ? res3.stdout.trim() : '');
    if (res3.stderr) console.log('Stderr:', res3.stderr);

    console.log('\n=== TEST 4: Java Compilation Error ===');
    const javaErrCode = `public class Main {
    public static void main(String[] args) {
        int x = "incompatible";
    }
}`;
    const res4 = await ide.executeCode({
        language: 'java',
        code: javaErrCode,
        timeoutMs: 5000
    });
    console.log('Success:', res4.success);
    console.log('Status:', res4.status);
    console.log('Diagnostics:', res4.stderr ? res4.stderr.trim() : '');
}

runTests();
