import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface VideoOverlayProps {
  videoElement: HTMLVideoElement | null;
  isVisible: boolean;
}

export function VideoOverlay({ videoElement, isVisible }: VideoOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !videoElement || !isVisible) return;

    // Setup Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });
    rendererRef.current = renderer;

    // Create video texture
    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    // Create shader material
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

    // Create mesh
    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Animation loop
    const animate = (time: number) => {
      if (!isVisible) return;
      
      material.uniforms.time.value = time * 0.001;
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      renderer.setSize(width, height, false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    if (isVisible) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      geometry.dispose();
      material.dispose();
      videoTexture.dispose();
      renderer.dispose();
      console.log('disposed');
    };
  }, [videoElement, isVisible]);
  if (isVisible) {
        return (        
            <canvas
            ref={canvasRef}
            className="video-overlay"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',               
            }}
            />
        );
    }
}
