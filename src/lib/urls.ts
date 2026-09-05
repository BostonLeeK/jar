export function getAppUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function donatePath(slug: string) {
  return `/d/${slug}`;
}

export function jarPayUrl(sendId: string) {
  return `https://send.monobank.ua/${sendId}`;
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
