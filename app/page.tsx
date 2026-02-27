import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Tars Chat</h1>
        <p className="text-sm text-foreground/70">
          Real-time chat app powered by Next.js 14, Clerk authentication, and Convex.
        </p>
        <div className="mt-4 flex gap-3">
          <a
            href="/sign-in"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            className="rounded-md border border-foreground/30 px-4 py-2 text-sm font-medium"
          >
            Create account
          </a>
        </div>
      </div>
    </div>
  );
}
