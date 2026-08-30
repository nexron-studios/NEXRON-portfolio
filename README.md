# nexron-portfolio
Personal portfolio of Jonas Glatz – showcasing software, AI, web and creative development projects by NEXRON Studios

## Development

```bash
npm install
npm run dev          # dev server on http://localhost:5173
npm run typecheck    # vue-tsc, no emit
npm run test         # vitest, single run
npm run build        # typecheck + production build into dist/
npm run preview      # serve dist/ on http://localhost:4173
```

## Sharing a temporary preview

A Cloudflare quick tunnel puts the local build on a public `*.trycloudflare.com`
URL so someone else can look at it. No Cloudflare account, no DNS, no cost.

One-time setup:

```bash
brew install cloudflared
```

Then, in two terminals:

```bash
# terminal 1 — build and serve the production bundle
npm run build && npm run preview

# terminal 2 — open the tunnel to that port
cloudflared tunnel --url http://localhost:4173
```

`cloudflared` prints the public URL into its own output, e.g.
`https://above-ranging-cable-name.trycloudflare.com`.

To share the dev server instead — live HMR, but a slower dev build — point the
tunnel at port `5173` and run `npm run dev` in the first terminal.

Notes:

- The URL only lives as long as both processes run, and a fresh one is issued
  on every start. It is not a stable link.
- There is no authentication. Anyone holding the URL can open the site, so this
  is for a short look, not for leaving up.
- `preview` serves a static build; code changes need another `npm run build`.
- `vite.config.ts` allows `.trycloudflare.com` in `server.allowedHosts` and
  `preview.allowedHosts` — without it Vite's host check answers every tunnelled
  request with "Blocked request". The wildcard is deliberate; `true` would
  switch the check off entirely.
