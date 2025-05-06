This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Tech Stack

- **Next.js** (App Router, React Server Components)
- **React** (functional components, hooks)
- **Redux Toolkit** (state management)
- **shadcn/ui** (UI components)
- **Tailwind CSS** (utility-first styling)
- **Supabase** (auth, database, RLS, logging)
- **Jest** & **React Testing Library** (testing)

## Features

- Modern chat UI with loader, TTS, and Unsplash image support
- Social/contact links and project slider
- Chat history persistence and clear chat feature
- Modular hooks for maintainability
- Admin-only LLM log viewing page (`/admin/llm-logs`)
- LLM interaction logging to Supabase
- Secure authentication with Supabase Auth
- Middleware-protected admin routes

## Supabase Setup & Environment Variables

- **Auth:** Uses Supabase password-based authentication. Only `/admin/llm-logs` and related API routes are protected; the rest of the app is public.
- **Environment Variables:**
  - `NEXT_PUBLIC_SUPABASE_URL` – public, used on both client and server
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – public, used on both client and server
  - `SUPABASE_SERVICE_ROLE_KEY` – **private, server-only**. Never use `NEXT_PUBLIC_` or expose to client code. Only use in server-side utilities (e.g., `src/server/lib/llmLogger.ts`).
- **RLS (Row Level Security):**
  - Enabled on the `llm_logs` table.
  - Separate policies for `INSERT` (allow authenticated users to write) and `SELECT` (allow authenticated users to read).
  - Server-side logging uses the service role key to bypass RLS for inserts.

## LLM Logging

- All LLM interactions (chat, TTS, OpenAI, knowledge) are logged to the `llm_logs` table in Supabase.
- Logging is performed server-side using the service role key for security.
- The admin log page fetches logs using the anon key and RLS SELECT policy.
- Never expose the service role key to the client.

## Security Notes

- Only use `SUPABASE_SERVICE_ROLE_KEY` in server-side code. Never prefix with `NEXT_PUBLIC_`.
- Middleware restricts access to `/admin/llm-logs` and related API routes to authenticated users.
- All other routes remain public.
- Follow OWASP and Supabase security best practices.

## Architecture Decisions

- Modular hooks for chat logic (`useAiChat` refactored into smaller hooks).
- Redux Toolkit for state management.
- Server components and API routes for secure data handling.
- All sensitive operations (logging, admin data) are server-only.

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OWASP Security Guide](https://owasp.org/www-project-web-security-testing-guide/)
