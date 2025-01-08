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
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 5 }); // Increased initial buffer
  const containerRef = useRef<HTMLDivElement>(null);
  const lastVideoRef = useRef<HTMLDivElement>(null);

  // Fetch videos with delay to prevent rapid consecutive calls
  const fetchVideos = useCallback(async (page: number) => {
    if (loading) return;
    setLoading(true);
    try {
      // Simulated API call with your JSON data
      const newVideos = [
        {
          "id": `${page * 4 + 1}`,
          "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          "channel": "channelName",
          "description": "Video description here",
          "song": "Original Sound - Artist Name",
          "likes": 1234,
          "messages": 321,
          "shares": 100
        },
        {
          "id": `${page * 4 + 2}`,
          "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          "channel": "channelName",
          "description": "Video description here",
          "song": "Original Sound - Artist Name",
          "likes": 1234,
          "messages": 321,
          "shares": 100
        },
        {
          "id": `${page * 4 + 3}`,
          "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          "channel": "channelName",
          "description": "Video description here",
          "song": "Original Sound - Artist Name",
          "likes": 1234,
          "messages": 321,
          "shares": 100
        },
        {
          "id": `${page * 4 + 4}`,
          "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          "channel": "channelName",
          "description": "Video description here",
          "song": "Original Sound - Artist Name",
          "likes": 1234,
          "messages": 321,
          "shares": 100
        }
      ]
      setVideos(prev => [...prev, ...newVideos]);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setTimeout(() => setLoading(false), 300); // Add slight delay to prevent rapid refetch
    }
  }, [loading]);

  // Optimized scroll handler with debounce
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    const itemHeight = height;

    // Increased buffer size for smoother scrolling
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
    const end = Math.min(
      videos.length,
      Math.ceil((scrollTop + height) / itemHeight) + 2
    );

    requestAnimationFrame(() => {
      setVisibleRange({ start, end });
    });
  }, [videos.length]);

  // Optimized intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          const nextPage = Math.floor(videos.length / 4);
          fetchVideos(nextPage);
        }
      },
      { 
        threshold: 0.5,
        rootMargin: '100px' // Preload earlier
      }
    );

    if (lastVideoRef.current) {
      observer.observe(lastVideoRef.current);
    }

    return () => observer.disconnect();
  }, [videos.length, loading, fetchVideos]);

  // Optimized scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      let scrollTimeout: NodeJS.Timeout | null = null;
      
      const throttledScroll = () => {
        if (!scrollTimeout) {
          scrollTimeout = setTimeout(() => {
            handleScroll();
            scrollTimeout = null;
          }, 50); // Throttle scroll events
        }
      };

      container.addEventListener('scroll', throttledScroll);
      return () => container.removeEventListener('scroll', throttledScroll);
    }
  }, [handleScroll]);

  // Initial fetch
  useEffect(() => {
    fetchVideos(0);
  }, []);

  return (
    <div 
      className="app__videos"
      ref={containerRef}
    >
      {videos.slice(visibleRange.start, visibleRange.end).map((video, index) => (
        <div
          key={video.id}
          ref={index === visibleRange.end - visibleRange.start - 1 ? lastVideoRef : null}
          className="video-container"
        >
          <Video
            url={video.url}
            channel={video.channel}
            description={video.description}
            song={video.song}
            likes={video.likes}
            shares={video.shares}
            messages={video.messages}
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