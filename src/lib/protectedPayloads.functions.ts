import { createServerFn } from "@tanstack/react-start";

import { saveEncryptedPayload, type StoredPayloadInput } from "./protectedPayloads.server";

const MAX_PAYLOAD_SIZE = 2_000_000;

function requiredString(value: unknown, name: string, max = MAX_PAYLOAD_SIZE) {
  if (typeof value !== "string" || value.length === 0 || value.length > max) {
    throw new Error(`Invalid ${name}`);
  }
  return value;
}

function byteKey(value: unknown, name: string) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 255) {
    throw new Error(`Invalid ${name}`);
  }
  return value;
}

function validatePayload(input: unknown): StoredPayloadInput {
  const data = input as Record<string, unknown> | null;
  if (!data || typeof data !== "object") {
    throw new Error("Invalid payload");
  }

  return {
    payload: requiredString(data.payload, "payload"),
    k1: byteKey(data.k1, "k1"),
    k2: byteKey(data.k2, "k2"),
    creditText: requiredString(data.creditText, "creditText", 200),
    creditHash: requiredString(data.creditHash, "creditHash", 80),
    signature: requiredString(data.signature, "signature", 120),
    domainLock: typeof data.domainLock === "string" ? data.domainLock.slice(0, 255) : "",
  };
}

export const saveProtectedPayload = createServerFn({ method: "POST" })
  .inputValidator(validatePayload)
  .handler(async ({ data }) => saveEncryptedPayload(data));
