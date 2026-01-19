import { SimulationControls } from '../simulation/types';
import { useMarketStore } from '../store/useMarketStore';

const factorLabels: Record<keyof SimulationControls['weightConfig'], string> = {
  correlationShift: 'Correlation Shift',
  volOfVol: 'Vol-of-Vol',
  breadth: 'Breadth',
  sentimentShock: 'Sentiment Shock',
  liquidity: 'Liquidity',
};

export const ControlsPanel = () => {
  const controls = useMarketStore((state) => state.controls);
  const setControl = useMarketStore((state) => state.setControl);
  const setWeight = useMarketStore((state) => state.setWeight);
  const live = useMarketStore((state) => state.live);
  const toggleLive = useMarketStore((state) => state.toggleLive);

  return (
    <div className="panel">
      <h1>Market Observatory</h1>
      <section>
        <label>Confluence Weights</label>
        {Object.entries(controls.weightConfig).map(([key, value]) => (
          <div key={key}>
            <div className="toggle-row">
              <span className="badge">{factorLabels[key as keyof typeof factorLabels]}</span>
              <span>{value.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={value}
              onChange={(event) => setWeight(key as keyof typeof controls.weightConfig, Number(event.target.value))}
            />
          </div>
        ))}
      </section>
      <section>
        <label>Regime Sensitivity</label>
        <div className="toggle-row">
          <span className="badge">Drift Gain</span>
          <span>{controls.regimeSensitivity.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1.2}
          step={0.05}
          value={controls.regimeSensitivity}
          onChange={(event) => setControl('regimeSensitivity', Number(event.target.value))}
        />
      </section>
      <section>
        <label>Horizon Focus</label>
        <div className="toggle-row">
          <span className="badge">{controls.horizon}</span>
        </div>
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={['5m', '1h', '1d'].indexOf(controls.horizon)}
          onChange={(event) => {
            const options: Array<'5m' | '1h' | '1d'> = ['5m', '1h', '1d'];
            setControl('horizon', options[Number(event.target.value)]);
          }}
        />
      </section>
      <section>
        <label>Stress Test Scenario</label>
        <div className="toggle-row">
          <span className="badge">Liquidity Vacuum</span>
          <span>{controls.stressTest.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={controls.stressTest}
          onChange={(event) => setControl('stressTest', Number(event.target.value))}
        />
      </section>
      <section>
        <label>Replay Mode</label>
        <div className="toggle-row">
          <span className="badge">{live ? 'Live' : 'Scrub'}</span>
          <button
            type="button"
            onClick={toggleLive}
            style={{
              background: 'transparent',
              border: '1px solid rgba(120, 170, 255, 0.3)',
              color: '#9db9ff',
              padding: '6px 12px',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            {live ? 'Pause' : 'Resume'}
          </button>
        </div>
      </section>
    </div>
  );
};
