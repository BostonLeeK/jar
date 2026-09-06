import { sign } from "node:crypto";

export function toResourcePath(resource: string) {
  if (resource.startsWith("http://") || resource.startsWith("https://")) {
    const url = new URL(resource);
    return `${url.pathname}${url.search}`;
  }
  return resource.startsWith("/") ? resource : `/${resource}`;
}

export function buildSignPayload(xTime: string, resource: string, requestId?: string) {
  const path = toResourcePath(resource);
  return requestId ? `${xTime}${requestId}${path}` : `${xTime}${path}`;
}

export function signMonoRequest(privateKey: string, payload: string) {
  return sign("sha256", Buffer.from(payload, "utf8"), {
    key: privateKey,
    dsaEncoding: "ieee-p1363",
  }).toString("base64");
}
