'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { particleVertexShader, particleFragmentShader } from './shaders/particleShader';

interface ParticleFieldProps {
  count?: number;
}

export function ParticleField({ count = 5000 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particle positions and attributes
  const { positions, scales, randomness } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const randomness = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Position particles in a sphere
      const radius = Math.random() * 15 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Random scale
      scales[i] = Math.random();

      // Random animation offset
      randomness[i3] = Math.random() * Math.PI * 2;
      randomness[i3 + 1] = Math.random() * Math.PI * 2;
      randomness[i3 + 2] = Math.random() * Math.PI * 2;
    }

    return { positions, scales, randomness };
  }, [count]);

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 50.0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Animate particles
  useFrame((state) => {
    if (pointsRef.current && pointsRef.current.material) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;

      // Rotate the entire particle system
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          count={scales.length}
          array={scales}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aRandomness"
          count={randomness.length / 3}
          array={randomness}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} attach="material" />
    </points>
  );
}
