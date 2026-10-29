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
- External coach knowledge retrieval lives in a server-only API helper, runs only after verified auth and quota reservation, and stays disabled until endpoint, credential and explicit owner-review gate are configured; only a fixed vocabulary and bounded nonpersonal knowledge contract cross the external boundary. Why: preserve coach security without opening student data or assuming external RLS access.
- Career coach uses owner-read/clear history and service-role-only account-bound begin/finish RPCs after bearer verification; server-generated request IDs, atomic quotas before context reads, bounded leases and cleanup protect writes. All context reads remain user-scoped; session loss cancels/removes coach caches. Why: prevent forged assistant history, cross-account disclosure and duplicate generations.
- Educational video pages share a static, source-verified catalog and LearnLayout; lesson selection uses URL search state without account storage. Why: keep watch and explore navigation consistent without backend integration.
- Data flows only through `src/lib/api/` (ApiAdapter); demo records live only in `src/lib/mock/` and are read solely by the preview adapter. The source is chosen at build time in `client.ts`, never as a runtime fallback. Why: connecting a real backend means swapping the adapter, not rewriting pages.
- Cohort analytics are computed in the database by `get_analytics(degree, branch)`. Why: no totals hardcoded or computed over partial client data.
- Cohort tables are readable only by admins or assigned mentors (`can_view_student`); roles live in `user_roles`, granted server-side only, signups default to student. Why: access must be enforced by the database, not navigation.
- Signed-in pages live under `src/routes/_authenticated/` (client-only gate); mentor/admin pages add a role `beforeLoad`. Why: one gate, URLs unchanged.
- 3D scenes live in `src/components/space/` and load only client-side via `SkillSpaceLazy`. Why: three.js must not run during SSR and must stay out of the main bundle.
- Skill score scale and thresholds are constants in `src/lib/skills.ts`. Why: one place to adjust when the real DB scale is confirmed.

- The student's own profile and roadmap progress are saved to `student_accounts` (own-row RLS) with a device cache (`src/lib/my-profile.ts`, `src/lib/account.ts`) and scored by `src/lib/recommend.ts` (rule-based, labelled). Why: no auth yet and DB is read-only; a future engine replaces `recommend()` with the same output shape.
- Journey page bodies live in `src/components/journey/` and read the record via `RecordProvider`/`useRecord`; `/students/$id/*` (database) and `/me/*` (self-entered) both reuse them. Why: one UI for both sources.

- Career catalog, skill guidance and all scoring rules (match, readiness, gap priority) live in `src/lib/careers.ts` and `src/lib/recommend.ts`; Overall Career Fit (weighted multi-factor, configurable weights, null when any factor lacks data) lives separately in `src/lib/career-fit.ts`; match scores never default missing/out-of-range skills (track becomes unscored), and recorded dataset scores are shown unchanged, never attached to a non-equivalent catalog track. Why: one place to replace when a backend engine arrives, and no invented scores.
- 3D labels are DOM overlays positioned from scene anchors, not drei `<Html>`. Why: `<Html>` threw on unmount under React 19.

- Career comparisons and skill exploration consume the active RecordProvider and existing ranking rules; education text is catalog guidance, not eligibility scoring. Why: preserve recorded recommendations and avoid invented personal scores.
- Roadmap completion retains per-student device storage keys until the API adapter supports progress writes; collapsed stages and tasks unmount their controls. Why: preserve saved progress and keep hidden controls out of keyboard navigation.
- Public info pages share `src/components/PublicLayout.tsx` (header, footer, `publicHead`); contact/feedback write to `support_messages` (anon insert-only, admin read). Why: one footer and an honest, stored submission path.
- Mentor portal is `/mentor/*` (mentor or admin) and admin portal `/admin/*` (admin), guarded by `requireAnyRole` in `src/lib/role-guard.ts`; role grants, mentor assignments and the user list (`admin_list_users`) are allowed only by admin RLS/definer checks. Why: navigation hides, the database enforces.
- Admin role is granted only via admin_invites (claimed by trigger after email confirmation) or by an existing admin; data quality is reported by admin-only `get_data_quality()` and flags values without correcting them. Why: no self-escalation, and no data changes before the real scale is confirmed.
- The first admin is bootstrapped only by `claimFirstAdmin` (src/lib/admin-setup.functions.ts): no admin exists, caller's confirmed email equals the FIRST_ADMIN_EMAIL secret; later admins via invites. Why: owner-only, backend-enforced, one-time.
- Learning uses account-owned records, admin-approved immutable cohort links, and authenticated RPCs in the API boundary; quizzes, grades, rewards and history commit transactionally. Why: prevent self-linking, privacy leaks and duplicate evidence.
- Learning readiness and baseline validation live in `src/lib/learning/rules.ts`; validated mastery is separate from legacy recommendation scores. Why: preserve imported data and distinguish evidence from self-reporting.
- Role dashboards: admin cohort KPIs/charts use invoker RPC `get_dashboard_analytics` (RLS-scoped, filters in DB); mentor figures are computed only from the mentor's own `mentor_assignments` rows; students read only their admin-linked record plus aggregate benchmarks via definer `get_my_cohort_dashboard`. Why: no RLS bypass and no other-student rows reach the browser.
