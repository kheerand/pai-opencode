# Start Telegram Bridge

## Steps

1. **Check prerequisites:**
   ```bash
   # Verify env vars are set
   echo "TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN:+set}"
   echo "TELEGRAM_ALLOW_FROM: ${TELEGRAM_ALLOW_FROM:+set}"
   ```
   If either is not set, inform the user and suggest running the Setup workflow.

2. **Check if already running:**
   ```bash
   pgrep -f "TelegramBridge.ts" && echo "ALREADY RUNNING" || echo "NOT RUNNING"
   ```
   If already running, report PID and exit.

3. **Install dependencies (if needed):**
   ```bash
   cd ~/.opencode/skills/Telegram/Tools && bun install 2>/dev/null || true
   ```

4. **Start the bridge as a background process:**
   ```bash
   nohup bun ~/.opencode/skills/Telegram/Tools/TelegramBridge.ts \
     >> ~/.opencode/MEMORY/logs/telegram-bridge.log 2>&1 &
   echo "PID: $!"
   ```

5. **Verify connection (wait 3 seconds, check log):**
   ```bash
   sleep 3
   tail -5 ~/.opencode/MEMORY/logs/telegram-bridge.log
   ```

6. **Report status to user.**
