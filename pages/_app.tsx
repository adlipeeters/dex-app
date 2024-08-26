import { Header } from "@/components/Header";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { MoralisProvider } from "react-moralis"
import { Toaster } from "@/components/ui/sonner"
import WalletProvider from "@/providers/WalletProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="w-full">
      <Head>
        <title>Infinity DEX</title>
        <meta
          name="description"
          content="Starting point to create a front web3 project"
        />
      </Head>
      <MoralisProvider initializeOnMount={false}>
        <Header />
        <WalletProvider>
          <Component {...pageProps} />
        </WalletProvider>
        <Toaster />
      </MoralisProvider>
    </div>
  )
}
