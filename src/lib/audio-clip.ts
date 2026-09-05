export type AudioClip = {
  start: number;
  end: number;
};

export function roundClip(value: number) {
  return Math.round(value * 10) / 10;
}

export function formatClipTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00.0";
  }
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  return `${minutes}:${rest.toFixed(1).padStart(4, "0")}`;
}

export function clipRange(clip: AudioClip | null | undefined, duration = 0) {
  const start = Math.max(0, clip?.start ?? 0);
  const rawEnd = clip?.end ?? 0;
  const end = rawEnd > start ? rawEnd : duration;
  return {
    start,
    end: duration > 0 ? Math.min(end || duration, duration) : end,
  };
}
