/**
 * BTechPath AI OS — Global Consistent Loading & Async State System
 * Provides unified, premium brand loaders, skeleton states, double-submission prevention,
 * and timeout-resilient retry handling across the platform.
 */

(function () {
    'use strict';

    const BTechPathLoading = {
        timeouts: new WeakMap(),

        /**
         * Shows a standardized branded loading overlay inside or over a container
         * @param {HTMLElement|string} target - Container element or selector
         * @param {Object} options - Configuration options
         * @param {string} options.message - Loading message (e.g. 'Processing...', 'Generating Notes...')
         * @param {number} options.timeout - Timeout in ms before showing retry state (default: 20000)
         * @param {Function} options.onRetry - Callback to invoke if user clicks Retry
         * @param {boolean} options.fullScreen - Whether to overlay the whole viewport
         */
        show(target, options = {}) {
            const container = typeof target === 'string' ? document.querySelector(target) : target;
            if (!container) return null;

            const message = options.message || 'Loading...';
            const timeoutMs = options.timeout || 20000;
            const onRetry = options.onRetry || null;
            const fullScreen = Boolean(options.fullScreen);

            // Remove any existing loader in this container
            this.hide(container);

            const overlay = document.createElement('div');
            overlay.className = `btech-loading-overlay ${fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-20'} flex flex-col items-center justify-center p-6 bg-[#0B0F19]/85 backdrop-blur-sm rounded-2xl transition-opacity duration-300`;
            overlay.setAttribute('role', 'status');
            overlay.setAttribute('aria-live', 'polite');

            overlay.innerHTML = `
                <div class="btech-loading-content flex flex-col items-center text-center max-w-sm">
                    <div class="spinner-brand w-10 h-10 mb-4"></div>
                    <p class="btech-loading-message text-sm font-semibold text-[#F5F7FA] tracking-wide mb-1">${this.escapeHtml(message)}</p>
                    <p class="text-xs text-[#A1A7BC]">Please hold on while we complete this action</p>
                </div>
            `;

            // Position container relatively if needed
            if (!fullScreen && getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
            }

            container.appendChild(overlay);

            // Setup timeout protection against infinite spinners
            if (timeoutMs > 0) {
                const timeoutId = setTimeout(() => {
                    this.showRetryState(overlay, message, onRetry);
                }, timeoutMs);

                this.timeouts.set(overlay, timeoutId);
            }

            return overlay;
        },

        /**
         * Replaces spinner with a timeout warning and Retry button
         */
        showRetryState(overlay, message, onRetry) {
            if (!overlay || !overlay.parentNode) return;

            const content = overlay.querySelector('.btech-loading-content');
            if (!content) return;

            content.innerHTML = `
                <div class="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                    <span class="material-symbols-outlined text-2xl">timer</span>
                </div>
                <h4 class="text-sm font-bold text-[#F5F7FA] mb-1">This is taking longer than expected</h4>
                <p class="text-xs text-[#A1A7BC] mb-4">The operation is still pending or may have timed out. You can retry now.</p>
                <div class="flex items-center gap-2">
                    <button type="button" class="btn-retry-action px-4 py-2 rounded-xl bg-[#1A2031] border border-[#2A3147] hover:bg-[#21293D] text-xs font-semibold text-[#F5F7FA] flex items-center gap-1.5 transition-colors">
                        <span class="material-symbols-outlined text-sm text-[#2DD4BF]">refresh</span>
                        <span>Retry</span>
                    </button>
                    <button type="button" class="btn-dismiss-action px-3 py-2 rounded-xl text-xs text-[#A1A7BC] hover:text-white transition-colors">
                        Cancel
                    </button>
                </div>
            `;

            const retryBtn = content.querySelector('.btn-retry-action');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    if (typeof onRetry === 'function') {
                        onRetry();
                    } else {
                        // Re-trigger standard show
                        overlay.remove();
                    }
                });
            }

            const dismissBtn = content.querySelector('.btn-dismiss-action');
            if (dismissBtn) {
                dismissBtn.addEventListener('click', () => {
                    this.hide(overlay.parentNode);
                });
            }
        },

        /**
         * Hides and removes the loading overlay
         * @param {HTMLElement|string} target
         */
        hide(target) {
            const container = typeof target === 'string' ? document.querySelector(target) : target;
            if (!container) return;

            const overlays = container.querySelectorAll('.btech-loading-overlay');
            overlays.forEach(overlay => {
                const timeoutId = this.timeouts.get(overlay);
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    this.timeouts.delete(overlay);
                }
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 250);
            });
        },

        /**
         * Sets button into loading state and prevents duplicate submissions
         * @param {HTMLButtonElement|string} btn - Button element or selector
         * @param {string} loadingText - Text to display (e.g. 'Sending message...')
         * @param {string} icon - Material Symbols icon name (e.g. 'hourglass_empty')
         */
        setButtonLoading(btn, loadingText = 'Processing...', icon = 'progress_activity') {
            const button = typeof btn === 'string' ? document.querySelector(btn) : btn;
            if (!button) return;

            if (!button.hasAttribute('data-original-html')) {
                button.setAttribute('data-original-html', button.innerHTML);
            }

            button.disabled = true;
            button.classList.add('opacity-80', 'cursor-not-allowed');

            button.innerHTML = `
                <div class="spinner-brand w-4 h-4 shrink-0 inline-block align-middle mr-2"></div>
                <span class="align-middle">${this.escapeHtml(loadingText)}</span>
            `;
        },

        /**
         * Resets button from loading state back to its original interactive state
         * @param {HTMLButtonElement|string} btn
         */
        resetButton(btn) {
            const button = typeof btn === 'string' ? document.querySelector(btn) : btn;
            if (!button) return;

            if (button.hasAttribute('data-original-html')) {
                button.innerHTML = button.getAttribute('data-original-html');
                button.removeAttribute('data-original-html');
            }

            button.disabled = false;
            button.classList.remove('opacity-80', 'cursor-not-allowed');
        },

        /**
         * Renders multi-step real pipeline indicator for AI Notes & Mock Interview
         * @param {HTMLElement|string} target
         * @param {Array<string>} stages - List of stage names
         * @param {number} activeIndex - Currently executing stage index
         */
        renderPipeline(target, stages, activeIndex = 0) {
            const container = typeof target === 'string' ? document.querySelector(target) : target;
            if (!container) return;

            container.innerHTML = `
                <div class="w-full bg-[#121826] border border-[#2A3147] rounded-2xl p-4 sm:p-5 shadow-lg">
                    <div class="flex items-center justify-between text-xs text-[#A1A7BC] mb-3">
                        <span class="font-bold text-[#F5F7FA]">AI Processing Stage</span>
                        <span>Stage ${Math.min(activeIndex + 1, stages.length)} of ${stages.length}</span>
                    </div>
                    <div class="grid grid-cols-${stages.length} gap-1.5 mb-4">
                        ${stages.map((stage, idx) => {
                            let barClass = 'bg-[#1A2031]';
                            if (idx < activeIndex) barClass = 'bg-[#2DD4BF]';
                            else if (idx === activeIndex) barClass = 'bg-gradient-to-r from-[#5865F2] to-[#7C5CFF] animate-pulse';
                            return `<div class="h-1.5 rounded-full ${barClass} transition-all"></div>`;
                        }).join('')}
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="spinner-brand w-5 h-5 shrink-0"></div>
                        <span class="text-xs sm:text-sm font-semibold text-[#F5F7FA]">${this.escapeHtml(stages[activeIndex] || 'Finalizing...')}</span>
                    </div>
                </div>
            `;
        },

        escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    };

    // Node & Browser compatibility
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BTechPathLoading;
    }
    if (typeof window !== 'undefined') {
        window.TechPathLoading = window.BTechPathLoading = BTechPathLoading;
    }
})();
