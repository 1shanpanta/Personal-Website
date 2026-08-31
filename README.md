# ishanpanta.vercel.app

My personal site. One page, no framework beyond Next.js and Tailwind, and no
client-side JavaScript of its own. The hero, the project list and the socials
are all data in `src/lib/content.ts`, so editing the page means editing one
file. The contribution grid is real: a server component reads the public
calendar at
`github.com/users/1shanpanta/contributions`, parses the day cells, and renders
them as static HTML. That fetch revalidates every five days, so the page is
cached for almost every visitor and the numbers can trail reality by a few days.
If GitHub ever changes that markup the parse returns `null` and the section is
dropped rather than shown empty.

## Projects on the page

- [pawfit](https://pawfit-web.vercel.app) - fitness virtual pet, walking is the input
- [wono.fi](https://wono.fi) - tap to pay in crypto over NFC, settled on Solana
- [kesshin](https://kesshin.vercel.app) - stake money with friends on a daily habit
- [youtube-clipper](https://ytlooper.vercel.app) - loops one section of a YouTube video

```bash
bun install
bun run dev     # http://localhost:3000
bun run build
```
