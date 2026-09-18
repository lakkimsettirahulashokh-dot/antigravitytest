/* ==========================================================================
   BTechPath AI OS — Global 3D WebGL Architectural Environment Engine
   ==========================================================================
   - True 3D hardware-accelerated WebGL scene powered by Three.js
   - Deep Twilight perspective environment with physical depth layers
   - Architectural slabs, dimensional technical panels, receding perspective grid
   - Real Three.js lighting: Ambient, Directional Key/Fill, & Dynamic Accent PointLight
   - Atmospheric depth fog (THREE.FogExp2) in Deep Twilight #0B0F19
   - Desktop mouse parallax with smooth damping (lerp)
   - Scroll-linked camera depth glide
   - Smooth autonomous harmonic breathing on mobile / idle
   - Strict brand color palette lock (Deep Twilight, Midnight, Elevated, Indigo, Violet, Teal, Rose Gold)
   - Non-blocking pointer-events: none, z-index: 0
   - Fully accessible, respects 'prefers-reduced-motion', tab visibility pausing
   - Zero white flashes, route-specific accent lighting presets
   ========================================================================== */

(function () {
  'use strict';

  // Prevent duplicate execution
  if (window.__BTECH_3D_WEBGL_INITIALIZED__) {
    return;
  }
  window.__BTECH_3D_WEBGL_INITIALIZED__ = true;

  // 1. STRICT COLOR PALETTE LOCK (BTechPath AI Design Tokens)
  const PALETTE = {
    bgBase: 0x0B0F19,         // Deep Twilight
    bgMidnight: 0x121826,     // Midnight Surface
    surfaceCard: 0x1A2031,    // Elevated Surface
    surfaceBorder: 0x2A3147,  // Border / Edge highlight
    gridLine: 0x1E2638,       // Receding horizon grid
    indigo: 0x5865F2,         // Primary Brand Indigo
    softViolet: 0x7C5CFF,     // AI Soft Violet
    teal: 0x2DD4BF,           // Teal / Success Progress
    roseGold: 0xF6C177,       // Rose Gold / Gold / Champagne
    amber: 0xF59E0B,          // Warning / Saffron / Streak
    emerald: 0x22C55E,        // Emerald / Forest Sage
    coral: 0xEF4444,          // Coral / Red
    warmIvory: 0xF5F7FA,      // Warm Ivory
    mutedGray: 0xA1A7BC       // Muted Gray
  };

  // Section-specific 3D accent presets as required by Specification #11
  const ROUTE_ACCENTS = {
    'home':                { primary: PALETTE.indigo,     secondary: PALETTE.softViolet, label: 'Indigo + Violet' },
    'dashboard':           { primary: PALETTE.teal,       secondary: PALETTE.indigo,     label: 'Teal + Indigo' },
    'btech':               { primary: PALETTE.teal,       secondary: PALETTE.softViolet, label: 'Teal/Cyan' },
    'learn':               { primary: PALETTE.teal,       secondary: PALETTE.indigo,     label: 'Teal + Indigo' },
    'study':               { primary: PALETTE.teal,       secondary: PALETTE.softViolet, label: 'Teal + Violet' },
    'ai':                  { primary: PALETTE.softViolet, secondary: PALETTE.indigo,     label: 'Violet/Lavender' },
    'copilot':             { primary: PALETTE.softViolet, secondary: PALETTE.indigo,     label: 'Violet/Lavender' },
    'doubt-solver':        { primary: PALETTE.softViolet, secondary: PALETTE.teal,       label: 'Violet/Lavender' },
    'ai-notes':            { primary: PALETTE.softViolet, secondary: PALETTE.indigo,     label: 'Royal Purple/Lavender' },
    'flashcards':          { primary: PALETTE.roseGold,   secondary: PALETTE.amber,      label: 'Amber/Gold' },
    'quiz':                { primary: PALETTE.roseGold,   secondary: PALETTE.coral,      label: 'Coral/Rose' },
    'roadmap':             { primary: PALETTE.emerald,    secondary: PALETTE.teal,       label: 'Emerald/Teal' },
    'career':              { primary: PALETTE.roseGold,   secondary: PALETTE.amber,      label: 'Gold/Champagne' },
    'skills':              { primary: PALETTE.emerald,    secondary: PALETTE.teal,       label: 'Forest/Sage' },
    'projects':            { primary: PALETTE.roseGold,   secondary: PALETTE.indigo,     label: 'Copper/Terracotta' },
    'internships':         { primary: PALETTE.teal,       secondary: PALETTE.indigo,     label: 'Steel Teal/Aqua' },
    'resume-builder':      { primary: PALETTE.roseGold,   secondary: PALETTE.softViolet, label: 'Rose Gold/Champagne' },
    'exams':               { primary: PALETTE.amber,      secondary: PALETTE.roseGold,   label: 'Muted Saffron/Amber' },
    'government-exams':    { primary: PALETTE.amber,      secondary: PALETTE.roseGold,   label: 'Muted Saffron/Amber' },
    'international-exams': { primary: PALETTE.teal,       secondary: PALETTE.indigo,     label: 'Cool Cyan/Aqua' },
    'analytics':           { primary: PALETTE.indigo,     secondary: PALETTE.teal,       label: 'Indigo + Teal' },
    'reviews':             { primary: PALETTE.roseGold,   secondary: PALETTE.amber,      label: 'Champagne/Gold' },
    'contact':             { primary: PALETTE.teal,       secondary: PALETTE.indigo,     label: 'Muted Teal' },
    'helpdesk':            { primary: PALETTE.teal,       secondary: PALETTE.indigo,     label: 'Muted Teal' },
    'admin':               { primary: PALETTE.softViolet, secondary: PALETTE.roseGold,   label: 'Deep Violet + Muted Gold' },
    'profile':             { primary: PALETTE.softViolet, secondary: PALETTE.mutedGray,  label: 'Slate Lavender/Muted Gray' },
    'settings':            { primary: PALETTE.softViolet, secondary: PALETTE.mutedGray,  label: 'Slate Lavender/Muted Gray' },
    'privacy-policy':      { primary: PALETTE.indigo,     secondary: PALETTE.softViolet, label: 'Indigo + Violet' },
    'privacy':             { primary: PALETTE.indigo,     secondary: PALETTE.softViolet, label: 'Indigo + Violet' },
    'terms':               { primary: PALETTE.teal,       secondary: PALETTE.mutedGray,  label: 'Muted Teal + Slate' },
    'terms-of-use':        { primary: PALETTE.teal,       secondary: PALETTE.mutedGray,  label: 'Muted Teal + Slate' },
    'faqs':                { primary: PALETTE.roseGold,   secondary: PALETTE.indigo,     label: 'Gold + Indigo' },
    'faq':                 { primary: PALETTE.roseGold,   secondary: PALETTE.indigo,     label: 'Gold + Indigo' },
    'mock-interview':      { primary: PALETTE.indigo,     secondary: PALETTE.teal,       label: 'Calm Indigo (Restrained)' },
    '404':                 { primary: PALETTE.softViolet, secondary: PALETTE.indigo,     label: 'Deep Violet' },
    'login':               { primary: PALETTE.indigo,     secondary: PALETTE.softViolet, label: 'Indigo + Violet' },
    'signup':              { primary: PALETTE.indigo,     secondary: PALETTE.softViolet, label: 'Indigo + Violet' },
    'start-journey':       { primary: PALETTE.teal,       secondary: PALETTE.indigo,     label: 'Teal + Indigo' },
    'default':             { primary: PALETTE.indigo,     secondary: PALETTE.softViolet, label: 'Deep Twilight Brand' }
  };

  // 2. MAIN 3D ENGINE OBJECT
  const BTech3D = {
    canvas: null,
    renderer: null,
    scene: null,
    camera: null,
    clock: null,
    rafId: null,

    // Lights
    ambientLight: null,
    keyLight: null,
    fillLight: null,
    accentLight: null,
    accentTargetColor: null,
    accentCurrentColor: null,

    // Scene Groups & Objects
    gridGroup: null,
    slabsGroup: null,
    conduitsGroup: null,
    pulseGroup: null,
    slabs: [],
    conduits: [],
    pulses: [],

    // State & Dimensions
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    isReducedMotion: false,
    isMobile: false,
    isTabHidden: false,
    isInterviewPage: false,
    activePreset: 'home',

    // Parallax & Camera Controls
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    scroll: { y: 0, targetY: 0, maxScroll: 1 },
    camBasePos: { x: 0, y: 0, z: 540 },

    // Initialize Engine
    init() {
      // Reduced motion check
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.isMobile = window.innerWidth < 768;

      // Identify route preset
      this.activePreset = this.detectRoutePreset();
      this.isInterviewPage = this.activePreset === 'mock-interview';

      // Ensure Three.js is loaded
      if (typeof THREE === 'undefined') {
        this.loadThreeScript(() => this.setupWebGL());
      } else {
        this.setupWebGL();
      }
    },

    // Dynamic singleton loader for Three.js if not yet present
    loadThreeScript(callback) {
      if (typeof THREE !== 'undefined') {
        callback();
        return;
      }
      if (window.__THREE_LOADING__) {
        window.addEventListener('three-loaded', () => callback(), { once: true });
        return;
      }

      // Check if already in DOM
      const existing = document.querySelector('script[src*="three"]') || document.getElementById('three-js-lib');
      if (existing) {
        existing.addEventListener('load', () => {
          window.dispatchEvent(new CustomEvent('three-loaded'));
          callback();
        }, { once: true });
        return;
      }

      window.__THREE_LOADING__ = true;
      const script = document.createElement('script');
      script.id = 'three-js-lib';
      script.src = 'js/three.min.js';
      script.async = false;
      script.onload = () => {
        window.__THREE_LOADING__ = false;
        window.dispatchEvent(new CustomEvent('three-loaded'));
        callback();
      };
      script.onerror = () => {
        window.__THREE_LOADING__ = false;
        console.warn('[BTechPath 3D] WebGL Three.js failed to load. Graceful fallback active.');
      };
      document.head.appendChild(script);
    },

    // Route Preset Detection
    detectRoutePreset() {
      const path = (window.location.pathname || '').toLowerCase();
      const page = path.split('/').pop().replace(/\.html$/, '') || 'home';

      if (ROUTE_ACCENTS[page]) {
        return page;
      }
      if (page.includes('note') || page.includes('pdf')) return 'ai-notes';
      if (page.includes('interview')) return 'mock-interview';
      if (page.includes('doubt') || page.includes('copilot')) return 'doubt-solver';
      if (page.includes('exam')) return 'exams';
      if (page.includes('proj')) return 'projects';
      if (page.includes('skill')) return 'skills';
      if (page.includes('intern')) return 'internships';
      if (page.includes('resume')) return 'resume-builder';
      if (page.includes('review')) return 'reviews';
      if (page.includes('contact') || page.includes('help')) return 'contact';
      if (page.includes('privacy')) return 'privacy-policy';
      if (page.includes('term')) return 'terms';
      if (page.includes('faq')) return 'faqs';
      if (page.includes('dash')) return 'dashboard';
      if (page.includes('auth') || page.includes('login')) return 'login';
      if (page.includes('sign')) return 'signup';
      if (page.includes('admin')) return 'admin';
      if (page.includes('prof') || page.includes('sett')) return 'profile';
      if (page.includes('404')) return '404';

      return 'home';
    },

    // Setup WebGL Scene
    setupWebGL() {
      if (typeof THREE === 'undefined') return;

      // 1. Obtain or Create Canvas
      let canvas = document.getElementById('btech-3d-bg-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'btech-3d-bg-canvas';
        canvas.className = 'btech-3d-bg-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        canvas.setAttribute('tabindex', '-1');
        document.body.prepend(canvas);
      }
      this.canvas = canvas;

      // Ensure explicit body styling prevents white flashes
      document.body.style.backgroundColor = '#0B0F19';

      // 2. Create Renderer
      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        });
      } catch (err) {
        console.warn('[BTechPath 3D] WebGL context creation failed:', err);
        return;
      }

      this.renderer.setClearColor(PALETTE.bgBase, 1.0);
      this.renderer.setPixelRatio(this.dpr);
      this.renderer.setSize(this.width, this.height);
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;

      // 3. Create Scene & Atmospheric Fog
      this.scene = new THREE.Scene();
      // Atmospheric Fog in Deep Twilight #0B0F19
      this.scene.fog = new THREE.FogExp2(PALETTE.bgBase, 0.00085);

      // 4. Perspective Camera
      const aspect = this.width / this.height;
      this.camera = new THREE.PerspectiveCamera(52, aspect, 10, 3200);
      this.camera.position.set(this.camBasePos.x, this.camBasePos.y, this.camBasePos.z);
      this.camera.lookAt(0, 0, -250);

      // 5. Lighting System
      this.setupLighting();

      // 6. 3D Architectural Geometry Layers
      this.buildPerspectiveGrids();
      this.buildArchitecturalSlabs();
      this.buildTechnicalConduits();

      // 7. Event Listeners
      this.bindEvents();

      // 8. Start Animation Loop
      this.clock = new THREE.Clock();
      this.render();

      console.log(`[BTechPath 3D] True WebGL Environment Active. Route Accent: ${this.activePreset} (${ROUTE_ACCENTS[this.activePreset]?.label || 'Default'})`);
    },

    // Build Believable Engineering Lighting
    setupLighting() {
      // Soft ambient base: Midnight Surface hue
      const ambIntensity = this.isInterviewPage ? 1.3 : 1.7;
      this.ambientLight = new THREE.AmbientLight(PALETTE.bgMidnight, ambIntensity);
      this.scene.add(this.ambientLight);

      // Key Directional Light: Primary Brand Indigo #5865F2 casting soft specular sheen
      const keyIntensity = this.isInterviewPage ? 0.9 : 1.35;
      this.keyLight = new THREE.DirectionalLight(PALETTE.indigo, keyIntensity);
      this.keyLight.position.set(380, 520, 360);
      this.scene.add(this.keyLight);

      // Fill Directional Light: Soft Violet #7C5CFF from opposite lower angle
      const fillIntensity = this.isInterviewPage ? 0.6 : 0.9;
      this.fillLight = new THREE.DirectionalLight(PALETTE.softViolet, fillIntensity);
      this.fillLight.position.set(-360, -280, 220);
      this.scene.add(this.fillLight);

      // Dynamic Section Accent PointLight (Route-specific color)
      const accentConfig = ROUTE_ACCENTS[this.activePreset] || ROUTE_ACCENTS['default'];
      this.accentCurrentColor = new THREE.Color(accentConfig.primary);
      this.accentTargetColor = new THREE.Color(accentConfig.primary);

      const ptIntensity = this.isInterviewPage ? 1.4 : 2.4;
      this.accentLight = new THREE.PointLight(this.accentCurrentColor, ptIntensity, 980, 1.8);
      this.accentLight.position.set(0, 60, 140);
      this.scene.add(this.accentLight);
    },

    // 1. Horizon Perspective Grid (Architectural plane floor and ceiling)
    buildPerspectiveGrids() {
      this.gridGroup = new THREE.Group();

      const gridFloorY = -260;
      const gridCeilY = 320;
      const xSpan = 1100;
      const zNear = 350;
      const zFar = -1500;
      const stepX = 90;
      const stepZ = 90;

      // Floor grid lines
      const floorMat = new THREE.LineBasicMaterial({
        color: PALETTE.surfaceBorder,
        transparent: true,
        opacity: 0.38
      });

      const floorPoints = [];

      // Z-parallel longitudinal lines (converging towards the horizon)
      for (let x = -xSpan; x <= xSpan; x += stepX) {
        floorPoints.push(new THREE.Vector3(x, gridFloorY, zNear));
        floorPoints.push(new THREE.Vector3(x, gridFloorY, zFar));
      }

      // X-parallel transverse lines
      for (let z = zNear; z >= zFar; z -= stepZ) {
        floorPoints.push(new THREE.Vector3(-xSpan, gridFloorY, z));
        floorPoints.push(new THREE.Vector3(xSpan, gridFloorY, z));
      }

      const floorGeo = new THREE.BufferGeometry().setFromPoints(floorPoints);
      const floorLines = new THREE.LineSegments(floorGeo, floorMat);
      this.gridGroup.add(floorLines);

      // Ceiling subtle dimensional grid
      const ceilMat = new THREE.LineBasicMaterial({
        color: PALETTE.gridLine,
        transparent: true,
        opacity: 0.18
      });

      const ceilPoints = [];
      for (let x = -xSpan; x <= xSpan; x += stepX * 2) {
        ceilPoints.push(new THREE.Vector3(x, gridCeilY, zNear));
        ceilPoints.push(new THREE.Vector3(x, gridCeilY, zFar));
      }
      for (let z = zNear; z >= zFar; z -= stepZ * 2) {
        ceilPoints.push(new THREE.Vector3(-xSpan, gridCeilY, z));
        ceilPoints.push(new THREE.Vector3(xSpan, gridCeilY, z));
      }
      const ceilGeo = new THREE.BufferGeometry().setFromPoints(ceilPoints);
      const ceilLines = new THREE.LineSegments(ceilGeo, ceilMat);
      this.gridGroup.add(ceilLines);

      this.scene.add(this.gridGroup);
    },

    // 2. Layered Architectural Slabs & Dimensional Panels
    buildArchitecturalSlabs() {
      this.slabsGroup = new THREE.Group();
      this.slabs = [];

      // Engineered layout with distinct depth tiers (far, mid, near)
      const slabConfigs = [
        // Deep Tier (Z: -800 to -500)
        { w: 320, h: 180, d: 16, x: -380, y: 140,  z: -780, rotX: 0.14, rotY: -0.22, rotZ: 0.04, tier: 'far' },
        { w: 260, h: 150, d: 14, x:  390, y: -110, z: -690, rotX: -0.12, rotY: 0.24, rotZ: -0.05, tier: 'far' },
        { w: 220, h: 220, d: 18, x:  -90, y: -170, z: -610, rotX: 0.08,  rotY: 0.12, rotZ: 0.02, tier: 'far' },
        { w: 340, h: 140, d: 14, x:  240, y: 190,  z: -560, rotX: -0.10, rotY: -0.18, rotZ: -0.03, tier: 'far' },

        // Mid Tier (Z: -450 to -150)
        { w: 280, h: 160, d: 20, x: -310, y: -60,  z: -380, rotX: -0.08, rotY: 0.32, rotZ: -0.06, tier: 'mid', accentEdge: true },
        { w: 300, h: 170, d: 22, x:  330, y:  80,  z: -320, rotX: 0.11,  rotY: -0.28, rotZ: 0.04, tier: 'mid', accentEdge: true },
        { w: 210, h: 130, d: 16, x: -140, y: 160,  z: -260, rotX: 0.09,  rotY: -0.15, rotZ: 0.02, tier: 'mid' },
        { w: 240, h: 140, d: 18, x:  120, y: -160, z: -210, rotX: -0.07, rotY: 0.18, rotZ: -0.03, tier: 'mid' },
        { w: 180, h: 190, d: 15, x:  420, y: -90,  z: -160, rotX: 0.15,  rotY: -0.34, rotZ: 0.05, tier: 'mid' },
        { w: 200, h: 150, d: 16, x: -440, y: 120,  z: -140, rotX: -0.13, rotY: 0.26, rotZ: -0.04, tier: 'mid' },

        // Near Foreground Floating Frames (Z: -90 to +80)
        { w: 250, h: 140, d: 14, x: -280, y: 110,  z: -50,  rotX: 0.07,  rotY: -0.22, rotZ: 0.03, tier: 'near', accentEdge: true },
        { w: 260, h: 150, d: 15, x:  270, y: -70,  z:  20,  rotX: -0.06, rotY: 0.20, rotZ: -0.02, tier: 'near', accentEdge: true },
        { w: 190, h: 120, d: 12, x: -110, y: -140, z:  60,  rotX: 0.08,  rotY: 0.14, rotZ: 0.02, tier: 'near' },
        { w: 220, h: 130, d: 14, x:  160, y: 140,  z:  80,  rotX: -0.05, rotY: -0.16, rotZ: -0.02, tier: 'near' }
      ];

      // Reusable Standard Material for Slabs: Deep Midnight Surface with subtle metallic sheen
      const slabMaterial = new THREE.MeshStandardMaterial({
        color: PALETTE.bgMidnight,
        roughness: 0.44,
        metalness: 0.68,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
      });

      // Edge outline material (Border #2A3147)
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: PALETTE.surfaceBorder,
        transparent: true,
        opacity: 0.65
      });

      // Accent Edge Material (dynamically updated on route switch)
      const accentEdgeMat = new THREE.LineBasicMaterial({
        color: this.accentCurrentColor,
        transparent: true,
        opacity: 0.85
      });
      this.accentEdgeMat = accentEdgeMat;

      slabConfigs.forEach((cfg, idx) => {
        const geo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
        const mesh = new THREE.Mesh(geo, slabMaterial);

        mesh.position.set(cfg.x, cfg.y, cfg.z);
        mesh.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ);

        // Edge highlights for architectural definition
        const edgesGeo = new THREE.EdgesGeometry(geo);
        const edges = new THREE.LineSegments(edgesGeo, cfg.accentEdge ? accentEdgeMat : edgeMaterial);
        mesh.add(edges);

        // Store original transform for smooth floating drift
        const slabData = {
          mesh,
          basePos: { x: cfg.x, y: cfg.y, z: cfg.z },
          baseRot: { x: cfg.rotX, y: cfg.rotY, z: cfg.rotZ },
          phase: idx * 0.72,
          speed: 0.6 + (idx % 4) * 0.15,
          tier: cfg.tier
        };

        this.slabs.push(slabData);
        this.slabsGroup.add(mesh);
      });

      this.scene.add(this.slabsGroup);
    },

    // 3. Technical Engineering Pathways / Conduits with Signal Pulses
    buildTechnicalConduits() {
      this.conduitsGroup = new THREE.Group();
      this.pulseGroup = new THREE.Group();
      this.pulses = [];

      // 6 3D conduit paths connecting through spatial depth
      const conduitPaths = [
        [new THREE.Vector3(-380, 140, -780), new THREE.Vector3(-310, -60, -380), new THREE.Vector3(-280, 110, -50)],
        [new THREE.Vector3(390, -110, -690), new THREE.Vector3(330, 80, -320), new THREE.Vector3(270, -70, 20)],
        [new THREE.Vector3(-90, -170, -610), new THREE.Vector3(120, -160, -210), new THREE.Vector3(-110, -140, 60)],
        [new THREE.Vector3(240, 190, -560), new THREE.Vector3(-140, 160, -260), new THREE.Vector3(160, 140, 80)],
        [new THREE.Vector3(-440, 120, -140), new THREE.Vector3(0, 0, -200), new THREE.Vector3(420, -90, -160)],
        [new THREE.Vector3(0, -240, -700), new THREE.Vector3(0, -180, -300), new THREE.Vector3(0, -100, 100)]
      ];

      const conduitLineMat = new THREE.LineBasicMaterial({
        color: PALETTE.indigo,
        transparent: true,
        opacity: 0.28
      });

      // Pulse node geometry & material
      const pulseGeo = new THREE.SphereGeometry(2.4, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: this.accentCurrentColor,
        transparent: true,
        opacity: 0.88
      });
      this.pulseMat = pulseMat;

      conduitPaths.forEach((pts, pIdx) => {
        const curve = new THREE.CatmullRomCurve3(pts);
        const curvePoints = curve.getPoints(36);
        const geo = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const line = new THREE.Line(geo, conduitLineMat);
        this.conduitsGroup.add(line);

        // Add 2 traveling pulses per conduit
        for (let k = 0; k < 2; k++) {
          const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
          this.pulseGroup.add(pulseMesh);

          this.pulses.push({
            mesh: pulseMesh,
            curve,
            offset: (k * 0.5) + (pIdx * 0.16),
            speed: 0.00075 + (pIdx % 3) * 0.0002
          });
        }
      });

      this.scene.add(this.conduitsGroup);
      this.scene.add(this.pulseGroup);
    },

    // Handle Route Accent Preset Switching
    setAccent(presetOrHex) {
      let targetHex = PALETTE.indigo;

      if (typeof presetOrHex === 'string' && ROUTE_ACCENTS[presetOrHex]) {
        targetHex = ROUTE_ACCENTS[presetOrHex].primary;
        this.activePreset = presetOrHex;
      } else if (typeof presetOrHex === 'number') {
        targetHex = presetOrHex;
      } else if (typeof presetOrHex === 'string' && presetOrHex.startsWith('#')) {
        targetHex = parseInt(presetOrHex.replace('#', '0x'), 16);
      }

      this.accentTargetColor = new THREE.Color(targetHex);
    },

    // Event Bindings
    bindEvents() {
      // Desktop Mouse Parallax
      window.addEventListener('mousemove', (e) => {
        if (this.isReducedMotion) return;
        const normX = (e.clientX / this.width - 0.5) * 2;
        const normY = (e.clientY / this.height - 0.5) * 2;
        this.mouse.targetX = normX;
        this.mouse.targetY = normY;
      }, { passive: true });

      // Scroll Depth Parallax
      window.addEventListener('scroll', () => {
        const docHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        ) - window.innerHeight;

        this.scroll.maxScroll = Math.max(docHeight, 1);
        this.scroll.targetY = window.pageYOffset || document.documentElement.scrollTop || 0;
      }, { passive: true });

      // Window Resize
      window.addEventListener('resize', () => this.onResize(), { passive: true });

      // Tab Visibility (Pause rendering when tab is hidden to save GPU)
      document.addEventListener('visibilitychange', () => {
        this.isTabHidden = document.hidden;
        if (!this.isTabHidden && !this.rafId) {
          this.clock.start();
          this.render();
        }
      });

      // Reduced Motion Preference Listener
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', (e) => {
          this.isReducedMotion = e.matches;
        });
      }

      // WebGL Context Lost / Restored Protection
      this.canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = null;
        console.warn('[BTechPath 3D] WebGL context lost. Pausing loop.');
      }, false);

      this.canvas.addEventListener('webglcontextrestored', () => {
        console.log('[BTechPath 3D] WebGL context restored. Rebuilding scene.');
        this.setupWebGL();
      }, false);
    },

    // Window Resize Handler
    onResize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.isMobile = this.width < 768;

      if (!this.renderer || !this.camera) return;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      this.renderer.setSize(this.width, this.height);
    },

    // Continuous Render Loop
    render() {
      if (this.isTabHidden) {
        this.rafId = null;
        return;
      }

      this.rafId = requestAnimationFrame(() => this.render());

      const delta = Math.min(this.clock.getDelta(), 0.1);
      const elapsedTime = this.clock.getElapsedTime();

      // Smooth mouse lerp (cubic damping)
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.045;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.045;

      // Smooth scroll lerp
      this.scroll.y += (this.scroll.targetY - this.scroll.y) * 0.055;
      const scrollRatio = Math.min(Math.max(this.scroll.y / this.scroll.maxScroll, 0), 1);

      // Autonomous breathing harmonics (mobile & desktop base drift)
      const breathTime = elapsedTime * 0.32;
      const breathX = Math.sin(breathTime * 0.8) * 22 + Math.cos(breathTime * 0.4) * 12;
      const breathY = Math.cos(breathTime * 0.6) * 16;
      const breathZ = Math.sin(breathTime * 0.5) * 20;

      // Camera Parallax & Depth Positioning
      if (!this.isReducedMotion) {
        // Desktop mouse movement tilts & glides camera slightly
        const targetCamX = this.camBasePos.x + (this.mouse.x * 75) + (this.isMobile ? breathX : breathX * 0.5);
        const targetCamY = this.camBasePos.y - (this.mouse.y * 50) + (this.isMobile ? breathY : breathY * 0.5);
        // Scroll pushes camera gently forward along Z to reveal architectural depth
        const targetCamZ = this.camBasePos.z - (scrollRatio * 220) + breathZ;

        this.camera.position.x += (targetCamX - this.camera.position.x) * 0.04;
        this.camera.position.y += (targetCamY - this.camera.position.y) * 0.04;
        this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.04;

        // Subtle lookAt target parallax
        const lookX = this.mouse.x * 20;
        const lookY = -this.mouse.y * 15;
        this.camera.lookAt(lookX, lookY, -280);
      } else {
        // Static camera with full 3D perspective and depth intact
        this.camera.position.set(this.camBasePos.x, this.camBasePos.y, this.camBasePos.z);
        this.camera.lookAt(0, 0, -280);
      }

      // Smoothly update Accent PointLight color if switching presets
      if (this.accentLight && this.accentTargetColor) {
        this.accentCurrentColor.lerp(this.accentTargetColor, 0.04);
        this.accentLight.color.copy(this.accentCurrentColor);
        if (this.accentEdgeMat) this.accentEdgeMat.color.copy(this.accentCurrentColor);
        if (this.pulseMat) this.pulseMat.color.copy(this.accentCurrentColor);
      }

      // Accent Light slow architectural orbit
      if (this.accentLight && !this.isReducedMotion) {
        const lightOrbit = elapsedTime * 0.45;
        this.accentLight.position.x = Math.sin(lightOrbit) * 190 + (this.mouse.x * 60);
        this.accentLight.position.y = Math.cos(lightOrbit * 0.75) * 110 - (this.mouse.y * 40);
        this.accentLight.position.z = 140 + Math.sin(lightOrbit * 0.5) * 70;
      }

      // Gentle floating animation of architectural slabs
      if (!this.isReducedMotion) {
        for (let i = 0; i < this.slabs.length; i++) {
          const s = this.slabs[i];
          const t = elapsedTime * s.speed + s.phase;
          s.mesh.position.y = s.basePos.y + Math.sin(t) * 6;
          s.mesh.rotation.x = s.baseRot.x + Math.sin(t * 0.5) * 0.015;
          s.mesh.rotation.y = s.baseRot.y + Math.cos(t * 0.4) * 0.018;
        }
      }

      // Traveling signal pulse nodes along conduits
      if (!this.isReducedMotion) {
        for (let j = 0; j < this.pulses.length; j++) {
          const p = this.pulses[j];
          p.offset = (p.offset + p.speed) % 1.0;
          const pos = p.curve.getPointAt(p.offset);
          p.mesh.position.copy(pos);
        }
      }

      // Render Scene
      this.renderer.render(this.scene, this.camera);
    }
  };

  // Expose Global 3D API
  BTech3D.PALETTE = PALETTE;
  BTech3D.ROUTE_ACCENTS = ROUTE_ACCENTS;
  window.BTech3D = BTech3D;
  window.BTech3DBg = BTech3D; // Backwards compatibility

  // Auto-boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BTech3D.init());
  } else {
    BTech3D.init();
  }

})();
