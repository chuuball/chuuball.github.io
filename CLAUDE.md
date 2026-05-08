# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astro static site with Tina CMS, hosted on GitHub Pages. A personal portfolio and digital diary. Dev environment runs entirely in Docker — no local Node/npm required.

## Commands

```sh
docker compose up    # Start dev server → localhost:4321, Tina admin → localhost:4321/admin
```

Manual (if Node is available):
```sh
npm run dev      # tinacms dev -c "astro dev --host"
npm run build    # tinacms build && astro build → dist/
```

## Architecture

**Framework:** Astro (static output). Components are `.astro` files — bare HTML with a frontmatter script block. Zero JS shipped by default.

**CMS:** Tina CMS. Schema lives in `tina/config.ts`. In dev, `tinacms dev` wraps the Astro server and serves the admin UI. In production, `tinacms build` outputs the admin panel to `public/admin/` which GitHub Pages serves at `/admin`.

**Content:** Markdown files in `src/content/`. Astro's Content Collections reads them at build time via the schema in `src/content/config.ts`. Tina writes to the same files via its editor.

**Layout:** `src/layouts/Layout.astro` renders the full site shell (the fixed 900px grid, title block, banner, left sidebar, right profile panel). Every page uses it via `<Layout><slot /></Layout>`. The shell reads `src/content/site/site.md` and `src/content/sidebar/sidebar.md` at build time for all configurable values.

## Content Collections

| Collection | Path | Used for |
|---|---|---|
| `posts` | `src/content/posts/*.md` | Blog entries, one file each |
| `pages` | `src/content/pages/*.md` | home, about, bs static pages |
| `site` | `src/content/site/site.md` | Title, subtitle, banner, marquee, social links |
| `sidebar` | `src/content/sidebar/sidebar.md` | Avatar, bio lines, likes table |

## Tina CMS Setup (one-time)

Before the `/admin` editor works in production:
1. Create a Tina Cloud account at tina.io
2. Connect the GitHub repo
3. Copy `TINA_PUBLIC_CLIENT_ID` and `TINA_TOKEN` from the Tina Cloud dashboard
4. Add both as GitHub Actions secrets in the repo settings
5. Copy `.env.example` → `.env` and fill in values for local Tina Cloud auth

**Dependency note:** `tinacms` (v2+) has no `bin` entry — it's the React UI only. The CLI binary (`tinacms dev`, `tinacms build`) lives in `@tinacms/cli`. Both are required.

**Tina free tier behavior:** Tina Cloud's free tier creates a PR for every edit rather than committing directly to `main`. The `.github/workflows/automerge.yml` workflow auto-merges these PRs. Condition: `github.actor == 'tinabot' || startsWith(github.head_ref, 'tina/')` — verify this matches the actual PR actor/branch when a real Tina edit is made.

## Docker Dev Environment

Key non-obvious details:

- **Node modules at `/deps`:** `npm ci` installs to `/deps` (not `/app`) so the bind-mounted source tree never shadows `node_modules` with an empty directory from the host.
- **socat port bridge:** Tina's dev server binds port 4001 to `::1` (IPv6 loopback only). Docker's port mapping can't reach that, so the dev script runs `socat TCP4-LISTEN:4001,fork,reuseaddr TCP6:[::1]:4001` to bridge IPv4 all-interfaces → IPv6 loopback. `socat` is installed in the Dockerfile via `apk add --no-cache socat`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm run build` and deploys `dist/` to GitHub Pages. Two caches speed up the workflow: `node_modules` keyed by `package-lock.json` hash (skips `npm ci` entirely on cache hit), and `.astro/` keyed by source file hashes.

## Styling

- `src/styles/global.css` — body, typography, shared rules, CSS custom properties
- Each `.astro` component has its own `<style>` block for component-specific rules (Astro scopes these automatically)
- No CSS framework — plain CSS throughout
- Key aesthetic: custom `cat.gif` cursor, pixel tile backgrounds (`1.png`–`5.png`), fixed 900px layout, black/white palette
