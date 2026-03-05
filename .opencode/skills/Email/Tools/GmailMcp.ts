#!/usr/bin/env bun
/**
 * GmailMcp.ts - CLI tool for Gmail operations via n8n MCP
 *
 * Usage:
 *   bun ~/.opencode/skills/Email/Tools/GmailMcp.ts <command> [options]
 *
 * Commands:
 *   init        Initialize MCP session and list tools
 *   list        List emails with optional query
 *   get         Get full email by ID
 *   send        Send an email
 *   draft       Create a draft
 *   modify      Modify email (archive, label, etc.)
 *
 * Options:
 *   --account   personal|work (default: personal)
 *   --query     Gmail search query
 *   --id        Message ID
 *   --to        Recipient email
 *   --subject   Email subject
 *   --body      Email body
 *   --max       Max results (default: 20)
 *   --json      Output raw JSON
 *
 * @author PAI System
 * @version 1.0.0
 */

import { $ } from "bun";

// Configuration
const CONFIG = {
  endpoints: {
    personal: "https://n8n.s.cytrax.com.au/mcp/gmail-personal",
    work: "https://n8n.s.cytrax.com.au/mcp/gmail-work",
  },
  envFile: `${process.env.HOME}/.opencode/.env`,
};

// Colors
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color: keyof typeof colors, ...args: string[]) {
  console.log(colors[color], ...args, colors.reset);
}

async function loadEnv(): Promise<Record<string, string>> {
  try {
    const content = Bun.file(CONFIG.envFile);
    const text = await content.text();
    const env: Record<string, string> = {};
    for (const line of text.split("\n")) {
      const match = line.match(/^([^#][^=]*)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    }
    return env;
  } catch {
    log("red", "Error: Could not load .env file");
    process.exit(1);
  }
}

async function mcpCall(
  endpoint: string,
  authToken: string,
  method: string,
  params?: Record<string, unknown>
): Promise<unknown> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${authToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Math.floor(Math.random() * 10000),
      method,
      params: params || {},
    }),
  });

  const text = await response.text();
  
  // Handle SSE format
  if (text.startsWith("event:")) {
    const lines = text.split("\n");
    for (const line of lines) {
      if (line.startsWith("data:")) {
        return JSON.parse(line.slice(5).trim());
      }
    }
  }
  
  return JSON.parse(text);
}

async function initCommand(env: Record<string, string>, account: string) {
  const endpoint = CONFIG.endpoints[account as keyof typeof CONFIG.endpoints];
  if (!endpoint) {
    log("red", `Unknown account: ${account}`);
    process.exit(1);
  }

  log("cyan", `\n🔌 Initializing MCP session for ${account}...`);
  
  // Initialize
  const initResult = await mcpCall(endpoint, env.N8N_MCP_AUTH, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "pai-gmail-cli", version: "1.0" },
  });
  
  log("green", "✓ Session initialized");
  console.log(JSON.stringify(initResult, null, 2));

  // List tools
  log("cyan", "\n📦 Available tools:");
  const toolsResult = await mcpCall(endpoint, env.N8N_MCP_AUTH, "tools/list");
  console.log(JSON.stringify(toolsResult, null, 2));
}

async function listCommand(
  env: Record<string, string>,
  account: string,
  query: string,
  maxResults: number,
  jsonOutput: boolean
) {
  const endpoint = CONFIG.endpoints[account as keyof typeof CONFIG.endpoints];
  
  // Initialize first
  await mcpCall(endpoint, env.N8N_MCP_AUTH, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "pai-gmail-cli", version: "1.0" },
  });

  const result = await mcpCall(
    endpoint,
    env.N8N_MCP_AUTH,
    "tools/call",
    {
      name: "gmail_list_messages",
      arguments: {
        maxResults,
        q: query,
      },
    }
  );

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    log("green", `\n📬 Emails (${account}) - Query: "${query}"`);
    console.log(JSON.stringify(result, null, 2));
  }
}

async function sendCommand(
  env: Record<string, string>,
  account: string,
  to: string,
  subject: string,
  body: string
) {
  const endpoint = CONFIG.endpoints[account as keyof typeof CONFIG.endpoints];
  
  // Initialize first
  await mcpCall(endpoint, env.N8N_MCP_AUTH, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "pai-gmail-cli", version: "1.0" },
  });

  log("yellow", "\n⚠️  About to send email:");
  log("cyan", `  To: ${to}`);
  log("cyan", `  Subject: ${subject}`);
  log("cyan", `  Account: ${account}`);
  console.log();
  
  // In non-interactive mode, require --force flag
  const forceIndex = process.argv.indexOf("--force");
  if (forceIndex === -1) {
    log("yellow", "Add --force to confirm sending.");
    return;
  }

  const result = await mcpCall(
    endpoint,
    env.N8N_MCP_AUTH,
    "tools/call",
    {
      name: "gmail_send_message",
      arguments: {
        to: [to],
        subject,
        body,
        contentType: "text/plain",
      },
    }
  );

  log("green", "\n✅ Email sent!");
  console.log(JSON.stringify(result, null, 2));
}

function printHelp() {
  console.log(`
${colors.bold}GmailMcp.ts${colors.reset} - Gmail operations via n8n MCP

${colors.cyan}Usage:${colors.reset}
  bun GmailMcp.ts <command> [options]

${colors.cyan}Commands:${colors.reset}
  init              Initialize MCP session and list available tools
  list              List emails with optional query filter
  get               Get full email content by ID
  send              Send an email (requires --force)
  draft             Create a draft email
  modify            Modify email (archive, label, star, etc.)

${colors.cyan}Options:${colors.reset}
  --account <type>  Account: personal or work (default: personal)
  --query <q>       Gmail search query (e.g., "is:unread")
  --id <id>         Message ID for get/modify operations
  --to <email>      Recipient email address
  --subject <text>  Email subject line
  --body <text>     Email body content
  --max <n>         Max results for list (default: 20)
  --json            Output raw JSON response
  --force           Confirm destructive actions (send)
  --help            Show this help message

${colors.cyan}Examples:${colors.reset}
  # Initialize and see available tools
  bun GmailMcp.ts init --account personal

  # List unread emails
  bun GmailMcp.ts list --query "is:unread" --max 10

  # Send an email
  bun GmailMcp.ts send --to john@example.com --subject "Hello" --body "Test" --force

  # Search work emails
  bun GmailMcp.ts list --account work --query "from:boss@company.com"
`);
}

// Main
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const command = args[0];
  const getArg = (name: string, defaultValue?: string): string | undefined => {
    const idx = args.indexOf(name);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultValue;
  };

  const account = getArg("--account", "personal");
  const query = getArg("--query", "in:inbox");
  const maxResults = parseInt(getArg("--max", "20") || "20");
  const jsonOutput = args.includes("--json");
  const to = getArg("--to");
  const subject = getArg("--subject");
  const body = getArg("--body");
  const id = getArg("--id");

  const env = await loadEnv();

  if (!env.N8N_MCP_AUTH) {
    log("red", "Error: N8N_MCP_AUTH not found in .env");
    process.exit(1);
  }

  switch (command) {
    case "init":
      await initCommand(env, account || "personal");
      break;
    case "list":
      await listCommand(env, account || "personal", query || "in:inbox", maxResults, jsonOutput);
      break;
    case "send":
      if (!to || !subject || !body) {
        log("red", "Error: send requires --to, --subject, and --body");
        process.exit(1);
      }
      await sendCommand(env, account || "personal", to, subject, body);
      break;
    default:
      log("red", `Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch(console.error);
