/* ==========================================================================
   BTechPath AI OS - 3D Career Path & Educational Node Scene
   Lightweight, high-performance Canvas 3D WebGL / Vector Orbital Engine
   Represents the 4 Core Pillars:
   [1] Learning -> [2] Skills -> [3] Projects -> [4] Career
   Interactive: Mouse parallax, orbital nodes, ambient glowing connectors
   ========================================================================== */

const Hero3D = {
  canvas: null,
  ctx: null,
  animationFrameId: null,
  width: 0,
  height: 0,
  mouseX: 0,
  mouseY: 0,
  targetMouseX: 0,
  targetMouseY: 0,
  angleX: 0,
  angleY: 0,
  lastFrameTime: 0,

  // Pillars of the BTechPath AI Journey
  pillars: [
    { label: 'Learning', color: '#5865F2', radius: 14, x: 0, y: 0, z: 0, angle: 0, orbitRadius: 180, speed: 0.008, icon: 'menu_book' },
    { label: 'Skills',   color: '#7C5CFF', radius: 14, x: 0, y: 0, z: 0, angle: Math.PI * 0.5, orbitRadius: 180, speed: 0.008, icon: 'code' },
    { label: 'Projects', color: '#2DD4BF', radius: 14, x: 0, y: 0, z: 0, angle: Math.PI, orbitRadius: 180, speed: 0.008, icon: 'terminal' },
    { label: 'Career',   color: '#F6C177', radius: 14, x: 0, y: 0, z: 0, angle: Math.PI * 1.5, orbitRadius: 180, speed: 0.008, icon: 'work' }
  ],

  // Background floating ambient particles
  particles: [],

  init(canvasId = 'hero-3d-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.initParticles();
    this.bindEvents();
    this.animate();
  },

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 600;
    this.height = rect.height || 420;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  },

  initParticles() {
    this.particles = [];
    // Subtle structural caliper ticks instead of random particles
    const ringRadii = [80, 140, 220];
    ringRadii.forEach((r, rIdx) => {
      const tickCount = 12;
      for (let i = 0; i < tickCount; i++) {
        const ang = (i / tickCount) * Math.PI * 2;
        this.particles.push({
          angle: ang,
          baseRadius: r,
          color: rIdx === 0 ? '#5865F2' : (rIdx === 1 ? '#7C5CFF' : '#2DD4BF'),
          size: 1.5,
          z: (rIdx - 1) * 60
        });
      }
    });
  },

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initParticles();
    });

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isReduced) {
      window.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        this.targetMouseX = (e.clientX - cx) * 0.0008;
        this.targetMouseY = (e.clientY - cy) * 0.0008;
      });
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      } else {
        this.animate();
      }
    });
  },

  animate(now = performance.now()) {
    if (document.hidden) return;
    this.animationFrameId = requestAnimationFrame((t) => this.animate(t));

    // Cap to 60 FPS (~16.6ms) to eliminate frame churn
    if (now - this.lastFrameTime < 16) {
      return;
    }
    this.lastFrameTime = now;

    // Check reduced motion
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Smooth mouse parallax
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    this.ctx.clearRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const fov = 350;

    // Draw Central BTechPath AI Core Hub
    const coreGrad = this.ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, 55);
    coreGrad.addColorStop(0, 'rgba(124, 92, 255, 0.85)');
    coreGrad.addColorStop(0.5, 'rgba(88, 101, 242, 0.4)');
    coreGrad.addColorStop(1, 'rgba(11, 15, 25, 0)');

    this.ctx.fillStyle = coreGrad;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 55, 0, Math.PI * 2);
    this.ctx.fill();

    // Central Core Pulse Ring
    this.ctx.strokeStyle = 'rgba(124, 92, 255, 0.4)';
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 4]);
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 38 + Math.sin(Date.now() * 0.003) * 3, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Central Text Label
    this.ctx.fillStyle = '#F5F7FA';
    this.ctx.font = 'bold 12px "Geist", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('AI CORE', centerX, centerY);

    // Update & Project 4 Pillars
    const projectedPillars = this.pillars.map((p) => {
      if (!isReduced) {
        p.angle += p.speed;
      }
      // Elliptical 3D orbit
      const rx = p.orbitRadius;
      const ry = p.orbitRadius * 0.45;

      let x3d = Math.cos(p.angle) * rx;
      let y3d = Math.sin(p.angle) * ry;
      let z3d = Math.sin(p.angle) * 120;

      // Apply 3D perspective rotation with mouse
      const cosY = Math.cos(this.mouseX);
      const sinY = Math.sin(this.mouseX);
      const xRot = x3d * cosY - z3d * sinY;
      const zRot = z3d * cosY + x3d * sinY;

      const cosX = Math.cos(this.mouseY);
      const sinX = Math.sin(this.mouseY);
      const yRot = y3d * cosX - zRot * sinX;
      const zFinal = zRot * cosX + y3d * sinX;

      const scale = fov / (fov + zFinal);
      const px = centerX + xRot * scale;
      const py = centerY + yRot * scale;

      return {
        ...p,
        px,
        py,
        scale,
        z: zFinal
      };
    });

    // Sort pillars by Z depth (back-to-front rendering)
    projectedPillars.sort((a, b) => b.z - a.z);

    // Draw connecting energy lines between pillars in order: Learning -> Skills -> Projects -> Career -> Learning
    for (let i = 0; i < projectedPillars.length; i++) {
      const current = projectedPillars[i];
      const next = projectedPillars[(i + 1) % projectedPillars.length];

      // Draw dashed connector
      const grad = this.ctx.createLinearGradient(current.px, current.py, next.px, next.py);
      grad.addColorStop(0, current.color + '88');
      grad.addColorStop(1, next.color + '88');

      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = 1.8 * Math.min(current.scale, next.scale);
      this.ctx.beginPath();
      this.ctx.moveTo(current.px, current.py);
      this.ctx.lineTo(next.px, next.py);
      this.ctx.stroke();

      // Connector to Center
      this.ctx.strokeStyle = 'rgba(161, 167, 188, 0.12)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(current.px, current.py);
      this.ctx.stroke();
    }

    // Draw Each Projected Pillar Node
    projectedPillars.forEach(p => {
      const radius = p.radius * p.scale;
      
      // Node Outer Glow
      const glow = this.ctx.createRadialGradient(p.px, p.py, radius * 0.5, p.px, p.py, radius * 2.8);
      glow.addColorStop(0, p.color + 'aa');
      glow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(p.px, p.py, radius * 2.8, 0, Math.PI * 2);
      this.ctx.fill();

      // Node Surface
      this.ctx.fillStyle = '#1A2031';
      this.ctx.strokeStyle = p.color;
      this.ctx.lineWidth = 2 * p.scale;
      this.ctx.beginPath();
      this.ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Inner Dot
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.px, p.py, radius * 0.4, 0, Math.PI * 2);
      this.ctx.fill();

      // Pillar Label Badge
      this.ctx.fillStyle = '#F5F7FA';
      this.ctx.font = `600 ${Math.max(11 * p.scale, 9)}px "Plus Jakarta Sans", sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(p.label, p.px, p.py + radius + 15 * p.scale);
    });

    // Draw subtle technical coordinate ticks
    this.particles.forEach(pt => {
      const curAngle = pt.angle + (isReduced ? 0 : (Date.now() * 0.0003));
      const rad = pt.baseRadius;
      const x3d = Math.cos(curAngle) * rad;
      const y3d = Math.sin(curAngle) * rad * 0.45;
      const z3d = Math.sin(curAngle) * 50 + pt.z;

      const scale = fov / (fov + z3d);
      const px = centerX + x3d * scale;
      const py = centerY + y3d * scale;

      this.ctx.fillStyle = pt.color;
      this.ctx.fillRect(px - 1, py - 1, 2 * scale, 2 * scale);
    });

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  },

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Hero3D.init();
});
