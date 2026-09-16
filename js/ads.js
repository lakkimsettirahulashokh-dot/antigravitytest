/* ==============================================================================
   BTechPath AI OS — Centralized Google Ads Engine
   Dual-Architecture Support:
     1. Web / PWA (Current Runtime): Real Google AdSense (adsbygoogle.js)
     2. Native Wrappers (Capacitor/Cordova): Mobile Ads SDK (AdMob)
   Configured Identifiers:
     - AdMob App ID:    ca-app-pub-2659485988975906~5542995898
     - Web Publisher:   ca-pub-2659485988975906
     - Ad Unit 1:       2120907009 (reviews_bottom, career, ai-notes, default)
     - Ad Unit 2:       2836941504 (dashboard_bottom, internships, learnhub)
     - Ad Unit 3:       1414329992 (skills, roadmap, projects)
   Zero Fake Ads:
     - Never renders fake static cards or dummy placeholders.
     - Uses official Google data-adtest="on" during development/test mode.
     - Dispatches genuine Google AdSense ad requests in production.
   Zero Layout Shift (CLS):
     - Reserved min-height (90px) responsive containers.
     - IntersectionObserver lazy loading with visibility & width verification.
   ============================================================================== */

(function(window) {
    'use strict';

    const AdService = {
        config: {
            enabled: true,
            appId: 'ca-app-pub-4576597124085942~9258254900',
            publisherId: 'ca-pub-4576597124085942',
            testMode: false,
            isDev: false,
            slots: {
                branch_learning_bottom: '1850538175',
                learnhub_bottom: '1850538175',
                reviews_bottom: '1850538175',
                career_discovery_boundary: '1850538175',
                ai_notes_bottom: '1850538175',
                dashboard_bottom: '1850538175',
                internships_boundary: '1850538175',
                skills_content_boundary: '1850538175',
                roadmap_boundary: '1850538175',
                projects_bottom: '1850538175',
                default: '1850538175'
            },
            placements: {
                branch_learning_bottom: true,
                learnhub_bottom: true,
                reviews_bottom: true,
                dashboard_bottom: true,
                skills_content_boundary: true,
                career_discovery_boundary: true,
                internships_boundary: true,
                roadmap_boundary: true,
                projects_bottom: true,
                ai_notes_bottom: true
            }
        },

        platform: {
            isNative: false,
            wrapperType: 'none',
            name: 'Web / PWA (Browser Runtime)'
        },

        stats: {
            requestsAttempted: 0,
            impressionsServed: 0,
            unfilledSlots: [],
            errors: []
        },

        initialized: false,
        observer: null,
        mutationObserver: null,
        adSenseScriptLoaded: false,
        scriptBlocked: false,

        // Forbidden UI areas where ads MUST NEVER appear
        FORBIDDEN_SELECTORS: [
            '#review-modal',
            '#review-form',
            '.modal',
            'form',
            '#flashcard-container',
            '.flashcard',
            '#quiz-modal',
            '#active-quiz',
            '.quiz-question',
            '#doubt-solver-container',
            '#doubt-solver',
            '.study-timer',
            '#study-timer',
            '.pdf-upload-zone',
            '#pdf-upload-zone',
            '#resume-preview-sheet',
            '.resume-editor',
            'header',
            'nav',
            '.camera-container',
            '.interview-interface'
        ],

        init() {
            if (this.initialized) return;
            this.initialized = true;

            // 1. Audit Platform Architecture
            this.detectPlatform();

            // 2. Detect local development vs production domain
            const hostname = window.location.hostname;
            this.config.isDev = (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '' || window.location.protocol === 'file:');

            // 3. Fetch remote configuration from server
            this.fetchConfig();

            // 4. Setup IntersectionObserver for zero CLS lazy loading
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver((entries, obs) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const el = entry.target;
                            obs.unobserve(el);
                            this.renderAdInElement(el);
                        }
                    });
                }, { rootMargin: '200px 0px', threshold: 0.05 });
            }

            // 5. Register Custom HTML Elements
            this.registerCustomElements();

            // 6. SPA and DOM Mutation Watcher
            this.setupSPAListeners();

            // 7. Mount initial ads on DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.scanAndMount());
            } else {
                this.scanAndMount();
            }

            console.log(`[AdService] Initialized on ${this.platform.name} (Dev/Test: ${this.config.isDev}, Publisher: ${this.config.publisherId})`);
        },

        detectPlatform() {
            if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
                this.platform = { isNative: true, wrapperType: 'capacitor', name: 'Capacitor Native Container' };
            } else if (window.cordova || window.PhoneGap) {
                this.platform = { isNative: true, wrapperType: 'cordova', name: 'Cordova Native Container' };
            } else if (window.AndroidBridge || (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.adMobBridge)) {
                this.platform = { isNative: true, wrapperType: 'webview-bridge', name: 'Native WebView Bridge' };
            } else {
                this.platform = { isNative: false, wrapperType: 'none', name: 'Web / PWA (Browser Runtime)' };
            }
        },

        async fetchConfig() {
            try {
                const res = await fetch('/api/ads/config');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.config) {
                        this.config.enabled = data.config.ads_enabled !== false;
                        if (data.config.app_id) this.config.appId = data.config.app_id;
                        if (data.config.publisher_id) this.config.publisherId = data.config.publisher_id;
                        if (data.config.test_mode !== undefined) this.config.testMode = data.config.test_mode;
                        if (data.config.slots) this.config.slots = { ...this.config.slots, ...data.config.slots };
                        if (data.config.placements) this.config.placements = { ...this.config.placements, ...data.config.placements };
                    }
                }
            } catch (e) {
                // Fallbacks already in memory
            }
        },

        registerCustomElements() {
            const self = this;

            class AdComponent extends HTMLElement {
                connectedCallback() {
                    if (self.observer) {
                        self.observer.observe(this);
                    } else {
                        self.renderAdInElement(this);
                    }
                }
                disconnectedCallback() {
                    if (self.observer) {
                        self.observer.unobserve(this);
                    }
                }
            }

            if (!customElements.get('ad-banner')) customElements.define('ad-banner', class extends AdComponent {});
            if (!customElements.get('ad-container')) customElements.define('ad-container', class extends AdComponent {});
            if (!customElements.get('advertisement-unit')) customElements.define('advertisement-unit', class extends AdComponent {});
        },

        setupSPAListeners() {
            // Re-scan when client-side routing happens
            window.addEventListener('popstate', () => this.scanAndMount());
            window.addEventListener('hashchange', () => this.scanAndMount());

            // Observe dynamic DOM changes for newly injected ad components
            if ('MutationObserver' in window && document.body) {
                this.mutationObserver = new MutationObserver((mutations) => {
                    let hasNewAds = false;
                    for (const m of mutations) {
                        if (m.addedNodes && m.addedNodes.length) {
                            for (const node of m.addedNodes) {
                                if (node.nodeType === 1) {
                                    if (node.matches && (node.matches('ad-banner, ad-container, advertisement-unit') || node.querySelector('ad-banner, ad-container, advertisement-unit'))) {
                                        hasNewAds = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (hasNewAds) break;
                    }
                    if (hasNewAds) this.scanAndMount();
                });
                this.mutationObserver.observe(document.body, { childList: true, subtree: true });
            }
        },

        scanAndMount() {
            const tags = ['ad-banner', 'ad-container', 'advertisement-unit', '.btechpath-ad-slot'];
            tags.forEach(tag => {
                document.querySelectorAll(tag).forEach(el => {
                    if (!el.dataset.adMounted) {
                        if (this.observer) {
                            this.observer.observe(el);
                        } else {
                            this.renderAdInElement(el);
                        }
                    }
                });
            });
        },

        isLocationForbidden(element) {
            for (const selector of this.FORBIDDEN_SELECTORS) {
                if (element.closest(selector)) {
                    console.warn(`[AdService] Placement rejected: strictly forbidden UX boundary (${selector})`);
                    return true;
                }
            }
            return false;
        },

        renderAdInElement(element) {
            if (element.dataset.adMounted) return;
            element.dataset.adMounted = 'true';

            // 1. Placement validation
            const placement = element.getAttribute('placement') || element.dataset.placement || 'default';
            if (!this.config.enabled || this.config.placements[placement] === false) {
                this.collapseElement(element, 'Placement disabled by configuration');
                return;
            }

            // 2. Strict UX safety rules
            if (this.isLocationForbidden(element)) {
                this.collapseElement(element, 'Forbidden form or modal boundary');
                return;
            }

            // 3. Prevent rendering in detached or completely invisible elements
            if (!element.isConnected) {
                return;
            }

            const format = element.getAttribute('format') || element.dataset.format || 'horizontal';
            const slotId = this.config.slots[placement] || this.config.slots.default;
            const isTest = this.config.isDev || this.config.testMode;

            // Apply base container styling to prevent Cumulative Layout Shift
            element.setAttribute('data-ad-state', 'loading');
            element.style.display = 'block';
            element.style.minHeight = format === 'card' ? '250px' : '90px';
            element.style.width = '100%';
            element.style.maxWidth = '100%';
            element.style.overflow = 'hidden';
            element.style.textAlign = 'center';
            element.style.transition = 'opacity 0.3s ease, min-height 0.3s ease';

            if (this.platform.isNative) {
                this.renderNativeAdMob(element, placement, slotId, format, isTest);
            } else {
                this.renderGoogleAdSense(element, placement, slotId, format, isTest);
            }
        },

        renderNativeAdMob(element, placement, slotId, format, isTest) {
            console.log(`[AdService] Dispatching Mobile Ads SDK banner for Native wrapper: Unit=${slotId}, Test=${isTest}`);
            try {
                if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
                    window.Capacitor.Plugins.AdMob.showBanner({
                        adId: slotId,
                        isTesting: isTest
                    });
                    element.setAttribute('data-ad-state', 'loaded');
                    this.stats.requestsAttempted++;
                }
            } catch (err) {
                console.warn('[AdService] Native AdMob bridge error:', err);
                element.setAttribute('data-ad-state', 'error');
                this.stats.errors.push(err.message);
            }
        },

        renderGoogleAdSense(element, placement, slotId, format, isTest) {
            try {
                // Ensure the official Google AdSense library is injected
                this.ensureAdSenseScript();

                // Build real Google AdSense <ins> markup (NO fake dummy cards)
                element.innerHTML = `
                    <div class="btechpath-ad-wrapper" style="min-height: 90px; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 12px 0;">
                        <span class="text-[9px] font-mono text-[#A1A7BC] uppercase tracking-wider mb-1" style="display: block; opacity: 0.65;">Advertisement</span>
                        <ins class="adsbygoogle"
                             style="display:block; min-height: 90px; width: 100%; text-align:center;"
                             data-ad-client="${this.config.publisherId}"
                             data-ad-slot="${slotId}"
                             data-ad-format="auto"
                             data-full-width-responsive="true"
                             ${isTest ? 'data-adtest="on"' : ''}>
                        </ins>
                    </div>
                `;

                // If element has zero width right now (e.g. unrendered tab), wait for visibility before push
                const executePush = () => {
                    try {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                        this.stats.requestsAttempted++;
                        console.info(`[AdService] Google AdSense request dispatched: Slot ${slotId} (Mode: ${isTest ? 'Official Google Test Ads' : 'Live Production Ads'})`);
                    } catch (pushErr) {
                        console.warn('[AdService] Google AdSense push error:', pushErr.message);
                        element.setAttribute('data-ad-state', 'error');
                        this.stats.errors.push(pushErr.message);
                    }
                };

                if (element.clientWidth > 0) {
                    executePush();
                } else {
                    // Poll briefly until container has valid non-zero dimensions
                    let checks = 0;
                    const checkInterval = setInterval(() => {
                        checks++;
                        if (element.clientWidth > 0) {
                            clearInterval(checkInterval);
                            executePush();
                        } else if (checks > 10) {
                            clearInterval(checkInterval);
                            executePush();
                        }
                    }, 200);
                }

                // Monitor response: distinguish ad-blocker vs unfilled inventory
                setTimeout(() => {
                    const ins = element.querySelector('ins.adsbygoogle');
                    if (ins) {
                        const status = ins.getAttribute('data-ad-status');
                        if (status === 'unfilled') {
                            console.info(`[AdService] Google ad response: 'unfilled' for slot ${slotId}. (Google has no active fill for this domain/origin).`);
                            this.stats.unfilledSlots.push(placement);
                            element.setAttribute('data-ad-state', 'unfilled');
                            this.collapseElement(element, 'Google AdSense unfilled');
                        } else if (status === 'filled') {
                            element.setAttribute('data-ad-state', 'loaded');
                            this.stats.impressionsServed++;
                            console.info(`[AdService] Google ad rendered successfully for slot ${slotId}`);
                        }
                    }
                }, 3500);

            } catch (err) {
                console.warn('[AdService] Failed to initialize ad slot:', err.message);
                element.setAttribute('data-ad-state', 'error');
                this.stats.errors.push(err.message);
                this.collapseElement(element, err.message);
            }
        },

        ensureAdSenseScript() {
            if (this.adSenseScriptLoaded) return;

            const existing = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
            if (existing) {
                this.adSenseScriptLoaded = true;
                return;
            }

            const script = document.createElement('script');
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.publisherId}`;

            script.onload = () => {
                this.adSenseScriptLoaded = true;
                console.log('[AdService] Google AdSense SDK script loaded successfully.');
            };

            script.onerror = () => {
                this.scriptBlocked = true;
                console.warn('[AdService] Google AdSense script blocked or failed to load (AdBlocker / Network block). Collapsing ad slots cleanly.');
                document.querySelectorAll('ad-banner, ad-container, advertisement-unit').forEach(el => {
                    this.collapseElement(el, 'Client AdBlocker active');
                });
            };

            document.head.appendChild(script);
            this.adSenseScriptLoaded = true;
        },

        collapseElement(element, reason = '') {
            if (!element) return;
            if (!element.getAttribute('data-ad-state') || element.getAttribute('data-ad-state') === 'loading') {
                element.setAttribute('data-ad-state', 'collapsed');
            }
            element.style.minHeight = '0';
            element.style.height = '0';
            element.style.opacity = '0';
            element.style.margin = '0';
            element.style.padding = '0';
            element.style.overflow = 'hidden';
            setTimeout(() => {
                element.style.display = 'none';
                if (reason) console.log(`[AdService] Ad container cleanly hidden: ${reason}`);
            }, 300);
        },

        getDiagnostics() {
            return {
                initialized: this.initialized,
                platform: this.platform,
                config: {
                    appId: this.config.appId,
                    publisherId: this.config.publisherId,
                    testMode: this.config.testMode,
                    isDev: this.config.isDev,
                    slots: this.config.slots,
                    placements: this.config.placements
                },
                scriptLoaded: this.adSenseScriptLoaded,
                scriptBlocked: this.scriptBlocked,
                stats: this.stats,
                mountedCount: document.querySelectorAll('ad-banner, ad-container, advertisement-unit').length
            };
        }
    };

    // Auto-initialize
    AdService.init();

    // Export globally
    window.AdService = AdService;

})(window);
