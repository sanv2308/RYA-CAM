# Market Observatory

A futuristic, quant-grade single-page UI that simulates stochastic probability fields, regime drift, and multi-asset confluence for the top NASDAQ-weighted names.

## Module structure & state schema (plan)

**Modules**
- `src/simulation/*` — deterministic simulation seed, stochastic distributions, regimes, confluence engine, and probability field point cloud.
- `src/store/useMarketStore.ts` — state store, controls, replay buffer, and tick scheduler.
- `src/components/*` — 3D renderer (Three.js via react-three-fiber), HUD overlays, controls, and timeline scrubber.
- `src/App.tsx` — layout + wiring between simulation and UI.

**State schema (high-level)**
- `SimulationState`: entropy, kurtosis, tail risk, distribution clusters, horizon fan quantiles, regime probabilities + transition risk, confluence contributions, and point field positions.
- `SimulationControls`: factor weights, regime sensitivity, horizon focus, stress-test dial.
- `SimulationSnapshot`: timestamp + state for replay.

## Run locally

```bash
npm install
npm run dev
```

## Extend with real-time market data

The simulation functions in `src/simulation/` are structured so you can swap in real feeds:
- Replace `createSimulation()` with a data adapter that maps incoming ticks to the same `SimulationState` shape.
- Maintain deterministic replay by persisting incoming updates in `SimulationSnapshot` history.
- Confluence factors (`correlationShift`, `volOfVol`, `breadth`, `sentimentShock`, `liquidity`) already have explicit keys; plug in real signals without UI changes.

## Notes
- No external APIs are used; all visuals are simulated with a deterministic seed.
- Performance considerations include point field instancing, throttled simulation ticks, and minimal re-renders.
