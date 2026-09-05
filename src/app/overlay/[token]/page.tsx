"use client";

import { AlertView, useAlertEffects, useOverlayAlerts, useOverlayState } from "@/components/overlay-widgets";
import { useParams } from "next/navigation";

export default function AlertOverlayPage() {
  const params = useParams<{ token: string }>();
  const state = useOverlayState(params.token);
  const donation = useOverlayAlerts(params.token, state?.overlayDuration ?? 8);
  useAlertEffects(donation, state);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      {state ? <AlertView donation={donation} state={state} /> : null}
    </main>
  );
}
