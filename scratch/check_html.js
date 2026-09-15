const http = require('http');

http.get('http://127.0.0.1:8080/mock-interview.html', res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        console.log('HTTP Status:', res.statusCode);
        const checks = [
            'tts-status-pill',
            'tts-status-label',
            'btn-replay-voice',
            'btn-pause-voice',
            'tts-error-banner',
            'your-turn-banner',
            'mic-denied-alert',
            'empty-answer-alert',
            'audio-waveform',
            'candidate-camera-stream',
            'start-recording-btn',
            'stop-recording-btn',
            'submit-answer-btn'
        ];
        checks.forEach(id => {
            console.log(`DOM ID "${id}":`, d.includes(`id="${id}"`) ? 'EXISTS ✓' : 'MISSING ✗');
        });
    });
});
