# ArchiveEmail Workflow

Archive, label, or mark emails as read/unread.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Processing email actions"}' \
  > /dev/null 2>&1 &
```

Running the **ArchiveEmail** workflow in the **Email** skill...

## Actions

| User Says | Action | Gmail Modification |
|-----------|--------|-------------------|
| "archive" | Remove from inbox | `removeLabelIds: ["INBOX"]` |
| "mark as read" | Mark read | `removeLabelIds: ["UNREAD"]` |
| "mark as unread" | Mark unread | `addLabelIds: ["UNREAD"]` |
| "star" | Star email | `addLabelIds: ["STARRED"]` |
| "unstar" | Remove star | `removeLabelIds: ["STARRED"]` |
| "delete" | Move to trash | `addLabelIds: ["TRASH"]` |
| "label as work" | Add label | `addLabelIds: ["Label_..."]` |

## Steps

### 1. Get Message ID

From previous CheckInbox or SearchEmail results.

### 2. Execute Modification

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
      "name":"gmail_modify_message",
      "arguments":{
        "id": "MESSAGE_ID",
        "addLabelIds": ["LABEL_ID"],
        "removeLabelIds": ["INBOX", "UNREAD"]
      }
    }
  }'
```

## Output Format

```
✅ EMAIL UPDATED

**Subject:** Original Subject
**Action:** Archived and marked as read

## Quick Actions
- "Undo" - Reverse the action (if available)
- "Next email" - Process next in list
```

## Batch Operations

For multiple emails:
- "Archive all unread" - Process all matching
- "Mark all as read" - Bulk update

## Common Labels

| Label | ID | Purpose |
|-------|-----|---------|
| INBOX | `INBOX` | Main inbox |
| UNREAD | `UNREAD` | Unread marker |
| STARRED | `STARRED` | Starred items |
| TRASH | `TRASH` | Deleted |
| SPAM | `SPAM` | Spam folder |
| Custom | `Label_123` | User labels |
