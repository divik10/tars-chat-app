"use client";

import type { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";


const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const convexClient = new ConvexReactClient(convexUrl ?? "");

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convexUrl) {
    console.warn("NEXT_PUBLIC_CONVEX_URL is not set. Convex client will not work.");
  }

  return (
    <ConvexProvider client={convexClient}>
      {children}
    </ConvexProvider>
  );
}

