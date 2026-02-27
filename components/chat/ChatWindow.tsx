"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  formatMessageDateLabel,
  formatMessageTimestamp,
} from "@/lib/date";

type ChatWindowProps = {
  conversationId: Id<"conversations"> | null;
  currentUserConvexId: Id<"users"> | null;
  onBackToList?: () => void;
};

export function ChatWindow({
  conversationId,
  currentUserConvexId,
  onBackToList,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAtBottomRef = useRef(true);
  const previousLengthRef = useRef(0);

  const messages = useQuery(
    api.messages.listForConversation,
    conversationId ? { conversationId } : "skip"
  );

  const typingUsers = useQuery(
    api.conversations.typingForConversation,
    conversationId && currentUserConvexId
      ? { conversationId, userId: currentUserConvexId }
      : "skip"
  );

  const sendMessage = useMutation(api.messages.sendMessage);
  const markRead = useMutation(api.conversations.markConversationRead);
  const setTyping = useMutation(api.conversations.setTyping);

  useEffect(() => {
    if (conversationId && currentUserConvexId) {
      void markRead({ conversationId, userId: currentUserConvexId });
    }
  }, [conversationId, currentUserConvexId, markRead]);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    isAtBottomRef.current = true;
    setHasNewMessages(false);
  };

  useEffect(() => {
    if (!messages) return;
    const length = messages.length;
    const prev = previousLengthRef.current;
    previousLengthRef.current = length;

    if (isAtBottomRef.current || prev === 0) {
      scrollToBottom(prev === 0 ? "auto" : "smooth");
      return;
    }

    if (length > prev) {
      setHasNewMessages(true);
    }
  }, [messages]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const threshold = 32;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;

    const atBottom = distanceFromBottom <= threshold;
    isAtBottomRef.current = atBottom;

    if (atBottom) setHasNewMessages(false);
  };

  const handleSend = async () => {
    if (!conversationId || !currentUserConvexId) return;
    const trimmed = input.trim();
    if (!trimmed) return;

    await sendMessage({
      conversationId,
      senderId: currentUserConvexId,
      content: trimmed,
    });

    setInput("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    void setTyping({
      conversationId,
      userId: currentUserConvexId,
      isTyping: false,
    });
  };

  const handleChange = (value: string) => {
    setInput(value);

    if (!conversationId || !currentUserConvexId) return;

    void setTyping({
      conversationId,
      userId: currentUserConvexId,
      isTyping: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      void setTyping({
        conversationId,
        userId: currentUserConvexId,
        isTyping: false,
      });
    }, 2000);
  };

  if (!conversationId) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-sm text-foreground/60">
        Select a conversation.
      </div>
    );
  }

  return (
    <section className="flex h-full flex-1 flex-col">
      <div className="relative flex-1 bg-background text-sm">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex h-full flex-col space-y-2 overflow-y-auto px-4 py-4"
        >
          {messages?.map((m, index) => {
            const isMine = m.sender._id === currentUserConvexId;
            const previous = index > 0 ? messages[index - 1] : null;

            const showDateDivider =
              !previous ||
              new Date(previous.createdAt).toDateString() !==
                new Date(m.createdAt).toDateString();

            return (
              <div key={m._id} className="space-y-2">
                {showDateDivider && (
                  <div className="flex items-center justify-center text-[11px] text-foreground/40">
                    {formatMessageDateLabel(m.createdAt)}
                  </div>
                )}

                <div
                  className={`flex ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-3 py-1.5 text-xs shadow-sm ${
                      isMine
                        ? "bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-600 text-white"
                        : "bg-foreground/[0.06] text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>

                <div className="text-[10px] text-foreground/40">
                  {formatMessageTimestamp(m.createdAt)}
                </div>
              </div>
            );
          })}
        </div>

        {hasNewMessages && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-3 right-4 rounded-full bg-sky-600 px-3 py-1 text-xs text-white"
          >
            ↓ New messages
          </button>
        )}
      </div>

      <div className="border-t border-foreground/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            rows={1}
            className="flex-1 resize-none rounded-md border px-3 py-1.5 text-sm"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background"
            disabled={!input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}