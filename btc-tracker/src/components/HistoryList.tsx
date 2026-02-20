"use client";

import { Clock, TrendingUp, TrendingDown, CheckCircle2, XCircle } from "lucide-react";
import { PredictionRecord } from "./Dashboard";
import { cn } from "@/lib/utils";

interface Props {
    history: PredictionRecord[];
}

export default function HistoryList({ history }: Props) {
    return (
        <div className="p-6 rounded-2xl bg-charcoal-light/30 border border-glass-border flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2 pb-4 border-b border-glass-border">
                <Clock className="w-4 h-4 text-foreground/50" />
                <h3 className="font-bold text-sm tracking-widest text-foreground/70 uppercase">Prediction Log</h3>
            </div>

            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                    <div className="text-center text-foreground/30 text-xs py-8">
                        No history yet. Waiting for market data.
                    </div>
                ) : (
                    history.map((record) => (
                        <div
                            key={record.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/[0.02] transition-colors"
                        >
                            {/* Left Side: Time and Prediction */}
                            <div className="flex items-center gap-4">
                                <div className="text-xs text-foreground/40 font-mono w-16">
                                    {record.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>

                                <div className={cn(
                                    "flex items-center gap-1 font-bold text-xs tracking-wider",
                                    record.prediction === "UP" ? "text-neon-green" : "text-neon-red"
                                )}>
                                    {record.prediction === "UP" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {record.prediction}
                                </div>
                            </div>

                            {/* Middle: Prices */}
                            <div className="hidden sm:flex flex-col items-end text-xs font-mono">
                                <div className="text-foreground/50">ENTRY: ${record.startPrice.toFixed(2)}</div>
                                {record.status !== "PENDING" && record.endPrice && (
                                    <div className="text-foreground/80">EXIT: ${record.endPrice.toFixed(2)}</div>
                                )}
                            </div>

                            {/* Right Side: Status */}
                            <div className="w-20 text-right">
                                {record.status === "PENDING" ? (
                                    <span className="text-xs text-blue-400 font-bold animate-pulse px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20">
                                        WAIT
                                    </span>
                                ) : record.status === "WIN" ? (
                                    <div className="flex items-center justify-end gap-1 text-neon-green text-xs font-bold">
                                        <CheckCircle2 className="w-4 h-4" /> WIN
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-end gap-1 text-neon-red text-xs font-bold">
                                        <XCircle className="w-4 h-4" /> LOSS
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Global CSS for scrollbar to fit the vibe */}
            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
        </div>
    );
}
