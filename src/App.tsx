import { useEffect, useMemo } from 'react';
import { ControlsPanel } from './components/ControlsPanel';
import { Hud } from './components/Hud';
import { ThreeScene } from './components/ThreeScene';
import { Timeline } from './components/Timeline';
import { useMarketStore } from './store/useMarketStore';

const App = () => {
  const tick = useMarketStore((state) => state.tick);
  const history = useMarketStore((state) => state.history);
  const selectedIndex = useMarketStore((state) => state.selectedIndex);
  const live = useMarketStore((state) => state.live);

  useEffect(() => {
    const id = window.setInterval(() => {
      tick();
    }, 220);
    return () => window.clearInterval(id);
  }, [tick]);

  const simulation = useMemo(() => {
    if (live) {
      return history[history.length - 1].state;
    }
    return history[selectedIndex]?.state ?? history[history.length - 1].state;
  }, [history, selectedIndex, live]);

  return (
    <div className="app">
      <ControlsPanel />
      <div className="canvas-wrap">
        <ThreeScene simulation={simulation} />
        <Hud simulation={simulation} />
        <div style={{ position: 'absolute', left: 24, bottom: 24, width: 320 }}>
          <Timeline />
        </div>
      </div>
    </div>
  );
};

export default App;
