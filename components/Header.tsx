"use client";

import { useUser, UserButton } from "@clerk/nextjs";

export function Header() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/60 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        
        {/* Left - App Title */}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
          Tars Chat
        </h1>

        {/* Right - User Info */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden text-sm font-medium text-slate-900 md:block">
              {user.fullName ?? user.username}
            </span>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}