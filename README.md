# Ishan Panta

My personal site. 
Live: <https://ishanpanta.com.np>

## Run it

```bash
bun install
bun run dev     # http://localhost:3000
bun run build
```

A push to `main` deploys the site to Cloudflare through `.github/workflows/deploy.yml`.

## Stack

- Next.js 14, app router, static export
- Tailwind
- A WebGL2 backdrop in `src/components/Backdrop.tsx` (through `twgl.js`), over the plates in `public/scenes`
- Zen Kaku Gothic New through `next/font`
- Icons from `react-icons` (Font Awesome 6)
- The score in `public/audio/score.m4a`: "ILLUSION OF CONTROL" by Mattia Cupelli
