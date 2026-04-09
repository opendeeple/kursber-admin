# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Type check + production build (tsc -b && vite build)
npm run typecheck    # TypeScript type check only (no emit)
npm run preview      # Preview production build
```

No test runner or linter is configured.

## Environment

Requires a `.env` file with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Architecture

This is a React 19 + TypeScript SPA (Vite) for managing a currency exchange service. Backend is entirely Supabase (PostgreSQL + Auth).

**Routing** is custom and manual — `App.tsx` uses `window.history.pushState` directly. There is no React Router. Routes: `/`, `/apps`, `/rates`, `/users`, `/settings`, `/setup`.

**Auth** lives in `src/lib/auth-context.tsx` as a React Context. The `useAuth()` hook provides `user`, `signIn`, and `signOut`. Protected routes redirect to `/login` when `user` is null.

**Database types** are defined in `src/lib/supabase.ts` as a `Database` TypeScript type. Tables: `admin_users`, `apps`, `end_users`, `analytics_clicks`, `app_settings`.

**Pages** (`src/pages/`) handle their own data fetching via `useEffect` + Supabase SDK calls, local state via `useState`, and mutations with toast feedback via Sonner.

**UI** is shadcn/ui (New York style) built on Radix UI primitives, styled with Tailwind CSS v4. All base components live in `src/components/ui/`. Path alias `@/` resolves to `src/`.

**Forms** use React Hook Form + Zod resolvers for validation.

**All UI text is in Uzbek** — no i18n library, strings are hardcoded.

## First-Time Setup

See `SETUP_GUIDE.md` for the database setup and first super admin creation flow. The `/setup` route is a one-time page gated by checking whether any `admin_users` row exists.
