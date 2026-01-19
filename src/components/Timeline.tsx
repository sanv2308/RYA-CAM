import { useMarketStore } from '../store/useMarketStore';

export const Timeline = () => {
  const history = useMarketStore((state) => state.history);
  const selectedIndex = useMarketStore((state) => state.selectedIndex);
  const setSelectedIndex = useMarketStore((state) => state.setSelectedIndex);
  const live = useMarketStore((state) => state.live);

  const maxIndex = Math.max(history.length - 1, 0);

  return (
    <div className="timeline">
      <label>Replay Timeline (10m)</label>
      <input
        type="range"
        min={0}
        max={maxIndex}
        value={selectedIndex}
        onChange={(event) => setSelectedIndex(Number(event.target.value))}
        disabled={live}
      />
      <div className="toggle-row">
        <span className="badge">{live ? 'Streaming' : 'Replaying'}</span>
        <span className="legend">{history.length} frames buffered</span>
      </div>
    </div>
  );
};
