import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    lastMessageId: v.optional(v.id("messages")),
    updatedAt: v.number(),
    // Scalable for group chat
    isGroup: v.boolean(),
    name: v.optional(v.string()),
  }).index("by_participant", ["participants"]),

  // Per-user per-conversation state like last read and typing
  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadAt: v.number(),
    isTyping: v.boolean(),
    typingUpdatedAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId", "conversationId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
    isDeleted: v.boolean(),
  }).index("by_conversation", ["conversationId", "createdAt"]),
});

