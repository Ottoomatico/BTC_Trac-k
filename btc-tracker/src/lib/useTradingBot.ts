import { useState, useEffect, useRef } from 'react';
import { RSI } from 'technicalindicators';

// Binance K-line structure: [OpenTime, Open, High, Low, Close, Volume, CloseTime, ...]
type BinanceKline = [number, string, string, string, string, string, number, string, number, string, string, string];

export type BotSignal = "UP" | "DOWN" | "HOLD";

export interface BotState {
    isReady: boolean;
    currentRsi: number | null;
    signal: BotSignal;
    confidence: number;
    reason: string;
}

const RSI_PERIOD = 14;
const OVERBOUGHT = 70;
const OVERSOLD = 30;

export function useTradingBot(currentLivePrice: number | null) {
    const [botState, setBotState] = useState<BotState>({
        isReady: false,
        currentRsi: null,
        signal: "HOLD",
        confidence: 0,
        reason: "Initializing Engine...",
    });

    // Keep track of historical close prices for the RSI calculation
    const historyPricesRef = useRef<number[]>([]);
    // Store the last completely closed candle time to avoid adding duplicates
    const lastCandleTimeRef = useRef<number>(0);

    // 1. Fetch Historical Data to bootstrap the indicator
    useEffect(() => {
        async function fetchHistory() {
            try {
                // Fetch last 100 1-minute candles
                const res = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=100');
                const data: BinanceKline[] = await res.json();

                const closes = data.map(kline => parseFloat(kline[4])); // Index 4 is Close price
                historyPricesRef.current = closes;
                lastCandleTimeRef.current = data[data.length - 1][0]; // Index 0 is Open time

                analyzeData(closes);
            } catch (error) {
                console.error("Failed to fetch Binance history:", error);
            }
        }

        fetchHistory();

        // We poll for new completed candles every 30 seconds as fallback to keep history accurate
        const interval = setInterval(fetchHistory, 30000);
        return () => clearInterval(interval);
    }, []);

    // 2. Live Update the Indicator with WS Price
    useEffect(() => {
        if (!currentLivePrice || historyPricesRef.current.length < RSI_PERIOD) return;

        // Create a temporary array with the live price appended to calculate the "live" RSI
        // This allows the bot to react mid-minute before the candle officially closes
        const livePrices = [...historyPricesRef.current, currentLivePrice];
        analyzeData(livePrices);

    }, [currentLivePrice]);

    const analyzeData = (prices: number[]) => {
        if (prices.length < RSI_PERIOD + 1) return;

        // Calculate RSI
        const rsiValues = RSI.calculate({ values: prices, period: RSI_PERIOD });
        if (rsiValues.length === 0) return;

        const latestRsi = rsiValues[rsiValues.length - 1];

        // Strategy Logic: Mean Reversion / Momentum based on RSI
        let newSignal: BotSignal = "HOLD";
        let newConfidence = 0;
        let newReason = `RSI Stable at ${latestRsi.toFixed(1)}`;

        if (latestRsi <= OVERSOLD) {
            // Heavily Oversold -> Expect Bounce (UP)
            newSignal = "UP";
            newConfidence = Math.min(95, 100 - latestRsi + 20); // Lower RSI = Higher Confidence
            newReason = `Oversold Territory (RSI: ${latestRsi.toFixed(1)} < 30)`;
        } else if (latestRsi >= OVERBOUGHT) {
            // Heavily Overbought -> Expect Drop (DOWN)
            newSignal = "DOWN";
            newConfidence = Math.min(95, latestRsi + 10);
            newReason = `Overbought Territory (RSI: ${latestRsi.toFixed(1)} > 70)`;
        } else if (latestRsi > 50 && rsiValues.length >= 2 && rsiValues[rsiValues.length - 2] <= 50) {
            // Golden line cross upwards (Momentum)
            newSignal = "UP";
            newConfidence = 65;
            newReason = `Bullish Momentum Cross (RSI: ${latestRsi.toFixed(1)} > 50)`;
        } else if (latestRsi < 50 && rsiValues.length >= 2 && rsiValues[rsiValues.length - 2] >= 50) {
            // Death cross downwards (Momentum)
            newSignal = "DOWN";
            newConfidence = 65;
            newReason = `Bearish Momentum Cross (RSI: ${latestRsi.toFixed(1)} < 50)`;
        }

        setBotState({
            isReady: true,
            currentRsi: latestRsi,
            signal: newSignal,
            confidence: newConfidence,
            reason: newReason,
        });
    };

    return botState;
}
