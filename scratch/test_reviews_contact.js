// ==============================================================================
// Verification Test Suite: Reviews & Contact Us Flow for BTechPath AI
// ==============================================================================

const http = require('http');

const PORT = 8080;
const BASE_URL = `http://localhost:${PORT}`;
const ADMIN_EMAIL = 'rahulashokhlakkimsetty@gmail.com';

function makeRequest(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const reqHeaders = { ...headers };
        let payload = null;

        if (body) {
            payload = JSON.stringify(body);
            reqHeaders['Content-Type'] = 'application/json';
            reqHeaders['Content-Length'] = Buffer.byteLength(payload);
        }

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: reqHeaders
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let json = null;
                try {
                    json = JSON.parse(data);
                } catch (e) {}
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    raw: data,
                    body: json
                });
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting Verification Test Suite for Reviews & Contact Us...');
    let passed = 0;
    let failed = 0;

    const assert = (condition, title) => {
        if (condition) {
            console.log(`  ✅ PASS: ${title}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${title}`);
            failed++;
        }
    };

    try {
        // -------------------------------------------------------------
        // 1. Clean URL Routing & Page Delivery
        // -------------------------------------------------------------
        console.log('\n--- 1. Testing Routing & Page Delivery ---');
        const resReviews = await makeRequest('GET', '/reviews');
        assert(resReviews.status === 200, 'GET /reviews resolves with 200 OK');
        assert(resReviews.raw.includes('What Students Say About TechPath') || resReviews.raw.includes('What Students Say About BTechPath AI'), 'Reviews page contains expected heading');
        assert(resReviews.raw.includes('lakkimsettirahulashok@gmail.com'), 'Reviews page contains support email');
        assert(!resReviews.raw.includes('whatsapp') && !resReviews.raw.includes('wa.me'), 'Reviews page has NO WhatsApp numbers');

        const resContact = await makeRequest('GET', '/contact');
        assert(resContact.status === 200, 'GET /contact resolves with 200 OK');
        assert(resContact.raw.includes('Contact Us'), 'Contact page contains expected heading');
        assert(resContact.raw.includes('lakkimsettirahulashok@gmail.com'), 'Contact page contains support email');
        assert(!resContact.raw.includes('whatsapp') && !resContact.raw.includes('wa.me'), 'Contact page has NO WhatsApp numbers');

        // -------------------------------------------------------------
        // 2. Reviews API & Honest Empty State (No fake testimonials)
        // -------------------------------------------------------------
        console.log('\n--- 2. Testing Reviews API & Public Display ---');
        const resGetRev = await makeRequest('GET', '/api/reviews');
        assert(resGetRev.status === 200, 'GET /api/reviews returns 200 OK');
        assert(resGetRev.body && resGetRev.body.success === true, 'GET /api/reviews returns success: true');
        assert(typeof resGetRev.body.averageRating === 'number', 'GET /api/reviews returns averageRating');
        assert(typeof resGetRev.body.totalApproved === 'number', 'GET /api/reviews returns totalApproved');

        // -------------------------------------------------------------
        // 3. Review Validation & Moderation Flow
        // -------------------------------------------------------------
        console.log('\n--- 3. Testing Review Submission & Admin Moderation ---');
        // Test invalid rating
        const resBadRating = await makeRequest('POST', '/api/reviews', {
            rating: 6,
            review_text: 'This is a test review with bad rating.',
            feature_used: 'AI Notes'
        });
        assert(resBadRating.status === 400, 'POST /api/reviews rejects invalid rating > 5 (400 Bad Request)');

        // Test review text too short
        const resShort = await makeRequest('POST', '/api/reviews', {
            rating: 5,
            review_text: 'Short',
            feature_used: 'AI Notes'
        });
        assert(resShort.status === 400, 'POST /api/reviews rejects review text under 10 chars (400 Bad Request)');

        // Test valid review submission
        const uniqueText = `Automated verification review: BTechPath AI helped me ace my semester exams! ${Date.now()}`;
        const resValidRev = await makeRequest('POST', '/api/reviews', {
            name: 'Verification Student',
            rating: 5,
            review_text: uniqueText,
            feature_used: 'AI Notes'
        });
        assert(resValidRev.status === 201, 'POST /api/reviews accepts valid review (201 Created)');
        assert(resValidRev.body.review && resValidRev.body.review.status === 'pending', 'Submitted review has status = pending');

        const reviewId = resValidRev.body.review.id;

        // Verify that pending review is NOT visible on public /api/reviews
        const resPublicCheck = await makeRequest('GET', '/api/reviews');
        const isPubliclyVisible = (resPublicCheck.body.reviews || []).some(r => r.id === reviewId);
        assert(!isPubliclyVisible, 'Pending review is NOT visible on public /api/reviews');

        // Verify review is visible to admin
        const resAdminCheck = await makeRequest('GET', '/api/reviews/admin', null, { 'X-Admin-Email': ADMIN_EMAIL });
        assert(resAdminCheck.status === 200, 'GET /api/reviews/admin with admin header returns 200');
        const adminFound = (resAdminCheck.body.reviews || []).find(r => r.id === reviewId);
        assert(adminFound && adminFound.status === 'pending', 'Review is visible in admin moderation queue with status pending');

        // Admin approves review
        const resApprove = await makeRequest('PATCH', `/api/reviews/admin/${reviewId}`, {
            status: 'approved',
            adminEmail: ADMIN_EMAIL
        }, { 'X-Admin-Email': ADMIN_EMAIL });
        assert(resApprove.status === 200, 'PATCH /api/reviews/admin/:id approves review with 200 OK');

        // Verify approved review IS now visible on public /api/reviews
        const resPublicApproved = await makeRequest('GET', '/api/reviews');
        const isNowPublic = (resPublicApproved.body.reviews || []).some(r => r.id === reviewId);
        assert(isNowPublic, 'Approved review is now visible on public /api/reviews');

        // Test filtering by rating
        const resRatingFilter = await makeRequest('GET', '/api/reviews?rating=5');
        assert(resRatingFilter.body.reviews.every(r => r.rating === 5), 'GET /api/reviews?rating=5 returns 5-star reviews only');

        // Admin rejects review
        const resReject = await makeRequest('PATCH', `/api/reviews/admin/${reviewId}`, {
            status: 'rejected',
            adminEmail: ADMIN_EMAIL
        }, { 'X-Admin-Email': ADMIN_EMAIL });
        assert(resReject.status === 200, 'PATCH /api/reviews/admin/:id rejects review with 200 OK');

        // Verify rejected review is removed from public /api/reviews
        const resPublicAfterReject = await makeRequest('GET', '/api/reviews');
        const isPublicAfterReject = (resPublicAfterReject.body.reviews || []).some(r => r.id === reviewId);
        assert(!isPublicAfterReject, 'Rejected review is NOT visible on public /api/reviews');

        // Admin deletes test review
        const resDeleteRev = await makeRequest('DELETE', `/api/reviews/admin/${reviewId}`, {
            adminEmail: ADMIN_EMAIL
        }, { 'X-Admin-Email': ADMIN_EMAIL });
        assert(resDeleteRev.status === 200, 'DELETE /api/reviews/admin/:id deletes review with 200 OK');

        // -------------------------------------------------------------
        // 4. Contact Form Validation & Admin Triage
        // -------------------------------------------------------------
        console.log('\n--- 4. Testing Contact Us Submission & Admin Triage ---');
        // Test missing / invalid email
        const resBadEmail = await makeRequest('POST', '/api/contact', {
            name: 'John',
            email: 'not-an-email',
            category: 'General Question',
            subject: 'Hello',
            message: 'This is a test message to support.'
        });
        assert(resBadEmail.status === 400, 'POST /api/contact rejects invalid email format (400 Bad Request)');

        // Test message too short
        const resShortMsg = await makeRequest('POST', '/api/contact', {
            name: 'John',
            email: 'john@example.com',
            category: 'General Question',
            subject: 'Test',
            message: 'Hi'
        });
        assert(resShortMsg.status === 400, 'POST /api/contact rejects message under 10 chars (400 Bad Request)');

        // Test valid contact message submission
        const resValidMsg = await makeRequest('POST', '/api/contact', {
            name: 'Deepak Kumar',
            email: 'deepak.kumar@btechpath.ai',
            category: 'Technical Issue',
            subject: 'Issue downloading AI study pack PDF',
            message: 'When I click generate study pack, the download stalls at 90 percent. Please assist.'
        });
        assert(resValidMsg.status === 201, 'POST /api/contact accepts valid inquiry (201 Created)');
        assert(resValidMsg.body.messageId, 'Response includes messageId');
        assert(resValidMsg.body.supportEmail === 'lakkimsettirahulashok@gmail.com', 'Response confirms official support email');

        const messageId = resValidMsg.body.messageId;

        // Admin fetches contact messages
        const resAdminMsgs = await makeRequest('GET', '/api/contact/admin', null, { 'X-Admin-Email': ADMIN_EMAIL });
        assert(resAdminMsgs.status === 200, 'GET /api/contact/admin returns 200 OK');
        const foundMsg = (resAdminMsgs.body.messages || []).find(m => m.id === messageId);
        assert(foundMsg && foundMsg.status === 'new', 'Submitted inquiry appears in admin inbox with status: new');

        // Admin updates status to in_progress
        const resProg = await makeRequest('PATCH', `/api/contact/admin/${messageId}`, {
            status: 'in_progress',
            admin_notes: 'Investigating PDF chunk streaming handler',
            adminEmail: ADMIN_EMAIL
        }, { 'X-Admin-Email': ADMIN_EMAIL });
        assert(resProg.status === 200, 'Admin marks inquiry as in_progress');
        assert(resProg.body.contactMessage.status === 'in_progress', 'Contact message status updated to in_progress');

        // Admin updates status to resolved
        const resResolved = await makeRequest('PATCH', `/api/contact/admin/${messageId}`, {
            status: 'resolved',
            admin_notes: 'Resolved via PDF generation retry fix',
            adminEmail: ADMIN_EMAIL
        }, { 'X-Admin-Email': ADMIN_EMAIL });
        assert(resResolved.status === 200, 'Admin marks inquiry as resolved');
        assert(resResolved.body.contactMessage.status === 'resolved', 'Contact message status updated to resolved');

        // Admin deletes inquiry
        const resDeleteMsg = await makeRequest('DELETE', `/api/contact/admin/${messageId}`, {
            adminEmail: ADMIN_EMAIL
        }, { 'X-Admin-Email': ADMIN_EMAIL });
        assert(resDeleteMsg.status === 200, 'DELETE /api/contact/admin/:id deletes message with 200 OK');

        // -------------------------------------------------------------
        // 5. Security & Authorization Bounds
        // -------------------------------------------------------------
        console.log('\n--- 5. Testing Security & Admin Authorization Bounds ---');
        const resUnauthRev = await makeRequest('GET', '/api/reviews/admin', null, { 'X-Admin-Email': 'imposter@student.com' });
        assert(resUnauthRev.status === 403, 'Non-admin blocked from /api/reviews/admin (403 Forbidden)');

        const resUnauthContact = await makeRequest('GET', '/api/contact/admin', null, { 'X-Admin-Email': 'imposter@student.com' });
        assert(resUnauthContact.status === 403, 'Non-admin blocked from /api/contact/admin (403 Forbidden)');

        console.log(`\n======================================================`);
        console.log(`  📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
        console.log(`======================================================\n`);

        process.exit(failed > 0 ? 1 : 0);
    } catch (err) {
        console.error('Fatal error during test execution:', err);
        process.exit(1);
    }
}

runTests();
