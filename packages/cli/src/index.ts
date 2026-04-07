#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { statusCommand } from "./commands/status.js";
import { budgetCommand } from "./commands/budget.js";
import { guardCommand } from "./commands/guard.js";
import { installCommand } from "./commands/install.js";
import { reportCommand } from "./commands/report.js";
import { xmtpCommand } from "./commands/xmtp.js";

const program = new Command();

program
  .name("aegis")
  .description("Aegis — Policy, Commerce & Visibility for OWS")
  .version("0.1.0");

program.addCommand(initCommand);
program.addCommand(statusCommand);
program.addCommand(budgetCommand);
program.addCommand(guardCommand);
program.addCommand(installCommand);
program.addCommand(reportCommand);
program.addCommand(xmtpCommand);

program.parse(process.argv);
