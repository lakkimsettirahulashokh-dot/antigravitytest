const fs = require('fs');
const path = require('path');

const branchesFilePath = path.join(__dirname, '..', 'js', 'branches.js');
let code = fs.readFileSync(branchesFilePath, 'utf8');

const canonicalEnhancements = {
  'CSE': {
    id: 'branch_cse',
    slug: 'cse',
    aliases: ['Computer Science & Engineering', 'Computer Science and Engineering', 'Computer Science', 'CS', 'CSE', 'Software Engineering']
  },
  'IT': {
    id: 'branch_it',
    slug: 'it',
    aliases: ['Information Technology', 'Infotech', 'IT']
  },
  'AI': {
    id: 'branch_ai',
    slug: 'ai',
    aliases: ['Artificial Intelligence', 'AI']
  },
  'AIML': {
    id: 'branch_aiml',
    slug: 'aiml',
    aliases: ['Artificial Intelligence & Machine Learning', 'Artificial Intelligence and Machine Learning', 'AI & ML', 'AI/ML', 'AIML']
  },
  'DS': {
    id: 'branch_ds',
    slug: 'data-science',
    aliases: ['Data Science', 'DS']
  },
  'AIDS': {
    id: 'branch_aids',
    slug: 'ai-data-science',
    aliases: ['AI & Data Science', 'AIDS']
  },
  'CSIT': {
    id: 'branch_csit',
    slug: 'csit',
    aliases: ['Computer Science & Information Technology', 'CSIT']
  },
  'SE': {
    id: 'branch_se',
    slug: 'software-engineering',
    aliases: ['Software Engineering', 'SE']
  },
  'CLOUD': {
    id: 'branch_cloud',
    slug: 'cloud-computing',
    aliases: ['Cloud Computing & DevOps', 'Cloud Computing', 'CLOUD']
  },
  'BLOCK': {
    id: 'branch_blockchain',
    slug: 'blockchain',
    aliases: ['Blockchain Technology', 'Blockchain', 'BLOCK']
  },
  'IOT': {
    id: 'branch_iot',
    slug: 'iot',
    aliases: ['Internet of Things (IoT)', 'Internet of Things', 'IoT', 'IOT']
  },
  'CYBER': {
    id: 'branch_cyber',
    slug: 'cyber-security',
    aliases: ['Cyber Security & Digital Forensics', 'Cyber Security', 'Cybersecurity', 'CYBER']
  },
  'ECE': {
    id: 'branch_ece',
    slug: 'ece',
    aliases: ['Electronics & Communication Engineering', 'Electronics and Communication Engineering', 'Electronics & Communication', 'EC', 'ECE', 'Telecommunications']
  },
  'EEE': {
    id: 'branch_eee',
    slug: 'eee',
    aliases: ['Electrical & Electronics Engineering', 'Electrical and Electronics Engineering', 'Electrical Engineering', 'EE', 'EEE']
  },
  'EIE': {
    id: 'branch_eie',
    slug: 'eie',
    name: 'Electrical & Instrumentation Engineering',
    aliases: ['Electrical & Instrumentation Engineering', 'Electronics & Instrumentation Engineering', 'Electrical and Instrumentation Engineering', 'Electronics and Instrumentation Engineering', 'Electrical & Instrumentation', 'Electronics & Instrumentation', 'Instrumentation Engineering', 'Instrumentation', 'EI', 'EIE']
  },
  'VLSI': {
    id: 'branch_vlsi',
    slug: 'vlsi',
    aliases: ['VLSI & Microelectronics', 'VLSI Design', 'VLSI']
  },
  'EMBEDDED': {
    id: 'branch_embedded',
    slug: 'embedded-systems',
    aliases: ['Embedded Systems', 'Embedded', 'EMBEDDED']
  },
  'MECH': {
    id: 'branch_mech',
    slug: 'mechanical-engineering',
    aliases: ['Mechanical Engineering', 'Mechanical', 'ME', 'MECH']
  },
  'AUTO': {
    id: 'branch_auto',
    slug: 'automobile-engineering',
    aliases: ['Automobile Engineering', 'Automotive Engineering', 'Automobile', 'Automotive', 'AU', 'AUTO']
  },
  'MECHTRON': {
    id: 'branch_mechtron',
    slug: 'mechatronics',
    aliases: ['Mechatronics Engineering', 'Mechatronics', 'Electro-Mechanical', 'MTR', 'MECHTRON']
  },
  'ROBOTICS': {
    id: 'branch_robotics',
    slug: 'robotics',
    aliases: ['Robotics Engineering', 'Robotics', 'ROBO', 'ROBOTICS']
  },
  'MFG': {
    id: 'branch_mfg',
    slug: 'manufacturing-engineering',
    aliases: ['Manufacturing Engineering', 'Production Engineering', 'Manufacturing', 'Production', 'PROD', 'MFG']
  },
  'IND': {
    id: 'branch_ind',
    slug: 'industrial-engineering',
    aliases: ['Industrial & Production Engineering', 'Industrial Engineering', 'Industrial', 'IND']
  },
  'CIVIL': {
    id: 'branch_civil',
    slug: 'civil-engineering',
    aliases: ['Civil Engineering', 'Civil', 'CE', 'CIVIL']
  },
  'STRUCT': {
    id: 'branch_struct',
    slug: 'structural-engineering',
    aliases: ['Structural Engineering', 'Structural', 'STRUCT']
  },
  'CONST': {
    id: 'branch_const',
    slug: 'construction-engineering',
    aliases: ['Construction Engineering & Management', 'Construction Engineering', 'CONST']
  },
  'TRANS': {
    id: 'branch_trans',
    slug: 'transportation-engineering',
    aliases: ['Transportation Engineering', 'TRANS']
  },
  'ENV': {
    id: 'branch_env',
    slug: 'environmental-engineering',
    aliases: ['Environmental Engineering', 'ENV']
  },
  'CHEM': {
    id: 'branch_chem',
    slug: 'chemical-engineering',
    aliases: ['Chemical Engineering', 'Chemical', 'CH', 'CHEM']
  },
  'PETRO': {
    id: 'branch_petro',
    slug: 'petroleum-engineering',
    aliases: ['Petroleum & Petrochemical Engineering', 'Petroleum Engineering', 'PETRO']
  },
  'MET': {
    id: 'branch_met',
    slug: 'metallurgical-engineering',
    aliases: ['Metallurgical & Materials Engineering', 'Metallurgy', 'MET']
  },
  'BIOTECH': {
    id: 'branch_biotech',
    slug: 'biotechnology',
    aliases: ['Biotechnology', 'Biotech', 'BT', 'BIOTECH']
  },
  'BIOINFO': {
    id: 'branch_bioinfo',
    slug: 'bioinformatics',
    aliases: ['Bioinformatics', 'BIOINFO']
  },
  'BIOMED': {
    id: 'branch_biomed',
    slug: 'biomedical-engineering',
    aliases: ['Biomedical Engineering', 'Biomedical', 'Medical Electronics', 'BME', 'BIOMED']
  },
  'AERO': {
    id: 'branch_aero',
    slug: 'aerospace-engineering',
    aliases: ['Aerospace Engineering', 'Aeronautical Engineering', 'Aerospace', 'Aeronautical', 'AERO', 'AERONAUT']
  },
  'AERONAUT': {
    id: 'branch_aeronaut',
    slug: 'aeronautical-engineering',
    aliases: ['Aeronautical Engineering', 'Aeronautical', 'AERONAUT']
  },
  'AVIONICS': {
    id: 'branch_avionics',
    slug: 'avionics',
    aliases: ['Avionics Engineering', 'Avionics', 'AVIONICS']
  },
  'AGRI': {
    id: 'branch_agri',
    slug: 'agricultural-engineering',
    aliases: ['Agricultural Engineering', 'Agriculture', 'AGRI']
  },
  'FOOD': {
    id: 'branch_food',
    slug: 'food-technology',
    aliases: ['Food Technology', 'Food Engineering', 'FOOD']
  },
  'TEXTILE': {
    id: 'branch_textile',
    slug: 'textile-engineering',
    aliases: ['Textile Engineering', 'Textile', 'TEXTILE']
  },
  'MARINE': {
    id: 'branch_marine',
    slug: 'marine-engineering',
    aliases: ['Marine Engineering', 'Marine', 'MARINE']
  },
  'MINING': {
    id: 'branch_mining',
    slug: 'mining-engineering',
    aliases: ['Mining Engineering', 'Mining', 'MINING']
  },
  'ENERGY': {
    id: 'branch_energy',
    slug: 'energy-engineering',
    aliases: ['Energy Engineering', 'Renewable Energy', 'ENERGY']
  }
};

// Replace BranchSystem.init and add canonical resolution method
const initInjection = `
  // Canonical Branch Resolution & Normalization (No fragile substring bugs)
  resolveBranch(input) {
    if (!input) return null;
    const raw = String(input).trim();
    if (!raw) return null;
    const upper = raw.toUpperCase();
    const lower = raw.toLowerCase().replace(/[^a-z0-9&]/g, ' ').replace(/\\s+/g, ' ').trim();
    const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    this.init();

    // 1. Direct code or slug or id match
    for (const b of this.branches) {
      if (b.code.toUpperCase() === upper) return b;
      if (b.slug && (b.slug === slug || b.slug === lower)) return b;
      if (b.id && b.id.toLowerCase() === lower) return b;
    }

    // 2. Strict alias match
    for (const b of this.branches) {
      if (Array.isArray(b.aliases)) {
        for (const alias of b.aliases) {
          const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9&]/g, ' ').replace(/\s+/g, ' ').trim();
          if (cleanAlias === lower || alias.toUpperCase() === upper) return b;
        }
      }
    }

    // Direct compound check for AI & ML
    if ((lower.includes('ai') && lower.includes('ml')) || upper.includes('AIML')) {
      const found = this.branches.find(b => b.code === 'AIML');
      if (found) return found;
    }

    // 3. Priority-ordered token / phrase match (SPECIFIC COMPOUND BRANCHES FIRST)
    // Critical: EIE, MECHTRON, BIOMED, AERONAUT, AIML, AUTO must match before generic ECE, MECH, EEE, CSE!
    const priorityChecks = [
      { code: 'EIE', patterns: ['instrumentation', 'eie', 'electrical & instrumentation', 'electronics & instrumentation'] },
      { code: 'AUTO', patterns: ['automobile', 'automotive', 'vehicle'] },
      { code: 'MECHTRON', patterns: ['mechatronic', 'mechatronics'] },
      { code: 'ROBOTICS', patterns: ['robotics', 'robot'] },
      { code: 'BIOMED', patterns: ['biomedical', 'biomed', 'medical electronics'] },
      { code: 'BIOTECH', patterns: ['biotechnology', 'biotech'] },
      { code: 'AERONAUT', patterns: ['aeronautical', 'aeronaut'] },
      { code: 'AERO', patterns: ['aerospace', 'avionics'] },
      { code: 'CHEM', patterns: ['chemical'] },
      { code: 'MFG', patterns: ['manufacturing', 'production'] },
      { code: 'IND', patterns: ['industrial'] },
      { code: 'AIML', patterns: ['machine learning', 'aiml', 'ai & ml', 'ai/ml', 'ai / ml', 'ai / ai&ml', 'ai ai ml', 'artificial intelligence', 'ai & data science'] },
      { code: 'AI', patterns: ['artificial intelligence'] },
      { code: 'DS', patterns: ['data science'] },
      { code: 'CYBER', patterns: ['cyber', 'security'] },
      { code: 'IOT', patterns: ['internet of things', 'iot'] },
      { code: 'VLSI', patterns: ['vlsi', 'microelectronics'] },
      { code: 'EEE', patterns: ['electrical & electronics', 'electrical and electronics', 'eee'] },
      { code: 'ECE', patterns: ['electronics & communication', 'electronics and communication', 'ece', 'electronics', 'telecom'] },
      { code: 'MECH', patterns: ['mechanical', 'mech'] },
      { code: 'CIVIL', patterns: ['civil', 'structural'] },
      { code: 'IT', patterns: ['information technology'] },
      { code: 'CSE', patterns: ['computer science', 'computer', 'software'] },
      { code: 'EEE', patterns: ['electrical'] } // plain electrical fallback
    ];

    for (const check of priorityChecks) {
      for (const p of check.patterns) {
        if (lower.includes(p) || upper.includes(p.toUpperCase())) {
          const found = this.branches.find(b => b.code === check.code);
          if (found) return found;
        }
      }
    }

    return null;
  },

  // Normalize any branch code or string to canonical uppercase branch code
  normalizeBranchCode(input) {
    const resolved = this.resolveBranch(input);
    return resolved ? resolved.code : '';
  },
`;

// Inject enhancements into branch objects in init()
const initAugment = `
  // Initialize and load any admin-configured custom branches from localStorage / Supabase
  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Apply canonical attributes (id, slug, aliases, active status)
    const canonicalMap = ${JSON.stringify(canonicalEnhancements)};
    this.branches.forEach(b => {
      const meta = canonicalMap[b.code];
      if (meta) {
        b.id = b.id || meta.id;
        b.slug = b.slug || meta.slug;
        b.aliases = b.aliases || meta.aliases;
        if (meta.name) b.name = meta.name;
      } else {
        b.id = b.id || ('branch_' + b.code.toLowerCase());
        b.slug = b.slug || b.code.toLowerCase();
        b.aliases = b.aliases || [b.name, b.code];
      }
      if (b.is_active === undefined) b.is_active = true;
    });
`;

code = code.replace(/\/\/ Initialize and load any admin-configured custom branches from localStorage \/ Supabase\s*init\(\) \{[\s\S]*?this\.branches\.forEach\(b => \{\s*if \(b\.is_active === undefined\) b\.is_active = true;\s*\}\);/, initAugment);

// Inject resolveBranch into BranchSystem before getBranch
code = code.replace(/getBranch\(code\) \{/, initInjection + '\n  getBranch(code) {');

fs.writeFileSync(branchesFilePath, code, 'utf8');
console.log('Successfully updated js/branches.js');

// Test loading and resolving
const updatedBranchSystem = require('../js/branches.js');
console.log('Testing branch resolutions:');
const testCases = [
  'ECE',
  'Electronics & Instrumentation Engineering',
  'Electrical & Instrumentation Engineering',
  'EIE',
  'Automobile Engineering',
  'AUTO',
  'EEE',
  'Electrical Engineering',
  'Mechanical Engineering',
  'CSE',
  'IT',
  'AI / AI&ML',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Biomedical Engineering',
  'Aerospace Engineering',
  'Mechatronics',
  'Robotics',
  'Manufacturing Engineering',
  'Industrial Engineering',
  '',
  null,
  'UnknownBranchXYZ'
];

testCases.forEach(tc => {
  const resolved = updatedBranchSystem.resolveBranch(tc);
  console.log(`  "${tc}" => ${resolved ? `${resolved.code} (${resolved.name}, slug: ${resolved.slug})` : 'NULL'}`);
});
