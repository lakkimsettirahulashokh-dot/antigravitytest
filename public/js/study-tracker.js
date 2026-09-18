/* ==========================================================================
   BTechPath AI OS - Universal Study Time Tracker Service
   Strict Real-Data & Active Engagement Engine:
   - Measures genuine, active learning interactions (NOT login time alone)
   - Excludes idle time (configurable 60s inactivity timeout)
   - Pauses on background / hidden tabs (Page Visibility API)
   - Video playback awareness (LearnHub)
   - Coding IDE active typing/execution awareness
   - Multi-tab safety (BroadcastChannel + active lease to prevent double counting)
   - Low-overhead batch persistence (30s intervals, unload beacon, RLS Supabase)
   - Zero hardcoded / fabricated values
   ========================================================================== */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StudyTracker = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Configurable thresholds & constants
  const IDLE_TIMEOUT_MS = 60000;         // 60 seconds of inactivity -> pause
  const SYNC_INTERVAL_MS = 30000;        // 30 seconds batch flush to backend
  const LEASE_DURATION_MS = 10000;       // 10s multi-tab active lease duration
  const TAB_ID = 'tab_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);

  const STORAGE_KEYS = {
    TODAY_CACHE: 'btechpath_study_today_cache_v2',
    ACTIVE_TAB: 'btechpath_active_study_tab_v2',
    PENDING_DELTAS: 'btechpath_study_pending_deltas_v2',
    LAST_ACTIVITY: 'btechpath_study_last_activity_v2',
    SETTINGS: 'btechpath_study_settings_v2'
  };

  // Explicit Whitelist of genuine learning pages
  const LEARNING_PAGE_MAP = {
    'learn.html': 'learnhub',
    'ai-notes.html': 'ai_notes',
    'ide.html': 'coding',
    'quiz.html': 'quiz',
    'flashcards.html': 'flashcards',
    'doubt-solver.html': 'ai_doubt',
    'copilot.html': 'ai_doubt',
    'projects.html': 'project',
    'skills.html': 'skill',
    'exams.html': 'exam_prep',
    'government-exams.html': 'exam_prep',
    'international-exams.html': 'exam_prep',
    'mock-interview.html': 'mock_interview',
    'resume-builder.html': 'resume_prep',
    'study.html': 'study_room',
    'roadmap.html': 'roadmap'
  };

  // Explicit Blacklist of pages that must NEVER count as active study time
  const EXCLUDED_PAGES = [
    'index.html',
    'login.html',
    'signup.html',
    'onboarding.html',
    'start-journey.html',
    'dashboard.html',
    'settings.html',
    'profile.html',
    'contact.html',
    'helpdesk.html',
    'reviews.html',
    'admin.html',
    'cookie-policy.html',
    'maintenance.html',
    '404.html',
    'analytics.html'
  ];

  const StudyTracker = {
    // State
    isInitialized: false,
    isActive: false,
    isIdle: true,
    isVideoPlaying: false,
    currentActivity: 'general',
    currentTopic: '',
    
    // Timing counters
    accumulatedDeltaSec: 0,
    lastTickTime: null,
    lastUserActivityTime: Date.now(),
    
    // Timer handles
    tickIntervalId: null,
    syncIntervalId: null,
    broadcastChannel: null,

    // Status callback listeners
    statusListeners: new Set(),

    /**
     * Initialize the universal study tracking engine.
     */
    init() {
      if (this.isInitialized) return;
      this.isInitialized = true;

      // Setup multi-tab coordination
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          this.broadcastChannel = new BroadcastChannel('btechpath_study_tracker');
          this.broadcastChannel.onmessage = (e) => this.handleBroadcastMessage(e.data);
        } catch (e) {
          this.broadcastChannel = null;
        }
      }

      // Detect current page eligibility
      const page = this.detectCurrentPage();
      const isLearningPage = Boolean(LEARNING_PAGE_MAP[page]);
      const isExcluded = EXCLUDED_PAGES.includes(page);

      // Listen for window/app activity events
      this.bindActivityListeners();
      this.bindVisibilityListeners();
      this.bindLifecycleListeners();

      // Attempt flushing any offline/queued deltas
      this.flushPendingDeltas();

      // If on an eligible learning page and user is authenticated, begin active tracking
      if (isLearningPage && !isExcluded) {
        const activity = LEARNING_PAGE_MAP[page] || 'general';
        this.start(activity, { page });
      }

      // Initial local today load
      this.fetchTodayMetrics();
    },

    /**
     * Get current filename from pathname.
     */
    detectCurrentPage() {
      if (typeof window === 'undefined') return '';
      const path = window.location.pathname;
      const file = path.split('/').pop() || 'index.html';
      return file.toLowerCase().replace(/\.html$/, '') + '.html';
    },

    /**
     * Check if current page is an eligible learning surface.
     */
    isEligiblePage() {
      const page = this.detectCurrentPage();
      return Boolean(LEARNING_PAGE_MAP[page]) && !EXCLUDED_PAGES.includes(page);
    },

    /**
     * Current authenticated student info.
     */
    getUser() {
      try {
        if (typeof AuthManager !== 'undefined' && AuthManager.getUser) {
          const user = AuthManager.getUser();
          if (user) return user;
        }
        const raw = localStorage.getItem('TechPath_user_session') || localStorage.getItem('btechpath_user_session');
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return null;
    },

    /**
     * Start active tracking session for a specific activity.
     */
    start(activityType = 'general', details = {}) {
      if (!this.isEligiblePage()) {
        return;
      }

      const user = this.getUser();
      if (!user) {
        return;
      }

      this.currentActivity = activityType;
      this.currentTopic = details.topic || details.subject || details.page || activityType;
      this.lastUserActivityTime = Date.now();
      this.isIdle = false;
      this.isActive = true;
      this.lastTickTime = Date.now();

      this.claimTabLease();

      if (!this.tickIntervalId) {
        this.tickIntervalId = setInterval(() => this.tick(), 1000);
      }

      if (!this.syncIntervalId) {
        this.syncIntervalId = setInterval(() => this.sync(), SYNC_INTERVAL_MS);
      }

      this.notifyStatus('ACTIVE');
    },

    /**
     * Pause active tracking (e.g. idle timeout or tab hidden).
     */
    pause(reason = 'IDLE') {
      if (!this.isActive) return;
      this.isIdle = true;
      this.lastTickTime = null;
      this.notifyStatus(reason === 'HIDDEN' ? 'TAB_HIDDEN' : 'PAUSED');
    },

    /**
     * Resume active tracking when user interacts or returns.
     */
    resume() {
      if (!this.isEligiblePage()) return;
      const user = this.getUser();
      if (!user) return;

      this.isIdle = false;
      this.lastUserActivityTime = Date.now();
      this.lastTickTime = Date.now();
      this.claimTabLease();
      this.notifyStatus('ACTIVE');
    },

    /**
     * Stop tracking and flush pending seconds.
     */
    stop() {
      if (!this.isActive) return;
      this.sync(true);
      this.isActive = false;
      this.isIdle = true;
      this.lastTickTime = null;

      if (this.tickIntervalId) {
        clearInterval(this.tickIntervalId);
        this.tickIntervalId = null;
      }
      if (this.syncIntervalId) {
        clearInterval(this.syncIntervalId);
        this.syncIntervalId = null;
      }

      this.releaseTabLease();
      this.notifyStatus('STOPPED');
    },

    /**
     * Record a user learning activity event (resets idle timer).
     */
    recordActivity(customActivity = null, details = {}) {
      this.lastUserActivityTime = Date.now();
      if (customActivity) {
        this.currentActivity = customActivity;
      }
      if (details.topic) {
        this.currentTopic = details.topic;
      }

      // If tracker was paused due to inactivity, resume it
      if (this.isIdle && document.visibilityState === 'visible' && this.isEligiblePage()) {
        this.resume();
      }
    },

    /**
     * Special integration for LearnHub videos:
     * When video is actively playing, student is learning even if keyboard/mouse is still.
     */
    recordVideoPlayback(isPlaying) {
      this.isVideoPlaying = Boolean(isPlaying);
      if (this.isVideoPlaying) {
        this.recordActivity('learnhub');
      }
    },

    /**
     * 1-Second Heartbeat Engine:
     * Evaluates active state, idle timeout, and tab visibility.
     */
    tick() {
      if (!this.isActive) return;

      const now = Date.now();
      const isVisible = document.visibilityState === 'visible';

      // 1. Check multi-tab lease: ensure another tab hasn't stolen active focus
      if (!this.hasTabLease()) {
        // Another tab is actively focused; pause timing here to prevent double counting
        if (!this.isIdle) this.pause('MULTI_TAB_YIELD');
        return;
      }

      // 2. Refresh lease
      this.claimTabLease();

      // 3. Tab Visibility check
      if (!isVisible) {
        // If video is NOT playing or tab is backgrounded, do not count
        if (!this.isVideoPlaying) {
          if (!this.isIdle) this.pause('HIDDEN');
          return;
        }
      }

      // 4. Inactivity Idle Timeout check
      const idleTime = now - this.lastUserActivityTime;
      if (idleTime > IDLE_TIMEOUT_MS && !this.isVideoPlaying) {
        if (!this.isIdle) {
          this.pause('IDLE');
        }
        return;
      }

      // 5. User is genuinely active: Accumulate 1 active second
      if (!this.lastTickTime) {
        this.lastTickTime = now;
        return;
      }

      const elapsedMs = now - this.lastTickTime;
      if (elapsedMs >= 950) { // roughly 1 second tick
        const deltaSec = Math.min(3, Math.max(1, Math.round(elapsedMs / 1000)));
        this.accumulatedDeltaSec += deltaSec;
        this.lastTickTime = now;

        // Update local optimistic memory cache
        this.updateLocalOptimisticToday(deltaSec, this.currentActivity);
      }
    },

    /**
     * Optimistically update in-memory and localStorage today cache.
     */
    updateLocalOptimisticToday(deltaSec, activityType) {
      const user = this.getUser();
      if (!user) return;

      const userId = user.id || user.email;
      const todayYMD = new Date().toISOString().split('T')[0];

      let cache = this.getCachedToday();
      if (!cache || cache.userId !== userId || cache.studyDate !== todayYMD) {
        cache = {
          userId: userId,
          studyDate: todayYMD,
          activeSeconds: 0,
          dailyGoalSeconds: 7200,
          activityBreakdown: {}
        };
      }

      cache.activeSeconds = Math.max(0, (cache.activeSeconds || 0) + deltaSec);
      if (!cache.activityBreakdown) cache.activityBreakdown = {};
      cache.activityBreakdown[activityType] = (cache.activityBreakdown[activityType] || 0) + deltaSec;

      this.setCachedToday(cache);

      // Trigger UI updates across matching dom elements
      this.renderTodayDisplays(cache);
    },

    /**
     * Multi-Tab Coordination:
     * Claims active lease in localStorage with timestamp.
     */
    claimTabLease() {
      try {
        const lease = {
          tabId: TAB_ID,
          expiresAt: Date.now() + LEASE_DURATION_MS,
          url: window.location.href
        };
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, JSON.stringify(lease));
      } catch (e) {}
    },

    hasTabLease() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
        if (!raw) return true;
        const lease = JSON.parse(raw);
        if (Date.now() > lease.expiresAt) return true;
        return lease.tabId === TAB_ID;
      } catch (e) {
        return true;
      }
    },

    releaseTabLease() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
        if (raw) {
          const lease = JSON.parse(raw);
          if (lease.tabId === TAB_ID) {
            localStorage.removeItem(STORAGE_KEYS.ACTIVE_TAB);
          }
        }
      } catch (e) {}
    },

    handleBroadcastMessage(msg) {
      if (!msg) return;
      if (msg.type === 'STUDY_DELTA_PERSISTED' && msg.tabId !== TAB_ID) {
        // Another tab saved deltas; refresh today's count
        this.fetchTodayMetrics();
      }
    },

    /**
     * Flush accumulated delta seconds to backend API.
     */
    async sync(isUnloading = false) {
      if (this.accumulatedDeltaSec <= 0) {
        return;
      }

      const user = this.getUser();
      if (!user) {
        this.accumulatedDeltaSec = 0;
        return;
      }

      const deltaToSync = this.accumulatedDeltaSec;
      this.accumulatedDeltaSec = 0; // reset local pending
      const todayYMD = new Date().toISOString().split('T')[0];

      const payload = {
        deltaSeconds: deltaToSync,
        activityType: this.currentActivity || 'general',
        topic: this.currentTopic || '',
        studyDate: todayYMD,
        clientTimestamp: Date.now(),
        userId: user.id || user.email,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      // If page is unloading, prioritize navigator.sendBeacon
      if (isUnloading && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        try {
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          const sent = navigator.sendBeacon('/api/study-tracker/heartbeat', blob);
          if (sent) return;
        } catch (e) {}
      }

      // Standard asynchronous fetch
      try {
        const token = this.getAuthToken();
        const headers = {
          'Content-Type': 'application/json',
          'x-user-id': user.id || user.email || ''
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/study-tracker/heartbeat', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload),
          keepalive: isUnloading
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            this.setCachedToday({
              userId: user.id || user.email,
              studyDate: data.studyDate,
              activeSeconds: data.activeSeconds,
              dailyGoalSeconds: data.dailyGoalSeconds,
              activityBreakdown: data.activityBreakdown
            });
            this.renderTodayDisplays(this.getCachedToday());

            // Notify other tabs
            if (this.broadcastChannel) {
              this.broadcastChannel.postMessage({ type: 'STUDY_DELTA_PERSISTED', tabId: TAB_ID });
            }
          }
        } else {
          // Network or server issue: queue delta for offline retry
          this.queueOfflineDelta(payload);
        }
      } catch (err) {
        // Network failure
        this.queueOfflineDelta(payload);
      }
    },

    /**
     * Offline Queue Management.
     */
    queueOfflineDelta(payload) {
      try {
        const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_DELTAS) || '[]');
        queue.push(payload);
        // Limit queue size to 20 items to prevent uncontrolled growth
        if (queue.length > 20) queue.shift();
        localStorage.setItem(STORAGE_KEYS.PENDING_DELTAS, JSON.stringify(queue));
      } catch (e) {}
    },

    async flushPendingDeltas() {
      try {
        const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_DELTAS) || '[]');
        if (!queue.length) return;

        localStorage.removeItem(STORAGE_KEYS.PENDING_DELTAS);
        for (const item of queue) {
          const user = this.getUser();
          const headers = { 'Content-Type': 'application/json' };
          if (user?.id) headers['x-user-id'] = user.id;
          const token = this.getAuthToken();
          if (token) headers['Authorization'] = `Bearer ${token}`;

          await fetch('/api/study-tracker/heartbeat', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(item)
          });
        }
      } catch (e) {}
    },

    getAuthToken() {
      try {
        if (typeof SupabaseBridge !== 'undefined' && SupabaseBridge.getClient) {
          const client = SupabaseBridge.getClient();
          const session = client?.auth?.session?.();
          if (session?.access_token) return session.access_token;
        }
        const raw = localStorage.getItem('sb-access-token') || localStorage.getItem('btechpath_token');
        return raw || '';
      } catch (e) {
        return '';
      }
    },

    /**
     * Fetch confirmed today metrics from server or local DB.
     */
    async fetchTodayMetrics() {
      const user = this.getUser();
      if (!user) return null;

      try {
        const token = this.getAuthToken();
        const headers = { 'x-user-id': user.id || user.email || '' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/study-tracker/today', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const cache = {
              userId: user.id || user.email,
              studyDate: data.studyDate,
              activeSeconds: data.activeSeconds,
              dailyGoalSeconds: data.dailyGoalSeconds,
              activityBreakdown: data.activityBreakdown
            };
            this.setCachedToday(cache);
            this.renderTodayDisplays(cache);
            return cache;
          }
        }
      } catch (e) {}

      // Fallback: return cached local data
      const cached = this.getCachedToday();
      if (cached) this.renderTodayDisplays(cached);
      return cached;
    },

    /**
     * Canonical getter for Today's study time and metrics.
     * Returns today's tracked metrics (from cache or defaults).
     */
    getToday() {
      const cached = this.getCachedToday();
      if (cached) {
        return {
          ...cached,
          formatted: this.formatDuration(cached.activeSeconds || 0)
        };
      }
      return {
        date: new Date().toISOString().split('T')[0],
        activeSeconds: 0,
        formatted: '0m',
        dailyGoalSeconds: 7200,
        activityBreakdown: {}
      };
    },

    /**
     * Cache helpers
     */
    getCachedToday() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.TODAY_CACHE);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    getToday() {
      return this.getCachedToday();
    },

    setCachedToday(data) {
      try {
        localStorage.setItem(STORAGE_KEYS.TODAY_CACHE, JSON.stringify(data));
      } catch (e) {}
    },

    /**
     * Format seconds into human readable format (e.g. 2h 35m or 45m).
     */
    formatDuration(secs) {
      const s = Math.max(0, parseInt(secs || 0, 10));
      const hrs = Math.floor(s / 3600);
      const mins = Math.floor((s % 3600) / 60);
      if (hrs > 0) {
        return `${hrs}h ${mins}m`;
      }
      return `${mins}m`;
    },

    /**
     * Renders Today's Study across all matching DOM elements in Dashboard and other pages.
     */
    renderTodayDisplays(data) {
      if (!data) return;
      const activeSec = data.activeSeconds || 0;
      const goalSec = data.dailyGoalSeconds || 7200;
      const formatted = this.formatDuration(activeSec);
      const goalFormatted = this.formatDuration(goalSec);
      const pct = Math.min(100, Math.round((activeSec / goalSec) * 100));

      // 1. Dashboard primary metric card
      const dashDisplay = document.getElementById('dash-metric-today-study');
      if (dashDisplay) {
        dashDisplay.textContent = formatted;
      }

      // 2. Study Goal text & bar
      const goalDisplay = document.getElementById('dash-study-goal-text');
      if (goalDisplay) {
        goalDisplay.textContent = `${formatted} / ${goalFormatted}`;
      }
      const goalBar = document.getElementById('dash-study-goal-bar');
      if (goalBar) {
        goalBar.style.width = `${pct}%`;
      }
      const goalPct = document.getElementById('dash-study-goal-percent');
      if (goalPct) {
        goalPct.textContent = `${pct}%`;
      }

      // 3. Any sync class elements
      document.querySelectorAll('.today-study-hours-display').forEach(el => {
        el.textContent = formatted;
      });

      // 4. Update status indicator (Active / Study Paused)
      const statusBadge = document.getElementById('study-tracker-status-indicator');
      if (statusBadge) {
        if (!this.isEligiblePage()) {
          statusBadge.classList.add('hidden');
        } else if (this.isIdle) {
          statusBadge.classList.remove('hidden');
          statusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400"></span> <span>Study Paused</span>';
          statusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5';
        } else {
          statusBadge.classList.remove('hidden');
          statusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span> <span>Tracking Active Study</span>';
          statusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5';
        }
      }
    },

    /**
     * Get detailed breakdown modal contents.
     */
    getBreakdown() {
      const data = this.getCachedToday() || { activeSeconds: 0, activityBreakdown: {} };
      const breakdown = data.activityBreakdown || {};
      
      const labels = {
        'learnhub': 'LearnHub Video Mastery',
        'ai_notes': 'AI Notes & Study PDFs',
        'coding': 'Coding IDE Practice',
        'quiz': 'AI Quizzes & Practice',
        'flashcards': '3D Flashcards & Recall',
        'ai_doubt': 'AI Doubt Solver & Copilot',
        'project': 'Project Hub Build Activity',
        'skill': 'Skill Architecture & Practice',
        'exam_prep': 'Exam Tracker Preparation',
        'mock_interview': 'AI Mock Interview Lab',
        'resume_prep': 'Resume & Career Preparation',
        'study_room': 'Study Room Focused Timer',
        'roadmap': 'Skill Roadmap Guidance',
        'general': 'Other Learning Activities'
      };

      const items = [];
      let totalBreakdownSec = 0;

      for (const [key, label] of Object.entries(labels)) {
        const sec = breakdown[key] || 0;
        if (sec > 0) {
          items.push({
            activityKey: key,
            name: label,
            seconds: sec,
            formatted: this.formatDuration(sec),
            minutes: Math.round(sec / 60)
          });
          totalBreakdownSec += sec;
        }
      }

      items.sort((a, b) => b.seconds - a.seconds);

      return {
        totalSeconds: data.activeSeconds || 0,
        totalFormatted: this.formatDuration(data.activeSeconds || 0),
        items: items
      };
    },

    /**
     * User Activity Event Listeners (Idle detection).
     */
    bindActivityListeners() {
      const onActivity = (e) => {
        this.recordActivity();
      };

      // Mouse and pointer
      window.addEventListener('mousemove', onActivity, { passive: true });
      window.addEventListener('mousedown', onActivity, { passive: true });
      window.addEventListener('click', onActivity, { passive: true });

      // Keyboard
      window.addEventListener('keydown', onActivity, { passive: true });
      window.addEventListener('keyup', onActivity, { passive: true });

      // Touch for Mobile & Tablets
      window.addEventListener('touchstart', onActivity, { passive: true });
      window.addEventListener('touchmove', onActivity, { passive: true });

      // Scrolling
      window.addEventListener('scroll', onActivity, { passive: true });

      // Custom app events
      window.addEventListener('ide:code_executed', () => this.recordActivity('coding'));
      window.addEventListener('ide:code_edited', () => this.recordActivity('coding'));
      window.addEventListener('quiz:question_answered', () => this.recordActivity('quiz'));
      window.addEventListener('notes:section_expanded', () => this.recordActivity('ai_notes'));
    },

    /**
     * Tab / Window Visibility Listeners (Pause when switching tabs or minimizing).
     */
    bindVisibilityListeners() {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          // Tab switched away or minimized: flush pending active time and pause
          this.sync();
          if (!this.isVideoPlaying) {
            this.pause('HIDDEN');
          }
        } else if (document.visibilityState === 'visible') {
          // Returning to tab: do NOT blindly add hidden time; check user activity
          this.lastTickTime = Date.now();
          this.fetchTodayMetrics();
          // Resume only if user actually interacts or was playing video
          if (this.isVideoPlaying) {
            this.resume();
          }
        }
      });
    },

    /**
     * Page Lifecycle Listeners (Flush on page navigation or browser close).
     */
    bindLifecycleListeners() {
      const onUnload = () => {
        this.stop();
      };

      window.addEventListener('pagehide', onUnload);
      window.addEventListener('beforeunload', onUnload);

      // Online recovery
      window.addEventListener('online', () => {
        this.flushPendingDeltas();
        this.fetchTodayMetrics();
      });
    },

    /**
     * Status notifications (ACTIVE, PAUSED, TAB_HIDDEN, STOPPED).
     */
    notifyStatus(status) {
      this.statusListeners.forEach(cb => {
        try { cb(status, { activity: this.currentActivity, topic: this.currentTopic }); } catch (e) {}
      });
      const cache = this.getCachedToday();
      if (cache) this.renderTodayDisplays(cache);
    },

    onStatusChange(callback) {
      if (typeof callback === 'function') {
        this.statusListeners.add(callback);
      }
    },

    /**
     * Clean logout handler: finalizes current study session, flushes data, and wipes user state.
     */
    handleLogout() {
      this.stop();
      try {
        localStorage.removeItem(STORAGE_KEYS.TODAY_CACHE);
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TAB);
        localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
        localStorage.removeItem('btechpath_active_study_session_v2');
      } catch (e) {}
    },

    // =========================================================================
    // SESSION MANAGEMENT — Merged from legacy study-timer.js
    // Canonical API for dashboard buttons: startSession / pauseSession /
    // resumeSession / endSession / getActiveSession
    // These are the same underlying session that study-tracker uses internally.
    // =========================================================================
    ACTIVE_SESSION_KEY: 'btechpath_active_study_session_v2',
    _timerIntervalId: null,

    /** Start a named study session (used by dashboard buttons) */
    startSession(activity = 'General Study', topic = 'Session', plannerTaskId = null) {
      const user = this.getUser();
      if (!user) {
        if (typeof AuthManager !== 'undefined') AuthManager.showToast('Please log in to track study sessions.', 'warning');
        return;
      }
      const current = this.getActiveSession();
      if (current && !current.isPaused) {
        if (typeof AuthManager !== 'undefined') AuthManager.showToast('A study session is already in progress.', 'info');
        return;
      }
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new Date();
      const session = {
        sessionId: 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        userId: (user.email || '').toLowerCase(),
        activity, topic, plannerTaskId,
        startTime: now.toISOString(),
        studyDate: now.toISOString().split('T')[0],
        timezone: tz,
        elapsedSeconds: current ? current.elapsedSeconds : 0,
        isPaused: false,
        lastTick: Date.now()
      };
      try { localStorage.setItem(this.ACTIVE_SESSION_KEY, JSON.stringify(session)); } catch (e) {}
      this._startTimerInterval();
      this.renderTimerUI();
      // Also start the canonical tracker for accurate Today metrics
      this.start(activity, { topic });
      if (typeof AuthManager !== 'undefined') AuthManager.showToast(`Study Session Active: ${activity} (${topic})`, 'success');
    },

    /** Pause the active session */
    pauseSession() {
      const current = this.getActiveSession();
      if (!current || current.isPaused) return;
      current.isPaused = true;
      current.elapsedSeconds += Math.floor((Date.now() - current.lastTick) / 1000);
      current.lastTick = Date.now();
      try { localStorage.setItem(this.ACTIVE_SESSION_KEY, JSON.stringify(current)); } catch (e) {}
      clearInterval(this._timerIntervalId);
      this.renderTimerUI();
      this.pause('USER');
      if (typeof AuthManager !== 'undefined') AuthManager.showToast('Study session paused.', 'info');
    },

    /** Resume a paused session */
    resumeSession() {
      const current = this.getActiveSession();
      if (!current || !current.isPaused) return;
      current.isPaused = false;
      current.lastTick = Date.now();
      try { localStorage.setItem(this.ACTIVE_SESSION_KEY, JSON.stringify(current)); } catch (e) {}
      this._startTimerInterval();
      this.renderTimerUI();
      this.resume();
      if (typeof AuthManager !== 'undefined') AuthManager.showToast('Study session resumed.', 'success');
    },

    /** End and record the active session to DB */
    endSession(notes = '') {
      const current = this.getActiveSession();
      if (!current) return;
      if (!current.isPaused) {
        current.elapsedSeconds += Math.floor((Date.now() - current.lastTick) / 1000);
      }
      const durationSeconds = Math.max(current.elapsedSeconds, 1);
      const now = new Date();
      const finalRecord = {
        sessionId: current.sessionId,
        userId: current.userId,
        subject: current.activity,
        topic: current.topic,
        plannerTaskId: current.plannerTaskId || null,
        startTime: current.startTime,
        endTime: now.toISOString(),
        durationSeconds,
        studyDate: current.studyDate || now.toISOString().split('T')[0],
        timezone: current.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: notes || `Completed ${Math.round(durationSeconds / 60)} minutes of focused study.`
      };
      clearInterval(this._timerIntervalId);
      try { localStorage.removeItem(this.ACTIVE_SESSION_KEY); } catch (e) {}
      if (typeof DB !== 'undefined') {
        DB.addStudySession(finalRecord);
        if (finalRecord.plannerTaskId) DB.toggleTaskCompletion(finalRecord.plannerTaskId);
      }
      this.stop();
      this.renderTimerUI();
      this.fetchTodayMetrics();
      const xpEarned = Math.max(Math.floor(durationSeconds / 60) * 10, 15);
      const user = this.getUser();
      if (user) {
        user.xp = (user.xp || 0) + xpEarned;
        if (typeof AuthManager !== 'undefined' && AuthManager.setUser) AuthManager.setUser(user);
        if (typeof App !== 'undefined' && App.updateUserContext) App.updateUserContext();
      }
      if (typeof AuthManager !== 'undefined') AuthManager.showToast(`Session Recorded: ${(durationSeconds / 60).toFixed(1)} mins (+${xpEarned} XP)`, 'success');
    },

    /** Get the current active session object (or null) */
    getActiveSession() {
      try { return JSON.parse(localStorage.getItem(this.ACTIVE_SESSION_KEY)); } catch (e) { return null; }
    },

    _startTimerInterval() {
      clearInterval(this._timerIntervalId);
      this._timerIntervalId = setInterval(() => {
        const current = this.getActiveSession();
        if (current && !current.isPaused) {
          const delta = Math.floor((Date.now() - current.lastTick) / 1000);
          if (delta >= 1) {
            current.elapsedSeconds += delta;
            current.lastTick = Date.now();
            try { localStorage.setItem(this.ACTIVE_SESSION_KEY, JSON.stringify(current)); } catch (e) {}
          }
          this.renderTimerUI();
        }
      }, 1000);
    },

    /** Render the live session timer UI elements */
    renderTimerUI() {
      const current = this.getActiveSession();
      const formatTime = (secs) => {
        const hrs = String(Math.floor(secs / 3600)).padStart(2, '0');
        const mins = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        return `${hrs}:${mins}:${s}`;
      };
      document.querySelectorAll('#study-timer-display, .study-timer-display-sync').forEach(el => {
        el.textContent = current ? formatTime(current.elapsedSeconds) : '00:00:00';
      });
      const showStart = !current || current.isPaused;
      document.querySelectorAll('#study-timer-start-btn, .study-timer-start-sync').forEach(btn => {
        if (!current) {
          btn.classList.remove('hidden');
          btn.innerHTML = '<span class="material-symbols-outlined text-sm">play_arrow</span> Start Session';
        } else if (current.isPaused) {
          btn.classList.remove('hidden');
          btn.innerHTML = '<span class="material-symbols-outlined text-sm">play_arrow</span> Resume';
        } else {
          btn.classList.add('hidden');
        }
      });
      document.querySelectorAll('#study-timer-pause-btn, .study-timer-pause-sync').forEach(btn => {
        if (current && !current.isPaused) btn.classList.remove('hidden'); else btn.classList.add('hidden');
      });
      document.querySelectorAll('#study-timer-stop-btn, .study-timer-stop-sync').forEach(btn => {
        if (current) btn.classList.remove('hidden'); else btn.classList.add('hidden');
      });
    },

    /** Restore active session on page load (handles page refresh mid-session) */
    restoreActiveSession() {
      const current = this.getActiveSession();
      if (current && !current.isPaused) {
        const diff = Math.floor((Date.now() - current.lastTick) / 1000);
        if (diff > 0 && diff < 3600 * 12) current.elapsedSeconds += diff;
        current.lastTick = Date.now();
        try { localStorage.setItem(this.ACTIVE_SESSION_KEY, JSON.stringify(current)); } catch (e) {}
        this._startTimerInterval();
      }
      this.renderTimerUI();
    }
  };


  // Auto-init on DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => StudyTracker.init());
    } else {
      StudyTracker.init();
    }
  }

  return StudyTracker;
}));
