// Particle System Shader for 3D Effect
export const particleVertexShader = `
uniform float uTime;
uniform float uSize;
attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // Animate particles
  modelPosition.x += sin(uTime + aRandomness.x) * 0.3;
  modelPosition.y += cos(uTime + aRandomness.y) * 0.3;
  modelPosition.z += sin(uTime + aRandomness.z) * 0.3;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  // Size attenuation
  gl_PointSize = uSize * aScale * (1.0 / -viewPosition.z);

  // Color based on position
  vColor = vec3(
    0.2 + position.y * 0.5,
    0.4 + position.x * 0.3,
    0.8 + position.z * 0.2
  );
}
`;

export const particleFragmentShader = `
varying vec3 vColor;

void main() {
  // Circular particles
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  float strength = 0.05 / distanceToCenter - 0.1;

  // Glow effect
  vec3 color = vColor * strength;

  gl_FragColor = vec4(color, strength * 0.8);
}
`;
