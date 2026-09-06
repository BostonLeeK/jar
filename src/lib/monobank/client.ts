import { logger } from "@/lib/logger";
import { getMonobankConfig } from "@/lib/monobank/config";
import { MonobankApiError } from "@/lib/monobank/errors";
import { buildSignPayload, signMonoRequest, toResourcePath } from "@/lib/monobank/signer";

type MonoMethod = "GET" | "POST";

export type MonobankRequestOptions = {
  method: MonoMethod;
  resource: string;
  requestId?: string;
  callback?: string;
  body?: unknown;
  signRequestId?: boolean;
};

function includeRequestIdInSign(resource: string, requestId: string | undefined, signRequestId?: boolean) {
  if (!requestId || signRequestId === false) {
    return false;
  }
  if (signRequestId === true) {
    return true;
  }
  return !resource.startsWith("/personal/corp/");
}

export class MonobankClient {
  constructor(
    private readonly keyId: string,
    private readonly privateKey: string,
    private readonly baseUrl: string,
  ) {}

  async request<T>(options: MonobankRequestOptions): Promise<T> {
    const resource = toResourcePath(options.resource);
    const xTime = Math.floor(Date.now() / 1000).toString();
    const signedRequestId = includeRequestIdInSign(resource, options.requestId, options.signRequestId)
      ? options.requestId
      : undefined;
    const headers: Record<string, string> = {
      "X-Key-Id": this.keyId,
      "X-Time": xTime,
      "X-Sign": signMonoRequest(this.privateKey, buildSignPayload(xTime, resource, signedRequestId)),
    };
    if (options.requestId) {
      headers["X-Request-Id"] = options.requestId;
    }
    if (options.callback) {
      headers["X-Callback"] = options.callback;
    }
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${this.baseUrl}${resource}`, {
      method: options.method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });

    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { errorDescription?: string } | null;
      logger.error({
        provider: "monobank",
        endpoint: resource,
        status: res.status,
        errorDescription: payload?.errorDescription,
      });
      throw new MonobankApiError(res.status, payload?.errorDescription);
    }

    const text = await res.text();
    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  }
}

export function createMonobankClient() {
  const config = getMonobankConfig();
  return new MonobankClient(config.keyId, config.privateKey, config.baseUrl);
}
