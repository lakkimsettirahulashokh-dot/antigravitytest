const fs = require('fs');
const path = require('path');

const branchesFilePath = path.join(__dirname, '..', 'js', 'branches.js');
let content = fs.readFileSync(branchesFilePath, 'utf8');

// Define metadata enhancements for canonical branches
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

console.log('Enhancements defined for', Object.keys(canonicalEnhancements).length, 'branches');
