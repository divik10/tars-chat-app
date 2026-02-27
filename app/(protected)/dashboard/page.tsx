"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { Id } from "@/convex/_generated/dataModel";

export default function DashboardPage() {
  const { user } = useUser();
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip",
  );

  const setOnlineStatus = useMutation(api.users.setOnlineStatus);

  useEffect(() => {
    if (!user) return;

    void setOnlineStatus({ clerkId: user.id, isOnline: true });

    const handleBeforeUnload = () => {
      void setOnlineStatus({ clerkId: user.id, isOnline: false });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      void setOnlineStatus({ clerkId: user.id, isOnline: false });
    };
  }, [user, setOnlineStatus]);

  const handleSelectConversation = (id: Id<"conversations">) => {
    setSelectedConversationId(id);
    setMobileView("chat");
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col  bg-cover bg-center bg-fixed px-4 py-6 md:py-8">
      <div className="mx-auto flex h-[75vh] w-full max-w-5xl rounded-3xl border border-slate-300 bg-white/95 text-sm shadow-2xl backdrop-blur-sm">
        <div
          className={`h-full ${
            mobileView === "chat" ? "hidden md:flex" : "flex"
          } w-full md:w-72`}
        >
          <ChatSidebar
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onConversationCreated={handleSelectConversation}
            currentUserConvexId={currentUser?._id ?? null}
          />
        </div>
        <div
          className={`h-full flex-1 ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          <ChatWindow
            conversationId={selectedConversationId}
            currentUserConvexId={currentUser?._id ?? null}
            onBackToList={() => setMobileView("list")}
          />
        </div>
      </div>
    </main>
  );
}

