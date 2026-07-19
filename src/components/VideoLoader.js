import * as THREE from 'three';

export class VideoLoader {
  constructor() {
    // Create an offscreen video element for texture mapping
    this.video = document.createElement('video');
    this.video.style.display = 'none';
    this.video.loop = true;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.setAttribute('webkit-playsinline', 'true');
    this.video.crossOrigin = 'anonymous';
    document.body.appendChild(this.video);

    this.texture = null;
    this.objectUrl = null;
    this.onMetadataLoaded = null;
    this.onUpdate = null;

    // Listeners for video state sync
    this.video.addEventListener('loadedmetadata', () => {
      if (this.onMetadataLoaded) {
        this.onMetadataLoaded({
          width: this.video.videoWidth,
          height: this.video.videoHeight,
          duration: this.video.duration
        });
      }
    });

    this.video.addEventListener('timeupdate', () => {
      if (this.onUpdate) {
        this.onUpdate(this.video.currentTime, this.video.duration);
      }
    });
  }

  /**
   * Load the default sample video pattern.
   * @param {string} path - URL path to local asset
   */
  loadDefault(path = 'assets/sample_video.mp4') {
    this.disposeCurrent();
    
    this.video.src = path;
    this.video.load();
    
    // Play with fallback handling
    const playPromise = this.video.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Autoplay blocked. Waiting for user interaction:", error);
      });
    }

    this.texture = new THREE.VideoTexture(this.video);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.colorSpace = THREE.SRGBColorSpace;

    return this.texture;
  }

  /**
   * Load video from local user file upload.
   * @param {File} file - Blob video file
   */
  loadFromFile(file) {
    this.disposeCurrent();

    // Create memory object URL
    this.objectUrl = URL.createObjectURL(file);
    this.video.src = this.objectUrl;
    this.video.load();
    
    const playPromise = this.video.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Video playback error:", error);
      });
    }

    this.texture = new THREE.VideoTexture(this.video);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.colorSpace = THREE.SRGBColorSpace;

    return this.texture;
  }

  /**
   * Play or pause video playback.
   * @returns {boolean} - true if playing, false if paused
   */
  togglePlay() {
    if (this.video.paused) {
      this.video.play().catch(err => console.error("Playback play error:", err));
      return true;
    } else {
      this.video.pause();
      return false;
    }
  }

  isPlaying() {
    return !this.video.paused;
  }

  /**
   * Clean up textures, object URLs, and unload HTML5 video stream (prevent memory leaks)
   */
  disposeCurrent() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }

    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }

    // Hard stop and clear video stream source
    this.video.pause();
    this.video.removeAttribute('src');
    this.video.load();
  }

  /**
   * Full teardown
   */
  dispose() {
    this.disposeCurrent();
    if (this.video.parentNode) {
      this.video.parentNode.removeChild(this.video);
    }
  }
}
