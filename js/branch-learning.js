/**
 * ==============================================================================
 * BTechPath AI OS — Smart Branch-Specific Learning Controller & Engine
 * File: js/branch-learning.js
 * Description: High-performance, reactive branch-specific learning controller.
 *              - Real Supabase profile single source of truth
 *              - Instant live branch & semester switching without refresh or logout
 *              - Complete cache invalidation & stale request cancellation (AbortController)
 *              - Zero hardcoded ECE fallback; exact error & empty states
 *              - 18+ Department normalization mapping
 *              - Live integration with Three.js Holographic 3D Branch Engine
 * ==============================================================================
 */

const BranchLearning = {
    currentBranch: null,
    currentSemester: 1,
    activeTab: 'curriculum',
    specialization: null,
    _currentRequestId: 0,
    _currentAbortController: null,
    _isLoading: false,

    // Exact normalized slug <-> canonical uppercase mapping per specification
    BRANCH_NORM_MAP: {
        'ece': 'ECE',
        'eie': 'EIE',
        'eee': 'EEE',
        'cse': 'CSE',
        'it': 'IT',
        'ai-ml': 'AIML',
        'aiml': 'AIML',
        'ai': 'AIML',
        'data-science': 'DS',
        'ds': 'DS',
        'mechanical': 'MECH',
        'mech': 'MECH',
        'automobile': 'AUTO',
        'automobile engineering': 'AUTO',
        'auto': 'AUTO',
        'civil': 'CIVIL',
        'chemical': 'CHEM',
        'chem': 'CHEM',
        'biotechnology': 'BIOTECH',
        'biotech': 'BIOTECH',
        'biomedical': 'BIOMED',
        'biomed': 'BIOMED',
        'aerospace': 'AERO',
        'aero': 'AERO',
        'aeronaut': 'AERO',
        'mechatronics': 'MECHTRON',
        'mechtron': 'MECHTRON',
        'robotics': 'ROBOTICS',
        'manufacturing': 'MFG',
        'mfg': 'MFG',
        'ind': 'IND'
    },

    // Reverse mapping: canonical uppercase -> normalized slug
    SLUG_MAP: {
        'ECE': 'ece',
        'EIE': 'eie',
        'EEE': 'eee',
        'CSE': 'cse',
        'IT': 'it',
        'AIML': 'ai-ml',
        'AI': 'ai-ml',
        'DS': 'data-science',
        'MECH': 'mechanical',
        'AUTO': 'automobile',
        'CIVIL': 'civil',
        'CHEM': 'chemical',
        'BIOTECH': 'biotechnology',
        'BIOMED': 'biomedical',
        'AERO': 'aerospace',
        'AERONAUT': 'aerospace',
        'MECHTRON': 'mechatronics',
        'ROBOTICS': 'robotics',
        'MFG': 'manufacturing',
        'IND': 'manufacturing'
    },

    // 3D Holographic Visual metadata descriptions for each branch
    HOLO_VISUAL_SPECS: {
        'ECE': {
            badge: 'Chips & Semiconductors',
            discipline: 'Solid-State Nanoelectronics & VLSI',
            title: 'Chips & Semiconductors: 3D Holographic Silicon Die',
            description: 'Interactive visualization of modern semiconductor packaging, silicon wafer substrate, microscopic PN/CMOS junctions, wire bonds, and nanometer VLSI circuit traces.'
        },
        'AUTO': {
            badge: 'Automotive Engines',
            discipline: 'Powertrain & Mechanical Propulsion',
            title: 'Automotive Engines: 3D Holographic IC Engine',
            description: 'Reciprocating 4-cylinder engine architecture featuring moving pistons, connecting rods, counterweighted crankshaft, overhead camshafts, and dynamic combustion telemetry.'
        },
        'MECH': {
            badge: 'Mechanical Engineering CAD',
            discipline: 'Kinematics & Advanced Machinery',
            title: 'CAD Machinery: 3D Planetary Gear Transmission',
            description: 'Precision mechanical engineering gear train with rotating sun gear, planetary satellites, and carrier ring showcasing gear meshing ratios and torque distribution.'
        },
        'EIE': {
            badge: 'Sensors & Transducers',
            discipline: 'Industrial Automation & Process Control',
            title: 'Industrial Instrumentation: 3D RTD Sensor Probe',
            description: 'Precision industrial transducer probe with threaded hex collar, thermocouple sensing diaphragm, and continuous 4-20mA sine-wave signal telemetry.'
        },
        'EEE': {
            badge: 'Power Systems & Machines',
            discipline: 'Electromagnetics & Grid Infrastructure',
            title: 'Electrical Machines: 3D Electromagnetic Stator & Rotor',
            description: '3-phase AC stator core with concentrated copper windings and high-speed electromagnetic rotor displaying induced magnetic flux lines.'
        },
        'CSE': {
            badge: 'Computer Architecture & Cloud',
            discipline: 'Distributed Systems & Microservices',
            title: 'Cloud Architecture: 3D Server Blade Matrix',
            description: 'Modular high-density server rack node matrix with active processor cores, memory buses, and high-throughput optical interconnect channels.'
        },
        'IT': {
            badge: 'Network & Cloud Infrastructure',
            discipline: 'Enterprise Networking & Virtualization',
            title: 'Cloud Infrastructure: 3D Network Blade Matrix',
            description: 'High-availability server infrastructure featuring packet-routing topology, container cluster blades, and fiber-optic data channels.'
        },
        'AIML': {
            badge: 'Neural Network Architecture',
            discipline: 'Deep Learning & Cognitive Computing',
            title: 'AI & ML: 3D Deep Neural Network Graph',
            description: 'Multi-layer artificial neural network featuring interconnected tensor nodes, synaptic weight connections, and forward-propagating neural impulses.'
        },
        'DS': {
            badge: 'Data Pipelines & Analytics',
            discipline: 'Big Data & Quantitative Modeling',
            title: 'Data Science: 3D High-Dimensional Tensor Graph',
            description: 'Interactive multidimensional data graph displaying feature vector clustering, distributed pipeline nodes, and real-time statistical inference vectors.'
        },
        'CIVIL': {
            badge: 'Structural Engineering',
            discipline: 'Infrastructure & Finite Element Design',
            title: 'Structural Engineering: 3D Cable-Stayed Bridge Pylon',
            description: 'High-tensile bridge pylon with stay cables and space-truss girder deck highlighting compressive loads, tensile stresses, and structural equilibrium.'
        },
        'CHEM': {
            badge: 'Process Plants & Reactors',
            discipline: 'Chemical Thermodynamics & Kinetics',
            title: 'Process Engineering: 3D Fractionation Column & Coil',
            description: 'Fractional distillation column with internal vapor-liquid bubble trays and spiral heat-exchanger condenser coil modeling fluid phase equilibria.'
        },
        'BIOTECH': {
            badge: 'Biotechnology & DNA',
            discipline: 'Molecular Genetics & Bioprocesses',
            title: 'Biotechnology: 3D Bioluminescent DNA Double Helix',
            description: 'Helical polymer of nucleotides winding vertically with glowing base-pair rungs demonstrating molecular genetics and bio-engineering concepts.'
        },
        'BIOMED': {
            badge: 'Biomedical Instrumentation',
            discipline: 'Medical Devices & Physiological Signals',
            title: 'Biomedical Engineering: 3D DNA & Bio-Sensor Core',
            description: 'Dual-strand biometric helix and physiological transducer interface tracking bio-electric signal acquisition and medical telemetry.'
        },
        'AERO': {
            badge: 'Aerospace Propulsion',
            discipline: 'Gas Dynamics & Turbomachinery',
            title: 'Aerospace Systems: 3D Axial Jet Engine Turbine',
            description: 'High-bypass axial flow turbine rotor with aerodynamic bladed compressor discs, aerodynamic center cone, and outer supersonic shroud.'
        },
        'MECHTRON': {
            badge: 'Robotics & Mechatronics',
            discipline: 'Electro-Mechanical Automation & Control',
            title: 'Mechatronics: 3D Articulated Robot Arm Manipulator',
            description: 'Multi-axis industrial robotic manipulator with rotating base turret, articulated shoulder and elbow links, and high-precision servo gripper.'
        },
        'ROBOTICS': {
            badge: 'Industrial Robotics',
            discipline: 'Autonomous Kinematics & Manipulation',
            title: 'Robotics Engineering: 3D Articulated Manipulator',
            description: 'Precision multi-degree-of-freedom robotic manipulator arm illustrating forward kinematics, servo joint limits, and precision trajectory control.'
        },
        'MFG': {
            badge: 'Advanced Manufacturing & CNC',
            discipline: 'Subtractive & Additive Machining Systems',
            title: 'Manufacturing: 3D High-Speed CNC Milling Spindle',
            description: 'High-speed automated CNC milling spindle with precision collet toolholder, carbide cutting tool, and coordinate datum machine grid.'
        }
    },

    BRANCH_LIST: [
        { code: 'ECE', name: 'Chips & VLSI', icon: 'memory' },
        { code: 'AUTO', name: 'Auto Engines', icon: 'directions_car' },
        { code: 'MECH', name: 'Machinery & CAD', icon: 'settings' },
        { code: 'EIE', name: 'Sensors & Automation', icon: 'tune' },
        { code: 'EEE', name: 'Power Systems', icon: 'bolt' },
        { code: 'CSE', name: 'Comp Arch & Cloud', icon: 'terminal' },
        { code: 'IT', name: 'Cloud Networks', icon: 'hub' },
        { code: 'AIML', name: 'Neural Nets & AI', icon: 'psychology' },
        { code: 'DS', name: 'Data Pipelines', icon: 'analytics' },
        { code: 'CIVIL', name: 'Structural Bridges', icon: 'architecture' },
        { code: 'CHEM', name: 'Process Plants', icon: 'science' },
        { code: 'BIOTECH', name: 'DNA & Bio', icon: 'biotech' },
        { code: 'BIOMED', name: 'Medical Devices', icon: 'monitor_heart' },
        { code: 'AERO', name: 'Jet Propulsion', icon: 'flight' },
        { code: 'MECHTRON', name: 'Mechatronics', icon: 'precision_manufacturing' },
        { code: 'ROBOTICS', name: 'Robotics', icon: 'smart_toy' },
        { code: 'MFG', name: 'CNC Machining', icon: 'hardware' }
    ],

    async init() {
        this.bindEvents();
        await this.syncWithCanonicalProfile();
        
        // Initialize 3D Hologram stage if Three.js is ready
        this.init3DHologram();

        // Render interactive horizontal branch selector rail
        this.renderBranchPillsRail();

        // Initialize drag-to-scroll and horizontal rail interaction
        this.initHorizontalRails();

        // Load the active branch specialization
        await this.loadSpecialization();
    },

    renderBranchPillsRail() {
        const rail = document.getElementById('branch-pills-rail');
        if (!rail) return;

        rail.innerHTML = this.BRANCH_LIST.map(b => {
            const isActive = this.currentBranch === b.code;
            return `
                <button type="button" onclick="BranchLearning.onSelectBranchChange('${b.code}')" data-branch-pill="${b.code}" class="branch-pill-item shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${isActive ? 'bg-indigo-600/30 text-white border-indigo-500 shadow-md font-bold' : 'bg-[#121826] text-[#A1A7BC] border-[#2A3147] hover:border-indigo-500/40 hover:text-white'}">
                    <span class="material-symbols-outlined text-sm ${isActive ? 'text-indigo-400' : 'text-[#A1A7BC]'}">${b.icon}</span>
                    <span>${b.code}</span>
                </button>
            `;
        }).join('');
    },

    initHorizontalRails() {
        const rails = document.querySelectorAll('.custom-horizontal-rail, [data-horizontal-rail]');
        rails.forEach(rail => {
            if (rail._hasHorizontalInit) return;
            rail._hasHorizontalInit = true;

            // Non-blocking vertical scroll allowance on mobile
            rail.style.touchAction = 'pan-y';

            // Desktop Mouse Drag-to-Scroll
            let isDown = false;
            let startX = 0;
            let scrollLeft = 0;
            let hasMoved = false;

            rail.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                isDown = true;
                hasMoved = false;
                startX = e.pageX - rail.offsetLeft;
                scrollLeft = rail.scrollLeft;
                rail.style.cursor = 'grabbing';
                rail.style.userSelect = 'none';
            });

            const onMouseMove = (e) => {
                if (!isDown) return;
                const x = e.pageX - rail.offsetLeft;
                const walk = (x - startX) * 1.6;
                if (Math.abs(walk) > 4) {
                    hasMoved = true;
                }
                rail.scrollLeft = scrollLeft - walk;
            };

            const onMouseUp = () => {
                if (isDown) {
                    isDown = false;
                    rail.style.cursor = '';
                    rail.style.removeProperty('user-select');
                }
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);

            // Prevent accidental button trigger when dragging
            rail.addEventListener('click', (e) => {
                if (hasMoved) {
                    e.preventDefault();
                    e.stopPropagation();
                    hasMoved = false;
                }
            }, true);

            // Shift + Wheel or Trackpad horizontal scroll support
            rail.addEventListener('wheel', (e) => {
                if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    rail.scrollLeft += e.deltaX || e.deltaY;
                    e.preventDefault();
                }
                // When scrolling vertically (normal mouse wheel without Shift):
                // DO NOT preventDefault! Allow normal document vertical page scrolling!
            }, { passive: false });
        });
    },

    init3DHologram() {
        try {
            if (window.Branch3DHologram && typeof Branch3DHologram.init === 'function') {
                Branch3DHologram.init('branch-hologram-stage');
                if (this.currentBranch) {
                    Branch3DHologram.setBranch(this.currentBranch);
                }
            }
        } catch (e) {
            console.warn('[BranchLearning] 3D Hologram initialization notice:', e);
        }
    },

    // --------------------------------------------------------------------------
    // CANONICAL BRANCH NORMALIZER
    // --------------------------------------------------------------------------
    normalizeBranch(val) {
        if (!val) return '';
        const clean = String(val).toLowerCase().trim();
        if (this.BRANCH_NORM_MAP[clean]) {
            return this.BRANCH_NORM_MAP[clean];
        }
        if (typeof BranchSystem !== 'undefined' && BranchSystem.resolveBranch) {
            const resolved = BranchSystem.resolveBranch(val);
            if (resolved && resolved.code) return resolved.code.toUpperCase().trim();
        }
        return String(val).toUpperCase().trim();
    },

    toNormalizedSlug(branchCode) {
        if (!branchCode) return '';
        const upper = branchCode.toUpperCase().trim();
        return this.SLUG_MAP[upper] || upper.toLowerCase();
    },

    bindEvents() {
        // 1. Reactive Profile Updated Event (Emitted by AuthManager on any branch save)
        window.addEventListener('btech:profile-updated', async (event) => {
            console.log('[BranchLearning] Reactive btech:profile-updated event caught');
            const profile = event.detail;
            if (profile) {
                const rawBranch = profile.department_id || profile.branch || profile.department || '';
                const newBranch = this.normalizeBranch(rawBranch);
                const newSem = parseInt(profile.semester || profile.semesterNumber || 1, 10) || 1;
                
                // If branch or semester changed, re-sync immediately
                if (newBranch !== this.currentBranch || newSem !== this.currentSemester) {
                    this.currentBranch = newBranch;
                    this.currentSemester = newSem;
                    this.syncQuickSelects();
                    await this.loadSpecialization();
                }
            }
        });

        // 2. Cross-Tab Multi-Window Broadcast Synchronization
        try {
            const channel = new BroadcastChannel('techpath-profile-sync');
            channel.onmessage = async (event) => {
                if (event.data && (event.data.type === 'PROFILE_UPDATED' || event.data.profile)) {
                    console.log('[BranchLearning] BroadcastChannel sync message received');
                    await this.syncWithCanonicalProfile();
                    this.syncQuickSelects();
                    await this.loadSpecialization();
                }
            };
        } catch (e) {}

        // 3. Guaranteed Scroll Restoration (Route changes, modal dismissals, history back/forward)
        const restorePageScroll = () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            const overlay = document.getElementById('mobile-sidebar-overlay');
            if (overlay && overlay.classList.contains('hidden')) {
                document.body.style.overflow = '';
            }
        };

        window.addEventListener('pageshow', restorePageScroll);
        window.addEventListener('popstate', restorePageScroll);
        window.addEventListener('pagehide', restorePageScroll);
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                restorePageScroll();
            }
        }, { passive: true });
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

        this.syncQuickSelects();
    },

    syncQuickSelects() {
        const branchSelect = document.getElementById('branch-quick-select');
        const semSelect = document.getElementById('semester-quick-select');
        if (branchSelect && this.currentBranch) {
            branchSelect.value = this.currentBranch;
        }
        if (semSelect && this.currentSemester) {
            semSelect.value = String(this.currentSemester);
        }

        // Sync and highlight active pill in the horizontal rail
        const rail = document.getElementById('branch-pills-rail');
        if (rail) {
            rail.querySelectorAll('.branch-pill-item').forEach(pill => {
                const code = pill.getAttribute('data-branch-pill');
                const isActive = code === this.currentBranch;
                if (isActive) {
                    pill.className = 'branch-pill-item shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer bg-indigo-600/30 text-white border-indigo-500 shadow-md font-bold';
                    try {
                        pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    } catch (e) {}
                } else {
                    pill.className = 'branch-pill-item shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer bg-[#121826] text-[#A1A7BC] border-[#2A3147] hover:border-indigo-500/40 hover:text-white';
                }
            });
        }
    },

    // --------------------------------------------------------------------------
    // FLOW AFTER BRANCH CHANGE (Mandatory 10-Step Pipeline)
    // --------------------------------------------------------------------------
    async changeBranch(newBranchRaw, newSemesterRaw) {
        const branch = this.normalizeBranch(newBranchRaw);
        const semester = parseInt(newSemesterRaw || this.currentSemester || 1, 10) || 1;

        console.log(`[BranchLearning] Initiating branch switch: ${this.currentBranch} -> ${branch} (Sem ${semester})`);

        // Step 1: Update internal pointer & UI selector
        this.currentBranch = branch;
        this.currentSemester = semester;
        this.syncQuickSelects();

        // Step 2 & 3: Save branch to Supabase & confirm database update
        if (typeof AuthManager !== 'undefined' && typeof AuthManager.updateProfile === 'function') {
            try {
                const res = await AuthManager.updateProfile({
                    department: branch,
                    department_id: branch,
                    branch: branch,
                    semester: semester
                });
                console.log('[BranchLearning] Supabase profile confirmed updated:', res);
            } catch (saveErr) {
                console.warn('[BranchLearning] Supabase direct save warning (will persist locally):', saveErr.message);
                // Update local storage fallback if network interrupted
                if (typeof localStorage !== 'undefined') {
                    const sessionKey = AuthManager.SESSION_KEY || 'TechPath_user_session';
                    try {
                        const local = JSON.parse(localStorage.getItem(sessionKey) || '{}');
                        local.department_id = branch;
                        local.branch = branch;
                        local.semester = semester;
                        localStorage.setItem(sessionKey, JSON.stringify(local));
                    } catch (e) {}
                }
            }
        }

        // Step 4 & 5: Refetch profile & update canonical frontend user state
        await this.syncWithCanonicalProfile();

        // Step 6: Clear / Invalidate old branch cache
        this.clearBranchCache();

        // Step 7: Cancel or ignore in-flight requests
        this._currentRequestId++;
        if (this._currentAbortController) {
            this._currentAbortController.abort();
        }
        this._currentAbortController = new AbortController();

        // Step 8 & 9: Fetch Branch Learning using the NEW branch & render only new content
        await this.loadSpecialization();
    },

    onSelectBranchChange(val) {
        this.changeBranch(val, this.currentSemester);
    },

    onSelectSemesterChange(val) {
        const sem = parseInt(val, 10) || 1;
        this.changeBranch(this.currentBranch, sem);
    },

    clearBranchCache() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('TechPath_branch_learning_cache');
            }
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem(`btech_branch_${this.currentBranch}`);
                sessionStorage.removeItem('btech_branch_active');
            }
        } catch (e) {}
    },

    // --------------------------------------------------------------------------
    // LOAD BRANCH SPECIALIZATION (Primary Fetcher)
    // --------------------------------------------------------------------------
    async loadSpecialization() {
        const branchCode = this.currentBranch;
        const semester = this.currentSemester || 1;
        const requestId = ++this._currentRequestId;

        // Cancel previous pending fetch
        if (this._currentAbortController) {
            this._currentAbortController.abort();
        }
        this._currentAbortController = new AbortController();

        // 1. Missing branch state
        if (!branchCode) {
            this.specialization = null;
            this.renderNoBranchState();
            return;
        }

        // 2. Loading state
        this.renderLoadingState(branchCode);

        // Update 3D Holographic Visual immediately on new branch selection
        if (window.Branch3DHologram && typeof Branch3DHologram.setBranch === 'function') {
            Branch3DHologram.setBranch(branchCode);
        }
        this.renderHoloCardMeta(branchCode);

        try {
            let specData = null;

            // Strategy A: Direct query to Supabase `branch_learning` table if configured
            const client = (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.getClient && SupabaseBridge.getClient()) ||
                           (typeof supabaseClient !== 'undefined' ? supabaseClient : null);

            if (client) {
                try {
                    const { data: dbRows, error: dbErr } = await client
                        .from('branch_learning')
                        .select('*')
                        .eq('department', branchCode)
                        .eq('is_published', true)
                        .order('display_order', { ascending: true });

                    if (!dbErr && dbRows && dbRows.length > 0) {
                        specData = this.buildSpecFromDbRows(branchCode, semester, dbRows);
                    }
                } catch (e) {}
            }

            // Strategy B: Call serverless endpoint /api/branch-learning
            if (!specData) {
                const branchParam = encodeURIComponent(branchCode);
                const semParam = encodeURIComponent(semester);
                const res = await fetch(`/api/branch-learning?branch=${branchParam}&semester=${semParam}`, {
                    signal: this._currentAbortController.signal,
                    headers: { 'Cache-Control': 'no-cache' }
                });

                // Race-condition guard: check if newer request was initiated
                if (requestId !== this._currentRequestId) return;

                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.specialization && Object.keys(json.specialization).length > 0) {
                        specData = json.specialization;
                    }
                }
            }

            // Strategy C: Client-side authoritative catalog fallback (data/branch_learning_catalog.json)
            if (!specData) {
                try {
                    const catalogRes = await fetch('/data/branch_learning_catalog.json', {
                        signal: this._currentAbortController.signal
                    });
                    if (catalogRes.ok) {
                        const catalog = await catalogRes.json();
                        if (catalog && catalog[branchCode]) {
                            specData = JSON.parse(JSON.stringify(catalog[branchCode]));
                            specData.activeSemester = semester;
                        }
                    }
                } catch (catErr) {
                    if (catErr.name === 'AbortError') return;
                }
            }

            // Race-condition guard
            if (requestId !== this._currentRequestId) return;

            // Step 9: Render only NEW branch content
            if (specData) {
                this.specialization = specData;
                this.render();
            } else {
                this.specialization = null;
                this.renderEmptyBranchState(branchCode);
            }

        } catch (err) {
            if (err.name === 'AbortError') return;
            if (requestId !== this._currentRequestId) return;
            console.error(`[BranchLearning] Unable to load ${branchCode} learning resources:`, err);
            this.renderErrorState(branchCode, err.message);
        }
    },

    buildSpecFromDbRows(branchCode, semester, rows) {
        const displayName = this.getBranchDisplayName(branchCode);
        const modulesMap = {};

        rows.forEach(r => {
            const subject = r.subject || 'Core Engineering Specialization';
            if (!modulesMap[subject]) {
                modulesMap[subject] = {
                    id: 'mod-' + Object.keys(modulesMap).length,
                    title: subject,
                    badge: r.difficulty || 'Core Technical',
                    semesterRecommendation: [r.semester || semester],
                    topics: []
                };
            }
            modulesMap[subject].topics.push({
                id: r.id || r.topic,
                name: r.title || r.topic,
                content: r.description || (r.skills ? `Skills: ${r.skills.join(', ')}` : '')
            });
        });

        return {
            branchCode: branchCode,
            branchName: displayName,
            specializationTitle: `${displayName} Specialization`,
            specializationTagline: `Verified engineering syllabus and curriculum for ${displayName}.`,
            activeSemester: semester,
            badge: `${branchCode} SPECIALIZATION`,
            topicsCount: rows.length,
            modules: Object.values(modulesMap)
        };
    },

    // --------------------------------------------------------------------------
    // TAB MANAGEMENT
    // --------------------------------------------------------------------------
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

        // Re-initialize rails when switching tabs
        this.initHorizontalRails();
    },

    // --------------------------------------------------------------------------
    // RENDERING
    // --------------------------------------------------------------------------
    render() {
        const spec = this.specialization;
        if (!spec) return;

        // 1. Update Header & Top Navigation
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

        // 2. Render Hologram Meta Badge
        this.renderHoloCardMeta(spec.branchCode);

        // 3. Render Tab 1: Curriculum Modules
        this.renderCurriculum(spec);

        // 4. Render Tab 2: Projects
        this.renderProjects(spec);

        // 5. Render Tab 3: Careers & Roadmap
        this.renderCareers(spec);

        // 6. Render Tab 4: Technical Interviews
        this.renderInterviews(spec);

        // 7. Ensure horizontal rails and non-blocking scroll are initialized
        this.initHorizontalRails();
    },

    renderHoloCardMeta(branchCode) {
        const meta = this.HOLO_VISUAL_SPECS[branchCode] || {
            badge: `${branchCode} Specialization`,
            discipline: `${this.getBranchDisplayName(branchCode)} Engineering`,
            title: `${branchCode}: 3D Holographic Model`,
            description: `Interactive 3D holographic engineering visualization customized for ${this.getBranchDisplayName(branchCode)}.`
        };

        const badgeEl = document.getElementById('holo-branch-code-badge');
        const discEl = document.getElementById('holo-discipline-title');
        const titleEl = document.getElementById('holo-model-title');
        const descEl = document.getElementById('holo-model-description');

        if (badgeEl) badgeEl.textContent = `${branchCode} SPEC`;
        if (discEl) discEl.textContent = meta.discipline;
        if (titleEl) titleEl.textContent = meta.title;
        if (descEl) descEl.textContent = meta.description;
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

        let projectItems = [];
        (spec.modules || []).forEach(m => {
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
                { title: `${spec.branchCode} Real-time Telemetry Monitor`, description: 'Construct a microcontroller-based data-logging pipeline using sensors and cloud analytics.' }
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

        (spec.modules || []).forEach(m => {
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
        (spec.modules || []).forEach(m => {
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
                { question: `What are the primary operational challenges in ${spec.branchName}?`, answer: 'Focus on thermo-mechanical constraints, signal-to-noise ratio, and system-level fault tolerance.' }
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
            'AI': 'Artificial Intelligence',
            'DS': 'Data Science',
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

    // --------------------------------------------------------------------------
    // EXACT MANDATED ERROR & EMPTY STATES
    // --------------------------------------------------------------------------
    renderLoadingState(branchCode) {
        const branchName = this.getBranchDisplayName(branchCode);
        const heroTitle = document.getElementById('hero-title');
        const heroTagline = document.getElementById('hero-tagline');
        const heroBadge = document.getElementById('hero-badge');
        const navTitle = document.getElementById('nav-branch-title');

        if (navTitle) navTitle.textContent = `${branchCode || 'Branch'} Learning`;
        if (heroBadge) heroBadge.textContent = 'UPDATING CURRICULUM';
        if (heroTitle) heroTitle.textContent = `Loading your Branch Learning…`;
        if (heroTagline) heroTagline.textContent = `Syncing your verified engineering curriculum and 3D telemetry for ${branchName}.`;

        const container = document.getElementById('modules-container');
        if (container) {
            container.innerHTML = `
                <div class="p-8 rounded-2xl bg-[#121826]/80 border border-[#2A3147] text-center space-y-3">
                    <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400">
                        <span class="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
                    </div>
                    <h3 class="text-sm font-bold text-white">Loading your Branch Learning…</h3>
                    <p class="text-xs text-[#A1A7BC]">Retrieving verified ${branchName} curriculum from Supabase.</p>
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
        if (heroTitle) heroTitle.textContent = 'Select your branch to personalize Branch Learning.';
        if (heroTagline) heroTagline.textContent = 'Choose your engineering discipline below to unlock specialized curriculum, labs, and holographic 3D visuals.';
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
                        <h3 class="text-base font-bold text-white">Select your branch to personalize Branch Learning.</h3>
                        <p class="text-xs text-[#A1A7BC] leading-relaxed">Choose an engineering discipline from the switcher above or update your profile to unlock specialized modules.</p>
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
        if (heroTagline) heroTagline.textContent = `No learning content is available for this branch and semester yet.`;
        if (statTopicsCount) statTopicsCount.textContent = '0 Topics';

        const container = document.getElementById('modules-container');
        if (container) {
            container.innerHTML = `
                <div class="glass-card p-8 rounded-2xl border border-[#2A3147] text-center space-y-4 max-w-lg mx-auto my-6">
                    <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto">
                        <span class="material-symbols-outlined text-3xl">menu_book</span>
                    </div>
                    <div class="space-y-1">
                        <h3 class="text-base font-bold text-white">No learning content is available for this branch and semester yet.</h3>
                        <p class="text-xs text-[#A1A7BC] leading-relaxed">Our academic engineering board is curating specialized modules for this discipline. In the meantime, you can explore core subjects in Learn Hub.</p>
                    </div>
                    <div class="flex items-center justify-center gap-3">
                        <a href="learn.html" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all">
                            <span>Explore Learn Hub</span>
                            <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                        <button onclick="BranchLearning.onSelectBranchChange('ECE')" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A2031] hover:bg-[#222B42] text-slate-300 border border-[#2A3147] text-xs font-semibold transition-all">
                            <span>Switch Branch</span>
                        </button>
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
                        <h3 class="text-base font-bold text-white">Unable to load Branch Learning. Please try again.</h3>
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
