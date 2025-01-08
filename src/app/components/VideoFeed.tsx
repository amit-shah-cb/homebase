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

  // Fetch videos with delay to prevent rapid consecutive calls
  const fetchVideos = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    console.log("fetching videos");
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
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, [page, loading]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading) return;

    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
    
    // If we're near the bottom (within 100px), fetch more videos
    if (scrollHeight - scrollTop - clientHeight < 100) {
      fetchVideos();
    }
  }, [fetchVideos, loading]);

  // Add scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Initial fetch
  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div 
      className="app__videos"
      ref={containerRef}
    >
      {videos.map((video) => (
        <div
          key={video.id}
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