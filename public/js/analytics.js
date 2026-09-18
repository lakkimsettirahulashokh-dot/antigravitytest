/**
 * BTechPath AI OS — Configuration-Driven Privacy-Safe Analytics Engine
 * Features:
 * - Environment-driven configuration (ANALYTICS_ID)
 * - Strict consent gating (Analytics only executes when user explicitly grants consent)
 * - No fake tracking IDs
 * - Deduplicated page view tracking
 * - Automatic sensitive parameter redaction (No passwords, emails, PDF/resume/code text)
 */

(function () {
    'use strict';

    // Sensitive field filter list to guarantee zero student data leakage
    const SENSITIVE_KEY_PATTERNS = [
        'password',
        'email',
        'mail',
        'user_email',
        'resume_text',
        'resume_content',
        'pdf_text',
        'pdf_content',
        'document_text',
        'document_content',
        'transcript',
        'source_code',
        'code_content',
        'full_code',
        'token',
        'auth_token',
        'secret',
        'api_key',
        'cookie',
        'note_text',
        'question_text',
        'answer_text',
        'feedback_text',
        'recording_data',
        'recording_url'
    ];

    const BTechPathAnalytics = {
        analyticsId: null,
        isConfigLoaded: false,
        isInitialized: false,
        lastTrackedPath: null,
        pendingEvents: [],

        /**
         * Initializes configuration and subscribes to consent updates
         */
        async init() {
            try {
                // 1. Resolve configuration from window global or /api/config
                if (window.__APP_CONFIG && window.__APP_CONFIG.ANALYTICS_ID) {
                    this.analyticsId = window.__APP_CONFIG.ANALYTICS_ID;
                    this.isConfigLoaded = true;
                } else {
                    const res = await fetch('/api/config');
                    if (res.ok) {
                        const config = await res.json();
                        if (config && config.analyticsId) {
                            this.analyticsId = config.analyticsId;
                        }
                    }
                    this.isConfigLoaded = true;
                }
            } catch (e) {
                console.warn('[Analytics] Config resolution skipped:', e.message);
                this.isConfigLoaded = true;
            }

            // 2. Check if configuration is blocked
            if (!this.analyticsId) {
                console.info('[Analytics] Configuration Status: BLOCKED CONFIGURATION. No production ANALYTICS_ID configured in environment.');
            }

            // 3. Connect with Consent Manager
            if (window.BTechPathConsent) {
                window.BTechPathConsent.onConsentChange((choices) => {
                    if (choices.analytics) {
                        this.enableTracking();
                    } else {
                        this.disableTracking();
                    }
                });

                if (window.BTechPathConsent.hasConsent('analytics')) {
                    this.enableTracking();
                }
            }

            // Track initial page view if document is loaded
            this.trackPageView(window.location.pathname, document.title);
        },

        /**
         * Enables and injects tracking scripts if valid ID and consent are present
         */
        enableTracking() {
            if (!this.analyticsId) {
                return; // Remains clean/idle if no valid ID
            }

            if (this.isInitialized) return;

            try {
                // Inject official Google Tag / Analytics loader
                const script = document.createElement('script');
                script.async = true;
                script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(this.analyticsId)}`;
                document.head.appendChild(script);

                window.dataLayer = window.dataLayer || [];
                function gtag() { window.dataLayer.push(arguments); }
                window.gtag = gtag;

                gtag('js', new Date());
                gtag('config', this.analyticsId, {
                    send_page_view: false, // We control page view firing explicitly to avoid duplicates
                    anonymize_ip: true
                });

                this.isInitialized = true;
                console.info('[Analytics] Analytics telemetry initialized with consent.');

                // Flush any buffered events
                while (this.pendingEvents.length > 0) {
                    const { eventName, safeParams } = this.pendingEvents.shift();
                    this.sendGtagEvent(eventName, safeParams);
                }
            } catch (err) {
                console.error('[Analytics] Failed to initialize script:', err);
            }
        },

        /**
         * Disables tracking when consent is revoked
         */
        disableTracking() {
            this.isInitialized = false;
            // Clear dataLayer if present
            if (window.dataLayer) {
                window.dataLayer = [];
            }
        },

        /**
         * Tracks a page view with deduplication
         * @param {string} path - URL path
         * @param {string} title - Page title
         */
        trackPageView(path = window.location.pathname, title = document.title) {
            if (this.lastTrackedPath === path) {
                return; // Prevent duplicate page views for the same navigation
            }
            this.lastTrackedPath = path;

            this.trackEvent('page_view', {
                page_path: path,
                page_title: title
            });
        },

        /**
         * Tracks a meaningful user event with strict privacy sanitization
         * @param {string} eventName - Name of the action (e.g. 'start_journey_cta_click')
         * @param {Object} params - Event parameters
         */
        trackEvent(eventName, params = {}) {
            const safeParams = this.sanitizeParams(params);

            // If tracking is active and initialized, dispatch
            if (this.isInitialized && typeof window.gtag === 'function') {
                this.sendGtagEvent(eventName, safeParams);
            } else {
                // Buffer if consent is pending
                if (this.pendingEvents.length < 20) {
                    this.pendingEvents.push({ eventName, safeParams });
                }
            }
        },

        sendGtagEvent(eventName, params) {
            try {
                if (typeof window.gtag === 'function') {
                    window.gtag('event', eventName, params);
                }
            } catch (e) {
                console.warn('[Analytics] Send failed:', e);
            }
        },

        /**
         * Deeply sanitizes parameters against personal and sensitive information
         * @param {Object} rawParams
         * @returns {Object}
         */
        sanitizeParams(rawParams) {
            if (!rawParams || typeof rawParams !== 'object') return {};
            const clean = {};

            for (const [key, value] of Object.entries(rawParams)) {
                const lowerKey = key.toLowerCase();
                const isSensitive = SENSITIVE_KEY_PATTERNS.some(p => lowerKey.includes(p));

                if (!isSensitive) {
                    // Only accept primitives (strings, numbers, booleans)
                    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                        // Limit string length to 100 chars to avoid accidental long text payloads
                        clean[key] = typeof value === 'string' ? value.slice(0, 100) : value;
                    }
                }
            }

            return clean;
        }
    };

    // Node & Browser compatibility
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BTechPathAnalytics;
    }
    if (typeof window !== 'undefined') {
        window.TechPathAnalytics = window.BTechPathAnalytics = BTechPathAnalytics;
        // Auto-run initialization
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => BTechPathAnalytics.init());
        } else {
            BTechPathAnalytics.init();
        }
    }
})();
