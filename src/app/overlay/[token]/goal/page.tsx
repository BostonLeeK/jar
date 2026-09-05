"use client";

import { GoalView, OverlayShell, useOverlayState } from "@/components/overlay-widgets";
import { useParams } from "next/navigation";

export default function GoalOverlayPage() {
  const params = useParams<{ token: string }>();
  const state = useOverlayState(params.token);
  if (!state) {
    return null;
  }
  return (
    <OverlayShell>
      <GoalView state={state} />
    </OverlayShell>
  );
}
