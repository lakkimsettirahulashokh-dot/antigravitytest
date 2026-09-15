const runner = require('../scripts/ide_runner');

async function testAll() {
    console.log('--- RUNTIMES ---');
    const runtimes = runner.detectRuntimes();
    console.log(runtimes.map(r => `${r.id}: ${r.name} (${r.available ? 'AVAILABLE - ' + (r.version || '') : 'NOT INSTALLED'})`).join('\n'));

    console.log('\n--- 1. C HELLO WORLD ---');
    const cRes = await runner.executeCode({
        language: 'c',
        code: '#include <stdio.h>\nint main() {\n    printf("Hello from C\\n");\n    return 0;\n}'
    });
    console.log('Success:', cRes.success, 'Status:', cRes.status, 'Stdout:', JSON.stringify(cRes.stdout), 'Stderr:', cRes.stderr);

    console.log('\n--- 2. C COMPILER ERROR ---');
    const cErr = await runner.executeCode({
        language: 'c',
        code: '#include <stdio.h>\nint main() {\n    printf("Hello"\n    return 0;\n}'
    });
    console.log('Success:', cErr.success, 'Status:', cErr.status, 'CompileError:', JSON.stringify(cErr.compileError || cErr.stderr));

    console.log('\n--- 3. C STDIN (10 20 -> 30) ---');
    const cStdin = await runner.executeCode({
        language: 'c',
        code: '#include <stdio.h>\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("%d\\n", a + b);\n    return 0;\n}',
        stdin: '10 20'
    });
    console.log('Success:', cStdin.success, 'Status:', cStdin.status, 'Stdout:', JSON.stringify(cStdin.stdout));

    console.log('\n--- 4. C++ HELLO WORLD ---');
    const cppRes = await runner.executeCode({
        language: 'cpp',
        code: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello from C++" << endl;\n    return 0;\n}'
    });
    console.log('Success:', cppRes.success, 'Status:', cppRes.status, 'Stdout:', JSON.stringify(cppRes.stdout));

    console.log('\n--- 5. C++ COMPILER ERROR ---');
    const cppErr = await runner.executeCode({
        language: 'cpp',
        code: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Invalid" << non_existent_variable;\n    return 0;\n}'
    });
    console.log('Success:', cppErr.success, 'Status:', cppErr.status, 'CompileError:', JSON.stringify(cppErr.compileError || cppErr.stderr));

    console.log('\n--- 6. PYTHON EXECUTION ---');
    const pyRes = await runner.executeCode({
        language: 'python',
        code: 'print("Hello from Python")\nprint(10 / 2)'
    });
    console.log('Success:', pyRes.success, 'Status:', pyRes.status, 'Stdout:', JSON.stringify(pyRes.stdout));

    console.log('\n--- 7. PYTHON SYNTAX ERROR ---');
    const pyErr = await runner.executeCode({
        language: 'python',
        code: 'print("Hello"'
    });
    console.log('Success:', pyErr.success, 'Status:', pyErr.status, 'Stderr:', JSON.stringify(pyErr.stderr));

    console.log('\n--- 8. C TIMEOUT PROTECTION ---');
    const timeoutRes = await runner.executeCode({
        language: 'c',
        code: 'int main() { while(1) {} return 0; }',
        timeoutMs: 2000
    });
    console.log('Success:', timeoutRes.success, 'Status:', timeoutRes.status, 'Stderr:', JSON.stringify(timeoutRes.stderr), 'Duration:', timeoutRes.executionTimeMs);
}

testAll().catch(console.error);
