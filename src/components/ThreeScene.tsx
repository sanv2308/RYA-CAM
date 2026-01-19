import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { OrbitControls, Stars } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { Mesh, Points, AdditiveBlending, Color, BufferAttribute } from 'three';
import { SimulationState } from '../simulation/types';
import { useMarketStore } from '../store/useMarketStore';

interface SceneProps {
  simulation: SimulationState;
}

const ProbabilityField = ({ simulation }: SceneProps) => {
  const pointsRef = useRef<Points>(null);
  const sphereRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  const { camera } = useThree();
  const activeHorizon = useMarketStore((state) => state.controls.horizon);

  const geometry = useMemo(() => {
    const positions = simulation.pointField;
    return new BufferAttribute(positions, 3);
  }, [simulation.pointField]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const stress = simulation.tailRisk;
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * (0.12 - stress * 0.08);
      sphereRef.current.rotation.x = t * (0.08 - stress * 0.05);
      sphereRef.current.scale.setScalar(1 + Math.sin(t * 0.6) * 0.02 + stress * 0.05);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.2;
      ringRef.current.scale.setScalar(1.4 + simulation.regime.transitionRisk * 0.3);
    }
    if (camera) {
      camera.position.x = Math.sin(t * 0.1) * 0.6;
      camera.position.y = 0.6 + Math.cos(t * 0.08) * 0.2;
      camera.lookAt(0, 0, 0);
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={geometry.array}
            count={geometry.count}
            itemSize={geometry.itemSize}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color={new Color('#7ef9ff')}
          opacity={0.6}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.6, 64, 64]} />
        <meshStandardMaterial
          color={'#2b6bff'}
          emissive={'#8dd0ff'}
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.4}
          transparent
          opacity={0.35}
        />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.9, 0.04 + simulation.regime.transitionRisk * 0.05, 32, 200]} />
        <meshStandardMaterial
          color={'#ff9bcf'}
          emissive={'#7ef9ff'}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      {simulation.fans.map((fan, index) => (
        <mesh key={fan.horizon} rotation={[Math.PI / 2, 0, (index * Math.PI) / 3]}>
          <coneGeometry args={[fan.quantiles[2] + 0.2, 1.6, 32, 1, true]} />
          <meshStandardMaterial
            color={'#7a8cff'}
            transparent
            opacity={fan.horizon === activeHorizon ? 0.45 : 0.12 + index * 0.04}
            wireframe
          />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.72, 64]} />
        <meshBasicMaterial
          color={'#ff5f9e'}
          transparent
          opacity={0.3 + simulation.tailRisk * 0.4}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export const ThreeScene = ({ simulation }: SceneProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 2.2], fov: 55 }}
      style={{ background: 'radial-gradient(circle at center, #0a1628, #05070c 70%)' }}
    >
      <fog attach="fog" args={['#05070c', 2, 6]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1.4} color={'#7ef9ff'} />
      <pointLight position={[-2, -1, 1]} intensity={0.8} color={'#ff9bcf'} />
      <ProbabilityField simulation={simulation} />
      <Stars radius={80} depth={40} count={1200} factor={2} saturation={0} fade speed={0.3} />
      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
      </EffectComposer>
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
};
