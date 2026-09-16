/**
 * Test Frontend Client Flow & Reactive Profile Update Simulation
 */
const fs = require('fs');
const path = require('path');

// Setup mock window & document
class MockClassList {
    constructor() { this.classes = new Set(); }
    add(c) { this.classes.add(c); }
    remove(c) { this.classes.delete(c); }
    contains(c) { return this.classes.has(c); }
}

class MockElement {
    constructor(tagName, id = '') {
        this.tagName = tagName;
        this.id = id;
        this.textContent = '';
        this.innerHTML = '';
        this.classList = new MockClassList();
        this.dataset = {};
        this.attributes = {};
        this.style = {};
        this.children = [];
    }
    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k] !== undefined ? this.attributes[k] : null; }
    querySelectorAll(selector) {
        // Simple mock for ad elements
        if (selector === '.user-branch-display') {
            return [userBranchDisplay];
        }
        return [];
    }
    querySelector(selector) {
        return null;
    }
}

const elements = {};
function getOrCreate(id) {
    if (!elements[id]) elements[id] = new MockElement('div', id);
    return elements[id];
}

const navTitle = getOrCreate('nav-branch-title');
const headerPill = getOrCreate('header-branch-pill');
const heroBadge = getOrCreate('hero-badge');
const heroTitle = getOrCreate('hero-title');
const heroTagline = getOrCreate('hero-tagline');
const heroSemBadge = getOrCreate('hero-semester-badge');
const statTopics = getOrCreate('stat-topics-count');
const modulesContainer = getOrCreate('modules-container');
const projectsContainer = getOrCreate('projects-container');
const careersContainer = getOrCreate('careers-container');
const interviewsContainer = getOrCreate('interviews-container');
const userBranchDisplay = new MockElement('div');
userBranchDisplay.classList.add('user-branch-display');

global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
};

global.document = {
    getElementById(id) { return elements[id] || null; },
    querySelectorAll(selector) {
        if (selector === '.user-branch-display') return [userBranchDisplay];
        return [];
    }
};

// Mock fetch
const catalog = require('../data/branch_learning_catalog.json');
global.fetch = async (url) => {
    const parsed = new URL(url, 'http://localhost:8080');
    if (parsed.pathname === '/api/branch-learning') {
        const branch = parsed.searchParams.get('branch');
        const sem = parseInt(parsed.searchParams.get('semester') || '1', 10);
        if (!branch) {
            return { ok: true, json: async () => ({ success: true, specialization: null }) };
        }
        const BranchSystem = require('../js/branches.js');
        const resolved = BranchSystem.resolveBranch(branch);
        const spec = catalog[resolved.code] ? JSON.parse(JSON.stringify(catalog[resolved.code])) : null;
        if (spec) {
            spec.activeSemester = sem;
            spec.modules.forEach(m => {
                m.isRecommendedForSemester = (m.semesterRecommendation || []).includes(sem);
            });
        }
        return { ok: true, json: async () => ({ success: true, specialization: spec }) };
    }
    return { ok: false };
};

const BranchSystem = require('../js/branches.js');
global.BranchSystem = BranchSystem;

// Load branch-learning.js
const branchLearningCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'branch-learning.js'), 'utf8');
eval(branchLearningCode);
const BranchLearning = global.window.BranchLearning;

async function testFlow() {
    console.log('Testing Frontend Client Flow...\n');

    // 1. Initial State: No Branch Selected
    BranchLearning.currentBranch = '';
    BranchLearning.currentSemester = 1;
    await BranchLearning.loadSpecialization();

    console.log('--- 1. Testing No-Branch State ---');
    console.log('Hero Title:', heroTitle.textContent);
    console.log('Hero Badge:', heroBadge.textContent);
    console.log('User Branch Display:', userBranchDisplay.textContent);
    if (!heroTitle.textContent.includes('Branch Personalization') || userBranchDisplay.textContent !== 'None') {
        throw new Error('No-branch state failed!');
    }
    console.log('✅ No-Branch State Verified (No ECE fallback)\n');

    // 2. Select EIE Semester 4
    console.log('--- 2. Setting Profile to EIE (Semester 4) ---');
    BranchLearning.currentBranch = BranchLearning.normalizeBranch('Electronics and Instrumentation Engineering');
    BranchLearning.currentSemester = 4;
    await BranchLearning.loadSpecialization();

    console.log('Nav Title:', navTitle.textContent);
    console.log('Header Pill:', headerPill.textContent);
    console.log('Hero Title:', heroTitle.textContent);
    console.log('Hero Badge:', heroBadge.textContent);
    console.log('User Branch Display:', userBranchDisplay.textContent);
    console.log('Semester Badge:', heroSemBadge.textContent);
    console.log('Modules HTML length:', modulesContainer.innerHTML.length);

    if (userBranchDisplay.textContent !== 'EIE') throw new Error('userBranchDisplay is not EIE!');
    if (!heroTitle.textContent.includes('Instrumentation')) throw new Error('Hero title is not EIE instrumentation!');
    if (!modulesContainer.innerHTML.includes('Precision Measurement')) throw new Error('Modules do not contain EIE curriculum!');
    console.log('✅ EIE Specialization Loaded Verified\n');

    // 3. Reactive update to Automobile Engineering
    console.log('--- 3. Reactively Switching to Automobile (Semester 6) ---');
    BranchLearning.currentBranch = BranchLearning.normalizeBranch('Automobile Engineering');
    BranchLearning.currentSemester = 6;
    await BranchLearning.loadSpecialization();

    console.log('Nav Title:', navTitle.textContent);
    console.log('Header Pill:', headerPill.textContent);
    console.log('Hero Title:', heroTitle.textContent);
    console.log('User Branch Display:', userBranchDisplay.textContent);
    console.log('Semester Badge:', heroSemBadge.textContent);

    if (userBranchDisplay.textContent !== 'AUTO') throw new Error('userBranchDisplay is not AUTO!');
    if (!heroTitle.textContent.includes('Automobile')) throw new Error('Hero title is not Automobile!');
    console.log('✅ Reactive Switch to AUTO Verified\n');

    console.log('🎉 ALL CLIENT FLOW TESTS PASSED COMPLETELY!');
}

testFlow().catch(err => {
    console.error('Client flow failed:', err);
    process.exit(1);
});
