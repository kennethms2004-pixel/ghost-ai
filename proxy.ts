import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in'
const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up'

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
