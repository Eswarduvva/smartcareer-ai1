# SmartCareer AI — Version 1.1: Cloud database + premium 3D/UX upgrade

Everything in Version 1 stays: the pages, data models, loading/error states, charts and 3D foundation all remain, and each one gets upgraded. Nothing is rebuilt from scratch.

## 1. Database (Lovable Cloud, which runs on managed Postgres)
- Turn on Lovable Cloud. It replaces the FastAPI + MySQL plan, so there are no passwords or server keys in the frontend.
- Create the six tables exactly as specified: `students` (key: `student_id`), plus `student_skill_scores`, `student_experience`, `career_preferences`, `career_goals` and `career_recommendations`. Each of the last five links to `students.student_id` with a foreign key and cascade delete, one row per student.
- Add an optional `smartcareer_staging` table for raw imports. The app never reads from it.
- Indexes on degree, branch, city and cgpa so search stays fast across about 5k students.
- The database calculates the analytics: student count, averages, CGPA and readiness distributions, domains and average skill scores. No number is hardcoded or calculated in the browser.
- Access rules: anyone can read for now, and no one can write from the app. The access rules make this a deliberate, temporary choice for the demo. Student, mentor and admin access comes later with real sign-in.
- No student data is created. You import the real dataset yourself, as CSV files through the Cloud table editor, in table order with `students` first. I'll give you short import steps.

## 2. Data layer
- `http-adapter` becomes `supabase-adapter`. The `ApiAdapter` interface stays the same, so pages don't change.
- How the app picks its data source: it uses the database when it is reachable and holds students. It uses the preview adapter only when the database is empty or unreachable. The two sources are never mixed.
- The banner text becomes "Preview data — Supabase not connected".
- Error messages are friendly for normal users, with technical details kept out of sight.

## 3. 3D Career Intelligence Space (redesign, not more objects)
- Spatial hierarchy: the student is a distinct core at the centre. The four skill groups sit as clusters at different depths, each with its own tone. The career destination is a separate, distinct object that pulls the composition forward. The strongest skills connect to it with curved paths.
- Depth cues: fog, smaller and dimmer nodes in the background, soft key light and rim light, no bloom.
- Cursor: smoothed camera parallax and small scene tilt, with a gentle hover light that follows the pointer.
- Hover: the node is highlighted, a readable label shows its name and score, its connections are emphasised and other nodes dim.
- Click: the node is selected, moves slightly forward, the camera eases toward it, and a side panel shows the skill, score, group and whether it is a Strength, Developing or Priority Gap.
- Fixed starting framing that fits any panel shape and always shows the student, skills and destination.
- Small legend: the four groups, Strength, Gap and Destination.
- Fallback: on phones there are fewer nodes, no fog and lower pixel ratio. With reduced motion turned on, nothing moves. If WebGL fails, a polished 2D radial SVG view appears instead.
- Performance: loaded only when needed and only in the browser, nodes drawn in batches, calculated values cached, pixel ratio capped.

## 4. Visual and page upgrades
- System: finer type scale using the same fonts, mono numerals, grid rhythm, hairline dividers in place of boxed cards, fewer card containers, page transitions, and skeleton loaders that match each page's layout.
- Navigation: the left rail shows progress along the story Profile, Skills, Match, Gaps, Roadmap for the selected student.
- Overview: one continuous story with a large 3D space beside the dominant numbers, then sections for profile, skills, match, gaps and roadmap.
- Career Match: a large match % with the recommended role, then Strong signals, Skill gaps and Relevant experience, all from real values only.
- Skill Gaps: three bands (Strong, Developing, Priority Gap). Each row shows current score, target and next step, and the target is labelled "application rule".
- Roadmap: a vertical flow from Current profile to Strengths, Priority gaps, Skill development and Career target, labelled "Rule-based roadmap".
- Analytics: filters for degree and branch, one main chart plus a few secondary charts, hover tooltips, and clear labels. It uses the filtered database calculation.

## 5. Sign-in
- The Cloud sign-in setup is ready, but sign-in itself stays off for now and the sidebar says so honestly. Roles come later.

## Technical details
- Migration: create the tables, foreign keys, indexes and a `get_analytics(degree, branch)` function, plus public read-only (`TO anon SELECT`) policies and no write policies.
- `src/lib/api/supabase-adapter.ts` uses the browser Cloud client. The student list uses `.range()` pagination with `count: 'exact'` and `ilike` search. The record loads with one `select` that joins the related tables.
- `client.ts` picks the adapter with a one-time check (`students` head count). TanStack Query caches it, and `isPreviewData` reads from it.
- Update the project rules and memory: the earlier "FastAPI/MySQL, never Cloud DB" rule is replaced by Cloud Postgres as the source of truth.
- 3D work: `src/components/space/` (SkillSpace, Legend, DetailPanel, Fallback2D).
