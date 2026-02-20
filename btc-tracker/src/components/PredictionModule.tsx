"use client";

import { BrainCircuit, Play, TrendingDown, TrendingUp, Cpu } from "lucide-react";
import { BotState } from "@/lib/useTradingBot";
import { cn } from "@/lib/utils";

interface Props {
    botState: BotState;
    pendingCount: number;
}

export default function PredictionModule({ botState, pendingCount }: Props) {
    const { isReady, signal, confidence, currentRsi, reason } = botState;

    return (
        <div className="p-6 rounded-2xl bg-charcoal-light/30 border border-glass-border flex flex-col gap-4 relative overflow-hidden">
            {/* Background glow based on active signal */}
            <div className={cn(
                "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 transition-colors duration-1000",
                !isReady ? "bg-blue-500" : signal === "UP" ? "bg-neon-green" : signal === "DOWN" ? "bg-neon-red" : "bg-white/10"
            )} />

            <div className="flex items-center justify-between z-10 w-full flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-glass-bg rounded-full border border-glass-border">
                        <BrainCircuit className={cn("w-5 h-5", !isReady ? "text-blue-400 animate-pulse" : "text-foreground/70")} />
                    </div>
                    <div>
                        <h2 className="font-semibold tracking-wide text-sm">ALGORITHMIC TRADING BOT</h2>
                        <p className="text-xs text-foreground/50">Status: {!isReady ? "Bootstraping History..." : pendingCount > 0 ? "Awaiting Trade Resolution..." : "Scanning Market"}</p>
                    </div>
                </div>

                <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold border transition-colors duration-300",
                    !isReady ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        signal !== "HOLD" ? "bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]" :
                            "bg-glass-bg text-foreground/50 border-glass-border"
                )}>
                    {!isReady ? "INITIALIZING" : signal !== "HOLD" ? "SIGNAL FIRED" : "ACTIVE"}
                </div>
            </div>

            {/* Live Indicator Telemetry */}
            {isReady && currentRsi !== null && (
                <div className="flex items-center justify-between text-xs px-3 py-2 bg-black/40 border border-white/5 rounded-lg z-10 font-mono text-foreground/60 w-full mb-1">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-3 h-3 text-blue-400" /> RSI (14m): {currentRsi.toFixed(2)}
                    </div>
                    <div className="truncate max-w-[200px] text-right" title={reason}>{reason}</div>
                </div>
            )}

            <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-xl border border-white/5 relative z-10 min-h-[140px] transition-all">
                {isReady && signal !== "HOLD" ? (
                    <div className="flex flex-col flex-1 items-center justify-center gap-2 animate-in fade-in zoom-in duration-500">
                        <div className="text-xs text-foreground/40 font-mono tracking-widest uppercase">Target Detected</div>
                        <div className={cn(
                            "text-4xl sm:text-5xl font-black tracking-widest flex items-center gap-2",
                            signal === "UP" ? "text-neon-green drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]" : "text-neon-red drop-shadow-[0_0_10px_rgba(255,0,60,0.3)]"
                        )}>
                            {signal} {signal === "UP" ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                        </div>
                        <div className="text-sm font-mono mt-2 flex gap-4">
                            <span className="text-foreground/60">CONFIDENCE: <span className="text-foreground">{confidence}%</span></span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-foreground/30 gap-2">
                        {!isReady ? (
                            <Play className="w-8 h-8 opacity-50 animate-pulse" />
                        ) : (
                            <BrainCircuit className="w-8 h-8 opacity-50" />
                        )}
                        <span className="text-sm">
                            {!isReady ? "Fetching historical K-lines..." : "HOLD: Waiting for strong indicator signal..."}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
