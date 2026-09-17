/* ==========================================================================
   BTechPath AI OS - Global Application Controller & Command Center
   - Command Center (Ctrl+K / Cmd+K)
   - Staged Loading Screen Experience
   - Universal Navigation & Role Enforcer
   - Dialog Confirmation Engine
   ========================================================================== */

const App = {
  init() {
    this.init3DBackground();
    this.initParadrop();
    this.checkAuthRouteGuard();
    this.updateUserContext();
    this.syncNavigation();
    this.enforceRoleVisibility();
    this.highlightActiveNavLink();
    this.setupDropdowns();
    this.setupMobileMenu();
    this.initCommandCenter();
    this.initLoadingExperience();
    this.initPWA();
    this.initTouchFeedback();

    window.addEventListener('btech:profile-updated', () => {
      this.updateUserContext();
    });
  },

  // Auto-mount Paradrop Animated Download Engine
  initParadrop() {
    if (!document.getElementById('paradrop-css')) {
      const link = document.createElement('link');
      link.id = 'paradrop-css';
      link.rel = 'stylesheet';
      link.href = 'css/paradrop.css';
      document.head.appendChild(link);
    }
    if (!window.Paradrop && !document.getElementById('paradrop-js')) {
      const script = document.createElement('script');
      script.id = 'paradrop-js';
      script.src = 'js/paradrop.js';
      document.body.appendChild(script);
    }
  },

  // Auto-mount Real 3D Engineering Background Engine
  // Guard: do NOT inject scripts if they are already loaded via static <script> tags
  // (prevents the "Multiple Three.js instances" warning on pages that include them directly)
  init3DBackground() {
    const threeAlreadyLoaded = window.THREE ||
      window.__THREE_LOADING__ ||
      document.querySelector('script[id="three-js-lib"]') ||
      document.querySelector('script[src*="three.min.js"]');

    const bg3dAlreadyLoaded = window.BTech3D ||
      document.querySelector('script[id="btech-bg3d-script"]') ||
      document.querySelector('script[src*="btech-bg3d.js"]');

    if (!threeAlreadyLoaded) {
      window.__THREE_LOADING__ = true;
      const threeScript = document.createElement('script');
      threeScript.id = 'three-js-lib';
      threeScript.src = 'js/three.min.js';
      threeScript.onload = () => {
        window.__THREE_LOADING__ = false;
        window.dispatchEvent(new CustomEvent('three-loaded'));
        if (!bg3dAlreadyLoaded && !document.querySelector('script[id="btech-bg3d-script"]')) {
          const bgScript = document.createElement('script');
          bgScript.id = 'btech-bg3d-script';
          bgScript.src = 'js/btech-bg3d.js';
          document.body.appendChild(bgScript);
        }
      };
      threeScript.onerror = () => {
        window.__THREE_LOADING__ = false;
      };
      document.body.appendChild(threeScript);
    } else if (!bg3dAlreadyLoaded && !document.querySelector('script[id="btech-bg3d-script"]')) {
      const script = document.createElement('script');
      script.id = 'btech-bg3d-script';
      script.src = 'js/btech-bg3d.js';
      document.body.appendChild(script);
    }
  },

  set3DAccent(presetOrHex) {
    if (window.BTech3D && typeof window.BTech3D.setAccent === 'function') {
      window.BTech3D.setAccent(presetOrHex);
    }
  },

  // Route guard for admin panel and student workspace
  async checkAuthRouteGuard() {
    const rawPath = window.location.pathname.split('/').pop() || '';
    const currentPath = rawPath.toLowerCase().replace(/\.html$/, '');
    
    // Complete list of student protected routes managed by the generic guard.
    // NOTE: 'dashboard' is intentionally excluded — dashboard.html has its own
    // DashboardPage.init() which calls AuthManager.requireAuth() with a full
    // onReady handler (renders greeting, metrics, tasks). Running requireAuth()
    // twice on the same page creates duplicate GoTrueClient subscriptions.
    const protectedPages = [
      'learn',
      'ai-notes',
      'doubt-solver',
      'copilot',
      'mock-interview',
      'projects',
      'skills',
      'career',
      'internships',
      'resume-builder',
      'exams',
      'planner',
      'analytics',
      'profile',
      'settings',
      'study',
      'quiz',
      'ide'
    ];

    if (currentPath === 'admin') {
      // Admin route: requireAdmin() is now async and calls verifyAdminStatus()
      if (typeof AuthManager !== 'undefined') {
        await AuthManager.requireAdmin();
      }
      return;
    }

    if (protectedPages.includes(currentPath)) {
      if (typeof AuthManager !== 'undefined') {
        await AuthManager.requireAuth({
          onReady: (user, profile) => {
            if (typeof App !== 'undefined' && App.updateUserContext) {
              App.updateUserContext();
            }
          }
        });
      } else {
        const localSession = localStorage.getItem('TechPath_user_session') || localStorage.getItem('btechpath_user_session');
        if (!localSession) {
          window.location.replace(`login.html?redirect=${encodeURIComponent(rawPath || 'dashboard.html')}`);
        }
      }
    }
  },

  // Update UI with real active user from DB/Session
  updateUserContext() {
    const user = (typeof AuthManager !== 'undefined') ? AuthManager.getUser() : null;
    if (!user || !user.email) {
      document.querySelectorAll('.user-name-display').forEach(el => el.textContent = '');
      document.querySelectorAll('.user-email-display').forEach(el => el.textContent = '');
      return;
    }

    // Replace user placeholders in DOM with authenticated user identity
    document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user.name || user.full_name || user.email.split('@')[0]);
    const displayTier = (user.tier && user.tier !== 'AI Pro Cohort') ? user.tier : (user.role === 'admin' ? 'Platform Director & Admin' : 'Engineering Scholar');
    document.querySelectorAll('.user-role-display').forEach(el => el.textContent = displayTier);
    document.querySelectorAll('.user-email-display').forEach(el => el.textContent = user.email);
    document.querySelectorAll('.user-branch-display').forEach(el => el.textContent = user.branch || 'Engineering');
    document.querySelectorAll('.user-target-display').forEach(el => el.textContent = user.targetCareer || user.target_role || 'Software Engineer');

    // Sync streak with real DB if available
    if (typeof DB !== 'undefined') {
      const streakMetrics = DB.getStreakMetrics(user.email);
      document.querySelectorAll('.user-streak-display').forEach(el => {
        el.textContent = `${streakMetrics.currentStreak} Days`;
      });
      const studyMetrics = DB.getStudyAnalytics(user.email);
      document.querySelectorAll('.total-study-hours-display').forEach(el => {
        el.textContent = `${studyMetrics.totalHours} hrs`;
      });
    } else {
      document.querySelectorAll('.user-streak-display').forEach(el => el.textContent = `${user.streak || 1} Days`);
    }

    const avatarSrc = (typeof AuthManager !== 'undefined' && AuthManager.getAvatarUrl)
      ? AuthManager.getAvatarUrl(user)
      : (user.avatar || user.avatar_url || '');

    document.querySelectorAll('.user-avatar-display').forEach(img => {
      if (img.tagName === 'IMG') {
        img.src = avatarSrc;
        img.onerror = function() {
          if (typeof AuthManager !== 'undefined' && AuthManager.getInitialsAvatar) {
            this.src = AuthManager.getInitialsAvatar(user.name || user.full_name || user.email || 'Student');
          }
        };
      }
    });

    const xpDisplay = document.getElementById('xp-counter-display');
    if (xpDisplay) {
      xpDisplay.textContent = `${(user.xp || 100).toLocaleString()} XP`;
    }

    this.syncNavigation();
  },

  // Role visibility enforcement (dynamic DOM insertion, server-verified)
  //
  // Admin sidebar items are NOT pre-rendered for students. They are only mounted
  // into the DOM after the server confirms admin authorization via a real Supabase JWT
  // (/api/admin/check-role). For students, the element is completely removed from DOM.
  async enforceRoleVisibility() {
    // Only attempt verification if AuthManager is ready
    if (typeof AuthManager === 'undefined' || !AuthManager.verifyAdminStatus) return;

    try {
      const adminStatus = await AuthManager.verifyAdminStatus();
      const isAdmin = adminStatus && adminStatus.authorized === true;

      // 1. Dynamic Admin Sidebar Slot (dashboard.html and any page with #admin-sidebar-slot)
      const sidebarSlot = document.getElementById('admin-sidebar-slot');
      if (sidebarSlot) {
        if (isAdmin) {
          sidebarSlot.innerHTML = `
            <div class="pt-4 border-t border-subtle/60 admin-nav-header">
                <div class="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-gray">Administrative</div>
                <a href="admin.html" data-admin-only="true" class="flex items-center gap-3 px-3 py-2 rounded-xl text-rose-gold hover:bg-elevated transition-colors">
                    <span class="material-symbols-outlined text-xl">admin_panel_settings</span>
                    <span>Platform Admin</span>
                </a>
            </div>
          `;
        } else {
          sidebarSlot.innerHTML = '';
        }
      }

      // 2. For any pre-existing legacy static admin elements on other pages:
      const adminElements = document.querySelectorAll('[data-admin-only], a[href="admin.html"]:not(#admin-sidebar-slot a)');
      const adminHeader = document.querySelectorAll('.admin-nav-header:not(#admin-sidebar-slot .admin-nav-header)');
      if (!isAdmin) {
        // REMOVE completely from DOM for non-admin students (not just display:none)
        adminElements.forEach(el => el.remove());
        adminHeader.forEach(el => el.remove());
      } else {
        adminElements.forEach(el => {
          el.style.display = '';
          el.removeAttribute('aria-hidden');
        });
        adminHeader.forEach(el => { el.style.display = ''; });
      }
    } catch (e) {
      // Verification failed — remove admin elements (fail-secure)
      console.warn('[App] Admin visibility verification failed:', e);
      const sidebarSlot = document.getElementById('admin-sidebar-slot');
      if (sidebarSlot) sidebarSlot.innerHTML = '';
      document.querySelectorAll('[data-admin-only], .admin-nav-header').forEach(el => el.remove());
    }
  },

  // Highlight active link in sidebar and bottom bar
  highlightActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('aside a, nav a, .bottom-nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
        link.classList.add('bg-elevated-surface', 'text-warm-ivory', 'border-subtle');
        link.classList.remove('text-muted-gray');
      }
    });
  },

  setupDropdowns() {
    const profileBtn = document.getElementById('profile-menu-btn');
    const profileMenu = document.getElementById('profile-dropdown');
    
    if (profileBtn && profileMenu) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle('hidden');
      });
      document.addEventListener('click', () => {
        profileMenu.classList.add('hidden');
      });
    }
  },

  // Synchronize authenticated navigation: Home -> Reviews -> Contact Us -> Profile -> Logout
  syncNavigation() {
    const user = (typeof AuthManager !== 'undefined') ? AuthManager.getUser() : null;
    const isAuthenticated = Boolean(user && user.email);

    // 1. Top Navbar Header Navigation (Desktop)
    const topNav = document.querySelector('header nav');
    if (topNav) {
      const allLinks = Array.from(topNav.querySelectorAll('a'));
      const contactLink = allLinks.find(a => a.getAttribute('href')?.includes('contact'));
      let profileLink = allLinks.find(a => a.getAttribute('href')?.includes('profile'));

      if (isAuthenticated) {
        if (!profileLink && contactLink) {
          profileLink = document.createElement('a');
          profileLink.href = 'profile.html';
          profileLink.className = 'hover:text-[#F5F7FA] text-[#A1A7BC] transition-colors flex items-center gap-1';
          profileLink.innerHTML = '<span>Profile</span>';
          contactLink.insertAdjacentElement('afterend', profileLink);
        } else if (profileLink && contactLink && contactLink.nextElementSibling !== profileLink) {
          contactLink.insertAdjacentElement('afterend', profileLink);
        }
      } else {
        if (profileLink) profileLink.remove();
      }
    }

    // 2. Auth Controls Section (#nav-auth-section)
    const authSection = document.getElementById('nav-auth-section');
    if (authSection) {
      if (isAuthenticated) {
        authSection.innerHTML = `
          <a href="profile.html" class="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#A1A7BC] hover:text-[#F5F7FA] hover:bg-[#1A2031] transition-colors flex items-center gap-1.5 border border-[#2A3147]">
            <span class="material-symbols-outlined text-sm text-[#5865F2]">person</span>
            <span>Profile</span>
          </a>
          <button onclick="AuthManager.logout()" class="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer" title="Log Out">
            <span class="material-symbols-outlined text-sm">logout</span>
            <span>Logout</span>
          </button>
        `;
      } else {
        authSection.innerHTML = `
          <a href="login.html" id="nav-signin-btn" class="px-4 py-2 rounded-xl text-xs font-semibold text-[#A1A7BC] hover:text-[#F5F7FA] hover:bg-[#1A2031] transition-colors">
            Sign In
          </a>
          <a href="start-journey.html" id="nav-signup-btn" class="grad-indigo-btn px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5">
            <span>Get Started</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        `;
      }
    }

    // 3. Mobile Dropdown Menu (#mobile-menu)
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      const contactMobile = Array.from(mobileMenu.querySelectorAll('a')).find(a => a.getAttribute('href')?.includes('contact'));
      let profileMobile = mobileMenu.querySelector('a[href*="profile"]');
      let logoutMobile = mobileMenu.querySelector('.mobile-logout-btn');

      if (isAuthenticated) {
        if (!profileMobile && contactMobile) {
          profileMobile = document.createElement('a');
          profileMobile.href = 'profile.html';
          profileMobile.className = 'block text-sm text-[#A1A7BC] hover:text-white flex items-center gap-2';
          profileMobile.innerHTML = '<span class="material-symbols-outlined text-sm text-[#5865F2]">person</span><span>Profile</span>';
          contactMobile.insertAdjacentElement('afterend', profileMobile);
        } else if (profileMobile && contactMobile && contactMobile.nextElementSibling !== profileMobile) {
          contactMobile.insertAdjacentElement('afterend', profileMobile);
        }

        if (!logoutMobile && profileMobile) {
          logoutMobile = document.createElement('button');
          logoutMobile.className = 'mobile-logout-btn block w-full text-left text-sm text-rose-400 hover:text-rose-300 pt-2 border-t border-[#2A3147] flex items-center gap-2 cursor-pointer';
          logoutMobile.onclick = () => AuthManager.logout();
          logoutMobile.innerHTML = '<span class="material-symbols-outlined text-sm">logout</span><span>Logout</span>';
          profileMobile.insertAdjacentElement('afterend', logoutMobile);
        }
      } else {
        if (profileMobile) profileMobile.remove();
        if (logoutMobile) logoutMobile.remove();
      }
    }

    // 4. Sidebar Navigation in Workspace Pages (Dashboard, Learn, IDE, etc.)
    const sidebar = document.getElementById('main-sidebar') || document.querySelector('aside');
    if (sidebar) {
      const contactLink = sidebar.querySelector('a[href*="contact"]');
      let profileLink = sidebar.querySelector('a[href*="profile"]');
      if (contactLink && profileLink && contactLink.nextElementSibling !== profileLink) {
        contactLink.insertAdjacentElement('afterend', profileLink);
      }
    }
  },

  setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('mobile-sidebar-overlay');
    const mobileMenu = document.getElementById('mobile-menu');

    const closeSidebar = () => {
      if (sidebar) sidebar.classList.add('-translate-x-full');
      if (overlay) overlay.classList.add('hidden');
      document.body.style.overflow = '';
    };

    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => {
        const isClosed = sidebar.classList.contains('-translate-x-full');
        if (isClosed) {
          sidebar.classList.remove('-translate-x-full');
          if (overlay) overlay.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        } else {
          closeSidebar();
        }
      });
    } else if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }

    if (overlay && sidebar) {
      overlay.addEventListener('click', closeSidebar);
    }

    // Auto-close on nav link click in mobile view
    if (sidebar) {
      sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth < 768) {
            closeSidebar();
          }
        });
      });
    }

    // Clear stale locks on resize or history navigation
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && document.body.style.overflow === 'hidden' && (!sidebar || sidebar.classList.contains('-translate-x-full'))) {
        document.body.style.overflow = '';
      }
    }, { passive: true });

    window.addEventListener('pageshow', () => {
      document.body.style.overflow = '';
    });
    window.addEventListener('popstate', () => {
      document.body.style.overflow = '';
    });
  },

  // ========================================================================
  // GLOBAL COMMAND CENTER (Section 13) - Ctrl+K / Cmd+K
  // ========================================================================
  initCommandCenter() {
    // Inject Command Center DOM if not present
    if (!document.getElementById('command-center-modal')) {
      const modal = document.createElement('div');
      modal.id = 'command-center-modal';
      modal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-start justify-center pt-20 px-4';
      modal.innerHTML = `
        <div class="bg-midnight-surface border border-subtle rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-warm-ivory animate-scale-up">
          <!-- Input Bar -->
          <div class="p-4 border-b border-subtle flex items-center gap-3">
            <span class="material-symbols-outlined text-muted-gray">search</span>
            <input id="command-search-input" type="text" placeholder="Type a command or search (e.g. 'Start Python', 'Upcoming exams', 'Planner')..." 
              class="w-full bg-transparent border-none text-warm-ivory focus:outline-none text-base placeholder:text-muted-gray font-sans" autocomplete="off" />
            <kbd class="px-2 py-1 text-[10px] font-mono bg-elevated-surface text-muted-gray rounded border border-subtle">ESC</kbd>
          </div>

          <!-- Quick Actions & Results -->
          <div id="command-results" class="max-h-96 overflow-y-auto p-2 space-y-1 text-sm">
            <!-- Populated dynamically -->
          </div>

          <!-- Footer -->
          <div class="px-4 py-2.5 bg-elevated-surface border-t border-subtle flex items-center justify-between text-xs text-muted-gray">
            <div class="flex items-center gap-3">
              <span><kbd class="px-1.5 py-0.5 bg-midnight-surface rounded border border-subtle font-mono text-[10px]">↑↓</kbd> Navigate</span>
              <span><kbd class="px-1.5 py-0.5 bg-midnight-surface rounded border border-subtle font-mono text-[10px]">↵</kbd> Select</span>
            </div>
            <span>TechPath Command Engine</span>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Bind Keyboard Shortcuts
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          App.toggleCommandCenter();
        } else if (e.key === 'Escape') {
          App.closeCommandCenter();
        }
      });

      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) App.closeCommandCenter();
      });

      // Filter on input
      const searchInput = document.getElementById('command-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => App.renderCommandResults(e.target.value));
      }
    }
  },

  commandItems: [
    { title: 'Home Dashboard', category: 'Navigation', icon: 'dashboard', url: 'dashboard.html', keywords: 'home command center' },
    { title: 'Learn Hub', category: 'Learning', icon: 'menu_book', url: 'learn.html', keywords: 'courses syllabus notes video' },
    { title: 'Skill Learning Architecture', category: 'Skills', icon: 'code', url: 'skills.html', keywords: 'python dsa c++ web machine learning sql docker' },
    { title: 'Study Tracker & Resilient Timer', category: 'Study', icon: 'timer', url: 'study.html', keywords: 'timer track hours focus session' },
    { title: 'AI Notes & Study PDFs', category: 'Learning', icon: 'auto_stories', url: 'ai-notes.html', keywords: 'ai notes pdf study notes summary master notes ocr document' },
    { title: 'AI Engineering Quiz Generator', category: 'Practice', icon: 'quiz', url: 'quiz.html', keywords: 'quiz questions test practice exam mcq' },
    { title: 'Daily Planner & Calendar', category: 'Planner', icon: 'calendar_today', url: 'planner.html', keywords: 'tasks schedule calendar todo today' },
    { title: 'Upcoming Exams & Syllabus Tracker', category: 'Exams', icon: 'event_note', url: 'exams.html', keywords: 'exam mid semester countdown date test' },
    { title: 'Project Hub & AI Generator', category: 'Build', icon: 'terminal', url: 'projects.html', keywords: 'projects portfolio github ai generator build' },
    { title: 'Career Hub & Skill Gap Navigator', category: 'Career', icon: 'work', url: 'career.html', keywords: 'career readiness job role intern gap' },
    { title: 'Interactive Resume Builder', category: 'Career', icon: 'description', url: 'resume-builder.html', keywords: 'resume ats pdf cv export builder' },
    { title: 'Mock Interview Simulator', category: 'Career', icon: 'mic', url: 'mock-interview.html', keywords: 'interview technical hr voice questions' },
    { title: 'AI Copilot Assistant', category: 'AI', icon: 'psychology', url: 'copilot.html', keywords: 'copilot ask doubt ai tutor chat' },
    { title: '3D Flashcards Active Recall', category: 'Learning', icon: 'psychology_alt', url: 'flashcards.html', keywords: 'flashcards 3d memory recall flip' },
    { title: 'Coding IDE Simulator', category: 'Practice', icon: 'terminal', url: 'ide.html', keywords: 'ide code compiler python testcases' },
    { title: 'Start Python Learning', category: 'Quick Action', icon: 'play_circle', action: () => { window.location.href = 'skills.html?skill=python'; }, keywords: 'start python skill' },
    { title: 'Start Immediate Study Timer', category: 'Quick Action', icon: 'play_arrow', action: () => { StudyTracker.startSession('General Study', 'Focused Engineering Session'); window.location.href = 'study.html'; }, keywords: 'start timer study session' }
  ],

  toggleCommandCenter() {
    const modal = document.getElementById('command-center-modal');
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      const input = document.getElementById('command-search-input');
      if (input) {
        input.value = '';
        input.focus();
      }
      this.renderCommandResults('');
    } else {
      this.closeCommandCenter();
    }
  },

  closeCommandCenter() {
    const modal = document.getElementById('command-center-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
  },

  renderCommandResults(query) {
    const container = document.getElementById('command-results');
    if (!container) return;

    const clean = query.trim().toLowerCase();
    const filtered = clean 
      ? this.commandItems.filter(item => 
          item.title.toLowerCase().includes(clean) || 
          item.category.toLowerCase().includes(clean) || 
          item.keywords.toLowerCase().includes(clean))
      : this.commandItems;

    if (!filtered.length) {
      container.innerHTML = `
        <div class="p-6 text-center text-muted-gray">
          <span class="material-symbols-outlined text-3xl mb-1">search_off</span>
          <p class="text-sm">No commands matching "${query}"</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((item, idx) => `
      <div onclick="App.executeCommand(${idx})" class="p-3 rounded-xl hover:bg-elevated-surface cursor-pointer flex items-center justify-between group transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-elevated-surface border border-subtle flex items-center justify-center text-indigo-brand group-hover:text-warm-ivory group-hover:bg-indigo-600 transition-colors">
            <span class="material-symbols-outlined text-lg">${item.icon}</span>
          </div>
          <div>
            <div class="font-semibold text-warm-ivory text-sm">${item.title}</div>
            <div class="text-[11px] text-muted-gray">${item.category}</div>
          </div>
        </div>
        <span class="material-symbols-outlined text-muted-gray group-hover:text-warm-ivory text-sm">arrow_forward</span>
      </div>
    `).join('');
  },

  executeCommand(idx) {
    const item = this.commandItems[idx];
    this.closeCommandCenter();
    if (item.action) {
      item.action();
    } else if (item.url) {
      window.location.href = item.url;
    }
  },

  // ========================================================================
  // CUSTOM SITE LOADING EXPERIENCE (Section 14)
  // Staged: INITIALIZING -> LOADING PROFILE -> LEARNING SYSTEM -> READY
  // ========================================================================
  initLoadingExperience() {
    // Only run on first visit or when explicitly requested
    const hasLoaded = sessionStorage.getItem('btechpath_loaded_session');
    if (hasLoaded || document.getElementById('auth-splash-loader') || document.getElementById('btech-consent-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'btechpath-loader-overlay';
    overlay.className = 'fixed inset-0 z-[999999] bg-deep-twilight flex flex-col items-center justify-center transition-opacity duration-500';
    overlay.innerHTML = `
      <div class="flex flex-col items-center max-w-sm w-full px-6 text-center space-y-6">
        <!-- Logo Path Glowing Mark -->
        <div class="relative w-20 h-20 flex items-center justify-center">
          <div class="absolute inset-0 rounded-2xl bg-indigo-brand/20 blur-xl animate-pulse"></div>
          <div class="w-16 h-16 rounded-2xl bg-midnight-surface border border-subtle flex items-center justify-center relative shadow-2xl">
            <span class="material-symbols-outlined text-3xl text-indigo-brand animate-spin" style="animation-duration: 4s;">all_inclusive</span>
          </div>
        </div>

        <div>
          <div class="font-extrabold text-xl tracking-tight text-warm-ivory">TechPath</div>
          <p class="text-xs text-muted-gray mt-1 font-mono tracking-wide" id="loader-stage-text">INITIALIZING...</p>
        </div>

        <!-- Progress Track -->
        <div class="w-full bg-elevated-surface h-1.5 rounded-full overflow-hidden border border-subtle">
          <div id="loader-progress-bar" class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 w-0 transition-all duration-300"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const stages = [
      { text: 'INITIALIZING ARCHITECTURE...', pct: 25 },
      { text: 'LOADING STUDENT PROFILE...', pct: 55 },
      { text: 'CONFIGURING LEARNING SYSTEM...', pct: 85 },
      { text: 'PREPARING AI ENGINE • READY', pct: 100 }
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < stages.length) {
        const textEl = document.getElementById('loader-stage-text');
        const barEl = document.getElementById('loader-progress-bar');
        if (textEl) textEl.textContent = stages[step].text;
        if (barEl) barEl.style.width = stages[step].pct + '%';
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          overlay.style.opacity = '0';
          setTimeout(() => overlay.remove(), 500);
          sessionStorage.setItem('btechpath_loaded_session', 'true');
        }, 300);
      }
    }, 280);

    // Hard fallback timeout: never block indefinitely
    setTimeout(() => {
      if (overlay.parentNode) overlay.remove();
      sessionStorage.setItem('btechpath_loaded_session', 'true');
    }, 2500);
  },

  // Confirmation Dialog System (Section 102)
  confirm(title, message, onConfirm) {
    const existing = document.getElementById('app-confirm-dialog');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.id = 'app-confirm-dialog';
    dialog.className = 'fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in';
    dialog.innerHTML = `
      <div class="bg-midnight-surface border border-subtle rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div class="flex items-center gap-3 text-semantic-warning">
          <span class="material-symbols-outlined text-2xl">warning</span>
          <h3 class="font-bold text-lg text-warm-ivory">${title}</h3>
        </div>
        <p class="text-sm text-muted-gray leading-relaxed">${message}</p>
        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="dialog-cancel-btn" class="px-4 py-2 rounded-lg bg-elevated-surface hover:bg-surface-elevated text-warm-ivory text-sm font-semibold transition-colors">Cancel</button>
          <button id="dialog-confirm-btn" class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    document.getElementById('dialog-cancel-btn').onclick = () => dialog.remove();
    document.getElementById('dialog-confirm-btn').onclick = () => {
      dialog.remove();
      if (onConfirm) onConfirm();
    };
  },

  // 13. Enterprise PWA Engine & Offline Sync
  initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }

    // Android Install Prompt Hook
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      window.deferredPWAInstallPrompt = e;

      // Check if user already dismissed install banner in this session
      if (sessionStorage.getItem('pwa_install_dismissed')) return;

      const installBtn = document.getElementById('pwa-install-banner-btn');
      if (installBtn) {
        installBtn.classList.remove('hidden');
        installBtn.onclick = async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('[PWA] User choice:', outcome);
            deferredPrompt = null;
          }
        };
      }
    });

    // Offline / Online Network Status Watchers
    window.addEventListener('offline', () => {
      if (window.AuthManager && typeof window.AuthManager.showToast === 'function') {
        window.AuthManager.showToast('You are currently offline. Running from browser cache.', 'warning');
      }
    });

    window.addEventListener('online', () => {
      if (window.AuthManager && typeof window.AuthManager.showToast === 'function') {
        window.AuthManager.showToast('Network connection restored.', 'success');
      }
    });
  },

  // 14. Native Android Touch Ripple & Tactile Feedback
  initTouchFeedback() {
    document.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('button, a.btn, .grad-indigo-btn, .tap-effect, [role="button"]');
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple-wave';
      
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      if (!target.classList.contains('ripple-container')) {
        target.classList.add('ripple-container');
      }

      target.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }, { passive: true });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
