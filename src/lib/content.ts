export const GITHUB_USER = "1shanpanta";

export const HERO = {
  first: "ISHAN",
  last: "PANTA",
  role: "Full-stack developer",
  company: "D&S Inc",
  place: "Kathmandu",
  bio: "A nerd learning to build real systems, with AI in the loop on almost every commit. Enterprise work by day, and tinkering the rest of the time because I love to.",
};

/** Named in the codex only. */
export const PROJECTS: { name: string; href: string }[] = [
  { name: "pawfit", href: "https://pawfit-web.vercel.app" },
  { name: "wono.fi", href: "https://wono.fi" },
  { name: "kesshin", href: "https://kesshin.vercel.app" },
  { name: "youtube-clipper", href: "https://ytlooper.vercel.app" },
];

export type SocialKey = "github" | "x";

export const SOCIALS: { key: SocialKey; label: string; href: string }[] = [
  { key: "github", label: "GitHub", href: "https://github.com/1shanpanta" },
  { key: "x", label: "X", href: "https://x.com/1shanpanta" },
];
