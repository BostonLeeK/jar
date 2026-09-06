export type MonobankConnectionStatus = "pending" | "connected" | "revoked" | "failed";

export type MonoAuthRequestResponse = {
  tokenRequestId: string;
  acceptUrl: string;
};

export type MonoAccount = {
  id: string;
  balance: number;
  creditLimit: number;
  currencyCode: number;
  type: string;
  iban?: string;
  maskedPan?: string[];
  sendId?: string;
};

export type MonoClientInfo = {
  clientId: string;
  name: string;
  webHookUrl?: string;
  permissions?: string;
  accounts?: MonoAccount[];
};

export type MonoStatementItem = {
  id: string;
  time: number;
  description?: string;
  mcc?: number;
  originalMcc?: number;
  hold: boolean;
  amount: number;
  operationAmount?: number;
  currencyCode?: number;
  commissionRate?: number;
  cashbackAmount?: number;
  balance?: number;
  comment?: string;
  receiptId?: string;
  counterEdrpou?: string;
  counterIban?: string;
  counterName?: string;
};

export type MonoWebhookPayload = {
  type: string;
  data?: {
    account?: string;
    statementItem?: MonoStatementItem;
  };
};

export type DonationEvent = {
  provider: "monobank";
  externalId: string;
  userId: string;
  amount: number;
  currency: string;
  senderName?: string | null;
  message?: string | null;
  createdAt: Date;
  raw: unknown;
};
