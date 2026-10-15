# Umme Kulsum Suriya — Portfolio

Portfolio site for a UX/UI designer, with a small built-in CMS. Visitors browse
the home page, a projects archive and a dedicated case study page per project.
The owner manages projects, case studies, images, the profile and the resume
from a password-protected admin panel. Content is stored in MongoDB.

- **Public site:** home (hero, intro, resume, featured projects), `/projects`
  (all projects, filterable by category), `/projects/:slug` (case study), 404.
- **Admin panel:** `/admin` — create, edit, publish/unpublish, feature,
  reorder and delete projects; full case studies with screenshots; profile,
  contact details and resume; password change.
- **Resilient:** if the API or database is unreachable, the site still renders
  the built-in content from `src/data/`.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7, GSAP + ScrollTrigger, Lenis |
| Backend | Node.js ≥ 20.19, Express 5, Mongoose 9 (MongoDB, GridFS for images) |
| Hosting | Vercel (site + serverless API), or any Node host (`npm start`) |
| Quality | ESLint, Node's built-in test runner |

## Getting started

Requirements: **Node.js 20.19+** (22 LTS recommended) and a MongoDB database
(free MongoDB Atlas cluster or local MongoDB — see
**[DATABASE_SETUP.md](DATABASE_SETUP.md)**).

```bash
npm install
cp .env.example .env          # PowerShell: Copy-Item .env.example .env
# edit .env and set MONGODB_URI (see DATABASE_SETUP.md)

npm run db:check              # verify the connection
npm run db:init               # create collections and indexes
npm run db:seed               # import the current projects + resume
npm run admin:create          # create your admin login

npm run dev                   # site: http://localhost:5173  admin: http://localhost:5173/admin
```

`npm run dev` starts the Vite dev server and the API side by side (Vite proxies
`/api` to the API on port 5050 and the API restarts on changes). Without a
database the site still runs with the built-in content; the admin panel
explains what is missing.

### Production build

```bash
npm run build                 # builds the site into dist/
npm start                     # serves dist/ + the API on PORT (default 5050)
```

On Vercel, only `npm run build` runs — `vercel.json` routes `/api/*` to the
serverless function in `api/index.js`. See
[DATABASE_SETUP.md → Deployment](DATABASE_SETUP.md#6-deployment-configuration).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server + API with auto-restart |
| `npm run dev:client` / `npm run dev:api` | Only the frontend / only the API |
| `npm run build` | Production build into `dist/` |
| `npm start` | Production server (built site + API) |
| `npm run preview` | Preview `dist/` with Vite (proxies `/api` to a running API) |
| `npm run lint` | ESLint |
| `npm test` | Unit tests; API integration tests too when `TEST_MONGODB_URI` is set |
| `npm run db:check` | Test the MongoDB connection and show what the database contains |
| `npm run db:init` | Create collections and indexes (safe to re-run) |
| `npm run db:seed` | Import the built-in content (never overwrites) |
| `npm run db:seed:force` | Import and overwrite the seeded projects and profile |
| `npm run admin:create` | Create an admin account (interactive) |
| `npm run admin:reset` | Set a new password for an existing admin |

## Using the admin panel

Open **`/admin`** and sign in. There is no sign-up page; accounts are created
with `npm run admin:create` (details in DATABASE_SETUP.md).

- **Projects** — the list shows status and featured flags; publish/unpublish,
  feature, reorder (arrows), preview, edit or delete each project.
- **Project editor** — basics (title, URL slug, subtitle, category, accent
  colour, summary), cover image, details (role, client, timeline, tools, links)
  and the case study: overview, problem, goals, research, solution, key
  features, implementation process, screenshots and outcomes. Sections left
  empty are hidden on the public page. Separate paragraphs with a blank line.
  Outcomes that start with a number ("40% faster…") are shown as metrics.
  *Preview page* shows drafts on the real page; **Ctrl/⌘ + S** saves; leaving
  with unsaved changes asks for confirmation.
- **Images** — upload by clicking or dragging (resized in the browser to at
  most 2000 px and converted to WebP, stored in MongoDB), or paste an `https://`
  image URL. Uploads that are no longer used are deleted automatically.
- **Featured** — featured projects lead the home page in the list's order;
  when none are featured, the home page shows every published project. The
  `/projects` page always lists all published projects.
- **Profile & resume** — name, role, contact details (shown as links in the
  resume; the email powers the footer call to action), social links, about
  quote, experience, education, certifications, skills and tools.
- **Account** — change the password (signs out other devices).

Changes appear on the site on the next page load (within about 30 seconds on
Vercel because of edge caching).

## Project structure

```text
api/index.js            Vercel serverless entry (re-exports the Express app)
server/                 API
  app.js                Express app: security headers, routes, error handling
  index.js              Standalone server (API + built site) for npm start / dev
  config.js, env.js     Environment configuration (.env loading)
  db.js                 MongoDB connection (cached, serverless-friendly)
  models/               Project, Profile, Admin, Session, LoginAttempt schemas
  routes/               public.js, auth.js, admin.js
  middleware/           auth (sessions), security (headers, CSRF origin check), errors
  lib/                  passwords, sessions, rate limiting, images (GridFS), serializers
shared/                 Validation rules + input normalization used by API and admin UI
scripts/                CLI: dev runner, db:check, db:init, db:seed, admin:create
src/
  main.jsx, App.jsx, router.jsx   Entry and routes (pages are code-split)
  layouts/PublicLayout.jsx        Navbar, footer, background, cursor, smooth scrolling
  pages/                Home, Projects archive, Case study, 404, route error
  sections/             Home sections: Hero, Intro, Resume, ProjectIndex, Footer
  components/           Shared UI (cards, dialog, lightbox, loader, cursor, …)
  components/case-study/ Case study layout and blocks
  admin/                Admin panel (auth, layout, pages, form components)
  lib/                  API client, content loading + cache, smooth scrolling, intro
  data/                 Built-in fallback content (also the seed data)
  index.css             Design tokens and component classes
tests/                  Unit tests + API integration tests
public/images/projects/ Images used by the built-in projects
```

## Design system

- **Tokens** live in `src/index.css` (`@theme`): colours (`bg-*`, `neon-*`,
  `text-*`), fonts (`font-sans` Space Grotesk, `font-pixel` Press Start 2P) and
  easing.
- **Layout:** `container-page` (shared max width and gutters) and `section-y`
  (vertical rhythm) on every section; `eyebrow` for small uppercase labels.
- **Components:** `.btn` (+ `btn-primary`, `btn-secondary`, `btn-ghost`,
  `btn-danger`, `btn-sm`, `btn-icon`), `.input`, `.surface`, `.glass`,
  `.skeleton`.
- **Accents** (`src/utils/accents.js`): coloured chips use dark text, which
  meets WCAG AA contrast on every accent colour.
- **Motion:** GSAP for entrances and scroll effects, Lenis for smooth
  scrolling. Everything decorative is skipped when the OS asks for reduced
  motion (no intro loader, no custom cursor, no pinned scrolling, content
  visible immediately). Use `revealOnScroll()` from `src/animations/reveal.js`
  for new scroll reveals.

## Security

Admin accounts come only from the CLI. Passwords are hashed with scrypt.
Sessions are httpOnly, `SameSite=Strict` cookies backed by hashed tokens in
MongoDB, with expiry and sign-in rate limiting. Admin routes require the admin
role. State-changing requests must come from the site's own origin. Inputs are
validated and sanitized on the server, uploads are verified by content, and
responses carry security headers (including a Content-Security-Policy).
Secrets live only in environment variables. Full details are in
[DATABASE_SETUP.md → Security guidelines](DATABASE_SETUP.md#7-security-guidelines).

The CSP is defined twice — `server/middleware/security.js` (for `npm start`)
and `vercel.json` (for Vercel). Keep both in sync if you add external scripts,
fonts or embeds.

## Testing

```bash
npm run lint
npm test
```

`npm test` runs the unit tests. To also run the API integration tests (sign-in,
sessions, CSRF checks, validation, uploads, publishing, rate limiting), point
`TEST_MONGODB_URI` at a **disposable** database (it is wiped):

```bash
TEST_MONGODB_URI="mongodb://127.0.0.1:27017" npm test
# PowerShell: $env:TEST_MONGODB_URI="mongodb://127.0.0.1:27017"; npm test
```

## Content to review

Some of the original hard-coded content is still in the seed data and should be
checked in *Admin → Profile & resume*:

- **Resume entries** (experience, education, certifications, the "About me"
  quote) were carried over from the earlier template and may not be yours.
- **Project metrics** (e.g. "200K+ downloads") are the original placeholder
  texts — replace them with real outcomes.

The email (`kulsumsuraiya44@gmail.com`) and LinkedIn URL in the seed data are
confirmed. The phone number and website come from an earlier draft.

The seed data only matters until the database has content: once the profile is
saved in the admin panel (or imported with `npm run db:seed`), the site shows
the database version.
