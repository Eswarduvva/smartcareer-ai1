# Predefined assessments

## Content and review
The bank contains 360 questions, 60 per subject, composed of 10 topic families with six variations each. Bank validation checks unique prompts, four distinct choices, valid keys and difficulty distribution. Questions use explicit language/runtime versions. They are predefined practice content, not accredited or independently educator-reviewed assessments. Independent educator review is still needed before high-stakes use.

`generate_bank.py` reproduces the source-controlled bank. `seed.ts` is an explicit deployment-time task that inserts missing keys only, never replaces existing questions. Never import either seed or the bank into browser code, route modules or page-load handlers. Answer keys must stay private.

## Grading and timing
Database time establishes the immutable 25-minute deadline. Answers save through owner-verified RPCs. Open pages submit automatically at timeout; closed pages are finalized on the next server read or attempted write. Late answers are never accepted. No background scheduler is installed. The assessment is a practice MCQ measurement, not proof of practical coding proficiency.

The result is 40 weighted marks converted to percent. Building <40%, Developing 40–69.99%, Strong ≥70% are project rubric choices. Verified proficiency is stored separately from legacy recommendations, imported scores and self-reported profile values. No matching algorithms are modified.

## Checks
`bunx vitest run` checks the local suite. `ASSESSMENT_LIVE_TESTS=1 bunx vitest run src/test/assessments-live.test.ts` verifies live owner privacy, anonymous denial, hidden answer keys, fixed deadlines, 8/8/4 selection, 40/40 grading, concurrent idempotent submissions and expired-answer refusal. It creates two isolated temporary accounts and removes only their assessment records afterward.