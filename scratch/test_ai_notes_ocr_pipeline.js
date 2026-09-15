const http = require('http');
const fs = require('fs');
const path = require('path');

function postJson(pathUrl, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const req = http.request({
            hostname: 'localhost',
            port: 8080,
            path: pathUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, body: parsed });
                } catch(e) {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function createMinimalPdfBuffer(text) {
    const stream = `BT /F1 18 Tf 50 700 Td (${text}) Tj ET`;
    const streamLen = stream.length;
    const pdfData = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLen} >>
stream
${stream}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000242 00000 n 
0000000344 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
424
%%EOF`;
    return Buffer.from(pdfData, 'utf-8');
}

function createScannedPdfBuffer() {
    // Blank page with no text streams whatsoever
    const pdfData = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<< /Size 4 /Root 1 0 R >>
startxref
198
%%EOF`;
    return Buffer.from(pdfData, 'utf-8');
}

async function runTests() {
    console.log('====================================================');
    console.log('STARTING AI NOTES UNIFIED OCR & EXTRACTION TEST SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let total = 0;

    function assert(desc, condition, details = '') {
        total++;
        if (condition) {
            console.log(`[PASS] ${desc}`);
            passed++;
        } else {
            console.error(`[FAIL] ${desc} - ${details}`);
        }
    }

    // -------------------------------------------------------------
    // TEST 1: Native Text Extraction on Normal PDF
    // -------------------------------------------------------------
    console.log('--- Test 1: Native Text Extraction ---');
    const normalText = 'Distributed Systems Engineering: Paxos and Raft Consensus Protocols guarantee safe replicated state machine execution across asynchronous networks by enforcing majority quorums, durable write-ahead logging, and automated leader election with monotonic terms.';
    const normalPdfBuf = createMinimalPdfBuffer(normalText);
    const res1 = await postJson('/api/ai/extract-pdf', {
        fileData: normalPdfBuf.toString('base64'),
        fileName: 'Distributed_Systems_Lecture1.pdf',
        mimeType: 'application/pdf'
    });

    assert('Normal PDF returns 200 OK', res1.status === 200);
    assert('Normal PDF text contains keywords', res1.body.text && res1.body.text.includes('Paxos and Raft Consensus'));
    assert('Normal PDF extraction_method is native', res1.body.extraction_method === 'native');
    assert('Normal PDF ocr_used is false', res1.body.ocr_used === false);
    assert('Normal PDF word count > 0', res1.body.word_count > 0);
    assert('Normal PDF page count is 1', res1.body.page_count === 1);
    console.log(`Result 1: Pages=${res1.body.page_count}, Words=${res1.body.word_count}, Method=${res1.body.extraction_method}\n`);

    // -------------------------------------------------------------
    // TEST 2: Scanned PDF Fallback - No "OCR is not currently configured" Bug
    // -------------------------------------------------------------
    console.log('--- Test 2: Scanned / Low-Text PDF Handling ---');
    const scannedPdfBuf = createScannedPdfBuffer();
    const res2 = await postJson('/api/ai/extract-pdf', {
        fileData: scannedPdfBuf.toString('base64'),
        fileName: 'Scanned_Handwritten_Notes.pdf',
        mimeType: 'application/pdf'
    });

    assert('Scanned PDF returns 200 OK', res2.status === 200);
    assert('Scanned PDF has extraction_method "ocr"', res2.body.extraction_method === 'ocr');
    assert('Scanned PDF ocr_used is true', res2.body.ocr_used === true);
    assert('Scanned PDF does NOT display unconfigured message', 
        !res2.body.message || !res2.body.message.includes('OCR is not currently configured'), 
        `Message was: "${res2.body.message}"`);
    console.log(`Result 2: Status=${res2.status}, Method=${res2.body.extraction_method}, Message="${res2.body.message}"\n`);

    // -------------------------------------------------------------
    // TEST 3: Comprehensive 26-Section Detailed Notes Generation
    // -------------------------------------------------------------
    console.log('--- Test 3: Comprehensive 26-Section Notes Generation ---');
    const sampleAcademicText = `
Module 4: Distributed Database Transactions and Two-Phase Commit Protocol
Target Curriculum: 6th Semester Computer Science and Engineering, Distributed Systems Course.

1. ACID Properties in Distributed Systems:
In a centralized database, ACID properties (Atomicity, Consistency, Isolation, Durability) are enforced by a single local transaction manager and write-ahead logging (WAL). However, in a distributed database partitioned across multiple nodes (shards), an atomic transaction must guarantee that either all participating nodes commit the transaction or all abort.

2. Two-Phase Commit (2PC) Protocol:
The 2PC protocol operates under an asynchronous network model with crash-recovery failures.
Roles:
- Coordinator (Transaction Manager)
- Participants (Cohort nodes managing local resource managers)

Phase 1: Prepare Phase
Step 1.1: Coordinator sends PREPARE message to all participants.
Step 1.2: Each participant executes the transaction locally up to the commit point, writes UNDO and REDO logs to durable disk storage.
Step 1.3: If participant succeeds, it responds with VOTE_COMMIT. If it fails or detects deadlock, it responds with VOTE_ABORT.

Phase 2: Commit / Abort Phase
Step 2.1: If coordinator receives VOTE_COMMIT from ALL participants:
Coordinator writes COMMIT to its WAL and broadcasts GLOBAL_COMMIT to all participants.
Participants commit locally, release locks, and return ACK.
Coordinator writes END to its log.
Step 2.2: If any participant sends VOTE_ABORT or coordinator times out waiting:
Coordinator writes ABORT to its WAL and broadcasts GLOBAL_ABORT.
Participants rollback local state using undo logs and return ACK.

3. Failure Modes and Blocking Nature:
- Coordinator failure while participants are in the PREPARED state results in indefinite blocking because participants cannot unilaterally commit or abort.
- Message complexity: 3(N-1) messages in standard 2PC.
- Three-Phase Commit (3PC) eliminates blocking under fail-stop assumptions by introducing a PRE-COMMIT state.

Formula / Metrics:
Transaction latency = 2 * RTT + Local Log Flush Latency.
Throughput Theta = N / (Latency * Resource Contention Factor).
`;

    const res3 = await postJson('/api/ai/notes', {
        text: sampleAcademicText,
        fileName: 'Distributed_Transactions_Unit4.pdf',
        unitName: 'Unit 4: Distributed Transactions',
        subject: 'Distributed Systems',
        semester: 'Semester 6',
        branch: 'Computer Science & Engineering',
        targetRole: 'Distributed Systems Engineer'
    });

    assert('Notes generation returns 200 OK', res3.status === 200);
    assert('Notes success is true', res3.body.success === true);
    const n = res3.body.note || res3.body.notes;
    assert('Notes contains detailed notes object', typeof n === 'object');
    
    assert('Section 1 (module_title/title) present', Boolean(n.title || n.module_title));
    assert('Section 2 (executive_summary/summary) present', Boolean(n.executive_summary || n.summary || (n.notes && n.notes.summary)));
    assert('Section 4 (core_concepts/main_points) present', Boolean(n.core_concepts || n.main_points || n.mainTopics || (n.notes && n.notes.coreConcepts)));
    assert('Section 5 (detailed_explanation) present', Boolean(n.detailed_explanation || n.detailedExplanation || (n.notes && n.notes.detailedExplanation)));
    assert('Section 8 (formulas) present', Boolean(n.formulas || (n.notes && n.notes.formulas)));
    assert('Section 14 (important_questions) present', Boolean(n.important_questions || n.practice_questions || (n.notes && n.notes.reviewQuestions)));
    assert('Section 15 (mcqs) present', Boolean(n.mcqs || (n.notes && n.notes.practiceQuestions)));
    assert('Section 20 (quick_revision) present', Boolean(n.quick_revision || (n.notes && n.notes.summaryChecklist)));

    console.log(`Result 3: Generated Title="${n.title}", Topics=${(n.detailed_explanation || []).length}, Formulas=${(n.formulas || []).length}\n`);

    // -------------------------------------------------------------
    // TEST 4: Master Notes Synthesis from Multiple Documents
    // -------------------------------------------------------------
    console.log('--- Test 4: Master Notes Synthesis Across Multiple PDFs ---');
    const res4 = await postJson('/api/ai/master-notes', {
        documents: [
            {
                fileName: 'Unit1_Distributed_Architecture.pdf',
                text: 'Unit 1 covers Client-Server, Peer-to-Peer, and Microservices architectures, remote procedure calls (gRPC/REST), and fallacies of distributed computing.',
                pageCount: 12
            },
            {
                fileName: 'Unit2_Consensus_Protocols.pdf',
                text: 'Unit 2 covers Paxos, Raft, Byzantine Fault Tolerance, leader election, log replication, and split-brain resolution.',
                pageCount: 18
            }
        ],
        subject: 'Distributed Systems',
        semester: 'Semester 6',
        branch: 'Computer Science & Engineering'
    });

    assert('Master notes synthesis returns 200 OK', res4.status === 200);
    assert('Master notes success is true', res4.body.success === true);
    assert('Master notes object present', typeof res4.body.master_notes === 'object');
    assert('Master notes has source traceability or citations', 
        Boolean(res4.body.master_notes.source_traceability || res4.body.master_notes.sourceTraceability || res4.body.master_notes.provenanceNotice));
    console.log(`Result 4: Master Notes Title="${res4.body.master_notes.masterTitle || res4.body.master_notes.title}", Generated successfully!\n`);

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('====================================================');
    console.log(`ALL TESTS COMPLETED: ${passed} / ${total} PASSED`);
    console.log('====================================================');

    if (passed === total) {
        console.log('STATUS: VERIFICATION SUCCESSFUL - ALL CRITERIA MET');
        process.exit(0);
    } else {
        console.error('STATUS: SOME TESTS FAILED');
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test suite uncaught error:', err);
    process.exit(1);
});
