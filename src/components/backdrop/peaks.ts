export type Point = { x: number; y: number };

/** Bright points that stand out from their 7x7 neighbourhood, strongest first, in 0..1 image space. */
export function findPeaks(img: HTMLImageElement): Point[] {
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
