import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import vertShader from '../shaders/anamorphic.vert?raw';
import fragShader from '../shaders/anamorphic.frag?raw';

export class CanvasView {
  constructor(canvasElement, initialState) {
    this.canvas = canvasElement;
    this.state = { ...initialState };

    // Camera animation state
    this.isLerping = false;
    this.lerpFactor = 0.0;
    this.lerpDuration = 1.2; // seconds
    this.lerpStartTime = 0;
    this.lerpStartPos = new THREE.Vector3();
    this.lerpStartTarget = new THREE.Vector3();
    
    // Core Three.js objects
    this.scene = null;
    this.camera = null; // Viewing camera
    this.projectorCamera = null; // Projection camera
    this.projectorHelper = null;
    this.renderer = null;
    this.controls = null;
    
    // Mesh and materials
    this.screenGroup = null;
    this.shaderMaterial = null;
    
    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050508);
    this.scene.fog = new THREE.FogExp2(0x050508, 0.015);

    // 2. Camera (Viewing)
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 25);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't go too far under the floor
    this.controls.target.set(0, 4, 0);

    // 5. Virtual Projector Camera
    this.projectorCamera = new THREE.PerspectiveCamera(
      this.state.projFov,
      16 / 9, // Standard aspect ratio for projection
      0.1,
      100
    );
    this.updateProjector();

    // 6. Projector Helper (Frustum representation)
    this.projectorHelper = new THREE.CameraHelper(this.projectorCamera);
    this.scene.add(this.projectorHelper);

    // 7. Ambient / Directional lighting for the scene helpers
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 15, 10);
    this.scene.add(dirLight);

    // Floor Grid Helper (underneath the scene)
    const gridHelper = new THREE.GridHelper(50, 50, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = -0.02;
    this.scene.add(gridHelper);

    // Axes Helper (X = Red, Y = Green, Z = Blue) to visualize coordinate axes
    const axesHelper = new THREE.AxesHelper(15);
    axesHelper.position.set(0, 0, 0.01);
    this.scene.add(axesHelper);

    // 8. Custom Shader Material
    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: {
        videoTexture: { value: null },
        projectorViewMatrix: { value: new THREE.Matrix4() },
        projectorProjectionMatrix: { value: new THREE.Matrix4() },
        screenColor: { value: new THREE.Color(0x181e28) },
        useLighting: { value: 1.0 }
      },
      side: THREE.DoubleSide
    });

    // 9. Screen Group Container
    this.screenGroup = new THREE.Group();
    this.scene.add(this.screenGroup);

    // Initial Screen Creation
    this.rebuildScreen();

    // Bind window resize event
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  /**
   * Update video texture source.
   */
  setVideoTexture(texture) {
    this.shaderMaterial.uniforms.videoTexture.value = texture;
  }

  /**
   * Update projector camera transform matrices based on state.
   */
  updateProjector() {
    this.projectorCamera.position.set(this.state.projX, this.state.projY, this.state.projZ);
    // Projector target Y: Flat/Cylinder -> screenHeight/2, Sphere -> 0, L-Shape (X-rotated) -> -screenHeight/2
    let targetY = this.state.screenHeight / 2;
    if (this.state.screenMode === 'sphere') {
      targetY = 0;
    } else if (this.state.screenMode === 'lshape') {
      targetY = -this.state.screenHeight / 2;
    }
    this.projectorCamera.lookAt(new THREE.Vector3(0, targetY, 0));
    
    this.projectorCamera.fov = this.state.projFov;
    this.projectorCamera.updateMatrixWorld(true);
    this.projectorCamera.updateProjectionMatrix();

    if (this.projectorHelper) {
      this.projectorHelper.update();
    }
  }

  /**
   * Re-construct the screen mesh using current state.
   * Disposes of previous geometries to prevent memory leaks (Garbage Collection).
   */
  rebuildScreen() {
    // Clear screen group with recursive garbage collection disposal
    while (this.screenGroup.children.length > 0) {
      const child = this.screenGroup.children[0];
      this.screenGroup.remove(child);
      
      child.traverse((node) => {
        if (node.isMesh && node.geometry) {
          node.geometry.dispose();
        }
      });
    }

    const { screenMode, screenWidth, screenHeight, lshapeDepth, lshapeAngle, screenRadius, screenArc } = this.state;

    if (screenMode === 'flat') {
      const geo = new THREE.PlaneGeometry(screenWidth, screenHeight, 32, 16);
      const mesh = new THREE.Mesh(geo, this.shaderMaterial);
      mesh.position.y = screenHeight / 2;
      this.screenGroup.add(mesh);

    } else if (screenMode === 'lshape') {
      // 1:2 split of the screen width
      const w1 = screenWidth / 3.0; // Left wall width
      const w2 = (screenWidth * 2.0) / 3.0; // Right wall width

      // Create a subgroup to assemble both walls so we can rotate the entire configuration
      const lshapeGroup = new THREE.Group();

      // 1. Right wall (flat along X axis, extends from X=0 to W2)
      const rightGeo = new THREE.PlaneGeometry(w2, screenHeight, 32, 16);
      const rightMesh = new THREE.Mesh(rightGeo, this.shaderMaterial);
      rightMesh.position.set(w2 / 2.0, screenHeight / 2.0, 0); // Left edge sits at X=0
      lshapeGroup.add(rightMesh);

      // 2. Left wall (hinged at origin X=0, Y=0, Z=0, rotating around vertical Y-axis)
      const leftGeo = new THREE.PlaneGeometry(w1, screenHeight, 32, 16);
      const leftMesh = new THREE.Mesh(leftGeo, this.shaderMaterial);
      leftMesh.position.set(-w1 / 2.0, screenHeight / 2.0, 0); // Right edge sits at X=0

      const leftHinge = new THREE.Group();
      leftHinge.add(leftMesh);

      // Rotate around vertical Y-axis. 180 degrees is flat, <180 folds forward (+Z)
      const angleRad = ((180 - lshapeAngle) * Math.PI) / 180.0;
      leftHinge.rotation.y = angleRad;
      lshapeGroup.add(leftHinge);

      // Rotate the entire L-shape assembly by 180 degrees about the X-axis as requested
      lshapeGroup.rotation.x = Math.PI;

      this.screenGroup.add(lshapeGroup);

    } else if (screenMode === 'cylinder') {
      // Create a standard full cylinder, open ended
      const geo = new THREE.CylinderGeometry(
        screenRadius,       // top radius
        screenRadius,       // bottom radius
        screenHeight,       // height
        64,                 // radial segments
        16,                 // height segments
        true                // open ended
      );
      
      const mesh = new THREE.Mesh(geo, this.shaderMaterial);
      mesh.position.y = screenHeight / 2;
      this.screenGroup.add(mesh);

    } else if (screenMode === 'sphere') {
      // Create a standard full sphere
      const geo = new THREE.SphereGeometry(
        screenRadius,       // radius
        64,                 // width segments
        32                  // height segments
      );
      
      const mesh = new THREE.Mesh(geo, this.shaderMaterial);
      mesh.position.y = 0; // Sphere centered at Y=0
      this.screenGroup.add(mesh);
    }
  }

  /**
   * Update internal state from control panel.
   */
  updateState(delta) {
    const prevMode = this.state.screenMode;
    const prevHeight = this.state.screenHeight;

    this.state = { ...this.state, ...delta };

    // Rebuild screen mesh if layout configuration variables modified
    if (
      delta.screenMode !== undefined ||
      delta.screenWidth !== undefined ||
      delta.screenHeight !== undefined ||
      delta.lshapeDepth !== undefined ||
      delta.lshapeAngle !== undefined ||
      delta.screenRadius !== undefined ||
      delta.screenArc !== undefined
    ) {
      this.rebuildScreen();
    }

    // Sync projector position matrices
    this.updateProjector();
  }

  /**
   * Animate camera to the sweet spot (aligned with the projector camera).
   */
  triggerResetView() {
    this.isLerping = true;
    this.lerpStartTime = performance.now();
    
    // Save starting camera position and OrbitControls target
    this.lerpStartPos.copy(this.camera.position);
    this.lerpStartTarget.copy(this.controls.target);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * Animation tick (runs inside requestAnimationFrame loop).
   */
  update() {
    this.controls.update();

    // 1. Animate viewing camera to sweet spot if requested
    if (this.isLerping) {
      const elapsed = (performance.now() - this.lerpStartTime) / 1000;
      const progress = Math.min(elapsed / this.lerpDuration, 1.0);
      
      // Smooth easing (Cubic Out)
      const ease = 1 - Math.pow(1 - progress, 3);

      // Target camera position (matching Projector Camera world position)
      const targetPos = new THREE.Vector3().copy(this.projectorCamera.position);
      
      // Target viewing target: Flat/Cylinder -> screenHeight/2, Sphere -> 0, L-Shape (X-rotated) -> -screenHeight/2
      let targetY = this.state.screenHeight / 2;
      if (this.state.screenMode === 'sphere') {
        targetY = 0;
      } else if (this.state.screenMode === 'lshape') {
        targetY = -this.state.screenHeight / 2;
      }
      const targetLookAt = new THREE.Vector3(0, targetY, 0);

      this.camera.position.lerpVectors(this.lerpStartPos, targetPos, ease);
      this.controls.target.lerpVectors(this.lerpStartTarget, targetLookAt, ease);

      if (progress >= 1.0) {
        this.isLerping = false;
      }
    }

    // 2. Update projection matrices for custom shaders
    this.projectorCamera.updateMatrixWorld(true);
    this.projectorCamera.matrixWorldInverse.copy(this.projectorCamera.matrixWorld).invert();

    this.shaderMaterial.uniforms.projectorViewMatrix.value.copy(this.projectorCamera.matrixWorldInverse);
    this.shaderMaterial.uniforms.projectorProjectionMatrix.value.copy(this.projectorCamera.projectionMatrix);

    // 3. Render Three.js scene
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener('resize', this.onWindowResize);
    this.controls.dispose();
    
    // Clear meshes and dispose of geometries
    this.screenGroup.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
    });
    
    this.shaderMaterial.dispose();
    this.renderer.dispose();
  }
}
