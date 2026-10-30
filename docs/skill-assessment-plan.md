# Skill assessment migration plan

1. Add four new tables only: private questions/keys, account-owned attempts, answers and latest verified proficiency. Preserve all existing tables, policies and data.
2. Grant owner-only reads for attempts, answers and proficiency. No student access to the question table or direct writes. Authenticated RPCs select safe question fields, save answers and grade atomically. Row locks and a unique active attempt enforce idempotence; deadlines use database time.
3. Add 360 predefined questions (60 per subject; 24/24/12 difficulty split) through a separate seed script, with structural and computed-answer checks. No external accreditation or human-review claim.
4. Add authenticated `/me/assessments`, `/me/assessments/$skill` and `/me/assessments/results/$attemptId`. Assessment pages do not require a completed career profile.
5. Show history and latest verified proficiency separately from self-reported scores. Keep career matching and AI Coach unchanged. Project proficiency rubric: Building <40%, Developing 40–69.99%, Strong ≥70%.
6. Test question-bank counts, weighted marks, timer persistence, timeout, duplicate grading, hidden keys and cross-account protection; exercise a signed-in attempt through the interface.

No destructive migration is planned. Further migrations that remove or replace existing data require review first.