# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Foundation

## Current Goal

Editor home screen and project dialogs (create/rename/delete) wired with mock data. Ready for real project persistence (API + Prisma).

## Completed

- **01-design-system**: shadcn/ui initialized (Tailwind v4, base-nova style); Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea added; lucide-react installed; `lib/utils.ts` with `cn()` helper created; `globals.css` rewritten with full dark-only theme — project CSS custom properties (`--bg-base`, `--bg-surface`, `--text-primary`, `--accent-primary`, etc.) defined in `:root` and mapped to Tailwind tokens via `@theme inline`; shadcn semantic vars (`--background`, `--foreground`, etc.) mapped to project dark palette.
- **02-editor**: `components/editor/editor-navbar.tsx` — fixed-height top navbar (h-12), left toggle button using `PanelLeftOpen`/`PanelLeftClose` based on sidebar state, dark bg-surface with bottom border; `components/editor/project-sidebar.tsx` — floating overlay sidebar (z-50, no content push), slides in from left (translate-x transition), accepts `isOpen`/`onClose` props, "Projects" header with close button, shadcn Tabs (My Projects / Shared) with empty placeholder states, full-width "New Project" button with Plus icon at bottom.
- **04-project-dialogs**: Editor home screen and project create/rename/delete dialogs, mock data only (no API/persistence). `app/editor/page.tsx` now renders `components/editor/editor-home.tsx` — centered, card-less heading "Create a project or open an existing one" + description + `New Project` button (Plus icon) that opens the Create dialog. `hooks/use-project-dialogs.ts` is the dedicated hook owning dialog kind (`create`/`rename`/`delete`), the active project, the controlled name field, and the `isSubmitting` flag; submit handlers simulate the async round-trip (350ms) then close. `components/editor/project-dialogs-provider.tsx` calls the hook once, exposes `openCreate/openRename/openDelete` via context, and renders the three dialogs at the top of the editor tree — so both the sidebar and the editor home share one dialog instance. `EditorShell` wraps its tree in `ProjectDialogsProvider`. Dialogs (`components/editor/dialogs/*`): Create has a live `slugify()` preview that updates as you type; Rename prefills + auto-focuses/selects the name (Enter submits, current name shown in description); Delete is a destructive-only confirmation with no input. Sidebar (`project-sidebar.tsx`) renders mock owned/shared lists via `project-list-item.tsx`; owned items get a `MoreHorizontal` dropdown (Rename/Delete), actions hidden for shared/collaborator projects. Mobile: outside-tap closes the sidebar and a `bg-black/60 md:bg-transparent` scrim is shown. `slugify()` added to `lib/utils.ts`; `types/project.ts` + `lib/mock-projects.ts` added. `dropdown-menu` shadcn component (base-ui Menu) added. Build + lint pass.
- **03-auth**: Clerk wired into the app. `@clerk/ui` installed; `ClerkProvider` wraps the root layout in `app/layout.tsx` using the `dark` theme from `@clerk/ui/themes`, with appearance `variables` mapped to the app's CSS custom properties (no hardcoded colors). Editor chrome (`EditorShell`) relocated out of the root layout into a new `/editor` segment (`app/editor/layout.tsx` + placeholder `page.tsx`). `app/page.tsx` now redirects: authenticated → `/editor`, unauthenticated → `/sign-in`. Auth pages live under an `(auth)` route group with a shared two-panel layout (left: logo + tagline + text feature list, hidden below `lg`; right: centered Clerk form); `app/(auth)/sign-in/[[...sign-in]]/page.tsx` and `sign-up/[[...sign-up]]/page.tsx` render `<SignIn>`/`<SignUp>`. Route protection via `proxy.ts` at the root (Next 16 replacement for `middleware.ts`, which was deleted) — protected-first: public routes (`/`, sign-in, sign-up) derived from `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`NEXT_PUBLIC_CLERK_SIGN_UP_URL` env vars, everything else `auth.protect()`. Clerk's built-in `UserButton` added to the editor navbar right section. `npm run build` passes.

## In Progress

## Next Up

## Open Questions

## Architecture Decisions

- Project dialog state is owned by one `useProjectDialogs` hook instance, lifted into `ProjectDialogsProvider` (rendered inside `EditorShell`) and shared via context. Both the sidebar and the editor home screen open the same dialogs, which are rendered once at the top of the editor tree rather than duplicated per trigger.
- Editor chrome lives at `/editor`, not the root route. The root layout holds only `ClerkProvider` + fonts; the `EditorShell` (navbar + sidebar) is the layout for the `/editor` segment so auth pages and the `/` redirect render without editor chrome.
- Clerk URL env vars added to `.env.local`: `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, and the two `*_FALLBACK_REDIRECT_URL` vars (both `/editor`). Standard Clerk names — none invented.
- `@clerk/ui` v1.15 appearance schema uses `colorForeground`/`colorPrimaryForeground`/`colorInput`/`colorMuted` naming (not the older `colorText`/`colorInputBackground`).

## Session Notes

- **Post-logout infinite render fix**: logout had no `afterSignOutUrl`, so Clerk's default landing was `/` — a server route that recomputes auth and `redirect()`s. Landing a just-signed-out user there bounced during the sign-out handshake settling, leaving Next's dev "Rendering …" indicator stuck. Fixed by setting `afterSignOutUrl="/sign-in"` on `<ClerkProvider>` (`app/layout.tsx`) so logout lands directly on the public, terminal sign-in page. Verified routing resolves in single 307s (`/`→`/sign-in`, `/editor`→`/sign-in?redirect_url=…`, `/sign-in`→200); build passes.
