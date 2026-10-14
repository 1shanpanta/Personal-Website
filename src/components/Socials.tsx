import type { IconType } from "react-icons";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import { SOCIALS, type SocialKey } from "@/lib/content";

/** One icon set for every glyph, so they share a weight. */
const ICONS: Record<SocialKey, IconType> = {
  github: FaGithub,
  x: FaXTwitter,
};

/** Glyphs set at the role line's size (1em), on a 28px hit area. */
export default function Socials() {
  return (
    <ul className="-my-2 flex gap-0.5">
      {SOCIALS.map(({ key, label, href }) => {
        const Icon = ICONS[key];
        return (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              title={label}
              className="flex h-7 w-7 items-center justify-center opacity-80 transition-opacity duration-150 ease-decel hover:opacity-100"
            >
              <Icon aria-hidden className="h-[1em] w-[1em]" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
