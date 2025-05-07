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

- Modular hooks for chat logic (`useAiChat` refactored into smaller hooks for UI wiring and state selection).
- **Service-based business logic:** All async flows and side effects (e.g., chat, About Me) are handled in dedicated service modules in `/services`, keeping hooks and components clean.
- Redux Toolkit for state management.
- Server components and API routes for secure data handling.
- All sensitive operations (logging, admin data) are server-only.
- Clear separation of concerns: UI, hooks, services, Redux, and API are modularized for scalability and maintainability.

<details>
<summary><strong>Project File Structure Overview</strong></summary>

```
/src
  /app
    store.ts                # Redux store configuration
  /components
    /ui                     # UI components (buttons, chat, feedback, etc.)
      ChatInput.tsx
      ChatMessageList.tsx
      AiChat.tsx
      ...
    /project                # Project-related UI components
      ProjectDetailsInline.tsx
      ...
  /features
    /aiChat
      aiChatSlice.ts        # Redux slice for chat state and actions
      aiChatTypes.ts        # TypeScript types for chat state (if present)
  /hooks
    useAiChat.ts            # Main chat logic hook (UI wiring, state selection)
    useChatScroll.ts        # Custom hook for auto-scrolling chat
    useAutoResizeTextarea.ts# Custom hook for textarea resizing
    useChatInput.ts         # Custom hook for chat input logic
  /knowledge
    projects.json           # Static knowledge base for projects
  /lib
    audio.ts                # Audio playback utilities
    chatApi.ts              # API calls for chat, TTS, etc.
    store.ts                # (May be duplicate, check usage)
  /services
    aboutMeService.ts       # Business logic for "About Me" chat flow
    sendMessageService.ts   # Business logic for sending chat messages
  /server
    /constants
      aiPrompts.ts          # System and AI prompt constants
  /state
    /aiChat
      aiChatSlice.ts        # (Legacy, see /features/aiChat)
      aiChatTypes.ts        # (Legacy, see /features/aiChat)
  /utils
    rateLimit.ts            # Rate limiting utilities (if present)
    validateRequest.ts      # Request validation utilities (if present)
  /__tests__
    ...                     # Unit and integration tests
  /app
    /api
      /chat
        route.ts            # API route for chat
        route.test.ts       # Tests for chat API route
    ClientRootProvider.tsx  # Root provider for client-side context
  constants/
    aiPrompts.ts            # (May be duplicate, check usage)
next.config.js              # Next.js configuration
tailwind.config.js          # Tailwind CSS configuration
.env, .env.local, etc.      # Environment variables
README.md                   # Project documentation
```

</details>

## How to Extend

- **Add a new chat/business flow:**
  1. Create a new service file in `/src/services` (e.g., `myFeatureService.ts`).
  2. Implement all async logic and side effects in this service.
  3. Call the service from your hook (e.g., `useAiChat`) or component.

- **Add a new UI component:**
  1. Add a new file to `/src/components/ui` or a relevant subfolder.
  2. Use Tailwind CSS and shadcn/ui for styling and consistency.

- **Add a new Redux slice:**
  1. Create a new slice in `/src/features` (e.g., `/features/myFeature/myFeatureSlice.ts`).
  2. Register the slice in the Redux store (`/src/app/store.ts`).

- **Add a new API route:**
  1. Add a new file to `/src/app/api` (e.g., `/api/my-feature/route.ts`).
  2. Implement server-side logic and use Supabase or other backends as needed.

- **Add new tests:**
  1. Place unit and integration tests in `/src/__tests__` or alongside the feature/component.

- **Add new static knowledge/data:**
  1. Place static JSON or data files in `/src/knowledge`.

- **Add new constants:**
  1. Place shared constants in `/src/server/constants` or `/src/constants`.

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OWASP Security Guide](https://owasp.org/www-project-web-security-testing-guide/)
