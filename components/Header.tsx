"use client";

import { UserButton, useUser } from "@clerk/nextjs";

export function Header() {
  const { user } = useUser();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">Tars Chat</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <span className="truncate max-w-[160px]">{user.fullName ?? user.username}</span>
            </div>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}

