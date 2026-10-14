"use client";

import { useEffect, useState } from "react";

const NOISE = "ABCDEFGHKMNPRSTVXZ0123456789#/=<>";

/**
 * Text that resolves out of noise, left to right, once per page load. It waits
 * out the boot screen on a first visit. The server renders the real text, so
 * nothing is lost without JavaScript.
 */
export default function Decode({ text, delay = 0 }: { text: string; delay?: number }) {
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const booted = document.documentElement.dataset.booted === "1";
    const start = performance.now() + (booted ? 200 : 2250) + delay;
    const span = 950;
    let raf = 0;
    let lastSwap = 0;
    const step = (now: number) => {
      const p = (now - start) / span;
      if (p >= 1) {
        setShown(text);
        return;
      }
      raf = requestAnimationFrame(step);
      if (now - lastSwap < 45) return;
      lastSwap = now;
      setShown(
        [...text]
          .map((ch, i) => {
            if (ch === " ") return ch;
            const settle = i / text.length;
            return p > settle ? ch : NOISE[Math.floor(Math.random() * NOISE.length)];
          })
          .join(""),
      );
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text, delay]);

  return <span aria-hidden>{shown}</span>;
}
