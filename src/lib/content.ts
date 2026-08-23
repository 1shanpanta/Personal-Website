export type Link = { label: string; href: string };

export type Project = {
  name: string;
  blurb: string;
  stack: string[];
  links: Link[];
};

export const GITHUB_USER = "1shanpanta";
export const EMAIL = "ispanta03@gmail.com";

export const HERO = {
  katakana: "イシャン・パンタ",
  first: "ISHAN",
  last: "PANTA",
  role: "Full-stack developer",
  company: "D&S Inc",
  place: "Kathmandu",
  bio: "A nerd learning to build real systems, with AI in the loop on almost every commit. Japanese enterprise work by day, and whatever I wanted to exist that week by night.",
};

export const PROJECTS: Project[] = [
  {
    name: "open-wispr",
    blurb:
      "Speech to text anywhere on macOS, transcribed on-device by a local Whisper model.",
    stack: ["Swift", "WhisperKit"],
    links: [
      { label: "site", href: "https://open-wispr.com" },
      { label: "code", href: "https://github.com/1shanpanta/open-wispr" },
    ],
  },
  {
    name: "localshot",
    blurb:
      "Screenshot capture and annotation for macOS, drawn straight onto AppKit windows.",
    stack: ["Swift", "AppKit"],
    links: [{ label: "code", href: "https://github.com/1shanpanta/localshot" }],
  },
  {
    name: "openscreen",
    blurb:
      "Screen recorder that turns a raw capture into a product demo, with zoom and motion applied after the take.",
    stack: ["TypeScript"],
    links: [
      { label: "site", href: "https://openscreen.vercel.app" },
      { label: "code", href: "https://github.com/1shanpanta/openscreen" },
    ],
  },
  {
    name: "claude-analytics",
    blurb:
      "Dashboard over Claude Code history: sessions, token counts, cost and the tools each run reached for.",
    stack: ["TypeScript", "Next.js"],
    links: [
      { label: "site", href: "https://claude-analytics-omega.vercel.app" },
      { label: "code", href: "https://github.com/1shanpanta/claude-analytics" },
    ],
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
