import * as THREE from 'three';

class WebGLManager {
  private static instance: WebGLManager;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.OrthographicCamera | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private videoTexture: THREE.VideoTexture | null = null;

  private constructor() {}

  static getInstance(): WebGLManager {
    if (!WebGLManager.instance) {
      WebGLManager.instance = new WebGLManager();
    }
    return WebGLManager.instance;
  }

  initRenderer(canvas: HTMLCanvasElement): void {
    if (this.renderer) return;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    });

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();

    // Create a default material with a placeholder texture
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        videoTexture: { value: null },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform sampler2D videoTexture;
        varying vec2 vUv;

        void main() {
          vec4 videoColor = texture2D(videoTexture, vUv);
          float wave = sin(vUv.y * 10.0 + time) * 0.05;
          vec2 distortedUV = vUv + vec2(wave, 0.0);
          gl_FragColor = texture2D(videoTexture, distortedUV);
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, this.material);
    this.scene.add(plane);
  }

  updateVideoSource(videoElement: HTMLVideoElement): void {
    if (!this.material) return;

    // Dispose of previous texture if it exists
    if (this.videoTexture) {
      this.videoTexture.dispose();
    }

    // Create new video texture
    this.videoTexture = new THREE.VideoTexture(videoElement);
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;

    // Update the material's texture
    this.material.uniforms.videoTexture.value = this.videoTexture;
  }

  render(time: number): void {
    if (!this.renderer || !this.scene || !this.camera || !this.material) return;
    this.material.uniforms.time.value = time * 0.001;
    this.renderer.render(this.scene, this.camera);
  }

  setSize(width: number, height: number): void {
    if (this.renderer) {
      this.renderer.setSize(width, height, false);
    }
  }

  dispose(): void {
    if (this.videoTexture) {
      this.videoTexture.dispose();
    }
    if (this.material) {
      this.material.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.material = null;
    this.videoTexture = null;
  }
}

export default WebGLManager;