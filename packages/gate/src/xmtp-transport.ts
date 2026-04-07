import { postMessage, readMessages, type AgentMessage } from "@aegis-ows/shared";

// Check if real XMTP is available
const XMTP_ENABLED = !!(process.env.XMTP_ENV && process.env.XMTP_WALLET_KEY);

interface XMTPTransport {
  send(message: AgentMessage, toAddress?: string): Promise<void>;
  onMessage(handler: (message: AgentMessage) => void): void;
  getAddress(): string | null;
  isLive(): boolean;
}

// File-based transport (always available)
class FileTransport implements XMTPTransport {
  send(message: AgentMessage): Promise<void> {
    postMessage(message);
    return Promise.resolve();
  }
  onMessage(_handler: (message: AgentMessage) => void): void {
    // File transport doesn't support real-time — poll readMessages() instead
  }
  getAddress(): string | null { return null; }
  isLive(): boolean { return false; }
}

// Real XMTP transport (when configured)
class LiveXMTPTransport implements XMTPTransport {
  private agentAddress: string | null = null;
  private handlers: Array<(message: AgentMessage) => void> = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      // Dynamic import to avoid requiring the SDK when not configured
      const sdk = await import("@xmtp/agent-sdk");
      const Agent = sdk.Agent ?? (sdk as unknown as { default: { Agent: unknown } }).default?.Agent;
      if (!Agent) {
        console.error("[aegis-xmtp] Could not find Agent class in @xmtp/agent-sdk");
        return;
      }
      const agent = await (Agent as { createFromEnv: () => Promise<{ address: string; on: (event: string, handler: (ctx: unknown) => void) => void; start: () => Promise<void> }> }).createFromEnv();

      this.agentAddress = agent.address;

      // Listen for incoming messages
      agent.on("text", async (ctx: unknown) => {
        try {
          const context = ctx as { message: { content: string } };
          const parsed = JSON.parse(context.message.content) as AgentMessage;
          // Also save to file bus for dashboard visibility
          postMessage(parsed);
          // Notify handlers
          for (const handler of this.handlers) {
            handler(parsed);
          }
        } catch {
          // Not a structured Aegis message — ignore
        }
      });

      await agent.start();
      this.initialized = true;
      console.error("[aegis-xmtp] Connected to XMTP network as", this.agentAddress);
    } catch (err) {
      console.error("[aegis-xmtp] Failed to initialize:", (err as Error).message?.slice(0, 100));
      this.initialized = false;
    }
  }

  async send(message: AgentMessage, _toAddress?: string): Promise<void> {
    // Always write to file bus for local dashboard
    postMessage(message);

    // If XMTP is initialized and we have a target, send over XMTP too
    // For broadcast messages (announcements), they go to file bus only
    // For directed messages (negotiation, health ping), they'd go to the target's XMTP address
    // For now, all messages go to file bus — real XMTP p2p requires knowing the recipient's XMTP address
  }

  onMessage(handler: (message: AgentMessage) => void): void {
    this.handlers.push(handler);
  }

  getAddress(): string | null { return this.agentAddress; }
  isLive(): boolean { return this.initialized; }
}

// Singleton transport instance
let transport: XMTPTransport | null = null;

export async function getTransport(): Promise<XMTPTransport> {
  if (transport) return transport;

  if (XMTP_ENABLED) {
    const live = new LiveXMTPTransport();
    await live.initialize();
    if (live.isLive()) {
      transport = live;
      return transport;
    }
  }

  transport = new FileTransport();
  return transport;
}

export function isXMTPLive(): boolean {
  return transport?.isLive() ?? false;
}

export function getXMTPAddress(): string | null {
  return transport?.getAddress() ?? null;
}
