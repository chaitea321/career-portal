# Career Portal — Agent Instructions

## Quick Start
```bash
npm run dev        # serve on :3000
npm test           # run full suite (node --test, 115 tests)
npm run lint       # ESLint rules in .eslintrc.json
npm run build      # lint + test, then copy to ../dist/
```

## Architecture
Vanilla JS + CSS static site. **No build step** — `npm run build` just copies files to `../dist/`. Deployed to Cloudflare Pages via GitHub Actions (`.github/workflows/pages.yml`), which runs `npm test` then deploys the root directory.

### Entry points
- `index.html` — main terminal UI (`js/terminal.js`)
- `project-explorer.html` — card grid with filters/search
- `dashboard.html` — live metrics gauges (reads `config/minecraft-stats.json`)
- `writeups.html` — technical articles with tag filtering
- `contact.html` — contact form (posts to Azure Function)
- `offline.html` — PWA fallback page

### JS modules (`js/`)
| Module | Role |
|--------|------|
| `terminal.js` | Main controller — 28 commands, command palette (Ctrl+K), demo mode, achievements |
| `project-catalog.js` | Project metadata (5 projects). `COMMAND_COUNT` derived from `helpers.js` |
| `meshwatch-api.js` | GitHub OAuth PKCE + Azure Functions proxy for Prometheus metrics |
| `ai-assistant.js` | Ollama Phi-3 via Tailscale; cached knowledge fallback with keyword matching |
| `contact-api.js` | Contact form client — POSTs to `/api/contact`, falls back to mailto: |
| `achievements.js` | 10 unlockable badges, localStorage persistence |
| `audio.js` | Web Audio API keystroke sounds, WAV tone generation |
| `performance.js` | Navigation Timing API metrics (TTFB, DCL, FullLoad) |
| `visual-effects.js` | *(removed)* |
| `service-worker.js` | PWA offline cache (v6), fetch-first strategy with offline.html fallback |
| `pwa.js` | Service worker registration + online/offline status indicator |
| `utils/helpers.js` | `escapeHtml`, `normalizeSlug`, `validateUrl`, `COMMAND_ICONS`, `COMMAND_DESCS`, `COMMAND_COUNT`, `SKILLS_DATA`, `PERF_THRESHOLDS`, `gradePerf`, `computeOverallGrade` |

### Azure Functions (`azure-functions/`)
- `portfolio-contact/func.js` — Contact form handler (Resend API, falls back to console log)
- Other function stubs referenced in README but not yet implemented

### Config files
- `config/career-fair.json` — demo mode settings, AI assistant config, mock data
- `config/minecraft-stats.json` — updated every 10 min by cron job
- `_headers` — Cloudflare Pages cache headers (31536000s static assets, 600s config)

## Gotchas
- **No build step** — files are copied as-is. Do not add a bundler or transpiler.
- **ESLint ignores `js/terminal.js`** — the `.eslintignore` comment cites ESLint v6 but the package uses v8. The ignore is kept because terminal.js has import+comment patterns that trigger known ESLint parse bugs. If you fix it, update both files.
- **Tests use Node.js native test runner** (`node --test`). No mocha/jest. Tests mock DOM via JSDOM-like assertions — they run in pure Node.
- **`terminal.js` self-instantiates at module bottom** — `new Terminal()` runs on import. Test files that import it get a live instance; use `before()` hooks to manage state.
- **Theme persistence** — terminal saves `portfolio-theme` to localStorage; other pages read it on load. Never edit `localStorage` directly in tests.
- **`COMMAND_COUNT` in helpers.js** is derived from `Object.keys(COMMAND_ICONS).length`. Do not hardcode a number elsewhere — any new command added to `COMMAND_ICONS` automatically updates the count.
- **Service worker cache name** is `career-portal-v6`. New pages/assets must be added to `ASSETS_TO_CACHE` in `js/service-worker.js`.
- **Google Fonts URL** uses `css2?family=` path (not `css?family=`). All HTML files share this.
- **Azure Functions** require `RESEND_API_KEY` and `RECIPIENT_EMAIL` env vars. Without them, the contact function logs to console and returns success (career-fair offline mode).

## Testing
```bash
npm test                    # run all
node --test tests/terminal.mjs   # single file
```
Tests live in `tests/*.mjs`. Each exports a `describe` block. New features need new tests in the matching file. 115 tests, 0 failures.

## Deployment
- **Local**: `npm run dev` → http://localhost:3000
- **Cloudflare Pages**: push to `master` → GitHub Actions runs `npm test` then deploys root dir via `cloudflare/pages-action@v1`
- **Azure Functions**: deploy `azure-functions/` folder separately with Azure CLI; requires `.env` for API keys

## Style Conventions
- Single quotes, semicolons, 2-space indent (enforced by ESLint)
- ES modules only (`"type": "module"` in package.json)
- No framework — vanilla JS, inline scripts in HTML pages are OK
- All user-facing text goes through `escapeHtml()` before any `innerHTML` assignment
- CSS custom properties for theming (`--neon-*`, `--bg-*`). Retro theme overrides via `body.theme-retro`
