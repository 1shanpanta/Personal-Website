import type { IconType } from "react-icons";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import { SOCIALS, type SocialKey } from "@/lib/content";

/** One icon set for every glyph, so they share a weight. */
const ICONS: Record<SocialKey, IconType> = {
  github: FaGithub,
  x: FaXTwitter,
};

/** Bare glyphs on the photograph: no tiles, one size, one opacity. */
export default function Socials() {
  return (
    // Pulled left by the glyph inset, so the first icon lines up with the text above.
    <ul className="-ml-[11px] flex gap-1">
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
              className="flex h-10 w-10 items-center justify-center opacity-75 transition-opacity duration-150 ease-decel hover:opacity-100"
            >
              <Icon aria-hidden className="h-[17px] w-[17px] drop-shadow-[0_0_6px_rgb(0_0_0/0.55)]" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
