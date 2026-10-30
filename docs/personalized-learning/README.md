# Python Fundamentals — review and activation

The signed-in learning infrastructure is implemented. The course is intentionally unavailable until content review: no Python course has been approved and no AI-generated quiz questions were imported.

## Authorized administrator workflow
1. Open **Admin → Learning management** (`/admin/learning`).
2. Select **Prepare draft notes for review**. This imports ten AI-authored lesson drafts, not questions; it is explicit and admin-only, never a page-load seed.
3. Review each topic's full notes, code examples, exercises and official Python resource URLs. Correct the draft before approval.
4. Supply at least five **human-authored, non-AI-generated** MCQs per topic: four choices, a correct index from 0 through 3, and an explanatory rationale. Do not use generated questions from assistant drafts.
5. Save each topic's reviewed draft. The course remains hidden from learners.
6. An authorized educator must validate all ten topics and the full bank, then explicitly attest authorship/review and approve the course. Approved notes/questions are immutable; corrections require a future version rather than overwriting historical grading references.
7. Before publishing, run the full student flow: generate Gemini schedule, lesson, failed quiz, retake, 80% pass, next topic, refresh, history and regeneration. Verify assigned/unassigned mentor permissions with real approved account links.

## Verification already performed
- 90 regression tests passed.
- Six dedicated live database tests passed: anonymous/key/forged-progress denial, concurrent starts, persisted answers, owner isolation, fail/pass boundaries, retakes, idempotent finalization, server-only plan storage and preservation of results across revisions.
- Signed-in `/me/learning-progress` rendered on desktop and 390px phone without horizontal overflow or browser errors, correctly showing the curriculum-review gate.
- Existing dataset retains 4,925 records; existing career calculations, coaches, retrieval configuration and dashboard content remain unchanged.
- Existing optional coach/assessment live suites were not rerun in this task. A pre-existing Three.js CommonJS deprecation warning remains.

## Not yet verified
No approved curriculum exists, so a real student lesson/quiz journey or live Gemini generation against approved Python content could not be tested. Current session lacked access to admin content controls. Do not describe the course, Gemini generation or complete learning journey as activated.

Time reporting records bounded client-reported activity intervals, not proven attention or mastery. Only passed topic quizzes validate topic completion; neither time nor lesson opens change career scores.