import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import WebGLRendererManager from './webglManager';

interface VideoOverlayProps {
  videoElement: HTMLVideoElement | null;
  isVisible: boolean;
  videoId: string; // Add videoId prop
}

export function VideoOverlay({ videoElement, isVisible, videoId }: VideoOverlayProps) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!videoElement || !isVisible) return;

    const webglManager = WebGLRendererManager.getInstance();
    const renderer = webglManager.initRenderer(videoId);
    const canvas = webglManager.getCanvas();

    if (!canvas) return;

    // Position the canvas
    if (canvas.parentElement !== videoElement.parentElement) {
      videoElement.parentElement?.appendChild(canvas);
    }

    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    sceneRef.current = scene;
    cameraRef.current = camera;

    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    textureRef.current = videoTexture;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        videoTexture: { value: videoTexture },
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
    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const animate = (time: number) => {
      if (!isVisible) return;
      
      material.uniforms.time.value = time * 0.001;
      if (textureRef.current) {
        textureRef.current.needsUpdate = true;
      }
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      const width = videoElement.clientWidth;
      const height = videoElement.clientHeight;
      webglManager.setSize(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Clean up resources
      geometry.dispose();
      material.dispose();
      videoTexture.dispose();
      scene.clear();

      // If we're no longer visible, dispose of the renderer
      if (!isVisible) {
        webglManager.dispose();
      }
    };
  }, [videoElement, isVisible, videoId]);

  return null;
}