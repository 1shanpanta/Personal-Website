/**
 * The backdrop's shots, in the order it cuts through them: mostly rose, with
 * the knight and the owl between. Images live in public/scenes as <id>.webp
 * (landscape) and <id>-p.webp (portrait).
 */
export const CYCLE = ["rose", "knight", "rose2", "owl", "rose3", "knight2", "rose4"] as const;

export type SceneId = (typeof CYCLE)[number];

/** Fired on window at every backdrop cut, so the codex can change with it. */
export const CUT_EVENT = "backdrop:cut";

/**
 * Shot lengths in seconds, measured cut by cut from the reference reel and
 * replayed in a loop, burst of short cuts included.
 */
export const SHOTS = [
  0.7, 1.1, 3.1, 0.6, 1.9, 2.0, 1.3, 1.7, 0.4, 0.2, 0.3, 1.3, 0.6, 0.6, 1.3, 2.2, 2.7, 0.7, 0.6, 1.5, 1.4,
  1.3, 1.4, 1.1,
];
