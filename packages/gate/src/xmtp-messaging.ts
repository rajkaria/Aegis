/**
 * Aegis XMTP Messaging — Standalone Agent Communication
 *
 * Import from "aegis-ows-gate/xmtp-messaging" to use XMTP messaging
 * without pulling in the x402 payment middleware, Express, Solana, or ethers.
 *
 * Works with zero configuration using the file-based message bus.
 * Set XMTP_ENV and XMTP_WALLET_KEY for real XMTP network transport.
 *
 * Usage:
 *   import {
 *     sendNegotiationOffer,
 *     pingAgent,
 *     reportReputation,
 *     openDispute,
 *     registerInDirectory,
 *   } from "aegis-ows-gate/xmtp-messaging";
 */

// Transport
export { getTransport, isXMTPLive, getXMTPAddress } from "./xmtp-transport.js";

// Protocol — negotiation, health, receipts, reputation, SLAs, supply chains
export {
  sendNegotiationOffer,
  respondToNegotiation,
  pingAgent,
  respondToPing,
  isAgentHealthy,
  sendPaymentReceipt,
  reportReputation,
  getAgentGossipScore,
  proposeSLA,
  acceptSLA,
  createSupplyChain,
} from "./xmtp-protocol.js";

// Identity — works standalone without payment ledger
export {
  buildAgentIdentity,
  createBusinessCard,
  type AgentIdentity,
  type AgentBusinessCard,
  type AgentLedgerData,
} from "./agent-identity.js";

// Directory
export {
  registerInDirectory,
  searchDirectory,
  listDirectory,
  getDirectorySize,
} from "./xmtp-directory.js";

// Disputes
export {
  openDispute,
  respondToDispute,
  type DisputeParams,
  type DisputeResponseParams,
} from "./xmtp-disputes.js";

// Notifications
export {
  notifyViaXMTP,
  notifyPolicyBlock,
  notifyBudgetAlert,
  notifyDeadswitchWarning,
  type XMTPNotification,
} from "./xmtp-webhooks.js";
