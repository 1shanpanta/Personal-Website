"use client";

import { useState } from "react";

const KEY = "ip-booted";

/**
 * Runs before first paint: a visitor who already booted this session never
 * sees the overlay flash in.
 */
const SKIP = `try{if(sessionStorage.getItem("${KEY}"))document.documentElement.dataset.booted="1"}catch(e){}`;

function remember() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {}
}

export default function Boot({ total }: { total: string }) {
  const [gone, setGone] = useState(false);
  if (gone) return null;

  const lines = [
    "Connecting to unit I.P.",
    "Loading memory core",
    "Visual cortex",
    total ? `Archive: ${total} contributions` : "Archive",
    "Field terminal",
  ];

  const finish = () => {
    remember();
    setGone(true);
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SKIP }} />
      <div
        role="presentation"
        onClick={finish}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) finish();
        }}
        className="boot fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black px-6 [animation:boot-out_0.32s_cubic-bezier(0.7,0,0.84,0)_1.9s_forwards]"
      >
        <div className="w-full max-w-sm font-label text-[10px] uppercase tracking-label text-white">
          {lines.map((line, i) => (
            <p
              key={line}
              className="flex justify-between gap-4 border-b border-white/15 py-2 opacity-0"
              style={{ animation: `boot-line 0.18s ease-out ${0.15 + i * 0.22}s forwards` }}
            >
              <span>{line}</span>
              <span className="opacity-50">OK</span>
            </p>
          ))}
          <p
            className="tick mt-6 opacity-0"
            style={{ animation: `boot-line 0.18s ease-out ${0.15 + lines.length * 0.22}s forwards` }}
          >
            All systems nominal
          </p>
        </div>
      </div>
    </>
  );
}
