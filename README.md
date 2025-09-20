# Bias Kaleidoscope

Bias Kaleidoscope is a full-stack Next.js platform that reveals, quantifies, and mitigates bias across prompts, datasets, and hiring artifacts. It ships with a sandbox for counterfactual testing, a fix mode for mitigation previews, HR tooling for job descriptions and CVs, and a public-facing audit card generator.

## Features

- **Sandbox:** run counterfactual analyses with demographic placeholders, tweak controls (skew, weighting, temperature, top_p) and visualise variance.
- **Fix mode:** apply guided mitigations and preview parity improvements with audit-ready notes.
- **HR mode:** upload job descriptions and CVs, detect gendered wording, readability issues, salary transparency gaps, and produce improved copy.
- **Reports:** publish audit cards with shareable badges and downloadable PDFs.
- **Worker:** BullMQ-powered background worker ready for batch counterfactual jobs.
- **Database:** Prisma schema targeting PostgreSQL (Supabase friendly) with seeds for a demo workspace.
- **Testing:** Vitest unit coverage for metrics + Playwright smoke test scaffold for the public report view.

## Getting started

### Prerequisites

- Node.js 18+
- pnpm, npm, or yarn
- PostgreSQL database (Supabase works great)
- Redis instance for BullMQ (local Redis is fine)

### Installation

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

Populate a `.env` based on `.env.example`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bias_kaleidoscope"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Development

```bash
pnpm dev
```

The app lives at `http://localhost:3000`. Try the Sandbox to run a counterfactual test, hop into Fix mode to apply mitigations, and use HR mode to generate an improved JD plus audit card.

To launch the worker:

```bash
pnpm worker
```

### Testing

Unit tests are powered by Vitest and e2e smoke tests by Playwright.

```bash
pnpm test:unit
pnpm test:e2e
```

### Project structure

- `app/` – Next.js App Router pages, including sandbox, fix, HR, reports, labs, and settings.
- `app/api/` – API routes (runs, fixes, HR analyzer, reports, and PDF export) with Zod validation.
- `components/` – UI primitives, sandbox playground, fix mode, HR analyzer, report previews.
- `lib/` – Metrics engine, counterfactual generator, HR heuristics, Prisma client, badge generator, PDF renderer.
- `prisma/` – Schema, migrations, and seed script.
- `src/worker/` – BullMQ worker entry point.
- `tests/` – Vitest unit tests and Playwright smoke tests.

### Seeds

Run `pnpm prisma:seed` to create a demo organisation, project, and example runs. Additional prompt, JD, and CV examples live in `data/seeds.ts` and are wired into the UI.

### Screenshots

_Placeholder: add screenshots of the Sandbox, Fix mode, and HR mode once you run the app locally._

## Roadmap

- Plug in real sentiment analysis + model integrations.
- Persist counterfactual outcomes per variant and expose history in the dashboard.
- Expand HR heuristics (salary benchmarks, requirement inflation scoring).
- Add billing integration and usage tracking.
- Harden PDF generation with signed URLs.

## License

MIT
