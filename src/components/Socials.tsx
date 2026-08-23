import { SOCIALS, type SocialKey } from "@/lib/content";

const PATHS: Record<SocialKey, React.ReactNode> = {
  github: (
    <path d="M12 .5C5.73.5.9 5.33.9 11.6c0 4.95 3.2 9.13 7.66 10.6.56.1.76-.24.76-.53v-1.9c-3.11.68-3.77-1.32-3.77-1.32-.5-1.3-1.24-1.64-1.24-1.64-1.01-.7.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.72 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.48-.28-5.1-1.25-5.1-5.56 0-1.23.44-2.23 1.15-3.02-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.07 1.15a10.6 10.6 0 0 1 5.6 0c2.12-1.45 3.06-1.15 3.06-1.15.61 1.54.23 2.68.11 2.96.72.79 1.15 1.79 1.15 3.02 0 4.32-2.63 5.27-5.12 5.55.4.35.76 1.03.76 2.08v3.08c0 .3.2.64.77.53a11.1 11.1 0 0 0 7.65-10.6C23.1 5.33 18.27.5 12 .5Z" />
  ),
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2.4 21.5h5.16V9.75H2.4V21.5ZM9.9 9.75h4.95v1.6h.07c.69-1.2 2.37-2 4.06-2 4.34 0 5.14 2.6 5.14 5.98v6.17h-5.15v-5.47c0-1.3-.02-2.98-1.86-2.98-1.86 0-2.14 1.42-2.14 2.89v5.56H9.9V9.75Z" />
  ),
  x: (
    <path d="M17.53 3h3.2l-7 8 7.77 10h-6.1l-4.77-6.2-5.46 6.2H2l7.3-8.3L1.84 3h6.24l4.47 5.9L17.53 3Zm-1.12 16.1h1.77L6.7 4.8H4.8l11.6 14.3Z" />
  ),
  medium: (
    <path d="M13.54 12c0 3.72-3.03 6.73-6.77 6.73S0 15.72 0 12s3.03-6.73 6.77-6.73S13.54 8.28 13.54 12Zm7.42 0c0 3.5-1.51 6.34-3.38 6.34S14.2 15.5 14.2 12s1.51-6.34 3.38-6.34S20.96 8.5 20.96 12ZM24 12c0 3.14-.53 5.68-1.19 5.68S21.62 15.14 21.62 12s.53-5.68 1.19-5.68S24 8.86 24 12Z" />
  ),
  email: (
    <path d="M3 5h18v14H3V5Zm2.2 2 6.8 5 6.8-5H5.2ZM5 9.2V17h14V9.2l-7 5.2-7-5.2Z" />
  ),
};

/** Solid tiles, not bare glyphs: the row reads as five keys on a panel. */
export default function Socials() {
  return (
    <ul className="flex flex-wrap gap-[3px]">
      {SOCIALS.map((social) => (
        <li key={social.key}>
          <a
            href={social.href}
            target="_blank"
            rel="noreferrer"
            aria-label={social.label}
            title={social.label}
            className="flex h-11 w-11 items-center justify-center rounded-md bg-panel text-dim transition-colors duration-200 ease-decel hover:bg-fg hover:text-void"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
              {PATHS[social.key]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
