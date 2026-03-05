# SendEmail Workflow

Send an email immediately or send a draft.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Sending email now"}' \
  > /dev/null/ 2>&1 &
```

Running the **SendEmail** workflow in the **Email** skill...

## Two Modes

### Mode 1: Send Existing Draft

If a draft was just created:
1. Confirm draft details
2. Get user approval
3. Send

### Mode 2: Compose and Send

If user provides all details in one request:
1. Parse recipients, subject, body
2. Show preview
3. Get confirmation
4. Send

## Steps

### 1. Confirmation (REQUIRED)

**ALWAYS show preview and ask for confirmation before sending:**

```
Ready to send:

**To:** recipient@email.com
**Subject:** Subject Line
**Account:** [personal/work]

---

[Email body preview - first 200 chars...]

---

Send this email? (yes/no)
```

### 2. Execute Send

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
      "name":"gmail_send_message",
      "arguments":{
        "to": ["recipient@email.com"],
        "subject": "Subject Line",
        "body": "Full email body content...",
        "contentType": "text/plain"
      }
    }
  }'
```

## Output Format

```
✅ EMAIL SENT

**To:** recipient@email.com
**Subject:** Subject Line
**Time:** [timestamp]

Message ID: [gmail_message_id]
```

## Safety Checks

**NEVER send without explicit user confirmation.**

| Scenario | Action |
|----------|--------|
| User says "send" without preview | Show preview, ask confirmation |
| User says "yes" or "send it" | Proceed with send |
| User says "no" or "cancel" | Abort, return to draft |
| User wants changes | Return to DraftEmail workflow |

## CC/BCC Support

| User Says | Field |
|-----------|-------|
| "cc john@email.com" | `cc: ["john@email.com"]` |
| "bcc them" | `bcc: [...]` |

## HTML vs Plain Text

| User Says | Content Type |
|-----------|--------------|
| (default) | `text/plain` |
| "html", "formatted" | `text/html` |
