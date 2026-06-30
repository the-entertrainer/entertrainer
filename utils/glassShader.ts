import type { GlassParams } from '~/stores/glass'

// ── Fractal fluted-glass background — the site's signature backdrop ──────────
// A compact WebGL implementation of the same effect rendered by the Three.js
// Backdrop (experience/Backdrop.ts). Shared by the loader and the About page so
// every surface that needs the living gradient stays pixel-identical.
export const GLASS_VS =
  `attribute vec2 a;varying vec2 vUv;void main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}`

export const GLASS_FS = `
precision highp float;
uniform float uTime,uWarp,uWSpeed,uNSX,uNSY,uFlute,uRefr,uBright,uGrain,uSeed,uAlgo,uLight;
uniform vec2 uRes; uniform vec3 uC1,uC2,uC3,uC4,uC5,uBase; varying vec2 vUv;
vec3 permute(vec3 x){return mod((x*34.0+1.0)*x,289.0);}
float snoise(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
 vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
 vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);
 vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
 vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;
 vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
 m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
 vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}
float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float atanh_(float x){x=clamp(x,-0.9999,0.9999);return 0.5*log((1.0+x)/(1.0-x));}
vec2 rot(vec2 v,float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c)*v;}
vec2 warpVec(vec2 p){float t=uTime*uWSpeed;vec2 sc=vec2(uNSX,uNSY)*4.0;return vec2(snoise(p*sc+t*0.5),snoise(p*sc*0.93-t*0.3));}
vec4 field(vec2 uv){float t=uTime*1.2+3.5+uSeed;
 if(uAlgo<0.5){vec2 p1=vec2(-0.28+sin(t*0.7+0.5)*0.15,0.06+cos(t*0.5)*0.12),p2=vec2(-0.06+sin(t*0.4+1.2)*0.18,0.16+cos(t*0.6)*0.15),p3=vec2(0.07+sin(t*0.5+3.4)*0.2,0.0+cos(t*0.4)*0.14),p4=vec2(0.22+sin(t*0.3+2.3)*0.24,-0.1+cos(t*0.7)*0.14),p5=vec2(0.3+sin(t*0.6+1.1)*0.18,0.06+cos(t*0.4)*0.13);
  float g1=exp(-dot(uv-p1,uv-p1)*12.0)*1.4,g2=exp(-dot(uv-p2,uv-p2)*20.0)*2.0,g3=exp(-dot(uv-p3,uv-p3)*9.0)*1.6,g4=exp(-dot(uv-p4,uv-p4)*15.0)*1.3,g5=exp(-dot(uv-p5,uv-p5)*25.0)*0.8;
  return vec4(uC1*g1+uC2*g2+uC3*g3+uC4*g4+uC5*g5,g1+g2+g3+g4+g5);}
 vec2 p1=vec2(-0.32+sin(t*0.5+1.8)*0.2,-0.12+cos(t*0.8+0.3)*0.16),p2=vec2(0.1+sin(t*0.6+2.5)*0.14,0.24+cos(t*0.3+1.7)*0.18),p3=vec2(-0.15+sin(t*0.9+0.7)*0.22,-0.08+cos(t*0.5+2.9)*0.11),p4=vec2(0.28+sin(t*0.4+3.1)*0.17,0.18+cos(t*0.6+0.9)*0.2),p5=vec2(-0.05+sin(t*0.7+4.2)*0.13,-0.2+cos(t*0.9+1.5)*0.15);
 vec2 r1=rot(uv-p1,0.3),r2=rot(uv-p2,-1.1),r3=rot(uv-p3,0.8),r4=rot(uv-p4,-0.5),r5=rot(uv-p5,1.4);
 float g1=exp(-(r1.x*r1.x*8.0+r1.y*r1.y))*1.4,g2=exp(-(r2.x*r2.x*25.0+r2.y*r2.y*12.0))*2.0,g3=exp(-(r3.x*r3.x*6.0+r3.y*r3.y*14.0))*1.6,g4=exp(-(r4.x*r4.x*20.0+r4.y*r4.y*8.0))*1.3,g5=exp(-(r5.x*r5.x*30.0+r5.y*r5.y*15.0))*0.8;
 return vec4(uC1*g1+uC2*g2+uC3*g3+uC4*g4+uC5*g5,g1+g2+g3+g4+g5);}
void main(){vec2 ar=vec2(uRes.x/uRes.y,1.0);vec2 frag=vUv*uRes;vec2 mapped=frag-uRes*0.5;
 vec2 sc=mapped/uFlute;vec2 fr=vec2(fract(sc.x),sc.y);
 float fx=uRefr*(fr.x-0.5);float fy=-uRefr*atanh_(pow(fr.x,6.0));
 vec2 fuv=vec2(mapped.x+fx,mapped.y+fy)/uRes.y;
 vec2 warp=warpVec(vUv*ar)*uWarp;vec4 fld=field(fuv+warp);vec3 glow=fld.rgb;float tot=fld.a;
 vec3 col;if(uLight>0.5){col=uBase-(vec3(tot)-glow)*uBright;}else{col=uBase+glow;col=1.0-exp(-col*uBright);}
 float gr=hash21(vUv*uRes+fract(uTime*0.5)*100.0)*2.0-1.0;col+=gr*uGrain*max(col.r,max(col.g,col.b));
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);}`

// Live, frame-mutable params. Callers can ramp these (e.g. the loader's melt).
export interface GlassLive { warp: number; refr: number; bright: number }

export interface GlassRenderer {
  live: GlassLive
  stop: () => void
}

/**
 * Boots the fluted-glass shader on a fullscreen canvas. Reads its look from the
 * shared `GlassParams` so it matches the rest of the site. Returns the live
 * uniform bag (mutate to animate) and a stop() that cancels the loop + listener.
 */
export function startGlassRenderer(
  cv: HTMLCanvasElement,
  dark: boolean,
  gp: GlassParams,
  opts: { reducedMotion?: boolean } = {},
): GlassRenderer | null {
  const gl = cv.getContext('webgl', { antialias: true })
  if (!gl) return null

  const mk = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); return o }
  const pr = gl.createProgram()!
  gl.attachShader(pr, mk(gl.VERTEX_SHADER, GLASS_VS))
  gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, GLASS_FS))
  gl.linkProgram(pr); gl.useProgram(pr)

  const b = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, b)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const la = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0)

  const U = (n: string) => gl.getUniformLocation(pr, n)
  const live: GlassLive = { warp: gp.warp, refr: gp.fluteStrength, bright: dark ? 1.1 : 0.2 }

  gl.uniform1f(U('uWSpeed'), gp.warpSpeed)
  gl.uniform1f(U('uNSX'), gp.noiseScale1); gl.uniform1f(U('uNSY'), gp.noiseScale2)
  gl.uniform1f(U('uFlute'), 100); gl.uniform1f(U('uGrain'), gp.grain)
  gl.uniform1f(U('uSeed'), gp.seed); gl.uniform1f(U('uAlgo'), gp.algo); gl.uniform1f(U('uLight'), dark ? 0 : 1)
  gl.uniform3f(U('uBase'), ...(dark ? [0.005, 0.01, 0.055] : [0.98, 0.97, 0.96]) as [number, number, number])
  ;[U('uC1'), U('uC2'), U('uC3'), U('uC4'), U('uC5')].forEach((l, i) => gl.uniform3f(l, gp.colors[i][0], gp.colors[i][1], gp.colors[i][2]))

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    cv.width = Math.floor(window.innerWidth * dpr); cv.height = Math.floor(window.innerHeight * dpr)
    gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('uRes'), cv.width, cv.height)
  }
  window.addEventListener('resize', resize); resize()

  let rafId = 0, clock = 0, last = performance.now()
  const frame = (now: number) => {
    rafId = requestAnimationFrame(frame)
    if (!opts.reducedMotion) clock += Math.min((now - last) / 1000, 0.05)
    last = now
    gl.uniform1f(U('uTime'), clock)
    gl.uniform1f(U('uWarp'), live.warp); gl.uniform1f(U('uRefr'), live.refr); gl.uniform1f(U('uBright'), live.bright)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  rafId = requestAnimationFrame(frame)

  return { live, stop: () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize) } }
}
