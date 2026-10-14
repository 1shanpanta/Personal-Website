"use client";

import { useEffect, useMemo, useState } from "react";
import { CUT_EVENT } from "@/lib/scenes";
import { HERO, PROJECTS } from "@/lib/content";

const name = (s: string) => s[0] + s.slice(1).toLowerCase();

/** The script in the reel's pseudo-Latin code, one section per shot. Facts only. */
function sections(total: string): string[][] {
  return [
    [
      "// PROJECT FILE : ishan_panta.unit",
      `AUTHOR        : ${name(HERO.first)} ${name(HERO.last)}`,
      `// LOCUS      : ${HERO.place}, NP`,
      "// GENUS      : Full-stack / Local-first",
    ],
    [
      "// -- PARAMETRA UNIVERSALIA --",
      `const OFFICIUM       = "${HERO.role.toLowerCase()}"`,
      `const DOMUS          = "${HERO.company}"`,
      `const LOCUS          = "${HERO.place}"`,
      ...(total ? [`const CONTRIBUTIONES = ${total.replace(/,/g, "")}`] : []),
      'const MOOD           = "free, local alternatives to',
      '   software you should not have to subscribe to"',
    ],
    [
      "// -- MODULI DEFINITIO --",
      "module Opifex {",
      "   input: problema_humanum,",
      "   keys: ai_in_loop, enterprise_per_diem,",
      "   fx_chain: [tinker, build, ship]",
      "}",
    ],
    ["module Opera {", ...PROJECTS.map((p) => `   ${p.name.replace(/[.-]/g, "_")}: "${p.href.replace("https://", "")}",`), "}"],
    [
      "// -- TEMPUS --",
      "de_in(Opifex)",
      "   frame(dies) => enterprise(DOMUS)",
      "   frame(reliquum) => tinker(local_first, ai_in_loop)",
      "   frame(∞) => ship(Opera)",
      "end_scene()",
    ],
    [
      "// -- EXECUTIO --",
      "when(visitor == PRAESENS) {",
      "   execute(renderUnit(IP))",
      '   log("Salve. Transmissio aperta est.")',
      "}",
    ],
    [
      "// -- SENTENTIA ARTISTICA --",
      'comment("Opus liberum, locale,',
      '   sine subscriptione.")',
      "// -- FINIS SCRIPTURAE --",
    ],
  ];
}

/** Characters per second, measured on the reel's overlay (about 70 in 0.8 s). */
const TYPE_RATE = 90;
/** The right copy runs this many characters behind the left. */
const LAG = 45;

function Column({ text, side }: { text: string; side: "left" | "right" }) {
  return (
    <div className={`codex-col ${side === "right" ? "codex-right text-right" : ""}`} aria-hidden>
      <div className="codex-rule" />
      {text.split("\n").map((line, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {line || " "}
        </div>
      ))}
    </div>
  );
}

/**
 * Two copies of one script, mirrored about the centre, as on the reel: the
 * block holds still and types in, the right copy right-aligned, narrower and
 * behind, and each backdrop cut swaps in the next section.
 */
export default function Codex({ total }: { total: string }) {
  const parts = useMemo(() => sections(total).map((lines) => lines.join("\n")), [total]);
  const [{ section, typed }, setState] = useState({ section: 0, typed: 0 });

  useEffect(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = () =>
      setState((s) => ({ section: (s.section + 1) % parts.length, typed: still ? Infinity : 0 }));
    addEventListener(CUT_EVENT, next);
    const step = 3;
    // Returning the same state once both copies finish stops the re-renders until the next cut.
    const type = () =>
      setState((s) => (s.typed >= parts[s.section].length + LAG ? s : { ...s, typed: s.typed + step }));
    const typing = still ? 0 : window.setInterval(type, 1000 / (TYPE_RATE / step));
    if (still) setState((s) => ({ ...s, typed: Infinity }));
    return () => {
      removeEventListener(CUT_EVENT, next);
      clearInterval(typing);
    };
  }, [parts]);

  const text = parts[section];
  return (
    <div className="codex pointer-events-none absolute inset-x-0 top-[24%] z-10 hidden h-[30vh] overflow-hidden mix-blend-difference md:block">
      <Column text={text.slice(0, typed)} side="left" />
      <Column text={text.slice(0, Math.max(0, typed - LAG))} side="right" />
    </div>
  );
}
