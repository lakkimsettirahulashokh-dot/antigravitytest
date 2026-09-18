// Scratch test to verify api/index.js routing logic
const handler = require('../api/index.js');

function mockReq(url, method = 'GET', headers = {}) {
    return {
        url,
        method,
        headers,
        query: {}
    };
}

function mockRes() {
    return {
        statusCode: 200,
        headers: {},
        body: '',
        setHeader(k, v) { this.headers[k] = v; },
        writeHead(code, headers) {
            this.statusCode = code;
            if (headers) Object.assign(this.headers, headers);
        },
        end(data) {
            this.body = data;
            return this;
        }
    };
}

async function runTests() {
    console.log('Testing api/index.js rewrite resolution...');

    // Test 1: Vercel rewrite with __route__ = ads/config
    const req1 = mockReq('/api/index.js?__route__=ads/config');
    const res1 = mockRes();
    await handler(req1, res1);
    console.log('1. /api/ads/config -> Status:', res1.statusCode, 'Body length:', res1.body.length);
    const parsed1 = JSON.parse(res1.body || '{}');
    if (parsed1.success && parsed1.config) {
        console.log('   [PASS] ads/config returned valid config!');
    } else {
        console.log('   [FAIL] ads/config failed');
    }

    // Test 2: Vercel rewrite with __route__ = branch-learning&branch=ECE&semester=2
    const req2 = mockReq('/api/index.js?__route__=branch-learning&branch=ECE&semester=2');
    const res2 = mockRes();
    await handler(req2, res2);
    console.log('2. /api/branch-learning?branch=ECE -> Status:', res2.statusCode);
    const parsed2 = JSON.parse(res2.body || '{}');
    if (parsed2.success && parsed2.specialization) {
        console.log('   [PASS] branch-learning returned specialization for ECE! Title:', parsed2.specialization.specializationTitle);
    } else {
        console.log('   [FAIL] branch-learning failed:', parsed2);
    }

    // Test 3: Vercel rewrite with __route__ = admin/check-role
    const req3 = mockReq('/api/index.js?__route__=admin/check-role');
    const res3 = mockRes();
    await handler(req3, res3);
    console.log('3. /api/admin/check-role -> Status:', res3.statusCode);
    const parsed3 = JSON.parse(res3.body || '{}');
    if (res3.statusCode === 200 && parsed3.role) {
        console.log('   [PASS] admin/check-role handled successfully! Role:', parsed3.role);
    } else {
        console.log('   [FAIL] admin/check-role:', res3.statusCode, parsed3);
    }

    // Test 4: Vercel rewrite with __route__ = study-tracker/today
    const req4 = mockReq('/api/index.js?__route__=study-tracker/today', 'GET', { 'x-user-id': 'test-user-123' });
    const res4 = mockRes();
    await handler(req4, res4);
    console.log('4. /api/study-tracker/today -> Status:', res4.statusCode);
    const parsed4 = JSON.parse(res4.body || '{}');
    if (res4.statusCode === 200 && parsed4.success) {
        console.log('   [PASS] study-tracker/today handled successfully!');
    } else {
        console.log('   [FAIL] study-tracker/today:', res4.statusCode, parsed4);
    }
}

runTests().catch(console.error);
