import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listForConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .collect();

    const result = [];

    for (const message of messages) {
      const sender = await ctx.db.get(message.senderId);
      if (!sender) continue;

      result.push({
        _id: message._id,
        content: message.content,
        createdAt: message.createdAt,
        isDeleted: message.isDeleted,
        sender: {
          _id: sender._id,
          name: sender.name,
          imageUrl: sender.imageUrl,
        },
      });
    }

    return result;
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      createdAt: now,
      isDeleted: false,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageId: messageId,
      updatedAt: now,
    });

    // Update lastReadAt for sender, leave others untouched for unread counts
    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    for (const member of memberships) {
      if (member.userId === args.senderId) {
        await ctx.db.patch(member._id, {
          lastReadAt: now,
        });
      }
    }

    return messageId;
  },
});

