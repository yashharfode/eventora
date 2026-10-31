# EVENTORA

AI-assisted event planning for weddings, birthdays, community and other events.

## Current implementation

This repository is a production-oriented foundation, not a claim of completed production certification. Included today:

- Next.js App Router + strict TypeScript foundation.
- Supabase email/password authentication UI and server-side session client.
- Private event dashboard and authenticated event CRUD endpoints (create/list).
- Provider-independent AI interface with an OpenAI-compatible HTTP adapter.
- Structured output validation, integer-minor-unit budget arithmetic and AI budget ceiling check.
- PostgreSQL schema with constraints, indexes, membership model and RLS policies.
- Basic response security headers, server-only secrets, generic API errors and a development-only rate limiter.
- Unit tests and a Playwright homepage smoke test.

Not yet implemented: production-grade distributed rate limiting, full event editing/deletion UI, vendor CRUD/booking, expense/task CRUD, invitation workflows, durable AI audit history, exports, notifications, accessibility audit, observability, backups and deployment-specific penetration testing.

## Requirements

- Node.js 20.9+ (use an active LTS release)
- npm
- A Supabase project
- An AI provider exposing an OpenAI-compatible Chat Completions API with JSON mode

## Setup

```bash
cp .env.example .env.local
npm install
```

Set the following values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AI_BASE_URL` (base URL, without `/chat/completions`)
- `AI_API_KEY`
- `AI_MODEL`

`SUPABASE_SERVICE_ROLE_KEY` is intentionally not used by the current application. Do not expose it to the browser or add it to a `NEXT_PUBLIC_` variable.

## Database setup

Apply `supabase/migrations/0001_initial_schema.sql` to a new Supabase project using the Supabase SQL editor or Supabase CLI. Enable email/password authentication in Supabase Auth. Configure email confirmation and password policies before public launch.

The initial migration establishes RLS. Review policies with the exact collaboration semantics you intend to ship. In particular, membership roles are modeled, but fine-grained role-based write restrictions and invitation acceptance are not yet implemented. Until then, treat collaboration as schema groundwork, not a shipped feature.

## Run locally

```bash
npm run dev
```

Open http://localhost:3000. Create an account at `/login`, then create an event from the dashboard. AI plan generation requires the provider environment variables above.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

## Security notes before deployment

1. Replace the in-memory limiter in `src/lib/security/rate-limit.ts` with a distributed atomic limiter (for example, Redis/Upstash) and add provider spend quotas.
2. Add CSRF/origin checks to cookie-authenticated state-changing routes if cross-origin access is possible; keep same-origin deployment and restrictive CORS.
3. Add per-user quotas, request-size limits, abuse monitoring and provider timeouts/retries with bounded concurrency.
4. Add role-aware authorization before exposing event member, task, vendor or expense mutations.
5. Add AI prompt-injection tests, output schema/versioning, moderation appropriate to the product, and clear user confirmation before any external side effect.
6. Add audit logs that avoid storing secrets and unnecessary personal data. Define retention and deletion policies.
7. Run dependency scanning, secret scanning, SAST, DAST and an independent RLS authorization test suite.
8. Configure CSP with a nonce/hash strategy compatible with the deployment; do not copy a permissive `unsafe-inline` policy.
9. Set production secrets in the hosting provider, enable TLS, configure backups and test restore procedures.
10. Review legal/privacy obligations for collecting guest, contact and vendor information in each target jurisdiction.

## Architecture

- `src/features`: domain logic and feature modules.
- `src/lib/ai`: provider abstraction and output contract.
- `src/lib/auth`: server-side identity enforcement.
- `src/lib/db`: database clients.
- `src/lib/validation`: untrusted request schemas.
- `src/lib/security`: rate limiting and security utilities.
- `supabase/migrations`: versioned database schema and RLS.
- `tests`: unit and integration test suites.
- `e2e`: browser-level tests.

## Money representation

Store monetary values as integer minor units (`budget_minor`, paise for INR). Convert to display units only at the UI boundary. Never use binary floating-point for financial totals.
