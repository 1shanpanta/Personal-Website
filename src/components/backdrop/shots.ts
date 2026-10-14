import { CYCLE, type SceneId } from "@/lib/scenes";

export const FRAME = 1 / 60;
export const DEFOCUS = 0.35;
export const FLIP = 0.5;

/**
 * The ways the reel moves between shots, measured frame by frame. Most cuts
 * settle: the difference to the new shot halves each frame for about four. A
 * flip opens the shot as its own negative for a beat, then turns positive.
 */
export type Cut = "hard" | "settle" | "double" | "flip" | "defocus";
export const pickCut = (len: number): Cut => {
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
 * from crisp to diffused.
 */
export type Shot = {
  scene: SceneId;
  partner: SceneId;
  start: number;
  len: number;
  haze: number;
  melt: number;
  ghost: number;
  zoomRate: number;
  drift: [number, number];
  jitter: number;
  exposure: number;
  focus: [number, number];
  wash: number;
  burn: [number, number, number] | null;
};

const FOCUS: [number, number][] = [[0.6, 0], [0.6, 0], [0, 0.5], [0, 0], [0, 0], [0, 0]];
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export const makeShot = (scene: SceneId, start: number, len: number): Shot => {
  const angle = rand(0, Math.PI * 2);
  const speed = Math.random() ** 2 * 0.035;
  return {
    scene,
    partner: pick(CYCLE.filter((s) => s !== scene)),
    start,
    len,
    haze: Math.random() < 0.65 ? rand(0, 0.08) : rand(0.25, 0.45),
    melt: rand(0.012, 0.035),
    ghost: Math.random() < 0.3 ? rand(0.2, 0.4) : 0,
    zoomRate: Math.random() < 0.25 ? rand(-0.025, -0.005) : rand(0.003, 0.035),
    drift: [Math.cos(angle) * speed, Math.sin(angle) * speed],
    jitter: Math.random() < 0.7 ? 0.0001 : rand(0.0005, 0.0015),
    exposure: rand(0.8, 1.3),
    focus: pick(FOCUS),
    wash: Math.random() < 0.45 ? rand(0.4, 0.85) : 0,
    burn: Math.random() < 0.3 ? [rand(0.25, 0.75), rand(0.66, 0.9), rand(0.06, 0.12)] : null,
  };
};
