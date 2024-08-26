"use client";
import Link from "next/link";
import { SparklesCore } from "./ui/sparkles";
import { MaskContainer } from "./ui/svg-mask-effect";
import { MovingBorderButton } from "./MovingBorderButton";
import { Button } from "./ui/button";

export function Hero() {
    return (
        <div className="h-[40rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
            <h1 className="md:text-5xl text-3xl lg:text-7xl font-bold text-center text-white relative z-20">
                Infinity DEX
            </h1>
            <div className="w-[40rem] h-40 relative">
                {/* Gradients */}
                <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
                <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
                <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
                <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

                {/* Core component */}
                <SparklesCore
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={1200}
                    className="w-full h-full"
                    particleColor="#FFFFFF"
                />

                {/* Radial Gradient to prevent sharp edges */}
                <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
                <div className="flex gap-4 justify-center mt-10">
                    <Link href="/swap">
                        <Button className="custom-backdrop duration-300 text-xl">Swap</Button>
                    </Link>
                    <Link href="/pools">
                        <Button className="custom-backdrop duration-300 text-xl">Liquidity pools</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
