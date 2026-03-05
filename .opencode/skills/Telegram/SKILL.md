---
name: Telegram
description: Telegram messaging bridge for PAI-opencode. USE WHEN telegram, messaging, chat bot, telegram bridge, start telegram, stop telegram, telegram status.
---

# Telegram

Telegram messaging bridge that connects your Telegram bot to PAI-opencode, enabling you to interact with your personal AI assistant via Telegram messages.

## Customization

**Before executing, check for user customizations at:**
`~/.opencode/skills/PAI/USER/SKILLCUSTOMIZATIONS/Telegram/`

## Voice Notification

**When executing a workflow, do BOTH:**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:8888/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow in the Telegram skill to ACTION"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **Telegram** skill to ACTION...
   ```

## Architecture

Adapted from OpenClaw's Telegram channel implementation:

```
Telegram User → grammY Bot (long-polling) → PAI Telegram Bridge → opencode run → PAI Agent → Response → Telegram
```

**Key concepts from OpenClaw:**
- grammY library for Telegram Bot API
- Long-polling connection (no webhook needed)
- Allowlist-based access control
- Sequential per-chat message processing
- Typing indicator while processing
- Text chunking at 4096 char Telegram limit
- 👀 ack reaction while processing

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Start** | "start telegram", "launch telegram bridge" | `Workflows/Start.md` |
| **Stop** | "stop telegram", "kill telegram bridge" | `Workflows/Stop.md` |
| **Status** | "telegram status", "is telegram running" | `Workflows/Status.md` |
| **Setup** | "setup telegram", "configure telegram" | `Workflows/Setup.md` |

## Examples

**Example 1: Start the Telegram bridge**
```
User: "Start the telegram bridge"
→ Invokes Start workflow
→ Launches TelegramBridge.ts as background process
→ Bot connects to Telegram and starts polling
→ "Telegram bridge started, listening for messages"
```

**Example 2: Check status**
```
User: "Is telegram running?"
→ Invokes Status workflow
→ Checks if TelegramBridge.ts process is alive
→ Reports connection status, uptime, messages processed
```

**Example 3: Initial setup**
```
User: "Setup telegram for me"
→ Invokes Setup workflow
→ Guides through BotFather bot creation
→ Configures TELEGRAM_BOT_TOKEN and TELEGRAM_ALLOW_FROM
→ Tests connection with bot.getMe()
```

## Configuration

| Variable | Purpose | Required |
|----------|---------|----------|
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | Yes |
| `TELEGRAM_ALLOW_FROM` | Comma-separated Telegram user IDs | Yes |
| `OPENCODE_BIN` | Path to opencode binary | No (default: `~/.opencode/bin/opencode`) |
| `OPENCODE_MODEL` | LLM model to use | No (default: `anthropic/claude-sonnet-4-20250514`) |
| `OPENCODE_WORKING_DIR` | Working directory for opencode | No (default: `~/working_dir`) |

## Quick Reference

- **Bridge tool:** `~/.opencode/skills/Telegram/Tools/TelegramBridge.ts`
- **Start:** `bun ~/.opencode/skills/Telegram/Tools/TelegramBridge.ts`
- **Requires:** `bun`, `grammy` package, `TELEGRAM_BOT_TOKEN` env var
- **Telegram limit:** 4096 chars per message (auto-chunked)
- **Access:** Allowlist only — set TELEGRAM_ALLOW_FROM to your user ID
