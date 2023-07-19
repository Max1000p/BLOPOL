"use client"
import '@rainbow-me/rainbowkit/styles.css';
import Header from "./components/Header/Header"
import { ThemeContextProvider } from '@/context/theme';
import {getDefaultWallets,RainbowKitProvider,} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { polygon } from 'wagmi/chains';

import { publicProvider } from 'wagmi/providers/public';
import { ChakraProvider } from '@chakra-ui/react'



const { chains, publicClient } = configureChains(
  [hardhat],[ publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Blopol',
  projectId: '7ed73a0f6af2fb738f8fc8c98c26dee0',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient
})


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <ChakraProvider>
              <ThemeContextProvider>
                <Header />
                {children}
              </ThemeContextProvider>
            </ChakraProvider>
          </RainbowKitProvider>
      </WagmiConfig>
    </body>
    </html>
  )
}
