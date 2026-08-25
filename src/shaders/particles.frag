uniform vec3 uColorIdle;
uniform vec3 uColorActive;

varying float vGlow;

void main() {
  // Round the square point sprite off and fade its edge.
  float distance = length(gl_PointCoord - vec2(0.5));
  if (distance > 0.5) discard;

  float alpha = smoothstep(0.5, 0.15, distance);
  vec3 color = mix(uColorIdle, uColorActive, clamp(vGlow * 1.6, 0.0, 1.0));

  gl_FragColor = vec4(color, alpha * (0.35 + vGlow * 0.65));
}
