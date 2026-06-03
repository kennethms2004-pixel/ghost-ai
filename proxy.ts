import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// The Clerk URL env vars may be absolute URLs (e.g. an Account Portal on
// another domain). createRouteMatcher matches request pathnames, so extract
// the pathname before building patterns.
function toPathname(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    try {
      return new URL(value).pathname
    } catch {
      return fallback
    }
  }
  return value
}

const signInUrl = toPathname(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL, '/sign-in')
const signUpUrl = toPathname(process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL, '/sign-up')

// Public routes: the redirect entry point and the Clerk auth pages.
// Everything else is protected by default.
const isPublicRoute = createRouteMatcher(['/', `${signInUrl}(.*)`, `${signUpUrl}(.*)`])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/(.*)',
    '/(api|trpc)(.*)',
  ],
}
