#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { checkBudgetSchema, checkBudgetHandler } from "./tools/check-budget.js";
import { payX402Schema, payX402Handler } from "./tools/pay-x402.js";
import { payMppSchema, payMppHandler } from "./tools/pay-mpp.js";
import { discoverServicesSchema, discoverServicesHandler } from "./tools/discover.js";
import { registerServiceSchema, registerServiceHandler } from "./tools/register.js";
import { spendingReportSchema, spendingReportHandler } from "./tools/report.js";

const server = new McpServer({
  name: "aegis",
  version: "0.1.0",
});

server.tool(
  "aegis_check_budget",
  "Check budget limits and spending for a wallet. Returns spent vs limit for each configured budget period.",
  checkBudgetSchema,
  checkBudgetHandler
);

server.tool(
  "aegis_pay_x402",
  "Pay for an x402-protected HTTP resource. Handles the 402 Payment Required flow automatically.",
  payX402Schema,
  payX402Handler
);

server.tool(
  "aegis_pay_mpp",
  "Pay for an MPP (Metered Payment Protocol) service. Handles session management and payment authorization.",
  payMppSchema,
  payMppHandler
);

server.tool(
  "aegis_discover_services",
  "Search and discover registered commerce services by query, price, chain, or protocol.",
  discoverServicesSchema,
  discoverServicesHandler
);

server.tool(
  "aegis_register_service",
  "Register a new commerce service in the Aegis service registry.",
  registerServiceSchema,
  registerServiceHandler
);

server.tool(
  "aegis_spending_report",
  "Generate a spending report for a wallet. Supports summary, detailed, or CSV output formats.",
  spendingReportSchema,
  spendingReportHandler
);

const transport = new StdioServerTransport();
await server.connect(transport);
