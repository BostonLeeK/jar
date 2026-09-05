"use client";

import { AlertView, useOverlayAlerts, useOverlayState } from "@/components/overlay-widgets";
import { useParams } from "next/navigation";

export default function AlertOverlayPage() {
  const params = useParams<{ token: string }>();
  const state = useOverlayState(params.token);
  const donation = useOverlayAlerts(params.token, state?.overlayDuration ?? 8);

  return (
    <main className="flex min-h-screen items-end p-6">
      <AlertView
        donation={donation}
        style={state?.alertStyle ?? "minimal"}
        accent={state?.accentColor ?? "#ffffff"}
      />
    </main>
  );
}
