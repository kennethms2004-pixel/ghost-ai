No open issues.

## Resolved

1. ~~When I login everything is fine, but when I logout Next.js renders infinitely.~~ Fixed: set `afterSignOutUrl="/sign-in"` on `ClerkProvider` so logout lands on the public sign-in page instead of bouncing through `/`'s auth redirect during sign-out handshake.
