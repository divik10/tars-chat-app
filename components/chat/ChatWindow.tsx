"use client";

import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type ChatWindowProps = {
  conversationId: string | null;
  currentUserConvexId: string | null;
};

export function ChatWindow({
  conversationId,
  currentUserConvexId,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [lastTypedAt, setLastTypedAt] = useState(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const messages = useQuery(
    api.messages.listForConversation,
    conversationId ? { conversationId: conversationId as any } : "skip",
  );

  const typingUsers = useQuery(
    api.conversations.typingForConversation,
    conversationId && currentUserConvexId
      ? {
        conversationId: conversationId as any,
        userId: currentUserConvexId as any,
      }
      : "skip",
  );

  const sendMessage = useMutation(api.messages.sendMessage);
  const markRead = useMutation(api.conversations.markConversationRead);
  const setTyping = useMutation(api.conversations.setTyping);

  useEffect(() => {
    if (conversationId && currentUserConvexId) {
      void markRead({
        conversationId: conversationId as any,
        userId: currentUserConvexId as any,
      });
    }
  }, [conversationId, currentUserConvexId, markRead]);

  useEffect(() => {
    if (!messages) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!conversationId || !currentUserConvexId) return;
    const trimmed = input.trim();
    if (!trimmed) return;

    await sendMessage({
      conversationId: conversationId as any,
      senderId: currentUserConvexId as any,
      content: trimmed,
    });

    setInput("");
    setLastTypedAt(0);
    void setTyping({
      conversationId: conversationId as any,
      userId: currentUserConvexId as any,
      isTyping: false,
    });
  };

  const handleChange = (value: string) => {
    setInput(value);
    const now = Date.now();
    setLastTypedAt(now);

    if (!conversationId || !currentUserConvexId) return;

    void setTyping({
      conversationId: conversationId as any,
      userId: currentUserConvexId as any,
      isTyping: true,
    });

    // Schedule a stop-typing update after 2 seconds of inactivity
    setTimeout(() => {
      if (Date.now() - now >= 1900) {
        void setTyping({
          conversationId: conversationId as any,
          userId: currentUserConvexId as any,
          isTyping: false,
        });
      }
    }, 2000);
  };

  if (!conversationId) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-sm text-foreground/60">
        Select a conversation or start a new one from the sidebar.
      </div>
    );
  }

  return (
    <section className="flex h-full flex-1 flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto bg-background px-4 py-3 text-sm">
        {messages === undefined && (
          <div className="text-xs text-foreground/60">
            Loading messages...
          </div>
        )}
        {messages && messages.length === 0 && (
          <div className="text-xs text-foreground/60">
            No messages yet. Start the conversation.
          </div>
        )}
        {messages &&
          messages.map((m) => {
            const isMine = m.sender._id === currentUserConvexId;
            return (
              <div
                key={m._id}
                className={`flex gap-2 ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                {!isMine && (
                  <Avatar
                    src={m.sender.imageUrl}
                    alt={m.sender.name}
                  />
                )}
                <div
                  className={`max-w-xs rounded-2xl px-3 py-1.5 text-xs ${
                    isMine
                      ? "bg-foreground text-background"
                      : "bg-foreground/10 text-foreground"
                  }`}
                >
                  {!isMine && (
                    <div className="mb-0.5 text-[10px] font-semibold opacity-80">
                      {m.sender.name}
                    </div>
                  )}
                  <div>{m.content}</div>
                </div>
              </div>
            );
          })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t bg-background px-4 py-2">
        {typingUsers && typingUsers.length > 0 && (
          <div className="pb-1 text-[11px] text-foreground/60">
            {typingUsers[0].name} is typing...
          </div>
        )}
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            rows={1}
            placeholder="Type a message..."
            className="max-h-24 flex-1 resize-none rounded-md border border-foreground/10 bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/40"
          />
          <button
            onClick={handleSend}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-50"
            disabled={!input.trim() || !conversationId}
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}

function Avatar({ src, alt }: { src?: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-7 w-7 rounded-full object-cover"
    />
  );
}

