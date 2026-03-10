# CLAUDE.md — AI Assistant Guide for mon-portfolio-react

This file provides context for AI assistants working on this codebase.

## Project Overview

**mon-portfolio-react** is a French-language developer portfolio for Malik El Boazzati, a freelance developer specializing in Flutter (mobile), Node.js/FastAPI (backend), and AI integrations. The site is designed to maximize lead conversion via three funnels: Calendly booking, a contact form, and an AI chatbot.

**Live stack:** React 18 (Vite + SWC) + Express.js + PostgreSQL (Prisma) + OpenAI GPT-4

---

## Repository Structure

```
mon-portfolio-react/
├── src/                          # React frontend
│   ├── components/               # All React components (JSX)
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   ├── styles/                   # Component-specific CSS files
│   ├── assets/                   # Images and static assets
│   ├── App.jsx                   # Root component, global state
│   ├── main.jsx                  # React entry point (StrictMode)
│   ├── index.css                 # Global styles (Tailwind base + components)
│   └── App.css                   # App-level custom CSS
├── server/                       # Backend server utilities
├── prisma/
│   ├── schema.prisma             # Database schema (PostgreSQL)
│   └── migrations/               # Prisma migration files
├── public/                       # Static public assets
├── api/                          # API function modules
├── lib/                          # Shared library code
├── server.js                     # Express.js API server (port 3001)
├── createLead.js                 # Prisma lead creation helper
├── prismaClient.js               # Prisma singleton client
├── index.html                    # HTML template with SEO + Schema.org
├── vite.config.js                # Vite build config (proxy /api → :3001)
├── tailwind.config.js            # Tailwind theme extensions
├── postcss.config.cjs            # PostCSS config
├── eslint.config.js              # ESLint rules
├── docker-compose.yml            # Docker setup
├── Procfile                      # Heroku deployment
├── .env.example                  # Required environment variables
└── README.md                     # French project docs
```

---

## Development Workflows

### Running the Project

```bash
# Frontend only (port 5173)
npm run dev

# Frontend + API together (recommended)
npm run dev:full

# API server only (port 3001)
npm run api

# Production build
npm run build

# Preview production build
npm run preview

# Linting (zero warnings policy)
npm run lint
```

### Environment Setup

Copy `.env.example` to `.env` and fill in all variables:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `OPENAI_API_KEY` — OpenAI API key for the chatbot
- `API_SECRET` — Server-side secret for `/api/leads` admin endpoints

### Database

```bash
# Run migrations
npx prisma migrate dev

# Open Prisma Studio (GUI)
npx prisma studio

# Generate client after schema changes
npx prisma generate
```

### Linting

```bash
npm run lint
```

ESLint is configured with zero-warnings policy (`--max-warnings 0`). Fix all warnings before committing.

---

## Architecture

### Frontend (React SPA)

Single-page app with **scroll-based navigation** — no React Router. Sections are identified by `id` attributes and navigated via `scrollIntoView()`.

**Section IDs (in order):** `home`, `about`, `skills`, `projects`, `ia-section`

**Component tree:**
```
App.jsx (global state)
├── Navigation (fixed glassmorphic navbar, scroll-aware)
├── Header (hero, dark mode toggle, CTA buttons)
│   ├── CalendlyPopup (modal)
│   └── ContactForm (modal)
├── About
├── Skills (animated progress bars, IntersectionObserver)
├── Projects (3-card grid)
├── IASection (services + 4-step process timeline)
├── IABot (floating chat widget, bottom-right)
└── CalendlyListener (invisible, auto-creates lead on booking)
```

**Global state in `App.jsx`:**
- `isIABotOpen` — chat widget visibility
- `activeSection` — current scroll section
- `showNavbar` — navbar visibility (shows after 100px scroll)
- `isMobileMenuOpen` — mobile hamburger menu

### Backend (Express.js)

Located in `server.js` (root). Runs on port 3001.

**API Endpoints:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/leads` | `X-API-SECRET` header | Create a new lead |
| GET | `/api/leads` | `?secret=` query param | Fetch all leads (admin) |
| GET | `/api/health` | None | Health check |
| POST | `/api/ai/chat` | None | OpenAI GPT-4 streaming chat |

**Rate limiting:** 10 requests/minute per IP (in-memory, resets on restart).

**AI Chat:** GPT-4 streaming with a `createLead` function tool — the chatbot can collect lead data during conversation and save it to the database automatically.

### Database (Prisma + PostgreSQL)

**Lead model fields:**
- `id`, `createdAt` — auto-generated
- `email` — required, validated
- `name` — from form or chatbot
- `message` — project description
- `platforms` — string (comma-separated, converted from array)
- `features` — requested features
- `budget` — project budget range
- `deadline` — timeline
- `aiNeeds` — AI requirements
- `variant` — lead source tag
- `source` — channel (form/chatbot/calendly)

---

## Key Conventions

### Code Style

- **Language:** JSX (`.jsx` extension) for all React components — no TypeScript
- **Modules:** ES modules (`type: "module"` in package.json), use `import`/`export`
- **Styling:** Tailwind CSS utility classes as primary approach; minimal custom CSS
- **Animations:** Framer Motion for all interactive animations
- **No global state library** — use local state and prop drilling (no Redux/Context needed at this scale)

### Styling Conventions

- Dark mode is toggled via the `dark` class on `<html>`, persisted in `localStorage`
- Use Tailwind's `dark:` prefix for dark mode variants
- Custom colors defined in `tailwind.config.js`:
  - `primary-*` → blue palette (base: `#0ea5e9`)
  - `secondary-*` → purple palette (base: `#8b5cf6`)
- Custom fonts: `font-sans` → Montserrat, `font-display` → Poppins
- Custom animation: `animate-float` (vertical oscillation)

### Component Patterns

- Functional components only, with hooks
- `useTheme()` hook for dark/light mode (returns `{ theme, toggleTheme }`)
- `useInView()` from `react-intersection-observer` for scroll-triggered animations
- Animation pattern:
  ```jsx
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 30 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.6 }}
  />
  ```

### Lead Creation

All lead submissions go through `src/utils/postLead.js`. The function sends to `/api/leads` with the `X-API-SECRET` header. Platform fields that come in as arrays are converted to comma-separated strings before sending.

The server validates email format and truncates fields to 2000 characters.

### UI Language

All visible UI text is in **French**. When adding new UI copy, write in French. Code comments can be in English.

---

## Conversion Funnels

The portfolio has three lead capture mechanisms — preserve all three:

1. **Calendly Booking** — CTA in Header → `CalendlyPopup` modal → `CalendlyListener` auto-creates lead on `calendly.event_scheduled` event
2. **Contact Form** — CTA in Header → `ContactForm` modal → `POST /api/leads`
3. **AI Chatbot** — `IABot` floating widget → guided questions → GPT-4 calls `createLead` tool → `POST /api/leads`

---

## SEO

`index.html` includes:
- Full Open Graph meta tags (`og:type`, `og:image`, `og:locale fr_FR`)
- Twitter card (`summary_large_image`)
- Schema.org `Person` structured data (JSON-LD)
- Google Fonts preconnect hints
- French language declaration (`lang="fr"`)

Do not remove or simplify these — they are critical for search visibility.

---

## Security Notes

- Never hardcode `API_SECRET` or `OPENAI_API_KEY` — always use environment variables
- The `/api/leads` GET endpoint requires the secret to prevent public data exposure
- Rate limiting is in-memory; for production, use Redis-backed rate limiting
- Admin endpoints have no authentication beyond the shared secret — do not expose sensitive data

---

## External Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| **OpenAI GPT-4** | AI chatbot responses (streaming) | `OPENAI_API_KEY` env var |
| **Calendly** | Calendar booking popup | URL hardcoded in `Header.jsx` |
| **Prisma** | Database ORM | `DATABASE_URL` env var |

---

## Testing

No automated test framework is configured. The linter (`npm run lint`) is the main quality gate. When adding features:
- Run `npm run lint` and fix all warnings before committing
- Test all three lead funnels manually in development
- Verify dark mode toggle works correctly
- Check mobile responsiveness at `sm` (640px), `md` (768px), `lg` (1024px) breakpoints

---

## Deployment

**Frontend:** Deployable to Vercel or Netlify (static build via `npm run build`)

**Backend:** Requires a Node.js service (Heroku via `Procfile`, Railway, Render, etc.)

**Required at deployment:**
1. Set all env vars from `.env.example`
2. Provision PostgreSQL database
3. Run `npx prisma migrate deploy`
4. The frontend build proxy (`/api/*` → `:3001`) is dev-only — in production, set the API base URL appropriately

**Heroku specifics:**
- `Procfile`: `web: node server.js`
- `heroku-postbuild` script runs `vite build` automatically
- `node >= 18.0.0` required (see `engines` in `package.json`)

---

## Common Tasks

### Add a new section

1. Create `src/components/NewSection.jsx`
2. Add the section `id` to the nav items array in `App.jsx`
3. Import and render `<NewSection />` in `App.jsx` between existing sections
4. Add scroll detection in `handleScroll()` in `App.jsx`

### Add a new lead field

1. Update `prisma/schema.prisma` — add field to `Lead` model
2. Run `npx prisma migrate dev --name add-field-name`
3. Update `createLead.js` — handle the new field in the mapping
4. Update `ContactForm.jsx` — add form input and validation
5. Update `src/utils/postLead.js` — include the field in the payload

### Modify the AI chatbot system prompt

Edit the system prompt in `server.js` inside the `/api/ai/chat` handler. The prompt instructs GPT-4 to act as a portfolio assistant and defines when to call the `createLead` function.

### Add a new project card

Edit `src/components/Projects.jsx`. The projects are stored as an array of objects with: `title`, `description`, `tags`, `image`, `metrics`, and `link` fields. Add to the array — no backend needed.
