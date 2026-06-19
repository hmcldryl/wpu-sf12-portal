# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

WPU SF-12 Portal — Next.js (App Router, TypeScript) app for Western Philippines
University. Respondents complete a 12-item SF-12v1 health survey and get an
immediate PCS-12/MCS-12 score. An admin dashboard at `/dashboard` shows
aggregate stats and exports.

## Commands

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build — also runs TypeScript typecheck
npm run lint     # eslint
```

No test suite exists. After changing `lib/sf12Scoring.ts`, run `npm run dev`
and check the console for `[sf12Scoring self-test] FAILED` — the self-test
runs automatically in non-production builds.

## Architecture

### Scoring (`lib/sf12Scoring.ts`)
`SF12_LOOKUP` maps each question (Q1–Q12) and raw response value to
`[physicalDelta, mentalDelta]` pairs. Coefficients are verified against
orthotoolkit.com/sf-12/ and sourced from Ware et al. (1996),
doi:10.1097/00005650-199603000-00003. `computeSF12Scores(responses)` sums
these and adds `PCS_CONSTANT` (56.57706) / `MCS_CONSTANT` (60.75781).
**Do not change these constants or lookup values.**
Q9–Q11 use 6 response options (1=All … 6=None, includes "A Good Bit of the
time" as value 3). Q12 uses 5 options. The best-health anchor ([0, 0]) differs
per question — e.g. Q1→1, Q2→3, Q9→1, Q11→6, Q12→5 — the self-test finds
this dynamically.

### Respondent info (`lib/types.ts`, `lib/respondentOptions.ts`)
`RespondentInfo`/`SF12Response` hold no PII (no name/employee ID) — fields are
college/unit, campus/station, age group (nominal bracket), sex at birth,
gender, employment type (Faculty/Staff), academic rank (Faculty only),
employment status (Permanent/COS/Job Order), salary grade, and walkable-spaces
availability (Yes/No). Dropdown option lists live in `lib/respondentOptions.ts`
— college/unit and campus include an "Other" choice with free-text fallback.
Changing these fields cascades to `app/api/submit/route.ts`, `gas/Code.gs`
(sheet columns), `lib/dashboardUtils.ts` (`CSV_HEADERS`/`formatForCSV`), and
the data-fetch mappings in `app/dashboard/page.tsx`,
`app/api/dashboard/responses/route.ts`, `app/api/export/csv/route.ts`, and
`app/api/export/pdf/route.tsx` (all map raw Firestore docs to `SF12Response`).

### Question flow (`lib/sf12Questions.ts`, `components/AssessmentForm.tsx`)
`SF12_STEPS` is an ordered array of question groups (Q4+Q5 and Q6+Q7 are each
grouped into one step with a shared preamble). `AssessmentForm` is a client
component driving a single-page wizard: step 0 is respondent details, steps
1–10 are `SF12_STEPS`, the last step is review/submit. On submit it computes
scores client-side, POSTs to `/api/submit`, stashes the result in
`sessionStorage` (`sf12_result`), and routes to `/results` (which reads from
`sessionStorage` — there's no server-side results lookup).

### Data layer
- `lib/firebase.ts` — client SDK (uses `NEXT_PUBLIC_FIREBASE_*` env vars), unused server-side.
- `lib/firebaseAdmin.ts` — Admin SDK (`FIREBASE_ADMIN_*` env vars), used by all
  API routes and the dashboard server component. `getAdminDb()` lazily
  initializes a singleton app.
- All responses live in the Firestore `sf12_responses` collection. Shape is
  defined by `SF12Response` in `lib/types.ts`.
- `app/api/submit/route.ts` writes to Firestore, then best-effort POSTs the
  same payload to `GAS_WEBHOOK_URL` (Google Apps Script, see `gas/Code.gs`)
  which appends a row to a Google Sheet. GAS failure does not fail the request.

### Dashboard auth (`middleware.ts`, `lib/session.ts`)
No user accounts — single shared `DASHBOARD_PASSWORD`. `lib/session.ts` signs
an HS256 JWT (via `jose`) using `DASHBOARD_PASSWORD` as the secret, stored in
an `httpOnly` cookie `dashboard_session` (8h expiry). `middleware.ts` guards
`/dashboard/*`, `/api/dashboard/*`, and `/api/export/*` (except
`/dashboard/login` and `POST /api/dashboard/auth`), redirecting to
`/dashboard/login` (or returning 401 for `/api/*`) if the cookie is missing/invalid.

### Dashboard (`app/dashboard/page.tsx`)
Server component — must keep `export const dynamic = "force-dynamic"` (it
fetches Firestore directly via `getAdminDb()`, not through
`/api/dashboard/responses`; without this it'd be statically prerendered with
stale/empty data). All stats derive from `lib/dashboardUtils.ts`:
- `getScoreBand` — Above Average (≥55) / Average (45–54.9) / Below Average (<45)
- `computeSummaryStats` — totals, means, SDs, below-average counts
- `getScoreDistribution` — band counts/percentages for PCS or MCS
- `getHealthOverview` / `categorizeHealth` — cross-tabs PCS and MCS into
  Healthy / Physical Concern / Mental Concern / Combined Concern (used by
  `HealthOverview` donut + quadrant scatter)
- `groupByField` — averages grouped by any `SF12Response` field (college/unit,
  campus, employment type, employment status, gender, etc.)
- `formatForCSV` — shared by the CSV export route

### Exports
- `app/api/export/csv/route.ts` — streams `formatForCSV` output.
- `app/api/export/pdf/route.tsx` — `@react-pdf/renderer` document (note the
  `.tsx` extension is required for JSX). Returns `new Uint8Array(buffer)`
  (raw `Buffer` is not a valid `NextResponse` body type).

## Branding

Navy `#1a3a5c` / gold `#c8a951`, Inter font, logo at `public/wpu-logo.png`.
Per user request, "Faculty and Staff Conference" copy was removed from the UI
— don't reintroduce it (the original `sf12-claude-code-prompt.md` spec still
contains it; that file is historical and not updated).
