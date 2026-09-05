import { SESSION_COOKIE } from "@/lib/constants";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(value);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function readSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sub !== "string") {
      return null;
    }
    return { userId: payload.sub };
  } catch {
    return null;
  }
}

export async function signState(userId: string, ttl = "10m") {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret());
}

export async function verifyState(token: string) {
  const { payload } = await jwtVerify(token, secret());
  if (typeof payload.sub !== "string") {
    throw new Error("Invalid state");
  }
  return payload.sub;
}
