const crypto = require('crypto');

function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

const salt = "c33f4beb7a9ecf75af04e41131cf9d17";
const targetHash = "393c22f0bcaf69e76e4205072dc56bf999e1699d582e9525952736f9bf133afdf132db219b7f187cc5cb8082a26ff2a87745ccdec701f7c92927e8d7b0a8abc1";

const candidates = [
    'Student@123', 'Password@123', 'TechPath@2026', 'Rahul@123', 'Rahul@12345',
    'Ashokh@123', 'Ashokh@2026', 'Admin@123', 'Admin@2026', 'Test@1234',
    'Ashokh123', 'Ashokh1234', 'Ashokh12345', 'ashokh123', 'ashokh@123',
    'rahul123', 'rahul@123', 'rahul12345',
    '123456', '12345678', 'password', 'password123', 'Password123',
    'student', 'student123', 'Student123', 'Student@2026',
    'Techpath@123', 'techpath@123', 'techpath123',
    'AIML@123', 'aiml@123', 'AIML123',
    'Btechpath@123', 'btechpath123'
];

for (const c of candidates) {
    if (hashPassword(c, salt) === targetHash) {
        console.log(`🎉 MATCH FOUND! Password is: "${c}"`);
        process.exit(0);
    }
}
console.log('No match found in candidates.');
