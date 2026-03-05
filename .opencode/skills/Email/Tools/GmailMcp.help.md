# GmailMcp.ts Help

CLI tool for Gmail operations via n8n MCP integration.

## Installation

```bash
# Make executable
chmod +x ~/.opencode/skills/Email/Tools/GmailMcp.ts
```

## Commands

### init

Initialize MCP session and list available tools.

```bash
bun GmailMcp.ts init --account personal
bun GmailMcp.ts init --account work
```

Output:
- Session initialization status
- List of available MCP tools from Gmail integration

### list

List emails with optional Gmail search query.

```bash
# List inbox (default)
bun GmailMcp.ts list

# List unread emails
bun GmailMcp.ts list --query "is:unread"

# List from specific sender
bun GmailMcp.ts list --query "from:john@example.com"

# Work account
bun GmailMcp.ts list --account work --query "is:unread"

# JSON output
bun GmailMcp.ts list --json --max 50
```

### send

Send an email (requires --force confirmation).

```bash
bun GmailMcp.ts send \
  --to recipient@example.com \
  --subject "Meeting Tomorrow" \
  --body "Hi, let's meet at 3pm." \
  --force
```

**Safety:** Always shows preview and requires --force flag to send.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--account` | personal/work | personal | Which Gmail account |
| `--query` | string | in:inbox | Gmail search query |
| `--id` | string | - | Message ID |
| `--to` | string | - | Recipient email |
| `--subject` | string | - | Email subject |
| `--body` | string | - | Email body |
| `--max` | number | 20 | Max results |
| `--json` | flag | - | Output raw JSON |
| `--force` | flag | - | Confirm send |
| `--help` | flag | - | Show help |

## Gmail Search Syntax

Common queries:

| Query | Result |
|-------|--------|
| `is:unread` | Unread emails |
| `from:john@example.com` | From specific sender |
| `subject:project` | Subject contains "project" |
| `has:attachment` | Has attachments |
| `newer_than:7d` | Last 7 days |
| `in:inbox` | In inbox |
| `is:starred` | Starred emails |
| `label:work` | With "work" label |

Combine with space:
```
from:boss@company.com is:unread newer_than:3d
```

## Environment

Requires `~/.opencode/.env` with:
```
N8N_MCP_AUTH=your_bearer_token
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "N8N_MCP_AUTH not found" | Missing env variable | Add to .env |
| "Unknown account" | Invalid --account | Use personal or work |
| "404 webhook not registered" | MCP workflow inactive | Activate in n8n |
| "Server not initialized" | Session expired | Re-run init |

## Integration with Workflows

Workflows call this tool for operations:

```bash
# From CheckInbox workflow
bun ~/.opencode/skills/Email/Tools/GmailMcp.ts list --query "is:unread" --max 20

# From SendEmail workflow  
bun ~/.opencode/skills/Email/Tools/GmailMcp.ts send \
  --to "$RECIPIENT" \
  --subject "$SUBJECT" \
  --body "$BODY" \
  --force
```
