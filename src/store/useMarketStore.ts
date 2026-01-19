import { create } from 'zustand';
import { SimulationControls, SimulationSnapshot, SimulationState } from '../simulation/types';
import { createSimulation } from '../simulation/simulation';

const simulator = createSimulation(2040);

const defaultControls: SimulationControls = {
  weightConfig: {
    correlationShift: 1,
    volOfVol: 1,
    breadth: 1,
    sentimentShock: 1,
    liquidity: 1,
  },
  regimeSensitivity: 0.6,
  horizon: '1h',
  stressTest: 0.2,
  motionDamping: 0.4,
};

const initialState = simulator(defaultControls);

interface MarketStore {
  controls: SimulationControls;
  live: boolean;
  simulation: SimulationState;
  history: SimulationSnapshot[];
  selectedIndex: number;
  setControl: <K extends keyof SimulationControls>(key: K, value: SimulationControls[K]) => void;
  setWeight: (key: keyof SimulationControls['weightConfig'], value: number) => void;
  toggleLive: () => void;
  setSelectedIndex: (index: number) => void;
  tick: () => void;
}

export const useMarketStore = create<MarketStore>((set, get) => ({
  controls: defaultControls,
  live: true,
  simulation: initialState,
  history: [{ timestamp: Date.now(), state: initialState }],
  selectedIndex: 0,
  setControl: (key, value) =>
    set((state) => ({
      controls: {
        ...state.controls,
        [key]: value,
      },
    })),
  setWeight: (key, value) =>
    set((state) => ({
      controls: {
        ...state.controls,
        weightConfig: {
          ...state.controls.weightConfig,
          [key]: value,
        },
      },
    })),
  toggleLive: () => set((state) => ({ live: !state.live })),
  setSelectedIndex: (index) => set(() => ({ selectedIndex: index })),
  tick: () => {
    const { controls, history, live } = get();
    if (!live) {
      return;
    }
    const state = simulator(controls);
    const snapshot: SimulationSnapshot = { timestamp: Date.now(), state };
    const nextHistory = [...history, snapshot].slice(-600);
    set({
      simulation: state,
      history: nextHistory,
      selectedIndex: nextHistory.length - 1,
    });
  },
}));
