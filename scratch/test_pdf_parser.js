const zlib = require('zlib');
const fs = require('fs');

function extractTextFromPdfBuffer(pdfBuffer) {
    try {
        const str = pdfBuffer.toString('binary');
        const pages = [];
        let totalText = '';

        // Find all stream ... endstream blocks
        const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
        let match;
        let streamIndex = 0;

        while ((match = streamRegex.exec(str)) !== null) {
            streamIndex++;
            const rawStreamBinary = match[1];
            const streamBuffer = Buffer.from(rawStreamBinary, 'binary');

            // Check dictionary before this stream for /FlateDecode
            const headerChunk = str.substring(Math.max(0, match.index - 500), match.index);
            const isFlate = headerChunk.includes('/FlateDecode');

            let decompressed = null;
            if (isFlate) {
                try {
                    decompressed = zlib.inflateSync(streamBuffer).toString('utf8');
                } catch (e1) {
                    try {
                        decompressed = zlib.inflateRawSync(streamBuffer).toString('utf8');
                    } catch (e2) {
                        // Might not be compressed or partial
                    }
                }
            } else {
                decompressed = streamBuffer.toString('utf8');
            }

            if (!decompressed) continue;

            // Extract text operators: BT ... ET
            const btRegex = /BT([\s\S]*?)ET/g;
            let btMatch;
            let streamText = '';

            while ((btMatch = btRegex.exec(decompressed)) !== null) {
                const btBlock = btMatch[1];

                // 1. Tj operator: (some text) Tj
                const tjRegex = /\((?:\\\(|\\\)|[^)])*\)\s*Tj/g;
                let tjMatch;
                while ((tjMatch = tjRegex.exec(btBlock)) !== null) {
                    const textContent = cleanPdfString(tjMatch[0]);
                    if (textContent) streamText += textContent + ' ';
                }

                // 2. TJ operator: [(part 1) 20 (part 2)] TJ
                const arrayTjRegex = /\[([\s\S]*?)\]\s*TJ/g;
                let arrMatch;
                while ((arrMatch = arrayTjRegex.exec(btBlock)) !== null) {
                    const inner = arrMatch[1];
                    const subStringRegex = /\((?:\\\(|\\\)|[^)])*\)/g;
                    let subMatch;
                    let joined = '';
                    while ((subMatch = subStringRegex.exec(inner)) !== null) {
                        joined += cleanPdfString(subMatch[0]);
                    }
                    if (joined) streamText += joined + ' ';
                }

                // 3. Line breaks from T* or Td with vertical displacement
                if (btBlock.includes('T*') || /-\d+\.?\d*\s+Td/.test(btBlock)) {
                    streamText += '\n';
                }
            }

            if (streamText.trim()) {
                pages.push({
                    pageNumber: pages.length + 1,
                    text: streamText.trim()
                });
                totalText += `\n--- Page ${pages.length} ---\n` + streamText.trim() + '\n';
            }
        }

        // Fallback: If no stream text found, scan for direct literal text
        if (!totalText.trim()) {
            const literalRegex = /\((?:\\\(|\\\)|[^)])*\)\s*Tj/g;
            let litMatch;
            while ((litMatch = literalRegex.exec(str)) !== null) {
                totalText += cleanPdfString(litMatch[0]) + ' ';
            }
        }

        return {
            success: Boolean(totalText.trim()),
            pageCount: pages.length || 1,
            pages: pages,
            text: totalText.trim()
        };
    } catch (err) {
        return {
            success: false,
            error: err.message,
            text: ''
        };
    }
}

function cleanPdfString(raw) {
    if (!raw) return '';
    let s = raw.trim();
    if (s.startsWith('(') && s.endsWith(')')) {
        s = s.substring(1, s.length - 1);
    } else if (s.startsWith('(')) {
        const idx = s.lastIndexOf(')');
        if (idx !== -1) s = s.substring(1, idx);
    }
    // Unescape PDF escapes
    return s
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\t/g, '\t')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\');
}

// Generate a valid mock PDF buffer to test
function createTestPdfBuffer() {
    const streamContent = `
BT
/F1 14 Tf
1 0 0 1 50 750 Tm
(OFFICIAL SYLLABUS: GATE COMPUTER SCIENCE & IT) Tj
T*
(Paper Code: CS | Total Marks: 100 | Duration: 180 Minutes) Tj
T*
(Negative Marking: 1/3rd for 1-mark MCQs, 2/3rd for 2-mark MCQs) Tj
T*
(Section 1: Engineering Mathematics) Tj
T*
(Linear Algebra: Matrices, determinants, eigenvalues and eigenvectors.) Tj
T*
(Section 2: Operating Systems) Tj
T*
(Process management, CPU scheduling algorithms, threads, concurrency, deadlocks.) Tj
T*
(Section 3: Database Management Systems) Tj
T*
(ER-model, Relational model, SQL queries, Normalization BCNF, Transactions and Concurrency Control.) Tj
ET
`;
    const compressed = zlib.deflateSync(Buffer.from(streamContent, 'utf8'));

    const pdfParts = [
        '%PDF-1.4\n',
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n',
        `4 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n`,
        compressed.toString('binary'),
        '\nendstream\nendobj\n',
        'xref\n0 5\n0000000000 65535 f \n',
        'trailer\n<< /Root 1 0 R /Size 5 >>\nstartxref\n500\n%%EOF'
    ];

    return Buffer.from(pdfParts.join(''), 'binary');
}

const testBuf = createTestPdfBuffer();
const result = extractTextFromPdfBuffer(testBuf);
console.log('PDF Extraction Result:', {
    success: result.success,
    pageCount: result.pageCount,
    textLength: result.text.length,
    sampleText: result.text.slice(0, 180)
});

if (result.success && result.text.includes('Operating Systems') && result.text.includes('Database Management Systems')) {
    console.log('PASS: PDF text extractor accurately extracted compressed PDF text!');
} else {
    console.error('FAIL: Extraction did not retrieve expected text');
    process.exit(1);
}
