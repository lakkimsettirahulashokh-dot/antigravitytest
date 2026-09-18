/* ==========================================================================
   BTechPath AI OS — 3D 404 Interactive Motion & Navigation Controller
   - Damped 3D cursor parallax with cubic lerp smoothing
   - Robot head tilt & pupil tracking towards cursor
   - Intelligent fallback for "Go back" history navigation
   - Accessible & reduced-motion compliant
   ========================================================================== */

(function () {
  'use strict';

  const Page404 = {
    rig: null,
    pupils: [],
    head: null,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    isReducedMotion: false,
    rafId: null,

    init() {
      this.rig = document.getElementById('scene-3d-rig');
      this.pupils = [
        document.getElementById('robot-pupil-left'),
        document.getElementById('robot-pupil-right')
      ].filter(Boolean);
      this.head = document.getElementById('robot-head-group');

      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!this.isReducedMotion) {
        this.bindEvents();
        this.startLoop();
        this.startBlinkLoop();
      }

      // Expose fallback navigation globally
      window.handleGoBack = this.handleGoBack.bind(this);
    },

    bindEvents() {
      window.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth * 0.5;
        const cy = window.innerHeight * 0.5;
        // Normalized target range: -1 to +1
        this.mouse.targetX = (e.clientX - cx) / cx;
        this.mouse.targetY = (e.clientY - cy) / cy;
      }, { passive: true });

      window.addEventListener('mouseleave', () => {
        this.mouse.targetX = 0;
        this.mouse.targetY = 0;
      }, { passive: true });

      // Orientation tilt for mobile devices
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
          if (e.gamma !== null && e.beta !== null) {
            this.mouse.targetX = Math.max(-1, Math.min(1, e.gamma / 30));
            this.mouse.targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
          }
        }, { passive: true });
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.rafId) cancelAnimationFrame(this.rafId);
          this.rafId = null;
        } else if (!this.isReducedMotion) {
          this.startLoop();
        }
      });
    },

    startLoop() {
      if (this.rafId) cancelAnimationFrame(this.rafId);

      const render = () => {
        if (document.hidden) return;

        // Smooth cubic interpolation (damping factor 0.08)
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

        // 1. 3D Stage Tilt (max ~7 deg)
        if (this.rig) {
          const rotY = this.mouse.x * 7.5;
          const rotX = -this.mouse.y * 6.0;
          this.rig.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
        }

        // 2. Robot Pupil Tracking (max ~4.5px offset)
        if (this.pupils.length > 0) {
          const px = (this.mouse.x * 4.5).toFixed(2);
          const py = (this.mouse.y * 3.5).toFixed(2);
          this.pupils.forEach(p => {
            p.setAttribute('transform', `translate(${px}, ${py})`);
          });
        }

        // 3. Robot Head Inquisitive Tilt (max ~9 deg)
        if (this.head) {
          const headRotZ = (this.mouse.x * 8.5).toFixed(2);
          const headRotX = (-this.mouse.y * 5.0).toFixed(2);
          this.head.style.transform = `rotateZ(${headRotZ}deg) rotateX(${headRotX}deg)`;
        }

        this.rafId = requestAnimationFrame(render);
      };

      this.rafId = requestAnimationFrame(render);
    },

    // Gentle random blinking
    startBlinkLoop() {
      const eyeLeft = document.getElementById('eye-left-shape');
      const eyeRight = document.getElementById('eye-right-shape');
      if (!eyeLeft || !eyeRight) return;

      const triggerBlink = () => {
        if (document.hidden || this.isReducedMotion) {
          setTimeout(triggerBlink, 3000);
          return;
        }

        eyeLeft.setAttribute('ry', '1.5');
        eyeRight.setAttribute('ry', '1.5');

        setTimeout(() => {
          eyeLeft.setAttribute('ry', '8.5');
          eyeRight.setAttribute('ry', '8.5');
          const nextInterval = 3200 + Math.random() * 3000;
          setTimeout(triggerBlink, nextInterval);
        }, 160);
      };

      setTimeout(triggerBlink, 2800);
    },

    // Safe Intelligent History Navigation
    handleGoBack() {
      // Check if browser has valid prior history within same origin
      const hasPriorHistory = window.history.length > 1;
      const isSameOriginReferrer = document.referrer && document.referrer.startsWith(window.location.origin);

      if (hasPriorHistory && isSameOriginReferrer) {
        window.history.back();
      } else {
        // Safe graceful fallback to platform landing page
        window.location.href = 'index.html';
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Page404.init());
  } else {
    Page404.init();
  }
})();
