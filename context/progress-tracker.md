# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Foundation

## Current Goal

Clerk authentication wired in. Ready for next feature unit (projects / canvas).

## Completed

- **01-design-system**: shadcn/ui initialized (Tailwind v4, base-nova style); Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea added; lucide-react installed; `lib/utils.ts` with `cn()` helper created; `globals.css` rewritten with full dark-only theme — project CSS custom properties (`--bg-base`, `--bg-surface`, `--text-primary`, `--accent-primary`, etc.) defined in `:root` and mapped to Tailwind tokens via `@theme inline`; shadcn semantic vars (`--background`, `--foreground`, etc.) mapped to project dark palette.
- **02-editor**: `components/editor/editor-navbar.tsx` — fixed-height top navbar (h-12), left toggle button using `PanelLeftOpen`/`PanelLeftClose` based on sidebar state, dark bg-surface with bottom border; `components/editor/project-sidebar.tsx` — floating overlay sidebar (z-50, no content push), slides in from left (translate-x transition), accepts `isOpen`/`onClose` props, "Projects" header with close button, shadcn Tabs (My Projects / Shared) with empty placeholder states, full-width "New Project" button with Plus icon at bottom.
- **03-auth**: Clerk wired into the app. `@clerk/ui` installed; `ClerkProvider` wraps the root layout in `app/layout.tsx` using the `dark` theme from `@clerk/ui/themes`, with appearance `variables` mapped to the app's CSS custom properties (no hardcoded colors). Editor chrome (`EditorShell`) relocated out of the root layout into a new `/editor` segment (`app/editor/layout.tsx` + placeholder `page.tsx`). `app/page.tsx` now redirects: authenticated → `/editor`, unauthenticated → `/sign-in`. Auth pages live under an `(auth)` route group with a shared two-panel layout (left: logo + tagline + text feature list, hidden below `lg`; right: centered Clerk form); `app/(auth)/sign-in/[[...sign-in]]/page.tsx` and `sign-up/[[...sign-up]]/page.tsx` render `<SignIn>`/`<SignUp>`. Route protection via `proxy.ts` at the root (Next 16 replacement for `middleware.ts`, which was deleted) — protected-first: public routes (`/`, sign-in, sign-up) derived from `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`NEXT_PUBLIC_CLERK_SIGN_UP_URL` env vars, everything else `auth.protect()`. Clerk's built-in `UserButton` added to the editor navbar right section. `npm run build` passes.

## In Progress

## Next Up

## Open Questions

## Architecture Decisions

- Editor chrome lives at `/editor`, not the root route. The root layout holds only `ClerkProvider` + fonts; the `EditorShell` (navbar + sidebar) is the layout for the `/editor` segment so auth pages and the `/` redirect render without editor chrome.
- Clerk URL env vars added to `.env.local`: `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, and the two `*_FALLBACK_REDIRECT_URL` vars (both `/editor`). Standard Clerk names — none invented.
- `@clerk/ui` v1.15 appearance schema uses `colorForeground`/`colorPrimaryForeground`/`colorInput`/`colorMuted` naming (not the older `colorText`/`colorInputBackground`).

## Session Notes

- **Post-logout infinite render fix**: logout had no `afterSignOutUrl`, so Clerk's default landing was `/` — a server route that recomputes auth and `redirect()`s. Landing a just-signed-out user there bounced during the sign-out handshake settling, leaving Next's dev "Rendering …" indicator stuck. Fixed by setting `afterSignOutUrl="/sign-in"` on `<ClerkProvider>` (`app/layout.tsx`) so logout lands directly on the public, terminal sign-in page. Verified routing resolves in single 307s (`/`→`/sign-in`, `/editor`→`/sign-in?redirect_url=…`, `/sign-in`→200); build passes.
