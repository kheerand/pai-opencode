# ReadEmail Workflow

Get full content of a specific email.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Retrieving full email content"}' \
  > /dev/null 2>&1 &
```

Running the **ReadEmail** workflow in the **Email** skill...

## Prerequisites

User must have identified an email (from CheckInbox or SearchEmail results).

## Steps

### 1. Get Message ID

From previous results, extract the message ID for the requested email number.

### 2. Fetch Full Message

```bash
source ~/.opencode/.env

curl -s -X POST "${MCP_ENDPOINT}" \
  -H "Authorization: Bearer ${N8N_MCP_AUTH}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc":"2.0",
    "id":3,
    "method":"tools/call",
    "params":{
      "name":"gmail_get_message",
      "arguments":{
        "id": "MESSAGE_ID",
        "format": "full"
      }
    }
  }'
```

## Output Format

```
📧 EMAIL DETAILS

**From:** Sender Name <sender@email.com>
**To:** you@email.com
**Subject:** Email Subject Line
**Date:** Thu, Mar 5, 2026 at 10:30 AM

---

[Full email body content]

---

## Attachments
- document.pdf (2.3 MB)
- image.png (150 KB)

## Actions
- "Reply" - Draft a response
- "Forward to..." - Forward email
- "Archive" - Mark as read and archive
- "Delete" - Move to trash
```

## Intent-to-Format Mapping

| User Says | Format |
|-----------|--------|
| (default), "full", "all" | `full` |
| "headers only", "metadata" | `metadata` |
| "raw" | `raw` |
