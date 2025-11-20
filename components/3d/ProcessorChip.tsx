'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function ProcessorChip() {
  const chipRef = useRef<THREE.Group>(null);
  const pinsRef = useRef<THREE.Group>(null);

  // Animate chip
  useFrame((state) => {
    if (chipRef.current) {
      chipRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      chipRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
      chipRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }

    if (pinsRef.current) {
      pinsRef.current.children.forEach((pin, i) => {
        pin.position.y = Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.05;
      });
    }
  });

  // Generate pin positions
  const pins = useMemo(() => {
    const positions = [];

    // Top pins
    for (let i = 0; i < 8; i++) {
      positions.push({ x: -1.4 + i * 0.4, y: 0, z: 1.6 });
    }

    // Bottom pins
    for (let i = 0; i < 8; i++) {
      positions.push({ x: -1.4 + i * 0.4, y: 0, z: -1.6 });
    }

    // Left pins
    for (let i = 0; i < 6; i++) {
      positions.push({ x: -1.6, y: 0, z: -1.0 + i * 0.4 });
    }

    // Right pins
    for (let i = 0; i < 6; i++) {
      positions.push({ x: 1.6, y: 0, z: -1.0 + i * 0.4 });
    }

    return positions;
  }, []);

  return (
    <group ref={chipRef}>
      {/* Main Chip Body */}
      <RoundedBox args={[3, 0.3, 3]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color="#1E40AF"
          metalness={0.8}
          roughness={0.2}
          emissive="#2563EB"
          emissiveIntensity={0.2}
        />
      </RoundedBox>

      {/* Glass-like surface */}
      <RoundedBox args={[2.8, 0.05, 2.8]} position={[0, 0.18, 0]} radius={0.08} smoothness={4}>
        <MeshTransmissionMaterial
          background={new THREE.Color('#1E40AF')}
          transmission={0.9}
          thickness={0.2}
          roughness={0.1}
          chromaticAberration={0.5}
          anisotropy={1}
        />
      </RoundedBox>

      {/* Grid pattern on chip */}
      {[...Array(6)].map((_, i) => (
        <group key={`grid-${i}`}>
          {/* Horizontal lines */}
          <mesh position={[0, 0.16, -1.2 + i * 0.4]}>
            <boxGeometry args={[2.6, 0.02, 0.03]} />
            <meshStandardMaterial
              color="#60A5FA"
              emissive="#60A5FA"
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Vertical lines */}
          <mesh position={[-1.2 + i * 0.4, 0.16, 0]}>
            <boxGeometry args={[0.03, 0.02, 2.6]} />
            <meshStandardMaterial
              color="#60A5FA"
              emissive="#60A5FA"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      ))}

      {/* Center Square (Core) */}
      <RoundedBox args={[0.8, 0.15, 0.8]} position={[0, 0.23, 0]} radius={0.05} smoothness={4}>
        <meshStandardMaterial
          color="#3B82F6"
          metalness={1}
          roughness={0.1}
          emissive="#2563EB"
          emissiveIntensity={0.8}
        />
      </RoundedBox>

      {/* Pins */}
      <group ref={pinsRef}>
        {pins.map((pos, i) => (
          <mesh key={i} position={[pos.x, pos.y, pos.z]}>
            <boxGeometry args={[0.15, 0.3, 0.15]} />
            <meshStandardMaterial
              color="#93C5FD"
              metalness={0.9}
              roughness={0.1}
              emissive="#60A5FA"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* Cloud symbol (tiny) */}
      <group position={[1.2, 0.2, 1.2]} scale={0.15}>
        <mesh>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="white"
            emissive="white"
            emissiveIntensity={0.5}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[-0.5, 0.1, 0]} scale={[0.8, 0.8, 0.8]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="white"
            emissive="white"
            emissiveIntensity={0.5}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0.5, 0.1, 0]} scale={[0.7, 0.7, 0.7]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="white"
            emissive="white"
            emissiveIntensity={0.5}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
    </group>
  );
}
