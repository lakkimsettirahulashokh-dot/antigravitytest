/* ==========================================================================
   TechPath — Supabase Production Client Bridge (Canonical Singleton)
   - Guarantees EXACTLY ONE browser-side Supabase client instance
   - Resolves all concurrent init() calls through a shared Promise mutex
   - Completely eliminates "Multiple GoTrueClient instances detected" warning
   - Real Supabase Auth (Google OAuth, Email/Password, Email Verification)
   - Real PostgREST Database Queries with Row Level Security (RLS)
   - Realtime WebSocket Channel Subscriptions (Live Data Streaming)
   - Safe Client-Side Architecture (Anon Key Only, Zero Service-Role Leakage)
   ========================================================================== */

// ─── CANONICAL BROWSER SINGLETON GUARD ────────────────────────────────────────
(function() {
  'use strict';

  // If SupabaseBridge and a live client already exist on window, do NOT redefine.
  if (typeof window !== 'undefined' && window.SupabaseBridge && window.SupabaseBridge.client) {
    return;
  }

  const SupabaseBridge = {
    client: (typeof window !== 'undefined' && window.supabaseClient) ? window.supabaseClient : null,
    config: {
      url: null,
      anonKey: null,
      appUrl: (typeof window !== 'undefined' && window.location) ? window.location.origin : 'http://localhost:8080'
    },
    isInitialized: false,
    _initPromise: null,
    channels: {},

    /**
     * Initializes the single canonical Supabase browser client.
     * Guaranteed thread-safe / race-condition free via _initPromise memoization.
     */
    async init() {
      // 1. Return existing client immediately if already instantiated
      if (this.client) {
        this.isInitialized = true;
        if (typeof window !== 'undefined') window.supabaseClient = this.client;
        return this.client;
      }

      // 2. If an initialization is already in flight, await the SAME promise
      if (this._initPromise) {
        return this._initPromise;
      }

      // 3. Start initialization mutex
      this._initPromise = (async () => {
        try {
          // Double check in case another tick completed it
          if (this.client) {
            this.isInitialized = true;
            if (typeof window !== 'undefined') window.supabaseClient = this.client;
            return this.client;
          }

          // Check if window already has an active client instance
          if (typeof window !== 'undefined' && window.supabaseClient) {
            this.client = window.supabaseClient;
            this.isInitialized = true;
            return this.client;
          }

          // Fetch public configuration from backend server /api/config with timeout
          try {
            const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const timer = controller ? setTimeout(() => controller.abort(), 3500) : null;
            const res = await fetch('/api/config', { signal: controller ? controller.signal : undefined });
            if (timer) clearTimeout(timer);
            if (res.ok) {
              const remoteConfig = await res.json();
              if (remoteConfig.supabaseUrl && remoteConfig.supabaseAnonKey) {
                this.config.url = remoteConfig.supabaseUrl;
                this.config.anonKey = remoteConfig.supabaseAnonKey;
              }
              if (remoteConfig.appUrl) {
                this.config.appUrl = remoteConfig.appUrl;
              }
            }
          } catch (e) {
            console.info('[SupabaseBridge] Server /api/config not reachable or timed out, checking window or local environment.');
          }

          // Fallback to window.__ENV__
          if (!this.config.url && typeof window !== 'undefined' && window.__ENV__?.SUPABASE_URL) {
            this.config.url = window.__ENV__.SUPABASE_URL;
            this.config.anonKey = window.__ENV__.SUPABASE_ANON_KEY;
          }

          // Fallback default
          if (!this.config.url || this.config.url.includes('your-project-id')) {
            this.config.url = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : 'http://localhost:8080';
            this.config.anonKey = this.config.anonKey && !this.config.anonKey.includes('your-') ? this.config.anonKey : 'btechpath-local-anon-key';
          }

          if (typeof window !== 'undefined' && typeof window.supabase !== 'undefined' && this.config.url && this.config.anonKey) {
            // Check once more before calling createClient
            if (!this.client && !window.supabaseClient) {
              try {
                const clientInstance = window.supabase.createClient(this.config.url, this.config.anonKey, {
                  auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
                    storage: window.localStorage
                  },
                  realtime: {
                    params: {
                      eventsPerSecond: 10
                    }
                  }
                });

                this.client = clientInstance;
                window.supabaseClient = clientInstance;
                console.log('✅ [SupabaseBridge] Single canonical Supabase client active:', this.config.url);

                // Initialize Realtime sync with centralized DB
                if (window.DB && typeof window.DB.initRealtimeSync === 'function') {
                  window.DB.initRealtimeSync();
                }
              } catch (err) {
                console.warn('⚠️ [SupabaseBridge] Supabase client initialization error:', err);
              }
            } else if (window.supabaseClient) {
              this.client = window.supabaseClient;
            }
          } else {
            console.info('ℹ️ [SupabaseBridge] Supabase library or credentials pending. Local-first mode active.');
          }

          this.isInitialized = Boolean(this.client);
          return this.client;
        } finally {
          this._initPromise = null;
        }
      })();

      return this._initPromise;
    },

    isLive() {
      return this.client !== null;
    },

    isConfigured() {
      return Boolean(
        this.config.url && 
        !this.config.url.includes('your-project-id') && 
        this.config.anonKey && 
        !this.config.anonKey.includes('your-anon-key') &&
        !this.config.anonKey.includes('btechpath-local-anon-key')
      );
    },

    getClient() {
      if (this.client) return this.client;
      if (typeof window !== 'undefined' && window.supabaseClient) {
        this.client = window.supabaseClient;
        return this.client;
      }
      return null;
    },

    // Realtime Live Data Subscription Helper
    subscribeToTable(tableName, callback) {
      if (!this.isLive()) return null;
      const channelName = 'realtime:' + tableName;
      if (this.channels[channelName]) {
        return this.channels[channelName];
      }

      try {
        const channel = this.client
          .channel(channelName)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: tableName },
            (payload) => {
              console.log(`📡 [Realtime] Live change event in "${tableName}":`, payload.eventType);
              if (typeof callback === 'function') {
                callback(payload);
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`🟢 [Realtime] Channel live & listening: public.${tableName}`);
            } else if (status === 'CHANNEL_ERROR') {
              console.warn(`⚠️ [Realtime] Channel error subscribing to public.${tableName}`);
            }
          });

        this.channels[channelName] = channel;
        return channel;
      } catch (err) {
        console.warn(`⚠️ [Realtime] Failed to subscribe to ${tableName}:`, err);
        return null;
      }
    },

    unsubscribeAll() {
      if (!this.client) return;
      Object.keys(this.channels).forEach((ch) => {
        try {
          this.client.removeChannel(this.channels[ch]);
        } catch (e) {}
      });
      this.channels = {};
    }
  };

  if (typeof window !== 'undefined') {
    window.SupabaseBridge = SupabaseBridge;
    // Eagerly trigger singleton creation
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        SupabaseBridge.init();
      });
    } else {
      SupabaseBridge.init();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseBridge;
  }
})();
