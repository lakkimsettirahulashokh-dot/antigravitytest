/**
 * ==============================================================================
 * BTechPath AI OS - Smart Branch-Specific Learning Controller
 * File: js/branch-learning.js
 * Description: Renders branch-specific specialized learning content based on
 *              user's canonical profile (ECE -> Chips & Semiconductors,
 *              Automobile -> Engines). Dynamically listens to btech:profile-updated
 *              to switch content instantaneously without page reload or logout.
 * ==============================================================================
 */

const BranchLearning = {
    currentBranch: null,
    currentSemester: 1,
    activeTab: 'curriculum',
    specialization: null,
    _currentRequestId: 0,
    _currentAbortController: null,

    async init() {
        this.bindEvents();
        await this.syncWithCanonicalProfile();
        await this.loadSpecialization();
    },

    normalizeBranch(val) {
        if (!val) return '';
        if (typeof BranchSystem !== 'undefined' && BranchSystem.resolveBranch) {
            const resolved = BranchSystem.resolveBranch(val);
            if (resolved && resolved.code) return resolved.code;
        }
        return String(val).toUpperCase().trim();
    },

    bindEvents() {
        // Listen for live canonical profile changes from profile.html or anywhere in TechPath
        window.addEventListener('btech:profile-updated', async (event) => {
            console.log('[BranchLearning] Reactive profile update event received');
            const profile = event.detail;
            if (profile) {
                const rawBranch = profile.department_id || profile.branch || profile.department || '';
                const newBranch = this.normalizeBranch(rawBranch);
                const newSem = parseInt(profile.semester || profile.semesterNumber || 1, 10) || 1;
                
                this.currentBranch = newBranch;
                this.currentSemester = newSem;
                await this.loadSpecialization();
            }
        });

        // Listen on multi-tab BroadcastChannel
        try {
            const channel = new BroadcastChannel('techpath-profile-sync');
            channel.onmessage = async (event) => {
                if (event.data && (event.data.type === 'PROFILE_UPDATED' || event.data.profile)) {
                    console.log('[BranchLearning] BroadcastChannel sync received');
                    await this.syncWithCanonicalProfile();
                    await this.loadSpecialization();
                }
            };
        } catch (e) {}
    },

    async syncWithCanonicalProfile() {
        let profile = null;
        if (typeof AuthManager !== 'undefined') {
            if (typeof AuthManager.getUserProfile === 'function') {
                profile = AuthManager.getUserProfile();
            } else if (typeof AuthManager.getUser === 'function') {
                profile = AuthManager.getUser();
            }
        }
        if (!profile && typeof localStorage !== 'undefined') {
            try {
                const sessionKey = (typeof AuthManager !== 'undefined' && AuthManager.SESSION_KEY) || 'TechPath_user_session';
                const s = localStorage.getItem(sessionKey) || localStorage.getItem('TechPath_user_session') || localStorage.getItem('btechpath_user_session');
                if (s) profile = JSON.parse(s);
            } catch (e) {}
        }

        if (profile) {
            const rawBranch = profile.department_id || profile.branch || profile.department || '';
            this.currentBranch = this.normalizeBranch(rawBranch);
            this.currentSemester = parseInt(profile.semester || profile.semesterNumber || 1, 10) || 1;
        } else {
            this.currentBranch = '';
            this.currentSemester = 1;
        }
    },

    async loadSpecialization() {
        const branchCode = this.currentBranch;
        const requestId = ++this._currentRequestId;

        if (this._currentAbortController) {
            this._currentAbortController.abort();
        }
        this._currentAbortController = new AbortController();

        // 1. If no branch selected, show explicit empty state immediately
        if (!branchCode) {
            this.specialization = null;
            this.renderNoBranchState();
            return;
        }

        // 2. Show clear loading state
        this.renderLoadingState(branchCode);

        try {
            const branchParam = encodeURIComponent(branchCode);
            const semParam = encodeURIComponent(this.currentSemester || 1);
            const res = await fetch(`/api/branch-learning?branch=${branchParam}&semester=${semParam}`, {
                signal: this._currentAbortController.signal,
                headers: { 'Cache-Control': 'no-cache' }
            });

            // Discard stale responses (race-condition protection)
            if (requestId !== this._currentRequestId) {
                console.log('[BranchLearning] Stale response ignored for request ID:', requestId);
                return;
            }

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.specialization && Object.keys(data.specialization).length > 0) {
                    this.specialization = data.specialization;
                    this.render();
                    return;
                }
            }

            // No specialization mapped for this branch
            this.specialization = null;
            this.renderEmptyBranchState(branchCode);
        } catch (err) {
            if (err.name === 'AbortError') return;
            if (requestId !== this._currentRequestId) return;
            console.error(`[BranchLearning] Unable to load ${branchCode} learning resources:`, err);
            this.renderErrorState(branchCode, err.message);
        }
    },

    switchTab(tabId) {
        this.activeTab = tabId;
        const tabs = ['curriculum', 'projects', 'careers', 'interviews'];
        
        tabs.forEach(t => {
            const btn = document.getElementById(`tab-btn-${t}`);
            const content = document.getElementById(`tab-content-${t}`);
            if (t === tabId) {
                if (btn) btn.className = 'tab-btn active px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border border-transparent transition-all shrink-0';
                if (content) content.classList.remove('hidden');
            } else {
                if (btn) btn.className = 'tab-btn px-4 py-2.5 rounded-xl text-xs font-semibold text-[#A1A7BC] hover:text-white flex items-center gap-2 border border-transparent transition-all shrink-0';
                if (content) content.classList.add('hidden');
            }
        });
    },

    render() {
        const spec = this.specialization;
        if (!spec) return;

        // 1. Update Header & Hero Elements
        const navTitle = document.getElementById('nav-branch-title');
        const headerPill = document.getElementById('header-branch-pill');
        const heroBadge = document.getElementById('hero-badge');
        const heroTitle = document.getElementById('hero-title');
        const heroTagline = document.getElementById('hero-tagline');
        const heroSemBadge = document.getElementById('hero-semester-badge');
        const statTopicsCount = document.getElementById('stat-topics-count');

        const branchDisplayName = this.getBranchDisplayName(spec.branchCode);
        if (navTitle) navTitle.textContent = `${spec.branchCode} Learning`;
        if (headerPill) headerPill.textContent = `${spec.branchCode} • ${(spec.specializationTitle || branchDisplayName).split(':')[0]}`;
        if (heroBadge) heroBadge.textContent = spec.badge || `${spec.branchCode} SPECIALIZATION`;
        if (heroTitle) heroTitle.textContent = spec.specializationTitle || `${branchDisplayName} Curriculum`;
        if (heroTagline) heroTagline.textContent = spec.specializationTagline || `Specialized engineering curriculum for ${branchDisplayName}.`;
        if (statTopicsCount) statTopicsCount.textContent = `${spec.topicsCount || 25} Topics`;

        document.querySelectorAll('.user-branch-display').forEach(el => {
            el.textContent = spec.branchCode;
        });

        const activeSem = spec.activeSemester || this.currentSemester || 1;
        const semPhase = activeSem <= 2 ? 'Fundamentals Phase' : (activeSem <= 5 ? 'Core Architecture Phase' : 'Capstone & Industry Phase');
        if (heroSemBadge) heroSemBadge.textContent = `Semester ${activeSem} • ${spec.semesterPhase || semPhase}`;

        // 2. Render Tab 1: Curriculum Modules
        this.renderCurriculum(spec);

        // 3. Render Tab 2: Projects
        this.renderProjects(spec);

        // 4. Render Tab 3: Careers & Roadmap
        this.renderCareers(spec);

        // 5. Render Tab 4: Interviews
        this.renderInterviews(spec);
    },

    renderCurriculum(spec) {
        const container = document.getElementById('modules-container');
        if (!container) return;

        if (!spec.modules || spec.modules.length === 0) {
            container.innerHTML = `<div class="p-6 text-center text-xs text-[#A1A7BC] glass-card rounded-2xl">No modules found for this branch.</div>`;
            return;
        }

        const activeSem = spec.activeSemester || this.currentSemester || 1;

        container.innerHTML = spec.modules.map((mod, modIdx) => `
            <div class="glass-card rounded-2xl border border-[#2A3147] overflow-hidden transition-all">
                <div class="p-4 sm:p-5 flex items-center justify-between cursor-pointer bg-[#121826]/90 hover:bg-[#1A2031]" onclick="BranchLearning.toggleModule('module-block-${modIdx}')">
                    <div class="flex items-center gap-3">
                        <span class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-mono font-bold flex items-center justify-center text-xs border border-indigo-500/30">
                            0${modIdx + 1}
                        </span>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="text-sm font-bold text-white">${this.escapeHtml(mod.title)}</h3>
                                ${mod.isRecommendedForSemester ? `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Recommended for Sem ${activeSem}</span>` : ''}
                            </div>
                            <span class="text-[10px] font-mono text-indigo-300">${mod.badge || 'Core Academic Topic'} • ${(mod.topics || []).length} In-depth Concepts</span>
                        </div>
                    </div>
                    <span id="module-block-${modIdx}-icon" class="material-symbols-outlined text-base text-[#A1A7BC] transition-transform duration-200">
                        expand_more
                    </span>
                </div>

                <div id="module-block-${modIdx}" class="p-4 sm:p-5 space-y-3 bg-[#0B0F19]/60 border-t border-[#2A3147]/60">
                    ${(mod.topics || []).map((t, tIdx) => `
                        <div class="topic-card p-4 rounded-xl bg-[#121826]/70 border border-[#2A3147] hover:border-indigo-500/40 transition-all space-y-2">
                            <div class="flex items-center justify-between gap-2">
                                <div class="flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    <h4 class="text-xs font-bold text-white font-mono">${this.escapeHtml(t.name)}</h4>
                                </div>
                                <span class="text-[10px] font-mono text-[#A1A7BC] px-2 py-0.5 rounded bg-[#1A2031]">Topic ${tIdx + 1}</span>
                            </div>
                            <div class="text-xs text-[#CBD5E1] leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-indigo-500/40">
${this.formatContent(t.content)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    renderProjects(spec) {
        const container = document.getElementById('projects-container');
        if (!container) return;

        // Find module 5 project portfolio
        let projectItems = [];
        spec.modules.forEach(m => {
            (m.topics || []).forEach(t => {
                if (t.id.includes('project') || t.name.toLowerCase().includes('project')) {
                    const lines = t.content.split('\n');
                    lines.forEach(l => {
                        if (l.trim().match(/^\d+\./)) {
                            const parts = l.replace(/^\d+\.\s*/, '').split(':');
                            projectItems.push({
                                title: parts[0]?.trim() || 'Engineering Capstone Project',
                                description: parts[1]?.trim() || l.trim()
                            });
                        }
                    });
                }
            });
        });

        if (projectItems.length === 0) {
            projectItems = [
                { title: `${spec.branchCode} Domain Simulator`, description: 'Design a high-precision mathematical simulation modeling key physical principles of this discipline.' },
                { title: `${spec.branchCode} IoT Telemetry & Monitor`, description: 'Construct a microcontroller-based data-logging pipeline using sensors and cloud analytics.' }
            ];
        }

        container.innerHTML = projectItems.map((p, idx) => `
            <div class="glass-card p-5 rounded-2xl border border-[#2A3147] flex flex-col justify-between gap-4">
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            CAPSTONE LAB 0${idx + 1}
                        </span>
                        <span class="text-[10px] font-mono text-emerald-400">Industry Grade</span>
                    </div>
                    <h3 class="text-sm font-bold text-white">${this.escapeHtml(p.title)}</h3>
                    <p class="text-xs text-[#A1A7BC] leading-relaxed">${this.escapeHtml(p.description)}</p>
                </div>
                <div class="pt-2 border-t border-[#2A3147] flex items-center justify-between">
                    <span class="text-[10px] text-[#A1A7BC] font-mono">Tools: C / Python / CAD / EDA</span>
                    <a href="ide.html" class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                        <span>Launch in IDE</span>
                        <span class="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                </div>
            </div>
        `).join('');
    },

    renderCareers(spec) {
        const container = document.getElementById('careers-container');
        if (!container) return;

        let careerText = '';
        let skillsText = '';
        let roadmapText = '';

        spec.modules.forEach(m => {
            (m.topics || []).forEach(t => {
                if (t.id.includes('role') || t.name.toLowerCase().includes('role')) careerText = t.content;
                if (t.id.includes('skill') || t.name.toLowerCase().includes('skill')) skillsText = t.content;
                if (t.id.includes('roadmap') || t.name.toLowerCase().includes('roadmap')) roadmapText = t.content;
            });
        });

        container.innerHTML = `
            <div class="glass-card p-6 rounded-2xl border border-[#2A3147] space-y-3">
                <div class="flex items-center gap-2 text-indigo-400">
                    <span class="material-symbols-outlined text-lg">alt_route</span>
                    <h3 class="text-sm font-bold text-white">Semester-by-Semester Academic & Career Roadmap</h3>
                </div>
                <div class="text-xs text-[#CBD5E1] whitespace-pre-wrap leading-relaxed pl-4 border-l-2 border-indigo-500/40 font-mono">
${this.formatContent(roadmapText || 'Semester roadmaps customized based on curriculum model.')}
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="glass-card p-6 rounded-2xl border border-[#2A3147] space-y-3">
                    <div class="flex items-center gap-2 text-emerald-400">
                        <span class="material-symbols-outlined text-lg">badge</span>
                        <h3 class="text-sm font-bold text-white">Target High-Growth Industry Roles</h3>
                    </div>
                    <div class="text-xs text-[#CBD5E1] whitespace-pre-wrap leading-relaxed pl-4 border-l-2 border-emerald-500/40">
${this.formatContent(careerText || 'High-growth career tracks available across global R&D firms.')}
                    </div>
                </div>

                <div class="glass-card p-6 rounded-2xl border border-[#2A3147] space-y-3">
                    <div class="flex items-center gap-2 text-amber-400">
                        <span class="material-symbols-outlined text-lg">verified</span>
                        <h3 class="text-sm font-bold text-white">Core Technical Skills Required</h3>
                    </div>
                    <div class="text-xs text-[#CBD5E1] whitespace-pre-wrap leading-relaxed pl-4 border-l-2 border-amber-500/40">
${this.formatContent(skillsText || 'Mastery of specialized modeling, design verification, and simulation software.')}
                    </div>
                </div>
            </div>
        `;
    },

    renderInterviews(spec) {
        const container = document.getElementById('interviews-container');
        if (!container) return;

        let interviewQuestions = [];
        spec.modules.forEach(m => {
            (m.topics || []).forEach(t => {
                if (t.id.includes('interview') || t.name.toLowerCase().includes('interview')) {
                    const raw = t.content;
                    const blocks = raw.split(/Q\d+:/);
                    blocks.forEach(b => {
                        const trimmed = b.trim();
                        if (trimmed) {
                            const [q, ...aParts] = trimmed.split(/\nA:/);
                            if (q && aParts.length > 0) {
                                interviewQuestions.push({
                                    question: q.trim(),
                                    answer: aParts.join('\nA:').trim()
                                });
                            }
                        }
                    });
                }
            });
        });

        if (interviewQuestions.length === 0) {
            interviewQuestions = [
                { question: `What are the primary operational challenges in ${spec.branchName}?`, answer: 'Focus on thermo-mechanical constraints, bandwidth limitations, and materials integrity under stress.' }
            ];
        }

        container.innerHTML = interviewQuestions.map((iq, idx) => `
            <div class="glass-card p-5 rounded-2xl border border-[#2A3147] space-y-3">
                <div class="flex items-start justify-between gap-4 cursor-pointer" onclick="BranchLearning.toggleAnswer('qa-${idx}')">
                    <div class="flex items-start gap-3">
                        <span class="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            Q${idx + 1}
                        </span>
                        <h3 class="text-xs sm:text-sm font-bold text-white leading-snug">
                            ${this.escapeHtml(iq.question)}
                        </h3>
                    </div>
                    <span id="qa-${idx}-icon" class="material-symbols-outlined text-sm text-[#A1A7BC] shrink-0">
                        expand_more
                    </span>
                </div>
                <div id="qa-${idx}" class="hidden pt-3 border-t border-[#2A3147] text-xs text-[#CBD5E1] whitespace-pre-wrap leading-relaxed pl-9">
                    <span class="font-bold text-emerald-400 block mb-1">Model Technical Answer:</span>
                    ${this.escapeHtml(iq.answer)}
                </div>
            </div>
        `).join('');
    },

    toggleModule(id) {
        const el = document.getElementById(id);
        const icon = document.getElementById(`${id}-icon`);
        if (!el) return;
        if (el.classList.contains('hidden')) {
            el.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
        } else {
            el.classList.add('hidden');
            if (icon) icon.style.transform = 'rotate(0deg)';
        }
    },

    expandAllTopics() {
        const accordions = document.querySelectorAll('[id^="module-block-"]');
        accordions.forEach(el => {
            el.classList.remove('hidden');
            const icon = document.getElementById(`${el.id}-icon`);
            if (icon) icon.style.transform = 'rotate(180deg)';
        });
    },

    toggleAnswer(id) {
        const el = document.getElementById(id);
        const icon = document.getElementById(`${id}-icon`);
        if (!el) return;
        if (el.classList.contains('hidden')) {
            el.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
        } else {
            el.classList.add('hidden');
            if (icon) icon.style.transform = 'rotate(0deg)';
        }
    },

    formatContent(str) {
        if (!str) return '';
        return this.escapeHtml(str);
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    getBranchDisplayName(code) {
        if (!code) return 'Engineering';
        if (typeof BranchSystem !== 'undefined') {
            if (BranchSystem.getBranch) {
                const b = BranchSystem.getBranch(code);
                if (b && b.name) return b.name;
            }
            if (BranchSystem.resolveBranch) {
                const b = BranchSystem.resolveBranch(code);
                if (b && b.name) return b.name;
            }
        }
        const map = {
            'AUTO': 'Automobile Engineering',
            'ECE': 'Electronics & Communication Engineering',
            'EIE': 'Electronics & Instrumentation Engineering',
            'MECH': 'Mechanical Engineering',
            'CSE': 'Computer Science & Engineering',
            'CIVIL': 'Civil Engineering',
            'EEE': 'Electrical & Electronics Engineering',
            'AIML': 'Artificial Intelligence & Machine Learning',
            'IT': 'Information Technology',
            'CHEM': 'Chemical Engineering',
            'BIOTECH': 'Biotechnology Engineering',
            'BIOMED': 'Biomedical Engineering',
            'AERO': 'Aerospace Engineering',
            'AERONAUT': 'Aeronautical Engineering',
            'MECHTRON': 'Mechatronics Engineering',
            'ROBOTICS': 'Robotics & Automation Engineering',
            'MFG': 'Manufacturing Engineering',
            'IND': 'Industrial Engineering'
        };
        return map[code] || code;
    },

    renderLoadingState(branchCode) {
        const branchName = this.getBranchDisplayName(branchCode);
        const heroTitle = document.getElementById('hero-title');
        const heroTagline = document.getElementById('hero-tagline');
        const heroBadge = document.getElementById('hero-badge');
        const navTitle = document.getElementById('nav-branch-title');

        if (navTitle) navTitle.textContent = `${branchCode || 'Branch'} Learning`;
        if (heroBadge) heroBadge.textContent = 'UPDATING CURRICULUM';
        if (heroTitle) heroTitle.textContent = `Personalizing for ${branchName}...`;
        if (heroTagline) heroTagline.textContent = 'Syncing your verified engineering curriculum, projects, and interview questions.';

        const container = document.getElementById('modules-container');
        if (container) {
            container.innerHTML = `
                <div class="p-8 rounded-2xl bg-[#121826]/80 border border-[#2A3147] text-center space-y-3">
                    <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400">
                        <span class="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
                    </div>
                    <h3 class="text-sm font-bold text-white">Updating your personalized learning…</h3>
                    <p class="text-xs text-[#A1A7BC]">Retrieving verified ${branchName} specializations, core modules, and capstones.</p>
                </div>
            `;
        }
    },

    renderNoBranchState() {
        const heroTitle = document.getElementById('hero-title');
        const heroTagline = document.getElementById('hero-tagline');
        const heroBadge = document.getElementById('hero-badge');
        const navTitle = document.getElementById('nav-branch-title');
        const statTopicsCount = document.getElementById('stat-topics-count');

        if (navTitle) navTitle.textContent = 'Branch Learning';
        const headerPill = document.getElementById('header-branch-pill');
        if (headerPill) headerPill.textContent = 'Branch Required';
        if (heroBadge) heroBadge.textContent = 'SELECTION REQUIRED';
        if (heroTitle) heroTitle.textContent = 'Branch Personalization';
        if (heroTagline) heroTagline.textContent = 'Select your engineering discipline to unlock specialized curriculum, labs, and interview prep.';
        if (statTopicsCount) statTopicsCount.textContent = '0 Topics';

        document.querySelectorAll('.user-branch-display').forEach(el => {
            el.textContent = 'None';
        });

        const container = document.getElementById('modules-container');
        if (container) {
            container.innerHTML = `
                <div class="glass-card p-8 rounded-2xl border border-[#2A3147] text-center space-y-4 max-w-lg mx-auto my-6">
                    <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 mx-auto">
                        <span class="material-symbols-outlined text-3xl">school</span>
                    </div>
                    <div class="space-y-1">
                        <h3 class="text-base font-bold text-white">Select your branch in Profile to personalize your learning.</h3>
                        <p class="text-xs text-[#A1A7BC] leading-relaxed">TechPath customizes your curriculum modules, hardware labs, and mock interviews directly to your engineering discipline.</p>
                    </div>
                    <a href="profile.html" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all">
                        <span>Open My Profile</span>
                        <span class="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                </div>
            `;
        }
    },

    renderEmptyBranchState(branchCode) {
        const branchName = this.getBranchDisplayName(branchCode);
        const heroTitle = document.getElementById('hero-title');
        const heroTagline = document.getElementById('hero-tagline');
        const heroBadge = document.getElementById('hero-badge');
        const navTitle = document.getElementById('nav-branch-title');
        const statTopicsCount = document.getElementById('stat-topics-count');

        if (navTitle) navTitle.textContent = `${branchCode} Learning`;
        if (heroBadge) heroBadge.textContent = `${branchCode} CURRICULUM`;
        if (heroTitle) heroTitle.textContent = `${branchName} Curriculum`;
        if (heroTagline) heroTagline.textContent = `Specialized learning tracks for ${branchName}.`;
        if (statTopicsCount) statTopicsCount.textContent = '0 Topics';

        const container = document.getElementById('modules-container');
        if (container) {
            container.innerHTML = `
                <div class="glass-card p-8 rounded-2xl border border-[#2A3147] text-center space-y-4 max-w-lg mx-auto my-6">
                    <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto">
                        <span class="material-symbols-outlined text-3xl">menu_book</span>
                    </div>
                    <div class="space-y-1">
                        <h3 class="text-base font-bold text-white">No ${branchName} learning resources are currently available.</h3>
                        <p class="text-xs text-[#A1A7BC] leading-relaxed">Our academic engineering board is curating specialized modules for this discipline. In the meantime, you can explore core subjects in Learn Hub.</p>
                    </div>
                    <div class="flex items-center justify-center gap-3">
                        <a href="learn.html" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all">
                            <span>Explore Learn Hub</span>
                            <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                        <a href="profile.html" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A2031] hover:bg-[#222B42] text-slate-300 border border-[#2A3147] text-xs font-semibold transition-all">
                            <span>Change Branch</span>
                        </a>
                    </div>
                </div>
            `;
        }
    },

    renderErrorState(branchCode, errorMessage) {
        const branchName = this.getBranchDisplayName(branchCode);
        const container = document.getElementById('modules-container');
        if (container) {
            container.innerHTML = `
                <div class="glass-card p-8 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center space-y-4 max-w-lg mx-auto my-6">
                    <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto">
                        <span class="material-symbols-outlined text-3xl">error_outline</span>
                    </div>
                    <div class="space-y-1">
                        <h3 class="text-base font-bold text-white">Unable to load ${branchName} learning resources.</h3>
                        <p class="text-xs text-rose-300/80 leading-relaxed font-mono">${this.escapeHtml(errorMessage || 'Network or server error')}</p>
                    </div>
                    <button onclick="BranchLearning.loadSpecialization()" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all">
                        <span class="material-symbols-outlined text-sm">refresh</span>
                        <span>Retry Connection</span>
                    </button>
                </div>
            `;
        }
    }
};

window.BranchLearning = BranchLearning;
