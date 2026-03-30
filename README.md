# CLIIX MVP Foundation

This repository contains a freshly scaffolded **Next.js App Router + TypeScript** project with a feature-oriented folder layout aligned to the MVP Technical Requirements Document (TRD).

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment template and populate values:

   ```bash
   cp .env.example .env.local
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

## Architecture boundaries

The codebase is organized by **routes, features, shared libraries, and reusable UI**.

```text
src/
  app/                 # App Router entrypoints (route segments, layouts, pages)
  features/
    auth/              # Authentication flows and session UX
    profile/           # Profile editing and account data
    links/             # Link CRUD, ordering, presentation rules
    themes/            # Theme selection and visual customization
    analytics/         # Metrics collection and reporting views
    public-page/       # Public-facing profile/link page rendering
  lib/
    supabase/          # Supabase clients, auth helpers, typed data access
    validation/        # Shared zod schemas and input constraints
  components/
    ui/                # Design-system level primitives and shared components
```

### Rules of modularity

- Keep domain logic inside each `src/features/<domain>` module.
- Use `src/lib/*` only for cross-feature infrastructure and shared utilities.
- Keep route files in `src/app` thin; compose feature modules there.
- Share reusable presentational components via `src/components/ui`.

## MVP scope alignment

This scaffold intentionally includes the baseline stack from the TRD:

- **Framework:** Next.js App Router + TypeScript
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **Forms:** React Hook Form
- **Client state:** Zustand
- **Backend integration contract:** Supabase env vars in `.env.example`

Initial scope targets:

- Authenticated user onboarding
- Profile and links management
- Theme selection
- Public profile page delivery
- Basic analytics surfaces

Implementation details for these features should be added incrementally within each module boundary.
