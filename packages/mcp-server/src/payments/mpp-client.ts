import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { appendLedgerEntry, PATHS, ensureAegisDir } from "@aegis-ows/shared";
import type { LedgerEntry } from "@aegis-ows/shared";

export interface MppSession {
  sessionId: string;
  walletName: string;
  endpoint: string;
  maxCost: string;
  spent: string;
  createdAt: string;
}

export interface MppSessions {
  sessions: MppSession[];
}

function readMppSessions(): MppSessions {
  if (!existsSync(PATHS.mppSessions)) {
    return { sessions: [] };
  }
  try {
    const raw = readFileSync(PATHS.mppSessions, "utf-8");
    return JSON.parse(raw) as MppSessions;
  } catch {
    return { sessions: [] };
  }
}

function writeMppSessions(data: MppSessions): void {
  ensureAegisDir();
  writeFileSync(PATHS.mppSessions, JSON.stringify(data, null, 2), "utf-8");
}

function getOrCreateSession(
  walletName: string,
  endpoint: string,
  sessionId: string | undefined,
  maxSessionCost: string | undefined
): MppSession {
  const data = readMppSessions();

  if (sessionId) {
    const existing = data.sessions.find((s) => s.sessionId === sessionId);
    if (existing) return existing;
  }

  const session: MppSession = {
    sessionId: sessionId || randomUUID(),
    walletName,
    endpoint,
    maxCost: maxSessionCost || "10.0",
    spent: "0",
    createdAt: new Date().toISOString(),
  };

  data.sessions.push(session);
  writeMppSessions(data);
  return session;
}

function updateSessionSpent(sessionId: string, additionalAmount: string): void {
  const data = readMppSessions();
  const session = data.sessions.find((s) => s.sessionId === sessionId);
  if (session) {
    session.spent = (parseFloat(session.spent) + parseFloat(additionalAmount)).toFixed(6);
    writeMppSessions(data);
  }
}

export interface MppResult {
  success: boolean;
  content?: string;
  statusCode?: number;
  sessionId?: string;
  error?: string;
}

export async function fetchWithMpp(
  url: string,
  walletName: string,
  sessionId?: string,
  maxSessionCost?: string
): Promise<MppResult> {
  // Step 1: Initial fetch
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    return { success: false, error: `Fetch failed: ${String(err)}` };
  }

  // If not 402, return content directly
  if (response.status !== 402) {
    const content = await response.text();
    return { success: true, content, statusCode: response.status };
  }

  // Step 2: Parse MPP challenge from JSON body
  let challenge: { challengeId?: string; token?: string; amount?: string; network?: string } = {};
  try {
    const bodyText = await response.text();
    challenge = JSON.parse(bodyText) as typeof challenge;
  } catch {
    // Challenge body could not be parsed — proceed with defaults
  }

  // Step 3: Get or create MPP session
  const session = getOrCreateSession(walletName, url, sessionId, maxSessionCost);

  // Step 4: Mock payment authorization
  const credential = `mpp-${session.sessionId}-${challenge.challengeId ?? randomUUID()}-${Date.now()}`;
  const token = challenge.token || "USDC";
  const amount = challenge.amount || "0.01";
  const network = challenge.network || "base";

  // Step 4.5: Check session cost limit before making payment
  const requestAmount = parseFloat(amount);
  const currentSpent = parseFloat(session.spent);
  const maxCost = parseFloat(session.maxCost);
  if (currentSpent + requestAmount > maxCost) {
    return {
      success: false,
      error: `Session cost limit exceeded (spent: ${session.spent}, limit: ${session.maxCost}, requested: ${amount})`,
      sessionId: session.sessionId,
    };
  }

  // Step 5: Retry with Authorization header
  let retryResponse: Response;
  try {
    retryResponse = await fetch(url, {
      headers: {
        Authorization: `MPP ${credential}`,
      },
    });
  } catch (err) {
    return {
      success: false,
      error: `Retry fetch failed: ${String(err)}`,
      sessionId: session.sessionId,
    };
  }

  // Step 6: Log to ledger and return
  if (retryResponse.ok || retryResponse.status < 400) {
    const content = await retryResponse.text();

    const entry: LedgerEntry = {
      timestamp: new Date().toISOString(),
      apiKeyId: walletName,
      chainId: network,
      token,
      amount,
      tool: "aegis_pay_mpp",
      description: `MPP payment to ${url} (session: ${session.sessionId})`,
    };
    appendLedgerEntry(entry);
    updateSessionSpent(session.sessionId, amount);

    return {
      success: true,
      content,
      statusCode: retryResponse.status,
      sessionId: session.sessionId,
    };
  } else {
    return {
      success: false,
      error: `MPP payment retry failed with status ${retryResponse.status}`,
      statusCode: retryResponse.status,
      sessionId: session.sessionId,
    };
  }
}
