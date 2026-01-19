import { SimulationState } from '../simulation/types';

interface HudProps {
  simulation: SimulationState;
}

export const Hud = ({ simulation }: HudProps) => {
  const dominantRegime = Object.entries(simulation.regime.probabilities).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="hud">
      <div className="hud-card">
        <div className="hud-title">Regime Drift</div>
        <div className="stat-grid">
          <div className="stat-row">
            <span>Dominant</span>
            <span>{dominantRegime?.[0]}</span>
          </div>
          <div className="stat-row">
            <span>Transition Risk</span>
            <span>{simulation.regime.transitionRisk.toFixed(2)}</span>
          </div>
          <div className="regime-bar">
            <div
              className="regime-fill"
              style={{ width: `${Math.min(simulation.regime.transitionRisk * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
      <div className="hud-card">
        <div className="hud-title">Tail Event Forming</div>
        <div className="stat-grid">
          <div className="stat-row">
            <span>Entropy</span>
            <span>{simulation.entropy.toFixed(2)}</span>
          </div>
          <div className="stat-row">
            <span>Kurtosis</span>
            <span>{simulation.kurtosis.toFixed(2)}</span>
          </div>
          <div className="stat-row">
            <span>Tail Risk</span>
            <span>{simulation.tailRisk.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="hud-card">
        <div className="hud-title">Confluence Engine</div>
        <div className="stat-grid">
          <div className="stat-row">
            <span>Total Score</span>
            <span>{simulation.confluence.total.toFixed(2)}</span>
          </div>
          <div className="confluence-list">
            {simulation.confluence.contributions.map((item) => (
              <div className="confluence-item" key={item.ticker}>
                <span>{item.ticker}</span>
                <span>{item.score.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hud-card">
        <div className="hud-title">Signal Glossary</div>
        <div className="legend">
          Fan cones = horizon quantiles. Halo deformation = transition risk. Edge shadow = tail risk.
        </div>
      </div>
    </div>
  );
};
