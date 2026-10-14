"use client";

import { useEffect, useRef, useState } from "react";
import { FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";

const SRC = "/audio/score.m4a";
const LEVEL = 0.9;
const MUTED_KEY = "ip-muted";
const GESTURES = ["pointerdown", "keydown", "touchstart"] as const;

const readMuted = () => {
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
};
const writeMuted = (muted: boolean) => {
  try {
    if (muted) localStorage.setItem(MUTED_KEY, "1");
    else localStorage.removeItem(MUTED_KEY);
  } catch {}
};

/**
 * The score plays from the start. Browsers refuse sound before a visitor's
 * first gesture, so a blocked start waits for the first click, tap or key
 * anywhere. Muting is remembered for the next visit.
 */
export default function Sound() {
  const [on, setOn] = useState(true);
  // The icon follows real playback: before the first gesture the browser keeps it silent.
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const ramp = useRef(0);
  const disarm = useRef(() => {});

  const fade = (to: number, ms: number, done?: () => void) => {
    const a = audio.current;
    if (!a) return;
    cancelAnimationFrame(ramp.current);
    const from = a.volume;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      a.volume = from + (to - from) * k;
      if (k < 1) ramp.current = requestAnimationFrame(step);
      else done?.();
    };
    ramp.current = requestAnimationFrame(step);
  };

  const play = () => audio.current?.play().then(() => fade(LEVEL, 2500));

  useEffect(() => {
    const a = new Audio(SRC);
    a.loop = true;
    a.volume = 0;
    audio.current = a;
    a.addEventListener("playing", () => setPlaying(true));
    a.addEventListener("pause", () => setPlaying(false));

    // A blocked play() rejects later; `alive` stops a torn-down mount from
    // arming listeners nothing would ever remove.
    let alive = true;
    const onGesture = (e: Event) => {
      // The toggle handles its own click; starting here would let that same
      // click mute the score the moment it began.
      if (e.target instanceof Element && e.target.closest("[data-sound]")) return;
      off();
      void play()?.catch(() => {});
    };
    const off = () => GESTURES.forEach((g) => removeEventListener(g, onGesture));
    disarm.current = off;

    if (readMuted()) setOn(false);
    else
      play()?.catch(() => {
        if (alive) GESTURES.forEach((g) => addEventListener(g, onGesture));
      });

    return () => {
      alive = false;
      off();
      cancelAnimationFrame(ramp.current);
      a.pause();
    };
    // play and fade only touch refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const a = audio.current;
    if (!on || !a) return;
    const onVis = () => {
      if (document.hidden) a.pause();
      else void a.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [on]);

  const toggle = () => {
    // On but silent means the browser blocked the start: this click is the
    // gesture it was waiting for, so it plays rather than mutes.
    const muting = on && !audio.current?.paused;
    disarm.current();
    if (muting) fade(0, 600, () => audio.current?.pause());
    else void play()?.catch(() => {});
    writeMuted(muting);
    setOn(!muting);
  };

  const Icon = playing ? FaVolumeHigh : FaVolumeXmark;
  return (
    <button
      type="button"
      data-sound
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Mute the score" : "Play the score"}
      title={playing ? "Mute" : "Sound"}
      className="overlay fixed right-3 top-3 z-30 flex h-10 w-10 items-center justify-center opacity-70 transition-opacity duration-150 ease-decel hover:opacity-100 md:right-7 md:top-6"
    >
      <Icon aria-hidden className="h-4 w-4 drop-shadow-[0_0_6px_rgb(0_0_0/0.55)]" />
    </button>
  );
}
