# SmartCareer AI — Version 1 build plan

Frontend for the student career intelligence platform, designed to plug into your FastAPI + MySQL backend. No Lovable Cloud database — your MySQL stays the source of truth.

## Data approach (important)
- One service layer with two clearly separated adapters:
  - **Real API adapter** — calls `VITE_API_BASE_URL` endpoints from the spec (`/students`, `/students/{id}`, `/skills`, `/experience`, `/preferences`, `/goals`, `/recommendations`, `/analytics/overview|skills|careers`).
  - **Dev preview adapter** — a small, clearly labelled sample set (a handful of illustrative students) so the screens can be reviewed before the API is reachable. Every screen shows a visible "Preview data — API not connected" badge while it is active.
- The app switches to the real API automatically once `VITE_API_BASE_URL` is set. No database credentials anywhere in the frontend.
- Every screen has loading, empty, error ("API unreachable") and success states.
- Analytics totals are computed from what the API returns, never hardcoded.

## Visual direction (your picks)
- **Colours, a blend of the three palettes you liked:**
  - Light mode: warm paper `#f5f3ee`, ink `#1b1f24`, teal accent `#1f6f6b`, amber `#c98a2b` for gaps.
  - Dark mode ("Observatory Night"): `#0e1216` / `#1c232b` surfaces, silver text `#c9d3dc`, cyan `#5fb3c4` for highlights.
  - Forest greens (`#2d5a3d`, `#5a8a5c`, `#a0c49d`) for strengths, readiness and progress in both modes.
- **Type:** JetBrains Mono for headings, labels and every number; Work Sans for body text.
- **Layout:** bento grid of panels in different sizes. The 3D skill space gets the biggest tile, one main score per tile, and smaller tiles for profile, skills and experience. Thin borders, small corners, almost no shadows, no glow or neon gradients.

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
