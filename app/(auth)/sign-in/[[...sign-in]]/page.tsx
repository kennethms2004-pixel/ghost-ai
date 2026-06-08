import Link from "next/link";
import { Ghost } from "lucide-react";
import { SignIn } from "@clerk/nextjs";
import { authAppearance } from "../../clerk-appearance";

export default function SignInPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col gap-6">
        {/* Brand — shown only on mobile, where the layout's left panel is hidden. */}
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <Ghost className="h-5 w-5 text-brand" />
          <span className="text-lg font-semibold text-copy-primary">
            Ghost AI
          </span>
        </Link>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold text-copy-primary">
            Welcome back
          </h1>
          <p className="text-sm text-copy-muted">
            Sign in to continue to your workspace.
          </p>
        </div>
      </div>

      <SignIn appearance={authAppearance} />
    </div>
  );
}
