/**
 * Aegis Transport Abstraction
 *
 * Pluggable message transport layer. The file-based transport is the default,
 * and the XMTP transport activates when XMTP_WALLET_KEY is set.
 *
 * All existing code (announce, discover, xmtp-protocol) calls postMessage/readMessages
 * which delegate to the active transport.
 */

import type { AgentMessage, MessageBus } from "./messages.js";

// === Transport Interface ===

export interface MessageTransport {
  /** Post a message to the bus */
  post(msg: AgentMessage): Promise<void>;

  /** Read all messages from the bus */
  read(): Promise<MessageBus>;

  /** Subscribe to real-time messages (returns unsubscribe fn) */
  subscribe?(callback: (msg: AgentMessage) => void): Promise<() => void>;

  /** Transport name for diagnostics */
  readonly name: string;

  /** Whether this transport supports real-time streaming */
  readonly supportsStreaming: boolean;

  /** Whether messages are end-to-end encrypted */
  readonly encrypted: boolean;

  /** Graceful shutdown */
  close?(): Promise<void>;
}

// === Transport Registry ===

let activeTransport: MessageTransport | null = null;
const transportFactories = new Map<string, () => MessageTransport>();

/**
 * Register a named transport factory.
 * Call this at startup before any messaging happens.
 */
export function registerTransport(name: string, factory: () => MessageTransport): void {
  transportFactories.set(name, factory);
}

/**
 * Set the active transport instance directly.
 */
export function setActiveTransport(transport: MessageTransport): void {
  activeTransport = transport;
}

/**
 * Get the active transport. Falls back to "file" if none set.
 */
export function getActiveTransport(): MessageTransport | null {
  return activeTransport;
}

/**
 * Activate a registered transport by name.
 */
export function activateTransport(name: string): MessageTransport {
  const factory = transportFactories.get(name);
  if (!factory) {
    throw new Error(`Unknown transport: "${name}". Registered: ${[...transportFactories.keys()].join(", ")}`);
  }
  activeTransport = factory();
  return activeTransport;
}

/**
 * Check if a non-file transport is active (i.e., XMTP is connected).
 */
export function isNetworkTransportActive(): boolean {
  return activeTransport !== null && activeTransport.name !== "file";
}

/**
 * Shut down the active transport gracefully.
 */
export async function closeTransport(): Promise<void> {
  if (activeTransport?.close) {
    await activeTransport.close();
  }
  activeTransport = null;
}

// === Transport Status (for dashboard) ===

export interface TransportStatus {
  name: string;
  connected: boolean;
  encrypted: boolean;
  supportsStreaming: boolean;
  agentAddress?: string;
  networkEnv?: string;
  connectedPeers?: number;
  messagesRelayed?: number;
}

export function getTransportStatus(): TransportStatus {
  if (!activeTransport) {
    return {
      name: "file",
      connected: true,
      encrypted: false,
      supportsStreaming: false,
    };
  }
  return {
    name: activeTransport.name,
    connected: true,
    encrypted: activeTransport.encrypted,
    supportsStreaming: activeTransport.supportsStreaming,
  };
}
