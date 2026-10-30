# SmartCareer personalized learning — Python-first implementation

## Existing-system audit
- The live Lovable Cloud database contains **4,925 student records**, **360 skill-assessment questions**, and **2 assessment attempts**. Existing learning activities and learning resources currently contain **0 rows**.
- Student dashboards, career matching, saved roadmap checkboxes, Learning & Activities, skill assessments, and admin/mentor learning pages already exist. Extend them; do not rebuild dashboards or duplicate student data.
- `student_accounts` stores the account profile and existing roadmap completion. `learning_account_links` provides admin-approved cohort linking. Existing learning RPCs enforce owner/admin/assigned-mentor access.
- `learning_activities`, `learning_resources`, and protected `learning_answer_keys` are reusable. However, `student_activity_progress` allows only one submission per account/activity: it cannot preserve unlimited quiz retakes. Existing 25-minute skill assessments are a separate experience, not five-question topic quizzes.
- All inspected learning/assessment tables have RLS enabled. Answer-key tables have no student-read policies; existing account profiles are owner-scoped. Keep these protections unchanged.
- `/me/roadmap` already renders the shared career roadmap. The `/me` layout requires a completed profile or approved cohort link. New topic pages should remain accessible to signed-in learners even when that profile is unfinished.
- Baseline checks: **79 tests passed; 12 optional live-security tests skipped**. A Three.js CommonJS deprecation warning remains unrelated to learning. These checks do not establish the new learning journey or current live authorization behavior.

## What students will receive
1. An additional personalized-learning area within the existing `/me/roadmap`, retaining the current career roadmap and its saved progress.
2. A Python Fundamentals journey with ten topics: introduction; variables/data types; operators; conditionals; loops; functions; lists/tuples; dictionaries/sets; exception handling; file handling.
3. Each topic includes objectives, explanations, definitions, syntax, examples, applications, common mistakes, exercises, key takeaways, and verified free resources. Code blocks have highlighting and copy controls.
4. Five-question quizzes with four options per question, one correct answer, an **80% pass threshold**, unlimited retakes, and explanations after submission. Passing unlocks the required next topic; completed topics remain reviewable.
5. A progress page showing actual completions, attempt scores, milestones, pending work, skill-wise progress, and recorded active learning time, separately labelled from schedule estimates.
6. Gemini-generated scheduling and advisory guidance grounded exclusively in the approved Python curriculum. Existing career scoring and the OpenAI career/learning coaches remain unchanged.

## Proposed additive database migration
No existing table, record, policy, or scoring function is removed or overwritten. Final SQL will follow this reviewed design; apply schema separately from content imports.

| Storage | Purpose and reuse |
|---|---|
| `learning_modules` | Versioned course/module definitions and approval state. |
| `learning_topics` | Stable topic IDs, module order, approved prerequisites, links to reusable lesson/quiz activities. |
| `learning_notes` | Immutable approved note versions; draft edits never replace a published version. |
| `topic_quiz_questions` | Dedicated predefined topic bank with protected answer/explanation fields and review status; do not repurpose timed assessment questions. |
| `ai_roadmaps` | Account-owned plan revisions, bounded preferences, model/catalog version and selected approved topic IDs. |
| `roadmap_milestones` | Versioned schedule and practical checkpoints tied to a saved roadmap. |
| `student_topic_progress` | Account/topic evidence, active position, completion and originating passed attempt; persist independently of regenerated schedules. |
| `student_quiz_attempts` / `student_quiz_answers` | Every attempt, fixed randomized question snapshot and server-persisted responses; separate from legacy single-submission progress. |
| `student_learning_sessions` | Bounded activity heartbeat records for measured learning time, excluding idle intervals and duplicate events. |

- Reuse `learning_resources`, `learning_activities`, existing profiles, account links, roles and mentor assignments. New learning progress does not write to imported skills or existing career scores.
- New tables receive explicit grants, RLS and indexes in the same migration. Curriculum drafts are admin-only; approved material is available to authenticated learners. Question/key rows are never directly student-readable.
- Learners can read only their own plans, progress and attempts. Staff read paths use the existing approved account-to-student mapping: admins may monitor; mentors only assigned students. Unlinked accounts never become visible to mentors automatically.
- Completion, grades, prerequisites, question selection and counters are written through owner-checking transactional RPCs, not browser updates. Reject null IDs and foreign-account IDs. Serialize attempt submission and make duplicate finalization idempotent.
- Five answered questions produce scores in 20-point steps: **4/5 = 80% passes; 3/5 = 60% fails**. Failed attempts never unlock a prerequisite. Replay and retakes never double-count completion.
- Publish course content only after review, including all ten notes and at least 50 independently reviewed, predefined MCQs. Additional reviewed variants can expand the pool later; do not claim varied retakes with only five questions per topic.

## AI planning and evidence boundaries
- Use the installed Lovable AI Gateway SDK with a supported Gemini text model; proposed selection **`google/gemini-4-argon`**, verified in the workspace model catalog. Generate its SDK types during implementation. Preserve all existing OpenAI selections and career-coach RAG configuration.
- Read only the signed-in student's authorized profile, verified assessment evidence, interests, goal, and explicitly supplied study hours/duration/preferences. Do not send names, emails, student IDs, cohort rows, or answer keys to the model.
- Authenticate and reserve a bounded durable generation allowance before context reads or model calls. Validate the returned schema and topic IDs; enforce prerequisite order server-side. AI cannot mark a topic passed, invent resources, or unlock topics.
- A subject-wide assessment percentage alone does not prove topic mastery. Skip only topics with mapped, sufficiently specific verified evidence; otherwise use the topic checkpoint. Record why a topic is recognized and leave review available.
- Regeneration changes only future schedule revisions. Preserve topic evidence, old plans and all attempts. Gemini failure leaves saved work unchanged; offer the approved standard sequence explicitly labelled as non-AI, never silently substitute a fake generated plan.
- Personalized explanations are separate, labelled AI guidance; approved notes remain immutable. Future-plan adaptations require explicit learner regeneration.

## Routes and presentation
- Keep `/me/roadmap`; convert only its route wrapper into a layout with an index leaf retaining `RoadmapView`, so `/me/roadmap/$roadmapId` can render correctly.
- Add `/me/learn/$topicId`, `/me/learn/$topicId/quiz`, and `/me/learning-progress` under the existing authenticated gate, using unnested `me_` files where needed to avoid blocking learning behind the profile-required dashboard layout.
- Extend `/admin/learning` for modules, draft notes, question editing/approval, suggestion review and actual learning analytics. Extend `/mentor/learning` for assigned learners' progress, missed topics and resource recommendations. No new role grants.
- Reuse AppShell, current theme tokens, controls, loading/error patterns and navigation. Topic sidebar collapses on narrow screens; lesson text, code, quizzes and controls must fit phone, tablet and desktop widths.
- Every new content route gets its own SmartCareer title, description and social metadata.

## Implementation order and verification
1. Add schema and secure RPCs; run live access, hidden-key, prerequisite, retake and duplicate-submission tests before attaching the UI.
2. Prepare the ten-topic content pack, review checklist and admin authoring/approval workflow. Load content through that controlled workflow, not page-load seeding.
3. Build lesson reader, quiz/result flow and saved progress; verify pass, fail, retake, refresh recovery and return-to-study.
4. Add Gemini planning, preferences, regeneration and weak-topic guidance; test real approved catalog selection, invalid output and AI unavailability.
5. Add student progress and staff extensions; verify owner isolation, assigned versus unassigned mentor access and admin authorization.
6. Run existing regression tests plus new concrete rules/security tests. Exercise the full signed-in Python journey on desktop and mobile. Test regeneration preserves completed evidence and previous attempts.

## Approval and release gates
- **Now:** review this audit and migration/implementation plan. No application, database, permission, secret or model changes have been applied.
- **After plan approval:** implement the Python path incrementally; existing functionality stays intact.
- **Before publishing:** an educator/authorized content reviewer must validate the initial notes and question bank. AI output is not independent content review. Do not publish automatically.