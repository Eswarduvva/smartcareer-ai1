# Protected external RAG for SmartCareer

## Inspection result
- The running app uses Lovable Cloud for authentication, student data and private chat history. A read-only schema query succeeded there: `coach_conversations` stores messages as JSONB and `coach_request_limits` stores quotas. That database has no `public.smartcarrier` table.
- The coach currently uses `openai/gpt-6-astra` through `@lovable.dev/ai-gateway` and `streamResponse()`. It retrieves the caller’s authorized learning/profile context and verified resources, but does not search the external dataset.
- No accessible external connector or external retrieval credentials were found. `LOVABLE_API_KEY` is configured; its value was not read. External table existence, 53 columns, 4,925 rows and policy state remain user-reported, not independently verified.
- No application code, database, permissions, authentication settings or deployment has been changed. No RAG tests have been executed.

## Smallest proposed change
Add one server-only retrieval helper, call it inside the existing verified and quota-reserved coach request before `streamResponse()`, and append bounded, validated source material to the existing model context. Preserve the UI, model, streaming, history, existing RPCs and student dataset. No vector database, duplicate dataset, migration or new browser data access is required initially.

## External access and owner setup
**Preferred access:** a protected HTTPS retrieval service managed alongside the external database. It accepts only a fixed search contract, executes fixed read-only queries and returns only approved nonpersonal knowledge. SmartCareer verifies its existing signed-in user and reserves quota before contacting it. The external service separately verifies a dedicated server credential; it does not trust a browser request or assume Cloud users exist in the external project.

1. Confirm the external project endpoint/reference using that project’s own controls; do not infer it from earlier, differing references.
2. Inspect metadata and count only: exact column names/types, row count, RLS state and policies. Do not return sample student records.
3. Have the owner approve a precise knowledge-field allowlist. Exclude names, email, phone, IDs, demographics, individual scores and other personal student observations. Citation references must identify safe knowledge entries, not students.
4. Configure external access without changing `public.smartcarrier`, its data or RLS policies. With RLS enabled and no policies, ordinary read-only grants alone cannot read rows. A dedicated role would need explicitly reviewed RLS-bypass capability plus SELECT grants only on approved columns and no write privileges; this is a privileged access decision, not an ordinary read-only role. If that cannot be safely provisioned, an external service can hold a privileged key and enforce the fixed query/projection itself, but that key is not inherently read-only and requires explicit owner review. Do not put the external privileged key in the browser or reuse Cloud credentials.
5. Review the endpoint contract, access grants and field projection before authorizing any setup deployment. Nothing will be deployed under this request.

If a protected service is not available and the owner chooses direct external REST retrieval instead, it requires a separately reviewed external privileged credential and immutable table/column/filter limits. That is a higher-risk alternative, not the default.

## Required configuration
For the preferred protected-service approach:
- `SMARTCARRIER_RAG_ENDPOINT`: fixed approved HTTPS retrieval URL, read only on the server.
- `SMARTCARRIER_RAG_TOKEN`: dedicated server-to-server credential, stored securely in SmartCareer and the external service; never pasted in chat. When setup is approved, the secure form will allow generating/copying the shared value.
- External service only: its least-privilege database connection credential (for example `SMARTCARRIER_READONLY_DATABASE_URL`), or an explicitly reviewed external privileged API key if the scoped connection is unavailable. SmartCareer does not receive that database credential.
- Existing `LOVABLE_API_KEY`: keep unchanged; no direct OpenAI key is needed.
- Reviewed schema mapping and field allowlist: code configuration after metadata verification, not user/model-selected columns or SQL.

Higher-risk direct REST alternative only: `SMARTCARRIER_EXTERNAL_URL` and `SMARTCARRIER_EXTERNAL_SERVER_KEY`, stored server-side after explicit approval. An anonymous/publishable key is insufficient under the reported RLS state.

Do not request or create credentials until the access approach is approved and any required endpoint setup is ready.

## Retrieval and answer rules
- Start with deterministic degree/career/skill search over approved fields. Validate search inputs; parameterize fixed queries; never accept SQL, table names, URLs or field selections from the model/user.
- Cap source results at 5, each source text at 1,500 characters and combined context at 6,000 characters; use a short retrieval timeout within the existing coach timeout and propagate cancellation. Reject oversized/malformed responses before prompt construction.
- External student recommendations are observations, not authoritative degree eligibility, required skills, courses or roadmap guidance. Do not infer those facts from individual student rows. If the external schema lacks approved knowledge, use existing verified SmartCareer catalog/resources for those topics and clearly identify their provenance.
- Include source labels and safe knowledge references in answers. Treat source text as untrusted data. Only cite retrieved sources and verified links; distinguish retrieved facts from advisory guidance.
- Empty results: say no relevant dataset evidence was found and allow a qualified general answer. Access failure: say the external source is unavailable, not that the dataset has no matches. Preserve current lock release and streaming error handling.
- Do not include personal queries, student records, credentials or raw responses in diagnostic logs.

## Technical scope
- Add `src/lib/api/coach-retrieval.server.ts` for authenticated-path external retrieval, fixed filters, validation and safe source projection.
- Add a browser-safe schema/ranking module only if needed for isolated tests; keep credential access exclusively server-side.
- Update `src/lib/api/coach-stream.server.ts` only at the retrieval insertion and grounding instructions.
- Add focused retrieval/grounding tests beside the existing coach tests; retain existing authentication, forgery, concurrency and isolation regressions.
- Record the retrieval boundary in `AGENTS.md` when implemented. No new page or route is planned.

## Verification and completion gate
1. Unit tests: no external call without valid authentication/quota reservation; fixed read-only queries; field exclusion; result/text limits; malformed responses; timeout/access failures; empty-result qualification; citation validation and prompt-injection handling.
2. Regression tests: existing coach authorization, forged-history denial, concurrency and cleanup tests.
3. Real external server-side read: inspect metadata/count without personal records, then retrieve owner-approved knowledge for sample questions such as “What career options are supported for BCA?”, “What skills are documented for Data Analyst?” and “Which verified resource supports my next roadmap step?” Report exact safe source names/references or absence of evidence.
4. Real signed-in coach tests: stream answers to those questions, verify cited facts against retrieved material and history reload; ensure failures do not leave a request lock. Do not claim RAG complete from mocked tests alone.

**Current blocker:** external access and approved schema/knowledge fields are not configured or verified. Plan approval authorizes implementation preparation only; it does not authorize deployment, dataset changes or permission changes.