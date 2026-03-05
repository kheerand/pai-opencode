#!/usr/bin/env bun
/**
 * TelegramBridge.ts — PAI Telegram ↔ opencode bridge
 *
 * Runs a grammY long-polling Telegram bot that forwards messages to
 * `opencode run --format json "..."` and returns the assistant's reply.
 *
 * Usage:
 *   bun TelegramBridge.ts [--help]
 *
 * Environment variables:
 *   TELEGRAM_BOT_TOKEN    Required — bot token from @BotFather
 *   TELEGRAM_ALLOW_FROM   Required — comma-separated Telegram user IDs
 *   OPENCODE_BIN          Path to opencode binary (default: /home/prowler/.opencode/bin/opencode)
 *   OPENCODE_MODEL        LLM model (default: anthropic/claude-sonnet-4-20250514)
 *   OPENCODE_WORKING_DIR  Working directory for opencode (default: /home/prowler/working_dir)
 */

import { Bot, Context, session, SessionFlavor } from "grammy";
import { sequentialize } from "@grammyjs/runner";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";

// ─── Help ────────────────────────────────────────────────────────────────────

if (process.argv.includes("--help")) {
  console.log(`
PAI Telegram Bridge - Connect Telegram to PAI-opencode

Usage: bun TelegramBridge.ts [options]

Environment Variables:
  TELEGRAM_BOT_TOKEN    Bot token from @BotFather (required)
  TELEGRAM_ALLOW_FROM   Comma-separated user IDs (required)
  OPENCODE_BIN          Path to opencode binary
  OPENCODE_MODEL        LLM model to use
  OPENCODE_WORKING_DIR  Working directory for opencode

Options:
  --help    Show this help message
`);
  process.exit(0);
}

// ─── Configuration ───────────────────────────────────────────────────────────

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOW_FROM_RAW = process.env.TELEGRAM_ALLOW_FROM;
const OPENCODE_BIN =
  process.env.OPENCODE_BIN ?? "/home/prowler/.opencode/bin/opencode";
const OPENCODE_MODEL =
  process.env.OPENCODE_MODEL ?? "anthropic/claude-sonnet-4-20250514";
const OPENCODE_WORKING_DIR =
  process.env.OPENCODE_WORKING_DIR ?? "/home/prowler/working_dir";

// Offset persistence file — tracks last-processed update to avoid duplicates
const OFFSET_FILE = join(
  process.env.HOME ?? "/home/prowler",
  ".opencode",
  "telegram_offset.json"
);

// Telegram message size limit
const TELEGRAM_MAX_LENGTH = 4096;

// Typing refresh interval (ms) — keep "typing…" alive during long opencode runs
const TYPING_INTERVAL_MS = 4_500;

// opencode hard timeout (ms) — abort if it takes too long
const OPENCODE_TIMEOUT_MS = 180_000; // 3 minutes

// ─── Validation ──────────────────────────────────────────────────────────────

if (!BOT_TOKEN) {
  log("error", "TELEGRAM_BOT_TOKEN is not set — exiting");
  process.exit(1);
}

if (!ALLOW_FROM_RAW) {
  log("error", "TELEGRAM_ALLOW_FROM is not set — exiting");
  process.exit(1);
}

const ALLOWED_USER_IDS: Set<number> = new Set(
  ALLOW_FROM_RAW.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
);

log(
  "info",
  `Allowlist: ${[...ALLOWED_USER_IDS].join(", ")} | model: ${OPENCODE_MODEL} | workdir: ${OPENCODE_WORKING_DIR}`
);

// ─── Logging ─────────────────────────────────────────────────────────────────

type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, ...args: unknown[]): void {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;
  if (level === "error") {
    console.error(prefix, ...args);
  } else {
    console.error(prefix, ...args); // always stderr so stdout stays clean
  }
}

// ─── Update Offset Persistence ───────────────────────────────────────────────

interface OffsetState {
  offset: number;
}

function readOffset(): number {
  try {
    if (!existsSync(OFFSET_FILE)) return 0;
    const raw = readFileSync(OFFSET_FILE, "utf8");
    const state: OffsetState = JSON.parse(raw);
    return state.offset ?? 0;
  } catch {
    return 0;
  }
}

function writeOffset(offset: number): void {
  try {
    const state: OffsetState = { offset };
    writeFileSync(OFFSET_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch (err) {
    log("warn", "Failed to persist offset:", err);
  }
}

// ─── Allowlist Check ─────────────────────────────────────────────────────────

function isAllowed(userId: number | undefined): boolean {
  if (userId === undefined) return false;
  return ALLOWED_USER_IDS.has(userId);
}

// ─── Text Chunking ───────────────────────────────────────────────────────────

/**
 * Split text into chunks of at most `limit` characters.
 * Prefers splitting at the last newline before the limit to keep
 * paragraphs intact.
 */
function chunkText(text: string, limit: number = TELEGRAM_MAX_LENGTH): string[] {
  if (text.length <= limit) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= limit) {
      chunks.push(remaining);
      break;
    }

    // Try to split at last newline within the window
    let splitAt = remaining.lastIndexOf("\n", limit);
    if (splitAt <= 0) splitAt = limit;

    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }

  return chunks;
}

// ─── opencode JSON Event Types ───────────────────────────────────────────────

interface TextEvent {
  type: "text";
  part: {
    text: string;
  };
}

interface ToolUseEvent {
  type: "tool_use";
  part: {
    tool: string;
    state?: {
      status?: string;
      output?: string;
    };
  };
}

interface StepEvent {
  type: "step_start" | "step_finish";
}

type OpenCodeEvent = TextEvent | ToolUseEvent | StepEvent | { type: string };

// ─── opencode Subprocess ─────────────────────────────────────────────────────

interface RunResult {
  response: string;
  error?: string;
}

/**
 * Invoke opencode as a subprocess, collect JSON-line events, and
 * return the concatenated text response from the final step.
 */
async function runOpenCode(message: string): Promise<RunResult> {
  return new Promise((resolve) => {
    log("info", `Spawning opencode for message (${message.length} chars)`);

    const child = spawn(
      OPENCODE_BIN,
      ["run", "--format", "json", "--model", OPENCODE_MODEL, message],
      {
        cwd: OPENCODE_WORKING_DIR,
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    // Per-step text accumulation — we track across all steps but
    // prefer the last step's text for the final response.
    const allTextParts: string[] = [];
    let currentStepText: string[] = [];
    let lastStepText: string[] = [];
    let buffer = "";
    let finished = false;
    let timedOut = false;

    // Hard timeout
    const timer = setTimeout(() => {
      timedOut = true;
      log("warn", "opencode timed out — killing subprocess");
      child.kill("SIGKILL");
    }, OPENCODE_TIMEOUT_MS);

    child.stdout.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf8");

      // Process complete lines
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // keep incomplete trailing line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let event: OpenCodeEvent;
        try {
          event = JSON.parse(trimmed) as OpenCodeEvent;
        } catch {
          // Not JSON — could be a banner or debug output; skip
          log("debug", "Non-JSON stdout line:", trimmed.slice(0, 120));
          continue;
        }

        switch (event.type) {
          case "step_start":
            // Save previous step's text and reset
            if (currentStepText.length > 0) {
              lastStepText = [...currentStepText];
            }
            currentStepText = [];
            break;

          case "text": {
            const textEvent = event as TextEvent;
            const text = textEvent.part?.text ?? "";
            if (text) {
              allTextParts.push(text);
              currentStepText.push(text);
            }
            break;
          }

          case "step_finish":
            if (currentStepText.length > 0) {
              lastStepText = [...currentStepText];
            }
            currentStepText = [];
            break;

          case "tool_use":
            // Log tool usage for debugging but don't include in response
            {
              const toolEvent = event as ToolUseEvent;
              log(
                "debug",
                `Tool: ${toolEvent.part?.tool} status=${toolEvent.part?.state?.status}`
              );
            }
            break;

          default:
            break;
        }
      }
    });

    child.stderr.on("data", (chunk: Buffer) => {
      // opencode debug/log output — relay to our stderr
      const text = chunk.toString("utf8").trimEnd();
      log("debug", "[opencode stderr]", text);
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      if (!finished) {
        finished = true;
        log("error", "opencode process error:", err);
        resolve({ response: "", error: `Process error: ${err.message}` });
      }
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (finished) return;
      finished = true;

      log("info", `opencode exited with code ${code}`);

      if (timedOut) {
        resolve({
          response: "",
          error: "opencode timed out after 3 minutes",
        });
        return;
      }

      // Finalise: flush any remaining buffer
      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer.trim()) as OpenCodeEvent;
          if (event.type === "text") {
            const text = (event as TextEvent).part?.text ?? "";
            if (text) {
              allTextParts.push(text);
              currentStepText.push(text);
            }
          }
        } catch {
          /* ignore */
        }
      }

      // Commit final step text
      if (currentStepText.length > 0) {
        lastStepText = [...currentStepText];
      }

      // Build final response: prefer the last step's text; fall back to all text
      const bestText =
        lastStepText.length > 0 ? lastStepText : allTextParts;
      const response = bestText.join("").trim();

      if (!response) {
        if (code !== 0) {
          resolve({
            response: "",
            error: `opencode exited with code ${code} and produced no output`,
          });
        } else {
          resolve({ response: "(no response)" });
        }
        return;
      }

      resolve({ response });
    });
  });
}

// ─── Bot Session Types ────────────────────────────────────────────────────────

// We don't use session data currently but keeping the type for extensibility
type BotSession = Record<string, never>;
type BotContext = Context & SessionFlavor<BotSession>;

// ─── Bot Setup ───────────────────────────────────────────────────────────────

const bot = new Bot<BotContext>(BOT_TOKEN);

// Session middleware (required by sequentialize)
bot.use(
  session<BotSession, BotContext>({
    initial: () => ({}),
  })
);

// Sequential per-chat processing — prevents concurrent responses to same chat
bot.use(
  sequentialize<BotContext>((ctx) => {
    const chatId = ctx.chat?.id;
    return chatId !== undefined ? String(chatId) : undefined;
  })
);

// ─── Message Handler ─────────────────────────────────────────────────────────

bot.on("message:text", async (ctx) => {
  const userId = ctx.from?.id;
  const chatId = ctx.chat.id;
  const messageId = ctx.message.message_id;
  const userText = ctx.message.text;

  // ── Access control ──────────────────────────────────────────────────────
  if (!isAllowed(userId)) {
    log("warn", `Rejected message from unauthorized user ${userId}`);
    await ctx.reply("⛔ You are not authorized to use this bot.").catch(() => {});
    return;
  }

  log(
    "info",
    `Message from user ${userId} in chat ${chatId}: "${userText.slice(0, 80)}${userText.length > 80 ? "…" : ""}"`
  );

  // ── Acknowledge with 👀 reaction ─────────────────────────────────────────
  try {
    await ctx.api.setMessageReaction(chatId, messageId, [
      { type: "emoji", emoji: "👀" },
    ]);
  } catch (err) {
    // Reactions may not be supported in all chat types — non-fatal
    log("debug", "setMessageReaction failed:", err);
  }

  // ── Typing indicator loop ────────────────────────────────────────────────
  let typingActive = true;

  const sendTyping = async () => {
    try {
      if (typingActive) {
        await ctx.api.sendChatAction(chatId, "typing");
      }
    } catch {
      /* ignore — chat may have been closed */
    }
  };

  await sendTyping();
  const typingInterval = setInterval(sendTyping, TYPING_INTERVAL_MS);

  // ── Run opencode ─────────────────────────────────────────────────────────
  let result: RunResult;
  try {
    result = await runOpenCode(userText);
  } catch (err) {
    clearInterval(typingInterval);
    typingActive = false;

    log("error", "Unexpected error from runOpenCode:", err);
    await ctx.reply("❌ An unexpected error occurred. Please try again.").catch(() => {});
    return;
  }

  clearInterval(typingInterval);
  typingActive = false;

  // ── Handle errors from opencode ──────────────────────────────────────────
  if (result.error && !result.response) {
    log("error", "opencode error:", result.error);
    await ctx
      .reply(`❌ opencode error:\n\`${result.error}\``, {
        parse_mode: "Markdown",
      })
      .catch(() => {});
    // Clear 👀 reaction
    try {
      await ctx.api.setMessageReaction(chatId, messageId, []);
    } catch { /* non-fatal */ }
    return;
  }

  // ── Send response (chunked) ──────────────────────────────────────────────
  const responseText = result.response || "(empty response)";
  const chunks = chunkText(responseText);

  log("info", `Sending response: ${chunks.length} chunk(s), total ${responseText.length} chars`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      await ctx.reply(chunk, {
        // Only add chunk indicator when there are multiple chunks
        ...(chunks.length > 1
          ? {
              reply_markup: undefined,
            }
          : {}),
      });

      // Small delay between chunks to respect rate limits
      if (i < chunks.length - 1) {
        await Bun.sleep(300);
      }
    } catch (err) {
      log("error", `Failed to send chunk ${i + 1}/${chunks.length}:`, err);
      // Try sending as plain text if markdown fails
      try {
        await ctx.reply(chunk);
      } catch {
        log("error", `Failed to send chunk ${i + 1} as plain text`);
      }
    }
  }

  // ── Remove 👀 reaction (processing done) ────────────────────────────────
  try {
    await ctx.api.setMessageReaction(chatId, messageId, []);
  } catch {
    /* non-fatal */
  }
});

// ─── Error Handler ───────────────────────────────────────────────────────────

bot.catch((err) => {
  log("error", "Bot error:", err.message, err.error);
});

// ─── Graceful Shutdown ───────────────────────────────────────────────────────

async function shutdown(signal: string) {
  log("info", `Received ${signal} — shutting down gracefully`);
  try {
    bot.stop();
    log("info", "Bot stopped");
  } catch (err) {
    log("warn", "Error stopping bot:", err);
  }
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ─── Start ───────────────────────────────────────────────────────────────────

log("info", "Starting PAI Telegram Bridge…");
log("info", `opencode binary: ${OPENCODE_BIN}`);
log("info", `Model: ${OPENCODE_MODEL}`);
log("info", `Working directory: ${OPENCODE_WORKING_DIR}`);

// Restore last offset for deduplication
const savedOffset = readOffset();
if (savedOffset > 0) {
  log("info", `Resuming from update offset ${savedOffset}`);
}

bot.start({
  drop_pending_updates: savedOffset === 0, // Drop stale updates on first run
  allowed_updates: ["message"],
  onStart: (info) => {
    log("info", `Bot started as @${info.username} — listening for messages`);
    writeOffset(0); // Reset on successful start
  },
});
