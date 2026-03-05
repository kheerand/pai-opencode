---
name: Email
description: Gmail processing via n8n MCP integration. USE WHEN email, gmail, inbox, check mail, send email, read email, draft email, search email, archive email, process inbox OR managing personal/work email accounts.
---

# Email

Gmail processing system via n8n MCP integration for both personal and work accounts.

## Customization

**Before executing, check for user customizations at:**
`~/.opencode/skills/PAI/USER/SKILLCUSTOMIZATIONS/Email/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

## Configuration

| Account | MCP Endpoint | Environment Variable |
|---------|--------------|---------------------|
| **Personal** | `https://n8n.s.cytrax.com.au/mcp/gmail-personal` | `$N8N_MCP_AUTH` |
| **Work** | `https://n8n.s.cytrax.com.au/mcp/gmail-work` | `$N8N_MCP_AUTH` |

**Auth:** Bearer token from `~/.opencode/.env` (N8N_MCP_AUTH)

## Voice Notification

**When executing a workflow, do BOTH:**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:8888/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running WORKFLOWNAME in Email skill"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **Email** skill...
   ```

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **CheckInbox** | "check email", "check inbox", "new emails", "unread" | `Workflows/CheckInbox.md` |
| **SearchEmail** | "search email", "find email", "look for email" | `Workflows/SearchEmail.md` |
| **ReadEmail** | "read email", "show email", "get email details" | `Workflows/ReadEmail.md` |
| **DraftEmail** | "draft email", "compose email", "write email" | `Workflows/DraftEmail.md` |
| **SendEmail** | "send email", "email someone", "reply to email" | `Workflows/SendEmail.md` |
| **ArchiveEmail** | "archive email", "mark as read", "process email" | `Workflows/ArchiveEmail.md` |
| **ProcessInbox** | "process inbox", "inbox zero", "clean inbox" | `Workflows/ProcessInbox.md` |

## MCP Protocol

This skill uses the Model Context Protocol (MCP) to communicate with Gmail via n8n webhooks.

### Connection Pattern

```bash
# 1. Initialize MCP session
curl -s -X POST "${MCP_ENDPOINT}" \
  -H "Authorization: Bearer ${N8N_MCP_AUTH}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"pai-email","version":"1.0"}}}'

# 2. List available tools
curl -s -X POST "${MCP_ENDPOINT}" \
  -H "Authorization: Bearer ${N8N_MCP_AUTH}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

# 3. Call a tool
curl -s -X POST "${MCP_ENDPOINT}" \
  -H "Authorization: Bearer ${N8N_MCP_AUTH}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"tool_name","arguments":{...}}}'
```

### Account Selection

| User Says | Account | Endpoint |
|-----------|---------|----------|
| "personal", "my personal", (default) | Personal | `gmail-personal` |
| "work", "business", "office" | Work | `gmail-work` |

## Examples

**Example 1: Check for new emails**
```
User: "Check my personal email for anything new"
→ Invokes CheckInbox workflow
→ Connects to gmail-personal MCP
→ Returns unread emails with sender, subject, preview
```

**Example 2: Search for specific email**
```
User: "Search my work email for the project proposal from last week"
→ Invokes SearchEmail workflow
→ Connects to gmail-work MCP
→ Searches with date and keyword filters
→ Returns matching emails
```

**Example 3: Draft and send email**
```
User: "Send an email to john@example.com about the meeting tomorrow"
→ Invokes DraftEmail workflow
→ Creates draft with subject and body
→ Asks for confirmation
→ Sends via SendEmail workflow
```

## Quick Reference

- **Personal Inbox:** `gmail-personal` MCP
- **Work Inbox:** `gmail-work` MCP
- **Auth Token:** `$N8N_MCP_AUTH` from `~/.opencode/.env`
- **Protocol:** MCP over HTTP with SSE
- **Tool:** `Tools/GmailMcp.ts` for CLI operations

## MCP Limitations (HTTP Transport)

The n8n MCP over HTTP has **stateless session** limitations:
- Each HTTP request creates a new session
- Initialize + tool call must happen in the same connection
- Workflows handle this by combining init + operation

**To discover actual tools available:**
1. Open your n8n instance
2. Find the MCP Server Trigger workflow
3. Check what tools it exposes

## Common Gmail MCP Tools (Expected)

| Tool | Purpose |
|------|---------|
| `gmail_list_messages` | List emails with optional filters |
| `gmail_get_message` | Get full email content |
| `gmail_send_message` | Send new email |
| `gmail_draft_create` | Create draft |
| `gmail_modify_message` | Archive, label, mark read/unread |
| `gmail_search` | Search emails |

**Note:** Actual tool names depend on n8n MCP workflow configuration.

## Account Status

| Account | Endpoint | Status |
|---------|----------|--------|
| Personal | `gmail-personal` | ✅ Active |
| Work | `gmail-work` | ✅ Active |
