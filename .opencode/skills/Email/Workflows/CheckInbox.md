# CheckInbox Workflow

Check for new/unread emails in the specified account.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Checking inbox for new emails"}' \
  > /dev/null 2>&1 &
```

Running the **CheckInbox** workflow in the **Email** skill...

## Account Selection

| User Says | Account | Endpoint Variable |
|-----------|---------|-------------------|
| "personal", "my personal", (default) | Personal | `MCP_ENDPOINT="https://n8n.s.cytrax.com.au/mcp/gmail-personal"` |
| "work", "business", "office" | Work | `MCP_ENDPOINT="https://n8n.s.cytrax.com.au/mcp/gmail-work"` |

## Steps

### 1. Load Auth Token

```bash
source ~/.opencode/.env
AUTH_TOKEN="$N8N_MCP_AUTH"
```

### 2. Initialize MCP Session

```bash
curl -s -X POST "${MCP_ENDPOINT}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"pai-email","version":"1.0"}}}'
```

### 3. List Available Tools (First Run Only)

```bash
curl -s -X POST "${MCP_ENDPOINT}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

### 4. List Unread Messages

Call the appropriate tool (e.g., `gmail_list_messages`) with filter for unread:

```bash
curl -s -X POST "${MCP_ENDPOINT}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc":"2.0",
    "id":3,
    "method":"tools/call",
    "params":{
      "name":"gmail_list_messages",
      "arguments":{
        "maxResults": 20,
        "q": "is:unread"
      }
    }
  }'
```

## Output Format

Present results as:

```
📬 INBOX - [Account] - [X] unread messages

| # | From | Subject | Date | Preview |
|---|------|---------|------|---------|
| 1 | sender@email.com | Subject line | Today | First 50 chars... |

## Actions
- "Read email #1" - Get full content
- "Archive email #1" - Mark as read/archive
- "Reply to #1" - Draft reply
```

## Intent-to-Filter Mapping

| User Says | Gmail Query |
|-----------|-------------|
| "unread", "new" | `is:unread` |
| "from john" | `from:john` |
| "this week" | `newer_than:7d` |
| "important" | `is:important` |
| "starred" | `is:starred` |
