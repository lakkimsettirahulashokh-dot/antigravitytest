const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8080;

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
    if (condition) {
        console.log(`  ✅ PASS: ${testName}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
        failed++;
    }
}

async function testHttpAsset(filePath) {
    return new Promise((resolve) => {
        http.get(`http://localhost:${PORT}/${filePath}`, (res) => {
            let size = 0;
            res.on('data', chunk => size += chunk.length);
            res.on('end', () => {
                resolve({ status: res.statusCode, size, contentType: res.headers['content-type'] });
            });
        }).on('error', (err) => {
            resolve({ status: 500, error: err.message });
        });
    });
}

async function runVerification() {
    console.log('\n============================================================');
    console.log('🧪 BTechPath AI 3D WebGL Background Verification Test Suite');
    console.log('============================================================\n');

    // 1. Three.js local asset check
    console.log('📦 1. Three.js Production Asset Check:');
    const threePath = path.join(ROOT_DIR, 'js', 'three.min.js');
    assert(fs.existsSync(threePath), 'js/three.min.js exists locally');
    const threeStat = fs.statSync(threePath);
    assert(threeStat.size > 500000, `js/three.min.js is full production bundle (size: ${Math.round(threeStat.size / 1024)} KB)`);

    const threeHttp = await testHttpAsset('js/three.min.js');
    assert(threeHttp.status === 200, 'js/three.min.js served with HTTP 200 via server');

    // 2. btech-bg3d.js engine check
    console.log('\n🌌 2. 3D WebGL Background Engine (js/btech-bg3d.js) Check:');
    const enginePath = path.join(ROOT_DIR, 'js', 'btech-bg3d.js');
    assert(fs.existsSync(enginePath), 'js/btech-bg3d.js exists');
    const engineContent = fs.readFileSync(enginePath, 'utf8');

    // Color locks
    assert(engineContent.includes('0x0B0F19'), 'Locked palette: Deep Twilight (0x0B0F19)');
    assert(engineContent.includes('0x121826'), 'Locked palette: Midnight Surface (0x121826)');
    assert(engineContent.includes('0x1A2031'), 'Locked palette: Elevated Surface (0x1A2031)');
    assert(engineContent.includes('0x5865F2'), 'Locked palette: Primary Indigo (0x5865F2)');
    assert(engineContent.includes('0x7C5CFF'), 'Locked palette: Soft Violet (0x7C5CFF)');
    assert(engineContent.includes('0x2DD4BF'), 'Locked palette: Teal (0x2DD4BF)');
    assert(engineContent.includes('0xF6C177'), 'Locked palette: Rose Gold (0xF6C177)');

    // Three.js architectural features
    assert(engineContent.includes('THREE.WebGLRenderer'), 'Three.js WebGLRenderer utilized');
    assert(engineContent.includes('THREE.PerspectiveCamera'), 'True 3D PerspectiveCamera configured');
    assert(engineContent.includes('THREE.FogExp2'), 'Atmospheric FogExp2 in Deep Twilight active');
    assert(engineContent.includes('THREE.DirectionalLight'), 'Directional key & fill lights present');
    assert(engineContent.includes('THREE.PointLight'), 'Dynamic section accent PointLight present');
    assert(engineContent.includes('prefers-reduced-motion'), 'Reduced motion accessibility supported');
    assert(engineContent.includes('visibilitychange'), 'Tab visibility GPU conservation active');
    assert(engineContent.includes('btech-3d-bg-canvas'), 'Standard canvas ID btech-3d-bg-canvas used');

    // Specification #11 route accent checks
    const spec11Routes = [
        'home', 'dashboard', 'btech', 'ai', 'ai-notes', 'flashcards', 'quiz',
        'roadmap', 'career', 'skills', 'projects', 'internships', 'resume-builder',
        'exams', 'analytics', 'reviews', 'contact', 'admin', 'profile'
    ];
    let allRoutesPresent = true;
    for (const r of spec11Routes) {
        if (!engineContent.includes(`'${r}':`)) {
            allRoutesPresent = false;
            console.error(`  Missing route preset: ${r}`);
        }
    }
    assert(allRoutesPresent, 'All 19 section-specific 3D accent presets present (Spec #11)');

    const engineHttp = await testHttpAsset('js/btech-bg3d.js');
    assert(engineHttp.status === 200, 'js/btech-bg3d.js served with HTTP 200 via server');

    // 3. CSS Layering & Input Readability Check
    console.log('\n🎨 3. CSS Layering & Form Readability Check:');
    const cssPath = path.join(ROOT_DIR, 'css', 'custom.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    assert(cssContent.includes('#btech-3d-bg-canvas'), 'CSS targets #btech-3d-bg-canvas');
    assert(cssContent.includes('pointer-events: none'), 'Canvas has pointer-events: none');
    assert(cssContent.includes('z-index: 0'), 'Canvas positioned at z-index: 0');
    assert(cssContent.includes('position: fixed'), 'Canvas positioned with position: fixed');
    assert(cssContent.includes('z-index: 10'), 'Content elements set above canvas at z-index: 10+');
    assert(cssContent.includes('color: #F5F7FA !important'), 'Universal inputs guarantee ivory text readability');
    assert(cssContent.includes('background-color: #1A2031 !important'), 'Universal inputs guarantee dark #1A2031 background');

    // 4. Coverage across all 37 HTML files
    console.log('\n📄 4. 3D Background Coverage Across All 37 HTML Files:');
    const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));
    assert(htmlFiles.length >= 35, `Found ${htmlFiles.length} HTML files to inspect`);

    let coverageCount = 0;
    for (const htmlFile of htmlFiles) {
        const fileContent = fs.readFileSync(path.join(ROOT_DIR, htmlFile), 'utf8');
        const hasBgScript = fileContent.includes('btech-bg3d.js');
        const hasAppScript = fileContent.includes('js/app.js'); // app.js calls init3DBackground
        const isRedirect = fileContent.includes('http-equiv="refresh"');

        if (hasBgScript || hasAppScript || isRedirect) {
            coverageCount++;
        } else {
            console.warn(`  ⚠️ Missing 3D coverage in: ${htmlFile}`);
        }
    }
    assert(coverageCount === htmlFiles.length, `All ${htmlFiles.length}/${htmlFiles.length} HTML pages have 3D background coverage`);

    console.log('\n============================================================');
    console.log(`📊 Integration Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('============================================================\n');

    if (failed > 0) process.exit(1);
}

runVerification();
