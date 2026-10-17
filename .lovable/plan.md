# SmartCareer Learning & Activities

## Preserved
- Keep the homepage, existing pages, visual identity, authentication, career recommendation logic, and all 4,925 imported student records unchanged.
- Use the confirmed **0–100 skill scale**. Flag missing and invalid baselines; never replace them with zero or correct the imported dataset automatically.
- Only an admin can approve an account-to-student link. Students cannot claim imported records themselves.

## Learning experience
- Add a dedicated signed-in Learning & Activities page, linked from the student dashboard and existing navigation.
- Show career goal, next activity, daily tasks, weekly plan, verified resources, quizzes, coding exercises, assignments, projects, deadlines, points, and streaks.
- Provide search and filters for skill, difficulty, career track, and activity type, plus activity details, history, skill gaps, progress charts, and readiness.
- Reuse the verified MIT lesson catalog and watch page; do not invent external links, certifications, class schedules, or completion records.
- Add class scheduling and attendance history, with honest empty states until an admin schedules classes. Attendance remains separate from mastery.

## Private records and administration
- Add admin-approved account linking with a unique account/student relationship and an audit trail. Preserve existing mentor assignments.
- Add only the missing learning records: resources, activities, activity progress/submissions, class sessions, attendance, assessments, skill history, and scoring configuration.
- Students read their own learning records; mentors read only linked accounts for their assigned students; admins manage learning content and account links.
- Do not widen existing cohort-data policies. Linked baseline reads use a narrow authenticated learning-specific path rather than exposing the whole dataset.
- Admins publish activities and verified resources, schedule classes, record attendance, and review practical submissions using explicit rubrics.

## Evidence and scoring
- Keep baseline, self-reported scores, and validated assessment scores visibly distinct.
- Grade objective quizzes on the backend; practical exercises and projects require authorized rubric review. AI feedback is advisory, not a validated grade.
- Apply a versioned, configurable evidence policy: current validated skill score is the weighted mean of validated assessments for that skill, bounded to 0–100; assessment weights and rubric rules are stored explicitly.
- Preserve every assessment and score-change record. Enforce unique submissions, grading events, attendance entries, and completion rewards transactionally.
- Opening a lesson or attending class never changes skill mastery. Completion points and streaks do not influence skill scores.
- Show a separately labelled learning-readiness estimate based on required career skills, validated assessment performance, and reviewed practical projects. Explain weights, evidence coverage, missing evidence, and next actions; never promise employment.

## AI Learning Coach
- Use the available Lovable AI integration securely, with calls made only on the backend.
- Ground suggestions in the signed-in learner's permitted career profile, gaps, completed activities, and assessment feedback.
- Support next-lesson guidance, practice questions, explanations, constructive feedback, and project suggestions.
- Label generated suggestions separately from verified catalog resources. Preserve input and show useful catalog-based guidance when the service is unavailable.
- Verify workspace model availability before selecting an allowed model; report any workspace access or credit restriction rather than silently changing providers.

## Technical implementation
- Keep learning reads/writes in the existing API boundary and authenticated server functions; reuse the managed sign-in gate and bearer middleware.
- Store learner ownership by authenticated account UUID, never the shared `MY-PROFILE` value. Use an admin-approved mapping to the existing text student ID for cohort baselines and mentor permissions.
- Use additive migrations with explicit grants and row-level policies. Backend validation and database transactions enforce grading, score bounds, and duplicate prevention.
- Keep public `/learn` and `/learn/watch` unchanged; new private learning and admin pages get their own titles and descriptions.

## Verification and setup
- Test score bounds, invalid/missing baselines, attendance exclusion, duplicate submissions/rewards, and the readiness formula with concrete tests.
- Exercise real signed-in activity submission, grading, stored history, coach responses, and account linking through the UI.
- Check student, assigned/unassigned mentor, admin, and signed-out access; check mobile layout, loading, empty, and service-error states.
- Report completed features and any unverified integrations. Role tests require suitable accounts and assignments; do not grant roles or link real student records just to manufacture a test.
- Initial verified learning content, class schedules, rubric assessments, and real student-account links must be supplied or approved by admins. No invented live classes or student evidence.