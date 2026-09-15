const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.git',
  '.system_generated',
  'scratch',
  'assets'
]);

const SECRET_PATTERNS = [
  { name: 'Supabase Service Role Key', regex: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, filter: (str) => {
    try {
      const parts = str.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      return payload.role === 'service_role';
    } catch (e) { return false; }
  }},
  { name: 'Google API Key / AIza', regex: /AIza[0-9A-Za-z-_]{35}/g },
  { name: 'OpenRouter Key', regex: /sk-or-v1-[a-f0-9]{64}/g },
  { name: 'OpenAI Key', regex: /sk-[a-zA-Z0-9]{32,}/g },
  { name: 'Google Client Secret', regex: /GOCSPX-[a-zA-Z0-9_-]{28}/g },
  { name: 'Database URL with Password', regex: /postgres(ql)?:\/\/[^:]+:([^@]+)@/g },
  { name: 'Private Key block', regex: /-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----/g },
  { name: 'Hardcoded Admin Password', regex: /(admin_password|adminPassword|ADMIN_PASS)\s*[:=]\s*['"][^'"]+['"]/gi }
];

const findings = [];

function scanFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const allowedExts = new Set(['.js', '.html', '.css', '.json', '.env', '.example', '.md', '.txt', '.sql']);
  const basename = path.basename(filePath);
  
  if (!allowedExts.has(ext) && !basename.startsWith('.env')) return;
  if (basename === 'secret_audit.js' || basename.includes('package-lock.json')) return;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    SECRET_PATTERNS.forEach(pat => {
      let match;
      const rx = new RegExp(pat.regex);
      while ((match = rx.exec(content)) !== null) {
        const matchedStr = match[0];
        if (pat.filter && !pat.filter(matchedStr)) {
          continue;
        }
        // Mask the secret: first 4 and last 4 chars
        const masked = matchedStr.length > 10 
          ? matchedStr.substring(0, 4) + '...' + matchedStr.substring(matchedStr.length - 4)
          : '***';
        
        findings.push({
          file: path.relative(ROOT, filePath),
          type: pat.name,
          masked: masked,
          index: match.index
        });
      }
    });
  } catch (e) {}
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (!EXCLUDE_DIRS.has(ent.name)) {
        walkDir(path.join(dir, ent.name));
      }
    } else {
      scanFile(path.join(dir, ent.name));
    }
  }
}

walkDir(ROOT);

console.log(`Scan Complete. Found ${findings.length} secret matches:\n`);
findings.forEach((f, i) => {
  console.log(`${i + 1}. [${f.type}] in ${f.file} -> ${f.masked}`);
});
