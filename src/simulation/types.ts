export type Regime =
  | 'trend'
  | 'chop'
  | 'crash-risk'
  | 'melt-up'
  | 'illiquid';

export type Horizon = '5m' | '1h' | '1d';

export type Ticker =
  | 'AAPL'
  | 'MSFT'
  | 'NVDA'
  | 'AMZN'
  | 'GOOGL'
  | 'META'
  | 'TSLA'
  | 'QQQ';

export interface DistributionCluster {
  center: [number, number, number];
  spread: number;
  intensity: number;
}

export interface HorizonFan {
  horizon: Horizon;
  quantiles: [number, number, number];
}

export interface RegimeState {
  probabilities: Record<Regime, number>;
  transitionRisk: number;
}

export interface ConfluenceContribution {
  ticker: Ticker;
  score: number;
  factors: {
    correlationShift: number;
    volOfVol: number;
    breadth: number;
    sentimentShock: number;
    liquidity: number;
  };
}

export interface ConfluenceState {
  total: number;
  contributions: ConfluenceContribution[];
}

export interface SimulationState {
  time: number;
  entropy: number;
  kurtosis: number;
  tailRisk: number;
  clusters: DistributionCluster[];
  fans: HorizonFan[];
  regime: RegimeState;
  confluence: ConfluenceState;
  pointField: Float32Array;
}

export interface SimulationControls {
  weightConfig: {
    correlationShift: number;
    volOfVol: number;
    breadth: number;
    sentimentShock: number;
    liquidity: number;
  };
  regimeSensitivity: number;
  horizon: Horizon;
  stressTest: number;
  motionDamping: number;
}

export interface SimulationSnapshot {
  timestamp: number;
  state: SimulationState;
}
