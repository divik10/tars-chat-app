"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const syncCurrentUser = useMutation(api.users.syncCurrentUser);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    void syncCurrentUser({
      clerkId: user.id,
      name:
        user.fullName ??
        user.username ??
        user.primaryEmailAddress?.emailAddress ??
        "Anonymous",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      imageUrl: user.imageUrl,
    });
  }, [isLoaded, isSignedIn, user, syncCurrentUser]);

  return null;
}

