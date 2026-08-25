uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uColor;

varying vec2 vUv;

/** Cheap value-noise hash. Deterministic, no texture lookup. */
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

/** Distance to the nearest line of a grid of the given cell size. */
float gridLine(vec2 uv, float cells, float thickness) {
  vec2 grid = abs(fract(uv * cells - 0.5) - 0.5) / fwidth(uv * cells);
  float line = min(grid.x, grid.y);
  return 1.0 - smoothstep(0.0, thickness, line);
}

void main() {
  vec2 uv = vUv;

  // A slow wave decides, per region, whether the grid is currently being
  // assembled out of noise or dissolving back into it.
  float wave = sin(uv.x * 2.4 + uTime * 0.45) * 0.5 + 0.5;
  float coherence = smoothstep(0.15, 0.85, wave);

  float grain = noise(uv * 26.0 + uTime * 0.35);
  float fine = gridLine(uv, 34.0, 1.2);
  float coarse = gridLine(uv, 8.5, 1.6);

  // Noise erodes the fine grid first, the coarse structure survives longer.
  float structure = fine * coherence * step(0.42, grain) + coarse * mix(0.25, 0.9, coherence);

  // Cursor restores coherence locally — the grid snaps back where you point.
  float focus = smoothstep(0.42, 0.0, distance(uv, uPointer));
  structure = mix(structure, max(structure, fine * 0.85 + coarse), focus);

  float vignette = smoothstep(1.15, 0.25, length(uv - 0.5) * 1.6);

  gl_FragColor = vec4(uColor, structure * vignette * 0.55);
}
