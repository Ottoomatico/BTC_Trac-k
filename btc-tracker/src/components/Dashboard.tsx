"use client";

import { useEffect, useState, useRef } from "react";
import PriceTicker from "./PriceTicker";
import PredictionModule from "./PredictionModule";
import AccuracyGauge from "./AccuracyGauge";
import HistoryList from "./HistoryList";

export type Prediction = "UP" | "DOWN";
export type ResultStatus = "PENDING" | "WIN" | "LOSS";

export interface PredictionRecord {
    id: string;
    timestamp: Date;
    prediction: Prediction;
    startPrice: number;
    endPrice?: number;
    status: ResultStatus;
}

export default function Dashboard() {
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [prevPrice, setPrevPrice] = useState<number | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const [score, setScore] = useState(0);
    const [history, setHistory] = useState<PredictionRecord[]>([]);

    // WebSocket Connection
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        wsRef.current = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
        wsRef.current.onopen = () => setIsConnected(true);

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const price = parseFloat(data.p);
            setCurrentPrice((prev) => {
                if (prev !== null) setPrevPrice(prev);
                return price;
            });
        };

        wsRef.current.onclose = () => setIsConnected(false);
        return () => wsRef.current?.close();
    }, []);

    // Evaluation Logic
    // When price updates, check pending predictions and resolve them based on reality
    useEffect(() => {
        if (!currentPrice || history.length === 0) return;

        setHistory((prevHistory) => {
            let scoreChange = 0;
            let historyChanged = false;

            const newHistory = prevHistory.map((record) => {
                if (record.status !== "PENDING") return record;

                // Wait at least 5 seconds or a significant price movement to resolve
                const timeElapsed = Date.now() - record.timestamp.getTime();
                if (timeElapsed < 5000) return record;

                // Resolve
                const isUp = currentPrice > record.startPrice;
                const isDown = currentPrice < record.startPrice;

                let status: ResultStatus = "PENDING";
                if (record.prediction === "UP" && isUp) status = "WIN";
                else if (record.prediction === "UP" && isDown) status = "LOSS";
                else if (record.prediction === "DOWN" && isDown) status = "WIN";
                else if (record.prediction === "DOWN" && isUp) status = "LOSS";
                else status = "PENDING"; // tie, wait longer

                if (status !== "PENDING") {
                    historyChanged = true;
                    scoreChange += status === "WIN" ? 10 : -10;
                    return { ...record, status, endPrice: currentPrice };
                }
                return record;
            });

            if (historyChanged) {
                setScore((s) => s + scoreChange);
                return newHistory;
            }
            return prevHistory;
        });
    }, [currentPrice]); // intentionally omitting history to avoid infinite loop on every tick

    const handleMakePrediction = (prediction: Prediction) => {
        if (!currentPrice) return;

        const newRecord: PredictionRecord = {
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
            prediction,
            startPrice: currentPrice,
            status: "PENDING",
        };

        setHistory((prev) => [newRecord, ...prev].slice(0, 50)); // Keep last 50
    };

    return (
        <main className="flex flex-col gap-6 w-full p-4 sm:p-6 rounded-3xl bg-glass-bg border border-glass-border shadow-2xl backdrop-blur-xl">
            <header className="flex flex-col gap-2 mb-2 text-center">
                <h1 className="text-sm tracking-[0.3em] text-foreground/40 uppercase font-bold">
                    Live BTC Engine
                </h1>
                <PriceTicker currentPrice={currentPrice} prevPrice={prevPrice} isConnected={isConnected} />
            </header>

            <div className="flex flex-col gap-4">
                <PredictionModule onPredict={handleMakePrediction} currentPrice={currentPrice} pendingCount={history.filter(h => h.status === "PENDING").length} />

                <AccuracyGauge score={score} history={history} />

                <HistoryList history={history} />
            </div>
        </main>
    );
}
