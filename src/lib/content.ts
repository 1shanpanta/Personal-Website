export type Link = { label: string; href: string };

export type Project = {
  name: string;
  blurb: string;
  stack: string[];
  links: Link[];
};

export const GITHUB_USER = "1shanpanta";
export const EMAIL = "ispanta03@gmail.com";

/** Private repositories. The API will not count these without a token, so bump it by hand. */
export const PRIVATE_COUNT = 64;

export const HERO = {
  katakana: "イシャン・パンタ",
  first: "ISHAN",
  last: "PANTA",
  role: "Full-stack developer",
  company: "D&S Inc",
  place: "Kathmandu",
  thesis:
    "I build free, local alternatives to software you should not have to subscribe to.",
  bio: "Days on Japanese enterprise systems. Nights on native macOS tools, a 32-bit kernel that boots to its own shell, and enough Japanese to read the ticket before I fix it.",
};

export const PROJECTS: Project[] = [
  {
    name: "open-wispr",
    blurb:
      "Voice dictation for macOS that never leaves the machine. Speak anywhere, no account, no upload.",
    stack: ["Swift", "on-device"],
    links: [
      { label: "site", href: "https://open-wispr.com" },
      { label: "code", href: "https://github.com/1shanpanta/open-wispr" },
    ],
  },
  {
    name: "localshot",
    blurb:
      "Native screenshot and annotation tool. A free alternative to CleanShot X, built on AppKit.",
    stack: ["Swift", "AppKit"],
    links: [{ label: "code", href: "https://github.com/1shanpanta/localshot" }],
  },
  {
    name: "openscreen",
    blurb:
      "Demo recorder with no subscription and no watermark. An alternative to Screen Studio, free for commercial use.",
    stack: ["TypeScript"],
    links: [
      { label: "site", href: "https://openscreen.vercel.app" },
      { label: "code", href: "https://github.com/1shanpanta/openscreen" },
    ],
  },
  {
    name: "claude-analytics",
    blurb:
      "Read your Claude Code sessions, tokens and cost. Fully client side, nothing leaves the browser.",
    stack: ["TypeScript", "Next.js"],
    links: [
      { label: "site", href: "https://claude-analytics-omega.vercel.app" },
      { label: "code", href: "https://github.com/1shanpanta/claude-analytics" },
    ],
  },
];

export type Study = { script: string; language: string; detail: string };

export const STUDYING: Study[] = [
  {
    script: "日本語",
    language: "Japanese",
    detail: "N5 passed. Sitting N2 in December.",
  },
  {
    script: "Français",
    language: "French",
    detail: "Daily vocabulary capture, aiming at DELF.",
  },
];

export type SocialKey = "github" | "linkedin" | "x" | "medium" | "email";

export const SOCIALS: { key: SocialKey; label: string; href: string }[] = [
  { key: "github", label: "GitHub", href: "https://github.com/1shanpanta" },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com/in/1shanpanta",
  },
  { key: "x", label: "X", href: "https://x.com/1shanpanta" },
  { key: "medium", label: "Medium", href: "https://medium.com/@1shanpanta" },
  { key: "email", label: "Email", href: `mailto:${EMAIL}` },
];
