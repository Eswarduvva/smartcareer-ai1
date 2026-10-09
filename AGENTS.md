<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Data flows only through `src/lib/api/` (ApiAdapter); demo records live only in `src/lib/mock/` and are read solely by the preview adapter. The source is chosen at build time in `client.ts`, never as a runtime fallback. Why: connecting a real backend means swapping the adapter, not rewriting pages.
- Cohort analytics are computed in the database by `get_analytics(degree, branch)`. Why: no totals hardcoded or computed over partial client data.
- Table RLS is temporary public read-only with no write policies. Why: demo without auth; replace with role-scoped policies when sign-in ships.
- 3D scenes live in `src/components/space/` and load only client-side via `SkillSpaceLazy`. Why: three.js must not run during SSR and must stay out of the main bundle.
- Skill score scale and thresholds are constants in `src/lib/skills.ts`. Why: one place to adjust when the real DB scale is confirmed.

- The student's own profile is stored on-device (`src/lib/my-profile.ts`) and scored by `src/lib/recommend.ts` (rule-based, labelled). Why: no auth yet and DB is read-only; a future engine replaces `recommend()` with the same output shape.
- Journey page bodies live in `src/components/journey/` and read the record via `RecordProvider`/`useRecord`; `/students/$id/*` (database) and `/me/*` (self-entered) both reuse them. Why: one UI for both sources.

- Career catalog, skill guidance and all scoring rules (match, readiness, gap priority) live in `src/lib/careers.ts` and `src/lib/recommend.ts`. Why: one place to replace when a backend engine arrives.
- 3D labels are DOM overlays positioned from scene anchors, not drei `<Html>`. Why: `<Html>` threw on unmount under React 19.

- Career comparisons and skill exploration consume the active RecordProvider and existing ranking rules; education text is catalog guidance, not eligibility scoring. Why: preserve recorded recommendations and avoid invented personal scores.
- Roadmap completion retains per-student device storage keys until the API adapter supports progress writes; collapsed stages and tasks unmount their controls. Why: preserve saved progress and keep hidden controls out of keyboard navigation.
