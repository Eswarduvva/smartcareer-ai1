# External RAG preparation and access-review checklist

## Current status
The existing coach now has a server-only retrieval insertion before its unchanged model call. External access is OFF until explicitly reviewed. No external dataset query has succeeded, and no external schema/count or grounded LLM answer has been verified. This is integration preparation, not completed RAG.

Executed: 21 controlled tests passed across `coach.test.ts`, `coach-security.test.ts`, and `coach-retrieval.test.ts`. Latest preview compilation reported build OK. Tests cover authentication/quotas before retrieval, private response-field rejection, fixed search inputs, result/context/response limits, unavailable versus empty results, insecure endpoint rejection and cancellation. Prompt construction tests verify grounding instructions, not actual model adherence or semantic privacy of free text. Live external read-only enforcement, external authorization, timeout behavior, source accuracy and real answer grounding remain unverified.

## Required server configuration
- `SMARTCARRIER_RAG_ENDPOINT`: owner-reviewed HTTPS endpoint with no embedded credentials, query string or fragment. Redirects are refused.
- `SMARTCARRIER_RAG_TOKEN`: dedicated server-to-server credential shared only with that service.
- `SMARTCARRIER_RAG_APPROVED=true`: enable only after schema, grants, nonpersonal projection and endpoint review. Keep unset before review.
- `LOVABLE_API_KEY`: existing managed model credential; unchanged.

The external service holds its own reviewed database credential; SmartCareer does not receive it. RLS with no policies blocks ordinary read-only users. A bypass-capable role or privileged key is not inherently safe: external owner approval and enforced SELECT-only, approved-column access are required. No policy, schema, data or deployment changes were made here.

## Fixed service contract to implement and review externally
Request: authenticated HTTPS POST with bearer service credential, JSON `{ "version": 1, "terms": ["bca", "data analyst"], "limit": 5 }`. This POST invokes a search only; it must never mutate the database. The caller sends only fixed-vocabulary terms, never raw questions, user IDs, SQL, fields or table names.

Response: `{ "sources": [{ "reference": "knowledge:data-analyst", "title": "Owner-approved guidance title", "kind": "career", "text": "Owner-approved nonpersonal knowledge only." }] }`.

Allowed kinds: career, education-guidance, skill-requirement, learning-resource, roadmap. Maximum 5 sources; source text at most 1,500 characters; combined text at most 6,000; unique `knowledge:` references; total body at most 40,000 bytes. Unknown JSON fields cause rejection. Text is not automatically anonymized: the external service must enforce the approved content projection; a strict object schema cannot detect all personal information embedded in text.

The service must authenticate independently, reject arbitrary terms/SQL/filter fields, execute parameterized fixed SELECT queries, bound database work, and exclude all personal rows/identifiers. Student recommendations are observations, not documented eligibility/skill requirements. If the dataset contains only student observations, return no knowledge sources; do not convert observations into normative career guidance. Source references cannot identify students. No URLs from unverified external text are approved for linking.

## Files changed
- `src/lib/api/coach-retrieval.server.ts`: disabled-by-default service client and bounded response handling.
- `src/lib/api/coach-retrieval-schema.ts`: fixed vocabulary, strict source contract and grounding instructions.
- `src/lib/api/coach-stream.server.ts`: retrieval after verified account/quota/context, before unchanged `streamResponse()`.
- `src/test/coach-retrieval.test.ts`: 12 controlled retrieval tests.
- `src/test/coach-security.test.ts`: external-call denial assertions.
- `AGENTS.md`, `roadmap.md`: boundary rule and outstanding blocker.

No coach RPC functions, policies, browser controls, student data or authentication settings were changed. No new dependencies or deployment.

## Next owner input
Provide the confirmed external project reference/endpoint and column metadata (no student rows), then approve the nonpersonal knowledge fields and protected-service access design. Collect credentials only through the secure form once service setup is ready. After access review, run server-side metadata/count verification, real source retrieval and signed-in grounded-answer tests before declaring RAG complete or publishing.