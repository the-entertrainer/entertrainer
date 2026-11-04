/**
 * GLSL for the Satya Space spike. Classic three.js ShaderMaterial syntax
 * (gl_FragColor / varying). three r163 compiles this on WebGL2.
 *
 * Beacon colors are authored in linear space because the renderer’s output
 * is sRGB. Hull materials use THREE.Color, which converts the hex itself.
 */

export const beaconVert = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vView;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 mv = viewMatrix * world;
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`

export function beaconFrag(octaves: number): string {
  const noise = octaves > 0
    ? /* glsl */ `
float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.11, 0.23, 0.37));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float f = 0.0;
  float a = 0.5;
  for (int i = 0; i < ${octaves}; i++) {
    f += a * noise(p);
    p = p * 2.03 + 13.1;
    a *= 0.5;
  }
  return f;
}
`
    : ''

  const detail = octaves > 0
    ? 'fbm(vWorld * 0.9 + vec3(0.0, uTime * 0.12, 0.0))'
    : '0.55'

  return /* glsl */ `
uniform float uTime;
uniform float uBreath;
uniform vec3 uColor;
uniform vec3 uFogColor;
uniform float uFogDensity;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vView;

${noise}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vView);
  float fres = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.15);
  float detail = ${detail};
  vec3 col = uColor * (1.15 + fres * 1.65) * (0.72 + detail * 0.55);
  col *= uBreath;
  float dist = length(vView);
  float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
  col = mix(col, uFogColor, clamp(fog, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`
}

export const starVert = /* glsl */ `
attribute float aSize;
varying float vAlpha;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (220.0 / max(1.0, -mv.z));
  gl_Position = projectionMatrix * mv;
  vAlpha = 0.28 + 0.72 * fract(aSize * 0.37);
}
`

export const starFrag = /* glsl */ `
varying float vAlpha;
uniform vec3 uColor;

void main() {
  vec2 q = gl_PointCoord - 0.5;
  float d = dot(q, q);
  if (d > 0.25) discard;
  float a = smoothstep(0.25, 0.02, d) * vAlpha;
  gl_FragColor = vec4(uColor, a);
  #include <colorspace_fragment>
}
`

export const quadVert = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const brightFrag = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uThreshold;
varying vec2 vUv;

void main() {
  vec3 col = texture2D(tDiffuse, vUv).rgb;
  float luma = max(col.r, max(col.g, col.b));
  float keep = smoothstep(uThreshold, uThreshold + 0.22, luma);
  gl_FragColor = vec4(col * keep, 1.0);
  #include <colorspace_fragment>
}
`

export const blurFrag = /* glsl */ `
uniform sampler2D tDiffuse;
uniform vec2 uDir;
varying vec2 vUv;

void main() {
  vec3 sum = texture2D(tDiffuse, vUv).rgb * 0.227027;
  sum += texture2D(tDiffuse, vUv + uDir * 1.384615).rgb * 0.316216;
  sum += texture2D(tDiffuse, vUv - uDir * 1.384615).rgb * 0.316216;
  sum += texture2D(tDiffuse, vUv + uDir * 3.230769).rgb * 0.070270;
  sum += texture2D(tDiffuse, vUv - uDir * 3.230769).rgb * 0.070270;
  gl_FragColor = vec4(sum, 1.0);
  #include <colorspace_fragment>
}
`

/**
 * Tier 3 grade. Chromatic aberration stays at or under 0.002 UV units and
 * is driven from the travel tween, so it is zero while the camera is still.
 * Grain is about 4.5% (spec asks for 3–6%).
 */
export const compositeFrag = /* glsl */ `
uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform vec2 uResolution;
uniform float uGrain;
uniform float uCa;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 dir = vUv - 0.5;
  float dist = length(dir);
  vec2 off = normalize(dir + vec2(0.0001)) * uCa * dist;
  float r = texture2D(tScene, vUv + off).r;
  float g = texture2D(tScene, vUv).g;
  float b = texture2D(tScene, vUv - off).b;
  vec3 col = vec3(r, g, b);
  col += texture2D(tBloom, vUv).rgb * 0.65;
  float vig = smoothstep(0.92, 0.28, dist);
  col *= mix(0.62, 1.0, vig);
  float grain = fract(sin(dot(gl_FragCoord.xy + uTime, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * uGrain;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
  #include <colorspace_fragment>
}
`
