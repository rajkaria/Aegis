import { postMessage, type AgentMessage } from "@aegis-ows/shared";

export interface DisputeParams {
  complainantId: string;
  defendantId: string;
  txHash?: string;
  reason: string;
  evidence: string;
  requestedResolution: "refund" | "retry" | "arbitration";
}

export interface DisputeResponseParams {
  disputeId: string;
  defendantId: string;
  complainantId: string;
  accepted: boolean;
  resolution?: string;
  refundTxHash?: string;
}

export function openDispute(params: DisputeParams): string {
  const disputeId = `dispute-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const msg = {
    type: "dispute" as const,
    disputeId,
    agentId: params.complainantId,
    timestamp: new Date().toISOString(),
    againstAgent: params.defendantId,
    txHash: params.txHash,
    reason: params.reason,
    evidence: params.evidence,
    requestedResolution: params.requestedResolution,
    status: "open" as const,
  };

  postMessage(msg as unknown as AgentMessage);
  return disputeId;
}

export function respondToDispute(params: DisputeResponseParams): void {
  const msg = {
    type: "dispute_response" as const,
    disputeId: params.disputeId,
    agentId: params.defendantId,
    timestamp: new Date().toISOString(),
    toAgent: params.complainantId,
    accepted: params.accepted,
    resolution: params.resolution,
    refundTxHash: params.refundTxHash,
  };

  postMessage(msg as unknown as AgentMessage);
}
