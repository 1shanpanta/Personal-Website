export type Link = { label: string; href: string };

export type Project = {
  name: string;
  blurb: string;
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
  bio: "A nerd learning to build real systems, with AI in the loop on almost every commit. Enterprise work by day, and tinkering the rest of the time because I love to.",
};

export const PROJECTS: Project[] = [
  {
    name: "pawfit",
    blurb:
      "A fitness virtual pet. Walking is the input, and a menagerie of cats and dogs is what grows out of it.",
    links: [{ label: "site", href: "https://pawfit-web.vercel.app" }],
  },
  {
    name: "wono.fi",
    blurb:
      "Tap to pay in crypto over NFC. Two phones touch, one pays, and the transfer settles privately on Solana.",
    links: [{ label: "site", href: "https://wono.fi" }],
  },
  {
    name: "kesshin",
    blurb:
      "Stake money with friends on a daily habit. Check in with a photo, and the day you miss is the day they split your penalty.",
    links: [{ label: "site", href: "https://kesshin.vercel.app" }],
  },
  {
    name: "youtube-clipper",
    blurb:
      "Loops one section of a YouTube video. Paste a URL, set the start and end, and it repeats that clip until you close it.",
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
