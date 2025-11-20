'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ditherVertexShader, ditherFragmentShader } from './shaders/ditherShader';

export function DitheredBackground() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: ditherVertexShader,
      fragmentShader: ditherFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uColor1: { value: new THREE.Color('#0F172A') }, // Dark blue
        uColor2: { value: new THREE.Color('#1E40AF') }, // Medium blue
        uColor3: { value: new THREE.Color('#3B82F6') }, // Bright blue
        uDitherSize: { value: 8.0 },
        uNoiseScale: { value: 2.0 },
        uNoiseSpeed: { value: 0.3 },
      },
      side: THREE.DoubleSide,
    });
  }, []);

  // Animate shader
  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  // Handle resize
  useMemo(() => {
    const handleResize = () => {
      if (meshRef.current && meshRef.current.material) {
        const material = meshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <planeGeometry args={[100, 100]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}
