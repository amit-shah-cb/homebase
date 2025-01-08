import React, { useEffect, useRef } from 'react';
import WebGLManager from './webglManager';

interface VideoOverlayProps {
  videoElement: HTMLVideoElement | null;
  isVisible: boolean;
}

export function VideoOverlay({ videoElement, isVisible }: VideoOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !videoElement) return;

    const webglManager = WebGLManager.getInstance();
    webglManager.initRenderer(canvasRef.current);
    webglManager.updateVideoSource(videoElement);

    const animate = (time: number) => {
      if (!isVisible) return;
      webglManager.render(time);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      webglManager.setSize(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    if (isVisible) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoElement, isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className="video-overlay"
      style={{ display: isVisible ? 'block' : 'none' }}
    />
  );
}