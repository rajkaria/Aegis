import { postMessage, type AgentMessage } from "@aegis-ows/shared";

export interface XMTPNotification {
  type: "xmtp_notification";
  agentId: string;
  timestamp: string;
  toAgent: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  metadata?: Record<string, string>;
}

export function notifyViaXMTP(params: {
  fromAgent: string;
  toAgent: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  metadata?: Record<string, string>;
}): void {
  const notification: XMTPNotification = {
    type: "xmtp_notification",
    agentId: params.fromAgent,
    timestamp: new Date().toISOString(),
    toAgent: params.toAgent,
    severity: params.severity,
    title: params.title,
    message: params.message,
    metadata: params.metadata,
  };

  postMessage(notification as unknown as AgentMessage);
}

// Convenience functions
export function notifyPolicyBlock(agentId: string, operatorId: string, policyName: string, reason: string): void {
  notifyViaXMTP({
    fromAgent: agentId,
    toAgent: operatorId,
    severity: "warning",
    title: `Policy Block: ${policyName}`,
    message: `Agent ${agentId} was blocked by ${policyName}: ${reason}`,
    metadata: { policy: policyName },
  });
}

export function notifyBudgetAlert(agentId: string, operatorId: string, usage: number, limit: string): void {
  notifyViaXMTP({
    fromAgent: agentId,
    toAgent: operatorId,
    severity: usage > 95 ? "critical" : "warning",
    title: `Budget Alert: ${usage.toFixed(0)}% used`,
    message: `Agent ${agentId} has used ${usage.toFixed(0)}% of daily budget (limit: ${limit})`,
    metadata: { usage: usage.toString(), limit },
  });
}

export function notifyDeadswitchWarning(agentId: string, operatorId: string, minutesRemaining: number): void {
  notifyViaXMTP({
    fromAgent: agentId,
    toAgent: operatorId,
    severity: minutesRemaining < 5 ? "critical" : "warning",
    title: `Deadswitch: ${minutesRemaining}min remaining`,
    message: `Agent ${agentId} will be killed in ${minutesRemaining} minutes due to inactivity`,
    metadata: { minutesRemaining: minutesRemaining.toString() },
  });
}
