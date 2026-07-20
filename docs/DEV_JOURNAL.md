# Developer Journal — AI Portfolio

A behind-the-scenes log of how this portfolio was built.

It is two complementary projects, each demonstrating a different way of working
with AI:

- **AI-as-Copilot** — the [Fund Portfolio Dashboard](https://ai-portfolio-project1.vercel.app):
  I drive the architecture and design, using AI to accelerate the build.
- **AI-as-Agent** — this Microfrontend shell (kilianmc.com): built through a real
  GitHub loop where I write the specs and review, while coding agents implement
  each ticket as a pull request that I test and merge.

The sessions below track that work in order — from the first dashboard mockup to
the microfrontend architecture, CI, and dev→prod deployment.

---

## Session 1

The starting point — an initial dashboard mockup generated with AI to have a
concrete base to iterate from, rather than starting from a blank page:

![Initial AI-generated dashboard mockup](/journal/image.png)

From here it was manual work: adjusting the mockup to match what I actually
wanted before porting it into a real component-based React app.

## Session 2

### Task 1 — Split CSS into per-component files

The project started with a single monolithic `src/index.css` (185 lines) holding every
rule for every component. Goal: move each block of CSS into a file next to the component
it styles.

#### Step 1.1 — Survey the codebase

- Listed `src/` and read `index.css`, `main.jsx`, `App.jsx`, and all five components
  (`TopBar`, `OverviewCard`, `PerformanceCard`, `HoldingsCard`, `AllocationCard`).
- Mapped each CSS class to the component that consumes it.

#### Step 1.2 — Decide what stays global vs. per-component

- **Global (kept in `index.css`):** design tokens (`:root`), reset, `html/body`, `.app`,
  `.grid`, and the shared `.card` shell (`.card`, `.card-head`, `.card-title`, `.card-sub`).
- **Per-component:** everything specific to one card.
- Responsive `@media` rules were distributed to the component they target; global layout
  breakpoints (`.app`, `.grid`, `.card`) stayed in `index.css`.

#### Step 1.3 — Create component CSS files

Created:

- `src/components/TopBar.css`
- `src/components/PerformanceCard.css`
- `src/components/OverviewCard.css`
- `src/components/HoldingsCard.css`
- `src/components/AllocationCard.css`

#### Step 1.4 — Wire up imports

- Trimmed `index.css` down to global/shared styles only.
- Added `import './<Component>.css'` to each component `.jsx`.

---

### Task 2 — Adopt SCSS with reusable variables & mixins

Goal: convert the stylesheets to SCSS and centralize shared values/patterns.

#### Step 2.1 — Install tooling

- `npm install -D sass`.

#### Step 2.2 — Create shared partials

- `src/styles/_variables.scss` — design tokens as SCSS variables (colors, radii, shadows,
  breakpoints, font stack).
- `src/styles/_mixins.scss` — reusable mixins:
  - `flex($align, $justify, $gap)` — the repeated flexbox pattern.
  - `mobile` / `tablet` / `desktop` — responsive breakpoint wrappers.
  - `uppercase-label($color)` — shared by KPI labels and table headers.
  - `inset-panel` — soft KPI tile background.

#### Step 2.3 — Convert every stylesheet to SCSS

- `index.css` → `index.scss` (global reset, `.app`, `.grid`, `.card` shell).
- Each component `.css` → `.scss`, using `@use` on the shared partials, nested rules,
  and the breakpoint mixins (media queries co-located with their component).

#### Step 2.4 — Update imports & clean up

- Switched all `import './x.css'` → `import './x.scss'` (incl. `main.jsx`).
- Deleted the six old `.css` files.

#### Step 2.5 — Verify & polish

- `npm run build` succeeded; output CSS identical in intent.
- Added `css.preprocessorOptions.scss.api = 'modern-compiler'` to `vite.config.js`
  (forward-compatible; only takes effect on Vite 5+).

---

### Task 3 — Dark mode + topbar toggle

Goal: add a dark theme and a button in the topbar to switch between light and dark.

#### Step 3.1 — Rework tokens for runtime theming

- Realized compile-time SCSS variables can't switch at runtime, so:
  - `_variables.scss`: themed tokens now point at CSS custom properties
    (`$ink: var(--ink)`, etc.); static tokens (radii, breakpoints, font) stay literal.
  - `index.scss`: light palette defined in `:root`, dark palette in `[data-theme='dark']`.
  - All existing component SCSS kept working unchanged.

#### Step 3.2 — Themeable surfaces

- Converted the last hardcoded light backgrounds to tokens: `$seg-bg`, `$seg-active-bg`
  (segmented control), `$track` (allocation bar), `$panel` (KPI tiles via `inset-panel`).
- Added smooth color transitions on `body` and `.card`.

#### Step 3.3 — Theme state

- Created `src/theme/ThemeContext.jsx`: `ThemeProvider` + `useTheme()` hook.
  - Initializes from `localStorage`, falls back to OS `prefers-color-scheme`.
  - Persists choice and sets `data-theme` on `<html>`.
- Wrapped `<App>` in `<ThemeProvider>` in `main.jsx`.

#### Step 3.4 — Toggle button

- Added a 🌙/☀️ toggle in the topbar (`TopBar.jsx`), with accessible labels.
- Styled `.theme-toggle` in `TopBar.scss` (circular button, hover lift).

#### Step 3.5 — Theme-aware charts

- `PerformanceCard.jsx`: gridline color now varies by theme via `makeOptions(theme)`.
- `AllocationCard.jsx`: donut segment borders match the card background via `makeData(theme)`.
- Brand accent colors (blue/green/red) brightened slightly in dark mode for contrast.

#### Step 3.6 — Verify

- `npm run build` succeeded (49 modules).
- Dev server booted cleanly on Vite 4.
- **Known cosmetic issue:** Sass `legacy-js-api` deprecation warnings still print because
  Vite 4 uses Sass's legacy JS API; the `modern-compiler` option only applies on Vite 5+.
  Build output is correct.

---

## Project structure after this session

```text
src/
├── App.jsx
├── main.jsx                      # wraps App in <ThemeProvider>, imports index.scss
├── index.scss                    # tokens (:root + [data-theme='dark']), reset, .app/.grid/.card
├── chartSetup.js
├── data/portfolio.js
├── styles/
│   ├── _variables.scss           # SCSS tokens → CSS custom properties
│   └── _mixins.scss              # flex, breakpoints, uppercase-label, inset-panel
├── theme/
│   └── ThemeContext.jsx          # ThemeProvider + useTheme()
└── components/
    ├── TopBar.jsx / .scss        # + theme toggle
    ├── PerformanceCard.jsx / .scss
    ├── OverviewCard.jsx / .scss
    ├── HoldingsCard.jsx / .scss
    └── AllocationCard.jsx / .scss
```

![Fund portfolio v3](/journal/v3.png)

### Task 4

Updated node to v23 , updated vite & the pluguin for react.

The Sass legacy-js-api warning flood is gone (Vite 8 now honors api: 'modern-compiler'), and the build is faster and smaller.

### Task 5

switch hover of darkmode button to show border instead of moving it.

## Session 3

Iterated on the dashboard's data density and readability — scroll affordances,
an equity/income asset mix, richer KPIs, and a cleaner holdings/allocation layout.

### Task 1 — Scroll hint on the Holdings table

Goal: signal that rows are hidden below the fold and the table scrolls.

- Wrapped `.table-scroll` in a positioned `.table-wrap` (`HoldingsCard.jsx`).
- Added a `::after` bottom fade gradient (`transparent → $card`, `pointer-events: none`)
  so the last visible rows fade into the card — CSS-only, no JS scroll listener.

### Task 2 — Allocation legend: more space + matching fade

Goal: give the donut legend more room and the same scroll cue as Holdings.

- Raised legend `max-height` 240 → 300px so ~6–7 of the 10 funds show before scrolling.
- Wrapped `.donut-legend` in `.legend-wrap` with the same `::after` fade.
- **Bug fix:** initial `align-self: stretch` made the wrapper taller than the legend
  (the layout fills the card height), pushing `bottom: 0` into empty space so the fade
  was invisible. Removed it — the wrapper now hugs the legend and the fade lands correctly.

### Task 3 — Equity vs. income asset mix

Goal: show what share of the portfolio is equity vs. income.

- Added a `type: 'equity' | 'income'` field to every fund in `data/portfolio.js`, plus
  derived `EQUITY_PCT` / `INCOME_PCT` (summed from allocations).
- Built a labeled stacked split bar (blue = equity, green = income).
- First placed it under the Overview KPIs, then **moved it to the bottom of the
  Allocation card** (with a `border-top` divider) at the card's request.

### Task 4 — Yearly return on the Total Portfolio Value KPI

Goal: mirror Today's Return (value + chip) on the total-value tile.

- Added `YTD_RETURN_PCT` (14.8), rebuilt `YTD_RETURN` from it, and derived `YTD_GAIN`
  (euro gain implied by growing the value from its start-of-year base).
- Rendered a green chip: `▲ +€54,894 · +14.8% YTD`.

### Task 5 — Type column in the Holdings table

- Added a **Type** column (2nd) with a rounded pill badge — "Equity" (blue dot) /
  "Income" (green dot), matching the asset-mix colors.
- Widened table `min-width` 440 → 520px for the extra column.

### Task 6 — Type indicator in the donut legend

- Added a small square marker per legend row (blue = equity, green = income), **no text**,
  with a `title` tooltip for accessibility.

### Task 7 — Percentages on donut segments

- Wrote an inline Chart.js plugin `arcLabels` that draws each fund's allocation % centered
  on its arc (via `arc.getCenterPoint()`) — no new dependency; registered via the `plugins` prop.
- Removed the `%` from the hover tooltip (now shows just the fund name).
- Labels on slices `< 5%` are hidden to avoid crowding the thin arcs.

### Task 8 — Removed allocation bars from Holdings

- Dropped the `.alloc-track` / `.alloc-fill` micro-bar; the Allocation column now shows the
  plain `%` value. Deleted the now-unused `.alloc-bar/.alloc-track/.alloc-fill` styles.
- Centered the **Type** and **Allocation** columns (header + cells).

### Task 9 — Overview KPI refresh

- Removed the standalone **YTD Return** KPI (the figure still lives in the total-value chip).
- Added three new KPIs to refill the 2×3 grid:
  - **Best Performer (YTD)** — top fund by `ytd` (`BEST_PERFORMER`), with a green chip.
  - **vs. Benchmark (12M)** — portfolio outperformance in points, from `perfData['12m']`.
  - **Est. Annual Income** — `Σ value × yield` across **all** funds (`EST_ANNUAL_INCOME`).

### Task 10 — Dividend yield data

- Added a `yield` field to each fund to back the income projection.
- Set equity yields to the 6–9% range (income funds left at ~2.7–3.6%), lifting
  Est. Annual Income to ≈ €26,700.

## Session 4

### Task 11 — Animated demo of the end result

![Fund portfolio dashboard demo](/journal/demo.gif)

- Captured a scripted tour of the running app (`http://localhost:5173/`) and encoded it
  as an animated GIF via Playwright (`channel: 'chrome'`, so no browser download), screenshots each state, and encodes the frames with the pure-JS `pngjs` (decode) + `gifenc` (quantize/encode) libraries.
- The tour, at a 1440px desktop viewport (real 2-column layout) with full-page screenshots:
  1. landing view, 2. cycle the Performance range toggle (12M / 3Y / 5Y / All),
  2. switch to dark mode, 4. ranges in dark mode, 5. back to light,
  3. **scroll the Holdings table** through all 10 funds and back (sticky header stays pinned).
- Embedded in the [README](README.md#demo) and here.

## Session 5 — Phase 2: AI-as-Agent foundation

With Project 1 (the fund dashboard) feature-complete, the portfolio moved into
its second collaboration model: **AI-as-Agent**, where work is specified as
tickets and implemented by agents that open focused, reviewable PRs. This
session set up the shared engineering bar across **both** repos
(`fund-dashboard` and the new `portfolio-shell` host).

### Task 1 — Repo foundations (both repos)

- Added a `CLAUDE.md` to each repo — agent-facing conventions (stack, structure,
  Module Federation contract, commands, Git/PR rules).
- Added GitHub **PR and issue templates** so every change is described and linked
  to an issue.
- Standardized **ESLint + Prettier** (flat config) across both repos with matching
  rules, plus `format` / `format:check` and `lint` / `lint:fix` scripts.
- Added **GitHub Actions CI** — a single `lint-build` job that runs
  lint → (typecheck, shell only) → format:check → test:run → build on every PR.
- Wired up **Vitest** + React Testing Library (jsdom) in both repos with a
  co-located `*.test.*` convention.
- Protected **`main`** in both repos with branch rulesets requiring a PR and a
  green `lint-build` check before merge.

## Session 6 — DP1: dev→prod deployment flow

### Task 1 — Two-branch dev→prod model (both repos)

- Introduced long-lived **`dev`** (integration) and **`main`** (production)
  branches. Feature PRs target `dev`; `main` only ever receives `dev`→`main`
  promotion PRs that Kilian merges after testing the dev deploy.
- Extended the branch rulesets to **`dev`** as well, so both branches gate on a
  PR + green `lint-build`.
- Configured **per-environment Vercel deploys**: `dev` auto-deploys to a stable
  dev URL, `main` deploys to production; feature branches get preview deploys.
- Wired the **Module Federation remote per-environment** — the shell host reads
  `VITE_FUND_REMOTE_URL` per Vercel scope, so the dev shell loads the dev remote
  and the prod shell loads the prod remote.

### Task 2 — Versioning convention

- Baseline **production = 1.0.0**. Each dev iteration bumps the **minor**
  (`npm run version:dev`); each production release bumps the **major** and resets
  the minor (`npm run version:release`). Dev carries the in-progress minors;
  production carries whole majors.

### Task 3 — Vercel reality check (the messy part)

Wiring the flow surfaced two real infra gotchas the agent had to diagnose live:

- The **`fund-dashboard` Vercel project had lost its Git connection**, so it had
  silently stopped deploying — every push since was ignored. Reconnecting it (and
  confirming via a throwaway branch that the webhook fired) restored deploys.
- **Vercel Deployment Protection** was SSO-gating all non-production deploys, so
  the dev remote's `remoteEntry.js` returned a `302 → login` — the dev shell
  could never load it cross-origin. Disabling it for previews on both projects
  fixed the per-environment remote loading. Verified end-to-end that the dev
  shell loads the **dev** remote and prod loads **prod**.

## Session 7 — Shell refactors (SR1 / SR2) + analytics

The `portfolio-shell` host was scaffolded quickly; these two tickets brought it
up to the same rigor as the fund dashboard — while keeping a deliberate contrast
between the two projects.

### SR1 — Shell CSS → SASS

- Migrated the shell's styling from plain CSS to **SCSS**, mirroring the
  fund-dashboard setup: a global entry plus per-component `.scss` files and shared
  `styles/_variables` / `_mixins` partials. Shell design tokens are namespaced
  (`--sh-*`) so a later-loaded remote can never clobber the host theme.

### SR2 — Shell → TypeScript (strict)

- Migrated the whole shell to **TypeScript with `strict: true`**
  (`tsc --noEmit` enforced in CI). Component props, data models, and event/ref
  handlers are typed; the federated remote is typed locally via
  `src/types/remotes.d.ts` (the remote ships no federated types — `dts: false`).
- **`fund-dashboard` intentionally stays plain JS** — it is the fast/simple
  copilot-style project, so the two repos form a deliberate contrast in
  engineering approach (typed, rigorous host vs. quick JS remote).

### Task — Vercel Web Analytics (shell)

- Added **Vercel Web Analytics** to the shell (`@vercel/analytics`) to capture
  traffic on the landing site.

The result — the finished portfolio host, typed and styled, with the fund
dashboard loaded as a remote and this journal reachable from the nav:

![The finished portfolio site (kilianmc.com)](/journal/site.png)

> This journal now lives in `portfolio-shell` and is rendered on the site under
> **Dev Journal**. It keeps being updated as the portfolio evolves.
