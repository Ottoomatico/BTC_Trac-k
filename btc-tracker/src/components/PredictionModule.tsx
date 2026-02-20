"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Play, TrendingDown, TrendingUp } from "lucide-react";
import { Prediction } from "./Dashboard";
import { cn } from "@/lib/utils";

interface Props {
    onPredict: (prediction: Prediction) => void;
    currentPrice: number | null;
    pendingCount: number;
}

export default function PredictionModule({ onPredict, currentPrice, pendingCount }: Props) {
    const [isPredicting, setIsPredicting] = useState(false);
    const [nextPrediction, setNextPrediction] = useState<Prediction | null>(null);
    const [confidence, setConfidence] = useState(0);

    // Auto-predicting effect
    useEffect(() => {
        if (!currentPrice) return;

        // Simple mock model: Predicts randomly every 10 seconds
        const interval = setInterval(() => {
            setIsPredicting(true);

            setTimeout(() => {
                const rand = Math.random();
                const predictedMove: Prediction = rand > 0.5 ? "UP" : "DOWN";
                const estimatedConfidence = Math.floor(Math.random() * 30 + 60); // 60-90%

                setNextPrediction(predictedMove);
                setConfidence(estimatedConfidence);

                onPredict(predictedMove);
                setIsPredicting(false);
            }, 1500); // UI delay for "Thinking"
        }, 10000);

        return () => clearInterval(interval);
    }, [currentPrice, onPredict]);

    return (
        <div className="p-6 rounded-2xl bg-charcoal-light/30 border border-glass-border flex flex-col gap-4 relative overflow-hidden">
            {/* Background glow */}
            <div className={cn(
                "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 transition-colors duration-1000",
                nextPrediction === "UP" ? "bg-neon-green" : nextPrediction === "DOWN" ? "bg-neon-red" : "bg-blue-500"
            )} />

            <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-glass-bg rounded-full border border-glass-border">
                        <BrainCircuit className={cn("w-5 h-5", isPredicting ? "text-blue-400 animate-pulse" : "text-foreground/70")} />
                    </div>
                    <div>
                        <h2 className="font-semibold tracking-wide text-sm">AI PREDICTION MODEL</h2>
                        <p className="text-xs text-foreground/50">Status: {isPredicting ? "Analyzing Market Data..." : pendingCount > 0 ? "Awaiting Resolution..." : "Idle"}</p>
                    </div>
                </div>

                <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold border",
                    isPredicting ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-glass-bg text-foreground/50 border-glass-border"
                )}>
                    {isPredicting ? "PROCESSING" : "ACTIVE"}
                </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-xl border border-white/5 relative z-10 min-h-[140px]">
                {nextPrediction ? (
                    <div className="flex flex-col flex-1 items-center justify-center gap-2 animate-in fade-in zoom-in duration-500">
                        <div className="text-xs text-foreground/40 font-mono tracking-widest uppercase">Next Move Predicted</div>
                        <div className={cn(
                            "text-4xl font-black tracking-widest flex items-center gap-2",
                            nextPrediction === "UP" ? "text-neon-green drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]" : "text-neon-red drop-shadow-[0_0_10px_rgba(255,0,60,0.3)]"
                        )}>
                            {nextPrediction} {nextPrediction === "UP" ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                        </div>
                        <div className="text-sm font-mono mt-2 flex gap-4">
                            <span className="text-foreground/60">CONFIDENCE: <span className="text-foreground">{confidence}%</span></span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-foreground/30 gap-2">
                        <Play className="w-8 h-8 opacity-50" />
                        <span className="text-sm">Awaiting first data point...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
