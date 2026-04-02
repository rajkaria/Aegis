import { Command } from "commander";
import { readApprovals, resolveApproval } from "@aegis-ows/shared";

export const approveCommand = new Command("approve")
  .description("List or resolve pending transaction approvals")
  .argument("[id]", "Approval ID to resolve")
  .option("--list", "List all pending approvals")
  .option("--reject", "Reject the approval instead of approving it")
  .action((id: string | undefined, options: { list?: boolean; reject?: boolean }) => {
    const queue = readApprovals();

    // List mode: no id, or --list flag
    if (!id || options.list) {
      const pending = queue.pending.filter((a) => a.status === "pending");

      if (pending.length === 0) {
        console.log("No pending approvals.");
        return;
      }

      console.log(`Pending approvals (${pending.length}):`);
      console.log();
      for (const a of pending) {
        console.log(`  ID:       ${a.id}`);
        console.log(`  API Key:  ${a.apiKeyId}`);
        console.log(`  Value:    ${a.estimatedValue} ${a.token}`);
        console.log(`  Chain:    ${a.chainId}`);
        if (a.reason) {
          console.log(`  Reason:   ${a.reason}`);
        }
        console.log(`  Created:  ${a.createdAt}`);
        console.log(`  Expires:  ${a.expiresAt}`);
        console.log();
      }
      return;
    }

    // Resolve mode
    const resolution = options.reject ? "rejected" : "approved";
    const resolved = resolveApproval(id, resolution);

    if (!resolved) {
      console.error(`No approval found with ID: ${id}`);
      process.exit(1);
    }

    console.log(`Approval ${id} has been ${resolution}.`);
    console.log(`  API Key: ${resolved.apiKeyId}`);
    console.log(`  Value:   ${resolved.estimatedValue} ${resolved.token}`);
    console.log(`  Chain:   ${resolved.chainId}`);
  });
