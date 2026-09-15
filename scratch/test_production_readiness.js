/**
 * scratch/test_production_readiness.js
 * Verification test suite for:
 * 1. Mobile Breakpoint & Viewport System
 * 2. Sticky Mobile CTA
 * 3. Loading States System
 * 4. Thank You Page & Contact Form Flow
 * 5. Cookie / Consent Banner System
 * 6. Privacy-Safe Analytics System (Consent-Gated & Blocked Config Detection)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
let testFailures = 0;

function assert(condition, testName, details = '') {
    if (condition) {
        console.log(`  [PASS] ${testName}`);
    } else {
        console.error(`  [FAIL] ${testName}: ${details}`);
        testFailures++;
    }
}

console.log('================================================================');
console.log('  BTechPath AI OS — Mobile, Sticky CTA, Loading, Cookie, Analytics Audit');
console.log('================================================================\n');

// -------------------------------------------------------------
// 1. MOBILE BREAKPOINT & RESPONSIVE VIEWPORT SYSTEM
// -------------------------------------------------------------
console.log('--- 1. Testing Mobile Viewport & Breakpoint Protection ---');
const customCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'custom.css'), 'utf8');

assert(
    customCss.includes('overflow-x: hidden') && customCss.includes('max-width: 100vw'),
    'CSS Viewport Overflow Guard',
    'custom.css must contain max-width: 100vw and overflow-x: hidden on html, body'
);

assert(
    customCss.includes('min-height: 44px') && customCss.includes('@media (max-width: 767px)'),
    'Mobile Touch Target Ergonomics',
    'custom.css must specify min-height: 44px for mobile buttons and interactive targets'
);

assert(
    customCss.includes('-webkit-autofill') && customCss.includes('-webkit-text-fill-color: #F5F7FA'),
    'Dark Theme Autofill Style Override',
    'custom.css must override browser autofill to prevent white background flash'
);

assert(
    customCss.includes('.skeleton-shimmer') && customCss.includes('@keyframes shimmer'),
    'Skeleton Shimmer Loading Utility',
    'custom.css must define skeleton-shimmer with brand keyframes'
);

const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));
let missingViewportMeta = 0;
htmlFiles.forEach(f => {
    const c = fs.readFileSync(path.join(ROOT_DIR, f), 'utf8');
    if (!c.includes('name="viewport"') || !c.includes('width=device-width')) {
        missingViewportMeta++;
    }
});
assert(missingViewportMeta === 0, 'All 44 HTML Files Have Responsive Viewport Meta', `${missingViewportMeta} files missing viewport tag`);


// -------------------------------------------------------------
// 2. STICKY MOBILE CTA
// -------------------------------------------------------------
console.log('\n--- 2. Testing Sticky Mobile CTA on Home Page ---');
const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

assert(
    indexHtml.includes('id="sticky-mobile-cta"'),
    'Sticky Mobile CTA Container Exists',
    'index.html must include element with id="sticky-mobile-cta"'
);

assert(
    indexHtml.includes('id="btn-sticky-mobile-cta"') && indexHtml.includes('Start Your Journey'),
    'Sticky Mobile CTA Label & Target',
    'CTA must contain "Start Your Journey"'
);

assert(
    indexHtml.includes('md:hidden') && indexHtml.includes('fixed inset-x-0'),
    'Sticky Mobile CTA Mobile-Only Constraint',
    'CTA must be mobile only (md:hidden) and fixed at bottom'
);

assert(
    customCss.includes('--cookie-banner-offset') && customCss.includes('#sticky-mobile-cta'),
    'Sticky CTA & Cookie Banner Dynamic Stacking',
    'custom.css defines --cookie-banner-offset for smooth stacking'
);


// -------------------------------------------------------------
// 3. CONSISTENT LOADING STATES SYSTEM
// -------------------------------------------------------------
console.log('\n--- 3. Testing Consistent Loading States System ---');
const loadingSystem = require('../js/loading-system.js');

assert(typeof loadingSystem.show === 'function', 'BTechPathLoading.show exists');
assert(typeof loadingSystem.hide === 'function', 'BTechPathLoading.hide exists');
assert(typeof loadingSystem.setButtonLoading === 'function', 'BTechPathLoading.setButtonLoading exists');
assert(typeof loadingSystem.resetButton === 'function', 'BTechPathLoading.resetButton exists');
assert(typeof loadingSystem.renderPipeline === 'function', 'BTechPathLoading.renderPipeline exists');

// Test HTML escaping in loading
const escaped = loadingSystem.escapeHtml('<script>alert(1)</script>');
assert(escaped === '&lt;script&gt;alert(1)&lt;/script&gt;', 'Loading System Sanitizes XSS Characters');


// -------------------------------------------------------------
// 4. THANK YOU PAGE & CONTACT FORM CONFIRMATION
// -------------------------------------------------------------
console.log('\n--- 4. Testing Thank You Page & Contact Form Flow ---');
assert(fs.existsSync(path.join(ROOT_DIR, 'thank-you.html')), 'thank-you.html File Exists on Disk');

const thankYouHtml = fs.readFileSync(path.join(ROOT_DIR, 'thank-you.html'), 'utf8');
assert(
    thankYouHtml.includes('<meta name="robots" content="noindex, nofollow">'),
    'Thank You Page Has noindex, nofollow Directives',
    'Must prevent search engines from indexing confirmation pages'
);

assert(
    thankYouHtml.includes('id="confirm-heading"') && thankYouHtml.includes('id="confirm-message"'),
    'Thank You Page Has Context-Aware Elements',
    'Page dynamically renders messages based on ?source=contact or ?source=review'
);

const contactHtml = fs.readFileSync(path.join(ROOT_DIR, 'contact.html'), 'utf8');
assert(
    contactHtml.includes("window.location.href = 'thank-you.html?source=contact'"),
    'Contact Form Redirects to Thank You on Confirmed Save',
    'contact.html must redirect to thank-you.html only on confirmed 201 success'
);

assert(
    contactHtml.includes("this.showAlert(`Unable to send — Retry."),
    'Contact Form Keeps User on Form on Failure with Retry Action',
    'Failed submissions must stay on form and show Retry state'
);


// -------------------------------------------------------------
// 5. COOKIE / CONSENT BANNER SYSTEM
// -------------------------------------------------------------
console.log('\n--- 5. Testing Cookie / Consent Banner System ---');
const consentSystem = require('../js/cookie-consent.js');

assert(typeof consentSystem.getConsent === 'function', 'BTechPathConsent.getConsent exists');
assert(typeof consentSystem.hasConsent === 'function', 'BTechPathConsent.hasConsent exists');
assert(typeof consentSystem.setConsent === 'function', 'BTechPathConsent.setConsent exists');
assert(typeof consentSystem.openPreferences === 'function', 'BTechPathConsent.openPreferences exists');
assert(typeof consentSystem.onConsentChange === 'function', 'BTechPathConsent.onConsentChange exists');

// Test essential category is always true
assert(consentSystem.hasConsent('essential') === true, 'Essential Storage is Always Allowed');


// -------------------------------------------------------------
// 6. PRIVACY-SAFE ANALYTICS SYSTEM
// -------------------------------------------------------------
console.log('\n--- 6. Testing Privacy-Safe Analytics System ---');
const analyticsSystem = require('../js/analytics.js');

assert(typeof analyticsSystem.init === 'function', 'BTechPathAnalytics.init exists');
assert(typeof analyticsSystem.trackPageView === 'function', 'BTechPathAnalytics.trackPageView exists');
assert(typeof analyticsSystem.trackEvent === 'function', 'BTechPathAnalytics.trackEvent exists');
assert(typeof analyticsSystem.sanitizeParams === 'function', 'BTechPathAnalytics.sanitizeParams exists');

// Test sanitization filter
const dirtyPayload = {
    feature: 'ai_notes',
    document_type: 'pdf',
    password: 'supersecretpassword123',
    user_email: 'student@example.com',
    resume_text: 'Confidential student GPA and address',
    transcript: 'Audio recording transcription'
};
const cleaned = analyticsSystem.sanitizeParams(dirtyPayload);

assert(
    cleaned.feature === 'ai_notes' && cleaned.document_type === 'pdf',
    'Safe Parameters Preserved',
    'feature and document_type must be kept'
);

assert(
    !cleaned.password && !cleaned.user_email && !cleaned.resume_text && !cleaned.transcript,
    'Sensitive Parameters Stripped by Privacy Filter',
    'Passwords, emails, resumes, PDFs, and transcripts must be completely excluded'
);

// Verify no fake ID in .env
const envContent = fs.readFileSync(path.join(ROOT_DIR, '.env'), 'utf8');
const fakeIdMatches = envContent.match(/G-[A-Z0-9]{8,}|UA-\d+-\d+/);
assert(
    fakeIdMatches === null,
    'No Fake Analytics ID in .env',
    'Fake measurement IDs (G-XXXXXXXXXX) must NOT be present in configuration'
);


// -------------------------------------------------------------
// 7. LIVE HTTP SERVER ENDPOINT VERIFICATION (Port 8080)
// -------------------------------------------------------------
console.log('\n--- 7. Testing Live HTTP Endpoints (Port 8080) ---');
const endpoints = [
    { url: 'http://localhost:8080/thank-you', status: 200, label: 'Clean Route /thank-you' },
    { url: 'http://localhost:8080/thank-you.html', status: 200, label: 'Direct File /thank-you.html' },
    { url: 'http://localhost:8080/js/loading-system.js', status: 200, label: 'Loading Script' },
    { url: 'http://localhost:8080/js/cookie-consent.js', status: 200, label: 'Cookie Consent Script' },
    { url: 'http://localhost:8080/js/analytics.js', status: 200, label: 'Analytics Script' }
];

let pending = endpoints.length;

endpoints.forEach(ep => {
    http.get(ep.url, (res) => {
        assert(res.statusCode === ep.status, `${ep.label} -> HTTP ${res.statusCode}`);
        pending--;
        if (pending === 0) {
            console.log('\n================================================================');
            if (testFailures === 0) {
                console.log('  ALL PRODUCTION-READINESS TESTS PASSED (0 FAILURES)!');
            } else {
                console.error(`  TEST SUITE COMPLETED WITH ${testFailures} FAILURES!`);
            }
            console.log('================================================================');
            process.exit(testFailures > 0 ? 1 : 0);
        }
    }).on('error', (err) => {
        assert(false, `${ep.label} Network Error: ${err.message}`);
        pending--;
        if (pending === 0) {
            process.exit(1);
        }
    });
});
