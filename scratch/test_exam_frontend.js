// Frontend integration test for Exam Tracker with PDF Syllabus Analysis
const http = require('http');

function testFrontend() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:8080/exams.html', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          console.log(`[TEST] HTTP Status: ${res.statusCode}`);
          if (res.statusCode !== 200) {
            return reject(new Error(`Failed with status ${res.statusCode}`));
          }

          // Check for key UI elements
          const checks = [
            { name: 'Exams container', needle: 'id="exams-cards-container"' },
            { name: 'Add Exam Modal', needle: 'id="add-exam-modal"' },
            { name: 'PDF Dropzone', needle: 'id="pdf-dropzone"' },
            { name: 'PDF File Input', needle: 'id="pdf-file-input"' },
            { name: 'Weak Subjects Input', needle: 'id="exam-input-weak"' },
            { name: 'Strong Subjects Input', needle: 'id="exam-input-strong"' },
            { name: 'Daily Study Hours Input', needle: 'id="exam-input-daily-hours"' },
            { name: 'Upload Pipeline Card', needle: 'id="upload-pipeline-card"' },
            { name: 'Pipeline Progress Bar', needle: 'id="pipeline-progress-bar"' },
            { name: 'Pipeline Status Text', needle: 'id="pipeline-status-text"' },
            { name: 'Exam Detail Modal', needle: 'id="exam-detail-modal"' },
            { name: 'Official Syllabus Container', needle: 'id="det-syllabus-container"' },
            { name: 'AI Recommendations Container', needle: 'id="det-ai-recommendations"' },
            { name: 'Personalized Phases Container', needle: 'id="det-phases-container"' },
            { name: 'Adaptive Daily Schedule Container', needle: 'id="det-daily-schedule-container"' },
            { name: 'Mock Test Modal', needle: 'id="mock-test-modal"' },
            { name: 'Mock Questions Container', needle: 'id="mock-questions-container"' },
            { name: 'Replace PDF Modal', needle: 'id="replace-pdf-modal"' },
            { name: 'High-Yield Radar Container', needle: 'id="smart-schedule-container"' }
          ];

          let failed = 0;
          for (const c of checks) {
            if (data.includes(c.needle)) {
              console.log(`[PASS] Found: ${c.name}`);
            } else {
              console.error(`[FAIL] Missing: ${c.name} (${c.needle})`);
              failed++;
            }
          }

          if (failed > 0) {
            return reject(new Error(`${failed} frontend checks failed!`));
          }

          console.log('[SUCCESS] All frontend elements verified successfully in exams.html!');
          resolve(true);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

testFrontend()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('[ERROR]', err);
    process.exit(1);
  });
