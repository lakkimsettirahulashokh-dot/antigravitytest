/* ==========================================================================
   BTechPath AI OS — Husky Guardian & 3D Door Walk-Through Controller
   Inspired by: "Den — HTML · CSS · JS (Watch husky eyes! & Sign in is a door)"
   - Interactive SVG eye tracking based on text input and mouse
   - Paws cover eyes on password focus & peeks on reveal toggle
   - Multi-stage 3D door swing & walk-through stickman transition
   - Full support for Email and Phone Number authentication
   - Route guard synchronization & dashboard redirection
   ========================================================================== */

(function () {
  'use strict';

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const HuskyDoorAuth = {
    huskySvg: null,
    pupilLeft: null,
    pupilRight: null,
    huskyHead: null,
    doorBtn: null,
    passwordInp: null,
    togglePasswordBtn: null,
    isPasswordRevealed: false,
    authMode: 'email', // 'email' | 'phone'

    init() {
      this.huskySvg = document.getElementById('husky-mascot-svg');
      this.pupilLeft = document.getElementById('husky-pupil-left');
      this.pupilRight = document.getElementById('husky-pupil-right');
      this.huskyHead = document.getElementById('husky-head-group');
      this.doorBtn = document.getElementById('door-submit-btn');
      this.passwordInp = document.getElementById('auth-password');
      this.togglePasswordBtn = document.getElementById('toggle-password-visibility');

      this.bindInputs();
      this.bindTabs();
      this.bindFormSubmit();
      this.bindPasswordReveal();
    },

    // 1. Interactive Eye Tracking on Inputs
    bindInputs() {
      const trackableInputs = document.querySelectorAll('.husky-track-input');

      trackableInputs.forEach((inp) => {
        inp.addEventListener('input', (e) => {
          this.trackTextLength(e.target.value);
        });

        inp.addEventListener('focus', (e) => {
          if (this.huskySvg) {
            this.huskySvg.classList.remove('covering-eyes', 'is-peeking');
          }
          this.trackTextLength(e.target.value);
        });

        inp.addEventListener('blur', () => {
          this.resetPupils();
        });
      });

      // Password Focus: Husky covers eyes with paws!
      if (this.passwordInp) {
        this.passwordInp.addEventListener('focus', () => {
          if (!this.isPasswordRevealed && this.huskySvg) {
            this.huskySvg.classList.add('covering-eyes');
            this.huskySvg.classList.remove('is-peeking');
          }
        });

        this.passwordInp.addEventListener('blur', () => {
          if (this.huskySvg) {
            this.huskySvg.classList.remove('covering-eyes', 'is-peeking');
          }
        });
      }
    },

    trackTextLength(text) {
      if (!this.pupilLeft || !this.pupilRight) return;
      const len = (text || '').length;
      // Map length to pupil displacement (max ~6px left/right, 4px down)
      const maxLen = 32;
      const progress = Math.min(len / maxLen, 1);
      const offsetX = (progress - 0.5) * 8;
      const offsetY = Math.min(len * 0.3, 4);

      this.pupilLeft.setAttribute('transform', `translate(${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);
      this.pupilRight.setAttribute('transform', `translate(${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);

      if (this.huskyHead) {
        const rot = (progress - 0.5) * 4;
        this.huskyHead.setAttribute('transform', `rotate(${rot.toFixed(1)})`);
      }
    },

    resetPupils() {
      if (!this.pupilLeft || !this.pupilRight) return;
      this.pupilLeft.setAttribute('transform', 'translate(0, 0)');
      this.pupilRight.setAttribute('transform', 'translate(0, 0)');
      if (this.huskyHead) {
        this.huskyHead.setAttribute('transform', 'rotate(0)');
      }
    },

    // 2. Password Show / Hide Peek Feature
    bindPasswordReveal() {
      if (!this.togglePasswordBtn || !this.passwordInp) return;

      this.togglePasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.isPasswordRevealed = !this.isPasswordRevealed;
        this.passwordInp.type = this.isPasswordRevealed ? 'text' : 'password';

        const icon = this.togglePasswordBtn.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.textContent = this.isPasswordRevealed ? 'visibility_off' : 'visibility';
        }

        if (this.huskySvg) {
          if (this.isPasswordRevealed) {
            this.huskySvg.classList.remove('covering-eyes');
            this.huskySvg.classList.add('is-peeking');
          } else {
            this.huskySvg.classList.add('covering-eyes');
            this.huskySvg.classList.remove('is-peeking');
          }
        }
      });
    },

    // 3. Email vs Phone Number Tab Switching
    bindTabs() {
      const emailTab = document.getElementById('tab-email');
      const phoneTab = document.getElementById('tab-phone');
      const identifierInput = document.getElementById('auth-identifier');
      const identifierLabel = document.getElementById('auth-identifier-label');
      const phonePrefix = document.getElementById('phone-prefix-wrap');

      if (!emailTab || !phoneTab || !identifierInput) return;

      emailTab.addEventListener('click', (e) => {
        e.preventDefault();
        this.authMode = 'email';
        emailTab.classList.add('is-active');
        phoneTab.classList.remove('is-active');
        identifierLabel.textContent = 'Institutional / Personal Email';
        identifierInput.type = 'email';
        identifierInput.placeholder = 'alex.rivera@techpath.ai';
        if (phonePrefix) phonePrefix.classList.add('hidden');
        identifierInput.focus();
      });

      phoneTab.addEventListener('click', (e) => {
        e.preventDefault();
        this.authMode = 'phone';
        phoneTab.classList.add('is-active');
        emailTab.classList.remove('is-active');
        identifierLabel.textContent = 'Mobile Phone Number';
        identifierInput.type = 'tel';
        identifierInput.placeholder = '98765 43210';
        if (phonePrefix) phonePrefix.classList.remove('hidden');
        identifierInput.focus();
      });
    },

    // 4. Form Submit: Multi-Stage 3D Door Animation & Dashboard Redirect
    bindFormSubmit() {
      const form = document.getElementById('husky-auth-form');
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = this.doorBtn;
        const husky = this.huskySvg;
        const identifierInp = document.getElementById('auth-identifier');
        const passwordInp = document.getElementById('auth-password');
        const nameInp = document.getElementById('auth-fullname');
        const branchSelect = document.getElementById('auth-branch');
        const doorLabel = btn ? btn.querySelector('.doorbtn__label') : null;

        const identifier = (identifierInp?.value || '').trim();
        const password = passwordInp?.value || '';
        const fullName = (nameInp?.value || '').trim() || (this.authMode === 'email' ? identifier.split('@')[0] : 'Engineer ' + identifier.slice(-4));
        const branch = (branchSelect?.value || 'AIML');
        const isSignupPage = Boolean(nameInp || window.location.pathname.includes('signup'));

        if (!identifier || !password) {
          if (window.AuthManager) window.AuthManager.showToast('Please enter both identifier and password.', 'warning');
          return;
        }

        // Validate Mandatory Terms & Privacy Consent on Signup
        if (isSignupPage) {
          const consentCheckbox = document.getElementById('terms-consent-checkbox');
          const consentError = document.getElementById('consent-error-msg');
          if (consentCheckbox && !consentCheckbox.checked) {
            if (consentError) consentError.classList.remove('hidden');
            consentCheckbox.focus();
            if (window.AuthManager) window.AuthManager.showToast('Please agree to the Privacy Policy and Terms of Use to create your account.', 'error');
            return;
          }
          if (consentError) consentError.classList.add('hidden');
        }

        // --- DISABLE BUTTON & DISPLAY PROGRESS ---
        if (btn) btn.disabled = true;
        if (doorLabel) doorLabel.textContent = isSignupPage ? 'Creating account...' : 'Signing in...';

        try {
          if (!window.AuthManager) {
            throw new Error('Authentication manager is initializing. Please try again.');
          }

          let res;
          if (isSignupPage) {
            res = await window.AuthManager.handleSignupSubmit(e, {
              fullName,
              identifier,
              branch,
              password,
              mode: this.authMode
            });
          } else {
            res = await window.AuthManager.handleLoginSubmit(e, {
              identifier,
              password,
              mode: this.authMode
            });
          }

          // If authentication failed, restore button and halt immediately
          if (!res || !res.success) {
            if (btn) btn.disabled = false;
            if (doorLabel) doorLabel.textContent = isSignupPage ? 'Create account' : 'Sign in';
            if (husky) {
              husky.classList.remove('covering-eyes', 'is-peeking', 'is-happy');
            }
            return;
          }

          // --- AUTHENTICATION SUCCEEDED: RUN 3D DOOR ANIMATION ---
          if (btn) {
            btn.classList.add('dooropen');
            await wait(380);
            btn.classList.add('walking');
            btn.classList.add('out');
            await wait(600);
            btn.classList.remove('walking');
          }

          if (husky) {
            husky.classList.remove('covering-eyes', 'is-peeking');
            husky.classList.add('is-happy');
          }
        } catch (err) {
          console.error('[HuskyDoorAuth] Submit error:', err);
          if (btn) {
            btn.disabled = false;
            btn.classList.remove('dooropen', 'walking', 'out');
            if (doorLabel) doorLabel.textContent = isSignupPage ? 'Create account' : 'Sign in';
          }
          if (husky) {
            husky.classList.remove('is-happy', 'covering-eyes', 'is-peeking');
          }
        } finally {
          // If login did not succeed or threw, ensure button is not stuck in disabled state
          if (btn && doorLabel && doorLabel.textContent.includes('...')) {
            btn.disabled = false;
            doorLabel.textContent = isSignupPage ? 'Create account' : 'Sign in';
          }
        }
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HuskyDoorAuth.init());
  } else {
    HuskyDoorAuth.init();
  }

  window.HuskyDoorAuth = HuskyDoorAuth;
})();
