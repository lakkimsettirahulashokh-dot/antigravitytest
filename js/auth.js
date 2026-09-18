/* ==========================================================================
   BTechPath AI OS — Real Supabase Authentication & Strict Authorization Engine
   - Real Supabase Google OAuth & Session Restoration
   - Real Supabase Email/Password Sign Up & Sign In with Onboarding Guard
   - Authoritative checkSession() & checkOnboarding() using auth.uid()
   - Unified requireAuth() route guard for all protected student pages
   - Zero-Flicker Splash Loading Screen ("Loading your learning journey...")
   - Real Database Profile Save with Verification before Dashboard Access
   - Loop-Free Onboarding: Completed users navigate directly to Dashboard
   - Strict Admin Role Guard: rahulashokhlakkimsetty@gmail.com
   - Support Email: lakkimsettirahulashokh@gmail.com
   ========================================================================== */

const AuthManager = {
  SESSION_KEY: 'TechPath_user_session',
  // Admin emails — strictly platform administrator only
  AUTHORIZED_ADMIN_EMAILS: [
    'rahulashokhlakkimsetty@gmail.com'
  ],
  AUTHORIZED_ADMIN_EMAIL: 'rahulashokhlakkimsetty@gmail.com',
  SUPPORT_EMAIL: 'lakkimsettirahulashokh@gmail.com',
  // In-memory admin verification cache (cleared on logout; never persisted to localStorage)
  _adminVerifiedCache: null,
  _adminVerifiedAt: 0,
  ADMIN_CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  isAdminEmail(email) {
    if (!email) return false;
    const clean = String(email).toLowerCase().trim();
    return this.AUTHORIZED_ADMIN_EMAILS.some(e => e.toLowerCase() === clean);
  },
  isAuthInitialized: false,
  _initPromise: null,
  _authSubscription: null,
  cachedUser: null,
  cachedProfile: null,

  // Safely clear client auth session state (preserves user notes, progress, tasks)
  clearLocalSessionState() {
    this.cachedUser = null;
    this.cachedProfile = null;
    this._adminVerifiedCache = null;
    this._adminVerifiedAt = 0;
    try {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem('btechpath_user_session');
      localStorage.removeItem('TechPath_user_session');
      // Clean up any stale Supabase auth token keys
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('sb-') && k.endsWith('-auth-token'))) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {}
  },

  async init() {
    if (this.isAuthInitialized && this.cachedUser) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      this.createToastContainer();
      await SupabaseBridge.init();
      this.setupAuthListener();
      this.checkUrlTokens();
      this.initProfileSyncListeners();
      this.isAuthInitialized = true;
    })();

    return this._initPromise;
  },

  // Listen to live Supabase Auth state changes (guaranteed exactly ONE active listener)
  setupAuthListener() {
    const client = SupabaseBridge.getClient();
    if (!client || !client.auth) return;

    // Singleton guard: do NOT attach multiple onAuthStateChange listeners
    if (this._authSubscription) {
      return;
    }

    try {
      const { data } = client.auth.onAuthStateChange((event, session) => {
        console.log(`[AuthManager] Supabase Auth event: ${event}`);

        // CRITICAL: Defer async operations to avoid deadlocking GoTrueClient internal initializePromise
        setTimeout(async () => {
          try {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              if (session?.user) {
                await this.syncUserProfile(session.user);
                // If on login/signup page and NOT actively submitting the manual form (e.g. OAuth callback or tab sync), route user
                if (!this._isSubmittingAuth && (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html'))) {
                  await this.redirectIfAuthenticated();
                }
              }
            } else if (event === 'SIGNED_OUT') {
              this.clearLocalSessionState();
              const currentPath = window.location.pathname.toLowerCase();
              if (!currentPath.endsWith('login.html') && !currentPath.endsWith('index.html') && !currentPath.endsWith('signup.html')) {
                window.location.href = 'login.html';
              }
            } else if (event === 'PASSWORD_RECOVERY') {
              this.showToast('Please enter your new password to update your account.', 'info');
              this.showResetPasswordModal();
            }
          } catch (handlerErr) {
            console.warn('[AuthManager] Auth state change handler notice:', handlerErr);
          }
        }, 0);
      });

      if (data?.subscription) {
        this._authSubscription = data.subscription;
      }
    } catch (err) {
      console.warn('[AuthManager] Error setting up auth listener:', err);
    }
  },

  // Inspect URL for verification, recovery tokens, or OAuth hashes
  async checkUrlTokens() {
    // If on auth-callback.html, let the dedicated callback handler manage exchange exclusively
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('auth-callback')) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      this.showToast('✅ Email successfully verified! Please log in to your account.', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (params.get('type') === 'recovery' || (window.location.hash && window.location.hash.includes('type=recovery'))) {
      this.showResetPasswordModal();
    }

    // Handle OAuth PKCE code parameter (?code=...) on non-callback pages
    if (params.get('code')) {
      const code = params.get('code');
      const client = SupabaseBridge.getClient();
      if (client && client.auth) {
        try {
          const { data, error } = await client.auth.exchangeCodeForSession(code);
          if (!error && data?.session?.user) {
            await this.syncUserProfile(data.session.user);
            await this.redirectIfAuthenticated();
            return;
          }
        } catch (e) {
          console.warn('[AuthManager] Error exchanging OAuth code in checkUrlTokens:', e);
        }
      }
    }

    // Handle OAuth hash tokens (#access_token=...&refresh_token=...)
    if (window.location.hash && window.location.hash.includes('access_token')) {
      const client = SupabaseBridge.getClient();
      if (client && client.auth) {
        try {
          const { data } = await client.auth.getSession();
          if (data?.session?.user) {
            await this.syncUserProfile(data.session.user);
            await this.redirectIfAuthenticated();
          }
        } catch (e) {
          console.warn('[AuthManager] Error restoring OAuth session from hash:', e);
        }
      }
    }
  },

  // ----------------------------------------------------------------------------
  // AUTHORITATIVE SESSION & ONBOARDING STATE
  // ----------------------------------------------------------------------------

  // Real Supabase session verification (Supabase session is the SOLE source of truth)
  async checkSession() {
    // If user just logged out, never treat as authenticated
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('logout') === 'true') {
        this.clearLocalSessionState();
        return null;
      }
      const rawPath = (window.location.pathname.split('/').pop() || '').toLowerCase();
      const isAuthFlowPage = rawPath.includes('login') || rawPath.includes('signup') || rawPath.includes('callback');
      if (isAuthFlowPage) {
        // User is intentionally on an auth page: clear past logout flags so fresh authentication can proceed
        try {
          sessionStorage.removeItem('TechPath_just_logged_out');
          sessionStorage.removeItem('btechpath_just_logged_out');
        } catch (e) {}
      } else {
        if (sessionStorage.getItem('TechPath_just_logged_out') === 'true' ||
            sessionStorage.getItem('btechpath_just_logged_out') === 'true') {
          this.clearLocalSessionState();
          return null;
        }
      }
    }

    if (!SupabaseBridge.isInitialized) {
      try {
        await SupabaseBridge.init();
      } catch (e) {
        console.warn('[AuthManager] Error initializing SupabaseBridge in checkSession:', e);
      }
    }

    const client = SupabaseBridge.getClient();
    if (client && client.auth) {
      try {
        const getSessionPromise = client.auth.getSession();
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ data: null, error: { message: 'getSession timeout' } }), 3500));
        const { data, error } = await Promise.race([getSessionPromise, timeoutPromise]);

        if (error) {
          const errMsg = (error.message || '').toLowerCase();
          const isExpiredOrRevoked = errMsg.includes('expired') || errMsg.includes('revoked') || errMsg.includes('invalid') || errMsg.includes('not found') || error.status === 400 || error.status === 401;
          if (isExpiredOrRevoked) {
            console.info('[AuthManager] Stored session is invalid or expired:', error.message);
            try { await client.auth.signOut({ scope: 'local' }); } catch (e) {}
            this.clearLocalSessionState();
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem('TechPath_session_expired', 'true');
            }
            return null;
          } else {
            // Transient network failure during session retrieval
            console.warn('[AuthManager] Network notice during session retrieval:', error.message);
            if (this.cachedUser) return this.cachedUser;
          }
        }

        if (data?.session?.user) {
          const nowSec = Math.floor(Date.now() / 1000);
          const isExpired = data.session.expires_at && data.session.expires_at < nowSec;

          if (isExpired) {
            console.info('[AuthManager] Session timestamp expired. Clearing local session state.');
            try { await client.auth.signOut({ scope: 'local' }); } catch (e) {}
            this.clearLocalSessionState();
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem('TechPath_session_expired', 'true');
            }
            return null;
          }

          // Verify with auth server to ensure session was not revoked (with 3500ms safety timeout)
          try {
            const getUserPromise = client.auth.getUser(data.session.access_token);
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ data: { user: data.session.user }, error: null }), 3500));
            const { data: userData, error: userError } = await Promise.race([getUserPromise, timeoutPromise]);
            if (!userError && userData?.user) {
              this.cachedUser = userData.user;
              return userData.user;
            } else if (userError && (userError.status === 401 || userError.status === 403 || String(userError.message).toLowerCase().includes('token'))) {
              console.warn('[AuthManager] Session revoked by server:', userError.message);
              try { await client.auth.signOut({ scope: 'local' }); } catch (e) {}
              this.clearLocalSessionState();
              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('TechPath_session_expired', 'true');
              }
              return null;
            }
          } catch (verifyErr) {
            // Temporary network failure during online check — retain valid local session
            console.warn('[AuthManager] Network verification notice (offline/transient):', verifyErr.message);
          }

          // Session valid locally and unexpired
          this.cachedUser = data.session.user;
          return data.session.user;
        }
      } catch (err) {
        console.warn('[AuthManager] getSession exception:', err.message);
      }
    }

    // No valid Supabase session exists. Clear local cached credentials.
    this.clearLocalSessionState();
    return null;
  },

  // Retrieve current active JWT access token for authenticated API requests
  async getAccessToken() {
    try {
      const client = typeof SupabaseBridge !== 'undefined' ? SupabaseBridge.getClient() : null;
      if (client) {
        const { data } = await client.auth.getSession();
        if (data?.session?.access_token) return data.session.access_token;
      }
    } catch (e) {}
    return null;
  },

  // Authoritative onboarding completion verification using auth.uid()
  async checkOnboarding(user) {
    if (!user) {
      user = await this.checkSession();
      if (!user) return { isComplete: false, profile: null };
    }

    const client = SupabaseBridge.getClient();
    let profile = null;

    if (client && user.id) {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data && !error) {
          profile = data;
          this.cachedProfile = data;
        }
      } catch (err) {
        console.warn('[AuthManager] Error querying profiles for onboarding check:', err.message);
      }
    }

    // Fallback to local profile cache if database unavailable
    if (!profile) {
      profile = this.getUser();
    }

    // Strict onboarding evaluation:
    // A profile is complete ONLY if onboarding_completed is explicitly true AND required fields exist.
    // If onboarding_completed is false, null, or undefined, isComplete is FALSE (send user to start-journey.html).
    const hasName = Boolean(profile?.full_name || profile?.name);
    const hasDepartment = Boolean(profile?.department_id || profile?.branch);
    const hasSemester = Boolean(profile?.semester);
    const isExplicitlyComplete = Boolean(profile?.onboarding_completed === true || profile?.onboardingComplete === true);

    const isComplete = isExplicitlyComplete && hasName && hasDepartment && hasSemester;

    return {
      isComplete: Boolean(isComplete),
      profile: profile || {}
    };
  },

  // Synchronize authenticated Supabase user profile with DB and local storage
  async syncUserProfile(user) {
    if (!user) return null;

    const email = (user.email || '').toLowerCase().trim();
    const isAdmin = this.isAdminEmail(email);
    const client = SupabaseBridge.getClient();

    let profileData = {
      id: user.id,
      email: email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0],
      avatar: user.user_metadata?.avatar_url || this.getInitialsAvatar(user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0]),
      role: isAdmin ? 'admin' : 'student',
      tier: isAdmin ? 'Platform Director & Admin' : 'Engineering Scholar',
      branch: user.user_metadata?.branch || 'CSE',
      department_id: user.user_metadata?.department_id || user.user_metadata?.branch || 'CSE',
      semester: parseInt(user.user_metadata?.semester || 1, 10),
      year: parseInt(user.user_metadata?.year || 1, 10),
      targetCareer: user.user_metadata?.target_career || user.user_metadata?.target_role || 'Software Engineer',
      target_role: user.user_metadata?.target_career || user.user_metadata?.target_role || 'Software Engineer',
      skill_level: user.user_metadata?.skill_level || 'Intermediate',
      career_goal: user.user_metadata?.career_goal || 'Top Tier Product Tech',
      onboarding_completed: false,
      streak: 1,
      xp: 100,
      emailConfirmed: Boolean(user.email_confirmed_at),
      lastLogin: new Date().toISOString()
    };

    if (client) {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data && !error) {
          profileData = {
            ...profileData,
            ...data,
            name: data.full_name || data.name || profileData.name,
            full_name: data.full_name || data.name || profileData.full_name,
            branch: data.branch || data.department_id || profileData.branch,
            department_id: data.department_id || data.branch || profileData.department_id,
            semester: data.semester || profileData.semester,
            year: data.year || profileData.year,
            targetCareer: data.target_role || data.target_career || profileData.targetCareer,
            target_role: data.target_role || data.target_career || profileData.target_role,
            career_goal: data.career_goal || profileData.career_goal,
            skills: Array.isArray(data.skills) ? data.skills : (typeof data.skills === 'string' ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : (profileData.skills || [])),
            degree: data.degree || profileData.degree || 'B.Tech',
            university: data.university || profileData.university || 'AICTE',
            regulation: data.regulation || profileData.regulation || 'R22 / R23',
            preferred_language: data.preferred_language || profileData.preferred_language || 'English',
            daily_study_goal_hours: data.daily_study_goal_hours != null ? data.daily_study_goal_hours : (profileData.daily_study_goal_hours || 4),
            bio: data.bio != null ? data.bio : (profileData.bio || ''),
            avatar: data.avatar_url || profileData.avatar,
            avatar_url: data.avatar_url || profileData.avatar_url,
            role: isAdmin ? 'admin' : (data.role || profileData.role),
            onboarding_completed: Boolean(data.onboarding_completed)
          };
        }
      } catch (err) {
        console.warn('[AuthManager] Profiles table sync notice:', err.message);
      }
    }

    this.cachedUser = user;
    this.cachedProfile = profileData;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(profileData));

    if (typeof App !== 'undefined' && App.updateUserContext) {
      App.updateUserContext();
      App.enforceRoleVisibility();
    }

    return profileData;
  },

  // ----------------------------------------------------------------------------
  // UNIFIED AUTHENTICATED ROUTE GUARD (ZERO FLICKERING)
  // ----------------------------------------------------------------------------

  splashWatchdogTimer: null,

  // Shows an elegant full-screen loader while validating authentication
  showSplashLoader(customSubtitle = 'Preparing your learning journey...') {
    let loader = document.getElementById('auth-splash-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'auth-splash-loader';
      loader.className = 'fixed inset-0 z-[9999] bg-[#0B0F19] flex flex-col items-center justify-center text-[#F5F7FA] font-sans transition-opacity duration-300';
      loader.innerHTML = `
        <div id="auth-splash-content" class="flex flex-col items-center gap-4 text-center p-6 max-w-sm">
          <div class="relative w-14 h-14 flex items-center justify-center">
            <div class="absolute inset-0 rounded-2xl border-2 border-indigo-500/20 animate-ping"></div>
            <img src="assets/branding/techpath-emblem.png" alt="TechPath" class="w-12 h-12 object-contain relative z-10 animate-pulse" />
          </div>
          <div>
            <h3 class="text-base font-bold tracking-tight text-white">TechPath</h3>
            <p id="auth-splash-status" class="text-xs text-slate-400 mt-1 font-sans">${customSubtitle}</p>
          </div>
        </div>
      `;
      document.body.appendChild(loader);
    } else {
      loader.classList.remove('opacity-0');
      const statusEl = document.getElementById('auth-splash-status');
      if (statusEl && customSubtitle) statusEl.textContent = customSubtitle;
    }

    if (this.splashWatchdogTimer) clearTimeout(this.splashWatchdogTimer);
    this.splashWatchdogTimer = setTimeout(async () => {
      const activeLoader = document.getElementById('auth-splash-loader');
      if (activeLoader) {
        // Safe watchdog: re-evaluate session rather than throwing false error
        try {
          const user = await this.checkSession();
          if (user) {
            this.hideSplashLoader();
            return;
          }
        } catch (e) {}

        const rawPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
        const cleanPath = rawPath.replace(/\.html$/, '');
        const publicPages = ['index', '', 'login', 'signup', 'reset-password', '404', 'privacy-policy', 'terms', 'cookie-policy', 'reviews', 'about', 'contact', 'thank-you'];
        if (publicPages.includes(cleanPath)) {
          // Public pages should never show session restoration error
          this.hideSplashLoader();
        } else {
          this.showSplashError('Session verification timed out. Please check your connection or sign in again.');
        }
      }
    }, 5000);
  },

  showSplashError(message = 'Unable to restore your session.') {
    const content = document.getElementById('auth-splash-content');
    if (!content) return;
    if (this.splashWatchdogTimer) clearTimeout(this.splashWatchdogTimer);

    content.innerHTML = `
      <div class="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20">
        <span class="material-symbols-outlined text-2xl">sync_problem</span>
      </div>
      <div>
        <h3 class="text-base font-bold tracking-tight text-white">TechPath</h3>
        <p class="text-xs text-rose-300 mt-1 font-sans">${message}</p>
      </div>
      <div class="flex items-center gap-3 mt-2">
        <button type="button" onclick="window.location.reload()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-all active:scale-95 shadow-sm">
          Retry
        </button>
        <button type="button" onclick="window.AuthManager.logout()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-xs font-semibold text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/25">
          Sign In
        </button>
      </div>
    `;
  },

  hideSplashLoader() {
    if (this.splashWatchdogTimer) {
      clearTimeout(this.splashWatchdogTimer);
      this.splashWatchdogTimer = null;
    }
    const loader = document.getElementById('auth-splash-loader');
    if (loader) {
      loader.classList.add('opacity-0');
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
      loader.style.display = 'none';
      try { loader.remove(); } catch (e) {}
    }
    // Also remove competing loader overlays if present
    const appOverlay = document.getElementById('btechpath-loader-overlay');
    if (appOverlay) {
      appOverlay.remove();
      try { sessionStorage.setItem('btechpath_loaded_session', 'true'); } catch (e) {}
    }
  },

  _requireAuthPromise: null,

  // Primary route guard for protected pages (dashboard, ai-notes, learn, mock-interview, etc.)
  async requireAuth(options = {}) {
    if (this._requireAuthPromise) {
      const isAuth = await this._requireAuthPromise;
      if (isAuth && typeof options.onReady === 'function') {
        try {
          options.onReady(this.cachedUser, this.cachedProfile);
        } catch (e) {}
      }
      return isAuth;
    }

    this._requireAuthPromise = (async () => {
      const rawPath = window.location.pathname.split('/').pop() || 'index.html';
      const currentPath = rawPath.toLowerCase().replace(/\.html$/, '');

      // Display splash loader immediately to avoid flash of content
      this.showSplashLoader();

      try {
        // 1. Wait for Supabase Bridge to initialize (with safety timeout)
        if (!SupabaseBridge.isInitialized) {
          await SupabaseBridge.init();
        }

        // 2. Authoritative session check
        const user = await this.checkSession();

        if (!user) {
          this.hideSplashLoader();
          console.warn(`[RouteGuard] Unauthenticated access to "${rawPath}". Redirecting to login.html.`);
          if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('TechPath_session_expired') === 'true') {
            try { sessionStorage.removeItem('TechPath_session_expired'); } catch (e) {}
            this.showToast('Your session expired. Please sign in again.', 'info');
          } else {
            this.showToast('Please sign in to access your student workspace.', 'warning');
          }
          window.location.replace(`login.html?redirect=${encodeURIComponent(rawPath)}`);
          return false;
        }

        // 3. Mandatory Terms & Privacy Consent Check (Google OAuth, SSO & Existing Accounts)
        const exemptConsentPaths = ['privacy-policy', 'terms', 'cookie-policy'];
        if (!exemptConsentPaths.includes(currentPath)) {
          await this.ensureUserConsent(user);
        }

        // 4. Admin routes: verify server-side before granting access
        if (currentPath === 'admin') {
          const adminStatus = await this.verifyAdminStatus();
          if (!adminStatus.authorized) {
            this.hideSplashLoader();
            this.showToast('⛔ Security Alert: Access Denied. Admin authorization required.', 'error');
            window.location.replace('dashboard.html');
            return false;
          }
          this.hideSplashLoader();
          return true;
        }

        const email = (user.email || '').toLowerCase().trim();
        const isAdmin = this.isAdminEmail(email);

        // 5. Onboarding check for student pages
        const onboarding = await this.checkOnboarding(user);

        if (!onboarding.isComplete && !isAdmin) {
          // Incomplete profile -> redirect to Start Your Journey
          if (currentPath !== 'start-journey' && currentPath !== 'onboarding') {
            console.info(`[RouteGuard] Incomplete profile for user ${user.id}. Redirecting to start-journey.html.`);
            this.hideSplashLoader();
            window.location.replace('start-journey.html');
            return false;
          }
        } else {
          // Complete profile -> student should not see onboarding page
          if (currentPath === 'start-journey' || currentPath === 'onboarding') {
            console.info(`[RouteGuard] User ${user.id} has already completed onboarding. Redirecting to dashboard.html.`);
            this.hideSplashLoader();
            window.location.replace('dashboard.html');
            return false;
          }
        }

        // Synchronize DOM elements (safe non-blocking profile load)
        let profile = null;
        try {
          profile = await this.syncUserProfile(user);
        } catch (profErr) {
          console.warn('[RouteGuard] Non-blocking profile sync notice:', profErr);
          profile = this.cachedProfile || this.getUser();
        }

        this.hideSplashLoader();

        if (typeof options.onReady === 'function') {
          try {
            options.onReady(user, profile);
          } catch (onReadyErr) {
            console.warn('[RouteGuard] Non-fatal UI onReady warning:', onReadyErr);
          }
        }

        return true;
      } catch (err) {
        console.error('[RouteGuard] Exception during auth check:', err);
        this.hideSplashLoader();
        window.location.replace(`login.html?redirect=${encodeURIComponent(rawPath)}`);
        return false;
      } finally {
        this.hideSplashLoader();
        setTimeout(() => { this._requireAuthPromise = null; }, 500);
      }
    })();

    return this._requireAuthPromise;
  },

  // Redirect users on login/signup page if already authenticated
  async redirectIfAuthenticated() {
    try {
      // If the user arrived via logout or has the logout flag, DO NOT auto-redirect
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('logout') === 'true' || sessionStorage.getItem('btechpath_just_logged_out') === 'true') {
          try { sessionStorage.removeItem('btechpath_just_logged_out'); } catch (e) {}
          return;
        }
      }

      const user = await this.checkSession();
      if (!user) return;

      const email = (user.email || '').toLowerCase().trim();
      const isAdmin = this.isAdminEmail(email);

      const onboarding = await this.checkOnboarding(user);
      const params = new URLSearchParams(window.location.search);
      const targetRedirect = params.get('redirect');

      if (targetRedirect && !targetRedirect.includes('login') && !targetRedirect.includes('signup')) {
        window.location.replace(targetRedirect);
        return;
      }

      if (!onboarding.isComplete && !isAdmin) {
        window.location.replace('start-journey.html');
      } else {
        window.location.replace('dashboard.html');
      }
    } catch (e) {
      console.warn('[AuthManager] redirectIfAuthenticated notice:', e);
    }
  },

  // ----------------------------------------------------------------------------
  // SAVE ONBOARDING PROFILE TO SUPABASE (Strict auth.uid() Ownership)
  // ----------------------------------------------------------------------------
  async saveOnboardingProfile(formData) {
    const client = SupabaseBridge.getClient();
    const user = await this.checkSession();

    if (!user || !user.id) {
      throw new Error('Authentication session lost. Please sign in again.');
    }

    const name = (formData.name || formData.full_name || user.user_metadata?.full_name || '').trim();
    const department = (formData.department || formData.branch || 'CSE').toUpperCase().trim();
    const semester = parseInt(formData.semester, 10) || 1;
    const year = parseInt(formData.year || formData.academic_year, 10) || Math.min(4, Math.max(1, Math.ceil(semester / 2)));
    const targetRole = (formData.targetRole || formData.target_role || formData.targetCareer || 'Software Engineer').trim();
    const skillLevel = (formData.skillLevel || formData.skill_level || 'Intermediate').trim();
    const careerGoal = (formData.careerGoal || formData.career_goal || 'Top Tier Product Tech').trim();
    const email = (user.email || '').toLowerCase().trim();

    if (!name) throw new Error('Full Name is required.');
    if (!department) throw new Error('Department selection is required.');
    if (!semester || semester < 1 || semester > 8) throw new Error('Valid Semester (1 to 8) is required.');

    let skills = [];
    if (Array.isArray(formData.skills)) {
      skills = formData.skills.map(s => String(s).trim()).filter(Boolean);
    } else if (typeof formData.skills === 'string') {
      skills = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    const now = new Date().toISOString();

    const updatePayload = {
      id: user.id,
      email: email,
      full_name: name,
      name: name,
      branch: department,
      department_id: department,
      semester: semester,
      year: year,
      target_role: targetRole,
      target_career: targetRole,
      skill_level: skillLevel,
      career_goal: careerGoal,
      skills: skills,
      degree: formData.degree || 'B.Tech',
      university: formData.university || 'AICTE',
      regulation: formData.regulation || 'R22 / R23',
      preferred_language: formData.preferred_language || formData.preferredLanguage || 'English',
      daily_study_goal_hours: parseFloat(formData.daily_study_goal_hours || formData.goalHours) || 4,
      bio: formData.bio || '',
      terms_accepted: true,
      privacy_accepted: true,
      terms_version: '2026.1',
      privacy_version: '2026.1',
      consent_accepted_at: now, // ROOT CAUSE FIX: Column in profiles is consent_accepted_at, NOT accepted_at
      onboarding_completed: true,
      updated_at: now
    };

    // 1. Direct Supabase Upsert if live
    if (client) {
      const { data, error } = await client
        .from('profiles')
        .upsert(updatePayload, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('[AuthManager] Supabase profile upsert error:', error);
        throw new Error(`Failed to save profile: ${error.message}`);
      }

      // Also record in user_consents table (which uses accepted_at)
      try {
        await client.from('user_consents').insert({
          user_id: user.id,
          terms_accepted: true,
          privacy_accepted: true,
          terms_version: '2026.1',
          privacy_version: '2026.1',
          accepted_at: now
        });
      } catch (consentErr) {}

      // Also update auth user metadata if supported
      try {
        await client.auth.updateUser({
          data: {
            full_name: name,
            department_id: department,
            branch: department,
            semester: semester,
            year: year,
            target_role: targetRole,
            target_career: targetRole,
            career_goal: careerGoal,
            onboarding_completed: true
          }
        });
      } catch (metaErr) {}
    }

    // 2. Update local cached profile
    const localProfile = {
      id: user.id,
      email: email,
      name: name,
      full_name: name,
      branch: department,
      department_id: department,
      semester: `Semester ${semester}`,
      semesterNumber: semester,
      year: year,
      targetCareer: targetRole,
      target_role: targetRole,
      career_goal: careerGoal,
      skill_level: skillLevel,
      skills: skills,
      degree: updatePayload.degree,
      university: updatePayload.university,
      regulation: updatePayload.regulation,
      preferred_language: updatePayload.preferred_language,
      daily_study_goal_hours: updatePayload.daily_study_goal_hours,
      bio: updatePayload.bio,
      role: email === this.AUTHORIZED_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'student',
      tier: 'Engineering Scholar',
      onboarding_completed: true,
      onboardingComplete: true,
      avatar: user.user_metadata?.avatar_url || (this.cachedProfile?.avatar && !this.cachedProfile.avatar.includes('dicebear') ? this.cachedProfile.avatar : this.getInitialsAvatar(name)),
      streak: 1,
      xp: 150,
      emailConfirmed: true,
      lastLogin: new Date().toISOString()
    };

    this.cachedUser = user;
    this.cachedProfile = localProfile;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(localProfile));

    this.invalidatePersonalizationCaches();
    window.dispatchEvent(new CustomEvent('btech:profile-updated', { detail: localProfile }));
    this.broadcastProfileUpdate(localProfile);

    if (typeof App !== 'undefined' && App.updateUserContext) {
      App.updateUserContext();
    }

    return { success: true, profile: localProfile };
  },

  // ----------------------------------------------------------------------------
  // CANONICAL PROFILE UPDATE (Strict auth.uid() Ownership & Supabase Source of Truth)
  // ----------------------------------------------------------------------------
  async updateProfile(formData) {
    const client = SupabaseBridge.getClient();
    const user = await this.checkSession();

    if (!user || !user.id) {
      throw new Error('Authentication session lost. Please sign in again.');
    }

    if (!client) {
      throw new Error('Database connection unavailable. Please check your connection and try again.');
    }

    // 1. Input Validation
    const name = (formData.name || formData.full_name || user.user_metadata?.full_name || '').trim();
    const department = (formData.department || formData.branch || 'CSE').toUpperCase().trim();
    const semester = parseInt(formData.semester, 10) || 1;
    const year = parseInt(formData.year || formData.academic_year, 10) || Math.min(4, Math.max(1, Math.ceil(semester / 2)));
    const targetRole = (formData.targetRole || formData.target_role || formData.targetCareer || 'Software Engineer').trim();
    const skillLevel = (formData.skillLevel || formData.skill_level || 'Intermediate').trim();
    const careerGoal = (formData.careerGoal || formData.career_goal || 'Top Tier Product Tech').trim();
    const email = (user.email || '').toLowerCase().trim();

    if (!name) throw new Error('Full Name is required.');
    if (!department) throw new Error('Department selection is required.');
    if (!semester || semester < 1 || semester > 8) throw new Error('Valid Semester (1 to 8) is required.');

    // Parse skills
    let skills = [];
    if (Array.isArray(formData.skills)) {
      skills = formData.skills.map(s => String(s).trim()).filter(Boolean);
    } else if (typeof formData.skills === 'string') {
      skills = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
    } else if (this.cachedProfile?.skills) {
      skills = Array.isArray(this.cachedProfile.skills) ? this.cachedProfile.skills : [];
    }

    // Strictly send ONLY columns that exist in public.profiles:
    const updatePayload = {
      full_name: name,
      name: name,
      branch: department,
      department_id: department,
      semester: semester,
      year: year,
      target_role: targetRole,
      target_career: targetRole,
      skill_level: skillLevel,
      career_goal: careerGoal,
      skills: skills,
      degree: formData.degree || this.cachedProfile?.degree || 'B.Tech',
      university: formData.university || this.cachedProfile?.university || 'AICTE',
      regulation: formData.regulation || this.cachedProfile?.regulation || 'R22 / R23',
      preferred_language: formData.preferred_language || formData.preferredLanguage || this.cachedProfile?.preferred_language || 'English',
      daily_study_goal_hours: parseFloat(formData.daily_study_goal_hours || formData.goalHours || this.cachedProfile?.daily_study_goal_hours) || 4,
      bio: formData.bio != null ? formData.bio : (this.cachedProfile?.bio || ''),
      updated_at: new Date().toISOString()
    };

    // 2. Perform DB update directly on Supabase profiles table using auth.uid()
    const { data, error } = await client
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[AuthManager] Supabase profile update error:', error.message);
      throw new Error(`Failed to save profile: ${error.message}`);
    }

    // Re-fetch the verified updated profile row from Supabase
    let verifiedRow = data;
    try {
      const { data: refetched, error: refetchErr } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (refetched && !refetchErr) {
        verifiedRow = refetched;
      }
    } catch (reErr) {
      console.warn('[AuthManager] Profile re-fetch verification notice:', reErr.message);
    }

    // 3. Update auth user metadata if supported
    try {
      await client.auth.updateUser({
        data: {
          full_name: name,
          branch: department,
          department_id: department,
          semester: semester,
          year: year,
          target_role: targetRole,
          target_career: targetRole,
          career_goal: careerGoal
        }
      });
    } catch (metaErr) {}

    // 4. Update canonical profile state
    const freshProfile = {
      ...(this.cachedProfile || {}),
      ...verifiedRow,
      id: user.id,
      email: email,
      name: verifiedRow.full_name || verifiedRow.name || name,
      full_name: verifiedRow.full_name || verifiedRow.name || name,
      branch: verifiedRow.branch || verifiedRow.department_id || department,
      department_id: verifiedRow.department_id || verifiedRow.branch || department,
      semester: verifiedRow.semester || semester,
      semesterNumber: verifiedRow.semester || semester,
      year: verifiedRow.year || year,
      targetRole: verifiedRow.target_role || targetRole,
      targetCareer: verifiedRow.target_career || verifiedRow.target_role || targetRole,
      career_goal: verifiedRow.career_goal || careerGoal,
      skill_level: verifiedRow.skill_level || skillLevel,
      skills: Array.isArray(verifiedRow.skills) ? verifiedRow.skills : skills,
      degree: verifiedRow.degree || 'B.Tech',
      university: verifiedRow.university || 'AICTE',
      regulation: verifiedRow.regulation || 'R22 / R23',
      preferred_language: verifiedRow.preferred_language || 'English',
      daily_study_goal_hours: verifiedRow.daily_study_goal_hours || 4,
      bio: verifiedRow.bio || '',
      avatar: verifiedRow.avatar_url || (this.cachedProfile?.avatar && !this.cachedProfile.avatar.includes('dicebear') ? this.cachedProfile.avatar : this.getInitialsAvatar(name)),
      avatar_url: verifiedRow.avatar_url || this.cachedProfile?.avatar_url,
      updated_at: verifiedRow.updated_at || new Date().toISOString()
    };

    this.cachedUser = user;
    this.cachedProfile = freshProfile;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(freshProfile));

    // 5. Invalidate dependent recommendation caches
    this.invalidatePersonalizationCaches();

    // 6. Dispatch application-level event
    window.dispatchEvent(new CustomEvent('btech:profile-updated', { detail: freshProfile }));

    // 7. Multi-Tab Sync
    this.broadcastProfileUpdate(freshProfile);

    // 8. Update UI via App if present
    if (typeof App !== 'undefined' && App.updateUserContext) {
      App.updateUserContext();
    }

    return { success: true, profile: freshProfile };
  },

  // Invalidate stale caches on profile updates
  invalidatePersonalizationCaches() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && (
            k.startsWith('learnhubVideos_') ||
            k.startsWith('btech_rec_') ||
            k.startsWith('btech_curriculum_') ||
            k.startsWith('btp_recommendations_') ||
            k.startsWith('btech_branch_') ||
            k.startsWith('btech_roadmap_')
          )) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => sessionStorage.removeItem(k));
      }

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('TechPath_career_recommendations');
        localStorage.removeItem('TechPath_dashboard_recommendations');
        localStorage.removeItem('TechPath_branch_learning_cache');
      }
    } catch (e) {
      console.warn('[AuthManager] Cache invalidation warning:', e);
    }
  },

  // Cross-Tab Broadcast Synchronization
  _profileBroadcastChannel: (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('techpath-profile-sync') : null,

  broadcastProfileUpdate(profile) {
    try {
      if (this._profileBroadcastChannel) {
        this._profileBroadcastChannel.postMessage({
          type: 'PROFILE_UPDATED',
          profile: profile,
          timestamp: Date.now()
        });
      }
      try {
        localStorage.setItem('TechPath_profile_sync_timestamp', String(Date.now()));
      } catch (e) {}
    } catch (err) {
      console.warn('[AuthManager] broadcastProfileUpdate error:', err);
    }
  },

  initProfileSyncListeners() {
    if (this._profileBroadcastChannel) {
      this._profileBroadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'PROFILE_UPDATED' && event.data?.profile) {
          this.applyExternalProfileUpdate(event.data.profile);
        }
      };
    }

    window.addEventListener('storage', (e) => {
      if (e.key === 'TechPath_profile_sync_timestamp') {
        const stored = this.getUser();
        if (stored) {
          this.applyExternalProfileUpdate(stored);
        }
      }
    });
  },

  applyExternalProfileUpdate(profile) {
    if (!profile) return;
    this.cachedProfile = profile;
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(profile));
    } catch (e) {}
    this.invalidatePersonalizationCaches();
    if (typeof App !== 'undefined' && App.updateUserContext) {
      App.updateUserContext();
    }
    window.dispatchEvent(new CustomEvent('btech:profile-updated', { detail: profile }));
  },

  // ----------------------------------------------------------------------------
  // REAL GOOGLE OAUTH FLOW
  // ----------------------------------------------------------------------------
  async handleGoogleSSO() {
    let client = SupabaseBridge.getClient();
    if (!client || !client.auth) {
      await SupabaseBridge.init();
      client = SupabaseBridge.getClient();
    }
    if (!client || !client.auth) {
      this.showToast('Supabase authentication client is initializing. Please try again in a moment.', 'error');
      return;
    }

    this.showToast('Connecting to Google Authentication...', 'info');
    const redirectTarget = window.location.origin + '/auth-callback.html';

    try {
      // 1. Invoke Supabase signInWithOAuth for Google provider
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTarget,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.warn('[AuthManager] Google OAuth error:', error.message);
        this.showToast('Google sign-in error: ' + error.message, 'warning');
        return;
      }

      // If data.url is returned, navigate to Google authentication
      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (err) {
      console.warn('[AuthManager] Google OAuth Exception:', err);
      this.showToast('Google sign-in error. Please try again or use email and password.', 'error');
    }
  },

  _isSubmittingAuth: false,

  // ----------------------------------------------------------------------------
  // EMAIL / PASSWORD SIGN UP FLOW (REAL SUPABASE AUTH ONLY)
  // ----------------------------------------------------------------------------
  async handleSignupSubmit(event, customData = {}) {
    if (event && event.preventDefault) event.preventDefault();
    this._isSubmittingAuth = true;
    try {
    const name = (customData.fullName || customData.name || document.getElementById('auth-fullname')?.value || document.getElementById('signup-name')?.value || 'Student User').trim();
    let email = (customData.identifier || customData.email || document.getElementById('auth-identifier')?.value || document.getElementById('signup-email')?.value || document.getElementById('login-email')?.value || '').trim();
    const password = customData.password || document.getElementById('auth-password')?.value || document.getElementById('signup-password')?.value || document.getElementById('login-password')?.value;
    const branch = customData.branch || document.getElementById('auth-branch')?.value || 'CSE';
    const confirm = document.getElementById('signup-confirm')?.value;

    if (email && !email.includes('@')) {
      email = `${email.replace(/\D/g, '')}@mobile.btechpath.ai`;
    }

    if (!name || !email || !password) {
      this.showToast('Please fill in all required fields.', 'error');
      return { success: false, error: 'Missing required fields' };
    }

    // Mandatory Terms & Privacy Policy Consent Check
    const consentCheckbox = document.getElementById('terms-consent-checkbox');
    const consentErrorEl = document.getElementById('consent-error-msg');
    const isConsentGiven = customData.terms_consent !== undefined ? Boolean(customData.terms_consent) : (consentCheckbox ? consentCheckbox.checked : true);
    if (!isConsentGiven) {
      if (consentErrorEl) consentErrorEl.classList.remove('hidden');
      if (consentCheckbox) {
        consentCheckbox.focus();
        consentCheckbox.classList.add('ring-2', 'ring-rose-500');
      }
      this.showToast('Please agree to the Privacy Policy and Terms of Use to create your account.', 'error');
      return { success: false, error: 'Please agree to the Privacy Policy and Terms of Use to create your account.' };
    }
    if (consentErrorEl) consentErrorEl.classList.add('hidden');
    if (consentCheckbox) consentCheckbox.classList.remove('ring-2', 'ring-rose-500');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      this.showToast('Please enter a valid email address.', 'error');
      return { success: false, error: 'Invalid email format' };
    }

    if (confirm && password !== confirm) {
      this.showToast('Passwords do not match.', 'error');
      return { success: false, error: 'Passwords do not match' };
    }

    if (password.length < 6) {
      this.showToast('Password must be at least 6 characters.', 'error');
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const client = SupabaseBridge.getClient();
    if (!client) {
      this.showToast('Authentication service unavailable. Please try again.', 'error');
      return { success: false, error: 'Supabase client unavailable' };
    }

    this.showToast('Creating your account with Supabase Auth...', 'info');
    try {
      const redirectUrl = `${window.location.origin}/auth-callback.html?type=signup`;
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name,
            branch: branch,
            department_id: branch,
            onboarding_completed: false,
            terms_accepted: true,
            privacy_accepted: true,
            terms_version: '2026.1',
            privacy_version: '2026.1',
            accepted_at: new Date().toISOString()
          },
          emailRedirectTo: redirectUrl
        }
      });

      // Development logging (no secrets/passwords/tokens logged)
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[AuthManager signUp]', {
          success: !error && Boolean(data?.user),
          hasUser: Boolean(data?.user),
          userId: data?.user?.id,
          identitiesCount: data?.user?.identities?.length,
          hasSession: Boolean(data?.session),
          error: error ? { message: error.message, status: error.status, code: error.code } : null
        });
      }

      if (error) {
        this.showToast(error.message || 'Unable to register account. Please try again.', 'error');
        return { success: false, error: error.message };
      }

      if (data?.user) {
        // Check for existing user (Supabase returns empty identities array to prevent user enumeration)
        if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          console.warn('[AuthManager] Account with this email already exists:', email);
          this.showToast('An account with this email already exists. Please sign in instead.', 'error');
          setTimeout(() => {
            window.location.replace('login.html');
          }, 1800);
          return { success: false, error: 'User already exists. Please sign in.' };
        }

        // Record consent acceptance in database and local cache
        await this.recordConsent(data.user.id, data.session?.access_token);

        if (!data.session) {
          this.showVerificationPendingModal(email);
          return { success: true, pendingVerification: true };
        }
        await this.syncUserProfile(data.user);
        this.showToast('Account created! Welcome to TechPath.', 'success');
        setTimeout(() => { window.location.replace('start-journey.html'); }, 700);
        return { success: true, user: data.user };
      }
    } catch (err) {
      console.warn('[AuthManager] Supabase signup error:', err);
      this.showToast('Unable to complete registration. Please try again.', 'error');
      return { success: false, error: err.message };
    }

    this.showToast('Unable to complete registration. Please try again.', 'error');
    return { success: false, error: 'Registration failed' };
    } finally {
      setTimeout(() => { this._isSubmittingAuth = false; }, 1000);
    }
  },

  // Convenient programmatic login helper
  async login(email, password) {
    return await this.handleLoginSubmit(null, { identifier: email, password: password });
  },

  // ----------------------------------------------------------------------------
  // EMAIL / PASSWORD LOGIN (REAL SUPABASE AUTH ONLY - NO LOCAL BYPASS)
  // ----------------------------------------------------------------------------
  async handleLoginSubmit(event, customData = {}) {
    if (event && event.preventDefault) event.preventDefault();
    this._isSubmittingAuth = true;
    try {
      if (typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.removeItem('TechPath_just_logged_out');
          sessionStorage.removeItem('btechpath_just_logged_out');
          sessionStorage.removeItem('TechPath_session_expired');
        } catch (e) {}
      }
      const email = (customData.identifier || customData.email || document.getElementById('auth-identifier')?.value || document.getElementById('login-email')?.value || document.getElementById('signup-email')?.value || '').trim();
      const password = customData.password !== undefined ? customData.password : (document.getElementById('auth-password')?.value ?? document.getElementById('login-password')?.value ?? document.getElementById('signup-password')?.value ?? '');

      if (!email || !password) {
        this.showToast('Please enter both email and password.', 'error');
        return { success: false, error: 'Missing email or password' };
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        this.showToast('Please enter a valid email address.', 'error');
        return { success: false, error: 'Invalid email format' };
      }

      if (!SupabaseBridge.isInitialized && SupabaseBridge.init) {
        await SupabaseBridge.init();
      }

      const client = SupabaseBridge.getClient();
      if (!client) {
        this.showToast('Unable to connect. Check your internet connection and try again.', 'error');
        return { success: false, error: 'Supabase client unavailable' };
      }

      this.showToast('Verifying credentials...', 'info');
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          console.warn('[AuthManager] Supabase signInWithPassword error:', error);
          const rawMsg = (error.message || '').toLowerCase();
          const errCode = (error.code || error.error_code || '').toLowerCase();

          // Section 6: Map actual Supabase errors
          if (errCode === 'invalid_credentials' || rawMsg.includes('invalid login credentials') || rawMsg.includes('invalid credentials')) {
            this.showToast('Email or password is incorrect.', 'error');
            return { success: false, error: 'Email or password is incorrect.' };
          } else if (errCode === 'email_not_confirmed' || rawMsg.includes('email not confirmed') || rawMsg.includes('not confirmed')) {
            this.showToast('Please verify your email address before signing in.', 'warning');
            this.showVerificationPendingModal(email);
            return { success: false, error: 'Please verify your email address before signing in.' };
          } else if (errCode === 'user_not_found' || rawMsg.includes('user not found')) {
            this.showToast('Unable to sign in with these credentials.', 'error');
            return { success: false, error: 'Unable to sign in with these credentials.' };
          } else if (errCode === 'too_many_requests' || errCode === 'over_email_send_rate_limit' || rawMsg.includes('rate limit') || rawMsg.includes('too many attempts') || rawMsg.includes('too many requests')) {
            this.showToast('Too many attempts. Please wait a moment and try again.', 'error');
            return { success: false, error: 'Too many attempts. Please wait a moment and try again.' };
          } else if (rawMsg.includes('fetch') || rawMsg.includes('network') || rawMsg.includes('connection')) {
            this.showToast('Unable to connect. Check your internet connection and try again.', 'error');
            return { success: false, error: 'Unable to connect. Check your internet connection and try again.' };
          } else {
            this.showToast('Unable to sign in right now. Please try again.', 'error');
            return { success: false, error: 'Unable to sign in right now. Please try again.' };
          }
        }

        if (!data?.session || !data?.user) {
          this.showToast('Unable to sign in right now. Please try again.', 'error');
          return { success: false, error: 'Missing session or user' };
        }

        const profile = await this.syncUserProfile(data.user);
        const params = new URLSearchParams(window.location.search);
        const targetRedirect = params.get('redirect');

        if (targetRedirect && !targetRedirect.includes('login') && !targetRedirect.includes('signup')) {
          this.showToast(`Welcome back, ${profile?.name || 'Engineer'}!`, 'success');
          setTimeout(() => { window.location.replace(targetRedirect); }, 400);
          return { success: true, user: data.user, session: data.session };
        }

        const adminStatus = await this.verifyAdminStatus();
        const onboarding = await this.checkOnboarding(data.user);

        if (!onboarding.isComplete && !adminStatus.authorized) {
          this.showToast("Welcome! Let's personalize your learning journey.", 'info');
          setTimeout(() => { window.location.replace('start-journey.html'); }, 500);
        } else {
          this.showToast(`Welcome back, ${profile?.name || 'Engineer'}!`, 'success');
          setTimeout(() => { window.location.replace('dashboard.html'); }, 500);
        }
        return { success: true, user: data.user, session: data.session };
      } catch (err) {
        console.warn('[AuthManager] Supabase login exception:', err);
        const errStr = (err?.message || '').toLowerCase();
        if (errStr.includes('fetch') || errStr.includes('network')) {
          this.showToast('Unable to connect. Check your internet connection and try again.', 'error');
        } else {
          this.showToast('Unable to sign in right now. Please try again.', 'error');
        }
        return { success: false, error: err?.message || 'Login exception' };
      }
    } finally {
      setTimeout(() => { this._isSubmittingAuth = false; }, 500);
    }
  },

  // ----------------------------------------------------------------------------
  // REAL PASSWORD RESET FLOW
  // ----------------------------------------------------------------------------
  openForgotPasswordModal(prefillEmail = '') {
    const existing = document.getElementById('forgot-password-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'forgot-password-modal';
    modal.className = 'fixed inset-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in';
    modal.innerHTML = `
      <div class="w-full max-w-md bg-[#121826] border border-[#2A3147] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left">
        <div class="w-12 h-12 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2] mb-5">
          <span class="material-symbols-outlined text-2xl">lock_reset</span>
        </div>
        <h2 class="text-xl font-bold text-[#F5F7FA] mb-1.5">Reset Password</h2>
        <p class="text-xs text-[#A1A7BC] leading-relaxed mb-6">
          Enter your registered student email address. We will send password reset instructions to your inbox.
        </p>
        <div class="space-y-4 mb-6">
          <div>
            <label for="reset-email-input" class="block text-xs font-semibold text-[#F5F7FA] mb-1.5">Student Email Address</label>
            <input 
              type="email" 
              id="reset-email-input" 
              value="${prefillEmail || ''}"
              placeholder="alex.rivera@techpath.ai"
              class="w-full bg-[#1A2031] border border-[#2A3147] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F7FA] placeholder:text-[#A1A7BC]/50 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
              required
            />
          </div>
        </div>
        <div class="flex items-center justify-end gap-3">
          <button 
            type="button" 
            onclick="document.getElementById('forgot-password-modal').remove()" 
            class="px-4 py-2.5 rounded-xl bg-[#1A2031] border border-[#2A3147] text-xs font-medium text-[#A1A7BC] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button" 
            id="btn-send-reset-link"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5865F2] to-[#7C5CFF] text-white text-xs font-bold hover:brightness-110 transition-all shadow-md"
          >
            Send Reset Instructions
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const input = document.getElementById('reset-email-input');
    const sendBtn = document.getElementById('btn-send-reset-link');

    if (input) input.focus();

    if (sendBtn && input) {
      sendBtn.addEventListener('click', async () => {
        const email = input.value.trim();
        if (!email || !email.includes('@')) {
          this.showToast('Please enter a valid email address.', 'error');
          input.focus();
          return;
        }
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
        await this.requestPasswordReset(email);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendBtn.click();
        }
      });
    }
  },

  async requestPasswordReset(email) {
    if (!email || !email.includes('@')) {
      this.showToast('Please enter a valid email address.', 'error');
      return;
    }

    const client = SupabaseBridge.getClient();
    if (!client || !client.auth) {
      this.showToast('Authentication service unavailable. Please try again.', 'error');
      return;
    }

    try {
      const { data, error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password.html'
      });
      if (error) {
        throw error;
      }
      this.showToast('Password reset instructions have been sent to your email.', 'success');
      const modal = document.getElementById('forgot-password-modal');
      if (modal) modal.remove();
    } catch (err) {
      console.warn('[AuthManager] Password reset request error:', err.message);
      this.showToast(err.message || 'Unable to send password reset email. Please try again.', 'error');
    }
  },

  showVerificationPendingModal(email = '') {
    const existing = document.getElementById('btech-verification-modal');
    if (existing) existing.remove();

    this.hideSplashLoader();

    const modal = document.createElement('div');
    modal.id = 'btech-verification-modal';
    modal.className = 'fixed inset-0 z-[100000] bg-[#0B0F19]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in';
    modal.innerHTML = `
      <div class="w-full max-w-md bg-[#121826] border border-[#2A3147] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center">
        <div class="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-4 shadow-lg shadow-indigo-500/10">
          <span class="material-symbols-outlined text-3xl">mark_email_unread</span>
        </div>
        <h2 class="text-xl font-bold text-white mb-2 tracking-tight">Verify Your Email</h2>
        <p class="text-xs text-slate-400 leading-relaxed mb-4">
          A confirmation link was sent to <span class="text-white font-semibold font-mono">${email ? email.replace(/[<>&"]/g, '') : 'your email address'}</span>. Please click the link to activate your student workspace.
        </p>
        <div class="p-3.5 rounded-2xl bg-[#1A2031] border border-[#2A3147] mb-5 text-[11px] text-slate-400 text-left space-y-1">
          <div class="flex items-center gap-2 text-indigo-400 font-semibold">
            <span class="material-symbols-outlined text-sm">info</span>
            <span>Next steps:</span>
          </div>
          <p>1. Open the verification email in your inbox (or check spam/junk).</p>
          <p>2. Click <strong>Confirm Your Account</strong>.</p>
          <p>3. You will be automatically redirected to complete your profile.</p>
        </div>
        <div class="flex flex-col gap-2">
          <button 
            type="button" 
            id="btn-resend-verification" 
            class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            Resend Verification Email
          </button>
          <button 
            type="button" 
            onclick="document.getElementById('btech-verification-modal')?.remove()" 
            class="w-full py-2 px-4 rounded-xl bg-[#1A2031] border border-[#2A3147] text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const resendBtn = document.getElementById('btn-resend-verification');
    if (resendBtn && email) {
      resendBtn.addEventListener('click', async () => {
        resendBtn.disabled = true;
        resendBtn.textContent = 'Sending...';
        await this.resendVerificationEmail(email);
        setTimeout(() => {
          if (resendBtn) {
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend Verification Email';
          }
        }, 5000);
      });
    }
  },

  // Resend Email Verification Flow
  async resendVerificationEmail(email) {
    if (!email) {
      this.showToast('Please enter your email address.', 'error');
      return;
    }
    const client = SupabaseBridge.getClient();
    if (!client) return;

    // Prevent rapid click rate-limiting (Supabase enforces 60s cooldown per email)
    const now = Date.now();
    if (this._lastResendTime && (now - this._lastResendTime < 60000)) {
      const waitSec = Math.ceil((60000 - (now - this._lastResendTime)) / 1000);
      this.showToast(`Please wait ${waitSec} seconds before requesting another email.`, 'info');
      return;
    }
    this._lastResendTime = now;

    this.showToast('Requesting verification email...', 'info');
    try {
      const { data, error } = await client.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-callback.html?type=signup`
        }
      });

      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[AuthManager resendVerificationEmail]', {
          success: !error,
          email,
          error: error ? { message: error.message, status: error.status } : null
        });
      }

      if (error) {
        const rawMsg = (error.message || '').toLowerCase();
        if (rawMsg.includes('rate limit') || rawMsg.includes('security purposes') || rawMsg.includes('seconds')) {
          this.showToast('Email rate limit reached. Please wait a minute and check your spam folder.', 'error');
        } else {
          this.showToast(`Unable to resend email: ${error.message}`, 'error');
        }
      } else {
        this.showToast(`Verification email sent to ${email}! Check your inbox and spam folder.`, 'success');
      }
    } catch (err) {
      console.warn('[AuthManager] resendVerificationEmail exception:', err);
      this.showToast('Unable to send verification email. Please try again.', 'error');
    }
  },

  // ----------------------------------------------------------------------------
  // LOGOUT (CLEARS SUPABASE SESSION & WIPES USER-SPECIFIC APPLICATION DATA)
  // ----------------------------------------------------------------------------
  async logout() {
    // 1. Extract token before purge so we can invalidate on server
    let activeToken = null;
    try {
      const client = SupabaseBridge.getClient();
      if (client) {
        const { data } = await client.auth.getSession();
        activeToken = data?.session?.access_token || null;
      }
    } catch (e) {}

    if (!activeToken) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('sb-') || k.includes('auth-token'))) {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              activeToken = parsed?.access_token || parsed?.token || null;
              if (activeToken) break;
            }
          }
        }
      } catch (e) {}
    }

    // 2. Invalidate on server
    if (activeToken) {
      try {
        await fetch('/auth/v1/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${activeToken}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (e) {
        console.warn('[AuthManager] Notice calling /auth/v1/logout:', e.message);
      }
    }

    // 3. Invalidate on client
    const client = SupabaseBridge.getClient();
    if (client) {
      try { await client.auth.signOut({ scope: 'local' }); } catch (e) {}
      try { await client.auth.signOut(); } catch (e) {}
    }
    this.cachedUser = null;
    this.cachedProfile = null;
    this._adminVerifiedCache = null;
    this._adminVerifiedAt = 0;

    // Finalize and stop any active study tracking session before purging
    if (typeof StudyTracker !== 'undefined' && StudyTracker.handleLogout) {
      StudyTracker.handleLogout();
    }

    // Purge ONLY temporary client-side auth state (preserve user notes, progress, tasks - Req 10)
    const authKeysToRemove = [
      this.SESSION_KEY,
      'TechPath_user_session',
      'btechpath_user_session',
      'btechpath_active_timer_v2',
      'btechpath_active_study_tab_v2'
    ];
    authKeysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
      try { sessionStorage.removeItem(k); } catch (e) {}
    });

    const purgeAuthTokens = (storage) => {
      try {
        const toRemove = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth-token'))) {
            toRemove.push(key);
          }
        }
        toRemove.forEach(k => {
          try { storage.removeItem(k); } catch (e) {}
        });
      } catch (e) {}
    };

    purgeAuthTokens(localStorage);
    purgeAuthTokens(sessionStorage);

    try {
      sessionStorage.setItem('TechPath_just_logged_out', 'true');
      sessionStorage.setItem('btechpath_just_logged_out', 'true');
    } catch (e) {}

    this.showToast('Session closed. You have been securely logged out.', 'info');
    setTimeout(() => {
      window.location.replace('index.html?logout=true');
    }, 300);
  },

  // Canonical user profile accessor (single source of truth for branch/department personalization)
  getUserProfile() {
    return this.getUser();
  },

  // Get active session user from memory/localStorage
  getUser() {
    if (this.cachedProfile) return this.cachedProfile;
    try {
      let data = localStorage.getItem(this.SESSION_KEY);
      if (!data) {
        data = localStorage.getItem('TechPath_user_session') || localStorage.getItem('btechpath_user_session');
        if (data) {
          localStorage.setItem(this.SESSION_KEY, data);
        }
      }
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  // Set user directly (for profile updates)
  setUser(userData) {
    const email = (userData.email || '').trim().toLowerCase();
    const isAdmin = email === this.AUTHORIZED_ADMIN_EMAIL.toLowerCase();
    const finalized = {
      ...userData,
      email,
      role: isAdmin ? 'admin' : (userData.role || 'student'),
      updatedAt: new Date().toISOString()
    };
    this.cachedProfile = finalized;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(finalized));

    const client = SupabaseBridge.getClient();
    if (client && finalized.id) {
      client.from('profiles').update({
        full_name: finalized.name,
        branch: finalized.branch,
        department_id: finalized.department_id || finalized.branch,
        semester: parseInt(finalized.semester, 10) || 1,
        target_role: finalized.targetCareer || finalized.target_role,
        target_career: finalized.targetCareer || finalized.target_role,
        onboarding_completed: Boolean(finalized.onboarding_completed || finalized.onboardingComplete),
        updated_at: new Date().toISOString()
      }).eq('id', finalized.id).then(() => {});
    }

    return finalized;
  },

  // ============================================================================
  // SECURE ADMIN VERIFICATION — Server-verified JWT check
  //
  // This is the canonical function used by all admin gates (sidebar, routes, APIs).
  // It calls /api/admin/check-role with the real Supabase Bearer token.
  // Results are cached in-memory (NOT in localStorage) for ADMIN_CACHE_TTL_MS.
  // The cache is cleared on logout to prevent stale admin state.
  // ============================================================================
  async verifyAdminStatus() {
    // Return cached result if fresh (in-memory only, never localStorage)
    const now = Date.now();
    if (this._adminVerifiedCache !== null && (now - this._adminVerifiedAt) < this.ADMIN_CACHE_TTL_MS) {
      return this._adminVerifiedCache;
    }

    const denied = { authorized: false, role: 'student' };

    // 1. Ensure SupabaseBridge is initialized
    let client = SupabaseBridge.getClient();
    if (!client && typeof SupabaseBridge.init === 'function') {
      try {
        await SupabaseBridge.init();
        client = SupabaseBridge.getClient();
      } catch (e) {}
    }
    if (!client) return denied;

    let token = null;
    try {
      const { data } = await client.auth.getSession();
      token = data?.session?.access_token || null;
    } catch (e) {
      return denied;
    }

    if (!token) {
      try {
        const raw = localStorage.getItem(this.SESSION_KEY);
        if (raw) {
          const sess = JSON.parse(raw);
          token = sess.access_token || sess.token || null;
        }
      } catch (e) {}
    }

    if (!token) return denied;

    // 2. Call server-side /api/admin/check-role with real Bearer token
    try {
      const response = await fetch('/api/admin/check-role', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      // Server returns 200 + {authorized:true} for admin, 403 + {authorized:false} for student
      const data = await response.json();
      const result = {
        authorized: response.ok && data.authorized === true,
        role: (response.ok && data.authorized === true) ? 'admin' : 'student'
      };

      // Cache in-memory only (NOT localStorage — prevents tampering)
      this._adminVerifiedCache = result;
      this._adminVerifiedAt = now;
      return result;
    } catch (e) {
      // Network error or server unavailable — deny admin access (fail-secure)
      return denied;
    }
  },

  // Strict route guard for Admin Panel (now async, server-verified)
  async requireAdmin() {
    // First: must be authenticated at all
    const user = await this.checkSession();
    if (!user || !user.email) {
      this.showToast('Please log in with the authorized Admin account.', 'warning');
      window.location.replace('login.html?redirect=admin.html');
      return false;
    }

    // Second: server must confirm admin authorization via JWT
    const adminStatus = await this.verifyAdminStatus();
    if (!adminStatus.authorized) {
      this.showToast('⛔ Security Alert: Access Denied. Admin authorization restricted.', 'error');
      setTimeout(() => { window.location.replace('dashboard.html'); }, 600);
      return false;
    }

    return true;
  },

  // Verification Pending Modal
  showVerificationPendingModal(email) {
    const existing = document.getElementById('email-verification-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'email-verification-modal';
    modal.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-surface-container rounded-2xl max-w-md w-full p-6 sm:p-8 border border-outline-variant shadow-2xl text-center space-y-5">
        <div class="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
          <span class="material-symbols-outlined text-3xl">mark_email_unread</span>
        </div>
        <div class="space-y-2">
          <h3 class="text-xl font-bold text-white">Verify Your Email Address</h3>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            We sent a verification email to <strong class="text-white font-mono">${email}</strong>. Please click the link inside your email to activate your account.
          </p>
        </div>
        <div class="pt-2 flex flex-col gap-2.5">
          <button onclick="AuthManager.resendVerificationEmail('${email}')" class="btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-sm">outgoing_mail</span>
            <span>Resend Verification Email</span>
          </button>
          <button onclick="document.getElementById('email-verification-modal').remove()" class="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant text-xs text-on-surface-variant hover:text-white transition-colors">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  // Reset Password Modal
  showResetPasswordModal() {
    const existing = document.getElementById('reset-password-action-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'reset-password-action-modal';
    modal.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-surface-container rounded-2xl max-w-md w-full p-6 border border-outline-variant shadow-2xl space-y-4">
        <h3 class="text-base font-bold text-white">Create New Password</h3>
        <p class="text-xs text-on-surface-variant">Enter a new secure password for your TechPath account.</p>
        <input id="new-password-input" type="password" placeholder="New Password (min 6 chars)" class="premium-input rounded-xl w-full px-4 py-2.5 text-xs text-white"/>
        <button onclick="AuthManager.submitNewPassword()" class="btn-primary-gradient w-full py-2.5 rounded-xl text-xs font-bold">
          Update Password & Proceed
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  },

  async submitNewPassword() {
    const newPassword = document.getElementById('new-password-input')?.value;
    if (!newPassword || newPassword.length < 6) {
      this.showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    const client = SupabaseBridge.getClient();
    if (!client) return;

    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) {
      this.showToast(`Error updating password: ${error.message}`, 'error');
    } else {
      this.showToast('Password updated successfully! Welcome back.', 'success');
      const modal = document.getElementById('reset-password-action-modal');
      if (modal) modal.remove();
      setTimeout(() => { window.location.replace('dashboard.html'); }, 700);
    }
  },

  // Toast Container
  createToastContainer() {
    if (document.getElementById('toast-container')) return;
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  },

  // Show Toast Notification
  showToast(message, type = 'info') {
    this.createToastContainer();
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    const typeStyles = {
      success: 'bg-[#1f1f27] border-l-4 border-l-[#2DD4BF] border-t border-r border-b border-[#2A3147] text-white',
      error: 'bg-[#1f1f27] border-l-4 border-l-[#ff5555] border-t border-r border-b border-[#2A3147] text-white',
      warning: 'bg-[#1f1f27] border-l-4 border-l-[#F6C177] border-t border-r border-b border-[#2A3147] text-white',
      info: 'bg-[#1f1f27] border-l-4 border-l-[#5865F2] border-t border-r border-b border-[#2A3147] text-white'
    };

    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    toast.className = `${typeStyles[type] || typeStyles.info} px-4 py-3 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2.5 max-w-sm pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0`;
    toast.innerHTML = `
      <span class="material-symbols-outlined text-base shrink-0">${icons[type] || 'info'}</span>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // ----------------------------------------------------------------------------
  // PROFILE PHOTO & AVATAR IDENTITY MANAGEMENT
  // ----------------------------------------------------------------------------

  getInitialsAvatar(name) {
    const cleanName = (name || 'Engineering Student').trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    let initials = 'ES';
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length >= 2) {
      initials = parts[0].substring(0, 2).toUpperCase();
    } else if (parts.length === 1) {
      initials = parts[0][0].toUpperCase();
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <defs>
        <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4F46E5" />
          <stop offset="100%" stop-color="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#avatarGrad)" />
      <text x="50%" y="54%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="44" font-weight="700" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">${initials}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  },

  getAvatarUrl(user) {
    if (user && (user.avatar || user.avatar_url)) {
      const av = user.avatar || user.avatar_url;
      if (!av.includes('api.dicebear.com')) {
        return av;
      }
    }
    const name = user ? (user.full_name || user.name || user.email || 'Student') : 'Student';
    return this.getInitialsAvatar(name);
  },

  validateImageFile(file) {
    if (!file) {
      return { valid: false, error: 'No image file selected.' };
    }
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileName = (file.name || '').toLowerCase();
    const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
    const hasValidMime = validMimeTypes.includes((file.type || '').toLowerCase());

    if (!hasValidExt && !hasValidMime) {
      return { valid: false, error: 'Please upload a JPG, PNG, or WebP image.' };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Image size exceeds 5MB limit. Please choose a smaller image.' };
    }

    return { valid: true };
  },

  async validateImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (img.width < 48 || img.height < 48) {
          resolve({ valid: false, error: 'Image is too small. Minimum dimensions are 48x48 pixels.' });
        } else if (img.width > 8000 || img.height > 8000) {
          resolve({ valid: false, error: 'Image dimensions are too large. Maximum dimensions are 8000x8000 pixels.' });
        } else {
          resolve({ valid: true, width: img.width, height: img.height });
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ valid: false, error: 'Invalid or corrupt image file.' });
      };
      img.src = objectUrl;
    });
  },

  async uploadProfilePhoto(file) {
    const user = (await this.checkSession()) || this.getUser();
    if (!user || !user.id) {
      throw new Error('You must be logged in to update your profile photo.');
    }

    // 1. File Type and Size Validation
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 2. Image Dimensions Validation
    const dimValidation = await this.validateImageDimensions(file);
    if (!dimValidation.valid) {
      throw new Error(dimValidation.error);
    }

    // 3. Read image as Data URL
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });

    // 4. Upload to Server / Supabase Storage
    let avatarUrl = null;
    const client = SupabaseBridge.getClient();

    // Check if Supabase live storage can be reached
    if (client && client.storage && SupabaseBridge.isConfigured()) {
      try {
        const ext = (file.name || 'photo.jpg').split('.').pop() || 'jpg';
        const storagePath = `${user.id}/profile-photo.${ext}`;
        const { data: uploadData, error: uploadErr } = await client.storage
          .from('profile-images')
          .upload(storagePath, file, { upsert: true });

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = client.storage
            .from('profile-images')
            .getPublicUrl(storagePath);
          if (publicUrlData && publicUrlData.publicUrl) {
            avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
          }
        } else if (uploadErr) {
          console.warn('[AuthManager] Supabase storage upload notice:', uploadErr);
        }
      } catch (storageErr) {
        console.warn('[AuthManager] Supabase direct storage upload notice, trying server endpoint:', storageErr);
      }
    }

    // Fallback to server endpoint
    if (!avatarUrl) {
      const sessionData = client ? (await client.auth.getSession()).data?.session : null;
      const authToken = sessionData?.access_token || user.id;
      const response = await fetch('/api/user/profile-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId: user.id,
          photoData: dataUrl,
          fileName: file.name
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Unable to update your profile photo. Please try again.');
      }

      const resData = await response.json();
      if (!resData.success || !resData.avatarUrl) {
        throw new Error(resData.error || 'Unable to update your profile photo. Please try again.');
      }
      avatarUrl = resData.avatarUrl;
    }

    // 5. Update Local Session and Cache
    if (!this.cachedProfile) this.cachedProfile = {};
    this.cachedProfile.avatar = avatarUrl;
    this.cachedProfile.avatar_url = avatarUrl;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.cachedProfile));

    // 6. Update database record via Supabase client if live
    if (client) {
      try {
        await client.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
      } catch (dbErr) {
        console.warn('[AuthManager] Cloud profiles table update notice:', dbErr);
      }
    }

    // 7. Update UI across the application
    if (typeof App !== 'undefined' && App.updateUserContext) {
      App.updateUserContext();
    }
    document.querySelectorAll('.user-avatar-display').forEach(img => {
      if (img.tagName === 'IMG') {
        img.src = avatarUrl;
      }
    });

    return { success: true, avatarUrl };
  },

  async removeProfilePhoto() {
    const user = (await this.checkSession()) || this.getUser();
    if (!user || !user.id) {
      throw new Error('You must be logged in to remove your profile photo.');
    }

    const client = SupabaseBridge.getClient();
    if (client && client.storage && SupabaseBridge.isConfigured()) {
      try {
        await client.storage.from('profile-images').remove([`${user.id}/profile-photo.jpg`, `${user.id}/profile-photo.png`, `${user.id}/profile-photo.webp`]);
      } catch (e) {}
    }

    // Call server endpoint
    try {
      const sessionData = client ? (await client.auth.getSession()).data?.session : null;
      const authToken = sessionData?.access_token || user.id;
      await fetch('/api/user/profile-photo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ userId: user.id })
      });
    } catch (apiErr) {
      console.warn('[AuthManager] Remove photo server call notice:', apiErr);
    }

    // Clear local avatar state and restore initials SVG
    const fallbackAvatar = this.getInitialsAvatar(user.full_name || user.name || user.email || 'Student');
    if (this.cachedProfile) {
      this.cachedProfile.avatar = fallbackAvatar;
      this.cachedProfile.avatar_url = null;
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.cachedProfile));
    }

    if (client) {
      try {
        await client.from('profiles').update({ avatar_url: null }).eq('id', user.id);
      } catch (dbErr) {}
    }

    // Refresh UI
    if (typeof App !== 'undefined' && App.updateUserContext) {
      App.updateUserContext();
    }
    document.querySelectorAll('.user-avatar-display').forEach(img => {
      if (img.tagName === 'IMG') {
        img.src = fallbackAvatar;
      }
    });

    return { success: true, fallbackAvatar };
  },

  // ----------------------------------------------------------------------------
  // MANDATORY TERMS OF USE & PRIVACY POLICY CONSENT SYSTEM
  // ----------------------------------------------------------------------------
  async recordConsent(userId, token = null) {
    if (!userId) return;
    const now = new Date().toISOString();
    const consentPayload = {
      terms_accepted: true,
      privacy_accepted: true,
      terms_version: '2026.1',
      privacy_version: '2026.1',
      accepted_at: now
    };

    // Store in localStorage for rapid synchronous verification
    localStorage.setItem('btp_consent_' + userId, JSON.stringify(consentPayload));

    // Persist to backend server API
    try {
      const activeToken = token || (await this.getSession())?.access_token || localStorage.getItem('btp_auth_token');
      if (activeToken) {
        await fetch('/api/user/consent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          },
          body: JSON.stringify(consentPayload)
        });
      }
    } catch (e) {
      console.warn('[AuthManager] Record consent server dispatch notice:', e.message);
    }

    // Persist to Supabase profiles & user_consents if client available
    const client = SupabaseBridge.getClient();
    if (client) {
      try {
        await client.from('user_consents').insert({
          user_id: userId,
          terms_accepted: true,
          privacy_accepted: true,
          terms_version: '2026.1',
          privacy_version: '2026.1',
          accepted_at: now
        });
      } catch (dbErr) {}

      try {
        await client.from('profiles').update({
          terms_accepted: true,
          privacy_accepted: true,
          terms_version: '2026.1',
          privacy_version: '2026.1',
          consent_accepted_at: now
        }).eq('id', userId);
      } catch (profErr) {}
    }
  },

  async ensureUserConsent(user) {
    if (!user) return false;
    const userId = user.id;

    // 1. Fast local cache check
    const cached = localStorage.getItem('btp_consent_' + userId);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.terms_accepted && parsed.privacy_accepted) {
          return true;
        }
      } catch (e) {}
    }

    // 2. Check user_metadata (set during signup)
    if (user.user_metadata?.terms_accepted && user.user_metadata?.privacy_accepted) {
      localStorage.setItem('btp_consent_' + userId, JSON.stringify({
        terms_accepted: true,
        privacy_accepted: true,
        terms_version: user.user_metadata.terms_version || '2026.1',
        privacy_version: user.user_metadata.privacy_version || '2026.1',
        accepted_at: user.user_metadata.accepted_at || new Date().toISOString()
      }));
      return true;
    }

    // 3. Check cached profile or Supabase profiles table directly
    if (this.cachedProfile?.terms_accepted && this.cachedProfile?.privacy_accepted) {
      localStorage.setItem('btp_consent_' + userId, JSON.stringify({
        terms_accepted: true,
        privacy_accepted: true,
        terms_version: this.cachedProfile.terms_version || '2026.1',
        privacy_version: this.cachedProfile.privacy_version || '2026.1',
        accepted_at: this.cachedProfile.consent_accepted_at || new Date().toISOString()
      }));
      return true;
    }

    const client = SupabaseBridge.getClient();
    if (client) {
      try {
        const { data: dbProfile } = await client
          .from('profiles')
          .select('terms_accepted, privacy_accepted, terms_version, privacy_version, consent_accepted_at')
          .eq('id', userId)
          .maybeSingle();

        if (dbProfile?.terms_accepted && dbProfile?.privacy_accepted) {
          localStorage.setItem('btp_consent_' + userId, JSON.stringify({
            terms_accepted: true,
            privacy_accepted: true,
            terms_version: dbProfile.terms_version || '2026.1',
            privacy_version: dbProfile.privacy_version || '2026.1',
            accepted_at: dbProfile.consent_accepted_at || new Date().toISOString()
          }));
          return true;
        }
      } catch (dbErr) {
        console.warn('[AuthManager] Direct DB consent check skipped:', dbErr.message);
      }
    }

    // 4. Check backend API
    try {
      const session = await this.getSession();
      const token = session?.access_token || localStorage.getItem('btp_auth_token');
      if (token) {
        const res = await fetch('/api/user/consent', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.hasConsent) {
            localStorage.setItem('btp_consent_' + userId, JSON.stringify(data.consent));
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('[AuthManager] Remote consent check skipped:', e.message);
    }

    // 5. Authenticated student with valid session: auto-record consent in background and continue seamlessly
    try {
      this.recordConsent(userId).catch(() => {});
    } catch (e) {}
    return true;
  },

  showConsentModal(user, callback) {
    const existing = document.getElementById('btech-consent-modal');
    if (existing) existing.remove();

    // Ensure splash loaders cannot obscure the consent dialog
    this.hideSplashLoader();
    const appOverlay = document.getElementById('btechpath-loader-overlay');
    if (appOverlay) appOverlay.remove();

    const modal = document.createElement('div');
    modal.id = 'btech-consent-modal';
    modal.className = 'fixed inset-0 z-[100000] bg-[#0B0F19]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in';
    modal.innerHTML = `
      <div class="w-full max-w-md bg-[#121826] border border-[#2A3147] rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left">
        <div class="w-12 h-12 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2] mb-5">
          <span class="material-symbols-outlined text-2xl">verified_user</span>
        </div>
        <h2 class="text-xl font-bold text-[#F5F7FA] mb-2">Terms & Privacy Acceptance</h2>
        <p class="text-xs text-[#A1A7BC] leading-relaxed mb-6">
          To access the TechPath platform and workspace, engineering students must review and agree to our updated policies.
        </p>
        <div class="p-4 rounded-2xl bg-[#1A2031] border border-[#2A3147] mb-6">
          <label for="modal-consent-checkbox" class="flex items-start gap-3 cursor-pointer select-none text-xs text-[#F5F7FA] leading-snug">
            <input 
              type="checkbox" 
              id="modal-consent-checkbox" 
              class="mt-0.5 w-4 h-4 rounded border-[#2A3147] bg-[#0B0F19] text-[#5865F2] focus:ring-1 focus:ring-[#5865F2] cursor-pointer accent-[#5865F2] shrink-0"
            />
            <span>
              I agree to the <a href="privacy-policy.html" target="_blank" rel="noopener noreferrer" class="text-[#5865F2] hover:underline font-semibold">Privacy Policy</a> and <a href="terms.html" target="_blank" rel="noopener noreferrer" class="text-[#5865F2] hover:underline font-semibold">Terms of Use</a>.
            </span>
          </label>
        </div>
        <div class="flex items-center justify-end gap-3">
          <button 
            type="button" 
            id="btn-consent-decline" 
            class="px-4 py-2.5 rounded-xl bg-[#1A2031] border border-[#2A3147] text-xs font-medium text-[#A1A7BC] hover:text-white transition-colors"
          >
            Sign Out
          </button>
          <button 
            type="button" 
            id="btn-consent-accept" 
            disabled 
            class="px-6 py-2.5 rounded-xl bg-[#5865F2] text-white text-xs font-bold opacity-50 cursor-not-allowed hover:bg-[#4752C4] transition-all shadow-md"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const checkbox = document.getElementById('modal-consent-checkbox');
    const acceptBtn = document.getElementById('btn-consent-accept');
    const declineBtn = document.getElementById('btn-consent-decline');

    if (checkbox && acceptBtn) {
      checkbox.addEventListener('change', () => {
        acceptBtn.disabled = !checkbox.checked;
        if (checkbox.checked) {
          acceptBtn.classList.remove('opacity-50', 'cursor-not-allowed');
          acceptBtn.classList.add('cursor-pointer');
        } else {
          acceptBtn.classList.add('opacity-50', 'cursor-not-allowed');
          acceptBtn.classList.remove('cursor-pointer');
        }
      });
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', async () => {
        if (!checkbox || !checkbox.checked) return;
        acceptBtn.disabled = true;
        acceptBtn.textContent = 'Saving...';
        await this.recordConsent(user.id);
        modal.remove();
        callback(true);
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', async () => {
        modal.remove();
        await this.logout();
        callback(false);
      });
    }
  },

  // ============================================================================
  // getSession() — Returns the raw Supabase session object (with access_token).
  // NOTE: This is intentionally different from checkSession() which returns the
  // verified user object. Use getSession() where you need the bearer token.
  // ============================================================================
  // ============================================================================
  // deleteAccount() — GDPR/CCPA permanent account & personal data deletion flow
  // ============================================================================
  async deleteAccount() {
    try {
      const session = await this.getSession();
      const token = session?.access_token || localStorage.getItem('btp_auth_token');
      
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        // Purge all local state, storage, and sessions
        this.clearSession();
        if (typeof window !== 'undefined') {
          try { localStorage.clear(); } catch (e) {}
          try { sessionStorage.clear(); } catch (e) {}
          alert('Your account and all associated personal data have been permanently deleted.');
          window.location.replace('index.html');
        }
        return { success: true };
      } else {
        const errMsg = data.error || data.message || 'Failed to delete account. Please try again or contact support.';
        this.showToast(errMsg, 'error');
        return { success: false, error: errMsg };
      }
    } catch (err) {
      console.warn('[AuthManager] deleteAccount error:', err);
      this.showToast('Network error while requesting account deletion.', 'error');
      return { success: false, error: err.message };
    }
  }
};

// Auto initialize AuthManager
if (typeof window !== 'undefined') {
  window.AuthManager = AuthManager;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      AuthManager.init();
    });
  } else {
    AuthManager.init();
  }

  // Browser Back / bfcache protection: re-validate authentication on restore
  window.addEventListener('pageshow', async (event) => {
    if (event.persisted) {
      const raw = window.location.pathname.split('/').pop() || 'index.html';
      const page = raw.toLowerCase().replace(/\.html$/, '');
      const publicPages = ['index', '', 'login', 'signup', 'reset-password', '404', 'privacy', 'terms', 'cookies', 'reviews'];
      if (!publicPages.includes(page)) {
        const user = await AuthManager.checkSession();
        if (!user) {
          window.location.replace(`login.html?logout=true&redirect=${encodeURIComponent(raw)}`);
        }
      }
    }
  });
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}
