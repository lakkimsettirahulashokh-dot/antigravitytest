const { detectRuntimes, lintCode, executeCode } = require('../scripts/ide_runner.js');

async function test() {
    console.log('1. Available runtimes:', detectRuntimes().map(r => `${r.name} (${r.version})`));

    const lint1 = lintCode({ language: 'javascript', code: 'const a = 10; console.log(a);' });
    console.log('2. Valid code diagnostics count:', lint1.diagnostics.length);

    const lint2 = lintCode({ language: 'javascript', code: 'const = 5;' });
    console.log('3. Invalid code diagnostics:', lint2.diagnostics);

    const execRes = await executeCode({ language: 'javascript', code: 'console.log("IDE Runner Operational!"); console.log(12 * 12);' });
    console.log('4. Exec status:', execRes.status, 'stdout:', execRes.stdout.trim(), 'time:', execRes.executionTimeMs, 'ms');
}

test();
