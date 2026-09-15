const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const BASE_URL = `http://localhost:${PORT}`;

function postJson(urlPath, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const req = http.request({
            hostname: 'localhost',
            port: PORT,
            path: urlPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(50000, () => {
            req.destroy();
            reject(new Error('Request timeout (50s)'));
        });
        req.write(data);
        req.end();
    });
}

function getJson(urlPath) {
    return new Promise((resolve, reject) => {
        const req = http.get({
            hostname: 'localhost',
            port: PORT,
            path: urlPath
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timeout (15s)'));
        });
    });
}

function deleteReq(urlPath) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: PORT,
            path: urlPath,
            method: 'DELETE'
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timeout (15s)'));
        });
        req.end();
    });
}

async function runTests() {
    console.log('===============================================================');
    console.log('BTECHPATH AI — AI DOUBT SOLVER & MULTIMODAL E2E VERIFICATION');
    console.log('===============================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  ✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${message}`);
            failed++;
        }
    }

    // -------------------------------------------------------------
    // TEST 1: Typed Question Solving (Mathematical / Circuit Derivation)
    // -------------------------------------------------------------
    console.log('--- TEST 1: Typed Question Solving ---');
    try {
        const q1 = 'A series RLC circuit has R = 20 Ohms, L = 0.1 H, and C = 50 microFarads connected to a 230V 50Hz AC supply. Find resonance frequency and impedance at resonance.';
        const res1 = await postJson('/api/ai/doubt', {
            question: q1,
            mode: 'detailed',
            branch: 'EEE',
            userEmail: 'alex.rivera@btechpath.ai'
        });

        assert(res1.status === 200, `HTTP status is 200 (received ${res1.status})`);
        assert(res1.data.success === true, 'Response indicates success === true');
        assert(Boolean(res1.data.detectedQuestion), `Question detected: "${res1.data.detectedQuestion?.slice(0, 50)}..."`);
        assert(Boolean(res1.data.structuredAnswer), 'Structured answer object present');
        assert(Boolean(res1.data.structuredAnswer?.finalAnswer), `Final answer provided: "${res1.data.structuredAnswer?.finalAnswer?.slice(0, 45)}..."`);
        assert(Array.isArray(res1.data.structuredAnswer?.stepByStepSolution), 'Step-by-step solution is an array');
        assert(Boolean(res1.data.structuredAnswer?.concept), `Concept identified: "${res1.data.structuredAnswer?.concept?.slice(0, 45)}..."`);
    } catch (e) {
        assert(false, `Test 1 failed with error: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 2: Real Image Question Multimodal Recognition
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Real Image Multimodal Analysis ---');
    let doubtId2 = null;
    let convId2 = null;
    try {
        // Use authentic image in workspace
        const sampleImgPath = 'C:/Users/LENOVO/.gemini/antigravity-ide/brain/9b69a063-24cd-4e1a-a928-16f7602527b3/.user_uploaded/media_1788764689512.jpg';
        let imgBase64 = '';
        if (fs.existsSync(sampleImgPath)) {
            imgBase64 = fs.readFileSync(sampleImgPath).toString('base64');
        } else {
            // 5x5 tiny test png
            imgBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
        }

        const res2 = await postJson('/api/ai/doubt', {
            image: {
                data: imgBase64,
                mimeType: 'image/jpeg',
                name: 'circuit_diagram_exam.jpg',
                size: imgBase64.length
            },
            mode: 'detailed',
            branch: 'CSE',
            userEmail: 'alex.rivera@btechpath.ai'
        });

        assert(res2.status === 200, `HTTP status is 200 for image submission (got ${res2.status})`);
        assert(res2.data.success === true, 'Image analysis returned success === true');
        assert(Boolean(res2.data.detectedQuestion), `AI extracted question from image: "${res2.data.detectedQuestion?.slice(0, 50)}..."`);
        assert(Boolean(res2.data.structuredAnswer?.finalAnswer), 'Image question solved with final answer');
        doubtId2 = res2.data.doubtId;
        convId2 = res2.data.conversationId;
    } catch (e) {
        assert(false, `Test 2 failed with error: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 3: Text + Image Question
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Text + Image Combined Query ---');
    try {
        const imgBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
        const res3 = await postJson('/api/ai/doubt', {
            question: 'Explain this diagram in simple intuitive terms for a first-year student.',
            image: {
                data: imgBase64,
                mimeType: 'image/png',
                name: 'system_diagram.png',
                size: 250
            },
            mode: 'simple',
            branch: 'AIML',
            userEmail: 'alex.rivera@btechpath.ai'
        });

        assert(res3.status === 200, `HTTP status is 200 for Text + Image`);
        assert(res3.data.success === true, 'Text + Image handled successfully');
        assert(Boolean(res3.data.structuredAnswer), 'Structured explanation generated');
    } catch (e) {
        assert(false, `Test 3 failed with error: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 4: Follow-up Question with Conversation Context
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Follow-up Question Maintaining Context ---');
    try {
        const followUp = await postJson('/api/ai/doubt', {
            question: 'Why did you use that formula in step 1? Can you give an alternative method?',
            conversationId: convId2 || 'conv_test_123',
            chatHistory: [
                { role: 'user', content: 'Solve the shortest path on this graph.' },
                { role: 'assistant', content: 'Step 1: Computed Bellman-Ford relaxation in O(V*E) time.' }
            ],
            userEmail: 'alex.rivera@btechpath.ai',
            branch: 'CSE'
        });

        assert(followUp.status === 200, 'Follow-up returns HTTP 200');
        assert(followUp.data.success === true, 'Follow-up succeeded without requiring re-upload of image');
        assert(Boolean(followUp.data.structuredAnswer), 'Follow-up explanation provided with structured breakdown');
    } catch (e) {
        assert(false, `Test 4 failed with error: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 5: Doubt History & Strict User Data Isolation
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Doubt History Persistence & User Isolation ---');
    try {
        // Fetch Alex's doubts
        const alexRes = await getJson('/api/ai/doubt/history?userId=alex.rivera@btechpath.ai');
        assert(alexRes.status === 200, 'Alex history returns HTTP 200');
        assert(alexRes.data.success === true, 'Alex history success === true');
        assert(alexRes.data.doubts.length > 0, `Alex has ${alexRes.data.doubts.length} saved doubts`);
        assert(alexRes.data.doubts.every(d => d.userId === 'alex.rivera@btechpath.ai'), 'All retrieved doubts strictly belong to Alex');

        // Fetch User B's doubts (should be isolated / 0 doubts)
        const userBRes = await getJson('/api/ai/doubt/history?userId=other.student@btechpath.ai');
        assert(userBRes.status === 200, 'User B history returns HTTP 200');
        assert(userBRes.data.doubts.length === 0, 'User B sees 0 doubts (Strict User Isolation verified: User B cannot view User A doubts)');

        // Cross-user deletion check (User B attempts to delete Alex's doubt)
        const targetDoubt = alexRes.data.doubts[0];
        if (targetDoubt && targetDoubt.id) {
            const forbiddenDelete = await deleteReq(`/api/ai/doubt/${targetDoubt.id}?userId=other.student@btechpath.ai`);
            assert(forbiddenDelete.status === 403, `Forbidden 403 returned when User B attempts to delete User A doubt (got ${forbiddenDelete.status})`);
            
            // Authorized deletion check (Alex deletes own doubt)
            const authorizedDelete = await deleteReq(`/api/ai/doubt/${targetDoubt.id}?userId=alex.rivera@btechpath.ai`);
            assert(authorizedDelete.status === 200, `HTTP 200 returned when Alex deletes own doubt (got ${authorizedDelete.status})`);
        }
    } catch (e) {
        assert(false, `Test 5 failed with error: ${e.message}`);
    }

    // -------------------------------------------------------------
    // TEST 6: File Validation & Error Handling
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Validation & Error Handling ---');
    try {
        // Empty query and empty image
        const emptyRes = await postJson('/api/ai/doubt', {});
        assert(emptyRes.status === 400, `Empty request rejected with 400 (got ${emptyRes.status})`);

        // Unsupported file format
        const badFileRes = await postJson('/api/ai/doubt', {
            image: { data: 'abc', mimeType: 'application/x-msdownload', name: 'virus.exe' }
        });
        assert(badFileRes.status === 400, `Executable/bad mime rejected with 400 (got ${badFileRes.status})`);
    } catch (e) {
        assert(false, `Test 6 failed with error: ${e.message}`);
    }

    console.log('\n===============================================================');
    console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) process.exit(1);
    else process.exit(0);
}

runTests();
