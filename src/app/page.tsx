import ContributionGrid from "@/components/ContributionGrid";
import Socials from "@/components/Socials";
import { getContributions } from "@/lib/contributions";
import {
  EMAIL,
  GITHUB_USER,
  HERO,
  PROJECTS,
  type Project,
} from "@/lib/content";

/** Inverted bar, not a hairline rule: the label is a lit segment on the board. */
function Bar({ id, label, note }: { id: string; label: string; note?: string }) {
  return (
    <div id={id} className="flex flex-wrap items-stretch gap-[3px]">
      <h2 className="flex items-center rounded-md bg-fg px-3 pb-1 pt-1.5 font-dot text-xl leading-none text-void">
        {label}
      </h2>
      {note ? (
        <span className="flex items-center rounded-md bg-panel px-3 font-mono text-[10px] tracking-label text-dim">
          {note}
        </span>
      ) : null}
    </div>
  );
}

function ProjectPanel({ project, index }: { project: Project; index: number }) {
  return (
    <li className="group rounded-lg bg-panel p-4 transition-colors duration-200 ease-decel hover:bg-panel-hi md:grid md:grid-cols-[2.5rem_13rem_1fr_auto] md:items-baseline md:gap-5">
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
            className="rounded-md bg-void px-3 py-2 font-mono text-[10px] tracking-label text-dim transition-colors duration-200 ease-decel hover:bg-fg hover:text-void"
          >
            {link.label.toUpperCase()}
          </a>
        ))}
      </div>
    </li>
  );
}

export default async function Home() {
  const calendar = await getContributions(GITHUB_USER);

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
      <main className="mx-auto max-w-4xl px-4 pb-20 md:px-6">
        <section className="pt-12">
          <p className="font-dot text-lg text-dim md:text-2xl">
            {HERO.katakana}
          </p>
          <h1 className="mt-1 font-dot text-[13vw] leading-[1.04] md:text-[6rem]">
            {HERO.first}
            <span className="knock">{HERO.last}</span>
          </h1>
          <p className="mt-5 font-mono text-[11px] tracking-label text-dim md:text-xs">
            {HERO.role.toUpperCase()} <span className="text-fg">/</span>{" "}
            {HERO.company.toUpperCase()} <span className="text-fg">/</span>{" "}
            {HERO.place.toUpperCase()}
          </p>
          <div className="mt-5">
            <Socials />
          </div>
          <p className="mt-9 max-w-2xl font-dot text-xl leading-relaxed md:text-2xl">
            {HERO.bio}
          </p>
        </section>

        {calendar ? (
          <section className="pt-14">
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

        <section className="pt-14">
          <Bar id="work" label="work" note="SELECTED" />
          <ul className="mt-[3px] flex flex-col gap-[3px]">
            {PROJECTS.map((project, i) => (
              <ProjectPanel key={project.name} project={project} index={i} />
            ))}
          </ul>
          <a
            href={`https://github.com/${GITHUB_USER}?tab=repositories`}
            target="_blank"
            rel="noreferrer"
            className="mt-[3px] block rounded-lg bg-panel px-4 py-3 font-mono text-[10px] tracking-label text-dim transition-colors duration-200 ease-decel hover:bg-fg hover:text-void"
          >
            ALL REPOSITORIES
          </a>
        </section>

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-panel px-4 py-3 font-mono text-[10px] tracking-label text-dim">
          <span>ISHAN PANTA / KATHMANDU</span>
          <a
            href={`mailto:${EMAIL}`}
            className="transition-colors duration-200 ease-decel hover:text-fg"
          >
            {EMAIL}
          </a>
        </footer>
      </main>
    </div>
  );
}
