"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Video } from './Video';

interface VideoData {
  id: string;
  url: string;
  channel: string;
  description: string;
  song: string;
  likes: number;
  shares: number;
  messages: number;
}

export function VideoFeed() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastVideoRef = useRef<HTMLDivElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchVideos = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    console.log("Fetching page:", page);

    try {
      // Simulated API call
      const newVideos = [
        {
          "id": `${ page + 1}`,
          "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          "channel": `channel_${page * 4 + 1}`,
          "description": `Video ${page * 4 + 1} description`,
          "song": "Original Sound - Artist Name",
          "likes": Math.floor(Math.random() * 1000),
          "messages": Math.floor(Math.random() * 500),
          "shares": Math.floor(Math.random() * 200)
        },
        // ... add more videos as needed
      ];

      setVideos(prev => [...prev, ...newVideos]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading]);

   // Check if we need to fetch more videos
   useEffect(() => {
    if(loading || isTransitioning) return;
    const remainingVideos = videos.length - (currentVideoIndex + 1);
    if (remainingVideos == 1) {
      console.log('Fetching more videos...');
      fetchVideos();
    }
  }, [currentVideoIndex, videos.length, isTransitioning]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      const lastEntry = entries[0];
      if (lastEntry.isIntersecting && !loading) {
        console.log("Reached bottom, fetching more videos");
        fetchVideos();
      }
    }, options);

    if (lastVideoRef.current) {
      observer.observe(lastVideoRef.current);
    }

    return () => observer.disconnect();
  }, [fetchVideos, loading]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const videoHeight = window.innerHeight;
      const scrollPosition = container.scrollTop;
      const index = Math.round(scrollPosition / videoHeight);
      console.log("current video index:", index);
      setCurrentVideoIndex(index);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (videos.length === 0) {
      fetchVideos();
    }
  }, []);
  // Smooth scroll function
  const smoothScrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;
    
    const videoHeight = window.innerHeight;
    const targetPosition = videoHeight * index;

    containerRef.current.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }, []);
  const handleVideoEnd = useCallback(() => {
    const nextIndex = currentVideoIndex + 1;

    // Start transition
    setIsTransitioning(true);

   
      // Smooth scroll to next video
      smoothScrollToIndex(nextIndex);

      // Remove transition overlay after scroll animation
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentVideoIndex(nextIndex);
      }, 500); // Adjust timing to match scroll duration
    
  }, [currentVideoIndex, videos.length, smoothScrollToIndex]);

 

  return (
    <div 
      className="app__videos"
      ref={containerRef}
    >
      {videos.map((video, index) => (
        <div
          key={video.id}
          ref={index === videos.length - 1 ? lastVideoRef : null}
          className="video-container"
        >
          <Video
            videoId={video.id}
            url={video.url}
            channel={video.channel}
            description={video.description}
            song={video.song}
            likes={video.likes}
            shares={video.shares}
            messages={video.messages}
            onEnded={handleVideoEnd}            
          />
        </div>
      ))}
      {loading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
}