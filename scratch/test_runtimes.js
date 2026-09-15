const { execSync } = require('child_process');

console.log('Testing host runtimes:');

try {
    const nodeOut = execSync('node -v').toString().trim();
    console.log('Node:', nodeOut);
} catch (e) {
    console.log('Node failed:', e.message);
}

try {
    const javacOut = execSync('javac -version').toString().trim();
    console.log('Javac:', javacOut);
} catch (e) {
    console.log('Javac failed:', e.message);
}

try {
    // java -version writes to stderr!
    let javaOut;
    try {
        javaOut = execSync('java -version', { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
    } catch (err) {
        javaOut = err.stderr ? err.stderr.toString().trim() : err.message;
    }
    console.log('Java runtime:', javaOut ? javaOut.split('\n')[0] : 'None');
} catch (e) {
    console.log('Java failed:', e.message);
}
