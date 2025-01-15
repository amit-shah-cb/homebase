"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Video } from './Video';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
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
  const { isConnected } = useAccount();
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
          "id": `${ videos.length + 1}`,
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
  //  useEffect(() => {
  //   if(loading || isTransitioning) return;
  //   const remainingVideos = videos.length - (currentVideoIndex + 1);
  //   if (remainingVideos == 1) {
  //     console.log('Fetching more videos...');
  //     fetchVideos();
  //   }
  // }, [currentVideoIndex, videos.length, loading, isTransitioning]);

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
    
  }, [currentVideoIndex, smoothScrollToIndex]);

 

  return (
    <>
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                
                  <div className="h-screen w-full flex flex-col items-center justify-center">
                  <button 
                    onClick={openConnectModal} 
                    type="button"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm
                             hover:bg-indigo-700 transition-colors duration-200 shadow-md
                             hover:shadow-lg transform hover:scale-105
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Connect Wallet
                  </button>
                </div>
                    
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button" className="h-screen w-full flex flex-col items-center justify-center">
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center gap-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 flex items-center gap-4">
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="inline-flex items-center px-1.5 py-1.5 rounded-md
                               text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      {chain.hasIcon && (
                        <div
                          className="w-4 h-4 mr-2 rounded-full overflow-hidden"
                          style={{
                            background: chain.iconBackground,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              className="w-full h-full"
                            />
                          )}
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {chain.name}
                      </span>
                    </button>

                    <div className="w-px h-5 bg-white/20" /> {/* Divider */}

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="inline-flex items-center px-1.5 py-1.5 rounded-md
                               text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <span className="text-sm font-medium">
                        {account.displayName}
                        {account.displayBalance ? ` (${account.displayBalance})` : ''}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
   
    <div 
      className="app__videos"
      ref={containerRef}
    >      
          
          {isConnected && videos.map((video, index) => (
            <div
              key={`video-${video.id}`}
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
      {(loading||isTransitioning) && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      
      
    </div>
    </>
  );
}
