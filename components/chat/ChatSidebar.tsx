"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatMessageTimestamp } from "@/lib/date";

type ChatSidebarProps = {
  selectedConversationId: Id<"conversations"> | null;
  onSelectConversation: (conversationId: Id<"conversations">) => void;
  onConversationCreated: (conversationId: Id<"conversations">) => void;
  currentUserConvexId: Id<"users"> | null;
};

export function ChatSidebar({
  selectedConversationId,
  onSelectConversation,
  onConversationCreated,
  currentUserConvexId,
}: ChatSidebarProps) {
  const { user } = useUser();
  const [search, setSearch] = useState("");

  const users = useQuery(
    api.conversations.listUsersForSidebar,
    user ? { currentClerkId: user.id } : "skip",
  );

  const conversations = useQuery(
    api.conversations.listConversationsForUser,
    currentUserConvexId ? { userId: currentUserConvexId } : "skip",
  );

  const startConversation = useMutation(api.conversations.startConversation);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => u.name.toLowerCase().includes(term));
  }, [users, search]);

  const handleUserClick = async (userId: Id<"users">) => {
    if (!currentUserConvexId) return;
    const ordered = [currentUserConvexId, userId].sort() as [
      Id<"users">,
      Id<"users">
    ];
    const conversationId = await startConversation({
      userAId: ordered[0],
      userBId: ordered[1],
    });
    onConversationCreated(conversationId);
    onSelectConversation(conversationId);
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-foreground/10 bg-slate-50 shadow-sm md:w-72">
      <div className="border-b border-foreground/10 p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full rounded-md border border-foreground/10 bg-background px-2 py-1 text-sm outline-none focus:border-foreground/40"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <SectionTitle label="Conversations" />
        {conversations === undefined && (
          <div className="px-3 py-2 text-xs text-foreground/60">
            Loading conversations...
          </div>
        )}
        {conversations && conversations.length === 0 && (
          <div className="px-3 py-2 text-xs text-foreground/60">
            No conversations yet. Start one from the user list below.
          </div>
        )}
        {conversations &&
          conversations.map((conv) => {
            const other = conv.otherUsers[0];
            const timestamp = formatMessageTimestamp(conv.updatedAt);
            return (
              <button
                key={conv.conversationId}
                onClick={() => onSelectConversation(conv.conversationId)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                  selectedConversationId === conv.conversationId
                    ? "bg-sky-100/80 text-slate-900"
                    : "hover:bg-slate-100/70"
                }`}
              >
                <Avatar src={other?.imageUrl} alt={other?.name ?? "User"} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {other?.name ?? "Unknown"}
                    </span>
                    <span className="shrink-0 text-[10px] text-foreground/45">
                      {timestamp}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-xs text-foreground/60">
                      {conv.lastMessage?.content ?? "No messages yet"}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-1 shrink-0 rounded-full bg-sky-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

        <SectionTitle label="People" />
        {filteredUsers.length === 0 && (
          <div className="px-3 py-2 text-xs text-foreground/60">
            {search ? "No users match your search." : "No other users yet."}
          </div>
        )}
        {filteredUsers.map((u) => (
          <button
            key={u._id}
            onClick={() => handleUserClick(u._id)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-100/70"
          >
            <div className="relative">
              <Avatar src={u.imageUrl} alt={u.name} />
              {u.isOnline && (
                <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
              )}
            </div>
            <div className="flex flex-1 items-center justify-between">
              <span className="truncate">{u.name}</span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-foreground/50">
      {label}
    </div>
  );
}

function Avatar({ src, alt }: { src?: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-8 w-8 rounded-full object-cover"
    />
  );
}

