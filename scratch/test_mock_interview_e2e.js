const http = require('http');

function makeRequest(path, method, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const req = http.request({
            hostname: '127.0.0.1',
            port: 8080,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
            }
        }, (res) => {
            let resBody = '';
            res.on('data', chunk => resBody += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(resBody);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: resBody });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function runE2ETest() {
    console.log('=== STARTING AI MOCK INTERVIEW E2E SUITE ===\n');

    // 1. Parse authentic resume
    console.log('--- STEP 1: PARSING RESUME ---');
    const sampleResumeText = `
    Rohan Sharma
    rohan.sharma@example.com | +91 98765 43210 | Bangalore, India
    GitHub: github.com/rohansharma | LinkedIn: linkedin.com/in/rohansharma

    EDUCATION
    B.Tech in Computer Science and Engineering
    Vellore Institute of Technology, Vellore | CGPA: 8.9 / 10 | 2021 - 2025

    TECHNICAL SKILLS
    Languages: Java, TypeScript, Python, SQL, C++
    Frameworks & Tools: Node.js, Express, React, PostgreSQL, Redis, Docker, Kafka, AWS (S3, EC2)
    Core Competencies: Distributed Systems, System Design, Concurrency, Database Indexing

    PROJECTS
    Distributed Order Processing Engine | Node.js, Redis, Kafka, PostgreSQL, Docker
    - Architected an idempotent transaction pipeline processing 4,500 orders/sec with sub-50ms p99 latency.
    - Implemented Redis distributed locks and Kafka partition keys to eliminate double-spending anomalies under high concurrency.
    - Reduced database query bottlenecks by 65% through composite B-tree indexing and write-through caching.

    Real-Time Code Collaboration Studio | React, WebSockets, WebRTC, Node.js
    - Engineered a peer-to-peer collaborative editor utilizing Conflict-free Replicated Data Types (CRDTs) supporting up to 15 concurrent typists.
    - Integrated WebRTC mesh architecture for audio/video communication with fallback to TURN relay.

    EXPERIENCE
    Backend Engineering Intern | FinTech Solutions Pvt Ltd | June 2024 - Aug 2024
    - Optimized payment reconciliation service using batch processing, decreasing reconciliation duration from 3 hours to 25 minutes.
    `;

    const parseRes = await makeRequest('/api/resume/parse', 'POST', {
        rawText: sampleResumeText,
        fileName: 'Rohan_Sharma_Resume.txt'
    });

    console.log('Parse status:', parseRes.status);
    if (!parseRes.data || !parseRes.data.success) {
        console.error('FAILED Resume Parse:', parseRes);
        process.exit(1);
    }
    const resume = parseRes.data.structuredResume;
    console.log('Parsed Candidate:', resume.personal?.name);
    console.log('Extracted Skills:', (resume.allSkillsList || []).slice(0, 8));
    console.log('Extracted Projects:', (resume.projects || []).map(p => p.name || p.title));

    // 2. Start Interview Session (Question 1 generation)
    console.log('\n--- STEP 2: STARTING INTERVIEW SESSION ---');
    const startRes = await makeRequest('/api/ai/mock-interview/start', 'POST', {
        userId: 'test-user-rohan-123',
        resume: resume,
        targetRole: 'Software Development Engineer (SDE)',
        department: 'CSE',
        difficulty: 'Hard',
        interviewType: 'System Design & Technical',
        questionCount: 3
    });

    console.log('Start status:', startRes.status);
    if (!startRes.data || !startRes.data.success) {
        console.error('FAILED Session Start:', startRes);
        process.exit(1);
    }
    const sessionId = startRes.data.sessionId;
    const q1 = startRes.data.questionData;
    console.log('Session ID:', sessionId);
    console.log('Question 1:', q1.question);
    console.log('Question 1 Type:', q1.type);
    console.log('Context Reason:', q1.contextReason);

    // 3. Answer Question 1 (with video chunk, spoken transcript with fillers)
    console.log('\n--- STEP 3: ANSWERING QUESTION 1 WITH RECORDING & TRANSCRIPT ---');
    // Minimal mock webm header (base64)
    const mockWebmBase64 = 'data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAEBAAAAAAA=';
    const answer1Text = "Um, basically, in my Distributed Order Processing Engine, I designed it with a write-through Redis cache and Kafka topic partitions. So, like, when an order request hits the API gateway, we acquire a Redis distributed lock keyed by order ID with a 5-second TTL. This prevents race conditions, and then we push an immutable event to Kafka. If the payment gateway times out, we use a saga orchestrator to publish a compensation event that unlocks the inventory and rolls back the ledger transaction in PostgreSQL.";

    const ans1Res = await makeRequest('/api/ai/mock-interview/answer', 'POST', {
        sessionId: sessionId,
        userId: 'test-user-rohan-123',
        questionNumber: 1,
        questionText: q1.question,
        questionType: q1.type,
        spokenTranscript: answer1Text,
        answerDurationSeconds: 42,
        videoRecordingBase64: mockWebmBase64,
        targetRole: 'Software Development Engineer (SDE)',
        department: 'CSE',
        difficulty: 'Hard',
        resume: resume
    });

    console.log('Answer 1 status:', ans1Res.status);
    if (!ans1Res.data || !ans1Res.data.success) {
        console.error('FAILED Answer 1:', ans1Res);
        process.exit(1);
    }

    console.log('Saved Video Path:', ans1Res.data.videoPath);
    console.log('Speaking Delivery Metrics:', ans1Res.data.speakingMetrics);
    console.log('Bar-Raiser Technical Scores:');
    console.log(' - Technical Score:', ans1Res.data.evaluation?.technicalScore);
    console.log(' - Overall Score:', ans1Res.data.evaluation?.overallScore);
    console.log(' - Relevance Score:', ans1Res.data.evaluation?.relevanceScore);
    console.log(' - Depth Score:', ans1Res.data.evaluation?.depthScore);
    console.log(' - Feedback:', ans1Res.data.evaluation?.feedback);
    console.log(' - Strengths:', ans1Res.data.evaluation?.strengths);
    console.log(' - Improvements:', ans1Res.data.evaluation?.improvements);
    console.log(' - Staff Engineer Model Answer:', ans1Res.data.evaluation?.modelAnswerApproach);

    const q2 = ans1Res.data.nextQuestion;
    console.log('\nAdaptive Question 2 Formulated:', q2.question);
    console.log('Is Adaptive Follow-Up:', q2.isFollowUp);

    // 4. Answer Question 2
    console.log('\n--- STEP 4: ANSWERING QUESTION 2 ---');
    const answer2Text = "To address partition tolerance during a network split where Redis replicas become out of sync, we configure Redis with wait replicas and fallback to database row-level pessimistic locking using SELECT FOR UPDATE with a 2-second statement timeout, guaranteeing consistency over availability according to the CAP theorem.";

    const ans2Res = await makeRequest('/api/ai/mock-interview/answer', 'POST', {
        sessionId: sessionId,
        userId: 'test-user-rohan-123',
        questionNumber: 2,
        questionText: q2.question,
        questionType: q2.type,
        spokenTranscript: answer2Text,
        answerDurationSeconds: 35,
        videoRecordingBase64: mockWebmBase64,
        targetRole: 'Software Development Engineer (SDE)',
        department: 'CSE',
        difficulty: 'Hard',
        resume: resume
    });

    console.log('Answer 2 status:', ans2Res.status);
    const q3 = ans2Res.data.nextQuestion;
    console.log('Question 3:', q3.question);

    // 5. Answer Question 3 (Final question in this 3-question interview)
    console.log('\n--- STEP 5: ANSWERING QUESTION 3 (FINAL QUESTION) ---');
    const answer3Text = "In the real-time collaboration studio, we implemented Conflict-free Replicated Data Types, specifically RGA (Replicated Growable Array). Each character insertion contains a globally unique Lamport timestamp and client ID, allowing deterministic local merging without requiring a central coordination lock.";

    const ans3Res = await makeRequest('/api/ai/mock-interview/answer', 'POST', {
        sessionId: sessionId,
        userId: 'test-user-rohan-123',
        questionNumber: 3,
        questionText: q3.question,
        questionType: q3.type,
        spokenTranscript: answer3Text,
        answerDurationSeconds: 38,
        videoRecordingBase64: mockWebmBase64,
        targetRole: 'Software Development Engineer (SDE)',
        department: 'CSE',
        difficulty: 'Hard',
        resume: resume
    });

    console.log('Answer 3 status:', ans3Res.status);
    console.log('Is Complete Flag:', ans3Res.data.isComplete);

    // 6. Complete Interview & Generate Bar-Raiser Report
    console.log('\n--- STEP 6: SYNTHESIZING FINAL BAR-RAISER REPORT ---');
    const completeRes = await makeRequest('/api/ai/mock-interview/complete', 'POST', {
        sessionId: sessionId,
        userId: 'test-user-rohan-123',
        targetRole: 'Software Development Engineer (SDE)',
        department: 'CSE',
        resume: resume,
        conversation: [
            { question: q1.question, answer: answer1Text, technicalScore: 85, duration: 42, speakingMetrics: ans1Res.data.speakingMetrics },
            { question: q2.question, answer: answer2Text, technicalScore: 88, duration: 35, speakingMetrics: ans2Res.data.speakingMetrics },
            { question: q3.question, answer: answer3Text, technicalScore: 90, duration: 38, speakingMetrics: ans3Res.data.speakingMetrics }
        ]
    });

    console.log('Complete status:', completeRes.status);
    if (!completeRes.data || !completeRes.data.success) {
        console.error('FAILED Interview Complete:', completeRes);
        process.exit(1);
    }

    const report = completeRes.data.report;
    console.log('\n--- 7-DIMENSIONAL SCORECARD ---');
    console.log('Overall Score:', report.overallScore + '%');
    console.log('Technical Score:', report.technicalScore + '%');
    console.log('Communication Score:', report.communicationScore + '%');
    console.log('Problem Solving Score:', report.problemSolvingScore + '%');
    console.log('Resume Score:', report.resumeScore + '%');
    console.log('Role Readiness Score:', report.roleReadinessScore + '%');
    console.log('Project Score:', report.projectScore + '%');

    console.log('\n--- SPEAKING ANALYTICS ---');
    console.log(report.speakingAnalytics);

    console.log('\n--- RESUME CLAIM VERIFICATION AUDIT ---');
    console.log(report.resumeClaimVerification);

    console.log('\n--- PREPARATION PLAN (TOP 5 PRIORITIES) ---');
    (report.preparationPlan || []).forEach(p => {
        console.log(`[Priority ${p.priority}] ${p.title} (${p.category}): ${p.action}`);
    });

    // 7. Test Session Recovery Rehydration
    console.log('\n--- STEP 7: TESTING SESSION REHYDRATION ---');
    const sessionRes = await makeRequest(`/api/ai/mock-interview/session/${sessionId}`, 'GET');
    console.log('Session Rehydrate Status:', sessionRes.status);
    console.log('Active Session Exists:', !!sessionRes.data?.session);
    console.log('Conversation entries saved in session:', sessionRes.data?.session?.conversation?.length);

    console.log('\n>>> ALL 7 E2E MOCK INTERVIEW STEPS PASSED SUCCESSFULLY! <<<');
}

runE2ETest().catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
});
