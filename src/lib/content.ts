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
  bio: "A nerd learning to build real systems, with AI in the loop on almost every commit. Enterprise work by day. At night I build small things to find out how the big ones work.",
};

export const PROJECTS: Project[] = [
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
    name: "youtube-clipper",
    blurb:
      "Loops one section of a YouTube video. Paste a URL, set the start and end, and it repeats that clip until you close it.",
    stack: ["React", "TypeScript"],
    links: [
      { label: "site", href: "https://ytlooper.vercel.app" },
      { label: "code", href: "https://github.com/1shanpanta/youtube-clipper" },
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
