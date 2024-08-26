import React from "react"
import { useRouter } from "next/router"
import { MovingBorderButton } from "@/components/MovingBorderButton"
import Link from "next/link"
import { Hero } from "@/components/Hero"

const Home = () => {
  const router = useRouter()
  return (
    // <main className="w-screen flex justify-center items-center">
    //   <div className="py-8 mx-32 flex justify-around w-full">
    //     <div>
    //       <h1 className="text-white text-3xl font-bold">
    //         My DEX
    //       </h1>
    //       <h3 className="text-white text-xl font-bold pt-8 my-12">
    //         A decentralized exchange (DEX) is a type of
    //         cryptocurrency exchange that operates without a central
    //         authority or intermediary. Unlike traditional
    //         centralized exchanges, DEXs facilitate peer-to-peer
    //         trading of cryptocurrencies directly between users.
    //       </h3>
    //       <div className="flex gap-4">
    //         <Link href="/swap">
    //           <MovingBorderButton text="Swap" />
    //         </Link>
    //         <Link href="/pools">
    //           <MovingBorderButton text="Liquidity pools" />
    //         </Link>

    //       </div>
    //     </div>
    //   </div>
    // </main>
    <Hero />
  )
}

export default Home