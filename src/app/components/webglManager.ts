import * as THREE from 'three';

class WebGLRendererManager {
  private static instance: WebGLRendererManager;
  private renderer: THREE.WebGLRenderer | null = null;
  private canvas: HTMLCanvasElement | null = null;

  private constructor() {}

  static getInstance(): WebGLRendererManager {
    if (!WebGLRendererManager.instance) {
      WebGLRendererManager.instance = new WebGLRendererManager();
    }
    return WebGLRendererManager.instance;
  }

  getRenderer(): THREE.WebGLRenderer {
    if (!this.renderer) {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'video-overlay';
      
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
    }
    return this.renderer;
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  setSize(width: number, height: number): void {
    if (this.renderer) {
      this.renderer.setSize(width, height, false);
    }
  }

  dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.canvas = null;
  }
}

export default WebGLRendererManager;