"use client";

import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    currentPrice: number | null;
    prevPrice: number | null;
    isConnected: boolean;
}

export default function PriceTicker({ currentPrice, prevPrice, isConnected }: Props) {
    const isUp = prevPrice !== null && currentPrice !== null && currentPrice > prevPrice;
    const isDown = prevPrice !== null && currentPrice !== null && currentPrice < prevPrice;

    return (
        <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-2">
                <span
                    className={cn(
                        "text-5xl font-bold tracking-tight transition-colors duration-300",
                        isUp ? "text-neon-green drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]" : "",
                        isDown ? "text-neon-red drop-shadow-[0_0_15px_rgba(255,0,60,0.5)]" : "",
                        !isUp && !isDown && currentPrice !== null ? "text-foreground drop-shadow-md" : "",
                        currentPrice === null ? "text-foreground/30 animate-pulse" : ""
                    )}
                >
                    {currentPrice !== null ? `$${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Loading..."}
                </span>
                {isUp && <ArrowUpRight className="text-neon-green w-8 h-8" />}
                {isDown && <ArrowDownRight className="text-neon-red w-8 h-8" />}
            </div>

            <div className="flex items-center gap-2 text-xs mt-2 text-foreground/50">
                <Activity className={cn("w-3 h-3", isConnected ? "text-neon-green" : "text-neon-red")} />
                {isConnected ? "Live Binance WebSockets" : "Connecting..."}
            </div>
        </div>
    );
}
