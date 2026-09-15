/**
 * BTechPath AI OS — Global Cookie & Privacy Consent Management Engine
 * Provides configurable, non-manipulative consent banners, granular preference controls,
 * and safe persistence without interfering with authentication credentials.
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'btechpath_cookie_consent';
    const CONSENT_VERSION = 1;

    const BTechPathConsent = {
        listeners: [],

        /**
         * Initializes the consent manager, checking stored choices
         */
        init() {
            const stored = this.getConsent();
            if (!stored || stored.version !== CONSENT_VERSION) {
                // Show banner after brief delay to avoid layout thrashing
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => this.renderBanner());
                } else {
                    setTimeout(() => this.renderBanner(), 600);
                }
            } else {
                this.notifyListeners(stored.choices);
            }
        },

        /**
         * Retrieves stored consent state
         * @returns {Object|null}
         */
        getConsent() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : null;
            } catch (e) {
                return null;
            }
        },

        /**
         * Checks if a specific category has consent
         * @param {'essential'|'analytics'|'advertising'} category
         */
        hasConsent(category) {
            if (category === 'essential') return true;
            const consent = this.getConsent();
            if (!consent || !consent.choices) return false;
            return Boolean(consent.choices[category]);
        },

        /**
         * Saves consent choices and hides UI
         * @param {Object} choices
         */
        setConsent(choices) {
            const record = {
                version: CONSENT_VERSION,
                timestamp: new Date().toISOString(),
                choices: {
                    essential: true, // Always required for platform operation
                    analytics: Boolean(choices.analytics),
                    advertising: Boolean(choices.advertising)
                }
            };

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
            } catch (e) {
                console.warn('[Consent] LocalStorage write failed:', e);
            }

            this.removeBanner();
            this.removeModal();
            this.updateLayoutOffset(0);
            this.notifyListeners(record.choices);

            window.dispatchEvent(new CustomEvent('btechpath-consent-updated', { detail: record.choices }));
        },

        /**
         * Registers a callback for consent changes
         */
        onConsentChange(callback) {
            if (typeof callback === 'function') {
                this.listeners.push(callback);
                const current = this.getConsent();
                if (current && current.choices) {
                    callback(current.choices);
                }
            }
        },

        notifyListeners(choices) {
            this.listeners.forEach(cb => {
                try { cb(choices); } catch (e) { console.error('[Consent] Listener error:', e); }
            });
        },

        /**
         * Renders the bottom cookie banner
         */
        renderBanner() {
            if (document.getElementById('btech-cookie-banner')) return;

            const banner = document.createElement('div');
            banner.id = 'btech-cookie-banner';
            banner.className = 'fixed bottom-0 inset-x-0 z-50 p-4 transition-all duration-300 transform translate-y-full';
            banner.style.paddingBottom = 'max(1rem, env(safe-area-inset-bottom, 1rem))';

            banner.innerHTML = `
                <div class="max-w-4xl mx-auto bg-[#121826]/95 backdrop-blur-md border border-[#2A3147] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div class="flex items-start gap-3.5">
                        <div class="w-10 h-10 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center text-[#7C5CFF] shrink-0 mt-0.5">
                            <span class="material-symbols-outlined text-2xl">cookie</span>
                        </div>
                        <div class="space-y-1">
                            <h3 class="text-sm font-bold text-[#F5F7FA]">Privacy & Cookies</h3>
                            <p class="text-xs text-[#A1A7BC] leading-relaxed max-w-2xl">
                                We use essential storage to operate TechPath and, where enabled, analytics technologies to understand and improve the platform experience.
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
                        <button type="button" id="btn-cookie-preferences" class="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#A1A7BC] hover:text-white hover:bg-[#1A2031] transition-colors">
                            Manage Preferences
                        </button>
                        <button type="button" id="btn-cookie-reject" class="px-4 py-2 rounded-xl bg-[#1A2031] hover:bg-[#21293D] border border-[#2A3147] text-xs font-semibold text-[#F5F7FA] transition-colors">
                            Reject Non-Essential
                        </button>
                        <button type="button" id="btn-cookie-accept" class="px-5 py-2 rounded-xl grad-indigo-btn text-xs font-bold text-white shadow-lg transition-all">
                            Accept All
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(banner);

            // Animate slide-up
            requestAnimationFrame(() => {
                banner.classList.remove('translate-y-full');
                banner.classList.add('translate-y-0');
                const height = banner.offsetHeight || 100;
                this.updateLayoutOffset(height);
            });

            // Wire actions
            banner.querySelector('#btn-cookie-accept').addEventListener('click', () => {
                this.setConsent({ analytics: true, advertising: true });
            });

            banner.querySelector('#btn-cookie-reject').addEventListener('click', () => {
                this.setConsent({ analytics: false, advertising: false });
            });

            banner.querySelector('#btn-cookie-preferences').addEventListener('click', () => {
                this.openPreferences();
            });
        },

        removeBanner() {
            const banner = document.getElementById('btech-cookie-banner');
            if (banner) {
                banner.classList.add('translate-y-full');
                setTimeout(() => banner.remove(), 300);
            }
        },

        updateLayoutOffset(height) {
            document.documentElement.style.setProperty('--cookie-banner-offset', `${height}px`);
            if (height > 0) {
                window.dispatchEvent(new CustomEvent('btechpath-cookie-visible', { detail: { height } }));
            } else {
                window.dispatchEvent(new CustomEvent('btechpath-cookie-hidden'));
            }
        },

        /**
         * Opens the granular consent preference modal
         */
        openPreferences() {
            if (document.getElementById('btech-cookie-modal')) return;

            const current = this.getConsent()?.choices || { essential: true, analytics: false, advertising: false };

            const modal = document.createElement('div');
            modal.id = 'btech-cookie-modal';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in';

            modal.innerHTML = `
                <div class="bg-[#121826] border border-[#2A3147] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
                    <div class="flex items-center justify-between pb-4 mb-5 border-b border-[#2A3147]">
                        <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center text-[#7C5CFF]">
                                <span class="material-symbols-outlined text-lg">tune</span>
                            </div>
                            <h3 class="text-base font-bold text-[#F5F7FA]">Cookie & Privacy Preferences</h3>
                        </div>
                        <button type="button" id="btn-close-pref-modal" class="p-1 rounded-lg text-[#A1A7BC] hover:text-white" aria-label="Close">
                            <span class="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>

                    <div class="space-y-4 mb-6 text-xs">
                        <!-- Essential -->
                        <div class="bg-[#1A2031]/70 border border-[#2A3147] rounded-2xl p-4 flex items-center justify-between gap-4">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="font-bold text-[#F5F7FA]">Essential Platform Storage</span>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Always Active</span>
                                </div>
                                <p class="text-[#A1A7BC]">Necessary for session tokens, dark mode preferences, and secure API requests.</p>
                            </div>
                            <input type="checkbox" checked disabled class="rounded border-[#2A3147] bg-[#121826] text-[#5865F2] cursor-not-allowed opacity-70">
                        </div>

                        <!-- Analytics -->
                        <div class="bg-[#1A2031]/70 border border-[#2A3147] rounded-2xl p-4 flex items-center justify-between gap-4">
                            <div>
                                <div class="font-bold text-[#F5F7FA] mb-1">Analytics Telemetry</div>
                                <p class="text-[#A1A7BC]">Helps us count page visits, traffic sources, and feature engagement without collecting personal data.</p>
                            </div>
                            <input type="checkbox" id="pref-opt-analytics" ${current.analytics ? 'checked' : ''} class="w-4 h-4 rounded border-[#2A3147] bg-[#121826] text-[#5865F2] focus:ring-[#5865F2]">
                        </div>

                        <!-- Advertising -->
                        <div class="bg-[#1A2031]/70 border border-[#2A3147] rounded-2xl p-4 flex items-center justify-between gap-4">
                            <div>
                                <div class="font-bold text-[#F5F7FA] mb-1">Advertising & Partner Integrations</div>
                                <p class="text-[#A1A7BC]">Allows public non-personalized educational sponsorship and internship announcements.</p>
                            </div>
                            <input type="checkbox" id="pref-opt-advertising" ${current.advertising ? 'checked' : ''} class="w-4 h-4 rounded border-[#2A3147] bg-[#121826] text-[#5865F2] focus:ring-[#5865F2]">
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-3 pt-2">
                        <button type="button" id="btn-pref-save" class="px-5 py-2.5 rounded-xl grad-indigo-btn text-xs font-bold text-white shadow-lg">
                            Save Preferences
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('#btn-close-pref-modal').addEventListener('click', () => this.removeModal());
            modal.querySelector('#btn-pref-save').addEventListener('click', () => {
                const analytics = modal.querySelector('#pref-opt-analytics').checked;
                const advertising = modal.querySelector('#pref-opt-advertising').checked;
                this.setConsent({ analytics, advertising });
            });
        },

        removeModal() {
            const modal = document.getElementById('btech-cookie-modal');
            if (modal) modal.remove();
        }
    };

    // Export
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BTechPathConsent;
    }
    if (typeof window !== 'undefined') {
        window.TechPathConsent = window.BTechPathConsent = BTechPathConsent;
        // Auto-run initialization
        BTechPathConsent.init();
    }
})();
