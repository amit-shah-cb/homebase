import * as THREE from 'three';

class WebGLRendererManager {
  private static instance: WebGLRendererManager;
  private renderer: THREE.WebGLRenderer | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private currentVideoId: string | null = null;

  private constructor() {}

  static getInstance(): WebGLRendererManager {
    if (!WebGLRendererManager.instance) {
      WebGLRendererManager.instance = new WebGLRendererManager();
    }
    return WebGLRendererManager.instance;
  }

  initRenderer(videoId: string): THREE.WebGLRenderer {
    // If we're switching to a new video, dispose of the old renderer first
    if (this.currentVideoId !== videoId && this.renderer) {
      this.dispose();
    }

    if (!this.renderer) {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'video-overlay';
      
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
      
      this.currentVideoId = videoId;
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
      this.renderer.forceContextLoss();
      this.renderer.dispose();
      this.renderer = null;
    }
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.remove();
    }
    this.canvas = null;
    this.currentVideoId = null;
  }
}

export default WebGLRendererManager;