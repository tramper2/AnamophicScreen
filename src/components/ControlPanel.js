export class ControlPanel {
  constructor(initialState) {
    this.state = { ...initialState };
    
    // Event callbacks
    this.onStateChange = null;
    this.onFileUpload = null;
    this.onDefaultVideoClick = null;
    this.onPlayPauseClick = null;
    this.onResetViewClick = null;

    // Bind DOM references
    this.initDOM();
    this.setupListeners();
    this.updateVisibleFields(this.state.screenMode);
  }

  initDOM() {
    this.elements = {
      btnDefaultVideo: document.getElementById('btn-default-video'),
      videoUpload: document.getElementById('video-upload'),
      fileName: document.getElementById('file-name'),
      btnPlayPause: document.getElementById('btn-play-pause'),
      videoTime: document.getElementById('video-time'),
      
      btnModes: document.querySelectorAll('.btn-mode'),
      btnResetView: document.getElementById('btn-reset-view'),

      // Screen Options Containers
      rowWidth: document.getElementById('row-screen-width'),
      rowHeight: document.getElementById('row-screen-height'),
      rowLDepth: document.getElementById('row-lshape-depth'),
      rowLAngle: document.getElementById('row-lshape-angle'),
      rowCurvature: document.getElementById('row-curvature'),
      rowArcAngle: document.getElementById('row-arc-angle'),

      // Input Sliders
      slideWidth: document.getElementById('slide-screen-width'),
      slideHeight: document.getElementById('slide-screen-height'),
      slideLDepth: document.getElementById('slide-lshape-depth'),
      slideLAngle: document.getElementById('slide-lshape-angle'),
      slideRadius: document.getElementById('slide-screen-radius'),
      slideArc: document.getElementById('slide-screen-arc'),

      slideProjX: document.getElementById('slide-proj-x'),
      slideProjY: document.getElementById('slide-proj-y'),
      slideProjZ: document.getElementById('slide-proj-z'),
      slideProjFov: document.getElementById('slide-proj-fov'),

      // Text Labels displaying values
      valWidth: document.getElementById('val-screen-width'),
      valHeight: document.getElementById('val-screen-height'),
      valLDepth: document.getElementById('val-lshape-depth'),
      valLAngle: document.getElementById('val-lshape-angle'),
      valRadius: document.getElementById('val-screen-radius'),
      valArc: document.getElementById('val-screen-arc'),

      valProjX: document.getElementById('val-proj-x'),
      valProjY: document.getElementById('val-proj-y'),
      valProjZ: document.getElementById('val-proj-z'),
      valProjFov: document.getElementById('val-proj-fov'),
    };
  }

  setupListeners() {
    // Mode Buttons Switching
    this.elements.btnModes.forEach(btn => {
      btn.addEventListener('click', () => {
        this.elements.btnModes.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const mode = btn.dataset.mode;
        this.state.screenMode = mode;
        this.updateVisibleFields(mode);
        this.triggerChange({ screenMode: mode });
      });
    });

    // Default Video Trigger
    this.elements.btnDefaultVideo.addEventListener('click', () => {
      this.elements.btnDefaultVideo.classList.add('active');
      this.elements.fileName.textContent = 'Default: sample_video.mp4';
      if (this.onDefaultVideoClick) this.onDefaultVideoClick();
    });

    // File Upload Handler (Security: Entirely client-side in-memory)
    this.elements.videoUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.elements.btnDefaultVideo.classList.remove('active');
        // TODO(security): Prevent XSS - set textContent instead of innerHTML
        this.elements.fileName.textContent = file.name;
        if (this.onFileUpload) this.onFileUpload(file);
      }
    });

    // Play/Pause Action
    this.elements.btnPlayPause.addEventListener('click', () => {
      if (this.onPlayPauseClick) this.onPlayPauseClick();
    });

    // Reset View
    this.elements.btnResetView.addEventListener('click', () => {
      if (this.onResetViewClick) this.onResetViewClick();
    });

    // Helper to wire slider values to local state and update callbacks
    const bindSlider = (slider, valLabel, stateKey, isFloat = false) => {
      if (!slider || !valLabel) return;
      slider.addEventListener('input', (e) => {
        const val = isFloat ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
        valLabel.textContent = val;
        this.state[stateKey] = val;
        this.triggerChange({ [stateKey]: val });
      });
    };

    // Bind all inputs
    bindSlider(this.elements.slideWidth, this.elements.valWidth, 'screenWidth', true);
    bindSlider(this.elements.slideHeight, this.elements.valHeight, 'screenHeight', true);
    bindSlider(this.elements.slideLDepth, this.elements.valLDepth, 'lshapeDepth', true);
    bindSlider(this.elements.slideLAngle, this.elements.valLAngle, 'lshapeAngle', false);
    bindSlider(this.elements.slideRadius, this.elements.valRadius, 'screenRadius', true);
    bindSlider(this.elements.slideArc, this.elements.valArc, 'screenArc', false);

    bindSlider(this.elements.slideProjX, this.elements.valProjX, 'projX', true);
    bindSlider(this.elements.slideProjY, this.elements.valProjY, 'projY', true);
    bindSlider(this.elements.slideProjZ, this.elements.valProjZ, 'projZ', true);
    bindSlider(this.elements.slideProjFov, this.elements.valProjFov, 'projFov', false);
  }

  /**
   * Shows/hides slider rows depending on current screen geometry mode.
   * @param {string} mode - 'flat' | 'lshape' | 'cylinder' | 'sphere'
   */
  updateVisibleFields(mode) {
    // Start by hiding all specific parameter groups
    this.elements.rowWidth.classList.add('hidden');
    this.elements.rowHeight.classList.add('hidden');
    this.elements.rowLDepth.classList.add('hidden');
    this.elements.rowLAngle.classList.add('hidden');
    this.elements.rowCurvature.classList.add('hidden');
    this.elements.rowArcAngle.classList.add('hidden');

    switch (mode) {
      case 'flat':
        this.elements.rowWidth.classList.remove('hidden');
        this.elements.rowHeight.classList.remove('hidden');
        break;
      case 'lshape':
        this.elements.rowWidth.classList.remove('hidden');
        this.elements.rowHeight.classList.remove('hidden');
        this.elements.rowLDepth.classList.remove('hidden');
        this.elements.rowLAngle.classList.remove('hidden');
        break;
      case 'cylinder':
        this.elements.rowHeight.classList.remove('hidden');
        this.elements.rowCurvature.classList.remove('hidden');
        this.elements.rowArcAngle.classList.remove('hidden');
        break;
      case 'sphere':
        this.elements.rowCurvature.classList.remove('hidden');
        this.elements.rowArcAngle.classList.remove('hidden');
        break;
    }
  }

  setPlayState(isPlaying) {
    this.elements.btnPlayPause.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
  }

  updateTimeDisplay(current, duration) {
    const format = (t) => {
      if (isNaN(t) || !isFinite(t)) return '0:00';
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };
    this.elements.videoTime.textContent = `${format(current)} / ${format(duration)}`;
  }

  triggerChange(delta) {
    if (this.onStateChange) {
      this.onStateChange(delta);
    }
  }
}
