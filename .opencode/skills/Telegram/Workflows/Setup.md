# Setup Telegram Bridge

## Prerequisites

You need:
1. A Telegram account
2. Access to @BotFather on Telegram
3. Your Telegram user ID (get it from @userinfobot)

## Steps

### 1. Create a Telegram Bot

Guide the user through these steps:

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Choose a display name (e.g., "Mico PAI")
4. Choose a username (must end in `bot`, e.g., `mico_pai_bot`)
5. BotFather will give you a token like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

### 2. Get Your User ID

1. Search for **@userinfobot** on Telegram
2. Send it any message
3. It will reply with your user ID (a number like `123456789`)

### 3. Configure Environment

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.profile`):

```bash
export TELEGRAM_BOT_TOKEN="your-bot-token-here"
export TELEGRAM_ALLOW_FROM="your-user-id-here"
```

Or create `~/.opencode/skills/Telegram/.env`:

```bash
TELEGRAM_BOT_TOKEN=your-bot-token-here
TELEGRAM_ALLOW_FROM=your-user-id-here
```

### 4. Install Dependencies

```bash
cd ~/.opencode/skills/Telegram/Tools && bun install
```

### 5. Test Connection

```bash
cd ~/.opencode/skills/Telegram/Tools
TELEGRAM_BOT_TOKEN="your-token" bun TelegramBridge.ts
```

You should see: `✅ Bot connected as @your_bot_username`

### 6. Send a Test Message

Open Telegram, find your bot, and send "Hello". You should get a response from PAI.

### 7. Start as Background Service

Use the Start workflow to run it persistently.
