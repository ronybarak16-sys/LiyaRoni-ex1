/**
 * R&L Fitness - Main Application Controller
 * Handles 10-slide transitions, Timed vs Untimed workout rules,
 * 45-second set countdowns, BiDi Hebrew RTL support, and metrics.
 */

class WorkoutApp {
  constructor() {
    this.currentSlideIndex = 0; // 0 to 9 (Slides 1 to 10)
    this.totalSlides = 10;
    this.workoutMode = 'timed'; // 'timed' or 'untimed'
    
    // Workout Timer State
    this.SET_DURATION = 45; // 45 seconds per set
    this.TOTAL_SETS_PER_EXERCISE = 3;

    // Per-exercise state tracking (for slides 1..8, which are exercises 1..8)
    this.exerciseStates = [
      { id: 'squats', nameHe: 'סקוואטים', setsRemaining: 3, setsCompleted: 0, timer: 45, isRunning: false, isCompleted: false },
      { id: 'pushups', nameHe: 'שכיבות סמיכה', setsRemaining: 3, setsCompleted: 0, timer: 45, isRunning: false, isCompleted: false },
      { id: 'bench-dips', nameHe: 'פשיטת מרפקים', setsRemaining: 3, setsCompleted: 0, timer: 45, isRunning: false, isCompleted: false },
      { id: 'step-ups', nameHe: 'עליות מדרגה על כיסא', setsRemaining: 3, setsCompleted: 0, timer: 45, isRunning: false, isCompleted: false },
      { id: 'lunges', nameHe: 'לאנצ\'ים', setsRemaining: 3, setsCompleted: 0, timer: 45, isRunning: false, isCompleted: false },
      { id: 'superman', nameHe: 'סופרמן', setsRemaining: 3, setsCompleted: 0, timer: 45, isRunning: false, isCompleted: false },
      { id: 'crunches', nameHe: 'כפיפות בטן', setsRemaining: 3, setsCompleted: 0, timer: 45, isRunning: false, isCompleted: false },
      { id: 'plank', nameHe: 'פלאנק', setsRemaining: 3, setsCompleted: 0, timer: 45, isRunning: false, isCompleted: false }
    ];

    // Global session timer
    this.sessionStartTime = null;
    this.sessionTimerInterval = null;
    this.totalElapsedSeconds = 0;

    // Active exercise timer interval
    this.activeInterval = null;

    // DOM Elements
    this.slides = document.querySelectorAll('.slide');
    this.stepDots = document.querySelectorAll('.step-dot');
    this.slideBadge = document.getElementById('slide-counter-badge');
    this.modeStatusPill = document.getElementById('header-mode-text');
    this.btnBack = document.getElementById('btn-nav-back');
    this.btnNext = document.getElementById('btn-nav-next');
    this.nextBtnWrapper = document.getElementById('next-btn-wrapper');
    this.btnAudioToggle = document.getElementById('btn-audio-toggle');
    this.btnStartWorkout = document.getElementById('btn-start-workout');

    this.init();
  }

  init() {
    this.bindEvents();
    this.updateSlideView();
    this.updateNavButtons();
    this.setupExerciseEventListeners();
  }

  bindEvents() {
    // Mode selection cards on Slide 1
    const modeCards = document.querySelectorAll('.mode-option-card');
    modeCards.forEach((card) => {
      card.addEventListener('click', () => {
        modeCards.forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        this.workoutMode = card.dataset.mode;
        this.updateModePill();
        this.updateNavButtons();
      });
    });

    // Start workout button on Slide 1
    if (this.btnStartWorkout) {
      this.btnStartWorkout.addEventListener('click', () => {
        this.startSessionTimer();
        this.goToSlide(1); // Go to Exercise 1 (Slide 2)
      });
    }

    // Global Navigation: Back button (Always active across screens)
    if (this.btnBack) {
      this.btnBack.addEventListener('click', () => {
        if (this.currentSlideIndex > 0) {
          this.goToSlide(this.currentSlideIndex - 1);
        }
      });
    }

    // Global Navigation: Next button
    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => {
        if (this.canProceedNext()) {
          this.goToSlide(this.currentSlideIndex + 1);
        }
      });
    }

    // Step dots navigation in header
    this.stepDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        // Allow jumping back, or jumping forward if untimed or if exercise is already complete
        if (this.workoutMode === 'untimed' || idx <= this.currentSlideIndex || this.isSlideAllowed(idx)) {
          this.goToSlide(idx);
        }
      });
    });

    // Audio mute toggle
    if (this.btnAudioToggle) {
      this.btnAudioToggle.addEventListener('click', () => {
        const isMuted = window.soundFX.toggleMute();
        this.btnAudioToggle.innerHTML = isMuted
          ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`
          : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
        this.btnAudioToggle.title = isMuted ? "בטל השתקה" : "השתק צלילים";
      });
    }

    // Slide 10: Restart workout
    const restartBtn = document.getElementById('btn-restart-workout');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.resetEntireWorkout();
        this.goToSlide(0);
      });
    }

    // Slide 10: Print/download summary
    const printBtn = document.getElementById('btn-print-summary');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  setupExerciseEventListeners() {
    // 3D Simulation buttons on Slides 2 to 9
    const simButtons = document.querySelectorAll('.btn-open-simulation');
    simButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const exId = btn.dataset.exerciseId;
        const exTitle = btn.dataset.exerciseTitle;
        if (!window.simulationManager && typeof SimulationManager === 'function') {
          window.simulationManager = new SimulationManager();
        }
        if (window.simulationManager) {
          window.simulationManager.open(exId, exTitle);
        }
      });
    });

    // Exercise Timer buttons (Start/Pause, Reset)
    for (let i = 0; i < 8; i++) {
      const slideNum = i + 2;
      const startPauseBtn = document.getElementById(`btn-timer-toggle-${slideNum}`);
      const resetBtn = document.getElementById(`btn-timer-reset-${slideNum}`);

      if (startPauseBtn) {
        startPauseBtn.addEventListener('click', () => this.toggleExerciseTimer(i));
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.resetExerciseTimer(i));
      }
    }
  }

  startSessionTimer() {
    if (!this.sessionStartTime) {
      this.sessionStartTime = Date.now();
      this.sessionTimerInterval = setInterval(() => {
        this.totalElapsedSeconds = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      }, 1000);
    }
  }

  isSlideAllowed(targetSlideIndex) {
    if (this.workoutMode === 'untimed') return true;
    if (targetSlideIndex <= this.currentSlideIndex) return true;

    // Check if all exercises up to target are completed
    for (let i = 0; i < targetSlideIndex - 1; i++) {
      if (this.exerciseStates[i] && !this.exerciseStates[i].isCompleted) {
        return false;
      }
    }
    return true;
  }

  canProceedNext() {
    // On Slide 1, Next button is typically hidden or advances to slide 2
    if (this.currentSlideIndex === 0) return true;

    // Slide 10 has no Next
    if (this.currentSlideIndex >= this.totalSlides - 1) return false;

    // In Untimed Mode: Next button is ALWAYS accessible freely
    if (this.workoutMode === 'untimed') {
      return true;
    }

    // In Timed Mode: Next button is disabled until 3 sets countdown finish & completion banner pops up
    const exIndex = this.currentSlideIndex - 1; // 0..7
    if (this.exerciseStates[exIndex]) {
      return this.exerciseStates[exIndex].isCompleted;
    }

    return true;
  }

  goToSlide(slideIndex) {
    if (slideIndex < 0 || slideIndex >= this.totalSlides) return;

    // Pause any currently running exercise timer
    this.pauseCurrentTimer();

    // Update index
    this.currentSlideIndex = slideIndex;

    this.updateSlideView();
    this.updateNavButtons();

    // If entering Slide 10 (Completion)
    if (slideIndex === 9) {
      this.handleCompletionSlide();
    }
  }

  updateSlideView() {
    // Hide all slides, show active slide
    this.slides.forEach((slide, idx) => {
      if (idx === this.currentSlideIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update Header Counter Badge
    if (this.slideBadge) {
      if (this.currentSlideIndex === 0) {
        this.slideBadge.textContent = 'שקופית 1 מתוך 10 (הגדרות)';
      } else if (this.currentSlideIndex === 9) {
        this.slideBadge.textContent = 'שקופית 10 מתוך 10 (סיום)';
      } else {
        const exNum = this.currentSlideIndex;
        this.slideBadge.textContent = `תרגיל ${exNum} מתוך 8 (שקופית ${this.currentSlideIndex + 1}/10)`;
      }
    }

    // Update Step Dots in Header
    this.stepDots.forEach((dot, idx) => {
      dot.classList.remove('active');
      if (idx === this.currentSlideIndex) {
        dot.classList.add('active');
      }
      if (idx > 0 && idx < 9) {
        const exState = this.exerciseStates[idx - 1];
        if (exState && exState.isCompleted) {
          dot.classList.add('completed');
        } else {
          dot.classList.remove('completed');
        }
      }
    });

    this.updateModePill();
  }

  updateModePill() {
    if (this.modeStatusPill) {
      this.modeStatusPill.textContent = this.workoutMode === 'timed' ? 'אימון מתוזמן (45 שניות)' : 'אימון חופשי (ללא טיימר)';
    }
  }

  updateNavButtons() {
    const navBar = document.getElementById('global-nav-bar');

    // Slide 1 (index 0) or Slide 10 (index 9):
    // Hide footer navigation entirely so redundant Next/Back buttons do not appear
    if (this.currentSlideIndex === 0 || this.currentSlideIndex === 9) {
      if (navBar) navBar.style.display = 'none';
      if (this.btnBack) {
        this.btnBack.disabled = true;
        this.btnBack.style.display = 'none';
      }
      if (this.btnNext) {
        this.btnNext.style.display = 'none';
      }
      if (this.nextBtnWrapper) {
        this.nextBtnWrapper.style.display = 'none';
      }
      return;
    }

    // Slides 2 to 9 (Exercises 1 to 8): Show footer navigation bar
    if (navBar) navBar.style.display = 'flex';

    if (this.btnBack) {
      this.btnBack.style.visibility = 'visible';
      this.btnBack.style.display = 'inline-flex';
      this.btnBack.disabled = false; // Global Back button is ALWAYS active across exercise screens!
    }

    if (this.btnNext) {
      this.btnNext.style.display = 'inline-flex';
    }
    if (this.nextBtnWrapper) {
      this.nextBtnWrapper.style.display = 'inline-block';
    }

    // Slides 2 to 9: Check Timed vs Untimed mode
    const canNext = this.canProceedNext();
    if (this.btnNext) {
      this.btnNext.disabled = !canNext;
    }

    if (this.nextBtnWrapper) {
      if (this.workoutMode === 'timed' && !canNext) {
        const exIndex = this.currentSlideIndex - 1;
        const setsLeft = this.exerciseStates[exIndex].setsRemaining;
        this.nextBtnWrapper.setAttribute('data-tooltip', `נותרו ${setsLeft} סטים להשלמה לפני המעבר לתרגיל הבא`);
      } else {
        this.nextBtnWrapper.removeAttribute('data-tooltip');
      }
    }
  }

  // Timer Implementation for Exercise (45s per set, 3 sets)
  toggleExerciseTimer(exIndex) {
    const state = this.exerciseStates[exIndex];
    if (state.isCompleted) return;

    if (state.isRunning) {
      this.pauseExerciseTimer(exIndex);
    } else {
      this.startExerciseTimer(exIndex);
    }
  }

  startExerciseTimer(exIndex) {
    const state = this.exerciseStates[exIndex];
    state.isRunning = true;

    const slideNum = exIndex + 2;
    const btnToggle = document.getElementById(`btn-timer-toggle-${slideNum}`);
    if (btnToggle) {
      btnToggle.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <span>השהה סט</span>
      `;
    }

    this.activeInterval = setInterval(() => {
      if (state.timer > 0) {
        state.timer--;
        this.updateTimerUI(exIndex);

        // Sound cues: Warning beep on 3, 2, 1
        if (state.timer === 3 || state.timer === 2 || state.timer === 1) {
          window.soundFX.playCountdownWarning();
        } else if (state.timer > 3) {
          window.soundFX.playTick();
        }
      } else {
        // Set Finished!
        this.handleSetFinished(exIndex);
      }
    }, 1000);
  }

  pauseExerciseTimer(exIndex) {
    const state = this.exerciseStates[exIndex];
    state.isRunning = false;
    if (this.activeInterval) {
      clearInterval(this.activeInterval);
      this.activeInterval = null;
    }

    const slideNum = exIndex + 2;
    const btnToggle = document.getElementById(`btn-timer-toggle-${slideNum}`);
    if (btnToggle) {
      btnToggle.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>המשך סט</span>
      `;
    }
  }

  pauseCurrentTimer() {
    if (this.currentSlideIndex >= 1 && this.currentSlideIndex <= 8) {
      const exIndex = this.currentSlideIndex - 1;
      if (this.exerciseStates[exIndex].isRunning) {
        this.pauseExerciseTimer(exIndex);
      }
    }
  }

  resetExerciseTimer(exIndex) {
    this.pauseExerciseTimer(exIndex);
    const state = this.exerciseStates[exIndex];
    state.timer = this.SET_DURATION;
    this.updateTimerUI(exIndex);
  }

  handleSetFinished(exIndex) {
    this.pauseExerciseTimer(exIndex);
    const state = this.exerciseStates[exIndex];

    state.setsRemaining = Math.max(0, state.setsRemaining - 1);
    state.setsCompleted = this.TOTAL_SETS_PER_EXERCISE - state.setsRemaining;

    // Reset timer back to 45 for next set
    state.timer = this.SET_DURATION;
    this.updateTimerUI(exIndex);
    this.updateSetsPillsUI(exIndex);

    if (state.setsRemaining > 0) {
      // Set completed, still more sets left
      window.soundFX.playSetComplete();

      // Show rest recommendation prompt
      const restNote = document.getElementById(`rest-notice-${exIndex + 2}`);
      if (restNote) {
        restNote.style.display = 'flex';
        restNote.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span><strong>כל הכבוד! סט ${state.setsCompleted} הושלם.</strong> מומלץ לנוח 1.5 דקות לפני תחילת הסט הבא.</span>
        `;
      }
    } else {
      // ALL 3 SETS COMPLETED!
      state.isCompleted = true;
      window.soundFX.playExerciseComplete();

      // Show completion banner
      const banner = document.getElementById(`completion-banner-${exIndex + 2}`);
      if (banner) {
        banner.classList.add('visible');
      }

      // Unlock Next button!
      this.updateNavButtons();
      this.updateSlideView();
    }
  }

  updateTimerUI(exIndex) {
    const state = this.exerciseStates[exIndex];
    const slideNum = exIndex + 2;

    const timeDisplay = document.getElementById(`timer-display-${slideNum}`);
    const progressCircle = document.getElementById(`timer-circle-${slideNum}`);

    if (timeDisplay) {
      const minutes = Math.floor(state.timer / 60);
      const seconds = state.timer % 60;
      timeDisplay.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    if (progressCircle) {
      const circumference = 2 * Math.PI * 70; // radius = 70
      const offset = circumference - (state.timer / this.SET_DURATION) * circumference;
      progressCircle.style.strokeDashoffset = offset;

      if (state.timer <= 5) {
        progressCircle.classList.add('warning-rest');
      } else {
        progressCircle.classList.remove('warning-rest');
      }
    }
  }

  updateSetsPillsUI(exIndex) {
    const state = this.exerciseStates[exIndex];
    const slideNum = exIndex + 2;

    for (let setNum = 1; setNum <= 3; setNum++) {
      const pill = document.getElementById(`set-pill-${slideNum}-${setNum}`);
      const statusText = pill ? pill.querySelector('.set-status-text') : null;
      if (!pill) continue;

      if (setNum <= state.setsCompleted) {
        pill.className = 'set-pill completed';
        if (statusText) statusText.textContent = 'הושלם ✓';
      } else if (setNum === state.setsCompleted + 1 && !state.isCompleted) {
        pill.className = 'set-pill active';
        if (statusText) statusText.textContent = 'סט נוכחי';
      } else {
        pill.className = 'set-pill';
        if (statusText) statusText.textContent = 'ממתין';
      }
    }
  }

  // Slide 10: Celebration and metrics calculation
  handleCompletionSlide() {
    window.soundFX.playVictoryFanfare();
    if (window.confettiEngine) {
      window.confettiEngine.start(140);
    }

    // Calculate metrics
    const totalExercises = 8;
    const completedExercisesCount = this.exerciseStates.filter((e) => e.isCompleted).length;
    const totalSetsCompleted = this.exerciseStates.reduce((acc, curr) => acc + curr.setsCompleted, 0);

    // Format elapsed duration
    const minutes = Math.floor(this.totalElapsedSeconds / 60);
    const seconds = this.totalElapsedSeconds % 60;
    const timeStr = `${minutes > 0 ? `${minutes} דק'` : ''} ${seconds} שנ'`;

    // Calories: approx 6-8 kcal per active workout minute, or base ~380
    const calculatedCalories = Math.max(280, Math.round(360 + minutes * 4.2));

    const valEx = document.getElementById('stat-val-exercises');
    const valSets = document.getElementById('stat-val-sets');
    const valTime = document.getElementById('stat-val-time');
    const valCal = document.getElementById('stat-val-calories');
    const valMode = document.getElementById('stat-val-mode');

    if (valEx) valEx.textContent = `${completedExercisesCount} / ${totalExercises}`;
    if (valSets) valSets.textContent = `${totalSetsCompleted}`;
    if (valTime) valTime.textContent = timeStr;
    if (valCal) valCal.textContent = `${calculatedCalories} קק"ל`;
    if (valMode) valMode.textContent = this.workoutMode === 'timed' ? 'מתוזמן' : 'חופשי';

    // Send summary to backend API if available
    try {
      fetch('/api/workout-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercisesCompleted: completedExercisesCount,
          setsCompleted: totalSetsCompleted,
          durationSeconds: this.totalElapsedSeconds,
          mode: this.workoutMode,
          calories: calculatedCalories,
          timestamp: new Date().toISOString()
        })
      }).catch((e) => console.log('Summary sync offline:', e));
    } catch (e) {
      // Offline fallback
    }
  }

  resetEntireWorkout() {
    this.pauseCurrentTimer();
    if (this.sessionTimerInterval) {
      clearInterval(this.sessionTimerInterval);
      this.sessionTimerInterval = null;
    }
    this.sessionStartTime = null;
    this.totalElapsedSeconds = 0;

    // Reset exercises
    this.exerciseStates.forEach((state, idx) => {
      state.setsRemaining = 3;
      state.setsCompleted = 0;
      state.timer = this.SET_DURATION;
      state.isRunning = false;
      state.isCompleted = false;

      this.updateTimerUI(idx);
      this.updateSetsPillsUI(idx);

      const banner = document.getElementById(`completion-banner-${idx + 2}`);
      if (banner) banner.classList.remove('visible');

      const restNote = document.getElementById(`rest-notice-${idx + 2}`);
      if (restNote) restNote.style.display = 'none';
    });

    if (window.confettiEngine) {
      window.confettiEngine.stop();
    }
  }
}

// Instantiate on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  window.workoutApp = new WorkoutApp();
});
