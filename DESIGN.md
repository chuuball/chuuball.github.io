# Design Doc: chuuball.github.io Refactor

## Goals

1. Non-technical user can create and edit blog posts through a web UI (no git, no code)
2. Site structure becomes component-based and maintainable
3. Visual aesthetic is fully preserved (cat cursor, pixel backgrounds, nostalgia layout)
4. Dev environment runs entirely in Docker — no local Node/npm required

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Astro (static output) |
| CMS | Tina CMS + Tina Cloud |
| Hosting | GitHub Pages |
| Build/Deploy | GitHub Actions |
| Dev environment | Docker + docker-compose |

**Why Astro over Next.js:** Astro components compile to zero-JS HTML by default. Component files look like bare HTML with a data slot — no virtual DOM, no hydration, no React overhead. The resulting site is a folder of HTML + CSS files, true to the original spirit of the project.

**Tina editing mode:** Form-based (fill in fields → save → commits to GitHub). The real-time visual editing overlay (click text on the page to edit it) requires React and is not used here. For diary entries, the form editor is cleaner anyway.

---

## Development Environment

All dev work runs inside Docker. No Node or npm needed on the host machine.

### Files

**`Dockerfile`**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 4321 4001
CMD ["npm", "run", "dev"]
```

**`docker-compose.yml`**
```yaml
services:
  dev:
    build: .
    ports:
      - "4321:4321"   # Astro dev server
      - "4001:4001"   # Tina local backend
    volumes:
      - .:/app
      - /app/node_modules
    env_file: .env
```

**`.env.example`**
```
TINA_PUBLIC_CLIENT_ID=
TINA_TOKEN=
```

### Commands

```sh
docker compose up              # Start dev server → localhost:4321
docker compose run dev npm run build   # Test production build locally
```

### `package.json` scripts

```json
{
  "dev":     "tinacms dev -c \"astro dev --host\"",
  "build":   "tinacms build && astro build",
  "preview": "astro preview --host"
}
```

`--host` is required in Docker so Astro binds to `0.0.0.0` instead of `localhost`.

---

## Project Structure

```
/
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── astro.config.mjs
├── package.json
├── tina/
│   └── config.ts              # Tina schema (all collections defined here)
├── src/
│   ├── layouts/
│   │   └── Layout.astro       # Shell — the grid, sidebar, profile panel
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Marquee.astro
│   │   ├── SocialLinks.astro
│   │   ├── Profile.astro
│   │   ├── LikesTable.astro
│   │   └── BlogCard.astro
│   ├── pages/
│   │   ├── index.astro        # home
│   │   ├── about.astro
│   │   ├── bs.astro
│   │   └── blog/
│   │       ├── index.astro    # post listing
│   │       └── [slug].astro   # individual post
│   └── styles/
│       └── global.css         # Converted from style.css; CSS variables for theming
├── content/
│   ├── posts/                 # One .md file per blog post
│   └── config/
│       ├── site.md            # Title, subtitle, marquee, social links
│       ├── sidebar.md         # Profile bio, likes table
│       └── pages/
│           ├── home.md
│           ├── about.md
│           └── bs.md
└── public/                    # Static assets served as-is
    ├── cat.gif
    ├── banner.png
    ├── awesomenesss.png
    ├── gif.gif
    ├── pixelcat.gif
    └── *.png                  # Background textures (1.png–5.png)
```

---

## Component Architecture

The shell layout (`Layout.astro`) renders the grid and receives page content as a slot.

```astro
---
// Layout.astro
const { title } = Astro.props;
const siteConfig = await getSiteConfig();   // reads content/config/site.md
const sidebarConfig = await getSidebarConfig();
---
<html>
<head>
  <link rel="stylesheet" href="/styles/global.css" />
</head>
<body>
  <div class="outer">
    <div class="title">
      <div class="site-title">{siteConfig.title}</div>
      <div class="site-subtitle">{siteConfig.subtitle}</div>
    </div>

    <div class="banner-wrapper">
      <div class="banner"></div>
      <Marquee phrases={siteConfig.marquee} />
    </div>

    <Sidebar>
      <Nav />
      <SocialLinks links={siteConfig.socialLinks} />
    </Sidebar>

    <main class="main">
      <slot />                  <!-- page content renders here -->
    </main>

    <Profile data={sidebarConfig} />
  </div>
</body>
</html>
```

Each page imports `Layout` and fills the slot:

```astro
---
// blog/[slug].astro
import Layout from '../../layouts/Layout.astro';
const { post } = Astro.props;
---
<Layout>
  <h1>{post.header}</h1>
  <p class="date">{post.date} — {post.tagline}</p>
  {post.image && <img src={post.image} alt="" />}
  <h2>{post.subtitle}</h2>
  <div set:html={post.body} />
  <ul>
    {post.affirmations.map(a => <li>{a}</li>)}
    <li>song of the day: {post.song}</li>
  </ul>
</Layout>
```

No component knows about any other component's internals. Each `.astro` file owns its own scoped `<style>` block for component-specific rules; shared rules (typography, cursor, grid dimensions) live in `global.css`.

---

## Content Model

### Blog Post (`content/posts/[slug].md`)

```yaml
---
header:       "at the end of anything, hold on to everything."
date:         2025-07-06
tagline:      "healing is not linear"
subtitle:     "deez nuts"
image:        "/uploads/pixelcat.gif"   # optional — Tina media upload
song:         "i wouldn't ask you by clairo"
affirmations:
  - "i will get better"
  - "nothing i do is useless"
  - "my feelings matter!"
---

Body text goes here as markdown rich text.
```

### Site Config (`content/config/site.md`)

```yaml
---
title:    "chuuball(ing)"
subtitle: "digital diary for the mentally ill"
banner:   "/uploads/banner.png"         # Tina media upload
marquee:
  - ":p"
  - "hi"
  - "who up yearning for more"
socialLinks:
  - label: twitter
    url: ""
  - label: instagram
    url: ""
  - label: discord
    url: ""
  - label: carrd
    url: ""
---
```

### Sidebar Config (`content/config/sidebar.md`)

```yaml
---
avatar:  "/uploads/awesomenesss.png"   # Tina media upload
bio:
  - "20+she/they+certified cryptid"
  - "my diet is bad my sleep schedule is irregular and im chopped as fuck #sugoi"
  - "oh no oh no"
likes:
  - label: food
    value: noodle
  - label: music
    value: emo music!!
  - label: rn playing
    value: fields of mistria
---
```

### Static Pages (`content/config/pages/*.md`)

```yaml
---
heading:  "who am i, if not a reflection of all i love?"
list:
  - "if i was a season, id be autumn"
  - "my friends compare my likeness to that of a fox"
---

Body text as markdown.
```

---

## Tina Schema (overview)

`tina/config.ts` defines four collections:

| Collection | Path | Description |
|---|---|---|
| `posts` | `content/posts` | Blog entries, one file each |
| `siteConfig` | `content/config/site.md` | Title, subtitle, marquee, social links |
| `sidebarConfig` | `content/config/sidebar.md` | Profile bio, likes table |
| `pages` | `content/config/pages` | Home, about, bs content |

The non-technical user only needs to touch `posts` day-to-day. The other collections are for infrequent site-wide edits.

---

## CMS Editing Workflow

1. User visits `chuuball.github.io/admin`
2. Logs in via Tina Cloud (GitHub OAuth)
3. Picks "Blog Posts" → "New Post" or edits an existing one
4. Fills in fields → Save
5. Tina commits the `.md` file directly to `main`
6. GitHub Actions detects the push → builds Astro → deploys to GitHub Pages
7. Post is live in ~1–2 minutes

---

## Deployment Pipeline

```
push to main
  └─> GitHub Actions
        ├─ npm ci
        ├─ npm run build          (tinacms build + astro build → out/)
        └─> actions/deploy-pages  (deploys out/ to GitHub Pages)
```

**Branch:** Rename `master` → `main` as part of migration (convention, and avoids drift with GitHub Pages defaults).

Environment variables `TINA_PUBLIC_CLIENT_ID` and `TINA_TOKEN` are set as GitHub Actions secrets — Tina Cloud generates these when you register the site.

---

## Blog Index Page (`/blog`)

Each post renders as a `<BlogCard>` with:
- Date (formatted: "July 6, 2025")
- Tagline
- Snippet — first ~120 characters of the body, trimmed to a word boundary

Cards are sorted newest-first.

---

## URL Scheme

Blog post slugs are derived from the filename. Recommended filename convention: `YYYY-MM-DD-subtitle-slug.md` → URL becomes `/blog/2025-07-06-deez-nuts`. Date-first keeps files sorted chronologically in the filesystem, which is convenient.

---

## CSS Approach

- `global.css` holds: grid layout, typography, cursor, color palette as CSS custom properties (`--color-bg`, `--color-text`, etc.), and any rules shared across components
- Each `.astro` component has a `<style>` block for its own rules (Astro scopes these automatically — no class name collisions)
- No CSS framework, no utility classes — plain CSS throughout

---

## Migration Plan

1. Scaffold Astro project + Docker setup in repo
2. Convert `style.css` → `global.css` with CSS custom properties
3. Build `Layout.astro` from `index.html` — verify visual parity
4. Port home, about, bs into content files + pages
5. Extract each blog entry from `02blog.html` into individual `.md` files
6. Install and configure Tina CMS; write `tina/config.ts`
7. Connect Tina Cloud (create account, register site, add GitHub secrets)
8. Update GitHub Actions workflow for Astro build
9. Rename `master` → `main`
10. End-to-end test: write a post in Tina, verify it appears on the live site

---

## Resolved Decisions

| Question | Decision |
|---|---|
| Framework | Astro |
| CMS editing mode | Form-based (no visual overlay) |
| Dev environment | Docker |
| Per-post h1 | Editable field per post |
| Blog cards | Date + tagline + 120-char snippet |
| Marquee | Tina-managed (array in site config) |
| Branch | Rename master → main |
| URL scheme | Date-based slugs (`YYYY-MM-DD-title`) |
| CSS | Global file + per-component scoped `<style>` blocks |
| Social links | Leave blank for now (placeholders in Tina) |
| Avatar / banner | Tina media uploader — stored in `public/uploads/` |
| Blog post images | Optional per-post image via Tina media upload; no recurring default |
