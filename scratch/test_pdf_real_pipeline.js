const fs = require('fs');
const path = require('path');
const http = require('http');

// Helper to create a minimal valid text PDF binary
function createMinimalPdf(textContent) {
  // Minimal valid PDF structure with 1 page and Helvetica font
  const contentStream = `BT /F1 12 Tf 50 700 Td (${textContent.replace(/[()\\]/g, '')}) Tj ET`;
  const streamLen = contentStream.length;
  
  const pdfData = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${streamLen} >> stream
${contentStream}
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000305 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
380
%%EOF`;
  return Buffer.from(pdfData, 'utf8');
}

async function testPipeline() {
  console.log('--- Creating Real Academic Test PDF ---');
  const sampleText = `Unit 1 Database Management Systems and Relational Algebra.
Definition of Normalization: Normalization is the systematic approach of decomposing tables to eliminate data redundancy and undesirable anomalies such as insertion, update, and deletion anomalies.
First Normal Form requires each attribute to contain only atomic indivisible values. Second Normal Form requires no partial dependency of any non-prime attribute on any candidate key. Third Normal Form requires no transitive dependencies.
Boyce-Codd Normal Form strictly requires that for every functional dependency X -> Y, X must be a super key.
Formula for Relational Projection: \\pi_{A}(R). Relational Selection: \\sigma_{C}(R). Natural Join: R \\bowtie S.
Query Optimization Invariant: Push selection down the syntax tree before cartesian products to minimize intermediate tuple cardinality.`;

  const pdfBuf = createMinimalPdf(sampleText);
  const base64Data = 'data:application/pdf;base64,' + pdfBuf.toString('base64');
  console.log('PDF buffer created:', pdfBuf.length, 'bytes');

  // Step 1: Call POST /api/ai/extract-pdf
  console.log('\n--- Step 1: Testing POST /api/ai/extract-pdf ---');
  const extractPayload = JSON.stringify({
    fileName: 'DBMS_Unit1_Normalization.pdf',
    fileSize: pdfBuf.length,
    mimeType: 'application/pdf',
    fileData: base64Data,
    userId: 'test_student_dbms'
  });

  const extractRes = await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8081,
      path: '/api/ai/extract-pdf',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(extractPayload)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    req.write(extractPayload);
    req.end();
  });

  console.log('Extract Status:', extractRes.status);
  console.log('Extract Success:', extractRes.body.success);
  console.log('Extracted Text Length:', extractRes.body.text?.length);
  console.log('Extracted Text Sample:', extractRes.body.text?.slice(0, 150));
  console.log('Extraction Method:', extractRes.body.extractionMethod);
  console.log('OCR Used:', extractRes.body.ocrUsed);

  // Step 2: Call POST /api/ai/notes
  console.log('\n--- Step 2: Testing POST /api/ai/notes ---');
  const notesPayload = JSON.stringify({
    documentId: extractRes.body.docId,
    extractedText: extractRes.body.text,
    fileName: 'DBMS_Unit1_Normalization.pdf',
    mode: 'detailed',
    userId: 'test_student_dbms',
    department: 'CSE',
    semester: 4,
    targetRole: 'Database Engineer'
  });

  const notesRes = await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8081,
      path: '/api/ai/notes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(notesPayload)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    req.write(notesPayload);
    req.end();
  });

  console.log('Notes Status:', notesRes.status);
  console.log('Notes Success:', notesRes.body.success);
  console.log('Is Live AI:', notesRes.body.isLiveAI);
  console.log('Note Title:', notesRes.body.note?.title);
  console.log('Detailed Explanation count:', notesRes.body.note?.detailed_explanation?.length);
  if (notesRes.body.note?.detailed_explanation?.length > 0) {
    console.log('First Topic:', notesRes.body.note.detailed_explanation[0]);
  }
}

testPipeline();
