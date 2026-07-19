import { CanvasView } from './components/CanvasView.js';
import { ControlPanel } from './components/ControlPanel.js';
import { VideoLoader } from './components/VideoLoader.js';

export class App {
  constructor() {
    this.state = {
      screenMode: 'flat',
      screenWidth: 16.0,
      screenHeight: 9.0,
      lshapeDepth: 9.0,
      lshapeAngle: 90,
      screenRadius: 10.0,
      screenArc: 120,
      projX: 0.0,
      projY: 0.0,
      projZ: 15.0,
      projFov: 45
    };

    this.canvasView = null;
    this.controlPanel = null;
    this.videoLoader = null;
    this.animationFrameId = null;
  }

  init() {
    // 1. Initialize UI Control Panel
    this.controlPanel = new ControlPanel(this.state);

    // 2. Initialize WebGL Viewport
    const canvas = document.getElementById('webgl-canvas');
    this.canvasView = new CanvasView(canvas, this.state);

    // 3. Initialize Video Loader
    this.videoLoader = new VideoLoader();

    // 4. Load initial default sample video
    // Use a dynamic cache-busting query parameter so the browser always fetches the latest video file
    const defaultVideoPath = () => `${import.meta.env.BASE_URL}assets/sample_video.mp4?cb=${Date.now()}`;
    const videoTexture = this.videoLoader.loadDefault(defaultVideoPath());
    this.canvasView.setVideoTexture(videoTexture);
    this.controlPanel.setPlayState(true);

    // 5. Connect event handlers (State Routing)
    
    // UI Slider & Parameter updates
    this.controlPanel.onStateChange = (delta) => {
      this.state = { ...this.state, ...delta };
      this.canvasView.updateState(delta);
    };

    // User Upload Video File (Security: Entirely client-side browser memory)
    this.controlPanel.onFileUpload = (file) => {
      const texture = this.videoLoader.loadFromFile(file);
      this.canvasView.setVideoTexture(texture);
      this.controlPanel.setPlayState(true);
    };

    // Reload Default Sample Video
    this.controlPanel.onDefaultVideoClick = () => {
      const texture = this.videoLoader.loadDefault(defaultVideoPath());
      this.canvasView.setVideoTexture(texture);
      this.controlPanel.setPlayState(true);
    };

    // Play & Pause Toggle
    this.controlPanel.onPlayPauseClick = () => {
      const isPlaying = this.videoLoader.togglePlay();
      this.controlPanel.setPlayState(isPlaying);
    };

    // Reset view camera to Sweet Spot
    this.controlPanel.onResetViewClick = () => {
      this.canvasView.triggerResetView();
    };

    // Sync Playback time updates to UI
    this.videoLoader.onUpdate = (currentTime, duration) => {
      this.controlPanel.updateTimeDisplay(currentTime, duration);
    };

    // 6. Start the Game/Render loop
    this.animate();
  }

  /**
   * High performance render loop
   */
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
    if (this.canvasView) {
      this.canvasView.update();
    }
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    if (this.canvasView) this.canvasView.dispose();
    if (this.videoLoader) this.videoLoader.dispose();
  }
}
