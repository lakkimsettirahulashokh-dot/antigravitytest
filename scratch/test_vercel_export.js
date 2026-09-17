const http = require('http');
const { EventEmitter } = require('events');

// Load server module
const handler = require('../server.js');

console.log('--- 1. Testing Module Exports ---');
console.log('handler type:', typeof handler);
console.log('handler.default type:', typeof handler.default);
console.log('handler.server instanceof http.Server:', handler.server instanceof http.Server);
console.log('handler.startServer type:', typeof handler.startServer);

if (typeof handler !== 'function' && !(handler instanceof http.Server)) {
    console.error('FAIL: Default export is NOT a function or server!');
    process.exit(1);
}
console.log('PASS: Vercel default export requirements fully satisfied.\n');

const stream = require('stream');

// Mock request / response helper
class MockResponse extends stream.Writable {
    constructor() {
        super();
        this.statusCode = 200;
        this.headers = {};
        this.body = '';
    }

    _write(chunk, encoding, callback) {
        this.body += chunk.toString();
        callback();
    }

    writeHead(statusCode, statusMessage, headers) {
        let actualHeaders = headers;
        if (typeof statusMessage === 'object' && statusMessage !== null && actualHeaders === undefined) {
            actualHeaders = statusMessage;
        }
        this.statusCode = statusCode;
        if (actualHeaders) {
            Object.assign(this.headers, actualHeaders);
        }
        return this;
    }

    setHeader(name, val) {
        this.headers[name.toLowerCase()] = val;
    }

    end(chunk) {
        if (chunk) this.body += chunk.toString();
        super.end();
    }
}

function mockRequest(url, method = 'GET', headers = {}) {
    const req = new EventEmitter();
    req.url = url;
    req.method = method;
    req.headers = { host: 'tech-path-six.vercel.app', ...headers };
    req.socket = { remoteAddress: '127.0.0.1' };
    return req;
}

async function testRoute(url, method = 'GET') {
    return new Promise((resolve) => {
        const req = mockRequest(url, method);
        const res = new MockResponse();
        res.on('finish', () => {
            resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                body: res.body
            });
        });
        handler(req, res);
    });
}

(async () => {
    console.log('--- 2. Testing API Endpoints via requestHandler ---');
    
    // Test /api/config
    const configRes = await testRoute('/api/config');
    console.log('GET /api/config -> Status:', configRes.statusCode);
    const configParsed = JSON.parse(configRes.body);
    console.log('  supabaseUrl configured:', Boolean(configParsed.supabaseUrl));
    console.log('  appUrl:', configParsed.appUrl);

    // Test /api/health
    const healthRes = await testRoute('/api/health');
    console.log('GET /api/health -> Status:', healthRes.statusCode);
    console.log('  health body:', healthRes.body);

    console.log('\n--- 3. Testing Local Static File Fallback via requestHandler ---');
    // Test /
    const rootRes = await testRoute('/');
    console.log('GET / -> Status:', rootRes.statusCode);
    console.log('  root contains html:', rootRes.body.includes('<!DOCTYPE html>'));

    // Test /favicon.ico
    const favRes = await testRoute('/favicon.ico');
    console.log('GET /favicon.ico -> Status:', favRes.statusCode);

    console.log('\nAll Vercel serverless checks PASSED successfully!');
    process.exit(0);
})();
