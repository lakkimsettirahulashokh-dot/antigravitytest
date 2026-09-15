const fs = require('fs');
const path = require('path');

const migrationsDir = 'supabase/migrations';
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

console.log('Analyzing ' + files.length + ' migrations...\n');

const tables = new Map(); // table -> Set of columns
const policies = new Map(); // table -> Map of policy names -> file
const functions = new Set();
const droppedPolicies = new Map(); // table -> Set of dropped policy names

files.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log('=== ' + file + ' ===');

  // Find tables
  const tableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:public\.)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
  let tMatch;
  while ((tMatch = tableRegex.exec(sql)) !== null) {
    const tableName = tMatch[1].toLowerCase();
    if (!tables.has(tableName)) tables.set(tableName, new Set());
    const body = tMatch[2];
    const lines = body.split('\n');
    lines.forEach(l => {
      const colMatch = l.trim().match(/^([a-zA-Z0-9_]+)\s+/);
      if (colMatch && !['constraint', 'primary', 'foreign', 'unique', 'check'].includes(colMatch[1].toLowerCase())) {
        tables.get(tableName).add(colMatch[1].toLowerCase());
      }
    });
    console.log('  [TABLE] ' + tableName + ' (' + tables.get(tableName).size + ' cols)');
  }

  // Find dropped policies
  const dropRegex = /DROP\s+POLICY(?:\s+IF\s+EXISTS)?\s+["']([^"']+)["']\s+ON\s+([^;]+);/gi;
  let dMatch;
  while ((dMatch = dropRegex.exec(sql)) !== null) {
    const pName = dMatch[1];
    const targetTable = dMatch[2].trim().replace(/^(public|storage)\./, '').toLowerCase();
    const remainder = dMatch[2];
    if (/\b(FOR|USING|WITH\s+CHECK)\b/i.test(remainder)) {
      console.error('  ❌ [INVALID DROP POLICY SYNTAX] ' + dMatch[0]);
    }
    if (!droppedPolicies.has(targetTable)) droppedPolicies.set(targetTable, new Set());
    droppedPolicies.get(targetTable).add(pName);
    if (policies.has(targetTable) && policies.get(targetTable).has(pName)) {
      // It was properly dropped before re-creating
      policies.get(targetTable).delete(pName);
    }
  }

  // Find created policies
  const createPolicyRegex = /CREATE\s+POLICY\s+["']([^"']+)["']\s+ON\s+(?:public\.|storage\.)?([a-zA-Z0-9_]+)/gi;
  let pMatch;
  while ((pMatch = createPolicyRegex.exec(sql)) !== null) {
    const pName = pMatch[1];
    const targetTable = pMatch[2].toLowerCase();
    if (!policies.has(targetTable)) policies.set(targetTable, new Map());
    if (policies.get(targetTable).has(pName)) {
      console.warn('  ⚠️ [DUPLICATE POLICY ERROR] "' + pName + '" on ' + targetTable + ' previously created in ' + policies.get(targetTable).get(pName));
    } else {
      policies.get(targetTable).set(pName, file);
    }
  }

  // Check functions
  const funcRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?([a-zA-Z0-9_]+)/gi;
  let fMatch;
  while ((fMatch = funcRegex.exec(sql)) !== null) {
    functions.add(fMatch[1].toLowerCase());
    console.log('  [FUNCTION] ' + fMatch[1]);
  }
});

console.log('\n--- Summary of Tables in Migrations ---');
for (const [tbl, cols] of tables.entries()) {
  console.log(tbl + ': ' + Array.from(cols).join(', '));
}

console.log('\n--- Summary of Functions ---');
console.log(Array.from(functions).join(', '));
