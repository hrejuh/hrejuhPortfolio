# hrejuh

## Commands

```bash
npm run dev
npm run type-check
npm run build
```

There is no lint or test script.

## Architecture

- Vite/React portfolio and tools app using TanStack Router, Tailwind, Convex, and Cloudflare.
- Routes live under `src/routes/`; custom YouTube and authentication Vite plugins are repository-specific server boundaries.
- `wrangler.jsonc` defines Cloudflare runtime values and the `VAULT` R2 binding.
- The PWA configuration lives in the Vite setup.

## Hazards

- Convex is shared with other products; preserve function/schema ownership.
- Treat values in `wrangler.jsonc` as deploy-time configuration and keep secrets out of committed vars.
- Custom Vite plugins are coupled to the dev/build server and need regression checks after Vite changes.
- `.github/workflows/` is currently empty; builds are not CI-enforced.

