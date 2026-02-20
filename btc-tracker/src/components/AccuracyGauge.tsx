"use client";

import { Target, Activity } from "lucide-react";
import { PredictionRecord } from "./Dashboard";

interface Props {
    score: number;
    history: PredictionRecord[];
}

export default function AccuracyGauge({ score, history }: Props) {
    const completed = history.filter(h => h.status !== "PENDING");
    const wins = completed.filter(h => h.status === "WIN").length;

    const winRate = completed.length > 0
        ? Math.round((wins / completed.length) * 100)
        : 0;

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Score Card */}
            <div className="p-4 sm:p-6 rounded-2xl bg-charcoal-light/30 border border-glass-border flex flex-col gap-2 relative overflow-hidden group">
                <div className="flex items-center gap-2 text-foreground/50 text-xs tracking-widest uppercase font-bold mb-1">
                    <Target className="w-4 h-4" /> Total Score
                </div>
                <div className="text-4xl sm:text-5xl font-black tracking-tighter">
                    {score > 0 ? "+" : ""}{score}
                </div>
                <div className="text-xs text-foreground/40 mt-1">Points based on reality</div>

                {/* Decorative elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
            </div>

            {/* Accuracy Card */}
            <div className="p-4 sm:p-6 rounded-2xl bg-charcoal-light/30 border border-glass-border flex flex-col gap-2 relative overflow-hidden group">
                <div className="flex items-center gap-2 text-foreground/50 text-xs tracking-widest uppercase font-bold mb-1">
                    <Activity className="w-4 h-4" /> Win Rate
                </div>

                <div className="flex items-end gap-2">
                    <div className="text-3xl sm:text-4xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                        {winRate}%
                    </div>
                    <div className="text-xs text-foreground/40 mb-1 sm:mb-2">
                        ({wins}/{completed.length})
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-black/40 rounded-full mt-auto overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${winRate}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
