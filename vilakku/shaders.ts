export const COMPOSITE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const COMPOSITE_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform float uTime;
  uniform float uFlash;
  uniform float uGrain;
  uniform float uTrack;
  uniform float uShake;
  uniform float uThreshold;
  uniform float uInk;
  uniform float uFear;
  uniform float uPlayable;
  uniform vec2 uRes;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float lumaOf(vec3 c) {
    return dot(c, vec3(0.29, 0.58, 0.13));
  }

  void main() {
    vec2 uv = vUv;
    float tear = sin(uv.y * 18.0 + uTime * 7.0) * uTrack * 0.014;
    uv.x += tear + uShake * (hash(vec2(uTime, uv.y)) - 0.5) * 0.05;
    uv.y += uShake * 0.012 * sin(uTime * 55.0);
    uv = clamp(uv, 0.0, 1.0);

    vec3 col = texture2D(tDiffuse, uv).rgb;
    float luma = lumaOf(col);
    luma = pow(clamp(luma, 0.0, 1.0), 0.62);
    luma += 0.07 * uPlayable;
    luma += uFlash * 0.62;

    vec2 px = 1.0 / uRes;
    float n = lumaOf(texture2D(tDiffuse, uv + vec2(0.0, px.y)).rgb);
    float s = lumaOf(texture2D(tDiffuse, uv - vec2(0.0, px.y)).rgb);
    float e = lumaOf(texture2D(tDiffuse, uv + vec2(px.x, 0.0)).rgb);
    float w = lumaOf(texture2D(tDiffuse, uv - vec2(px.x, 0.0)).rgb);
    float edge = abs(n - s) + abs(e - w);

    float ink = step(uThreshold, luma);
    float mid = step(uThreshold * 0.48, luma) * (1.0 - ink);

    float hatchA = abs(sin((uv.x + uv.y) * uRes.y * 0.42));
    float hatchB = abs(sin((uv.x - uv.y) * uRes.y * 0.28 + 0.7));
    float hatch = mix(hatchB, hatchA, step(0.5, fract(uv.y * 90.0)));
    float hatched = mid * mix(0.16, 0.42, step(0.55, hatch));

    float line = step(0.10, edge) * uInk;
    float paper = ink * 0.94 + hatched + line;

    float scan = 0.86 + 0.14 * step(0.5, fract(uv.y * uRes.y * 0.5 + uTime * 9.0));
    float grain = (hash(uv * uRes + uTime * 14.0) - 0.5) * uGrain;
    float vig = smoothstep(1.22, 0.22, length((uv - 0.5) * vec2(1.18, 1.42)));
    vig *= 1.0 - uFear * 0.22 * (0.5 + 0.5 * sin(uTime * (2.4 + uFear * 6.0)));

    float drop = step(0.985, hash(vec2(floor(uTime * 1.6), 3.1))) * uTrack;
    float outc = clamp(paper * scan * vig + grain, 0.0, 1.0);
    outc = mix(outc, 0.02, drop * 0.85);
    outc = mix(outc, 1.0, uFlash * 0.88);

    gl_FragColor = vec4(vec3(outc), 1.0);
  }
`;
