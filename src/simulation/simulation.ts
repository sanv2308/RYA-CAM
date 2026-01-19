import {
  ConfluenceContribution,
  ConfluenceState,
  DistributionCluster,
  HorizonFan,
  Regime,
  RegimeState,
  SimulationControls,
  SimulationState,
  Ticker,
} from './types';
import { mulberry32, normal } from './rng';

const regimes: Regime[] = ['trend', 'chop', 'crash-risk', 'melt-up', 'illiquid'];
const tickers: Ticker[] = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'QQQ'];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const normalize = (values: number[]) => {
  const total = values.reduce((sum, val) => sum + val, 0) || 1;
  return values.map((val) => val / total);
};

const buildClusters = (random: () => number, stress: number): DistributionCluster[] => {
  return Array.from({ length: 6 }).map(() => {
    const spread = 0.25 + random() * 0.55 + stress * 0.2;
    return {
      center: [normal(random) * 0.6, normal(random) * 0.6, normal(random) * 0.6],
      spread,
      intensity: clamp(0.5 + normal(random) * 0.25 + stress * 0.3, 0.2, 1.2),
    };
  });
};

const buildFans = (entropy: number, stress: number): HorizonFan[] => {
  const horizons: HorizonFan[] = ['5m', '1h', '1d'].map((horizon, index) => {
    const base = 0.2 + index * 0.25 + entropy * 0.4 + stress * 0.5;
    return {
      horizon: horizon as HorizonFan['horizon'],
      quantiles: [base * 0.6, base, base * 1.35],
    };
  });
  return horizons;
};

const buildRegime = (
  random: () => number,
  sensitivity: number,
  stress: number,
): RegimeState => {
  const raw = regimes.map((_, index) => {
    const bias = index === 2 ? stress * 1.4 : index === 3 ? stress * 0.6 : 0.2;
    return clamp(random() + bias + sensitivity * 0.15, 0.05, 1.8);
  });
  const normalized = normalize(raw);
  const probabilities = regimes.reduce<Record<Regime, number>>((acc, regime, index) => {
    acc[regime] = normalized[index];
    return acc;
  }, {} as Record<Regime, number>);

  return {
    probabilities,
    transitionRisk: clamp(0.2 + stress * 0.5 + random() * 0.4, 0, 1),
  };
};

const buildConfluence = (
  random: () => number,
  controls: SimulationControls,
  stress: number,
): ConfluenceState => {
  const contributions: ConfluenceContribution[] = tickers.map((ticker) => {
    const factors = {
      correlationShift: clamp(random() + stress * 0.5, 0, 1),
      volOfVol: clamp(random() + stress * 0.7, 0, 1),
      breadth: clamp(random() - stress * 0.2, 0, 1),
      sentimentShock: clamp(random() + stress * 0.6, 0, 1),
      liquidity: clamp(1 - random() + stress * 0.3, 0, 1),
    };

    const weightedScore =
      factors.correlationShift * controls.weightConfig.correlationShift +
      factors.volOfVol * controls.weightConfig.volOfVol +
      factors.breadth * controls.weightConfig.breadth +
      factors.sentimentShock * controls.weightConfig.sentimentShock +
      factors.liquidity * controls.weightConfig.liquidity;

    return {
      ticker,
      score: weightedScore / 5,
      factors,
    };
  });

  const total =
    contributions.reduce((sum, item) => sum + item.score, 0) / Math.max(contributions.length, 1);
  return { total, contributions };
};

const buildPointField = (
  random: () => number,
  clusters: DistributionCluster[],
  count: number,
): Float32Array => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const cluster = clusters[Math.floor(random() * clusters.length)];
    const dx = normal(random) * cluster.spread + cluster.center[0];
    const dy = normal(random) * cluster.spread + cluster.center[1];
    const dz = normal(random) * cluster.spread + cluster.center[2];
    positions[i * 3] = dx;
    positions[i * 3 + 1] = dy;
    positions[i * 3 + 2] = dz;
  }
  return positions;
};

export const createSimulation = (seed = 2040) => {
  const random = mulberry32(seed);
  let time = 0;

  return (controls: SimulationControls): SimulationState => {
    time += 1;
    const stress = clamp(controls.stressTest + Math.sin(time * 0.02) * 0.1, 0, 1);
    const entropy = clamp(0.2 + random() * 0.4 + stress * 0.4, 0, 1);
    const kurtosis = clamp(2.5 + random() * 2 + stress * 3, 1.5, 9);
    const tailRisk = clamp((kurtosis - 2.5) / 6 + stress * 0.3, 0, 1);

    const clusters = buildClusters(random, stress);
    const fans = buildFans(entropy, stress);
    const regime = buildRegime(random, controls.regimeSensitivity, stress);
    const confluence = buildConfluence(random, controls, stress);
    const pointField = buildPointField(random, clusters, 1600);

    return {
      time,
      entropy,
      kurtosis,
      tailRisk,
      clusters,
      fans,
      regime,
      confluence,
      pointField,
    };
  };
};
