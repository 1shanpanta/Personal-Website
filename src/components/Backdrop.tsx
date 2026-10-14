"use client";

import { useEffect, useRef } from "react";
import * as twgl from "twgl.js";
import { CUT_EVENT, CYCLE, SHOTS, type SceneId } from "@/lib/scenes";

const VERT = `#version 300 es
in vec2 position;out vec2 v;
void main(){v=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v;out vec4 o;
uniform sampler2D u_a,u_b,u_pa,u_pb;
// Red bloom per shot: xy centre, z radius, w strength.
uniform vec4 u_redA,u_redB;
uniform vec2 u_res,u_mouse,u_aspA,u_aspB;
uniform vec3 u_colA,u_colB;
// Per shot: x haze, y zoom, z melt, w ghost strength.
uniform vec4 u_shotA,u_shotB,u_moveA,u_moveB;
// Burn: xy centre, z radius, w strength. Wash: white haze per shot (A, B).
uniform vec4 u_burn;
uniform vec2 u_wash;
uniform float u_time,u_shade,u_mix,u_add,u_flip,u_tint,u_blur,u_warp;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}
float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
// Crush the mids so fog reads as black ground and the subject glows.
float grade(float g,float neg){return pow(smoothstep(.06,1.,mix(g,1.-g,neg)),1.35);}

vec2 frame(vec2 uv,float ia,float zoom,vec2 pan){
  vec2 p=uv-.5;float va=u_res.x/u_res.y;
  if(va>ia)p.y*=ia/va;else p.x*=va/ia;
  return p/zoom+pan+.5;
}

// mv: xy pan (drift and jitter), z exposure, w focus pull, all per shot.
// neg runs the plate as its negative: the reel's polarity cut.
vec3 plate(sampler2D t,sampler2D p,vec2 uv,vec2 asp,vec4 shot,vec4 mv,vec4 red,vec3 tint,float blur,float neg,float wash){
  // The plate morphs: noise displacement fast enough that shapes visibly
  // flow and reshape inside a one-second shot, as on the reel.
  vec2 w=(vec2(fbm(uv*2.4+vec2(0.,u_time*.32)),fbm(uv*2.4+vec2(5.2,1.3-u_time*.27)))-.5)*shot.z;
  vec2 c=frame(uv+w,asp.x,shot.y,mv.xy);
  blur=max(blur,mv.w);
  vec2 d=(uv-.5)*(.0035+.009*length(v-.5));
  // Monochrome, but each channel reads a shifted sample: colour survives only
  // as the thin prism fringe on edges.
  vec3 col=vec3(lum(texture(t,c+d).rgb),lum(texture(t,c).rgb),lum(texture(t,c-d).rgb));
  // Mip levels are free blurs: a mid one for diffusion, a deep one for glow.
  float mid=lum(texture(t,c,3.5).rgb),soft=lum(texture(t,c,6.5).rgb);
  // Diffusion varies by shot, as the reel's sharpness does: near crisp on
  // some, fine detail melted into the tone around it on others. The frame
  // edge falls out of focus in step.
  col=mix(col,vec3(mid),shot.x);
  col=mix(col,vec3(soft),max(blur,smoothstep(.22,.7,length((v-.5)*vec2(1.,.8)))*(.25+shot.x)));
  col=vec3(grade(col.r,neg),grade(col.g,neg),grade(col.b,neg));
  // Highlights become wide light sources (screen blend of the deep blur).
  float glow=grade(soft,neg);
  col=1.-(1.-col)*(1.-vec3(glow*glow*.65));
  // Blown-out haze, as on the reel's white shots. It stops above the type.
  col=mix(col,vec3(1.),wash*smoothstep(.15,.7,soft)*smoothstep(u_shade-.1,u_shade+.2,v.y));
  // A second plate ghosts through, drifting against the first (lighten blend).
  if(shot.w>0.)col=max(col,vec3(grade(lum(texture(p,frame(uv*.94+.03-w*2.,asp.y,shot.y*1.1,-mv.xy)).rgb),0.)*shot.w));
  col*=tint*mv.z;
  // A crimson cloud on about a quarter of shots, as on the reel: one soft
  // blob with a ragged edge that grows while the shot holds. It keeps the
  // plate's brightness, so detail shows through the red.
  if(red.w>0.){
    vec2 q=(v-red.xy)*vec2(u_res.x/u_res.y,1.);
    float d=length(q)*(1.+(fbm(q/red.z*1.2+w*8.)-.5)*.7);
    col=mix(col,vec3(.74,.01,.04)*(.45+.55*lum(col)),(1.-smoothstep(red.z*.35,red.z*1.15,d))*red.w);
  }
  return col;
}

void main(){
  // The cursor bends the plates around it: a bounded swirl and swell, no hole.
  vec2 asp=vec2(u_res.x/u_res.y,1.);
  vec2 mp=(v-u_mouse)*asp;
  float wr=.15*min(asp.x,1.),f=exp(-dot(mp,mp)/(wr*wr))*u_warp,s=sin(f*.9),k=cos(f*.9);
  vec2 uv=u_mouse+mat2(k,-s,s,k)*mp*(1.-.35*f)/asp;

  vec3 a=plate(u_a,u_pa,uv,u_aspA,u_shotA,u_moveA,u_redA,u_colA,u_blur,0.,u_wash.x);
  vec3 b=plate(u_b,u_pb,uv,u_aspB,u_shotB,u_moveB,u_redB,u_colB,0.,u_flip,u_wash.y);
  vec3 c=mix(a,b,u_mix);
  c=mix(c,1.-(1.-a)*(1.-b),u_add);
  c*=mix(vec3(1.),vec3(1.,.5,.42),u_tint);

  // The reel's burn: a ragged dark smudge with a glowing rim, placed per shot.
  if(u_burn.w>0.){
    vec2 bp=(v-u_burn.xy)*asp;
    float r=u_burn.z,bd=length(bp)*(1.+(fbm(bp/r*.8+u_time*.25)-.5)*.9);
    c=1.-(1.-c)*(1.-exp(-pow((bd-r*1.2)/(r*.9),2.))*.5*u_burn.w);
    c=mix(c,vec3(.1,.075,.065),(1.-smoothstep(r*.15,r*1.25,bd))*.88*u_burn.w);
  }

  c+=smoothstep(.5,.95,fbm(v*vec2(2.2,3.)+u_time*vec2(.025,.012)))*.05*(.3+c);
  float m=length(mp);
  c+=vec3(.95,.93,.9)*exp(-m*m*9.)*.05;
  vec2 q=v-.5;
  c*=1.-dot(q,q)*1.5;
  // Below u_shade the frame sinks toward black, so the type always stands on dark.
  c*=mix(.22,1.,smoothstep(.04,u_shade,v.y));
  c+=(hash(v*u_res+fract(u_time)*91.)-.5)*.025;
  o=vec4(c,1.);
}`;

type Point = { x: number; y: number };
type Plate = { tex: WebGLTexture; aspect: number; peaks: Point[] };

/** Bright points that stand out from their 7x7 neighbourhood, strongest first, in 0..1 image space. */
function findPeaks(img: HTMLImageElement): Point[] {
  const W = 64;
  const H = Math.round((W * img.naturalHeight) / img.naturalWidth);
  const g = Object.assign(document.createElement("canvas"), { width: W, height: H }).getContext("2d", {
    willReadFrequently: true,
  });
  if (!g) return [];
  g.drawImage(img, 0, 0, W, H);
  const px = g.getImageData(0, 0, W, H).data;
  const at = (x: number, y: number) => {
    const i = (Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * 4;
    return (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) / 255;
  };
  const found: (Point & { s: number })[] = [];
  for (let y = 2; y < H - 2; y++)
    for (let x = 2; x < W - 2; x++) {
      const l = at(x, y);
      let sum = 0;
      let peak = true;
      for (let dy = -3; dy <= 3; dy++)
        for (let dx = -3; dx <= 3; dx++) {
          const n = at(x + dx, y + dy);
          sum += n;
          if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && n > l) peak = false;
        }
      if (peak) found.push({ x: (x + 0.5) / W, y: (y + 0.5) / H, s: l - sum / 49 + l * 0.15 });
    }
  const kept: Point[] = [];
  for (const p of found.sort((m, n) => n.s - m.s))
    if (kept.length < 24 && kept.every((k) => Math.hypot(k.x - p.x, ((k.y - p.y) * H) / W) > 0.07)) kept.push(p);
  return kept;
}

/**
 * The ways the reel moves between shots, measured frame by frame. Most cuts
 * settle: the difference to the new shot halves each frame for about four. A
 * flip opens the shot as its own negative for a beat, then turns positive
 * through one tinted frame, as the red rose turns white at 4.9 s.
 */
type Cut = "hard" | "settle" | "double" | "flip" | "defocus";
const pickCut = (len: number): Cut => {
  const r = Math.random();
  if (r < 0.25) return "hard";
  if (r < 0.7) return "settle";
  if (r < 0.85) return "double";
  return r < 0.95 || len < 0.8 ? "flip" : "defocus";
};

/**
 * One shot's look and camera, each drawn from the ranges measured on the reel:
 * zoom -2.5 to +3.5 %/s (a quarter pull out), drift a few % of the frame per
 * second, jitter near zero on most shots and visible on a third, exposure that
 * ramps while the shot holds, a rack focus on about half, and haze that runs
 * from near crisp to heavily diffused.
 */
type Shot = {
  scene: SceneId;
  partner: SceneId;
  start: number;
  len: number;
  haze: number;
  melt: number;
  ghost: number;
  tint: number[];
  zoomRate: number;
  drift: [number, number];
  jitter: number;
  exposure: number;
  focus: [number, number];
  bloom: number;
  bloomAt: [number, number];
  wash: number;
  burn: [number, number, number] | null;
};
const TINTS = [[1, 1, 1], [1, 1, 1], [1, 1, 1], [0.86, 0.97, 1], [1.06, 0.96, 0.82]];
const FOCUS: [number, number][] = [[0.6, 0], [0.6, 0], [0, 0.5], [0, 0], [0, 0], [0, 0]];
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const makeShot = (scene: SceneId, start: number, len: number): Shot => {
  const angle = rand(0, Math.PI * 2);
  const speed = Math.random() ** 2 * 0.035;
  return {
    scene,
    partner: pick(CYCLE.filter((s) => s !== scene)),
    start,
    len,
    haze: Math.random() < 0.65 ? rand(0, 0.08) : rand(0.25, 0.45),
    melt: rand(0.012, 0.035),
    ghost: Math.random() < 0.5 ? rand(0.3, 0.6) : 0,
    tint: pick(TINTS),
    zoomRate: Math.random() < 0.25 ? rand(-0.025, -0.005) : rand(0.003, 0.035),
    drift: [Math.cos(angle) * speed, Math.sin(angle) * speed],
    jitter: Math.random() < 0.7 ? 0.0001 : rand(0.0005, 0.0015),
    exposure: rand(0.8, 1.3),
    focus: pick(FOCUS),
    bloom: Math.random() < 0.25 ? rand(0.85, 1) : 0,
    bloomAt: [rand(0.35, 0.65), rand(0.62, 0.82)],
    wash: Math.random() < 0.45 ? rand(0.4, 0.85) : 0,
    burn: Math.random() < 0.3 ? [rand(0.25, 0.75), rand(0.66, 0.9), rand(0.06, 0.12)] : null,
  };
};

const FRAME = 1 / 60;
const DEFOCUS = 0.35;
const FLIP = 0.5;

/**
 * The fixed world behind the page: a shader over the generated plates that
 * cuts like the reference reel, and a HUD that tracks each plate's bright points.
 */
export default function Backdrop() {
  const glRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = glRef.current;
    const hud = hudRef.current;
    const gl = canvas?.getContext("webgl2", { antialias: false });
    const ctx = hud?.getContext("2d");
    if (!canvas || !hud || !gl || !ctx) return;
    const program = twgl.createProgramInfo(gl, [VERT, FRAG]);
    if (!program) return;
    const quad = twgl.primitives.createXYQuadBufferInfo(gl);

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = matchMedia("(pointer: fine)").matches;
    // The canvas cannot read a CSS variable, so it takes the page's resolved typeface.
    const face = getComputedStyle(document.body).fontFamily;
    const suffix = innerWidth < innerHeight ? "-p" : "";

    const plates = new Map<SceneId, Plate | null>();
    const load = (id: SceneId) => {
      if (plates.has(id)) return;
      plates.set(id, null);
      const tex = twgl.createTexture(
        gl,
        { src: `/scenes/${id}${suffix}.webp`, flipY: 1, wrap: gl.CLAMP_TO_EDGE, min: gl.LINEAR_MIPMAP_LINEAR },
        // A failed plate stays null: the cycle holds on the shot before it rather
        // than re-requesting the file every frame.
        (err, _t, src) => {
          const img = src as HTMLImageElement;
          if (!err) plates.set(id, { tex, aspect: img.naturalWidth / img.naturalHeight, peaks: findPeaks(img) });
        },
      );
    };
    const ready = (id: SceneId) => plates.get(id) ?? null;

    // The first shot runs 2.4 s longer, to cover the boot screen.
    let cur = makeShot(CYCLE[0], 0, 2.4 + SHOTS[0]);
    // Set only while a cut is still playing out.
    let prev: Shot | null = null;
    let cut: Cut = "hard";
    let shot = 0;
    let cutAt = cur.len;
    let nextCut = pickCut(SHOTS[0]);
    load(cur.scene);
    const warm = setTimeout(() => CYCLE.forEach(load), 1200);

    const mouse = { x: innerWidth / 2, y: innerHeight / 2, seen: false };
    const smooth = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => Object.assign(mouse, { x: e.clientX, y: e.clientY, seen: e.pointerType === "mouse" });
    addEventListener("pointermove", onMove, { passive: true });
    const onLeave = () => (mouse.seen = false);
    document.documentElement.addEventListener("mouseleave", onLeave);


    const pts: Point[] = [];
    let warp = 0;
    let raf = 0;
    const t0 = performance.now();
    let last = t0;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;

      // Cut on the reel's shot lengths. A plate still loading holds the shot longer.
      const upcoming = CYCLE[(CYCLE.indexOf(cur.scene) + 1) % CYCLE.length];
      load(upcoming);
      if (!still && t >= cutAt && ready(upcoming)) {
        prev = cur;
        shot = (shot + 1) % SHOTS.length;
        cur = makeShot(upcoming, t, SHOTS[shot]);
        cut = nextCut;
        cutAt = t + cur.len;
        dispatchEvent(new Event(CUT_EVENT));
        nextCut = pickCut(SHOTS[shot]);
      }
      // Hard swaps at once; settle eases the new shot in, halving the gap each
      // frame; double screens both plates for two frames; flip holds the new
      // shot negative for FLIP seconds; defocus blurs the old shot out.
      const tau = t - cur.start;
      if (prev && tau >= 5 * FRAME) prev = null;
      const shotA = prev ?? cur;

      const b = ready(cur.scene);
      if (!b) return;
      const a = (prev && ready(prev.scene)) || b;
      // A ghost plate still loading simply sits the shot out.
      const pa = ready(shotA.partner);
      const pb = ready(cur.partner);

      const W = innerWidth;
      const H = innerHeight;
      twgl.resizeCanvasToDisplaySize(canvas, Math.min(devicePixelRatio, 1.6));
      if (twgl.resizeCanvasToDisplaySize(hud, Math.min(devicePixelRatio, 2)))
        ctx.setTransform(hud.width / W, 0, 0, hud.height / H, 0, 0);
      gl.viewport(0, 0, canvas.width, canvas.height);

      const k = 1 - Math.exp(-dt * 2.5);
      smooth.x += (mouse.x / W - smooth.x) * k;
      smooth.y += (mouse.y / H - smooth.y) * k;
      const drift = still ? 0 : 1;
      // Each shot's camera: zoom from 1.07 so a pull-out never shows an edge
      // (plus the melt's reach, which can pull the plate's edge inward), its
      // own drift and jitter, an exposure ramp and a focus pull.
      const age = (s: Shot) => (t - s.start) * drift;
      const progress = (s: Shot) => Math.min(1, age(s) / s.len);
      const zoom = (s: Shot) => 1.07 + s.melt + s.zoomRate * age(s);
      const move = (s: Shot) => {
        const p = progress(s);
        const shake = () => (Math.random() - 0.5) * s.jitter * drift;
        return [
          (smooth.x - 0.5) * 0.014 + s.drift[0] * age(s) + shake(),
          -(smooth.y - 0.5) * 0.014 + s.drift[1] * age(s) + shake(),
          1 + (s.exposure - 1) * p,
          s.focus[0] + (s.focus[1] - s.focus[0]) * p,
        ];
      };
      // Melt grows over the shot, so each shot visibly evolves while it holds.
      const look = (s: Shot, ghost: Plate | null) => [
        s.haze,
        zoom(s),
        s.melt * drift * (0.4 + 0.6 * progress(s)),
        ghost ? s.ghost : 0,
      ];
      const camB = move(cur);
      // The red cloud spreads and deepens as the shot holds.
      const bloom = (s: Shot) => {
        const p = progress(s);
        return [s.bloomAt[0], s.bloomAt[1], 0.12 + 0.18 * p, s.bloom * (0.3 + 0.7 * p)];
      };
      // Phone: the type climbs high, so the shade reaches up and the burn shrinks.
      const wide = W >= H;
      const burn = cur.burn;
      const ease = 1 - Math.exp(-dt * 6);
      warp += ((finePointer && mouse.seen && !still ? 1 : 0) - warp) * ease;

      gl.useProgram(program.program);
      twgl.setBuffersAndAttributes(gl, program, quad);
      twgl.setUniforms(program, {
        u_a: a.tex,
        u_b: b.tex,
        u_pa: (pa ?? a).tex,
        u_pb: (pb ?? b).tex,
        u_res: [W, H],
        u_moveA: prev ? move(prev) : camB,
        u_moveB: camB,
        u_mouse: [smooth.x, 1 - smooth.y],
        u_aspA: [a.aspect, (pa ?? a).aspect],
        u_aspB: [b.aspect, (pb ?? b).aspect],
        u_burn: burn
          ? [burn[0], burn[1], burn[2] * (wide ? 1 : 0.7) * (0.85 + 0.3 * progress(cur)), 1]
          : [0, 0, 0, 0],
        u_wash: [shotA.wash, cur.wash],
        u_warp: warp,
        u_shade: wide ? 0.6 : 0.86,
        u_colA: shotA.tint,
        u_colB: cur.tint,
        u_redA: bloom(shotA),
        u_redB: bloom(cur),
        u_shotA: look(shotA, pa),
        u_shotB: look(cur, pb),
        u_mix: !prev ? 0 : cut === "settle" ? 1 - 0.5 ** (tau / FRAME + 1) : 1,
        u_add: prev && cut === "double" && tau < 2 * FRAME ? 1 : 0,
        u_flip: cut === "flip" && tau < FLIP ? 1 : 0,
        u_tint: cut === "flip" && tau >= FLIP && tau < FLIP + FRAME ? 1 : 0,
        u_blur: !prev && nextCut === "defocus" ? Math.max(0, 1 - (cutAt - t) / DEFOCUS) : 0,
        u_time: t,
      });
      twgl.drawBufferInfo(gl, quad);

      drawHud(b, zoom(cur), camB[0], camB[1], W, H, t);
    };

    // The HUD inverts frame() in the shader, so its labels stay pinned to the plate.
    const drawHud = (p: Plate, zoom: number, panX: number, panY: number, W: number, H: number, t: number) => {
      const va = W / H;
      const targets = p.peaks
        .map(({ x, y }) => {
          let px = (x - 0.5 - panX) * zoom;
          let py = (0.5 - y - panY) * zoom;
          if (va > p.aspect) py /= p.aspect / va;
          else px /= va / p.aspect;
          return { x: (px + 0.5) * W, y: (0.5 - py) * H };
        })
        .filter(({ x, y }) => x > 28 && x < W - 110 && y > 70 && y < H - 28)
        .slice(0, W < 700 ? 5 : 9);
      // Fast enough that the labels jump with each cut, as the reel's tracker does.
      targets.forEach((q, i) => {
        const pt = (pts[i] ??= { ...q });
        pt.x += (q.x - pt.x) * 0.25;
        pt.y += (q.y - pt.y) * 0.25;
      });
      pts.length = targets.length;

      ctx.clearRect(0, 0, W, H);
      // Labels without markers, small and dim; every other point carries a
      // second reading just below it, as the reel's tracker doubles up.
      ctx.fillStyle = "rgba(222,216,198,0.62)";
      ctx.font = `9px ${face}`;
      const label = (x: number, y: number, at: Point) =>
        ctx.fillText(`${x.toFixed(2)} / ${y.toFixed(2)}`, at.x, at.y);
      pts.forEach((q, i) => {
        const jx = q.x + Math.sin(t * 0.9 + i) * 0.35;
        const jy = q.y + Math.cos(t * 0.7 + i * 2) * 0.35;
        label(jx, jy, { x: q.x + 4, y: q.y - 3 });
        if (i % 2) label(jx - 5.2, jy - 12.9, { x: q.x - 2, y: q.y + 8 });
      });
      // The cursor gets its own box, reading and wires to the three nearest points.
      if (finePointer && mouse.seen) {
        ctx.lineWidth = 0.75;
        ctx.strokeStyle = "rgba(255,255,255,0.32)";
        ctx.beginPath();
        [...pts]
          .sort((m, n) => Math.hypot(m.x - mouse.x, m.y - mouse.y) - Math.hypot(n.x - mouse.x, n.y - mouse.y))
          .slice(0, 3)
          .forEach((q) => {
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(q.x, q.y);
          });
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.strokeRect(mouse.x - 11, mouse.y - 11, 22, 22);
        ctx.fillStyle = "rgba(255,255,255,0.74)";
        ctx.font = `10px ${face}`;
        ctx.fillText(`${mouse.x.toFixed(2)} / ${mouse.y.toFixed(2)}`, mouse.x + 16, mouse.y + 24);
      }
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(warm);
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Two fixed layers: the HUD sits above the page and blends against it, which
  // a shared fixed parent would prevent.
  return (
    <>
      <canvas ref={glRef} aria-hidden className="pointer-events-none fixed inset-0 h-full w-full" />
      <canvas ref={hudRef} aria-hidden className="pointer-events-none fixed inset-0 z-40 h-full w-full mix-blend-difference" />
    </>
  );
}
