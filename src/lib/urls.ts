function isUsableHost(host: string) {
  return Boolean(host) && !host.startsWith("0.0.0.0") && !host.startsWith("[::]");
}

export function getAppUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getPublicOrigin(req?: Request) {
  const configured = getAppUrl();
  if (isUsableHost(configured.replace(/^https?:\/\//, "")) && !configured.includes("localhost")) {
    return configured;
  }
  if (!req) {
    return configured;
  }
  const incoming = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || incoming.protocol.replace(":", "");
  const host =
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req.headers.get("host") ||
    incoming.host;
  if (isUsableHost(host)) {
    return `${proto === "https" ? "https" : "http"}://${host}`.replace(/\/$/, "");
  }
  return configured;
}

export function donatePath(slug: string) {
  return `/d/${slug}`;
}

function jarAmountParam(amountKopiyky: number) {
  const uah = amountKopiyky / 100;
  return Number.isInteger(uah) ? String(uah) : uah.toFixed(2);
}

function jarSendPath(sendId: string) {
  const id = sendId.replace(/^\/+|\/+$/g, "").replace(/^jar\//i, "");
  return `https://send.monobank.ua/jar/${id}`;
}

export function jarPayUrl(sendId: string, opts?: { amount?: number; comment?: string }) {
  const url = new URL(jarSendPath(sendId));
  if (opts?.amount && opts.amount > 0) {
    url.searchParams.set("a", jarAmountParam(opts.amount));
  }
  const comment = opts?.comment?.trim().slice(0, 160);
  if (comment) {
    url.searchParams.set("t", comment);
  }
  return url.toString();
}

export function overlayPath(token: string, kind: "alert" | "goal" | "recent" = "alert") {
  if (kind === "goal") {
    return `/overlay/${token}/goal`;
  }
  if (kind === "recent") {
    return `/overlay/${token}/recent`;
  }
  return `/overlay/${token}`;
}
