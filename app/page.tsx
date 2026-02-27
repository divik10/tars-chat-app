import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050608]">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 text-center text-zinc-100">
        <div className="inline-flex flex-col gap-3">
          <span className="rounded-full bg-zinc-900/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
            Realtime messaging for teams
          </span>
          <h1 className="bg-gradient-to-br from-zinc-50 via-zinc-200 to-zinc-400 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl">
            Tars Chat
          </h1>
        </div>

        <p className="max-w-2xl text-base text-zinc-400 sm:text-lg">
          A focused, real-time chat experience built with Next.js 14, Clerk, and Convex.
          Dark, minimal, and ready for your team&apos;s conversations.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/sign-in"
            className="rounded-full bg-zinc-100 px-6 py-2.5 text-sm font-medium text-black shadow-sm hover:bg-white/90"
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            className="rounded-full border border-zinc-600/80 bg-zinc-900/40 px-6 py-2.5 text-sm font-medium text-zinc-100 hover:bg-zinc-900"
          >
            Create account
          </a>
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          Built with TypeScript, Tailwind CSS, Clerk auth, and Convex realtime backend.
        </p>
      </div>
    </div>
  );
}
