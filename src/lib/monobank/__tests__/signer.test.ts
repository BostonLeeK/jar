import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buildSignPayload, signMonoRequest, toResourcePath } from "../signer";

function testKey() {
  return generateKeyPairSync("ec", { namedCurve: "secp256k1" }).privateKey.export({
    type: "pkcs8",
    format: "pem",
  }) as string;
}

describe("buildSignPayload", () => {
  it("concatenates time and resource without request id", () => {
    expect(buildSignPayload("1234567890", "/personal/auth/request")).toBe("1234567890/personal/auth/request");
  });

  it("concatenates time, request id and resource", () => {
    expect(buildSignPayload("1234567890", "/personal/client-info", "REQUEST_ID")).toBe(
      "1234567890REQUEST_ID/personal/client-info",
    );
  });

  it("does not put the API origin into the signing payload", () => {
    const payload = buildSignPayload("1234567890", "/personal/auth/request", "REQUEST_ID");
    expect(payload).not.toContain("https://api.monobank.ua");
    expect(payload).not.toContain("http://");
  });

  it("strips a full URL down to the resource path", () => {
    expect(toResourcePath("https://api.monobank.ua/personal/client-info")).toBe("/personal/client-info");
    expect(buildSignPayload("1", "https://api.monobank.ua/personal/client-info", "RID")).toBe(
      "1RID/personal/client-info",
    );
    expect(buildSignPayload("1", "https://api.monobank.ua/personal/client-info", "RID")).not.toContain(
      "https://api.monobank.ua",
    );
  });
});

describe("signMonoRequest", () => {
  it("returns a 64-byte IEEE-P1363 signature encoded as base64", () => {
    const signature = signMonoRequest(testKey(), "1234567890/personal/auth/request");
    expect(Buffer.from(signature, "base64")).toHaveLength(64);
  });
});
