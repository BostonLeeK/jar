"use client";

import { GoalView, useOverlayState } from "@/components/overlay-widgets";
import { useParams } from "next/navigation";

export default function GoalOverlayPage() {
  const params = useParams<{ token: string }>();
  const state = useOverlayState(params.token);
  if (!state) {
    return null;
  }
  return (
    <main className="flex min-h-screen items-center p-4">
      <GoalView state={state} />
    </main>
  );
}
