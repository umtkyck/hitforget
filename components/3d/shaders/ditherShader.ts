// Dithering Fragment Shader with Blue Theme
export const ditherFragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uDitherScale;
uniform float uNoiseIntensity;

varying vec2 vUv;

// Bayer matrix for dithering
float bayer2(vec2 a) {
  a = floor(a);
  return fract(dot(a, vec2(0.5, a.y * 0.75)));
}

float bayer4(vec2 a)   { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a)   { return bayer2(0.25 * a) * 0.0625 + bayer4(a); }
float bayer16(vec2 a)  { return bayer2(0.125 * a) * 0.015625 + bayer8(a); }
float bayer32(vec2 a)  { return bayer2(0.0625 * a) * 0.00390625 + bayer16(a); }

// Noise function
float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Smooth noise
float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = noise(i);
  float b = noise(i + vec2(1.0, 0.0));
  float c = noise(i + vec2(0.0, 1.0));
  float d = noise(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// FBM (Fractal Brownian Motion)
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 2.0;

  for(int i = 0; i < 5; i++) {
    value += amplitude * smoothNoise(p * frequency + uTime * 0.1);
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value;
}

void main() {
  vec2 uv = vUv;
  vec2 pixelated = floor(uv * uDitherScale) / uDitherScale;

  // Animated gradient
  float gradient = pixelated.y;
  gradient += fbm(pixelated * 2.0 + uTime * 0.05) * uNoiseIntensity;
  gradient += sin(pixelated.x * 10.0 + uTime) * 0.05;

  // Color mixing
  vec3 color = mix(uColor1, uColor2, gradient);

  // Apply dithering
  float ditherValue = bayer16(gl_FragCoord.xy);
  float ditheredGradient = step(ditherValue, gradient);

  // Mix dithered and smooth
  vec3 finalColor = mix(
    color,
    mix(uColor1, uColor2, ditheredGradient),
    0.6
  );

  // Add subtle glow
  float glow = smoothstep(0.4, 0.6, gradient);
  finalColor += vec3(0.1, 0.2, 0.4) * glow * 0.3;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export const ditherVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
