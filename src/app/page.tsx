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

/** One plain line carrying real figures. No label pill, no subtitle. */
function Meta({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mb-3 font-mono text-[10px] tracking-label text-dim">
      {children}
    </p>
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

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-4xl px-4 pb-20 md:px-6">
        <section className="pt-12">
          <p className="font-dot text-lg text-dim md:text-2xl">
            {HERO.katakana}
          </p>
          {/* DotGothic16 sets Latin in a full-width cell, so the leading I carries a
              wide side bearing. Pulled left in em so it holds at every size. */}
          <h1 className="-ml-[0.2em] mt-1 font-dot text-[13vw] leading-[1.04] md:text-[6rem]">
            {HERO.first} {HERO.last}
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
            <Meta id="board">{calendar.total} CONTRIBUTIONS, LAST 12 MONTHS</Meta>
            <ContributionGrid calendar={calendar} />
          </section>
        ) : null}

        <section className="pt-14">
          <Meta id="work">SELECTED WORK</Meta>
          <ul className="flex flex-col gap-[3px]">
            {PROJECTS.map((project, i) => (
              <ProjectPanel key={project.name} project={project} index={i} />
            ))}
          </ul>
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
