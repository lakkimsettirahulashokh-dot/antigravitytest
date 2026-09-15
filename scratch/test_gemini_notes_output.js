const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
const lines = fs.readFileSync(envPath, 'utf8').split('\n');
let geminiKey = '';
lines.forEach(l => {
  if (l.startsWith('GEMINI_API_KEY=')) geminiKey = l.split('=')[1].trim().replace(/['"]/g, '');
});

const sampleText = `Unit 1 Database Management Systems and Relational Algebra.
Definition of Normalization: Normalization is the systematic approach of decomposing tables to eliminate data redundancy and undesirable anomalies such as insertion, update, and deletion anomalies.
First Normal Form requires each attribute to contain only atomic indivisible values. Second Normal Form requires no partial dependency of any non-prime attribute on any candidate key. Third Normal Form requires no transitive dependencies.
Boyce-Codd Normal Form strictly requires that for every functional dependency X -> Y, X must be a super key.
Formula for Relational Projection: \\pi_{A}(R). Relational Selection: \\sigma_{C}(R). Natural Join: R \\bowtie S.
Query Optimization Invariant: Push selection down the syntax tree before cartesian products to minimize intermediate tuple cardinality.`;

const prompt = `SOURCE DOCUMENT: "DBMS_Unit1.pdf"
TARGET STUDY MODE: "DETAILED"
EXTRACTED TEXT FROM SOURCE PDF:
"""
${sampleText}
"""
Generate detailed 12-section notes for each topic in the document.
Output strict raw JSON ONLY matching this schema:
{
  "title": "DBMS Unit 1 Notes",
  "overview": "Overview paragraph...",
  "summary": "Detailed summary...",
  "mainTopics": ["Normalization", "Relational Algebra"],
  "topics": [
    {
      "topic": "Normalization",
      "definition": "...",
      "coreConcept": "...",
      "detailedExplanation": "...",
      "howItWorks": "...",
      "stepByStepProcess": ["..."],
      "example": "...",
      "practicalApplication": "...",
      "importantPoints": ["..."],
      "commonMistakes": "...",
      "examFocus": "...",
      "relatedConcepts": ["..."]
    }
  ],
  "definitions": [
    { "term": "...", "definition": "...", "sourcePage": 1 }
  ],
  "formulas": [
    { "name": "...", "formula": "...", "variables": "...", "explanation": "..." }
  ],
  "practiceQuestions": [
    { "question": "...", "type": "Long Answer", "answer": "..." }
  ],
  "mcqs": [
    { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..." }
  ],
  "quickRevision": ["..."],
  "oneMinuteRevision": ["..."]
}`;

async function run() {
  const payload = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      console.log('HTTP Status:', res.statusCode);
      try {
        const json = JSON.parse(d);
        const text = json.candidates[0].content.parts[0].text;
        console.log('AI Response Length:', text.length);
        console.log('First 500 chars of AI output:\n', text.slice(0, 500));
        
        // Test parsing JSON
        let clean = text.trim();
        if (clean.startsWith('```json')) clean = clean.slice(7);
        if (clean.startsWith('```')) clean = clean.slice(3);
        if (clean.endsWith('```')) clean = clean.slice(0, -3);
        clean = clean.trim();
        const parsed = JSON.parse(clean);
        console.log('\n✅ Successfully parsed JSON!');
        console.log('Parsed title:', parsed.title);
        console.log('Parsed topics count:', parsed.topics?.length);
        console.log('First topic title:', parsed.topics[0]?.topic);
        console.log('First topic definition:', parsed.topics[0]?.definition);
      } catch (e) {
        console.error('Parse Error:', e.message, '\nRaw:\n', d.slice(0, 500));
      }
    });
  });
  req.write(payload);
  req.end();
}

run();
