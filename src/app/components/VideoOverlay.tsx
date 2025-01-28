import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import WebGLRendererManager from './webglManager';

// Import post-processing modules from three-stdlib
import { EffectComposer,RenderPass,ShaderPass, RGBShiftShader, FilmShader,CopyShader } from 'three-stdlib';
import { BadTVShader } from './shaders/BadTVShader';
import { StaticShader } from './shaders/StaticShader';

interface VideoOverlayProps {
  videoElement: HTMLVideoElement | null;
  isVisible: boolean;
  videoId: string;
}

export function VideoOverlay({ videoElement, isVisible, videoId }: VideoOverlayProps) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
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

    // Setup scene and camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    sceneRef.current = scene;
    cameraRef.current = camera;

    // Create video texture
    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    // Create plane geometry and material
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({ map: videoTexture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // POST-PROCESSING
    // Create Effect Composer
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;

    // Create Shader Passes
    const renderPass = new RenderPass(scene, camera);
    const badTVPass = new ShaderPass(BadTVShader);
    const rgbPass = new ShaderPass(RGBShiftShader);
    const filmPass = new ShaderPass(FilmShader);
    const staticPass = new ShaderPass(StaticShader);
    const copyPass = new ShaderPass(CopyShader);

    // Set shader uniforms
    filmPass.uniforms['grayscale'].value = 0;

    // Initialize shader parameters
    const badTVParams = {
      mute: true,
      show: true,
      distortion: 1.3,
      distortion2: 1.0,
      speed: 0.3,
      rollSpeed: 0.0,
    };

    const staticParams = {
      show: true,
      amount: 0.1,
      size: .05,
    };

    const rgbParams = {
      show: true,
      amount: 0.01,
      angle: 0.1,
    };

    const filmParams = {
      show: true,
      count: 800,
      sIntensity: 0.4,
      nIntensity: 0.2,
    };

    // Apply parameters to shader uniforms
    badTVPass.uniforms['distortion'].value = badTVParams.distortion;
    badTVPass.uniforms['distortion2'].value = badTVParams.distortion2;
    badTVPass.uniforms['speed'].value = badTVParams.speed;
    badTVPass.uniforms['rollSpeed'].value = badTVParams.rollSpeed;

    staticPass.uniforms['amount'].value = staticParams.amount;
    staticPass.uniforms['size'].value = staticParams.size;

    rgbPass.uniforms['angle'].value = rgbParams.angle;
    rgbPass.uniforms['amount'].value = rgbParams.amount;

    filmPass.uniforms['sCount'].value = filmParams.count;
    filmPass.uniforms['sIntensity'].value = filmParams.sIntensity;
    filmPass.uniforms['nIntensity'].value = filmParams.nIntensity;

    // Add passes to composer
    composer.addPass(renderPass);
    if (badTVParams.show) composer.addPass(badTVPass);
    if (rgbParams.show) composer.addPass(rgbPass);
    if (filmParams.show) composer.addPass(filmPass);
    if (staticParams.show) composer.addPass(staticPass);
    composer.addPass(copyPass);

    // Animation loop
    const animate = (time: number) => {
      if (!isVisible) return;

      // Update time uniforms
      const elapsedTime = time * 0.001;
      badTVPass.uniforms['time'].value = elapsedTime;
      filmPass.uniforms['time'].value = elapsedTime;
      staticPass.uniforms['time'].value = elapsedTime;

      composer.render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      const width = videoElement.clientWidth;
      const height = videoElement.clientHeight;
      webglManager.setSize(width, height);
      composer.setSize(width, height);
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

      composer.dispose();

      // If we're no longer visible, dispose of the renderer
      if (!isVisible) {
        webglManager.dispose();
      }
    };
  }, [videoElement, isVisible, videoId]);

  return null;
}