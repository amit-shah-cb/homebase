// 'use client';
// import React, { useRef, useMemo } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { OrthographicCamera, VideoTexture, LinearFilter } from 'three';

// interface VideoOverlayProps {
//   videoElement: HTMLVideoElement | null;
//   isVisible: boolean;
//   videoId: string;
// }

// /**
//  * Wraps a mesh containing our plane geometry and custom shader material.
//  * React Three Fiber handles the animation loop and rendering.
//  */
// function VideoScene({ videoElement }: { videoElement: HTMLVideoElement }) {
//   const materialRef = useRef<THREE.ShaderMaterial>(null!);

//   // Create a Three.js VideoTexture from the provided <video> element
//   const videoTexture = useMemo(() => {
//     const texture = new VideoTexture(videoElement);
//     // Match your existing filtering:
//     texture.minFilter = LinearFilter;
//     texture.magFilter = LinearFilter;
//     return texture;
//   }, [videoElement]);

//   // Per-frame animation updates (i.e., increment 'time' uniform)
//   useFrame(({ clock }) => {
//     const elapsed = clock.getElapsedTime();
//     materialRef.current.uniforms.time.value = elapsed;
//     // Mark the VideoTexture for updating each frame
//     videoTexture.needsUpdate = true;
//   });

//   return (
//     <mesh>
//       {/* Fullscreen plane (2 x 2 in orthographic coordinates) */}
//       <planeGeometry args={[2, 2]} />
//       <shaderMaterial
//         ref={materialRef}
//         uniforms={{
//           time: { value: 0 },
//           videoTexture: { value: videoTexture },
//         }}
//         vertexShader={`
//           varying vec2 vUv;
//           void main() {
//             vUv = uv;
//             gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//           }
//         `}
//         fragmentShader={`
//           uniform float time;
//           uniform sampler2D videoTexture;
//           varying vec2 vUv;

//           void main() {
//             // Pull the current video pixels
//             vec4 videoColor = texture2D(videoTexture, vUv);
//             // Simple wave effect
//             float wave = sin(vUv.y * 10.0 + time) * 0.05;
//             vec2 distortedUV = vUv + vec2(wave, 0.0);
//             gl_FragColor = texture2D(videoTexture, distortedUV);
//           }
//         `}
//       />
//     </mesh>
//   );
// }

// /**
//  * VideoOverlay with React Three Fiber:
//  * 1) Checks if the video is visible.
//  * 2) Renders an <OrthographicCamera> for a “flat” 2D plane.
//  * 3) Uses <VideoScene> to draw a plane with wave-distorted video.
//  */
// export function VideoOverlay({ videoElement, isVisible, videoId }: VideoOverlayProps) {
//   // If the video isn't attached or not visible, render nothing
//   if (!videoElement || !isVisible) return null;

//   return (
//     <div
//       id={`overlay-canvas-${videoId}`}
//       style={{
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         /* 
//           If you want the overlay to match the video’s size exactly,
//           you can do something like:
//           width: videoElement.clientWidth,
//           height: videoElement.clientHeight,
          
//           OR keep it fullscreen:
//         */
//         width: '100%',
//         height: '100%',
//         pointerEvents: 'none',
//         zIndex: 2, // Ensure it’s on top of the video
//       }}
//     >
//       <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
//         <VideoScene videoElement={videoElement} />
//       </Canvas>
//     </div>
//   );
// }