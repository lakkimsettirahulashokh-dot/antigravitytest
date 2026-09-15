/* ==========================================================================
   BTechPath AI OS — Paradrop Animated Download Engine
   "PRESS IT. THE RING BECOMES THE BAR."
   - Geometric SVG ring unrolling into a linear track
   - Paratrooper canopy physics descent with dynamic sway
   - Byte-stream pacing (fast small files pace smoothly)
   - Native integration with Resume, Study Packs, Settings, and Notes
   ========================================================================== */

(function () {
  'use strict';

  const Paradrop = {
    modalEl: null,
    activeAnimation: null,

    init() {
      this.injectModal();
      this.bindDownloadTriggers();
      window.Paradrop = this;
      console.log('🪂 Paradrop Animated Download Engine Initialized');
    },

    // 1. Unrolling Ring-to-Bar Geometry Generator
    generatePathData(morphP, width = 200, height = 112) {
      const cx = width / 2;
      const cy = 46;
      const R = 32;
      const L = 160; // Final bar track length
      const lineY = cy + 24;

      const numPoints = 36;
      const points = [];

      for (let i = 0; i <= numPoints; i++) {
        const u = i / numPoints;
        const angle = u * Math.PI * 2 - Math.PI / 2;

        // Coordinates on circle
        const rx = cx + R * Math.cos(angle);
        const ry = cy + R * Math.sin(angle);

        // Coordinates on straight bar
        const lineX = (cx - L / 2) + u * L;

        // Blend: "each point blends its place on the circle with its place on the line"
        const x = rx + (lineX - rx) * morphP;
        const y = ry + (lineY - ry) * morphP;

        points.push({ x, y });
      }

      // Build smooth SVG path
      let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
      }
      return d;
    },

    // 2. Inject Reusable Universal Paradrop Modal
    injectModal() {
      if (document.getElementById('paradrop-global-modal')) return;

      const modalHtml = `
        <div id="paradrop-global-modal" class="paradrop-modal-overlay" aria-hidden="true">
          <div class="paradrop-modal-card" role="dialog" aria-modal="true">
            <button type="button" class="paradrop-modal-close" id="paradrop-modal-close" aria-label="Close">
              <span class="material-symbols-outlined text-sm">close</span>
            </button>

            <div class="paradrop-modal-header">
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-mono text-teal-brand uppercase tracking-wider mb-2">
                <span>Secure Verified Stream</span>
              </div>
              <h3 id="paradrop-title" class="paradrop-modal-title">Preparing Download...</h3>
              <p id="paradrop-sub" class="paradrop-modal-sub">TechPath Asset Dispatcher</p>
            </div>

            <!-- Central Morphing Canvas / SVG -->
            <div class="paradrop-btn-wrapper" id="paradrop-interactive-zone">
              <svg id="paradrop-svg" class="paradrop-svg" width="200" height="112" viewBox="0 0 200 112">
                <!-- Background track -->
                <path id="paradrop-rail-bg" class="rail rail--bg" d="" pathLength="1"/>
                <!-- Glowing fill rail -->
                <path id="paradrop-rail-fill" class="rail rail--fill" d="" pathLength="1"/>

                <!-- Parachute Rig & Payload -->
                <g id="paradrop-rig" class="rig" transform="translate(100, 46)">
                  <!-- Canopy Dome & Shroud Suspension Lines -->
                  <g class="canopy">
                    <path class="canopy-fabric" d="M -20 -4 C -20 -22, 20 -22, 20 -4 C 12 -8, -12 -8, -20 -4 Z"/>
                    <path class="canopy-line" d="M -18 -4 L 0 8 M 0 -14 L 0 8 M 18 -4 L 0 8"/>
                  </g>
                  <!-- Payload Arrow -->
                  <path class="arrow" d="M 0 -7 L 0 7 M -5 2 L 0 7 L 5 2"/>
                  <!-- Success Checkmark -->
                  <path class="check" d="M -6 0 L -2 4 L 7 -5"/>
                </g>
              </svg>

              <div class="paradrop-meta">
                <span id="paradrop-file-name" class="paradrop-filename">file.pdf</span>
                <span id="paradrop-file-size" class="paradrop-filesize">0 KB / 0 KB (0%)</span>
                <span id="paradrop-status-text" class="paradrop-status-text">PRESS IT. THE RING BECOMES THE BAR.</span>
              </div>
            </div>
          </div>
        </div>
      `;

      const div = document.createElement('div');
      div.innerHTML = modalHtml;
      document.body.appendChild(div.firstElementChild);
      this.modalEl = document.getElementById('paradrop-global-modal');

      document.getElementById('paradrop-modal-close').addEventListener('click', () => {
        this.closeModal();
      });

      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) this.closeModal();
      });

      // Initial SVG path setup
      const initialD = this.generatePathData(0);
      document.getElementById('paradrop-rail-bg').setAttribute('d', initialD);
      document.getElementById('paradrop-rail-fill').setAttribute('d', initialD);
    },

    closeModal() {
      if (this.activeAnimation) {
        cancelAnimationFrame(this.activeAnimation);
        this.activeAnimation = null;
      }
      if (this.modalEl) {
        this.modalEl.classList.remove('is-open');
        this.modalEl.setAttribute('aria-hidden', 'true');
      }
    },

    // 3. Execution Pipeline with Physics & Byte Streaming
    startDownload(options = {}) {
      const {
        title = 'Downloading Asset...',
        filename = 'techpath_download.pdf',
        totalBytes = 85000,
        minMs = 1800, // Paced so fast ones can be read
        onStart = null,
        onPerformDownload = null,
        onComplete = null
      } = options;

      if (!this.modalEl) this.injectModal();

      const titleEl = document.getElementById('paradrop-title');
      const filenameEl = document.getElementById('paradrop-file-name');
      const filesizeEl = document.getElementById('paradrop-file-size');
      const statusEl = document.getElementById('paradrop-status-text');
      const railBg = document.getElementById('paradrop-rail-bg');
      const railFill = document.getElementById('paradrop-rail-fill');
      const rig = document.getElementById('paradrop-rig');

      titleEl.textContent = title;
      filenameEl.textContent = filename;
      filesizeEl.textContent = `0 KB / ${(totalBytes / 1024).toFixed(1)} KB (0%)`;
      statusEl.textContent = 'Unrolling stream conduit...';
      statusEl.classList.add('is-visible');

      // Reset rig state
      rig.classList.remove('is-deployed', 'is-complete');
      rig.setAttribute('transform', 'translate(100, 46)');
      railFill.style.strokeDashoffset = '1';

      this.modalEl.classList.add('is-open');
      this.modalEl.setAttribute('aria-hidden', 'false');

      if (onStart) onStart();

      const startTime = performance.now();
      const unrollDuration = 450; // ms to unroll ring into bar
      const dropDuration = minMs;

      let stage = 'unroll'; // 'unroll' -> 'stream' -> 'touchdown' -> 'complete'

      const animateStep = (now) => {
        const elapsed = now - startTime;

        if (stage === 'unroll') {
          const unrollProgress = Math.min(elapsed / unrollDuration, 1);
          // Cubic ease-out
          const easeP = 1 - Math.pow(1 - unrollProgress, 3);
          const pathD = this.generatePathData(easeP);
          railBg.setAttribute('d', pathD);
          railFill.setAttribute('d', pathD);

          if (unrollProgress >= 1) {
            stage = 'stream';
            rig.classList.add('is-deployed');
            statusEl.textContent = 'Stream payload in descent...';
          }
        }

        if (stage === 'stream' || stage === 'touchdown') {
          const streamElapsed = elapsed - unrollDuration;
          const streamProgress = Math.min(streamElapsed / dropDuration, 1);

          // Paced real stream
          const currentBytes = Math.floor(streamProgress * totalBytes);
          filesizeEl.textContent = `${(currentBytes / 1024).toFixed(1)} KB / ${(totalBytes / 1024).toFixed(1)} KB (${Math.floor(streamProgress * 100)}%)`;

          // Update fill rail
          railFill.style.strokeDashoffset = (1 - streamProgress).toFixed(4);

          // Paratrooper descent physics
          const startY = 46;
          const targetY = 62; // Lands right above the unrolled bar (lineY is 70)
          const currentY = startY + (targetY - startY) * streamProgress;

          // Gentle aerodynamic sway
          const sway = Math.sin(streamElapsed * 0.007) * 8 * (1 - streamProgress);
          rig.setAttribute('transform', `translate(100, ${currentY.toFixed(2)}) rotate(${sway.toFixed(2)})`);

          if (streamProgress >= 1 && stage !== 'touchdown') {
            stage = 'touchdown';
            rig.classList.remove('is-deployed');
            rig.classList.add('is-complete');
            statusEl.textContent = 'Touchdown verified. File ready!';

            // Execute actual file export / generation
            if (onPerformDownload) {
              try {
                onPerformDownload();
              } catch (err) {
                console.error('Download callback error:', err);
              }
            }

            if (onComplete) onComplete();

            // Auto-close after celebration
            setTimeout(() => {
              this.closeModal();
              // Reset ring path for next launch
              const resetD = this.generatePathData(0);
              railBg.setAttribute('d', resetD);
              railFill.setAttribute('d', resetD);
            }, 1600);
            return;
          }
        }

        this.activeAnimation = requestAnimationFrame(animateStep);
      };

      this.activeAnimation = requestAnimationFrame(animateStep);
    },

    // 4. Bind to All Known Download Elements in the OS
    bindDownloadTriggers() {
      // Intercept elements with data-paradrop or .paradrop-btn
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-paradrop], .paradrop-btn');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        const filename = btn.getAttribute('data-filename') || 'techpath_asset.pdf';
        const filesize = parseInt(btn.getAttribute('data-filesize') || '120000', 10);
        const title = btn.getAttribute('data-title') || 'Downloading Asset...';

        this.startDownload({
          title,
          filename,
          totalBytes: filesize,
          onPerformDownload: () => {
            const url = btn.getAttribute('data-url') || btn.getAttribute('href');
            if (url) {
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              a.click();
            }
          }
        });
      });
    }
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Paradrop.init());
  } else {
    Paradrop.init();
  }
})();
