const http = require('http');

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

async function test() {
    console.log('--- TEST 1: GET /api/ide/runtimes ---');
    const runtimesRes = await request({
        hostname: '127.0.0.1',
        port: 8080,
        path: '/api/ide/runtimes',
        method: 'GET'
    });
    console.log('Runtimes status:', runtimesRes.status);
    console.log('Available runtimes:', (runtimesRes.data.runtimes || []).map(r => `${r.id}: ${r.name} (${r.available})`).join(', '));

    console.log('\n--- TEST 2: POST /api/ide/execute (C hello) ---');
    const cRes = await request({
        hostname: '127.0.0.1',
        port: 8080,
        path: '/api/ide/execute',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        language: 'c',
        code: '#include <stdio.h>\nint main() { printf("Hello from C API\\n"); return 0; }'
    });
    console.log('C Execute result:', cRes.data.success, 'stdout:', JSON.stringify(cRes.data.stdout), 'exitCode:', cRes.data.exitCode);

    console.log('\n--- TEST 3: GET /api/branch-learning?branch=ECE ---');
    const eceRes = await request({
        hostname: '127.0.0.1',
        port: 8080,
        path: '/api/branch-learning?branch=ECE&semester=2',
        method: 'GET'
    });
    console.log('ECE status:', eceRes.status, 'Title:', eceRes.data.specialization?.specializationTitle, 'Topics count:', eceRes.data.specialization?.topicsCount);

    console.log('\n--- TEST 4: GET /api/branch-learning?branch=Automobile%20Engineering ---');
    const autoRes = await request({
        hostname: '127.0.0.1',
        port: 8080,
        path: '/api/branch-learning?branch=Automobile%20Engineering&semester=6',
        method: 'GET'
    });
    console.log('AUTO status:', autoRes.status, 'Title:', autoRes.data.specialization?.specializationTitle, 'Topics count:', autoRes.data.specialization?.topicsCount);
}

test().catch(console.error);
