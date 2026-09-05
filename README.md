# nexron-portfolio

Personal portfolio of Jonas Glatz – showcasing software, AI, web and creative development projects by NEXRON Studios

## Development

```bash
npm install
npm run dev          # dev server on http://localhost:5174
npm run typecheck    # vue-tsc, no emit
npm run test         # vitest, single run
npm run build        # typecheck + production build into dist/
npm run preview      # serve dist/ on http://localhost:4173
```

## Contact form

The form in the contact section posts as plain JSON to a form provider — there
is no backend in this repo. Everything is wired up already; what is missing on a
fresh clone is the key.

1. Create an access key at <https://web3forms.com> for the address the messages
   should arrive at (`nexronstudios@gmail.com`). The key comes back by mail and
   is **meant to be public** — it ships in the client bundle. Never put a private
   API key here.
2. Copy the template and fill in the key:

   ```bash
   cp .env.example .env
   # VITE_CONTACT_ACCESS_KEY=<the key from the mail>
   ```

   `VITE_CONTACT_ENDPOINT` already points at `https://api.web3forms.com/submit`.

3. Restart the dev server. Vite reads `.env` at startup only, so a running
   server keeps serving the old values.
4. Send yourself a test message. Until both variables are filled,
   `contactService.isConfigured()` is false: the form shows the "not configured"
   note and keeps the submit button disabled instead of pretending to send.

For a deploy, set the same two variables as **build-time** environment variables
at the host. Vite inlines them into the bundle when it builds; setting them on
the running server afterwards does nothing.

Switching providers (Formspree, or a backend of your own) means editing
`src/api/services/contact.service.ts` and the endpoint in `.env` — nothing else
in the app knows who receives the message.

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
tunnel at port `5174` and run `npm run dev` in the first terminal.

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
