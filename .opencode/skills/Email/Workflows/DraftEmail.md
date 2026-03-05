# DraftEmail Workflow

Create a draft email for review before sending.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Creating draft email for your review"}' \
  > /dev/null 2>&1 &
```

Running the **DraftEmail** workflow in the **Email** skill...

## Required Information

Ask for missing details:
- **To:** Recipient email address
- **Subject:** Email subject line
- **Body:** Email content (or ask to generate from context)

## Steps

### 1. Gather Details

```
Drafting email. Please confirm:
- To: [recipient]
- Subject: [subject]
- Account: [personal/work]
```

### 2. Create Draft

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
      "name":"gmail_draft_create",
      "arguments":{
        "to": ["recipient@email.com"],
        "subject": "Subject Line",
        "body": "Email body content here...",
        "contentType": "text/plain"
      }
    }
  }'
```

## Output Format

```
📝 DRAFT CREATED

**To:** recipient@email.com
**Subject:** Subject Line

---

[Draft body content]

---

## Actions
- "Send it" - Send the draft
- "Edit body" - Modify content
- "Change subject" - Update subject
- "Add CC" - Add recipients
- "Discard" - Delete draft
```

## Tone Options

| User Says | Tone |
|-----------|------|
| "professional", "formal" | Formal business tone |
| "casual", "friendly" | Relaxed conversational |
| "brief", "short" | Concise, to the point |
| (default) | Professional but warm |

## Reply Detection

If user says "reply to email #X":
1. Get original email details
2. Pre-fill To, Subject (Re: ...), and quote original
3. Ask for reply content
