import { AlertView, GoalView, RecentView, type OverlayDonation, type OverlayState } from "@/components/overlay-widgets";
import { ChatView, SAMPLE_CHAT } from "@/components/twitch-chat";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

const SAMPLE: OverlayDonation[] = [
  {
    id: "p1",
    amount: 20000,
    nickname: "boston_fan",
    message: "запускай Condemned",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    amount: 10000,
    nickname: "viewer",
    message: "красунчик",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p3",
    amount: 5000,
    nickname: "chat",
    message: "",
    createdAt: new Date().toISOString(),
  },
];

function Stage({
  backdrop,
  children,
}: {
  backdrop: "dark" | "light";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] items-end bg-[size:16px_16px] p-5",
        backdrop === "dark"
          ? "bg-zinc-950 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)]"
          : "bg-zinc-100 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.08)_1px,transparent_0)]",
      )}
    >
      {children}
    </div>
  );
}

export function WidgetPreviews({
  state,
  backdrop,
}: {
  state: OverlayState;
  backdrop: "dark" | "light";
}) {
  const preview: OverlayState = {
    ...state,
    showGoal: true,
    goal: state.goal > 0 ? state.goal : 300000,
    donations: state.donations.length > 0 ? state.donations : SAMPLE,
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <p className="border-b border-zinc-100 px-4 py-2 text-xs font-medium text-zinc-500">Алерт · 800×400</p>
        <Stage backdrop={backdrop}>
          <AlertView donation={preview.donations[0] ?? SAMPLE[0]} state={preview} />
        </Stage>
      </Card>
      <Card className="overflow-hidden">
        <p className="border-b border-zinc-100 px-4 py-2 text-xs font-medium text-zinc-500">Прогрес · 480×90</p>
        <Stage backdrop={backdrop}>
          <GoalView state={preview} />
        </Stage>
      </Card>
      <Card className="overflow-hidden">
        <p className="border-b border-zinc-100 px-4 py-2 text-xs font-medium text-zinc-500">Останні донати · 360×280</p>
        <Stage backdrop={backdrop}>
          <RecentView state={preview} />
        </Stage>
      </Card>
      <Card className="overflow-hidden">
        <p className="border-b border-zinc-100 px-4 py-2 text-xs font-medium text-zinc-500">Чат Twitch · 360×480</p>
        <Stage backdrop={backdrop}>
          <ChatView
            messages={SAMPLE_CHAT}
            tone={preview.overlayTone}
            accent={preview.overlayAccent}
            duration={preview.overlayDuration}
            preview
          />
        </Stage>
      </Card>
    </div>
  );
}
