import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all other users for the sidebar
export const listUsersForSidebar = query({
  args: {
    currentClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => u.clerkId !== args.currentClerkId)
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Get or create a one-on-one conversation between two users
export const startConversation = mutation({
  args: {
    userAId: v.id("users"),
    userBId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const participantIds = [args.userAId, args.userBId];

    // Try to find existing 1-1 conversation with these two participants
    const existing = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.and(
          q.eq(q.field("isGroup"), false),
          q.eq(q.field("participants"), participantIds),
        ),
      )
      .first();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();

    const conversationId = await ctx.db.insert("conversations", {
      participants: participantIds,
      lastMessageId: undefined,
      updatedAt: now,
      isGroup: false,
      name: undefined,
    });

    // Initialize per-user state
    for (const userId of participantIds) {
      await ctx.db.insert("conversationMembers", {
        conversationId,
        userId,
        lastReadAt: now,
        isTyping: false,
        typingUpdatedAt: now,
      });
    }

    return conversationId;
  },
});

// List conversations for a given user with denormalized info
export const listConversationsForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const result = [];

    for (const member of memberships) {
      const conversation = await ctx.db.get(member.conversationId);
      if (!conversation) continue;

      // Find other participants
      const otherParticipantIds = conversation.participants.filter(
        (id) => id !== args.userId,
      );

      const otherUsers = await Promise.all(
        otherParticipantIds.map((id) => ctx.db.get(id)),
      );

      const lastMessage = conversation.lastMessageId
        ? await ctx.db.get(conversation.lastMessageId)
        : null;

      // Compute unread count
      const unreadMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conversation._id),
        )
        .filter((q) => q.gt(q.field("createdAt"), member.lastReadAt))
        .collect();

      result.push({
        conversationId: conversation._id,
        updatedAt: conversation.updatedAt,
        lastMessage: lastMessage
          ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
          }
          : null,
        unreadCount: unreadMessages.length,
        otherUsers: otherUsers.filter(Boolean).map((u) => ({
          _id: u!._id,
          name: u!.name,
          imageUrl: u!.imageUrl,
          isOnline: u!.isOnline,
        })),
      });
    }

    // Sort newest first
    result.sort((a, b) => b.updatedAt - a.updatedAt);
    return result;
  },
});

// Update lastReadAt when user opens a conversation
export const markConversationRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) =>
        q.eq("userId", args.userId).eq("conversationId", args.conversationId),
      )
      .first();

    if (!membership) return;

    await ctx.db.patch(membership._id, {
      lastReadAt: Date.now(),
    });
  },
});

// Typing indicator state
export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) =>
        q.eq("userId", args.userId).eq("conversationId", args.conversationId),
      )
      .first();

    if (!membership) return;

    await ctx.db.patch(membership._id, {
      isTyping: args.isTyping,
      typingUpdatedAt: Date.now(),
    });
  },
});

export const typingForConversation = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    const now = Date.now();
    const typingUsers = [];

    for (const member of memberships) {
      if (member.userId === args.userId) continue;
      if (!member.isTyping) continue;
      // Drop stale indicators after 2 seconds
      if (now - member.typingUpdatedAt > 2000) continue;

      const user = await ctx.db.get(member.userId);
      if (!user) continue;
      typingUsers.push({
        _id: user._id,
        name: user.name,
      });
    }

    return typingUsers;
  },
});

