import Backdrop from "@/components/Backdrop";
import Boot from "@/components/Boot";
import Codex from "@/components/Codex";
import Decode from "@/components/Decode";
import Socials from "@/components/Socials";
import Sound from "@/components/Sound";
import { getContributionTotal } from "@/lib/contributions";
import { GITHUB_USER, HERO } from "@/lib/content";

export default async function Home() {
  const total = await getContributionTotal(GITHUB_USER);

  return (
    <>
      <Boot total={total} />
      <Backdrop />
      <Sound />
      {/* One frame, nothing scrolls; the backdrop cuts in place behind it.
          Positioned but never z-indexed: a stacking context here would make
          the codex blend against this empty layer instead of the canvas. */}
      <main className="relative flex h-full flex-col justify-end overflow-y-auto px-5 py-5 md:px-10 md:py-8">
        <Codex total={total} />

        <div className="overlay relative z-20 grid items-end gap-7 md:gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <div>
            {/* Inter's extralight I and P carry a 0.105em left bearing, the label's
                F about 1px: pulling the heading back by the difference puts both
                ink edges on one line. */}
            <h1
              aria-label={`${HERO.first} ${HERO.last}`}
              className="-ml-[0.09em] text-[10vw] font-extralight leading-[0.86] tracking-[0.04em] md:text-[5vw] lg:text-[4vw]"
            >
              <Decode text={HERO.first} />
              <br />
              <Decode text={HERO.last} delay={180} />
            </h1>
            <div className="mt-5 flex items-center gap-4 text-[11px]">
              <p className="uppercase tracking-label opacity-80">{HERO.role}</p>
              <Socials />
            </div>
          </div>

          <p className="text-[15px] leading-relaxed">{HERO.bio}</p>
        </div>
      </main>
    </>
  );
}
