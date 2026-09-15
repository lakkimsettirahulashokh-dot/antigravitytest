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

const fileName = 'DBMS_Unit1_Normalization.pdf';
const mode = 'detailed';
const sampleText = `Unit 1 Database Management Systems and Relational Algebra.
Definition of Normalization: Normalization is the systematic approach of decomposing tables to eliminate data redundancy and undesirable anomalies such as insertion, update, and deletion anomalies.
First Normal Form requires each attribute to contain only atomic indivisible values. Second Normal Form requires no partial dependency of any non-prime attribute on any candidate key. Third Normal Form requires no transitive dependencies.
Boyce-Codd Normal Form strictly requires that for every functional dependency X -> Y, X must be a super key.
Formula for Relational Projection: \\pi_{A}(R). Relational Selection: \\sigma_{C}(R). Natural Join: R \\bowtie S.
Query Optimization Invariant: Push selection down the syntax tree before cartesian products to minimize intermediate tuple cardinality.`;

const systemPrompt = `You are a Principal Engineering Professor and Senior Academic Author generating verified 26-section study notes from authentic course material.
Rules:
1. Ground every point strictly in the source text. Do NOT invent facts or hallucinate external theories.
2. If a specific section or topic is not discussed in the uploaded document, clearly output: "Not available in the uploaded source."
3. Clearly distinguish SOURCE EXAMPLES from AI-GENERATED EXAMPLES using the "type" field ("SOURCE EXAMPLE" or "AI-GENERATED EXAMPLE").
4. Label all practice questions explicitly with label: "AI-GENERATED PRACTICE QUESTION".
5. Formulas must specify variables, when to use, units, and common mistakes.
6. In exam focus, indicate priority ("High Priority", "Medium Priority", "Low Priority") and use phrasing "High-priority preparation topic." Never guarantee exam questions.
7. Preserve page citations whenever detectable (e.g. "Source: ${fileName} — Page X").
8. Return STRICT RAW JSON ONLY. No conversational preamble.`;

// Exact prompt from server.js lines 3964-4119:
const prompt = `SOURCE DOCUMENT: "${fileName}"
TARGET STUDY MODE: "DETAILED"
STUDENT CONTEXT:
- Department: CSE
- Semester: 4
- Target Role: Database Specialist

EXTRACTED TEXT FROM SOURCE PDF:
"""
${sampleText}
"""

REQUIRED JSON STRUCTURE TO RETURN (Must cover all 26 sections):
{
  "title": "Clear descriptive academic title for this document",
  "overview": "Short high-level overview of the document (1 concise paragraph).",
  "summary": "Detailed 2-3 paragraph executive summary of the core engineering concepts, architecture, and principles.",
  "mainTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
  "detailedExplanation": [
    {
      "topic": "Topic or Subsystem Name",
      "definition": "Formal technical definition from source",
      "concept": "Core underlying principle",
      "whatIsIt": "Technical definition and architectural purpose",
      "whyImportant": "Why this matters in engineering practice and exams",
      "simpleExplanation": "Plain-English intuitive explanation for quick understanding",
      "howItWorks": "Step-by-step operating mechanism or algorithm flow",
      "algorithmProcess": {
        "input": "Input parameters or boundary states",
        "steps": ["Step 1...", "Step 2..."],
        "output": "Guaranteed output invariant",
        "complexity": "Time and Space complexity if applicable from source"
      },
      "keyComponents": ["Component 1", "Component 2"],
      "example": "Applied technical scenario",
      "application": "Real-world engineering system utilizing this concept",
      "commonMistakes": "Frequent student misconception or calculation trap",
      "examRelevance": "High/Medium/Low with specific university question pattern",
      "sourcePage": "Page 1-2"
    }
  ],
  "keyConcepts": [
    { "concept": "Concept Name", "description": "Rigorous technical description", "sourcePage": "Page 1" }
  ],
  "definitions": [
    {
      "term": "Exact Term from text",
      "definition": "Authoritative definition from source text",
      "simpleExplanation": "Simple intuition",
      "sourcePage": "Page 1"
    }
  ],
  "importantTerms": [
    { "term": "Technical Term", "explanation": "Contextual meaning in this domain", "sourcePage": "Page 1" }
  ],
  "explanations": [
    { "topic": "Core Mechanism", "explanation": "Detailed theoretical breakdown" }
  ],
  "formulas": [
    {
      "name": "Formula Name",
      "formula": "e.g. T = (P * 60) / (2 * pi * N)",
      "variables": "Definitions of every variable and units",
      "whenToUse": "Operating conditions and assumptions",
      "example": "Sample numerical substitution",
      "commonMistakes": "Common unit or sign error",
      "sourcePage": "Page 2"
    }
  ],
  "formulaExplanations": [
    { "formula": "Mathematical expression", "explanation": "Physical or algorithmic significance", "units": "Dimensional units" }
  ],
  "diagramsAndProcesses": [
    { "title": "System Architecture / Process Flow", "description": "Operational flow described in the source document", "steps": ["Step 1", "Step 2"] }
  ],
  "comparisons": [
    { "comparisonTopic": "Comparison Title", "entityA": "Method A", "entityB": "Method B", "differences": "Key trade-offs between A and B" }
  ],
  "examples": [
    {
      "title": "Example Name",
      "type": "SOURCE EXAMPLE",
      "context": "Context from the PDF",
      "takeaway": "Key learning insight",
      "sourcePage": "Page 2"
    }
  ],
  "applications": [
    { "field": "Industry/Domain", "description": "How the theory is deployed in modern engineering" }
  ],
  "commonMistakes": [
    { "trap": "Misconception or calculation error", "correction": "Correct scientific interpretation", "examTip": "How to avoid losing marks" }
  ],
  "examFocus": [
    {
      "topic": "Topic Name",
      "priority": "High Priority",
      "expectedMarks": "8-10 Marks",
      "evidence": "Repeated definition or core syllabus requirement",
      "recommendation": "High-priority preparation topic."
    }
  ],
  "importantQuestions": [
    {
      "question": "Question text",
      "type": "Long Answer",
      "label": "AI-GENERATED PRACTICE QUESTION",
      "answer": {
        "introduction": "Introductory framing",
        "definition": "Core definition",
        "explanation": "Detailed technical breakdown",
        "example": "Illustrative example",
        "formulaOrProof": "Mathematical representation or invariant",
        "commonMistakes": "Traps to avoid in written answer",
        "conclusion": "Final wrap-up sentence"
      },
      "sourcePage": "Page 2"
    }
  ],
  "shortQuestions": [
    { "question": "Short conceptual question", "answer": "Concise 2-3 sentence answer", "sourcePage": "Page 1" }
  ],
  "longQuestions": [
    { "question": "Comprehensive exam question", "answer": "In-depth structured model answer", "sourcePage": "Page 2" }
  ],
  "practiceQuestions": [
    {
      "question": "Multiple choice practice question",
      "type": "MCQ",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Scientific justification",
      "sourcePage": "Page 1"
    }
  ],
  "quickRevision": [
    "Rapid bullet point for quick memorization",
    "Rapid bullet point for quick memorization"
  ],
  "oneMinuteRevision": [
    "Single most vital theorem or formula to memorize before the exam"
  ],
  "takeaways": [
    "Crucial takeaway 1 from document",
    "Crucial takeaway 2 from document"
  ],
  "sourceReferences": [
    { "topic": "Key Section", "page": "Page 1-2", "documentName": "${fileName}" }
  ]
}`;

const extractJson = (text) => {
  try {
    const trimmed = (text || '').trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) return JSON.parse(trimmed);
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) return JSON.parse(match[1]);
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    }
  } catch (e) {
    console.error('extractJson error:', e.message);
  }
  return null;
};

async function testExactPrompt() {
  const payload = JSON.stringify({
    contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
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
      const json = JSON.parse(d);
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('Text returned?', Boolean(text), 'Length:', text?.length);
      const parsed = extractJson(text);
      console.log('parsedNotes?', Boolean(parsed));
      if (parsed) {
        console.log('parsed.title:', parsed.title);
        console.log('parsed.mainTopics:', parsed.mainTopics);
        console.log('parsed.mainPoints:', parsed.mainPoints); // <--- Notice: Is mainPoints present?
        console.log('Check condition (!parsed || !parsed.title || !parsed.mainPoints):', (!parsed || !parsed.title || !parsed.mainPoints));
      } else {
        console.log('RAW END of text:\n', text?.slice(-300));
      }
    });
  });
  req.write(payload);
  req.end();
}

testExactPrompt();
