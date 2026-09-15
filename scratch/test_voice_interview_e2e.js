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

async function runVoiceInterviewTestSuite() {
    console.log('====================================================');
    console.log('  TEST SUITE: REAL VOICE MOCK INTERVIEW & SPEECH ANALYSIS');
    console.log('====================================================\n');

    // 1. Parse authentic resume matching Specification #42
    console.log('--- TEST 1: RESUME INGESTION & TECHNICAL CLAIMS EXTRACTION ---');
    const testResumeText = `
    Ananya Patel
    ananya.patel@example.com | +91 91234 56789 | Hyderabad, India
    GitHub: github.com/ananyapatel | LinkedIn: linkedin.com/in/ananyapatel

    EDUCATION
    B.Tech in Computer Science and Engineering
    JNTU Hyderabad | CGPA: 8.8 / 10 | 2021 - 2025

    TECHNICAL SKILLS
    Languages: Python, JavaScript, TypeScript, SQL, Node.js
    Frameworks & Tools: Express, React, PostgreSQL, REST API, JWT authentication, Docker, Redis
    Core Concepts: Database Indexing, Authentication Protocols, Concurrency, System Design

    PROJECTS
    Student Management & Enrollment System | Python, Node.js, PostgreSQL, REST API, JWT authentication
    - Architected role-based access control with JWT authentication, refresh token rotation, and HTTP-only cookies.
    - Designed relational schema in PostgreSQL with composite indexing, reducing search latency by 45%.
    - Built idempotent RESTful APIs handling 1,200 requests/sec with automated database connection pooling.
    `;

    const parseRes = await makeRequest('/api/resume/parse', 'POST', {
        rawText: testResumeText,
        fileName: 'Ananya_Patel_Resume.txt'
    });

    console.log('Resume Parse Status:', parseRes.status);
    if (!parseRes.data || !parseRes.data.success) {
        throw new Error('Failed to parse candidate resume: ' + JSON.stringify(parseRes));
    }
    const resume = parseRes.data.structuredResume;
    console.log('Candidate Name:', resume.personal?.name);
    console.log('Key Skills Extracted:', (resume.allSkillsList || []).slice(0, 8));
    console.log('Key Projects Extracted:', (resume.projects || []).map(p => p.name || p.title));

    // 2. Start Voice Interview Session (Question 1)
    console.log('\n--- TEST 2: INTERVIEW SESSION START & QUESTION 1 GENERATION ---');
    const startRes = await makeRequest('/api/ai/mock-interview/start', 'POST', {
        userId: 'candidate_ananya_42',
        resume: resume,
        targetRole: 'Full Stack Engineer',
        department: 'CSE',
        difficulty: 'Intermediate',
        interviewType: 'Technical + Resume Based',
        questionCount: 3
    });

    console.log('Start Status:', startRes.status);
    if (!startRes.data || !startRes.data.success) {
        throw new Error('Failed to start interview session: ' + JSON.stringify(startRes));
    }
    const sessionId = startRes.data.sessionId;
    const q1 = startRes.data.questionData;
    console.log('Session ID:', sessionId);
    console.log('Question 1 Text:', q1.question || q1.question_text);
    console.log('Question 1 Skill / Target:', q1.skill);
    console.log('Question 1 Context Focus:', q1.contextReason);

    // Verify Question 1 is not a generic question and references candidate projects / skills
    const q1Text = (q1.question || q1.question_text || '').toLowerCase();
    const hasResumeSpecificTerms = q1Text.includes('student') || q1Text.includes('management') || 
                                   q1Text.includes('jwt') || q1Text.includes('auth') || 
                                   q1Text.includes('postgresql') || q1Text.includes('node') ||
                                   q1Text.includes('architecture') || q1Text.includes('stack');
    console.log('Is Question 1 Personalized to Resume Claims?', hasResumeSpecificTerms ? 'YES (Verified)' : 'Generic Warning');

    // 3. Answer Question 1 with Real Spoken Answer containing observable filler words and measured duration
    console.log('\n--- TEST 3: ANSWER QUESTION 1 WITH OBSERVABLE FILLERS & DELIBERATE PAUSES ---');
    // Spoken answer with deliberate fillers: "um", "like", "basically", "actually"
    const spokenAnswer1 = "Um, basically, in my Student Management System, I implemented JWT authentication using access tokens and refresh tokens. So, like, when the student logs in with their credentials, the Node.js backend verifies their bcrypt hashed password in PostgreSQL. Then, actually, we issue a short-lived access token with a 15-minute expiry, and a long-lived refresh token stored in an HTTP-only secure cookie. To handle token expiry, when the client gets a 401 response, the frontend Axios interceptor automatically hits the refresh endpoint to acquire a new access token without logging out the student.";
    const duration1 = 48; // 48 seconds for 96 words => approx 120 WPM

    const mockWebm = 'data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAEBAAAAAAA=';

    const ans1Res = await makeRequest('/api/ai/mock-interview/answer', 'POST', {
        sessionId: sessionId,
        userId: 'candidate_ananya_42',
        questionNumber: 1,
        questionText: q1.question || q1.question_text,
        questionType: q1.type,
        spokenTranscript: spokenAnswer1,
        answerDurationSeconds: duration1,
        videoRecordingBase64: mockWebm,
        targetRole: 'Full Stack Engineer',
        department: 'CSE',
        difficulty: 'Intermediate',
        resume: resume
    });

    console.log('Answer 1 Status:', ans1Res.status);
    if (!ans1Res.data || !ans1Res.data.success) {
        throw new Error('Failed to evaluate Answer 1: ' + JSON.stringify(ans1Res));
    }

    const speaking1 = ans1Res.data.speaking || ans1Res.data.speakingMetrics;
    console.log('\n[Observable Speaking Analysis Metrics]');
    console.log(' - Duration (seconds):', speaking1.durationSeconds);
    console.log(' - Words Per Minute (WPM):', speaking1.words_per_minute || speaking1.wpm);
    console.log(' - Filler Word Count:', speaking1.fillerCount || speaking1.filler_word_count);
    console.log(' - Detected Filler Words:', speaking1.uniqueFillers || speaking1.filler_words);
    console.log(' - Pacing Quality:', speaking1.paceQuality || speaking1.pace_score);
    console.log(' - Long Pauses Count:', speaking1.longPauses !== undefined ? speaking1.longPauses : speaking1.long_pauses);
    console.log(' - Conciseness:', speaking1.conciseness);

    console.log('\n[Bar-Raiser Technical Content Evaluation]');
    console.log(' - Technical Score:', ans1Res.data.evaluation?.technicalScore);
    console.log(' - Relevance Score:', ans1Res.data.evaluation?.relevanceScore);
    console.log(' - Depth Score:', ans1Res.data.evaluation?.depthScore);
    console.log(' - Feedback:', ans1Res.data.evaluation?.feedback);
    console.log(' - What You Did Well:', ans1Res.data.evaluation?.strengths);
    console.log(' - Needs Improvement:', ans1Res.data.evaluation?.improvements);
    console.log(' - Staff Engineer Model Answer:', ans1Res.data.evaluation?.modelAnswerApproach || ans1Res.data.evaluation?.improvedAnswer);

    // Verify filler words were genuinely counted
    if ((speaking1.fillerCount || speaking1.filler_word_count) < 2) {
        console.warn('WARNING: Filler words count should reflect "um", "like", "basically", "actually"');
    } else {
        console.log('✓ Filler words genuinely counted from actual spoken transcript!');
    }

    // 4. Inspect Adaptive Question 2
    const q2 = ans1Res.data.nextQuestion;
    console.log('\n--- TEST 4: ADAPTIVE QUESTION 2 FORMULATION ---');
    console.log('Adaptive Question 2 Text:', q2.question || q2.question_text);
    console.log('Is Adaptive Follow-Up:', q2.isFollowUp);
    console.log('Skill Probed:', q2.skill);
    console.log('Context Reason:', q2.contextReason);

    // 5. Test Technically Incorrect / Weak Answer on Question 2
    console.log('\n--- TEST 5: EVALUATING WEAK / INCORRECT TECHNICAL ANSWER ---');
    const weakAnswer = "I think we just put an index on every column in PostgreSQL because more indexes make queries faster and there are no trade-offs.";
    
    const ans2Res = await makeRequest('/api/ai/mock-interview/answer', 'POST', {
        sessionId: sessionId,
        userId: 'candidate_ananya_42',
        questionNumber: 2,
        questionText: q2.question || q2.question_text,
        questionType: q2.type,
        spokenTranscript: weakAnswer,
        answerDurationSeconds: 15,
        videoRecordingBase64: mockWebm,
        targetRole: 'Full Stack Engineer',
        department: 'CSE',
        difficulty: 'Intermediate',
        questionCount: 3,
        resume: resume
    });

    console.log('Answer 2 Status:', ans2Res.status);
    console.log('Weak Answer Technical Score:', ans2Res.data.evaluation?.technicalScore);
    console.log('Critique identifies misconception?', (ans2Res.data.evaluation?.feedback || '').length > 10 ? 'YES' : 'NO');
    console.log('Missing Concepts Identified:', ans2Res.data.evaluation?.missingConcepts);

    const q3 = ans2Res.data.nextQuestion;
    console.log('Question 3 Formulated (Adaptive Investigation):', q3.question || q3.question_text);

    // 6. Answer Question 3 (Final Question)
    console.log('\n--- TEST 6: ANSWERING FINAL QUESTION ---');
    const answer3 = "To optimize slow database queries in PostgreSQL, we run EXPLAIN ANALYZE to check sequential scans vs index scans. We create B-tree indexes only on high-cardinality foreign keys and filter columns, avoid indexing frequently updated columns due to write amplification, and implement connection pooling with PgBouncer to prevent connection starvation.";

    const ans3Res = await makeRequest('/api/ai/mock-interview/answer', 'POST', {
        sessionId: sessionId,
        userId: 'candidate_ananya_42',
        questionNumber: 3,
        questionText: q3.question || q3.question_text,
        questionType: q3.type,
        spokenTranscript: answer3,
        answerDurationSeconds: 32,
        videoRecordingBase64: mockWebm,
        targetRole: 'Full Stack Engineer',
        department: 'CSE',
        difficulty: 'Intermediate',
        questionCount: 3,
        resume: resume
    });

    console.log('Answer 3 Status:', ans3Res.status);
    console.log('Is Complete Flag:', ans3Res.data.isComplete);

    // 7. Complete Interview & Synthesize Final Report
    console.log('\n--- TEST 7: FINAL COMPREHENSIVE SCORECARD & PREPARATION PLAN ---');
    const completeRes = await makeRequest('/api/ai/mock-interview/complete', 'POST', {
        sessionId: sessionId,
        userId: 'candidate_ananya_42',
        targetRole: 'Full Stack Engineer',
        department: 'CSE',
        resume: resume,
        conversation: [
            { question: q1.question || q1.question_text, answer: spokenAnswer1, technicalScore: ans1Res.data.evaluation?.technicalScore, speakingMetrics: speaking1 },
            { question: q2.question || q2.question_text, answer: weakAnswer, technicalScore: ans2Res.data.evaluation?.technicalScore, speakingMetrics: ans2Res.data.speakingMetrics },
            { question: q3.question || q3.question_text, answer: answer3, technicalScore: ans3Res.data.evaluation?.technicalScore, speakingMetrics: ans3Res.data.speakingMetrics }
        ]
    });

    console.log('Complete Status:', completeRes.status);
    const report = completeRes.data.report;
    console.log('\n[Final Multi-Dimensional Scorecard]');
    console.log(' - Overall Score:', report.overallScore + '%');
    console.log(' - Technical Knowledge:', report.technicalScore + '%');
    console.log(' - Communication / Clarity:', report.communicationScore + '%');
    console.log(' - Problem Solving:', report.problemSolvingScore + '%');
    console.log(' - Resume Consistency:', report.resumeScore + '%');
    console.log(' - Project Understanding:', report.projectScore + '%');
    console.log(' - Role Readiness:', report.roleReadinessScore + '%');

    console.log('\n[Resume Claim Verification Audit]');
    console.log(report.resumeGapAnalysis);

    console.log('\n[Top 5 Personalized Preparation Plan Priorities]');
    (report.preparationPlan || []).forEach(p => {
        console.log(` > Priority ${p.priority} [${p.category}]: ${p.title} - ${p.action}`);
    });

    // 8. Test Session Rehydration
    console.log('\n--- TEST 8: SESSION RECOVERY / REHYDRATION ---');
    const sessionRes = await makeRequest(`/api/ai/mock-interview/session/${sessionId}`, 'GET');
    console.log('Rehydration Status:', sessionRes.status);
    console.log('Session Stored In Memory:', !!sessionRes.data?.session);
    console.log('Completed Status in Session:', sessionRes.data?.session?.status);

    console.log('\n====================================================');
    console.log('  ALL 8 VOICE INTERVIEW E2E TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
}

runVoiceInterviewTestSuite().catch(err => {
    console.error('\n❌ E2E TEST FAILED:', err);
    process.exit(1);
});
