/**
 * R&L Fitness - Three.js 3D Interactive Static Posture Simulator
 * 
 * Demonstrates the exact, textbook static posture for each exercise:
 * - Clean human character model positioned in textbook form
 * - Zero continuous movement or repetition (pure static posture)
 * - 360° interactive rotation, zoom, and instant camera angle presets
 * - Clear Hebrew posture cues & technique checklist
 */

class SimulationManager {
  constructor() {
    this.modal = null;
    this.container = null;
    this.titleEl = null;
    this.badgeEl = null;
    this.cuesListEl = null;
    this.resetCamBtn = null;
    this.sideCamBtn = null;
    this.frontCamBtn = null;
    this.isoCamBtn = null;
    this.closeBtn = null;

    this.isOpen = false;
    this.currentExerciseId = 'squats';
    this.currentPostureData = null;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.mannequinData = null;
    this.propsData = null;
    this.animator = null;
    this.reqAnimId = null;
    this.isDomBound = false;

    // Pointer drag fallback
    this.isDragging = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.bindDom());
    } else {
      this.bindDom();
    }
  }

  bindDom() {
    if (this.isDomBound) return;

    this.modal = document.getElementById('three-simulation-modal');
    this.container = document.getElementById('three-canvas-container');
    this.titleEl = document.getElementById('modal-exercise-title');
    this.badgeEl = document.getElementById('modal-posture-badge');
    this.cuesListEl = document.getElementById('posture-cues-list');
    this.resetCamBtn = document.getElementById('btn-cam-reset');
    this.sideCamBtn = document.getElementById('btn-cam-side');
    this.frontCamBtn = document.getElementById('btn-cam-front');
    this.isoCamBtn = document.getElementById('btn-cam-iso');
    this.closeBtn = document.getElementById('btn-close-sim-modal');

    if (!this.modal || !this.container) return;

    this.isDomBound = true;
    this.initListeners();
  }

  initListeners() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.key === 'Escape') {
        this.close();
      }
    });

    if (this.resetCamBtn) {
      this.resetCamBtn.addEventListener('click', () => this.setCameraView('default'));
    }

    if (this.sideCamBtn) {
      this.sideCamBtn.addEventListener('click', () => this.setCameraView('side'));
    }

    if (this.frontCamBtn) {
      this.frontCamBtn.addEventListener('click', () => this.setCameraView('front'));
    }

    if (this.isoCamBtn) {
      this.isoCamBtn.addEventListener('click', () => this.setCameraView('iso'));
    }

    window.addEventListener('resize', () => {
      if (this.isOpen) this.onResize();
    });
  }

  initThree() {
    if (this.renderer) return;
    const THREE = window.THREE;
    if (!THREE) {
      console.error("Three.js library is not available.");
      return;
    }

    let width = this.container ? (this.container.clientWidth || this.container.offsetWidth) : 800;
    let height = this.container ? (this.container.clientHeight || this.container.offsetHeight) : 500;
    if (!width || width <= 0) width = 800;
    if (!height || height <= 0) height = 500;

    // Scene with warm neutral studio background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF6F3ED);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(2.4, 1.4, 2.8);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls for 360° rotation
    const OrbitControlsClass = THREE.OrbitControls || (window.THREE && window.THREE.OrbitControls);
    if (OrbitControlsClass) {
      try {
        this.controls = new OrbitControlsClass(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.minDistance = 1.2;
        this.controls.maxDistance = 8.0;
        this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
        this.controls.target.set(0, 0.8, 0);
        this.controls.update();
      } catch (err) {
        console.warn("OrbitControls fallback:", err);
      }
    }

    this.setupFallbackPointerControls();

    // Studio Lighting Palette
    const ambientLight = new THREE.AmbientLight(0xF7F4ED, 0.80);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.90);
    keyLight.position.set(3.5, 6.0, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.bias = -0.001;
    this.scene.add(keyLight);

    // Sage Green Fill Light (#8FA28A)
    const fillLight = new THREE.DirectionalLight(0x8FA28A, 0.40);
    fillLight.position.set(-4.0, 3.0, -2.0);
    this.scene.add(fillLight);

    // Muted Gold Rim Light (#C8A96B)
    const rimLight = new THREE.DirectionalLight(0xC8A96B, 0.45);
    rimLight.position.set(0, 4.5, -4.0);
    this.scene.add(rimLight);

    // Build Character & Props
    const builder = new window.MannequinBuilder(THREE);
    this.mannequinData = builder.buildMannequin();
    this.propsData = builder.buildProps();

    this.scene.add(this.propsData.propsRoot);
    this.scene.add(this.mannequinData.root);

    // Static Posture Engine
    this.animator = new window.ExerciseAnimations();
  }

  setupFallbackPointerControls() {
    if (!this.renderer || !this.renderer.domElement) return;
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    dom.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.prevMouseX;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      if (!this.controls && this.mannequinData && this.mannequinData.root) {
        this.mannequinData.root.rotation.y += deltaX * 0.01;
      }
    });

    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.prevMouseX = e.touches[0].clientX;
        this.prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    dom.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.prevMouseX;
      this.prevMouseX = e.touches[0].clientX;
      this.prevMouseY = e.touches[0].clientY;

      if (!this.controls && this.mannequinData && this.mannequinData.root) {
        this.mannequinData.root.rotation.y += deltaX * 0.01;
      }
    }, { passive: true });
  }

  open(exerciseId, exerciseTitleHebrew) {
    this.bindDom();

    if (!this.modal) {
      console.error("Simulation modal element not found.");
      return;
    }

    // 1. Show modal first so container has geometry
    this.modal.classList.add('active');
    this.isOpen = true;

    // 2. Initialize Three.js
    this.initThree();

    this.currentExerciseId = exerciseId;
    this.animStartTime = performance.now() / 1000;

    // 3. Apply exact static posture (or initialize squat animation at t=0)
    if (this.animator && this.mannequinData && this.propsData) {
      this.currentPostureData = this.animator.applyPosture(
        this.currentExerciseId,
        this.mannequinData.joints,
        this.propsData
      );
    }

    // 4. Update UI labels and Hebrew posture cues
    const isAnimated = ['squats', 'pushups', 'bench-dips', 'step-ups', 'lunges', 'superman', 'crunches'].includes(this.currentExerciseId);

    if (this.titleEl) {
      if (this.currentExerciseId === 'squats') {
        this.titleEl.textContent = `הדמיית סקוואט בתנועה (מחזור 3 שניות): ${exerciseTitleHebrew}`;
      } else if (this.currentExerciseId === 'pushups') {
        this.titleEl.textContent = `הדמיית שכיבות סמיכה בתנועה (מחזור 3 שניות): ${exerciseTitleHebrew}`;
      } else if (this.currentExerciseId === 'bench-dips') {
        this.titleEl.textContent = `הדמיית פשיטת מרפקים בתנועה (מחזור 3 שניות): ${exerciseTitleHebrew}`;
      } else if (this.currentExerciseId === 'step-ups') {
        this.titleEl.textContent = `הדמיית עליות מדרגה בתנועה (מחזור 3 שניות): ${exerciseTitleHebrew}`;
      } else if (this.currentExerciseId === 'lunges') {
        this.titleEl.textContent = `הדמיית לאנצ'ים בתנועה (מחזור 3 שניות): ${exerciseTitleHebrew}`;
      } else if (this.currentExerciseId === 'superman') {
        this.titleEl.textContent = `הדמיית סופרמן בתנועה (מחזור 3 שניות): ${exerciseTitleHebrew}`;
      } else if (this.currentExerciseId === 'crunches') {
        this.titleEl.textContent = `הדמיית כפיפות בטן בתנועה (מחזור 3 שניות): ${exerciseTitleHebrew}`;
      } else {
        this.titleEl.textContent = `הדמיית מנח סטטי נכון: ${exerciseTitleHebrew}`;
      }
    }

    if (this.badgeEl) {
      this.badgeEl.textContent = isAnimated
        ? 'אנימציה רציפה (3 שניות)'
        : 'מנח סטטי נכון (360°)';
    }

    if (this.cuesListEl && this.currentPostureData && this.currentPostureData.cues) {
      this.cuesListEl.innerHTML = this.currentPostureData.cues.map(cue => `
        <li>
          <span class="cue-bullet">✔</span>
          <span>${cue}</span>
        </li>
      `).join('');
    }

    // 5. Set default camera view for this posture
    this.setCameraView('default');

    // 6. Force canvas resize
    this.onResize();
    requestAnimationFrame(() => this.onResize());
    setTimeout(() => this.onResize(), 60);

    // 7. Render static scene (controls remain responsive for 360° inspection)
    if (!this.reqAnimId) {
      this.renderLoop();
    }
  }

  close() {
    this.isOpen = false;
    if (this.modal) {
      this.modal.classList.remove('active');
    }
    if (this.reqAnimId) {
      cancelAnimationFrame(this.reqAnimId);
      this.reqAnimId = null;
    }
  }

  /**
   * Switches camera presets to easily inspect form from any angle
   */
  setCameraView(mode) {
    if (!this.camera) return;

    // Highlight active preset button
    const buttons = [this.resetCamBtn, this.sideCamBtn, this.frontCamBtn, this.isoCamBtn];
    buttons.forEach(btn => btn && btn.classList.remove('active'));

    const isFloor = ['pushups', 'superman', 'crunches', 'plank'].includes(this.currentExerciseId);
    const defCam = (this.currentPostureData && this.currentPostureData.defaultCam) || {};
    const targetX = defCam.targetX !== undefined ? defCam.targetX : (this.currentExerciseId === 'step-ups' ? -0.10 : 0.0);
    const targetY = defCam.targetY !== undefined ? defCam.targetY : (isFloor ? 0.20 : (this.currentExerciseId === 'step-ups' ? 1.05 : 0.65));
    const targetZ = defCam.targetZ !== undefined ? defCam.targetZ : (this.currentExerciseId === 'step-ups' ? 0.35 : 0.0);

    if (mode === 'side') {
      if (this.sideCamBtn) this.sideCamBtn.classList.add('active');
      // Side profile (X-axis dominant)
      this.camera.position.set(targetX + (isFloor ? 2.8 : 3.2), targetY + 0.30, targetZ);
    } else if (mode === 'front') {
      if (this.frontCamBtn) this.frontCamBtn.classList.add('active');
      // Front view (Z-axis dominant)
      this.camera.position.set(targetX, targetY + 0.35, targetZ + (isFloor ? 2.7 : 3.2));
    } else if (mode === 'iso') {
      if (this.isoCamBtn) this.isoCamBtn.classList.add('active');
      // Isometric 45° angle
      this.camera.position.set(targetX + 2.3, targetY + 0.55, targetZ + 2.2);
    } else {
      // Default recommended angle
      if (this.resetCamBtn) this.resetCamBtn.classList.add('active');
      if (defCam.x !== undefined) {
        this.camera.position.set(defCam.x, defCam.y, defCam.z);
      } else {
        this.camera.position.set(targetX + 2.4, targetY + 0.55, targetZ + 2.4);
      }
    }

    if (this.controls) {
      this.controls.target.set(targetX, targetY, targetZ);
      this.controls.update();
    }
  }

  onResize() {
    if (!this.renderer || !this.camera || !this.container) return;
    const width = this.container.clientWidth || this.container.offsetWidth;
    const height = this.container.clientHeight || this.container.offsetHeight;
    if (!width || !height || width <= 0 || height <= 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Continuous render loop for OrbitControls responsiveness and dynamic squat animation
   */
  renderLoop() {
    if (!this.isOpen) {
      this.reqAnimId = null;
      return;
    }

    this.reqAnimId = requestAnimationFrame(() => this.renderLoop());

    // Continuous 3-second looping animations for dynamic exercises:
    // - Squats: starts in squat (t=0s), rises up to standing (t=1.5s), lowers back down to squat (t=3.0s)
    // - Push-ups: starts with arms fully straight (t=0s), elbows bend downward into lower position (t=1.5s),
    //   focusing specifically on elbows while body stays stable, and pushes back up to straight arms (t=3.0s)
    // - Bench Dips: starts with arms fully straight on bench edge (t=0s), elbows bend to 90 degrees (t=1.5s),
    //   and pushes back up with triceps to straight arms (t=3.0s)
    // - Step-ups: starts in elevated position on chair (t=0s), leg on chair bends as floating leg steps down to floor (t=1.5s),
    //   and pushes back up to return to elevated position on chair (t=3.0s)
    // - Lunges: starts in deep lunge (t=0s), knees straighten to rise up slightly (t=1.5s),
    //   and bends knees back down into starting deep lunge (t=3.0s)
    // - Superman: starts in peak lifted position (t=0s), arms and straight legs lower down slightly without touching floor (t=1.5s),
    //   and lift back up to elevated position (t=3.0s)
    // - Crunches: starts lying flat on back on floor (t=0s), upper back/chest/head/arms curl upward to halfway up toward knees (t=1.5s),
    //   and lower back down smoothly to lie flat on the floor (t=3.0s)
    if (this.animator && this.mannequinData) {
      const elapsed = (performance.now() / 1000) - (this.animStartTime || 0);
      if (this.currentExerciseId === 'squats') {
        this.animator.animateSquats(this.mannequinData.joints, elapsed);
      } else if (this.currentExerciseId === 'pushups') {
        this.animator.animatePushups(this.mannequinData.joints, elapsed);
      } else if (this.currentExerciseId === 'bench-dips') {
        this.animator.animateBenchDips(this.mannequinData.joints, elapsed);
      } else if (this.currentExerciseId === 'step-ups') {
        this.animator.animateStepUps(this.mannequinData.joints, elapsed);
      } else if (this.currentExerciseId === 'lunges') {
        this.animator.animateLunges(this.mannequinData.joints, elapsed);
      } else if (this.currentExerciseId === 'superman') {
        this.animator.animateSuperman(this.mannequinData.joints, elapsed);
      } else if (this.currentExerciseId === 'crunches') {
        this.animator.animateCrunches(this.mannequinData.joints, elapsed);
      }
    }

    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Global exposure
if (typeof window !== 'undefined') {
  window.SimulationManager = SimulationManager;
  window.simulationManager = new SimulationManager();
}
