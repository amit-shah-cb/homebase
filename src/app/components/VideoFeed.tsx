"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Video } from './Video';
import { useAccount, useSignMessage,usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';
import { base } from 'wagmi/chains';
import pbkdf from 'js-crypto-pbkdf';
import { parseErc6492Signature } from "viem";

import { Connection, Keypair, Logs, ParsedInnerInstruction, ParsedInstruction, ParsedTransactionWithMeta, PartiallyDecodedInstruction, PublicKey } from "@solana/web3.js";

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
  const { isConnected, address, isDisconnected } = useAccount();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastVideoRef = useRef<HTMLDivElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { signMessageAsync } = useSignMessage()

  const client = usePublicClient({chainId:base.id});

  const RPC_ENDPOINT = 'https://api.devnet.solana.com';
  const RAYDIUM_POOL_V4_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
  const SERUM_OPENBOOK_PROGRAM_ID = 'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX';
  const SOL_MINT = 'So11111111111111111111111111111111111111112';
  const SOL_DECIMALS = 9;

  const connection = new Connection(RPC_ENDPOINT);
  const seenTransactions: Array<string> = []; // The log listener is sometimes triggered multiple times for a single transaction, don't react to tranasctions we've already seen

  const fetchVideos = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    console.log("Fetching page:", page);

    try {
      // Simulated API call
      const newVideos = [
        {
          "id": `${videos.length + 1}`,
          "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
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

  // useEffect(() => {
  //   navigator.credentials.create({
  //     publicKey: {
  //         rp: {name: "Acme"},
  //         user: {
  //             id: new Uint8Array(16),
  //             name: `${address}@homebase`,
  //             displayName: "Homebase"
  //         },
  //         pubKeyCredParams: [{type: "public-key", alg: -257},],
  //         timeout: 60000,
  //         authenticatorSelection: {
  //             authenticatorAttachment: "platform",
  //             residentKey: "required",
  //         },
  //         extensions: {prf: {}},
  
  //         // unused without attestation so a dummy value is fine.
  //         challenge: new Uint8Array([0]).buffer,
  //     }
  // }).then((c) => {console.log(c.getClientExtensionResults());});
  // },[])
  const authenticate = useCallback(async () => {
    if (!address) return;

    try {
    //   const c = await navigator.credentials.get({
    //     publicKey: {
          
    //         timeout: 60000,
    //         challenge: new Uint8Array([ 
    //             // must be a cryptographically random number sent from a server. Don't use dummy
    //             // values in real authentication situations.
    //             1,2,3,4,
    //         ]).buffer,
    //         extensions: {prf: {eval: {first: new TextEncoder().encode("Foo encryption key")}}},
    //     },
    // })
    // console.log((c as any).getClientExtensionResults());
      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Homebase',
        uri: window.location.origin,
        version: '1',
        chainId: base.id,
        nonce: '0xdeadbeefdeadbeefdeadbeef', // You'll need to implement this
        issuedAt: "2025-01-17T12:00:00.000Z",
        expirationTime: "2030-01-17T12:00:00.000Z",
        notBefore: "2025-01-17T12:00:00.000Z",
        requestId: "0xdeadbeefdeadbeefdeadbeef",
        resources:[]
      });

      

      // Create message string
      const messageString = message.prepareMessage();     
      // Sign message
      const signature = await signMessageAsync({
        message: messageString,

      });
      const parsedSignature = parseErc6492Signature(signature).signature
      console.log("signature:", signature)
      console.log("parsedSignature:", parsedSignature)
          
      client.verifyMessage({
        address: address,
        message: message.prepareMessage(),
        signature,
      }).then((result) => {
        console.log("result:", result)
      })
      
      
      
      
      
      const salt = new Uint8Array(0); // Uint8Array
      const iterationCount = 1024;
      const derivedKeyLen = 32;
      const hash = 'SHA3-512'; // 'SHA-384', 'SHA-512', 'SHA-1', 'MD5', 'SHA3-512', 'SHA3-384', 'SHA3-256', or 'SHA3-224'

      pbkdf.pbkdf2(
        signature,
        salt,
        iterationCount,
        derivedKeyLen,
        hash
      ).then( (key) => {
        console.log(key)
        const keypair = Keypair.fromSeed(key);
        console.log("generate public key:", keypair.publicKey.toBase58());            
        // Store the token
        localStorage.setItem('auth_token', Buffer.from(keypair.secretKey).toString('base64'));
        setIsAuthenticated(true);
   
        // now you get the derived key of intended length
      });


    } catch (error) {
      console.error('Error during authentication:', error);
      setIsAuthenticated(false);
    }
  }, [address, signMessageAsync]);


  // Watch for wallet disconnection
  useEffect(() => {
    if (isDisconnected) {
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      setVideos([]);
      setPage(0);
    }
  }, [isDisconnected]);

  // Verify authentication on mount and connection changes
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking auth");
      const token = localStorage.getItem('auth_token');
      console.log("Token:", token);
      if (token && isConnected) {
        // Optionally verify token validity here
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
        setVideos([]);
        setPage(0);
      }
    };

    checkAuth();
  }, [isConnected]);

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
    if (!isConnected || !isAuthenticated) return;
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
  }, [isConnected, isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    if (!isConnected || !isAuthenticated) return;
    if (videos.length === 0) {
      fetchVideos();
    }
  }, [isConnected, isAuthenticated]);
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

  const handleDoubleTap = useCallback(() => {
    console.log("Double tap");
    connection.getBlockHeight().then((height) => {
      console.log("Block height:", height);
      const token = localStorage.getItem('auth_token') as string;
      const keypair = Keypair.fromSecretKey(Buffer.from(token, 'base64'));
      console.log("retrieved public key:", keypair.publicKey.toBase58());
      
    });
    setIsExpanded(prev => !prev);
  }, []);

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

                if (!isAuthenticated) {
                  return (
                    <div className="h-screen w-full flex flex-col items-center justify-center">
                      <button
                        onClick={authenticate}
                        type="button"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm
                               hover:bg-indigo-700 transition-colors duration-200 shadow-md
                               hover:shadow-lg transform hover:scale-105
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Sign In with Ethereum
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

        {isConnected && isAuthenticated && videos.map((video, index) => (
          <div
            key={`video-${video.id}`}
            ref={index === videos.length - 1 ? lastVideoRef : null}
            className={`video-container ${isExpanded ? 'video-container--expanded' : ''}`}
            onDoubleClick={handleDoubleTap}
          >
            <div className={`video-wrapper ${isExpanded ? 'video-wrapper--shrunk' : ''}`}>
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

            {isExpanded && (
              <div className="content-pane">
                <div className="content-pane__inner">
                  <h2 className="text-xl font-bold mb-4">Content Details</h2>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Video Information</h3>
                      <p className="text-sm text-gray-300">{video.description}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Channel</h3>
                      <p className="text-sm text-gray-300">{video.channel}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Music</h3>
                      <p className="text-sm text-gray-300">{video.song}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {(loading || isTransitioning) && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
          </div>
        )}



      </div>
    </>
  );
}
