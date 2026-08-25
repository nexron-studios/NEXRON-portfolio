uniform vec2 uPointer;
uniform float uTime;
uniform float uPointerStrength;
uniform float uPixelRatio;

varying float vGlow;

void main() {
  vec3 displaced = position;

  // Slow vertical breathing so the field is never completely static.
  displaced.z += sin(position.x * 1.4 + uTime * 0.7) * 0.12
               + cos(position.y * 1.1 - uTime * 0.5) * 0.12;

  // Push away from the cursor. Done here rather than on the CPU so the
  // particle count costs nothing on the main thread.
  vec2 toPointer = displaced.xy - uPointer;
  float distance = length(toPointer);
  float influence = smoothstep(1.6, 0.0, distance) * uPointerStrength;
  displaced.xy += normalize(toPointer + 1e-5) * influence * 0.55;

  vGlow = influence;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Size attenuates with depth, like any real point sprite should.
  gl_PointSize = (1.6 + influence * 5.0) * uPixelRatio * (7.0 / -mvPosition.z);
}
