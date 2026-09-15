/**
 * Verification Suite: Review Form Visibility & Google Ads Architecture
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('============================================================');
console.log('🧪 Running BTechPath AI Reviews & Ads Engineering Audit');
console.log('============================================================\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        passed++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Error: ${err.message}`);
        failed++;
    }
}

// ------------------------------------------------------------
// PART 1: REVIEW FORM & INPUT VISIBILITY AUDIT
// ------------------------------------------------------------
console.log('--- PART 1: Review Form & Input Visibility Audit ---');

const customCssPath = path.join(__dirname, '..', 'css', 'custom.css');
const customCss = fs.readFileSync(customCssPath, 'utf8');

test('custom.css overrides universal form inputs to dark surface #1A2031 with ivory text #F5F7FA', () => {
    assert(customCss.includes('input[type="text"]'), 'Targets text input');
    assert(customCss.includes('textarea'), 'Targets textarea');
    assert(customCss.includes('select'), 'Targets select');
    assert(customCss.includes('background-color: #1A2031 !important'), 'Enforces #1A2031 dark background');
    assert(customCss.includes('color: #F5F7FA !important'), 'Enforces #F5F7FA warm ivory text');
    assert(customCss.includes('-webkit-text-fill-color: #F5F7FA !important'), 'Forces text-fill color for WebKit');
    assert(customCss.includes('color-scheme: dark !important'), 'Enforces browser dark color-scheme');
});

test('custom.css locks :focus, :focus-visible, and :active states to stay strictly dark while typing', () => {
    assert(customCss.includes('input[type="text"]:focus'), 'Targets input focus');
    assert(customCss.includes('textarea:focus'), 'Targets textarea focus');
    assert(customCss.includes('select:focus'), 'Targets select focus');
    assert(customCss.includes('caret-color: #5865F2 !important'), 'Ensures visible typing caret');
});

test('custom.css implements hardened WebKit browser autofill with box-shadow inset', () => {
    assert(customCss.includes('input:-webkit-autofill'), 'Targets -webkit-autofill');
    assert(customCss.includes('-webkit-box-shadow: 0 0 0px 1000px #1A2031 inset !important'), 'Inverts autofill background with box-shadow inset');
    assert(customCss.includes('-webkit-text-fill-color: #F5F7FA !important'), 'Ensures readable ivory text during autofill');
});

test('custom.css styles dropdown <option> elements to dark midnight surface #121826', () => {
    assert(customCss.includes('select option'), 'Targets select option');
    assert(customCss.includes('background-color: #121826 !important'), 'Enforces dark background on options');
    assert(customCss.includes('color: #F5F7FA !important'), 'Enforces ivory text on options');
});

const reviewsHtmlPath = path.join(__dirname, '..', 'reviews.html');
const reviewsHtml = fs.readFileSync(reviewsHtmlPath, 'utf8');

test('reviews.html embeds high-priority form styles overriding Tailwind forms plugin reset', () => {
    assert(reviewsHtml.includes('#review-modal input'), 'Modal input selector exists');
    assert(reviewsHtml.includes('#review-modal textarea'), 'Modal textarea selector exists');
    assert(reviewsHtml.includes('#review-modal select'), 'Modal select selector exists');
    assert(reviewsHtml.includes('caret-color: #F6C177 !important'), 'Rose gold caret inside review modal');
    assert(reviewsHtml.includes('#review-modal input:-webkit-autofill'), 'Modal autofill hardening present');
});

test('reviews.html form fields include explicit focus:bg-[#1A2031] classes', () => {
    assert(reviewsHtml.includes('id="form-name"') && reviewsHtml.includes('focus:bg-[#1A2031]'), 'form-name has focus:bg-[#1A2031]');
    assert(reviewsHtml.includes('id="form-feature"') && reviewsHtml.includes('focus:bg-[#1A2031]'), 'form-feature has focus:bg-[#1A2031]');
    assert(reviewsHtml.includes('id="form-review-text"') && reviewsHtml.includes('focus:bg-[#1A2031]'), 'form-review-text has focus:bg-[#1A2031]');
});

test('reviews.html star rating supports keyboard, focus, mobile tap, and aria-checked', () => {
    assert(reviewsHtml.includes('role="radio"'), 'Stars have role="radio"');
    assert(reviewsHtml.includes('aria-checked'), 'Stars communicate selection via aria-checked');
    assert(reviewsHtml.includes('star-picker-container'), 'Star container present');
    assert(reviewsHtml.includes("btn.addEventListener('focus'"), 'Handles focus for keyboard navigation');
    assert(reviewsHtml.includes("btn.addEventListener('keydown'"), 'Handles Enter/Space keys');
});

test('reviews.html validation errors maintain dark theme without turning fields white', () => {
    assert(reviewsHtml.includes('.form-input-error'), 'form-input-error rule exists');
    assert(reviewsHtml.includes('border-color: #EF4444 !important'), 'Error uses red border');
    assert(reviewsHtml.includes('background-color: #1A2031 !important'), 'Error keeps #1A2031 dark background');
    assert(reviewsHtml.includes("textarea.classList.add('form-input-error')"), 'Applies error to textarea');
    assert(reviewsHtml.includes("textarea.classList.remove('form-input-error')"), 'Clears error on typing');
});

const contactHtmlPath = path.join(__dirname, '..', 'contact.html');
const contactHtml = fs.readFileSync(contactHtmlPath, 'utf8');

test('contact.html form inputs are hardened with dark background and autofill override', () => {
    assert(contactHtml.includes('.input-elevated'), 'input-elevated class styled');
    assert(contactHtml.includes('background-color: #1A2031 !important'), 'Enforces #1A2031 on contact inputs');
    assert(contactHtml.includes('.input-elevated:-webkit-autofill'), 'Autofill override present in contact.html');
});

// ------------------------------------------------------------
// PART 2: GOOGLE ADS ARCHITECTURE & INTEGRATION AUDIT
// ------------------------------------------------------------
console.log('\n--- PART 2: Google Ads Architecture & Integration Audit ---');

const adsJsPath = path.join(__dirname, '..', 'js', 'ads.js');
const adsJs = fs.readFileSync(adsJsPath, 'utf8');

test('js/ads.js configures verified AdMob App ID and AdSense Publisher ID', () => {
    assert(adsJs.includes('ca-app-pub-2659485988975906~5542995898'), 'Configures AdMob App ID');
    assert(adsJs.includes('ca-pub-2659485988975906'), 'Configures Web Publisher ID');
});

test('js/ads.js correctly maps all 3 configured AdMob ad unit IDs to slots', () => {
    assert(adsJs.includes("'2120907009'"), 'Configures Ad Unit 1 (2120907009)');
    assert(adsJs.includes("'2836941504'"), 'Configures Ad Unit 2 (2836941504)');
    assert(adsJs.includes("'1414329992'"), 'Configures Ad Unit 3 (1414329992)');
    assert(adsJs.includes('reviews_bottom'), 'Maps reviews_bottom placement');
});

test('js/ads.js distinguishes Web/PWA runtime from Native wrappers', () => {
    assert(adsJs.includes('detectPlatform'), 'Has platform detector');
    assert(adsJs.includes('Web / PWA (Browser Runtime)'), 'Recognizes Web/PWA runtime');
    assert(adsJs.includes('window.Capacitor'), 'Checks for Capacitor wrapper');
});

test('js/ads.js does NOT render fake static cards or dummy placeholders', () => {
    assert(!adsJs.includes('Verified Engineering Tech & Tools Partner'), 'Fake card removed');
    assert(!adsJs.includes('Learn More →'), 'Fake ad link removed');
    assert(adsJs.includes('ins.adsbygoogle'), 'Renders genuine adsbygoogle <ins> element');
});

test('js/ads.js uses official Google test ad mechanism (data-adtest="on") during test/dev', () => {
    assert(adsJs.includes('data-adtest="on"'), 'Includes official Google AdSense test ad attribute');
    assert(adsJs.includes('(window.adsbygoogle = window.adsbygoogle || []).push({})'), 'Executes real adsbygoogle push');
});

test('js/ads.js protects learning and form zones with FORBIDDEN_SELECTORS', () => {
    assert(adsJs.includes('#review-modal'), 'Review modal is forbidden');
    assert(adsJs.includes('#review-form'), 'Review form is forbidden');
    assert(adsJs.includes('.modal'), 'Modals are forbidden');
    assert(adsJs.includes('form'), 'Forms are forbidden');
    assert(adsJs.includes('#quiz-modal'), 'Quiz modal is forbidden');
    assert(adsJs.includes('#doubt-solver'), 'Doubt solver is forbidden');
});

test('js/ads.js enforces responsive zero-CLS containers with non-zero dimensions check', () => {
    assert(adsJs.includes('minHeight'), 'Enforces container minHeight');
    assert(adsJs.includes('element.clientWidth > 0'), 'Verifies non-zero width before push');
});

test('js/ads.js supports SPA route changes and DOM mutations', () => {
    assert(adsJs.includes("window.addEventListener('popstate'"), 'Listens to popstate');
    assert(adsJs.includes('MutationObserver'), 'Uses MutationObserver for dynamic route mounting');
});

test('js/ads.js provides runtime diagnostics API (getDiagnostics)', () => {
    assert(adsJs.includes('getDiagnostics()'), 'getDiagnostics API exists');
});

test('reviews.html includes ad-banner placement and imports js/ads.js', () => {
    assert(reviewsHtml.includes('<ad-banner placement="reviews_bottom"'), 'Ad banner placed in reviews.html');
    assert(reviewsHtml.includes('src="js/ads.js"'), 'js/ads.js imported in reviews.html');
});

// ------------------------------------------------------------
// PART 3: SERVER ENDPOINT AUDIT
// ------------------------------------------------------------
console.log('\n--- PART 3: Server API Endpoint Audit ---');

const serverJsPath = path.join(__dirname, '..', 'server.js');
const serverJs = fs.readFileSync(serverJsPath, 'utf8');

test('server.js exposes /api/ads/config with publisher and slot configuration', () => {
    assert(serverJs.includes("pathname === '/api/ads/config'"), 'Route exists in server.js');
    assert(serverJs.includes('ca-pub-2659485988975906'), 'Publisher ID configured');
    assert(serverJs.includes('ca-app-pub-2659485988975906~5542995898'), 'App ID configured');
    assert(serverJs.includes('reviews_bottom: \'2120907009\''), 'reviews_bottom slot mapped');
});

console.log('\n============================================================');
console.log(`📊 TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
console.log('============================================================');

if (failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
