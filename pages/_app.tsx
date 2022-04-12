import '../styles/globals.css'
import '../styles/app.css'

import type { AppProps } from 'next/app'

import Layout from '../components/Layout'

import Head from 'next/head' // ## <https://nextjs.org/docs/basic-features/static-file-serving>

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { clusterApiUrl } from '@solana/web3.js'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

// Default styles that can be overridden by our app
require('@solana/wallet-adapter-react-ui/styles.css');

function MyApp({ Component, pageProps }: AppProps) {
  // We begin by creating a connection to the devnet Solana network
  // They network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // Define an endpoint
  // You can also provide a custom RPC endpoint
  const endpoint = clusterApiUrl(network);

  // We also want to define the wallets that we want to allow to connect to our app ⬇
  // Here, we use Phantom and Solflare - but adapters exists for many other wallets
  // @solana/wallet-adapter-wallets includes all the adapters (contd. below)
  // But supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your dApp
  // And only the dependencies of wallets that your users connect to, will be loaded
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network }),
  ];


  return (
    <>
    {/* ## Once we've defined the endpoint and wallets (contd. below)
    // We wrap our app in some context providers - so that we have access to the Solana connection ⬇
    // And any connected wallet from every page in our app
    // This code is pretty much the same in any app using these Solana libraries
    // None of this will immediately change anything about our dApp, but does provide new capabilities
    */}
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Layout>
                <Head>
                  <meta charSet="utf-8" />
                  <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png" />
                  <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32x32.png" />
                  <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-16x16.png" />
                  <link rel="manifest" href="/site.webmanifest" />
                  <link rel="mask-icon" href="/static/safari-pinned-tab.svg" color="#5bbad5" />
                  <meta name="msapplication-TileColor" content="#da532c" />
                  <meta name="theme-color" content="#ffffff" />
                  <title>Farm+Home</title>
                </Head>
              <Component {...pageProps} />
            </Layout>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
}

export default MyApp
