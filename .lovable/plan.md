# SmartCareer AI — Version 1 build plan

Frontend for the student career intelligence platform, designed to plug into your FastAPI + MySQL backend. No Lovable Cloud database — your MySQL stays the source of truth.

## Data approach (important)
- One service layer with two clearly separated adapters:
  - **Real API adapter** — calls `VITE_API_BASE_URL` endpoints from the spec (`/students`, `/students/{id}`, `/skills`, `/experience`, `/preferences`, `/goals`, `/recommendations`, `/analytics/overview|skills|careers`).
  - **Dev preview adapter** — a small, clearly labelled sample set (a handful of illustrative students) so the screens can be reviewed before the API is reachable. Every screen shows a visible "Preview data — API not connected" badge while it is active.
- The app switches to the real API automatically once `VITE_API_BASE_URL` is set. No database credentials anywhere in the frontend.
- Every screen has loading, empty, error ("API unreachable") and success states.
- Analytics totals are computed from what the API returns, never hardcoded.

## Visual direction
- Calm, editorial, precise. Warm off-white "paper" surface with deep ink text, one restrained accent (deep teal) and a muted amber for gaps. Dark mode supported.
- Typography: a sharp display serif-free grotesk for headings (e.g. "Instrument Sans"/"Geist"-style) + a readable text face + tabular mono for numbers.
- Few cards; hierarchy through type size, rules, and whitespace. Small radius, minimal shadows, no glow blobs or neon gradients.

## 3D "Career Intelligence Space"
- React Three Fiber scene: the student at the centre, skill nodes grouped in four clusters (Technical, Reasoning, Communication, Behavioural), node size/brightness from actual scores, weak skills shown as hollow/amber, career domain as a destination node with a path.
- Cursor-reactive: camera parallax, gentle node tilt, hover highlights a skill and its label.
- Used on landing (abstract version) and dashboard/skills (data-driven version).
- Lazy-loaded, client-only, capped object count, reduced detail on mobile, static fallback when reduced-motion is on.

## Screens (each its own page)
1. **Landing** — SmartCareer AI wordmark, product question, 3D hero, Student → Skills → Career → Gap → Roadmap flow.
2. **Students** — search/filter by ID, degree, branch, city, CGPA range; paginated table.
3. **Overview** (per student) — identity, CGPA/degree, top 3 & weakest 3 skills, readiness, match, gap, recommended domain/role, experience counts.
4. **Profile** — all student fields, key ones dominant.
5. **Skill Intelligence** — radar, grouped horizontal bars, technical vs soft comparison, strengths/weaknesses.
6. **Career Match** — match %, role, domain, gap score; "why" built only from actual high/low skills.
7. **Skill Gaps** — lowest-scoring skills ranked, distance to a clearly stated threshold.
8. **Career Roadmap** — steps derived from the student's weak skills and experience counts, explicitly labelled as rule-based (not AI).
9. **Analytics** — cohort distributions (CGPA, readiness, domains, average skills) from the analytics endpoints.

App shell: slim left rail navigation with a selected-student switcher; auth left as a clean placeholder (no fake roles).

## Technical details
- Stack: TanStack Start routes per page, TanStack Query for data, Recharts for charts, `@react-three/fiber` + `drei` for 3D, Motion for transitions.
- `src/lib/api/` — `types.ts` (mirrors the six tables), `client.ts` (adapter selection), `http-adapter.ts`, `preview-adapter.ts`, `queries.ts`.
- Routes: `/`, `/students`, `/students/$id` (overview), `/students/$id/profile|skills|match|gaps|roadmap`, `/analytics`.
- Your FastAPI must allow CORS from the app's domain; the API must be publicly reachable over HTTPS for the published app.
- Design tokens in `src/styles.css` (oklch), per-page head metadata.
