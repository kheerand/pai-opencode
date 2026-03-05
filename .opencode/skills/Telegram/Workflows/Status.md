# Telegram Bridge Status

## Steps

1. **Check process:**
   ```bash
   pgrep -af "TelegramBridge.ts"
   ```

2. **Check recent logs:**
   ```bash
   tail -20 ~/.opencode/MEMORY/logs/telegram-bridge.log 2>/dev/null || echo "No log file found"
   ```

3. **Check environment:**
   ```bash
   echo "TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN:+configured}"
   echo "TELEGRAM_ALLOW_FROM: ${TELEGRAM_ALLOW_FROM:-not set}"
   ```

4. **Report:**
   - Running / Not running
   - Last log entries
   - Configuration status
