# ProcessInbox Workflow

Systematically process inbox toward inbox zero.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Starting inbox processing session"}' \
  > /dev/null 2>&1 &
```

Running the **ProcessInbox** workflow in the **Email** skill...

## Goal

Process emails one by one with actions until inbox is cleared or user stops.

## Steps

### 1. Get Unread Count

```bash
# Fetch unread messages
curl -s -X POST "${MCP_ENDPOINT}" \
  -H "Authorization: Bearer ${N8N_MCP_AUTH}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc":"2.0",
    "id":3,
    "method":"tools/call",
    "params":{
      "name":"gmail_list_messages",
      "arguments":{
        "maxResults": 50,
        "q": "is:unread in:inbox"
      }
    }
  }'
```

### 2. Present Summary

```
📬 INBOX PROCESSING - [Account]

**Unread in inbox:** [X] messages

Starting with most recent...

---

📧 EMAIL 1 of [X]

**From:** sender@email.com
**Subject:** Subject Line
**Date:** Today
**Preview:** First 100 characters of email...

## Actions
- "Read" - See full content
- "Archive" - Mark done, remove from inbox
- "Reply" - Draft response
- "Star" - Mark for later
- "Delete" - Move to trash
- "Skip" - Next email
- "Stop" - End processing session
```

### 3. Process Each Email

For each email:
1. Show sender, subject, preview
2. Wait for user action
3. Execute action
4. Show next email

### 4. Progress Tracking

```
📊 PROGRESS

**Processed:** [Y] emails
**Remaining:** [X - Y] in inbox
**Actions taken:**
- Archived: [A]
- Replied: [B]
- Starred: [C]
- Deleted: [D]

Continue? (next/stop)
```

## Quick Actions

| User Says | Action |
|-----------|--------|
| "next", "skip" | Move to next email |
| "archive", "done" | Archive and next |
| "read" | Show full content, then next |
| "reply" | Draft reply, then next |
| "star" | Star for later, next |
| "delete" | Trash and next |
| "stop", "enough" | End session |

## Batch Quick Process

| User Says | Action |
|-----------|--------|
| "archive all newsletters" | Search + bulk archive |
| "mark all from X as read" | Filter + bulk mark read |
| "delete all promotions" | Filter + bulk delete |

## Session End

```
✅ INBOX PROCESSING COMPLETE

**Session Summary:**
- Started with: [X] unread
- Processed: [Y] emails
- Ending with: [Z] unread

**Actions:**
- Archived: [A]
- Replied: [B]
- Starred: [C]
- Deleted: [D]
- Skipped: [E]

Great work! 🎉
```
