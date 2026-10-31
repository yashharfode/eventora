# EVENTORA — AI Event Co-Pilot

> **Intelligent, Secure, and Production-Ready Event Management Platform**  
> Tailored for Weddings, Birthdays, Community Celebrations, and Corporate Events.

![EVENTORA CI](https://github.com/yashharfode/eventora/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-3.x-6E9F18?logo=vitest)

---

## 🏛️ System Architecture

EVENTORA is built on a **Modular, Hexagonal-inspired Full-Stack Architecture** utilizing Next.js 15 App Router, React 19, and strict TypeScript. It features a **dual-mode persistence strategy**:
1. **Zero-Setup Local Experience**: Instant, client-side persistence (`localStorage`) with offline support, reactive updates, and pre-seeded realistic event fixtures.
2. **PostgreSQL / Supabase Ready**: Production-grade database schema (`supabase/migrations/0001_initial_schema.sql`) complete with foreign key constraints, indexes, transaction guarantees, and Row Level Security (RLS) policies.

```
src/
├── app/                  # Next.js 15 App Router (Pages, API Routes, Layouts)
│   ├── api/ai/plan/      # Multimodal AI generation endpoint (OpenRouter + Heuristic)
│   ├── api/events/       # RESTful event management endpoints
│   ├── dashboard/        # Event Dashboard, Kanban, Milestones, Detail & Export views
│   └── login/            # Authentication & session interface
├── components/           # UI components with strict accessibility and reactive state
│   ├── events/           # Budget planning, Timeline, Vendors directory, Export cards
│   ├── ui/               # Reusable primitives (Buttons, Cards, Inputs, Modals)
│   └── layout/           # AppShell, responsive sidebar, navigation & branding
├── features/planning/    # Pure domain business engines (Fully Unit Tested)
│   ├── budget.ts         # Non-negative integer minor unit arithmetic & reconciliation
│   ├── timeline.ts       # Dependency graph, milestone calculation, bottleneck detection
│   ├── collaboration.ts  # Role-Based Access Control (RBAC) & invitation validation
│   └── export.ts         # Markdown Master Blueprint & CSV export generation
├── lib/                  # Infrastructure & cross-cutting concerns
│   ├── ai/               # OpenRouter multimodal adapter & heuristic fallback
│   ├── auth/             # Session management & user context validation
│   ├── repository/       # Repository pattern interface (LocalStorage & Postgres adapters)
│   ├── security/         # Rate limiting, input sanitization & security headers
│   ├── storage.ts        # LocalStorage event persistence & fixture state
│   └── validation/       # Zod schemas for untrusted input validation
└── tests/unit/           # Vitest unit test suites covering all core domain engines
```

---

## 🚀 Key Features

### 1. 🤖 GenAI Multimodal Event Co-Pilot
- **Primary Engine**: `nvidia/nemotron-3.5-super-vl:free` via OpenRouter with multimodal inspiration board understanding (accepts event vibe photos and floor plans).
- **Automated Fallback**: Resilient fallback cascade to `dots-studio/dots-3-note-preview:free`, `google/gemma-4-31b-it:free`, and zero-latency `LocalHeuristicProvider`.
- **Strict Output Schema**: Zod parsing and deterministic normalization guarantee zero runtime malformed JSON errors.

### 2. 💰 Intelligent Budget Engine
- **Minor Unit Precision**: 100% integer arithmetic (e.g., paise for INR) completely eliminating IEEE 754 floating-point inaccuracies.
- **Budget Health Evaluation**: Real-time spending health metrics, category variance tracking, and emergency reserve thresholds.
- **Proportional Reconciler**: Automatic category budget re-weighting with zero integer division drift.

### 3. 📅 Dynamic Timeline & Milestone Engine
- **Reverse Scheduling**: Automatically calculates task due dates backward from the target event date.
- **Dependency Graph Validation**: Detects prerequisite violations (e.g. tasks scheduled after their parent milestone).
- **Bottleneck Detection**: Alerts planners when 3 or more high-priority tasks are scheduled within a tight 48-hour window.

### 4. 👥 Collaboration & RBAC Matrix
- **Strict Role Hierarchy**: `owner` > `admin` > `editor` > `viewer`.
- **Privilege Escalation Protection**: Prevents lower-tier users from assigning higher roles or modifying billing controls.

| Capability | Owner | Admin | Editor | Viewer |
| :--- | :---: | :---: | :---: | :---: |
| View Event & Timelines | ✅ | ✅ | ✅ | ✅ |
| Update Tasks & Milestones | ✅ | ✅ | ✅ | ❌ |
| Manage Budget & Vendors | ✅ | ✅ | ❌ | ❌ |
| Invite Collaborators | ✅ | ✅ | ❌ | ❌ |
| Delete Event | ✅ | ❌ | ❌ | ❌ |

### 5. 📄 Master Blueprint & Data Export
- **One-Click Markdown Blueprint**: Export comprehensive event run-of-show documents containing metadata, budget breakdowns, milestones, booked vendors, and AI recommendations.
- **CSV Budget Sheets**: Formatted spreadsheet exports with category, planned allocation, spent totals, and variance analysis.
- **Live Clipboard Sharing**: Instant copy of event summaries for WhatsApp, Slack, or email distribution.

---

## 🛡️ Security & Quality Standards

- **OWASP Top 10 Hardened**: Strict server-side input validation via Zod, parameter sanitization, and automated header policies (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).
- **Prompt Injection Defense**: Guardrails in AI prompts that neutralize delimiter injection and prompt leaks.
- **Zero Secrets Leakage**: AI API keys and database credentials are strictly server-only (`.env.local` ignored by Git).
- **TypeScript Strict Mode**: Zero `any` types across the entire domain model and API layer.
- **Zero Hydration Mismatches**: Local storage synchronization occurs cleanly in client effects with `suppressHydrationWarning` on dynamic user identity displays.

---

## 🧪 Testing & Verification

The codebase includes an automated test suite executed with Vitest:

```bash
# Run unit test suite
npm test

# Run tests with coverage
npm test -- --coverage

# Run TypeScript typecheck
npm run typecheck

# Run ESLint analysis
npm run lint

# Production build check
npm run build
```

### Test Coverage Summary:
- **Budget Engine**: Integer precision, variance calculations, budget ceiling caps, health evaluations, reconciliation algorithms.
- **Timeline Engine**: Milestone calculations, milestone groupings, dependency validation, conflict detection.
- **Collaboration Engine**: Role hierarchy, capability permissions, invitation validation.
- **Export Engine**: Master Markdown generation, CSV format compliance.
- **Security Utilities**: In-memory rate limiting, IP isolation, input sanitization.
- **AI Provider**: Multi-provider fallback cascade, heuristic generation fallback.

---

## 🏁 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/yashharfode/eventora.git
cd eventora
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env.local
```
Add your OpenRouter key to enable live GenAI planning:
```env
AI_BASE_URL="https://openrouter.ai/api/v1"
AI_API_KEY="sk-or-v1-your-key-here"
AI_MODEL="nvidia/nemotron-3.5-super-vl:free"
```
*(Note: If no API key is provided, the built-in heuristic AI provider seamlessly generates realistic event plans locally without network calls).*

### 3. Start Development Server
```bash
npm run dev
```
Visit **http://localhost:3000** in your browser.

---

## 🚢 Continuous Integration

All pull requests and commits to `main` are continuously validated via GitHub Actions:
- Static analysis & linting (`eslint`)
- Type verification (`tsc --noEmit`)
- Domain unit test execution (`vitest`)
- Full production compilation (`next build`)

---

## 📄 License
This project is licensed under the MIT License.
