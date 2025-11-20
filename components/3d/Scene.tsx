'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { DitheredBackground } from './DitheredBackground';
import { ParticleField } from './ParticleField';
import { ProcessorChip } from './ProcessorChip';

interface SceneProps {
  enableControls?: boolean;
  className?: string;
}

export function Scene({ enableControls = false, className = '' }: SceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3B82F6" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
          color="#60A5FA"
        />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* Scene Components */}
        <Suspense fallback={null}>
          <DitheredBackground />
          <ParticleField count={3000} />
          <ProcessorChip />
        </Suspense>

        {/* Optional Controls for debugging */}
        {enableControls && (
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            maxDistance={20}
            minDistance={5}
          />
        )}
      </Canvas>
    </div>
  );
}

// Hero Scene - Specialized for landing page hero section
export function HeroScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Scene className="opacity-90" />
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none" />
    </div>
  );
}

// Feature Scene - Smaller scene for feature sections
export function FeatureScene() {
  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <Scene />
    </div>
  );
}
