# 3D Landing Page with WebGL Shaders

## Overview

The Visucan landing page now features a cutting-edge 3D visualization built with **Three.js**, **@react-three/fiber**, **@react-three/drei**, and **GSAP**. The page includes custom WebGL shaders for dithering effects, an animated 3D processor chip model, and a particle field system.

## Technology Stack

- **Three.js**: 3D graphics library for WebGL
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers and abstractions for react-three-fiber
- **GSAP (GreenSock Animation Platform)**: Professional-grade animation library
- **Custom GLSL Shaders**: Vertex and fragment shaders for advanced visual effects

## Architecture

### Components Structure

```
components/3d/
├── shaders/
│   ├── ditherShader.ts       # Dithering shader with Bayer matrix
│   └── particleShader.ts     # Particle system shaders
├── DitheredBackground.tsx    # Full-screen animated background
├── ParticleField.tsx         # 3D particle system
├── ProcessorChip.tsx         # Animated 3D processor chip
└── Scene.tsx                 # Main 3D scene with lighting
```

### Shader System

#### Dither Shader (`shaders/ditherShader.ts`)

The dithering shader creates a retro-digital aesthetic with:

- **Bayer Matrix Dithering**: Implements 2x2, 4x4, 8x8, 16x16, and 32x32 Bayer matrices
- **Fractal Brownian Motion (FBM)**: Multi-octave noise for organic animation
- **Animated Gradients**: Time-based color mixing with blue theme (#0F172A, #1E40AF, #3B82F6)
- **Customizable Parameters**:
  - `uTime`: Animation time uniform
  - `uResolution`: Screen resolution for proper aspect ratio
  - `uDitherSize`: Controls dithering granularity (2, 4, 8, 16, 32)
  - `uNoiseScale`: FBM noise scale
  - `uNoiseSpeed`: Animation speed

**Technical Features**:
```glsl
// Bayer matrix implementation
float bayer2(vec2 a) { ... }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer2(0.25 * a) * 0.0625 + bayer4(a); }
// ... up to bayer32

// FBM noise for organic animation
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for(int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
```

#### Particle Shader (`shaders/particleShader.ts`)

Creates a glowing particle field with:

- **Animated Particles**: Individual particle animation with randomness
- **Size Attenuation**: Particles scale based on camera distance
- **Glow Effect**: Circular particles with soft falloff
- **Color Variation**: Position-based color mapping

**Key Features**:
```glsl
// Size attenuation for depth perception
gl_PointSize = uSize * aScale * (1.0 / -viewPosition.z);

// Circular particles with glow
float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
float strength = 0.05 / distanceToCenter - 0.1;
vec3 color = vColor * strength;
```

### 3D Components

#### 1. DitheredBackground (`DitheredBackground.tsx`)

Full-screen animated background plane with dithering shader.

**Features**:
- Responsive to window resize
- Continuous time animation
- Blue gradient theme matching brand colors
- Positioned behind all content (z: -5)

**Usage**:
```tsx
import { DitheredBackground } from '@/components/3d/DitheredBackground';

<DitheredBackground />
```

#### 2. ParticleField (`ParticleField.tsx`)

5000+ GPU-accelerated particles in a spherical distribution.

**Features**:
- Spherical particle distribution (radius 5-20 units)
- Individual particle randomness attributes
- Additive blending for glow effect
- Continuous rotation animation
- Configurable particle count

**Usage**:
```tsx
import { ParticleField } from '@/components/3d/ParticleField';

<ParticleField count={3000} />
```

**Performance**: Uses instanced rendering with custom attributes for optimal GPU performance.

#### 3. ProcessorChip (`ProcessorChip.tsx`)

Animated 3D processor chip with realistic materials.

**Features**:
- **Metallic Body**: Blue metallic chip body (#1E40AF) with rounded edges
- **Glass Surface**: Transmission material with chromatic aberration
- **Grid Pattern**: 6x6 glowing blue grid lines
- **Center Core**: Highly emissive central processing core
- **28 Animated Pins**: Individual pin animations
- **Cloud Symbol**: Small decorative cloud (representing cloud computing)

**Materials**:
- Metalness: 0.8 - 1.0
- Roughness: 0.1 - 0.2
- Emissive intensity: 0.2 - 0.8
- Transmission: 0.9 (glass layer)

**Animations**:
- Gentle rotation (sin/cos based)
- Floating motion (vertical oscillation)
- Individual pin bobbing

**Usage**:
```tsx
import { ProcessorChip } from '@/components/3d/ProcessorChip';

<ProcessorChip />
```

#### 4. Scene (`Scene.tsx`)

Main 3D scene orchestration with lighting and camera setup.

**Lighting Setup**:
- **Ambient Light**: 0.5 intensity (base illumination)
- **Directional Light**: 1.0 intensity with shadows (main light)
- **Point Light**: 0.5 intensity, blue color (#3B82F6)
- **Spot Light**: 1.0 intensity, blue color (#60A5FA)
- **Environment**: City preset for realistic reflections

**Camera**:
- Perspective camera at [0, 0, 10]
- 60° field of view
- Supports 1x-2x pixel density

**Variants**:
```tsx
// General scene
<Scene enableControls={false} />

// Hero scene with gradient overlay
<HeroScene />

// Feature scene (smaller, 400px height)
<FeatureScene />
```

### Landing Page Integration

The landing page (`app/page.tsx`) is now a **'use client'** component with:

#### GSAP Animations

**Hero Content Animations**:
1. **Title**: Fade in from below (y: 50) with 1s duration, 0.5s delay
2. **Subtitle**: Fade in from below (y: 30) with 1s duration, 0.8s delay
3. **CTA Buttons**: Fade in from below (y: 30) with 1s duration, 1.1s delay

**Parallax Effect**:
- Hero section moves down (y: 200) as user scrolls
- Smooth scrubbing animation

```tsx
// GSAP ScrollTrigger setup
gsap.to(heroRef.current, {
  scrollTrigger: {
    trigger: heroRef.current,
    start: "top top",
    end: "bottom top",
    scrub: true,
  },
  y: 200,
  ease: "none",
});
```

#### Header

- **Fixed Position**: Stays at top during scroll
- **Glassmorphism**: `bg-background/80 backdrop-blur-md`
- **Logo Integration**: Uses custom `LogoFull` component
- **Smooth Transitions**: `transition-colors` on nav links

#### Hero Section

- **Full Screen**: `min-h-screen`
- **3D Background**: `<HeroScene />` as absolute positioned background
- **Content Overlay**: z-index layering with gradient overlay
- **Text Effects**:
  - White text with `drop-shadow-2xl`
  - Blue accent text with glowing shadow effect
  - Large responsive text (5xl → 7xl)
- **Glass Buttons**: Semi-transparent with backdrop blur
- **Scroll Indicator**: Animated bounce effect

## Installation

```bash
# Install dependencies
npm install three @react-three/fiber @react-three/drei gsap --legacy-peer-deps
npm install -D tailwindcss postcss autoprefixer --legacy-peer-deps
```

## Usage

The 3D landing page is already integrated into the home page. To modify:

### Change Particle Count

```tsx
// In components/3d/Scene.tsx
<ParticleField count={5000} /> // Increase for more particles
```

### Adjust Dithering

```tsx
// In components/3d/DitheredBackground.tsx
uniforms: {
  uDitherSize: { value: 16.0 }, // Change from 8.0 to 16.0 for finer dithering
  uNoiseScale: { value: 3.0 },  // Increase for more noise
  uNoiseSpeed: { value: 0.5 },  // Increase for faster animation
}
```

### Customize Colors

```tsx
// In components/3d/DitheredBackground.tsx
uColor1: { value: new THREE.Color('#your-color-1') },
uColor2: { value: new THREE.Color('#your-color-2') },
uColor3: { value: new THREE.Color('#your-color-3') },
```

### Enable Orbit Controls (for debugging)

```tsx
<Scene enableControls={true} />
```

## Performance Considerations

### Optimizations

1. **Instanced Rendering**: Particles use buffer attributes for GPU-side processing
2. **Shader Efficiency**: Minimal texture lookups, optimized math operations
3. **Suspense Boundaries**: Components wrapped in Suspense for progressive loading
4. **LOD**: `dpr={[1, 2]}` adapts to device capabilities
5. **Power Preference**: `powerPreference: 'high-performance'`

### Performance Tips

- **Reduce Particle Count**: Lower count for mobile devices
- **Simplify Shaders**: Remove FBM octaves for lower-end devices
- **Disable Shadows**: Comment out shadow properties for better performance
- **Lower DPR**: Use `dpr={1}` for consistent performance

## Browser Compatibility

- **Chrome/Edge**: Full support ✅
- **Firefox**: Full support ✅
- **Safari**: Full support (with some shader quirks) ⚠️
- **Mobile**: Optimized for mobile (may need particle count reduction)

### WebGL Requirements

- WebGL 1.0 minimum
- WebGL 2.0 recommended for best performance
- GLSL ES 1.00 shaders (compatible with all WebGL versions)

## Debugging

### Enable Orbit Controls

```tsx
<Scene enableControls={true} />
```

This allows you to:
- Rotate: Left mouse drag
- Zoom: Mouse wheel
- Pan: Right mouse drag

### Performance Monitoring

Add React Three Fiber's Stats helper:

```tsx
import { Stats } from '@react-three/drei';

<Canvas>
  <Stats />
  {/* ... other components */}
</Canvas>
```

### Common Issues

**Issue**: White screen or no 3D content
- **Solution**: Check browser console for WebGL errors
- **Solution**: Verify GPU acceleration is enabled

**Issue**: Low frame rate
- **Solution**: Reduce particle count
- **Solution**: Disable shadows
- **Solution**: Lower dpr to 1

**Issue**: Shader compilation errors
- **Solution**: Check GLSL syntax (varies by browser)
- **Solution**: Ensure uniforms are properly declared

## Future Enhancements

- [ ] Add mouse-following parallax effect
- [ ] Implement touch gestures for mobile
- [ ] Add more processor chip models (Arduino, STM32, etc.)
- [ ] Create themed color variants (dark/light mode)
- [ ] Add performance-based quality scaling
- [ ] Implement post-processing effects (bloom, depth of field)
- [ ] Add interactive click handlers on 3D objects
- [ ] Create loading progress indicator

## Credits

- **Three.js**: https://threejs.org/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **Drei**: https://github.com/pmndrs/drei
- **GSAP**: https://greensock.com/gsap/

## License

Part of the Visucan platform.
