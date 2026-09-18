/* ==========================================================================
   BTechPath AI OS — Holographic 3D Engineering Branch Visual Engine
   File: js/branch-3d.js
   Description: Renders real, high-performance holographic 3D engineering assets
                customized for every engineering branch (ECE Silicon Chip/Wafer,
                Automobile IC Engine/Pistons, Mechanical Gears/CAD, EIE Sensors,
                AI/ML Neural Networks, Civil Bridges, Biotech DNA, etc.).
   Design:
     - Real Three.js WebGL with depth, lighting, and subtle rotation/parallax
     - Transparent background, zero pointer blocking, zero layout shift
     - Efficient procedural geometry: 0ms load, zero external 3D file lag
     - Auto-pauses off-screen via IntersectionObserver
     - Respects prefers-reduced-motion
     - Full WebGL memory cleanup on branch switch
   ========================================================================== */

(function(window) {
    'use strict';

    const HolographicPalette = {
        cyan: 0x38BDF8,
        indigo: 0x6366F1,
        emerald: 0x2DD4BF,
        amber: 0xF59E0B,
        violet: 0xA855F7,
        rose: 0xF43F5E,
        gold: 0xFBBF24,
        darkBase: 0x0B0F19,
        wireframeGlow: 0x818CF8
    };

    class Branch3DHologramEngine {
        constructor() {
            this.container = null;
            this.canvas = null;
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.activeBranch = null;
            this.activeModelGroup = null;
            this.animationFrameId = null;
            this.clock = null;
            this.isPaused = false;
            this.isIntersecting = true;
            this.prefersReducedMotion = false;
            this.observer = null;

            // Parallax state
            this.mouseX = 0;
            this.mouseY = 0;
            this.targetRotationX = 0;
            this.targetRotationY = 0;

            // Animated components state
            this.animatables = [];

            // Interactive Orbit / Zoom / Pan State
            this.userRotationX = 0;
            this.userRotationY = 0;
            this.targetUserRotX = 0;
            this.targetUserRotY = 0;
            this.panX = 0;
            this.panY = 0;
            this.targetPanX = 0;
            this.targetPanY = 0;
            this.cameraDistance = 7.5;
            this.targetCameraDistance = 7.5;
            this.minDistance = 3.2;
            this.maxDistance = 14.0;
            this.isDragging = false;
            this.isPanning = false;
            this.autoRotate = true;
            this.pointerStartX = 0;
            this.pointerStartY = 0;
            this.activePointers = new Map();
            this.initialPinchDistance = null;
            this.initialPinchZoom = null;
            this._cleanupListeners = [];
        }

        init(containerId = 'branch-hologram-stage') {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.warn('[Branch3D] Container element #' + containerId + ' not found.');
                return;
            }

            if (typeof THREE === 'undefined') {
                console.warn('[Branch3D] Three.js not loaded. Will retry on demand.');
                return;
            }

            this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            this.clock = new THREE.Clock();

            // Setup Scene
            this.scene = new THREE.Scene();

            // Setup Camera
            const aspect = this.container.clientWidth / (this.container.clientHeight || 360);
            this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
            this.camera.position.set(0, 0, this.cameraDistance);

            // Setup Renderer
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight || 360);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            this.renderer.setClearColor(0x000000, 0); // Transparent background

            this.canvas = this.renderer.domElement;
            this.canvas.style.display = 'block';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'auto'; // Allow interaction
            // CRITICAL: touch-action pan-y ensures vertical swipe scrolls the page on mobile!
            this.canvas.style.touchAction = 'pan-y';
            this.container.style.touchAction = 'pan-y';
            this.container.setAttribute('tabindex', '0');
            this.container.setAttribute('role', 'region');
            this.container.setAttribute('aria-label', 'Interactive 3D Holographic Engineering Model. Drag to rotate, pinch or hold Ctrl+scroll to zoom.');

            // Clear old canvas if present
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }
            this.container.appendChild(this.canvas);

            // Lighting: Engineering Hologram Studio
            const ambient = new THREE.AmbientLight(0xffffff, 0.65);
            this.scene.add(ambient);

            const keyLight = new THREE.DirectionalLight(0x818CF8, 1.2);
            keyLight.position.set(5, 6, 8);
            this.scene.add(keyLight);

            const cyanRim = new THREE.PointLight(0x38BDF8, 2.0, 20);
            cyanRim.position.set(-6, -4, 4);
            this.scene.add(cyanRim);

            const amberFill = new THREE.PointLight(0xF59E0B, 1.2, 15);
            amberFill.position.set(4, -5, -3);
            this.scene.add(amberFill);

            // Inject Sleek HUD Control Toolbar if not already present
            this.injectHUDControls();

            // Parallax & Interactive Events
            this.bindEvents();

            // Start Render Loop
            this.start();
        }

        injectHUDControls() {
            if (!this.container || !this.container.parentElement) return;
            const parent = this.container.parentElement;
            if (parent.querySelector('.holo-hud-toolbar')) return;

            const toolbar = document.createElement('div');
            toolbar.className = 'holo-hud-toolbar absolute top-3 right-3 flex items-center gap-1.5 z-20 pointer-events-auto bg-[#0B0F19]/80 backdrop-blur-md px-2 py-1 rounded-xl border border-indigo-500/30 shadow-lg select-none';
            toolbar.setAttribute('aria-label', '3D Model View Controls');
            toolbar.innerHTML = `
                <button type="button" data-action="zoom-in" title="Zoom In (+)" aria-label="Zoom In" class="w-6 h-6 rounded-lg bg-[#1A2031] hover:bg-indigo-600/30 text-indigo-300 hover:text-white flex items-center justify-center text-xs transition-colors border border-indigo-500/20">
                    <span class="material-symbols-outlined text-xs leading-none">add</span>
                </button>
                <button type="button" data-action="zoom-out" title="Zoom Out (-)" aria-label="Zoom Out" class="w-6 h-6 rounded-lg bg-[#1A2031] hover:bg-indigo-600/30 text-indigo-300 hover:text-white flex items-center justify-center text-xs transition-colors border border-indigo-500/20">
                    <span class="material-symbols-outlined text-xs leading-none">remove</span>
                </button>
                <button type="button" data-action="reset" title="Reset Camera View" aria-label="Reset View" class="w-6 h-6 rounded-lg bg-[#1A2031] hover:bg-indigo-600/30 text-indigo-300 hover:text-white flex items-center justify-center text-xs transition-colors border border-indigo-500/20">
                    <span class="material-symbols-outlined text-xs leading-none">restart_alt</span>
                </button>
                <button type="button" data-action="toggle-rotate" title="Toggle Auto-Rotation" aria-label="Toggle Rotation" class="w-6 h-6 rounded-lg bg-[#1A2031] hover:bg-indigo-600/30 text-indigo-300 hover:text-white flex items-center justify-center text-xs transition-colors border border-indigo-500/20">
                    <span class="material-symbols-outlined text-xs leading-none rotate-icon">motion_mode</span>
                </button>
            `;

            toolbar.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                if (action === 'zoom-in') this.zoomIn();
                if (action === 'zoom-out') this.zoomOut();
                if (action === 'reset') this.resetView();
                if (action === 'toggle-rotate') {
                    this.autoRotate = !this.autoRotate;
                    const icon = btn.querySelector('.rotate-icon');
                    if (icon) icon.textContent = this.autoRotate ? 'motion_mode' : 'pause';
                }
            });

            parent.appendChild(toolbar);
        }

        zoomIn(step = 0.8) {
            this.targetCameraDistance = Math.max(this.minDistance, this.targetCameraDistance - step);
        }

        zoomOut(step = 0.8) {
            this.targetCameraDistance = Math.min(this.maxDistance, this.targetCameraDistance + step);
        }

        resetView() {
            this.targetUserRotX = 0;
            this.targetUserRotY = 0;
            this.targetPanX = 0;
            this.targetPanY = 0;
            this.targetCameraDistance = 7.5;
            this.targetRotationX = 0;
            this.targetRotationY = 0;
        }

        bindEvents() {
            // Clean up any existing listeners
            this.unbindEvents();

            const addSafeListener = (target, type, handler, options) => {
                target.addEventListener(type, handler, options);
                this._cleanupListeners.push({ target, type, handler, options });
            };

            const stage = this.container;
            const trackElement = this.container.parentElement || this.container;

            // 1. Mouse Parallax (subtle tilt when merely hovering, not dragging)
            const onMouseMove = (e) => {
                if (this.isDragging || this.isPanning) return;
                const rect = trackElement.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
                this.targetRotationY = x * 0.35;
                this.targetRotationX = -y * 0.25;
            };
            addSafeListener(trackElement, 'mousemove', onMouseMove, { passive: true });

            const onMouseLeave = () => {
                if (!this.isDragging && !this.isPanning) {
                    this.targetRotationX = 0;
                    this.targetRotationY = 0;
                }
            };
            addSafeListener(trackElement, 'mouseleave', onMouseLeave, { passive: true });

            // 2. Interactive Pointer Drag (Rotate & Pan)
            const onPointerDown = (e) => {
                this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

                if (this.activePointers.size === 1) {
                    // Right mouse button OR holding Shift => Pan mode
                    if (e.button === 2 || e.shiftKey) {
                        this.isPanning = true;
                        this.isDragging = false;
                    } else if (e.button === 0) { // Left mouse button
                        this.isDragging = true;
                        this.isPanning = false;
                    }
                    this.pointerStartX = e.clientX;
                    this.pointerStartY = e.clientY;

                    try {
                        stage.setPointerCapture(e.pointerId);
                    } catch (err) {}
                } else if (this.activePointers.size === 2) {
                    // Two fingers on mobile / touch screen => Pinch zoom mode
                    this.isDragging = false;
                    this.isPanning = false;
                    const pts = Array.from(this.activePointers.values());
                    this.initialPinchDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                    this.initialPinchZoom = this.targetCameraDistance;
                }
            };
            addSafeListener(stage, 'pointerdown', onPointerDown, { passive: true });

            const onPointerMove = (e) => {
                if (!this.activePointers.has(e.pointerId)) return;
                this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

                // Multi-touch Pinch Zoom
                if (this.activePointers.size === 2 && this.initialPinchDistance) {
                    const pts = Array.from(this.activePointers.values());
                    const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                    if (currentDist > 5 && this.initialPinchDistance > 5) {
                        const ratio = this.initialPinchDistance / currentDist;
                        const newZoom = this.initialPinchZoom * ratio;
                        this.targetCameraDistance = Math.max(this.minDistance, Math.min(this.maxDistance, newZoom));
                    }
                    return;
                }

                if (this.isDragging) {
                    const dx = e.clientX - this.pointerStartX;
                    const dy = e.clientY - this.pointerStartY;
                    this.pointerStartX = e.clientX;
                    this.pointerStartY = e.clientY;

                    this.targetUserRotY += dx * 0.01;
                    this.targetUserRotX += dy * 0.01;
                    // Clamp pitch angle so model doesn't flip upside down
                    this.targetUserRotX = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.targetUserRotX));
                } else if (this.isPanning) {
                    const dx = e.clientX - this.pointerStartX;
                    const dy = e.clientY - this.pointerStartY;
                    this.pointerStartX = e.clientX;
                    this.pointerStartY = e.clientY;

                    this.targetPanX += dx * 0.008;
                    this.targetPanY -= dy * 0.008;
                    this.targetPanX = Math.max(-3.5, Math.min(3.5, this.targetPanX));
                    this.targetPanY = Math.max(-2.5, Math.min(2.5, this.targetPanY));
                }
            };
            addSafeListener(stage, 'pointermove', onPointerMove, { passive: true });

            const endDrag = (e) => {
                if (e && e.pointerId) {
                    this.activePointers.delete(e.pointerId);
                    try {
                        stage.releasePointerCapture(e.pointerId);
                    } catch (err) {}
                }
                if (this.activePointers.size === 0) {
                    this.isDragging = false;
                    this.isPanning = false;
                    this.initialPinchDistance = null;
                }
            };
            addSafeListener(stage, 'pointerup', endDrag, { passive: true });
            addSafeListener(stage, 'pointercancel', endDrag, { passive: true });
            addSafeListener(stage, 'lostpointercapture', endDrag, { passive: true });

            // 3. Wheel Handling
            // CRITICAL REQUIREMENT: Normal mouse wheel must scroll the page vertically!
            // Only zoom when Ctrl / Meta / Alt is held (standard map/3D canvas convention).
            const onWheel = (e) => {
                if (e.ctrlKey || e.metaKey || e.altKey) {
                    e.preventDefault(); // Only prevent default when explicitly zooming with modifier
                    const delta = e.deltaY * 0.004;
                    this.targetCameraDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetCameraDistance + delta));
                }
            };
            addSafeListener(stage, 'wheel', onWheel, { passive: false });

            // 4. Prevent Context Menu on Right Click (enables right-click panning)
            const onContextMenu = (e) => {
                e.preventDefault();
            };
            addSafeListener(stage, 'contextmenu', onContextMenu, { passive: false });

            // 5. Double Click: Toggle Zoom / Inspect
            const onDblClick = () => {
                if (this.targetCameraDistance > 5.0) {
                    this.targetCameraDistance = 4.0; // Zoom in close
                } else {
                    this.targetCameraDistance = 7.5; // Reset zoom
                }
            };
            addSafeListener(stage, 'dblclick', onDblClick, { passive: true });

            // 6. Keyboard Accessibility (Arrow keys rotate, +/- zoom, R resets)
            const onKeyDown = (e) => {
                if (document.activeElement !== stage) return;
                let handled = false;
                if (e.key === 'ArrowLeft') { this.targetUserRotY -= 0.15; handled = true; }
                if (e.key === 'ArrowRight') { this.targetUserRotY += 0.15; handled = true; }
                if (e.key === 'ArrowUp') { this.targetUserRotX -= 0.15; handled = true; }
                if (e.key === 'ArrowDown') { this.targetUserRotX += 0.15; handled = true; }
                if (e.key === '+' || e.key === '=') { this.zoomIn(); handled = true; }
                if (e.key === '-' || e.key === '_') { this.zoomOut(); handled = true; }
                if (e.key === 'r' || e.key === 'R') { this.resetView(); handled = true; }
                if (handled) {
                    e.preventDefault();
                }
            };
            addSafeListener(stage, 'keydown', onKeyDown, { passive: false });

            // 7. Window Resize
            const onResize = () => this.resize();
            addSafeListener(window, 'resize', onResize, { passive: true });

            // 8. Tab Visibility
            const onVisibilityChange = () => {
                this.isPaused = document.hidden;
            };
            addSafeListener(document, 'visibilitychange', onVisibilityChange, { passive: true });

            // 9. IntersectionObserver: Pause when off-screen for performance
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        this.isIntersecting = entry.isIntersecting;
                    });
                }, { threshold: 0.05 });
                this.observer.observe(this.container);
            }
        }

        unbindEvents() {
            if (this._cleanupListeners) {
                this._cleanupListeners.forEach(({ target, type, handler, options }) => {
                    try {
                        target.removeEventListener(type, handler, options);
                    } catch (e) {}
                });
                this._cleanupListeners = [];
            }
            if (this.observer) {
                try {
                    this.observer.disconnect();
                } catch (e) {}
                this.observer = null;
            }
        }

        resize() {
            if (!this.container || !this.renderer || !this.camera) return;
            const w = this.container.clientWidth;
            const h = this.container.clientHeight || 360;
            if (w === 0 || h === 0) return;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        }

        // ======================================================================
        // DYNAMIC BRANCH MODEL SWITCHING
        // ======================================================================
        setBranch(branchCode) {
            if (!this.scene) {
                this.init();
                if (!this.scene) return;
            }

            const code = (branchCode || '').toUpperCase().trim();
            if (this.activeBranch === code && this.activeModelGroup) {
                return; // Already rendered
            }

            this.activeBranch = code;
            this.clearActiveModel();

            // Create new model group
            const group = new THREE.Group();
            this.animatables = [];

            switch (code) {
                case 'ECE':
                    this.buildSemiconductorChip(group);
                    break;
                case 'AUTO':
                case 'AUTOMOBILE':
                    this.buildAutomotiveEngine(group);
                    break;
                case 'MECH':
                case 'MECHANICAL':
                    this.buildMechanicalCAD(group);
                    break;
                case 'EIE':
                    this.buildIndustrialSensors(group);
                    break;
                case 'EEE':
                    this.buildPowerGridMachine(group);
                    break;
                case 'CSE':
                case 'IT':
                case 'CSIT':
                    this.buildCloudArchitecture(group);
                    break;
                case 'AIML':
                case 'AI':
                case 'DS':
                case 'AIDS':
                    this.buildNeuralNetwork(group);
                    break;
                case 'CIVIL':
                case 'STRUCT':
                case 'CONST':
                    this.buildCivilBridge(group);
                    break;
                case 'CHEM':
                    this.buildChemicalReactor(group);
                    break;
                case 'BIOTECH':
                case 'BIOMED':
                    this.buildDNAHelix(group);
                    break;
                case 'AERO':
                case 'AERONAUT':
                    this.buildJetTurbine(group);
                    break;
                case 'MECHTRON':
                case 'ROBOTICS':
                    this.buildRoboticArm(group);
                    break;
                case 'MFG':
                case 'IND':
                    this.buildCNCMachine(group);
                    break;
                default:
                    // Universal Engineering Polyhedral Hologram
                    this.buildUniversalEngineeringCore(group);
                    break;
            }

            // Add subtle floating holographic datum rings
            this.addHolographicDatumRings(group);

            this.activeModelGroup = group;
            this.scene.add(group);
        }

        clearActiveModel() {
            if (this.activeModelGroup) {
                this.scene.remove(this.activeModelGroup);
                this.activeModelGroup.traverse(child => {
                    if (child.isMesh || child.isLineSegments || child.isPoints) {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(m => m.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    }
                });
                this.activeModelGroup = null;
            }
            this.animatables = [];
        }

        // ======================================================================
        // 1. ECE: CHIPS & SEMICONDUCTORS (Silicon Wafer, Die, Package, Traces)
        // ======================================================================
        buildSemiconductorChip(group) {
            // Main Chip Substrate (Silicon Ceramic Package)
            const packageGeom = new THREE.BoxGeometry(3.2, 0.22, 3.2);
            const packageMat = new THREE.MeshStandardMaterial({
                color: 0x0F172A,
                roughness: 0.3,
                metalness: 0.85,
                wireframe: false
            });
            const pkgMesh = new THREE.Mesh(packageGeom, packageMat);
            group.add(pkgMesh);

            // Package Edge Wireframe Highlight
            const edgesGeom = new THREE.EdgesGeometry(packageGeom);
            const edgeMat = new THREE.LineBasicMaterial({ color: HolographicPalette.cyan, linewidth: 2 });
            const edgeLines = new THREE.LineSegments(edgesGeom, edgeMat);
            group.add(edgeLines);

            // Central Silicon Die (Elevated Nanometer Chip Core)
            const dieGeom = new THREE.BoxGeometry(1.6, 0.08, 1.6);
            const dieMat = new THREE.MeshStandardMaterial({
                color: 0x0284C7,
                emissive: 0x0369A1,
                emissiveIntensity: 0.5,
                metalness: 0.95,
                roughness: 0.15
            });
            const dieMesh = new THREE.Mesh(dieGeom, dieMat);
            dieMesh.position.y = 0.14;
            group.add(dieMesh);

            // Microscopic VLSI Circuit Trace Grid on the Die
            const gridHelper = new THREE.GridHelper(1.5, 12, HolographicPalette.cyan, HolographicPalette.indigo);
            gridHelper.position.y = 0.19;
            group.add(gridHelper);

            // Gold Wire Pins Array (All 4 Sides)
            const pinGeom = new THREE.BoxGeometry(0.12, 0.04, 0.35);
            const pinMat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.gold,
                metalness: 0.9,
                roughness: 0.2,
                emissive: 0xB45309,
                emissiveIntensity: 0.3
            });

            for (let i = -1.2; i <= 1.2; i += 0.35) {
                // North and South pins
                const pN = new THREE.Mesh(pinGeom, pinMat);
                pN.position.set(i, 0, 1.75);
                group.add(pN);

                const pS = new THREE.Mesh(pinGeom, pinMat);
                pS.position.set(i, 0, -1.75);
                group.add(pS);

                // East and West pins (rotated 90 deg)
                const pE = new THREE.Mesh(pinGeom, pinMat);
                pE.rotation.y = Math.PI / 2;
                pE.position.set(1.75, 0, i);
                group.add(pE);

                const pW = new THREE.Mesh(pinGeom, pinMat);
                pW.rotation.y = Math.PI / 2;
                pW.position.set(-1.75, 0, i);
                group.add(pW);
            }

            // Silicon Wafer Base Ring (Concentric Wafer Projection)
            const waferGeom = new THREE.RingGeometry(2.4, 2.5, 48);
            const waferMat = new THREE.MeshBasicMaterial({
                color: HolographicPalette.cyan,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.45
            });
            const waferMesh = new THREE.Mesh(waferGeom, waferMat);
            waferMesh.rotation.x = Math.PI / 2;
            waferMesh.position.y = -0.6;
            group.add(waferMesh);

            // Orbiting Floating Photon/Electron Particles
            const particleCount = 36;
            const particleGeom = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            for (let i = 0; i < particleCount * 3; i += 3) {
                const angle = (i / particleCount) * Math.PI * 2;
                const r = 2.0 + Math.random() * 0.8;
                positions[i] = Math.cos(angle) * r;
                positions[i + 1] = (Math.random() - 0.5) * 0.8;
                positions[i + 2] = Math.sin(angle) * r;
            }
            particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const particleMat = new THREE.PointsMaterial({
                color: HolographicPalette.emerald,
                size: 0.08,
                transparent: true,
                opacity: 0.8
            });
            const particles = new THREE.Points(particleGeom, particleMat);
            group.add(particles);

            this.animatables.push((elapsed) => {
                gridHelper.rotation.y = elapsed * 0.15;
                particles.rotation.y = -elapsed * 0.35;
                dieMat.emissiveIntensity = 0.4 + Math.sin(elapsed * 3) * 0.2;
            });
        }

        // ======================================================================
        // 2. AUTOMOBILE ENGINEERING: AUTOMOTIVE ENGINES (Pistons, Crankshaft)
        // ======================================================================
        buildAutomotiveEngine(group) {
            // Engine Cylinder Block Frame (Holographic Wireframe)
            const blockGeom = new THREE.BoxGeometry(3.6, 2.2, 1.8);
            const blockMat = new THREE.MeshStandardMaterial({
                color: 0x1E293B,
                wireframe: true,
                transparent: true,
                opacity: 0.6
            });
            const blockMesh = new THREE.Mesh(blockGeom, blockMat);
            group.add(blockMesh);

            // Crankcase Lower Base
            const baseGeom = new THREE.BoxGeometry(3.8, 0.4, 2.0);
            const baseMat = new THREE.MeshStandardMaterial({
                color: 0x0F172A,
                metalness: 0.8,
                roughness: 0.3
            });
            const baseMesh = new THREE.Mesh(baseGeom, baseMat);
            baseMesh.position.y = -1.2;
            group.add(baseMesh);

            // 4 Working Pistons with Connecting Rods
            const pistonGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.5, 16);
            const pistonMat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.amber,
                emissive: 0x78350F,
                emissiveIntensity: 0.4,
                metalness: 0.8,
                roughness: 0.2
            });

            const rodGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8);
            const rodMat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.cyan,
                metalness: 0.9,
                roughness: 0.1
            });

            const pistons = [];
            const cylinderX = [-1.2, -0.4, 0.4, 1.2];
            const phases = [0, Math.PI, Math.PI, 0]; // 180° firing order

            cylinderX.forEach((xPos, idx) => {
                const pistonGroup = new THREE.Group();
                pistonGroup.position.x = xPos;

                const pHead = new THREE.Mesh(pistonGeom, pistonMat);
                pistonGroup.add(pHead);

                const rod = new THREE.Mesh(rodGeom, rodMat);
                rod.position.y = -0.65;
                pistonGroup.add(rod);

                group.add(pistonGroup);
                pistons.push({ group: pistonGroup, phase: phases[idx] });
            });

            // Crankshaft Center Axle below
            const shaftGeom = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 16);
            shaftGeom.rotateZ(Math.PI / 2);
            const shaftMat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.wireframeGlow,
                metalness: 0.95
            });
            const shaftMesh = new THREE.Mesh(shaftGeom, shaftMat);
            shaftMesh.position.y = -1.1;
            group.add(shaftMesh);

            // Flywheel on drivetrain end
            const flywheelGeom = new THREE.CylinderGeometry(0.9, 0.9, 0.15, 24);
            flywheelGeom.rotateZ(Math.PI / 2);
            const flywheelMat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.emerald,
                wireframe: true
            });
            const flywheelMesh = new THREE.Mesh(flywheelGeom, flywheelMat);
            flywheelMesh.position.set(1.95, -1.1, 0);
            group.add(flywheelMesh);

            // Overhead Camshaft / Valves at top
            const camGeom = new THREE.CylinderGeometry(0.08, 0.08, 3.4, 12);
            camGeom.rotateZ(Math.PI / 2);
            const camMesh = new THREE.Mesh(camGeom, shaftMat);
            camMesh.position.set(0, 1.25, 0);
            group.add(camMesh);

            this.animatables.push((elapsed) => {
                flywheelMesh.rotation.x = elapsed * 4;
                pistons.forEach(p => {
                    const stroke = Math.sin(elapsed * 4 + p.phase);
                    p.group.position.y = stroke * 0.45 + 0.1;
                });
            });
        }

        // ======================================================================
        // 3. MECHANICAL ENGINEERING: CAD & MACHINERY (Planetary Gear Train)
        // ======================================================================
        buildMechanicalCAD(group) {
            // Central Sun Gear
            const sunGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.35, 24);
            const gearMat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.indigo,
                wireframe: true,
                metalness: 0.8
            });
            const sunGear = new THREE.Mesh(sunGeom, gearMat);
            group.add(sunGear);

            // 3 Orbiting Planet Gears
            const planetGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 18);
            const planetMat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.emerald,
                wireframe: true,
                metalness: 0.7
            });

            const planets = [];
            for (let i = 0; i < 3; i++) {
                const p = new THREE.Mesh(planetGeom, planetMat);
                group.add(p);
                planets.push(p);
            }

            // Outer Ring Gear Enclosure
            const ringGeom = new THREE.TorusGeometry(2.1, 0.12, 12, 48);
            const ringMat = new THREE.MeshBasicMaterial({
                color: HolographicPalette.cyan,
                wireframe: true
            });
            const ringMesh = new THREE.Mesh(ringGeom, ringMat);
            ringMesh.rotation.x = Math.PI / 2;
            group.add(ringMesh);

            this.animatables.push((elapsed) => {
                sunGear.rotation.y = elapsed * 1.5;
                planets.forEach((p, idx) => {
                    const orbitAngle = elapsed * 0.5 + (idx * Math.PI * 2) / 3;
                    p.position.x = Math.cos(orbitAngle) * 1.35;
                    p.position.z = Math.sin(orbitAngle) * 1.35;
                    p.rotation.y = -elapsed * 2.2;
                });
            });
        }

        // ======================================================================
        // 4. EIE: SENSORS & INDUSTRIAL INSTRUMENTATION (Transducer & Telemetry)
        // ======================================================================
        buildIndustrialSensors(group) {
            // Sensor Cylindrical Probe Body
            const probeGeom = new THREE.CylinderGeometry(0.4, 0.4, 3.2, 24);
            const probeMat = new THREE.MeshStandardMaterial({
                color: 0x1E293B,
                metalness: 0.9,
                roughness: 0.2
            });
            const probe = new THREE.Mesh(probeGeom, probeMat);
            group.add(probe);

            // Hex Threaded Collar
            const hexGeom = new THREE.CylinderGeometry(0.65, 0.65, 0.4, 6);
            const hexMat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.amber,
                metalness: 0.8
            });
            const hex = new THREE.Mesh(hexGeom, hexMat);
            hex.position.y = 0.4;
            group.add(hex);

            // Sensor Tip (Transducer Diaphragm)
            const tipGeom = new THREE.SphereGeometry(0.42, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const tipMat = new THREE.MeshBasicMaterial({
                color: HolographicPalette.cyan,
                wireframe: true
            });
            const tip = new THREE.Mesh(tipGeom, tipMat);
            tip.position.y = 1.6;
            group.add(tip);

            // Pulsing Holographic Wave Telemetry Rings
            const ringCount = 4;
            const rings = [];
            for (let i = 0; i < ringCount; i++) {
                const rGeom = new THREE.RingGeometry(0.8 + i * 0.4, 0.85 + i * 0.4, 32);
                const rMat = new THREE.MeshBasicMaterial({
                    color: HolographicPalette.cyan,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.6 - i * 0.12
                });
                const rMesh = new THREE.Mesh(rGeom, rMat);
                rMesh.rotation.x = Math.PI / 2;
                rMesh.position.y = -0.8 + i * 0.5;
                group.add(rMesh);
                rings.push(rMesh);
            }

            this.animatables.push((elapsed) => {
                rings.forEach((r, idx) => {
                    const scale = 1 + Math.sin(elapsed * 2 + idx) * 0.15;
                    r.scale.set(scale, scale, 1);
                });
            });
        }

        // ======================================================================
        // 5. EEE: POWER GRID & ELECTRICAL MACHINES (Stator & Electromagnetic Rotor)
        // ======================================================================
        buildPowerGridMachine(group) {
            // Stator Outer Yoke
            const statorGeom = new THREE.TorusGeometry(1.9, 0.35, 16, 32);
            const statorMat = new THREE.MeshStandardMaterial({
                color: 0x334155,
                metalness: 0.8,
                roughness: 0.3
            });
            const stator = new THREE.Mesh(statorGeom, statorMat);
            stator.rotation.x = Math.PI / 2;
            group.add(stator);

            // Copper Coil Windings around Stator
            const coilCount = 8;
            for (let i = 0; i < coilCount; i++) {
                const angle = (i * Math.PI * 2) / coilCount;
                const cGeom = new THREE.BoxGeometry(0.4, 0.5, 0.4);
                const cMat = new THREE.MeshStandardMaterial({
                    color: HolographicPalette.amber,
                    metalness: 0.9,
                    roughness: 0.2
                });
                const coil = new THREE.Mesh(cGeom, cMat);
                coil.position.set(Math.cos(angle) * 1.9, 0, Math.sin(angle) * 1.9);
                group.add(coil);
            }

            // High-Speed Electromagnetic Rotor
            const rotorGeom = new THREE.CylinderGeometry(0.9, 0.9, 1.4, 16);
            const rotorMat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.cyan,
                wireframe: true,
                metalness: 0.7
            });
            const rotor = new THREE.Mesh(rotorGeom, rotorMat);
            group.add(rotor);

            this.animatables.push((elapsed) => {
                rotor.rotation.y = elapsed * 3.5;
            });
        }

        // ======================================================================
        // 6. CSE & IT: CLOUD ARCHITECTURE & COMPUTING (Blade Rack & Data Matrix)
        // ======================================================================
        buildCloudArchitecture(group) {
            // Isometric Distributed Computing Server Nodes (3x3 Matrix)
            const nodeGeom = new THREE.BoxGeometry(0.7, 0.25, 0.7);
            const nodeMat = new THREE.MeshStandardMaterial({
                color: 0x0F172A,
                metalness: 0.85,
                roughness: 0.25
            });
            const edgeMat = new THREE.LineBasicMaterial({ color: HolographicPalette.indigo });

            const nodes = [];
            for (let x = -1; x <= 1; x++) {
                for (let z = -1; z <= 1; z++) {
                    const nGroup = new THREE.Group();
                    nGroup.position.set(x * 1.2, 0, z * 1.2);

                    const mesh = new THREE.Mesh(nodeGeom, nodeMat);
                    nGroup.add(mesh);

                    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(nodeGeom), edgeMat);
                    nGroup.add(edges);

                    group.add(nGroup);
                    nodes.push(nGroup);
                }
            }

            // Central Cloud Core Cube (Elevated)
            const coreGeom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const coreMat = new THREE.MeshBasicMaterial({
                color: HolographicPalette.cyan,
                wireframe: true
            });
            const core = new THREE.Mesh(coreGeom, coreMat);
            core.position.y = 1.4;
            group.add(core);

            this.animatables.push((elapsed) => {
                core.rotation.x = elapsed * 0.6;
                core.rotation.y = elapsed * 0.8;
                nodes.forEach((n, idx) => {
                    n.position.y = Math.sin(elapsed * 2 + idx * 0.4) * 0.15;
                });
            });
        }

        // ======================================================================
        // 7. AI/ML & DATA SCIENCE: DEEP NEURAL NETWORK (Synaptic Graph & Impulses)
        // ======================================================================
        buildNeuralNetwork(group) {
            const layers = [3, 5, 5, 2]; // 4 Layers: Input, Hidden1, Hidden2, Output
            const layerSpacing = 1.2;
            const nodeGeom = new THREE.SphereGeometry(0.14, 16, 16);
            const nodeMat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.violet,
                emissive: HolographicPalette.indigo,
                emissiveIntensity: 0.7
            });

            const allNodes = [];
            const layerNodes = [];

            layers.forEach((count, lIdx) => {
                const x = (lIdx - (layers.length - 1) / 2) * layerSpacing;
                const currentLayer = [];

                for (let n = 0; n < count; n++) {
                    const y = (n - (count - 1) / 2) * 0.65;
                    const mesh = new THREE.Mesh(nodeGeom, nodeMat);
                    mesh.position.set(x, y, 0);
                    group.add(mesh);
                    currentLayer.push(mesh);
                    allNodes.push(mesh);
                }
                layerNodes.push(currentLayer);
            });

            // Connect adjacent layers with holographic synapse lines
            for (let l = 0; l < layerNodes.length - 1; l++) {
                const fromNodes = layerNodes[l];
                const toNodes = layerNodes[l + 1];

                fromNodes.forEach(from => {
                    toNodes.forEach(to => {
                        const lineGeom = new THREE.BufferGeometry().setFromPoints([from.position, to.position]);
                        const lineMat = new THREE.LineBasicMaterial({
                            color: HolographicPalette.cyan,
                            transparent: true,
                            opacity: 0.35
                        });
                        const line = new THREE.Line(lineGeom, lineMat);
                        group.add(line);
                    });
                });
            }

            this.animatables.push((elapsed) => {
                allNodes.forEach((node, idx) => {
                    const pulse = (Math.sin(elapsed * 3 + idx * 0.6) + 1) * 0.5;
                    node.scale.setScalar(0.9 + pulse * 0.35);
                });
            });
        }

        // ======================================================================
        // 8. CIVIL: STRUCTURAL ENGINEERING & BRIDGES (Cable-Stayed Bridge Truss)
        // ======================================================================
        buildCivilBridge(group) {
            // Main Pylon Tower
            const pylonGeom = new THREE.ConeGeometry(0.3, 3.6, 4);
            const pylonMat = new THREE.MeshStandardMaterial({
                color: 0x334155,
                wireframe: true,
                metalness: 0.8
            });
            const pylon = new THREE.Mesh(pylonGeom, pylonMat);
            group.add(pylon);

            // Deck Girder
            const deckGeom = new THREE.BoxGeometry(4.6, 0.15, 0.9);
            const deckMat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.cyan,
                metalness: 0.9,
                roughness: 0.2
            });
            const deck = new THREE.Mesh(deckGeom, deckMat);
            deck.position.y = -0.5;
            group.add(deck);

            // Stay Cables from pylon top to deck
            const cablePoints = [-2.0, -1.4, -0.8, 0.8, 1.4, 2.0];
            cablePoints.forEach(x => {
                const cGeom = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, 1.4, 0),
                    new THREE.Vector3(x, -0.5, 0)
                ]);
                const cMat = new THREE.LineBasicMaterial({ color: HolographicPalette.emerald, transparent: true, opacity: 0.7 });
                const cable = new THREE.Line(cGeom, cMat);
                group.add(cable);
            });
        }

        // ======================================================================
        // 9. CHEMICAL: PROCESS PLANT & REACTORS (Distillation Column & Coil)
        // ======================================================================
        buildChemicalReactor(group) {
            // Column Shell
            const colGeom = new THREE.CylinderGeometry(0.8, 0.8, 3.4, 24);
            const colMat = new THREE.MeshStandardMaterial({
                color: 0x0F172A,
                wireframe: true,
                transparent: true,
                opacity: 0.55
            });
            const col = new THREE.Mesh(colGeom, colMat);
            group.add(col);

            // Internal Trays
            for (let y = -1.2; y <= 1.2; y += 0.6) {
                const trayGeom = new THREE.CylinderGeometry(0.75, 0.75, 0.05, 20);
                const trayMat = new THREE.MeshBasicMaterial({ color: HolographicPalette.amber });
                const tray = new THREE.Mesh(trayGeom, trayMat);
                tray.position.y = y;
                group.add(tray);
            }

            // Outer Heat Exchanger Spiral Coil
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(1.1, -1.5, 0),
                new THREE.Vector3(0, -1.0, 1.1),
                new THREE.Vector3(-1.1, -0.5, 0),
                new THREE.Vector3(0, 0, -1.1),
                new THREE.Vector3(1.1, 0.5, 0),
                new THREE.Vector3(0, 1.0, 1.1),
                new THREE.Vector3(-1.1, 1.5, 0)
            ]);
            const tubeGeom = new THREE.TubeGeometry(curve, 36, 0.08, 8, false);
            const tubeMat = new THREE.MeshStandardMaterial({ color: HolographicPalette.cyan, metalness: 0.8 });
            const tube = new THREE.Mesh(tubeGeom, tubeMat);
            group.add(tube);
        }

        // ======================================================================
        // 10. BIOTECH & BIOMEDICAL: DNA DOUBLE HELIX
        // ======================================================================
        buildDNAHelix(group) {
            const steps = 24;
            const radius = 1.0;
            const height = 3.6;
            const sphereGeom = new THREE.SphereGeometry(0.12, 12, 12);
            const sMat1 = new THREE.MeshStandardMaterial({ color: HolographicPalette.emerald });
            const sMat2 = new THREE.MeshStandardMaterial({ color: HolographicPalette.cyan });
            const rungMat = new THREE.LineBasicMaterial({ color: HolographicPalette.wireframeGlow });

            for (let i = 0; i < steps; i++) {
                const angle = (i / steps) * Math.PI * 4;
                const y = ((i / steps) - 0.5) * height;

                const x1 = Math.cos(angle) * radius;
                const z1 = Math.sin(angle) * radius;

                const x2 = -x1;
                const z2 = -z1;

                const m1 = new THREE.Mesh(sphereGeom, sMat1);
                m1.position.set(x1, y, z1);
                group.add(m1);

                const m2 = new THREE.Mesh(sphereGeom, sMat2);
                m2.position.set(x2, y, z2);
                group.add(m2);

                const rGeom = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(x1, y, z1),
                    new THREE.Vector3(x2, y, z2)
                ]);
                const rung = new THREE.Line(rGeom, rungMat);
                group.add(rung);
            }
        }

        // ======================================================================
        // 11. AEROSPACE: JET ENGINE TURBINE (Rotors & Bladed Shroud)
        // ======================================================================
        buildJetTurbine(group) {
            // Central Nose Cone Spinner
            const coneGeom = new THREE.ConeGeometry(0.5, 1.2, 16);
            coneGeom.rotateX(Math.PI / 2);
            const coneMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.9 });
            const cone = new THREE.Mesh(coneGeom, coneMat);
            cone.position.z = 0.6;
            group.add(cone);

            // Outer Shroud Ring
            const shroudGeom = new THREE.CylinderGeometry(2.0, 1.8, 1.8, 32, 1, true);
            shroudGeom.rotateX(Math.PI / 2);
            const shroudMat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.cyan,
                wireframe: true
            });
            const shroud = new THREE.Mesh(shroudGeom, shroudMat);
            group.add(shroud);

            // Rotating Turbine Fan Blades
            const bladeCount = 18;
            const bladeGeom = new THREE.BoxGeometry(0.18, 0.9, 0.04);
            const bladeMat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.amber,
                metalness: 0.8
            });

            const rotorGroup = new THREE.Group();
            for (let i = 0; i < bladeCount; i++) {
                const angle = (i * Math.PI * 2) / bladeCount;
                const b = new THREE.Mesh(bladeGeom, bladeMat);
                b.position.set(Math.cos(angle) * 1.1, Math.sin(angle) * 1.1, 0);
                b.rotation.z = angle + 0.4;
                rotorGroup.add(b);
            }
            group.add(rotorGroup);

            this.animatables.push((elapsed) => {
                rotorGroup.rotation.z = elapsed * 4.5;
            });
        }

        // ======================================================================
        // 12. MECHATRONICS & ROBOTICS: ARTICULATED ROBOT ARM
        // ======================================================================
        buildRoboticArm(group) {
            // Base Turntable
            const baseGeom = new THREE.CylinderGeometry(1.2, 1.3, 0.3, 24);
            const baseMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.8 });
            const base = new THREE.Mesh(baseGeom, baseMat);
            base.position.y = -1.2;
            group.add(base);

            // Shoulder Joint
            const shoulderGeom = new THREE.SphereGeometry(0.4, 16, 16);
            const jMat = new THREE.MeshStandardMaterial({ color: HolographicPalette.amber, wireframe: true });
            const shoulder = new THREE.Mesh(shoulderGeom, jMat);
            shoulder.position.y = -0.8;
            group.add(shoulder);

            // Arm Link 1
            const link1Geom = new THREE.CylinderGeometry(0.16, 0.16, 1.4, 12);
            const lMat = new THREE.MeshStandardMaterial({ color: HolographicPalette.cyan, metalness: 0.9 });
            const link1 = new THREE.Mesh(link1Geom, lMat);
            link1.position.set(0.3, -0.1, 0);
            link1.rotation.z = -0.45;
            group.add(link1);

            // Arm Link 2 & Gripper End Effector
            const link2Geom = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 12);
            const link2 = new THREE.Mesh(link2Geom, lMat);
            link2.position.set(0.8, 0.8, 0);
            link2.rotation.z = 0.55;
            group.add(link2);

            // Gripper Fingers
            const gripGeom = new THREE.BoxGeometry(0.08, 0.35, 0.08);
            const gMat = new THREE.MeshBasicMaterial({ color: HolographicPalette.emerald });
            const f1 = new THREE.Mesh(gripGeom, gMat);
            f1.position.set(1.25, 1.35, 0.15);
            const f2 = new THREE.Mesh(gripGeom, gMat);
            f2.position.set(1.25, 1.35, -0.15);
            group.add(f1);
            group.add(f2);
        }

        // ======================================================================
        // 13. CNC & ADVANCED MANUFACTURING: MILLING SPINDLE
        // ======================================================================
        buildCNCMachine(group) {
            const spindleGeom = new THREE.CylinderGeometry(0.7, 0.7, 2.2, 24);
            const sMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.9 });
            const spindle = new THREE.Mesh(spindleGeom, sMat);
            group.add(spindle);

            const toolGeom = new THREE.CylinderGeometry(0.12, 0.04, 1.0, 16);
            const tMat = new THREE.MeshStandardMaterial({ color: HolographicPalette.gold, metalness: 0.95 });
            const tool = new THREE.Mesh(toolGeom, tMat);
            tool.position.y = -1.5;
            group.add(tool);

            const grid = new THREE.GridHelper(3.0, 10, HolographicPalette.cyan, HolographicPalette.indigo);
            grid.position.y = -2.0;
            group.add(grid);

            this.animatables.push((elapsed) => {
                tool.rotation.y = elapsed * 8.0;
            });
        }

        // ======================================================================
        // UNIVERSAL CORE: Polyhedral Precision Engineering Holo
        // ======================================================================
        buildUniversalEngineeringCore(group) {
            const geom = new THREE.IcosahedronGeometry(1.6, 1);
            const mat = new THREE.MeshStandardMaterial({
                color: HolographicPalette.indigo,
                wireframe: true,
                metalness: 0.8
            });
            const mesh = new THREE.Mesh(geom, mat);
            group.add(mesh);
        }

        addHolographicDatumRings(group) {
            // Horizontal Datum Horizon Ring
            const ringGeom = new THREE.RingGeometry(2.6, 2.65, 48);
            const ringMat = new THREE.MeshBasicMaterial({
                color: HolographicPalette.wireframeGlow,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.3
            });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = -1.4;
            group.add(ring);
        }

        // ======================================================================
        // RENDER LOOP & PARALLAX
        // ======================================================================
        start() {
            if (this.animationFrameId) return;

            const animate = () => {
                this.animationFrameId = requestAnimationFrame(animate);

                // Pause when off-screen, tab hidden, or canvas detached
                if (this.isPaused || !this.isIntersecting || !this.renderer || !this.scene) {
                    return;
                }

                const elapsed = this.clock ? this.clock.getElapsedTime() : 0;

                // Smoothly interpolate user interaction state
                this.userRotationX += (this.targetUserRotX - this.userRotationX) * 0.12;
                this.userRotationY += (this.targetUserRotY - this.userRotationY) * 0.12;
                this.panX += (this.targetPanX - this.panX) * 0.12;
                this.panY += (this.targetPanY - this.panY) * 0.12;
                this.cameraDistance += (this.targetCameraDistance - this.cameraDistance) * 0.12;

                // Apply Camera Zoom & Pan Position
                if (this.camera) {
                    this.camera.position.set(this.panX, this.panY, this.cameraDistance);
                    this.camera.lookAt(this.panX, this.panY, 0);
                }

                // Subtle continuous rotation unless reduced motion is active or user is actively dragging
                if (this.autoRotate && !this.prefersReducedMotion && !this.isDragging && this.activeModelGroup) {
                    this.activeModelGroup.rotation.y += 0.006;
                }

                // Smooth Parallax + User Drag Rotation
                if (this.activeModelGroup) {
                    this.activeModelGroup.rotation.x = this.userRotationX + (this.targetRotationX * 0.4);
                    this.activeModelGroup.rotation.y += (this.userRotationY - (this._prevUserRotY || 0));
                    this.activeModelGroup.rotation.z = (this.targetRotationY * 0.3);
                    this._prevUserRotY = this.userRotationY;
                }

                // Run active sub-animations
                for (let i = 0; i < this.animatables.length; i++) {
                    try {
                        this.animatables[i](elapsed);
                    } catch (e) {}
                }

                this.renderer.render(this.scene, this.camera);
            };

            animate();
        }

        stop() {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }

        destroy() {
            this.stop();
            this.unbindEvents();
            this.clearActiveModel();
            if (this.observer) {
                try {
                    this.observer.disconnect();
                } catch (e) {}
                this.observer = null;
            }
            if (this.renderer) {
                try {
                    this.renderer.dispose();
                } catch (e) {}
                this.renderer = null;
            }
            if (this.container && this.canvas && this.canvas.parentNode === this.container) {
                this.container.removeChild(this.canvas);
            }
            const toolbar = this.container?.parentElement?.querySelector('.holo-hud-toolbar');
            if (toolbar) {
                toolbar.remove();
            }
            this.canvas = null;
            this.scene = null;
            this.camera = null;
        }
    }

    // Export singleton
    window.Branch3DHologram = new Branch3DHologramEngine();

})(window);
