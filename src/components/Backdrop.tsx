"use client";

import { useEffect, useRef } from "react";
import * as twgl from "twgl.js";
import { CUT_EVENT, CYCLE, SHOTS, type SceneId } from "@/lib/scenes";
import { findPeaks, type Point } from "./backdrop/peaks";
import { FRAG, VERT } from "./backdrop/shader";
import { DEFOCUS, FLIP, FRAME, makeShot, pickCut, type Cut, type Shot } from "./backdrop/shots";

type Plate = { tex: WebGLTexture; aspect: number; peaks: Point[] };

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
      warp += ((finePointer && mouse.seen && !still ? 1 : 0) - warp) * (1 - Math.exp(-dt * 6));

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
