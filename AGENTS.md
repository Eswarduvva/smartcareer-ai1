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
- Data flows only through `src/lib/api/` (ApiAdapter): the HTTP adapter targets the external FastAPI/MySQL backend via `VITE_API_BASE_URL`; the preview adapter is used only when that var is unset. Why: MySQL is the source of truth and preview data must never mix with real data.
- 3D scenes live in `src/components/space/` and load only client-side via `SkillSpaceLazy`. Why: three.js must not run during SSR and must stay out of the main bundle.
- Skill score scale and thresholds are constants in `src/lib/skills.ts`. Why: one place to adjust when the real DB scale is confirmed.
