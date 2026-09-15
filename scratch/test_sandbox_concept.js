const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const sandbox = path.join(process.cwd(), 'scratch', 'test_sandbox');
fs.mkdirSync(sandbox, { recursive: true });

// 1. Test normal execution
const script1 = path.join(sandbox, 'test1.js');
fs.writeFileSync(script1, 'console.log("Hello BTechPath AI IDE"); console.log("Calculated:", 10 + 25);');

const child1 = spawn(process.execPath, [script1], {
    cwd: sandbox,
    env: { PATH: process.env.PATH },
    stdio: ['pipe', 'pipe', 'pipe']
});

let out1 = '';
let err1 = '';
child1.stdout.on('data', d => out1 += d);
child1.stderr.on('data', d => err1 += d);
child1.on('close', (code) => {
    console.log('--- Test 1 Normal Run ---');
    console.log('Exit Code:', code);
    console.log('Stdout:', out1.trim());
    console.log('Stderr:', err1.trim());

    // 2. Test Stdin
    const script2 = path.join(sandbox, 'test2.js');
    fs.writeFileSync(script2, `
        const readline = require('readline');
        const rl = readline.createInterface({ input: process.stdin });
        let lines = [];
        rl.on('line', l => lines.push(Number(l)));
        rl.on('close', () => {
            const sum = lines.reduce((a, b) => a + b, 0);
            console.log('Stdin sum:', sum);
        });
    `);

    const child2 = spawn(process.execPath, [script2], {
        cwd: sandbox,
        env: { PATH: process.env.PATH },
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let out2 = '';
    child2.stdout.on('data', d => out2 += d);
    child2.stdin.write('15\n25\n30\n');
    child2.stdin.end();

    child2.on('close', (code2) => {
        console.log('\n--- Test 2 Stdin Run ---');
        console.log('Exit Code:', code2);
        console.log('Stdout:', out2.trim());

        // 3. Test Infinite Loop & Timeout Kill
        const script3 = path.join(sandbox, 'test3.js');
        fs.writeFileSync(script3, 'console.log("Starting infinite loop..."); while(true) {}');

        const startTime = Date.now();
        const child3 = spawn(process.execPath, [script3], {
            cwd: sandbox,
            env: { PATH: process.env.PATH },
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let out3 = '';
        child3.stdout.on('data', d => out3 += d);

        const timeoutId = setTimeout(() => {
            console.log('\n--- Test 3 Infinite Loop Timeout ---');
            console.log('Timeout fired after', Date.now() - startTime, 'ms, killing process PID:', child3.pid);
            if (process.platform === 'win32') {
                const { execSync } = require('child_process');
                try { execSync(`taskkill /F /T /PID ${child3.pid}`); } catch (e) {}
            } else {
                child3.kill('SIGKILL');
            }
        }, 1500);

        child3.on('close', (code3) => {
            clearTimeout(timeoutId);
            console.log('Child 3 closed with code/signal:', code3);
            console.log('Stdout so far:', out3.trim());
            fs.rmSync(sandbox, { recursive: true, force: true });
            console.log('\n✅ All Sandbox Core Verification Steps Completed!');
        });
    });
});
