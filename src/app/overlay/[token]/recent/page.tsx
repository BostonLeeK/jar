"use client";

import { OverlayShell, RecentView, useOverlayState } from "@/components/overlay-widgets";
import { useParams } from "next/navigation";

export default function RecentOverlayPage() {
  const params = useParams<{ token: string }>();
  const state = useOverlayState(params.token);
  if (!state) {
    return null;
  }
  return (
    <OverlayShell align="start">
      <RecentView state={state} />
    </OverlayShell>
  );
}
