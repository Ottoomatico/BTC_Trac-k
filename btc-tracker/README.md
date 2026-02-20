# BTC Predictor Engine: Real-Time Algorithmic Analysis System

## Abstract

The **BTC Predictor Engine** is a high-performance, browser-based web application designed to monitor, analyze, and forecast short-term price movements of Bitcoin (BTC/USDT). Built on a modern React (Next.js) architecture, the system integrates a live WebSocket data stream with historical REST API endpoints from Binance. At its core, it features an algorithmic trading model utilizing the Relative Strength Index (RSI) to generate directional market predictions. A built-in scoring mechanism recursively evaluates the model's accuracy against empirical market outcomes.

## Methodology

### 1. Data Acquisition
The engine operates on a dual-layer data ingestion protocol:
* **Historical Seeding (REST API):** Upon initialization, the system fetches the last 100 closed 1-minute candlesticks (Kline data) to establish a baseline mathematical context.
* **Real-Time Telemetry (WebSocket):** The system subscribes to the Binance continuous trade stream (`wss://stream.binance.com:9443/ws/btcusdt@trade`), updating the current price tick synchronously without HTTP overhead.

### 2. Algorithmic Trading Model
The prediction model operates deterministically based on momentum oscillator logic, specifically the **Relative Strength Index (RSI)** configured with a standard period of `14`. 

Instead of waiting for minute-candles to close, the algorithm calculates a "live" RSI by appending the macroscopic real-time price tick to the macroscopic historical array. This allows the model to capture intra-minute volatility.

#### Signal Generation Parameters:
The engine continuously evaluates the RSI series and emits a state variable (`UP`, `DOWN`, or `HOLD`). The discrete triggers are modeled as follows:

1. **Oversold Reversion (RSI $\le$ 30):** 
   Statistically, an asset is considered oversold and undervalued. The model generates an **`UP`** signal with high confidence, anticipating a mean-reverting bounce.
2. **Overbought Reversion (RSI $\ge$ 70):** 
   The asset is technically overextended. The model generates a **`DOWN`** signal, anticipating a corrective pullback.
3. **Bullish Momentum Cross (RSI > 50):** 
   When the previous RSI was below the median 50 threshold and the current RSI breaches it upward, it confirms an uptrend. The model signals **`UP`**.
4. **Bearish Momentum Cross (RSI < 50):** 
   Conversely, a downward breach of the median 50 threshold confirms a downtrend. The model signals **`DOWN`**.

*If none of these mathematical thresholds are met, the signal remains **`HOLD`**.*

### 3. Empirical Scoring System
A prediction is mathematically locked into the state interface at the exact moment a directional signal fires. 

* **Resolution Delay:** To account for market noise, the evaluation pipeline enforces a strict $t \ge 5000$ milliseconds delay before comparing the initial target price ($P_0$) with the current live price ($P_t$).
* **Verification:** 
  * If the prediction was `UP` and $P_t > P_0$, it yields a `WIN` ($+10$ points).
  * If the prediction was `UP` and $P_t < P_0$, it yields a `LOSS` ($-10$ points). (Symmetrical logic applies for `DOWN`).
* **Accuracy:** The system computes the probabilistic success rate $\left( \frac{\text{Wins}}{\text{Total Resolved Events}} = \text{Win Rate \%} \right)$, visualized through the front-end telemetry UI.

## Local Installation & Execution

### Prerequisites
* Node.js ($\ge$ 18.x)
* npm or yarn

### Deployment Steps
```bash
# 1. Clone the repository
git clone https://github.com/Ottoomatico/BTC_Trac-k.git

# 2. Navigate to the deterministic application directory
cd btc-tracker

# 3. Install core dependencies
npm install

# 4. Initialize the local development server
npm run dev
```

Navigate to `http://localhost:3000` to monitor the live analytical dashboard.
