# Classmosis — Development Guidelines

## Project
- **What:** K-8 classroom operating system — "Where learning flows"
- **Path:** `/Users/jessyglazewski/classmosis`
- **Domain:** classmosis.com
- **SEPARATE** from Lorespark (`/Users/jessyglazewski/Lorespark_Live`) and PopLit (`/Users/jessyglazewski/poplit`). Never mix code.

## Tech Stack
- Next.js 14 (App Router) + TypeScript (strict mode)
- Tailwind CSS + shadcn/ui (customized with Classmosis design tokens)
- Zustand (UI state only) + TanStack Query (server state)
- React Hook Form + Zod (forms + validation)
- Supabase (Postgres + Auth + Storage + Realtime + Edge Functions)
- Lucide React (icons)
- Bun (NOT npm) for all package operations

## Commands
- Dev server: `bun run dev` (localhost:3001)
- Lint: `bun run lint`
- Install packages: `bun add <package>`
- Supabase local: `bunx supabase start` / `bunx supabase stop`
- Supabase migrations: `bunx supabase db reset`

## Coding Conventions
- TypeScript strict mode — no `any` types
- Tailwind CSS for all styling — NOT inline styles
- Zustand for UI state (modals, drag state, active class). TanStack Query for server state.
- Zod schemas for all API input validation
- All Supabase tables must have RLS policies — never authorize only in application code
- All coin calculations go through `lib/economy/` — never inline
- All AI calls go through `lib/anthropic/` — never inline
- Every student-facing string uses growth language — never deficit language ("failing", "below basic")
- Prefer editing existing files over creating new ones
- No CSS files beyond globals.css — use Tailwind utilities

## File Organization
- `app/(auth)/` — login, signup, onboarding
- `app/(teacher)/` — teacher dashboard and tools
- `app/(student)/` — student portal
- `app/(parent)/` — parent/family portal
- `app/api/v1/` — API routes
- `components/ui/` — shadcn/ui base components
- `components/shared/` — shared layout components
- `lib/supabase/` — Supabase clients and types
- `stores/` — Zustand stores
- `types/` — TypeScript type definitions
- `supabase/migrations/` — database migrations
