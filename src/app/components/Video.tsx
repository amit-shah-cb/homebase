"use client"

import React, { useRef, useState, useEffect } from "react";
import "./Video.css";

interface VideoProps {
  url: string;
  channel: string;
  description: string;
  song: string;
  likes: number;
  shares: number;
  messages: number;
}

export function Video({
  url,
  channel,
  description,
  song,
  likes,
  shares,
  messages,
}: VideoProps) {
  const [playing, setPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video play/pause
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play();
            setPlaying(true);
          } else {
            videoRef.current?.pause();
            setPlaying(false);
          }
        });
      },
      {
        threshold: 0.6 // Video will play when 60% visible
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  const onVideoPress = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
        setPlaying(false);
      } else {
        videoRef.current.play();
        setPlaying(true);
      }
    }
  };

  return (
    <div className="video">
      <video
        className="video__player"
        loop
        onClick={onVideoPress}
        ref={videoRef}
        src={url}
        playsInline // Add this for better mobile support
        muted // Add this if you want videos to autoplay on mobile
      ></video>
     
      {/* ... rest of your JSX ... */}
      <div className="video__bottom">
        <div className="video__details">
          <h3>@{channel}</h3>
          <p>{description}</p>
          <div className="video__song">
            <span className="material-icons">music_note</span>
            <p>{song}</p>
          </div>
        </div>

        <div className="video__sidebar">
          <div className="video__sidebarButton">
            <span className="material-icons">favorite</span>
            <p>{likes}</p>
          </div>
          <div className="video__sidebarButton">
            <span className="material-icons">message</span>
            <p>{messages}</p>
          </div>
          <div className="video__sidebarButton">
            <span className="material-icons">share</span>
            <p>{shares}</p>
          </div>
          <div 
            className="video__sidebarButton"
            onClick={handleMuteToggle}
          >            
            <p>{isMuted ? "unmute" : "mute"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}