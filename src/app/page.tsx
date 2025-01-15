'use client'

import { VideoFeed } from './components/VideoFeed';
import '@rainbow-me/rainbowkit/styles.css';

import {
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider,createConfig,http } from 'wagmi';
import {
  base
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import {
  coinbaseWallet
} from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [coinbaseWallet],
    }
  ],
  {
    appName: 'homebase',
    projectId: '<YOUR WALLETCONNECT PROJECT ID>',
  },
);

const config = createConfig({
  connectors,
  chains: [base],
  ssr: false,
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();


export default function Home() {
 
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="app">
            <div className="app__videos">             
              <VideoFeed />
            </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
