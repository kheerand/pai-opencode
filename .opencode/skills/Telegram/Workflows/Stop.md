# Stop Telegram Bridge

## Steps

1. **Find the running process:**
   ```bash
   pgrep -f "TelegramBridge.ts"
   ```

2. **If running, send SIGTERM for graceful shutdown:**
   ```bash
   pkill -f "TelegramBridge.ts"
   ```

3. **Wait and verify:**
   ```bash
   sleep 2
   pgrep -f "TelegramBridge.ts" && echo "Still running - sending SIGKILL" && pkill -9 -f "TelegramBridge.ts" || echo "Stopped"
   ```

4. **Report to user.**
