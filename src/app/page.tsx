import ContributionGrid from "@/components/ContributionGrid";
import Socials from "@/components/Socials";
import { getContributions } from "@/lib/contributions";
import { getCensus, type Census } from "@/lib/repos";
import {
  EMAIL,
  GITHUB_USER,
  HERO,
  PRIVATE_COUNT,
  PROJECTS,
  STUDYING,
  type Project,
} from "@/lib/content";

/** Inverted bar, not a hairline rule: the label is a lit segment on the board. */
function Bar({ id, label, note }: { id: string; label: string; note?: string }) {
  return (
    <div id={id} className="flex flex-wrap items-stretch gap-[3px]">
      <h2 className="flex items-center bg-fg px-3 pb-1 pt-1.5 font-dot text-xl leading-none text-void">
        {label}
      </h2>
      {note ? (
        <span className="flex items-center bg-panel px-3 font-mono text-[10px] tracking-label text-dim">
          {note}
        </span>
      ) : null}
    </div>
  );
}

function Datum({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2 tabular-nums">
      <span className="text-dim">{k}</span>
      <span>{v}</span>
    </div>
  );
}

/** Dense left margin. Every figure here is read off the account, not invented. */
function Rail({ census }: { census: Census | null }) {
  const total = census ? census.publicCount + PRIVATE_COUNT : null;
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-0 flex flex-col gap-[3px] pt-10 font-mono text-[9px] leading-[1.7] tracking-wide">
        <div className="bg-panel p-2.5">
          <div className="mb-1.5 text-fg">REPOSITORIES</div>
          {total ? <Datum k="TOTAL" v={String(total)} /> : null}
          {census ? <Datum k="PUBLIC" v={String(census.publicCount)} /> : null}
          <Datum k="PRIVATE" v={String(PRIVATE_COUNT)} />
          {census ? (
            <Datum k="PUBLIC MB" v={String(Math.round(census.kilobytes / 1024))} />
          ) : null}
        </div>
        {census ? (
          <div className="bg-panel p-2.5">
            <div className="mb-1.5 text-fg">LANGUAGES / PUBLIC</div>
            {census.languages.slice(0, 8).map((lang) => (
              <Datum key={lang.name} k={lang.name.toUpperCase()} v={String(lang.count)} />
            ))}
          </div>
        ) : null}
        <div className="bg-panel p-2.5">
          <div className="mb-1.5 text-fg">POSITION</div>
          <Datum k="LAT" v="27.7172 N" />
          <Datum k="LON" v="85.3240 E" />
          <Datum k="UTC" v="+05:45" />
        </div>
      </div>
    </aside>
  );
}

function ProjectPanel({ project, index }: { project: Project; index: number }) {
  return (
    <li className="group bg-panel p-4 transition-colors duration-200 ease-decel hover:bg-panel-hi md:grid md:grid-cols-[2.5rem_13rem_1fr_auto] md:items-baseline md:gap-5">
      <span className="font-mono text-[11px] tabular-nums text-dim">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="mt-2 md:mt-0">
        <h3 className="font-dot text-xl leading-tight">{project.name}</h3>
        <p className="mt-1 font-mono text-[10px] tracking-label text-dim">
          {project.stack.join(" / ")}
        </p>
      </div>
      <p className="mt-2 max-w-prose text-[14px] leading-relaxed text-fg/65 md:mt-0">
        {project.blurb}
      </p>
      <div className="mt-3 flex gap-[3px] md:mt-0">
        {project.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="bg-void px-3 py-2 font-mono text-[10px] tracking-label text-dim transition-colors duration-200 ease-decel hover:bg-fg hover:text-void"
          >
            {link.label.toUpperCase()}
          </a>
        ))}
      </div>
    </li>
  );
}

/** One bar per private repository. The count is real; the names are the point of the bar. */
function Classified() {
  return (
    <div className="grid grid-cols-4 gap-[3px] bg-panel p-4 sm:grid-cols-8 lg:grid-cols-12">
      {Array.from({ length: PRIVATE_COUNT }, (_, i) => (
        <span
          key={i}
          className="h-[10px] bg-fg/25"
          /* Hashed, not linear: a linear width aliases against the column count
             and the bars line up into vertical stripes. */
          style={{ width: `${46 + (((i + 1) * 2654435761) % 54)}%` }}
        />
      ))}
    </div>
  );
}

const GREYS = ["#f2f2f2", "#c4c4c4", "#9c9c9c", "#7a7a7a", "#5e5e5e", "#464646", "#333333", "#252525"];

function LanguageCensus({ census }: { census: Census }) {
  const shown = census.languages.slice(0, 8);
  const total = shown.reduce((sum, lang) => sum + lang.count, 0);
  return (
    <div className="bg-panel p-4">
      <div className="flex h-8 gap-[2px]">
        {shown.map((lang, i) => (
          <span
            key={lang.name}
            title={`${lang.name} · ${lang.count}`}
            style={{
              width: `${(lang.count / total) * 100}%`,
              background: GREYS[i % GREYS.length],
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-label text-dim">
        {shown.map((lang, i) => (
          <span key={lang.name} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0"
              style={{ background: GREYS[i % GREYS.length] }}
            />
            {lang.name.toUpperCase()} {lang.count}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  const [calendar, census] = await Promise.all([
    getContributions(GITHUB_USER),
    getCensus(GITHUB_USER),
  ]);

  const peak = calendar
    ? calendar.weeks
        .flat()
        .reduce(
          (best, day) => (day && (!best || day.count > best.count) ? day : best),
          null as { date: string; count: number } | null,
        )
    : null;

  return (
    <div className="min-h-screen">
      {/* Right margin, set on its side. Reads as a spine, not as chrome. */}
      <span className="pointer-events-none fixed right-2 top-1/2 hidden -translate-y-1/2 rotate-90 select-none font-mono text-[10px] tracking-label text-dim xl:block">
        KATHMANDU 27.7172 N 85.3240 E
      </span>

      <div className="mx-auto grid max-w-6xl gap-x-[3px] px-4 pb-20 md:px-6 lg:grid-cols-[150px_1fr]">
        <Rail census={census} />

        <main className="min-w-0">
          <section className="relative overflow-hidden pt-10">
            {/* Texture layer, behind the type. Over it, the name stopped reading. */}
            <span
              aria-hidden
              className="pointer-events-none absolute right-0 top-24 z-0 translate-x-1/3 select-none whitespace-nowrap font-dot text-[19vw] leading-none text-fg/[0.07]"
            >
              {HERO.katakana}
            </span>

            <p className="relative z-10 font-dot text-lg text-dim md:text-2xl">
              {HERO.katakana}
            </p>
            <h1 className="relative z-10 mt-1 font-dot text-[13vw] leading-[1.04] md:text-[6rem]">
              {HERO.first} <span className="knock">{HERO.last}</span>
            </h1>
            <p className="mt-5 font-mono text-[11px] tracking-label text-dim md:text-xs">
              {HERO.role.toUpperCase()} <span className="text-fg">/</span>{" "}
              {HERO.company.toUpperCase()} <span className="text-fg">/</span>{" "}
              {HERO.place.toUpperCase()}
            </p>
            <div className="mt-5">
              <Socials />
            </div>
            <p className="mt-8 max-w-3xl font-dot text-2xl leading-snug md:text-[1.9rem]">
              {HERO.thesis}
            </p>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-fg/60">
              {HERO.bio}
            </p>
            <div className="mt-7 flex flex-wrap gap-[3px]">
              <a
                href={`mailto:${EMAIL}`}
                className="bg-fg px-6 py-3.5 font-mono text-[11px] tracking-label text-void transition-opacity duration-200 ease-decel hover:opacity-75"
              >
                SEND AN EMAIL
              </a>
              <a
                href={`https://github.com/${GITHUB_USER}`}
                target="_blank"
                rel="noreferrer"
                className="bg-panel px-6 py-3.5 font-mono text-[11px] tracking-label text-fg transition-colors duration-200 ease-decel hover:bg-panel-hi"
              >
                GITHUB
              </a>
            </div>
          </section>

          {calendar ? (
            <section className="pt-12">
              <Bar
                id="board"
                label="board"
                note={`${calendar.total} CONTRIBUTIONS, LAST 12 MONTHS${
                  peak ? ` / PEAK ${peak.count} ON ${peak.date}` : ""
                }`}
              />
              <div className="mt-[3px]">
                <ContributionGrid calendar={calendar} />
              </div>
            </section>
          ) : null}

          <section className="pt-12">
            <Bar id="work" label="work" note="FREE, LOCAL, NO SUBSCRIPTION" />
            <ul className="mt-[3px] flex flex-col gap-[3px]">
              {PROJECTS.map((project, i) => (
                <ProjectPanel key={project.name} project={project} index={i} />
              ))}
            </ul>
            <a
              href={`https://github.com/${GITHUB_USER}?tab=repositories`}
              target="_blank"
              rel="noreferrer"
              className="mt-[3px] block bg-panel px-4 py-3 font-mono text-[10px] tracking-label text-dim transition-colors duration-200 ease-decel hover:bg-fg hover:text-void"
            >
              ALL REPOSITORIES
            </a>
          </section>

          <section className="pt-12">
            <Bar
              id="classified"
              label="classified"
              note={`${PRIVATE_COUNT} PRIVATE REPOSITORIES, ONE BAR EACH`}
            />
            <div className="mt-[3px]">
              <Classified />
            </div>
          </section>

          {census ? (
            <section className="pt-12">
              <Bar id="census" label="census" note="PUBLIC REPOSITORIES BY LANGUAGE" />
              <div className="mt-[3px]">
                <LanguageCensus census={census} />
              </div>
            </section>
          ) : null}

          <section className="pt-12">
            <Bar id="study" label="study" note="EVERY DAY, NOT A COURSE" />
            <ul className="mt-[3px] grid gap-[3px] md:grid-cols-2">
              {STUDYING.map((study) => (
                <li key={study.language} className="bg-panel p-4">
                  <p className="font-dot text-3xl leading-none">{study.script}</p>
                  <p className="mt-3 text-[14px] leading-relaxed text-fg/65">
                    {study.detail}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <footer className="mt-[3px] flex flex-wrap items-center justify-between gap-3 bg-panel px-4 py-3 font-mono text-[10px] tracking-label text-dim">
            <span>ISHAN PANTA / KATHMANDU</span>
            <a
              href={`mailto:${EMAIL}`}
              className="transition-colors duration-200 ease-decel hover:text-fg"
            >
              {EMAIL.toUpperCase()}
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
}
