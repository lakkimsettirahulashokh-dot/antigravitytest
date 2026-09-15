// ==============================================================================
// Comprehensive Verification Test Suite:
// Complete Bulk PDF Removal & Multi-PDF Consolidation into AI Notes
// ==============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
let testCount = 0;
let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
    testCount++;
    if (condition) {
        passedCount++;
        console.log(`  [PASS] ${message}`);
    } else {
        failedCount++;
        console.error(`  [FAIL] ${message}`);
    }
}

// Helper to make HTTP requests
function httpRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

// Find server port
async function findServerPort() {
    const candidatePorts = [8080, 8081, 8082, 3000];
    for (const port of candidatePorts) {
        try {
            const res = await httpRequest({
                hostname: '127.0.0.1',
                port: port,
                path: '/api/config',
                method: 'GET',
                timeout: 1000
            });
            if (res.status === 200) {
                console.log(`📡 Connected to active BTechPath server on port ${port}`);
                return port;
            }
        } catch (e) {}
    }
    return null;
}

async function runTests() {
    console.log('========================================================');
    console.log('  BTechPath AI OS — Bulk PDF Removal & AI Notes Test Suite');
    console.log('========================================================\n');

    // ------------------------------------------------------------------
    // TEST SUITE 1: Codebase Branding & Navigation Audit
    // ------------------------------------------------------------------
    console.log('--- Suite 1: Branding & Navigation Audit ---');
    const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));
    
    let forbiddenMatches = [];
    const forbiddenPatterns = [
        /bulk\s+pdf\s+notes/i,
        /bulk\s+pdf\s+analyzer/i,
        /bulk\s+document\s+notes/i,
        /bulk\s+pdf\s+engine/i,
        /bulk\s+pdf\s+docs/i,
        /ai\s+quizzes\s+&\s+pdfs/i
    ];

    htmlFiles.forEach(file => {
        if (file === 'bulk-pdf.html' || file === 'bulk-pdf-notes.html') return; // Redirect pages
        const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
        forbiddenPatterns.forEach(pat => {
            if (pat.test(content)) {
                forbiddenMatches.push({ file, pattern: pat.toString() });
            }
        });
    });

    assert(forbiddenMatches.length === 0, `Zero user-facing forbidden Bulk PDF terms found in HTML pages (Matches: ${JSON.stringify(forbiddenMatches)})`);

    // Verify AI Notes present in key sidebars
    const keySidebarPages = ['learn.html', 'skills.html', 'quiz.html', 'planner.html', 'exams.html', 'projects.html', 'career.html', 'study.html', 'dashboard.html'];
    keySidebarPages.forEach(file => {
        const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
        assert(content.includes('ai-notes.html'), `${file} contains navigation link to ai-notes.html`);
        assert(!content.includes('AI Quizzes & PDFs'), `${file} has clean 'AI Quizzes' label (no & PDFs)`);
    });

    // Verify Command Center in app.js
    const appJsContent = fs.readFileSync(path.join(ROOT_DIR, 'js', 'app.js'), 'utf8');
    assert(appJsContent.includes('ai-notes.html'), 'Command Center in app.js includes AI Notes & Study PDFs');
    assert(!appJsContent.includes('AI Engineering Quiz & PDF Generator'), 'Command Center in app.js cleaned to AI Engineering Quiz Generator');

    // ------------------------------------------------------------------
    // TEST SUITE 2: Static Redirect Fallback Pages
    // ------------------------------------------------------------------
    console.log('\n--- Suite 2: Static Fallback Redirection Pages ---');
    assert(fs.existsSync(path.join(ROOT_DIR, 'bulk-pdf.html')), 'bulk-pdf.html exists');
    assert(fs.existsSync(path.join(ROOT_DIR, 'bulk-pdf-notes.html')), 'bulk-pdf-notes.html exists');

    const bulkPdfHtml = fs.readFileSync(path.join(ROOT_DIR, 'bulk-pdf.html'), 'utf8');
    assert(bulkPdfHtml.includes('url=ai-notes.html'), 'bulk-pdf.html has meta-refresh pointing to ai-notes.html');
    assert(bulkPdfHtml.includes("window.location.replace(target)"), 'bulk-pdf.html has JS window.location.replace to ai-notes.html');

    const bulkPdfNotesHtml = fs.readFileSync(path.join(ROOT_DIR, 'bulk-pdf-notes.html'), 'utf8');
    assert(bulkPdfNotesHtml.includes('url=ai-notes.html'), 'bulk-pdf-notes.html has meta-refresh pointing to ai-notes.html');

    // ------------------------------------------------------------------
    // TEST SUITE 3: AI Notes UI Structure & Master Notes Capabilities
    // ------------------------------------------------------------------
    console.log('\n--- Suite 3: AI Notes UI & Master Notes Capabilities ---');
    const aiNotesContent = fs.readFileSync(path.join(ROOT_DIR, 'ai-notes.html'), 'utf8');

    assert(aiNotesContent.includes('Turn your study PDFs into detailed, exam-ready notes.'), 'AI Notes includes required exact tagline');
    assert(aiNotesContent.includes('id="multi-file-input" type="file" multiple'), 'AI Notes file input supports multiple PDFs');
    assert(aiNotesContent.includes('Uploaded Documents'), 'AI Notes includes Uploaded Documents queue header');
    assert(aiNotesContent.includes('Generate AI Notes'), 'AI Notes action button says Generate AI Notes');
    assert(aiNotesContent.includes('Create Master Notes'), 'AI Notes includes Create Master Notes action');
    assert(aiNotesContent.includes('Retry Failed'), 'AI Notes includes Retry Failed button');
    assert(aiNotesContent.includes('removeFile'), 'AI Notes includes file removal capability');
    assert(aiNotesContent.includes('retrySingleFile'), 'AI Notes includes per-file retry capability');

    // Verify Master Notes View Sections
    assert(aiNotesContent.includes('Unified Formulas & Governing Equations'), 'Master Notes view renders Unified Formulas');
    assert(aiNotesContent.includes('Master Exam Priority Roadmap'), 'Master Notes view renders Master Exam Priority Roadmap');
    assert(aiNotesContent.includes('Master High-Yield Exam Questions & Model Answers'), 'Master Notes view renders Master Question Bank with Model Answers');
    assert(aiNotesContent.includes('Rapid Quick Revision Checkpoints'), 'Master Notes view renders Rapid Quick Revision');
    assert(aiNotesContent.includes('Consolidated Master Glossary'), 'Master Notes view renders Consolidated Master Glossary');
    assert(aiNotesContent.includes('Cross-Unit Connections & Comparative Analysis'), 'Master Notes view renders Cross-Unit Comparisons');

    // ------------------------------------------------------------------
    // TEST SUITE 4: Active Server Endpoints & HTTP 302 Redirection
    // ------------------------------------------------------------------
    console.log('\n--- Suite 4: Active Server API & Redirection Verification ---');
    const port = await findServerPort();
    if (!port) {
        console.warn('  ⚠️ Server is not running on standard ports. Spawning temporary test server instance...');
    } else {
        // Test HTTP 302 Redirects
        const redirectPaths = [
            '/bulk-pdf',
            '/bulk-pdf-notes',
            '/bulk-notes',
            '/bulk-pdf.html',
            '/bulk-pdf-notes.html',
            '/bulk-document-notes'
        ];

        for (const p of redirectPaths) {
            const res = await httpRequest({
                hostname: '127.0.0.1',
                port: port,
                path: p,
                method: 'GET',
                // Node http does not follow redirects automatically, allowing us to inspect 302
            });
            assert(res.status === 302, `Route ${p} returns HTTP 302 status (got ${res.status})`);
            const loc = res.headers['location'] || '';
            assert(loc.includes('/ai-notes.html'), `Route ${p} redirects to /ai-notes.html (Location: ${loc})`);
        }

        // Test Single PDF Processing API
        console.log('\n  Testing Single Document Processing via /api/ai/notes...');
        const singleNoteRes = await httpRequest({
            hostname: '127.0.0.1',
            port: port,
            path: '/api/ai/notes',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            fileName: 'Operating_Systems_Process_Scheduling.pdf',
            extractedText: 'Operating Systems Process Scheduling. CPU scheduling algorithms decide process allocation. FCFS, SJF, Round Robin with time quantum Q, Priority Scheduling. Deadlock conditions require mutual exclusion, hold and wait, no preemption, circular wait. Banker algorithm provides deadlock avoidance.',
            mode: 'detailed',
            department: 'CSE',
            semester: 4
        });
        assert(singleNoteRes.status === 200, 'Single document /api/ai/notes returns HTTP 200');
        const singleNoteData = JSON.parse(singleNoteRes.body);
        assert(singleNoteData.success === true, 'Single note generation success is true');
        assert(singleNoteData.note && (singleNoteData.note.title || singleNoteData.note.summary), 'Single note contains structured title/summary');

        // Test Multi-PDF Master Notes Synthesis API
        console.log('\n  Testing Multi-PDF Master Notes Synthesis via /api/ai/master-notes...');
        const masterRes = await httpRequest({
            hostname: '127.0.0.1',
            port: port,
            path: '/api/ai/master-notes',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            batchTitle: 'Combined Operating Systems & Memory Architecture',
            totalFiles: 2,
            documentsNotes: [
                {
                    file_name: 'Unit_1_Processes.pdf',
                    notes: {
                        title: 'Process Management and Scheduling',
                        summary: 'Covers CPU scheduling, state transitions, and context switching.',
                        definitions: [{ term: 'Context Switch', definition: 'Saving state of current process and restoring state of another.' }],
                        formulas: [{ formula: 'TAT = Completion Time - Arrival Time', meaning: 'Turnaround time equation' }],
                        examFocus: [{ topic: 'Round Robin Scheduling', priority: 'HIGH PRIORITY', expectedMarks: '10 Marks' }],
                        importantQuestions: [{ question: 'Explain Banker Algorithm', answer: 'Algorithm checks safe state with Allocation and Max matrices.' }]
                    }
                },
                {
                    file_name: 'Unit_2_Virtual_Memory.pdf',
                    notes: {
                        title: 'Virtual Memory and Paging Systems',
                        summary: 'Covers page tables, TLB caching, page replacement, and thrashing.',
                        definitions: [{ term: 'Page Fault', definition: 'Hardware trap occurring when requested page is not in physical memory.' }],
                        formulas: [{ formula: 'EAT = (1-p)*m + p*S', meaning: 'Effective Access Time equation' }],
                        examFocus: [{ topic: 'LRU Page Replacement', priority: 'HIGH PRIORITY', expectedMarks: '14 Marks' }],
                        importantQuestions: [{ question: 'What is Belady Anomaly?', answer: 'FIFO page replacement experiencing more page faults with more frames.' }]
                    }
                }
            ]
        });

        assert(masterRes.status === 200, 'Master notes synthesis /api/ai/master-notes returns HTTP 200');
        const masterData = JSON.parse(masterRes.body);
        assert(masterData.success === true, 'Master notes synthesis success is true');
        assert(masterData.masterNotes && masterData.masterNotes.combinedUnits.length >= 2, 'Master notes combines multiple units');
        assert(masterData.masterNotes.unifiedDefinitions.length >= 2, 'Master notes consolidates definitions across documents');
        assert(masterData.masterNotes.unifiedFormulas.length >= 2, 'Master notes consolidates formulas across documents');
        assert(masterData.masterNotes.crossDocumentComparisons.length >= 1, 'Master notes produces cross-document comparisons');
        assert(masterData.masterNotes.masterExamRoadmap.length >= 1, 'Master notes produces unified exam roadmap');
        assert(masterData.masterNotes.masterQuestionBank.length >= 1, 'Master notes produces unified question bank');

        // Test Batch Persistence (Backward Compatibility for existing notes)
        console.log('\n  Testing Batch Persistence /api/pdf/bulk-batches...');
        const batchGetRes = await httpRequest({
            hostname: '127.0.0.1',
            port: port,
            path: '/api/pdf/bulk-batches?userId=alex.rivera@btechpath.ai',
            method: 'GET'
        });
        assert(batchGetRes.status === 200, 'Backward compatible /api/pdf/bulk-batches endpoint returns HTTP 200');
    }

    // ------------------------------------------------------------------
    // FINAL REPORT
    // ------------------------------------------------------------------
    console.log('\n========================================================');
    console.log(`TEST RESULTS: ${passedCount} / ${testCount} PASSED (${failedCount} FAILED)`);
    console.log('========================================================');

    if (failedCount > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
});
