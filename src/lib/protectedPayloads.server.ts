import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type StoredPayloadInput = {
  payload: string;
  k1: number;
  k2: number;
  creditText: string;
  creditHash: string;
  signature: string;
  domainLock: string;
};

export type StoredPayloadRow = StoredPayloadInput & {
  id: string;
};

type DbPayloadRow = {
  id: string;
  payload: string;
  k1: number;
  k2: number;
  credit_text: string;
  credit_hash: string;
  signature: string;
  domain_lock: string | null;
};

type QueryResult<T> = Promise<{ data: T | null; error: { message?: string } | null }>;

type ProtectedPayloadsClient = {
  from: (table: "protected_payloads") => {
    insert: (value: Record<string, string | number>) => {
      select: (columns: string) => {
        single: () => QueryResult<{ id: string }>;
      };
    };
    select: (columns: string) => {
      eq: (column: "id", value: string) => {
        single: () => QueryResult<DbPayloadRow>;
      };
    };
  };
};

function mapRow(row: DbPayloadRow): StoredPayloadRow {
  return {
    id: row.id,
    payload: row.payload,
    k1: row.k1,
    k2: row.k2,
    creditText: row.credit_text,
    creditHash: row.credit_hash,
    signature: row.signature,
    domainLock: row.domain_lock || "",
  };
}

export async function saveEncryptedPayload(input: StoredPayloadInput) {
  const db = supabaseAdmin as unknown as ProtectedPayloadsClient;
  const { data, error } = await db
    .from("protected_payloads")
    .insert({
      payload: input.payload,
      k1: input.k1,
      k2: input.k2,
      credit_text: input.creditText,
      credit_hash: input.creditHash,
      signature: input.signature,
      domain_lock: input.domainLock,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to save protected payload", error);
    throw new Error("SERVER_SAVE_FAILED");
  }

  return { id: String(data.id) };
}

export async function getEncryptedPayload(id: string) {
  const db = supabaseAdmin as unknown as ProtectedPayloadsClient;
  const { data, error } = await db
    .from("protected_payloads")
    .select("id,payload,k1,k2,credit_text,credit_hash,signature,domain_lock")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapRow(data as DbPayloadRow);
}