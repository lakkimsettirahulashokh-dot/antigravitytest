/* ==========================================================================
   BTechPath AI OS - Motion, 3D Depth & Particle Engine
   ========================================================================== */

const MotionSystem = {
  init() {
    this.initTiltEngine();
    this.initCounterEngine();
    this.initNeuralCanvas();
    this.initBorderGlow();
  },

  // 1. Subtle 3D Card Tilt Engine
  initTiltEngine() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    // Check if device supports hover
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    if (!supportsHover) return;

    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
      card.classList.add('tilt-card');

      const maxTilt = parseFloat(card.getAttribute('data-tilt-max')) || 8; // gentle angle

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((centerY - y) / centerY) * maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

        // Parallax for deep children
        const deepElements = card.querySelectorAll('[data-tilt-depth]');
        deepElements.forEach(el => {
          const depth = parseFloat(el.getAttribute('data-tilt-depth')) || 15;
          const moveX = ((x - centerX) / centerX) * depth;
          const moveY = ((y - centerY) / centerY) * depth;
          el.style.transform = `translate3d(${moveX.toFixed(1)}px, ${moveY.toFixed(1)}px, ${depth * 2}px)`;
        });
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        const deepElements = card.querySelectorAll('[data-tilt-depth]');
        deepElements.forEach(el => {
          el.style.transform = 'translate3d(0, 0, 0)';
        });
      });
    });
  },

  // 2. Mouse-Tracked Illuminated Borders
  initBorderGlow() {
    const glowElements = document.querySelectorAll('.border-glow-hover');
    glowElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  },

  // 3. Smooth Animated Counter Engine (IntersectionObserver)
  initCounterEngine() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-counter')) || 0;
          const prefix = el.getAttribute('data-counter-prefix') || '';
          const suffix = el.getAttribute('data-counter-suffix') || '';
          const isDecimal = target % 1 !== 0;
          const duration = 1600;
          const startTime = performance.now();

          const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = progress * target;

            if (isDecimal) {
              el.textContent = `${prefix}${currentVal.toFixed(1)}${suffix}`;
            } else {
              el.textContent = `${prefix}${Math.floor(currentVal).toLocaleString()}${suffix}`;
            }

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              el.textContent = `${prefix}${isDecimal ? target.toFixed(1) : target.toLocaleString()}${suffix}`;
            }
          };

          requestAnimationFrame(updateCount);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(c => observer.observe(c));
  },

  // 4. Unified Real 3D Background Engine Integration
  initNeuralCanvas() {
    const canvas = document.getElementById('neural-mesh-canvas');
    if (canvas) {
      canvas.style.display = 'none'; // Replaced by real-3D background engine
    }
  },

  // 5. Interactive 3D Flashcard System
  initFlashcardDeck(deckData) {
    let currentIndex = 0;
    const cardInner = document.getElementById('flashcard-inner');
    const questionEl = document.getElementById('card-question');
    const categoryEl = document.getElementById('card-category');
    const answerEl = document.getElementById('card-answer');
    const formulaEl = document.getElementById('card-formula');
    const progressEl = document.getElementById('deck-progress');
    const countEl = document.getElementById('card-counter');

    if (!cardInner) return;

    const renderCard = (index) => {
      const data = deckData[index];
      cardInner.classList.remove('is-flipped');
      if (questionEl) questionEl.innerHTML = data.question;
      if (categoryEl) categoryEl.textContent = data.category;
      if (answerEl) answerEl.innerHTML = data.answer;
      if (formulaEl) formulaEl.innerHTML = data.formula || '';
      if (countEl) countEl.textContent = `${index + 1} / ${deckData.length}`;
      if (progressEl) progressEl.style.width = `${((index + 1) / deckData.length) * 100}%`;
    };

    renderCard(currentIndex);

    // Click to flip
    cardInner.parentElement.addEventListener('click', (e) => {
      // Ignore if clicking a button inside
      if (e.target.closest('button')) return;
      cardInner.classList.toggle('is-flipped');
    });

    // Rating buttons advance
    window.rateCard = (rating) => {
      AuthManager.showToast(`Card rated "${rating}". Spaced repetition scheduled.`, 'info');
      cardInner.classList.remove('is-flipped');
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % deckData.length;
        renderCard(currentIndex);
      }, 300);
    };
  },

  // 6. Interactive Roadmap Node Progression
  toggleRoadmapNode(nodeElement, nextNodeId, pathId) {
    const isCompleted = nodeElement.classList.contains('node-completed');
    if (!isCompleted) {
      nodeElement.classList.add('node-completed');
      nodeElement.innerHTML = '✓';
      nodeElement.classList.remove('bg-surface-container-high', 'text-primary');
      nodeElement.classList.add('bg-tertiary-container', 'text-white', 'border-tertiary');

      // Animate connecting path
      const path = document.getElementById(pathId);
      if (path) {
        path.classList.remove('roadmap-energy-path');
        path.classList.add('roadmap-energy-path-active');
        path.setAttribute('stroke', '#3cddc7');
      }

      // Unlock next node
      const nextNode = document.getElementById(nextNodeId);
      if (nextNode) {
        nextNode.classList.remove('opacity-50', 'pointer-events-none');
        nextNode.classList.add('animate-pulse');
      }

      AuthManager.showToast('Milestone Achieved! +250 XP earned. Energy flowing to next phase.', 'success');
      
      // Increment XP in UI
      const user = AuthManager.getUser();
      if (user) {
        user.xp = (user.xp || 3850) + 250;
      }
    }
  },

  // 7. Interactive Daily Task Completion
  completeDailyTask(checkbox, xpPoints = 50) {
    if (checkbox.checked) {
      AuthManager.showToast(`Task Complete! +${xpPoints} XP earned. Streak maintained! 🔥`, 'success');
      const user = AuthManager.getUser();
      if (user) {
        user.xp = (user.xp || 3850) + xpPoints;
        AuthManager.setUser(user);
        App.updateUserContext();
      }
    }
  },

  // 8. Universal Android Material Ripple Engine
  initRippleEngine() {
    document.addEventListener('pointerdown', (e) => {
      // Only target atomic buttons and interactive controls, never cards or scrollable layout sections
      const target = e.target.closest('button, a.btn, .tap-effect, .grad-indigo-btn, .btn-secondary, [role="button"]');
      if (!target || target.disabled) return;

      const rect = target.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height) * 2;
      const radius = diameter / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-wave';
      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - rect.left - radius}px`;
      ripple.style.top = `${e.clientY - rect.top - radius}px`;

      // Safe containment without affecting page scroll
      const isCard = target.classList.contains('glass-card') || target.classList.contains('card');
      if (isCard) return; // Do not alter overflow on card containers

      if (getComputedStyle(target).position === 'static') {
        target.style.position = 'relative';
      }
      if (getComputedStyle(target).overflow === 'visible') {
        target.style.overflow = 'hidden';
      }

      target.appendChild(ripple);

      setTimeout(() => {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 500);
    }, { passive: true });
  }
};

// ==============================================================================
// TechPath Universal Loading Skeleton Engine
// ==============================================================================
const TechPathSkeleton = {
  renderCards(count = 3) {
    return Array.from({ length: count }, () => `
      <div class="skeleton-card space-y-4">
        <div class="flex items-center gap-3">
          <div class="skeleton skeleton-avatar"></div>
          <div class="space-y-2 flex-1">
            <div class="skeleton skeleton-text" style="width: 50%;"></div>
            <div class="skeleton skeleton-text" style="width: 30%; height: 0.75em;"></div>
          </div>
        </div>
        <div class="space-y-2 pt-2">
          <div class="skeleton skeleton-text" style="width: 90%;"></div>
          <div class="skeleton skeleton-text" style="width: 75%;"></div>
          <div class="skeleton skeleton-text" style="width: 60%;"></div>
        </div>
        <div class="pt-4 flex items-center justify-between border-t border-[#2A3147]/50">
          <div class="skeleton skeleton-button" style="width: 80px; height: 32px;"></div>
          <div class="skeleton skeleton-button" style="width: 100px; height: 32px;"></div>
        </div>
      </div>
    `).join('');
  },

  renderList(count = 4) {
    return Array.from({ length: count }, () => `
      <div class="p-4 rounded-2xl bg-[#121826] border border-[#2A3147] flex items-center justify-between gap-4">
        <div class="flex items-center gap-3.5 flex-1">
          <div class="skeleton skeleton-avatar" style="width: 36px; height: 36px;"></div>
          <div class="space-y-1.5 flex-1">
            <div class="skeleton skeleton-text" style="width: 45%;"></div>
            <div class="skeleton skeleton-text" style="width: 25%; height: 0.7em;"></div>
          </div>
        </div>
        <div class="skeleton skeleton-button" style="width: 90px; height: 32px;"></div>
      </div>
    `).join('');
  },

  attach(container, type = 'cards', count = 3) {
    if (!container) return;
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    if (type === 'cards') {
      el.innerHTML = `<div class="skeleton-grid">${this.renderCards(count)}</div>`;
    } else if (type === 'list') {
      el.innerHTML = `<div class="space-y-3">${this.renderList(count)}</div>`;
    }
  }
};

window.TechPathSkeleton = TechPathSkeleton;

document.addEventListener('DOMContentLoaded', () => {
  MotionSystem.init();
  MotionSystem.initRippleEngine();

  // Auto-fill any elements declared with data-skeleton
  document.querySelectorAll('[data-skeleton]').forEach(el => {
    const type = el.getAttribute('data-skeleton') || 'cards';
    const count = parseInt(el.getAttribute('data-skeleton-count') || '3', 10);
    TechPathSkeleton.attach(el, type, count);
  });
});

