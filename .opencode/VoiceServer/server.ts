#!/usr/bin/env bun
/**
 * PAI Voice Server
 *
 * ElevenLabs + Google Cloud TTS notification server.
 * Receives JSON payloads via POST /notify and speaks them aloud.
 *
 * Port: 8888 (configurable via VOICE_SERVER_PORT)
 *
 * @module voice-server
 * @version 1.0.0
 */

import { serve } from "bun";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// ── Configuration ───────────────────────────────────────────────────────────

const OPENCODE_DIR = join(homedir(), ".opencode");
const VOICE_SERVER_DIR = join(OPENCODE_DIR, "VoiceServer");
const ENV_PATH = join(OPENCODE_DIR, ".env");
const VOICES_PATH = join(VOICE_SERVER_DIR, "voices.json");
const LOG_DIR = join(VOICE_SERVER_DIR, "logs");
const PID_FILE = join(VOICE_SERVER_DIR, "server.pid");
const PORT = parseInt(process.env.VOICE_SERVER_PORT || "8888");

// Load .env file manually (Bun supports this natively, but belt-and-suspenders)
function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  if (existsSync(ENV_PATH)) {
    const lines = readFileSync(ENV_PATH, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      env[key] = value;
      // Also set in process.env if not already there
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
  return env;
}

const envVars = loadEnv();

// TTS Configuration
const TTS_PROVIDER = process.env.TTS_PROVIDER || envVars.TTS_PROVIDER || "elevenlabs";
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || envVars.ELEVENLABS_API_KEY || "";
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || envVars.ELEVENLABS_VOICE_ID || "";
const ELEVENLABS_MODEL = process.env.ELEVENLABS_MODEL || envVars.ELEVENLABS_MODEL || "eleven_multilingual_v2";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || envVars.GOOGLE_API_KEY || "";
const GOOGLE_TTS_VOICE = process.env.GOOGLE_TTS_VOICE || envVars.GOOGLE_TTS_VOICE || "en-US-Neural2-D";
const GOOGLE_TTS_TIER = process.env.GOOGLE_TTS_TIER || envVars.GOOGLE_TTS_TIER || "premium";

// Load voice routing table
function loadVoices(): Record<string, string> {
  try {
    if (existsSync(VOICES_PATH)) {
      return JSON.parse(readFileSync(VOICES_PATH, "utf-8"));
    }
  } catch (e) {
    log("WARN", `Failed to load voices.json: ${e}`);
  }
  return {};
}

let voiceRouting = loadVoices();

// ── Logging ─────────────────────────────────────────────────────────────────

if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_FILE = join(LOG_DIR, "server.log");

function log(level: string, message: string): void {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}`;
  console.log(line);
  try {
    const file = Bun.file(LOG_FILE);
    Bun.write(LOG_FILE, (existsSync(LOG_FILE) ? readFileSync(LOG_FILE, "utf-8") : "") + line + "\n");
  } catch {
    // Don't fail on log write errors
  }
}

// ── Audio Playback Queue ────────────────────────────────────────────────────

let isPlaying = false;
const playbackQueue: Buffer[] = [];

async function enqueueAudio(audioBuffer: Buffer): Promise<void> {
  playbackQueue.push(audioBuffer);
  if (!isPlaying) {
    processQueue();
  }
}

async function processQueue(): Promise<void> {
  if (isPlaying || playbackQueue.length === 0) return;
  isPlaying = true;

  while (playbackQueue.length > 0) {
    const buffer = playbackQueue.shift()!;
    try {
      await playAudio(buffer);
    } catch (e) {
      log("ERROR", `Playback failed: ${e}`);
    }
  }

  isPlaying = false;
}

async function playAudio(audioBuffer: Buffer): Promise<void> {
  // Write to temp file and play
  const tmpFile = join(VOICE_SERVER_DIR, "tmp_audio.mp3");
  writeFileSync(tmpFile, audioBuffer);

  try {
    // Try multiple players in order of preference
    const players = ["mpv", "ffplay", "aplay", "paplay"];
    let played = false;

    for (const player of players) {
      try {
        const whichResult = Bun.spawnSync(["which", player]);
        if (whichResult.exitCode !== 0) continue;

        let args: string[];
        switch (player) {
          case "mpv":
            args = [player, "--no-terminal", "--no-video", tmpFile];
            break;
          case "ffplay":
            args = [player, "-nodisp", "-autoexit", "-loglevel", "quiet", tmpFile];
            break;
          case "aplay":
          case "paplay":
            // These need WAV - convert first if we have ffmpeg
            const ffmpegCheck = Bun.spawnSync(["which", "ffmpeg"]);
            if (ffmpegCheck.exitCode === 0) {
              const wavFile = tmpFile.replace(".mp3", ".wav");
              Bun.spawnSync(["ffmpeg", "-y", "-i", tmpFile, "-loglevel", "quiet", wavFile]);
              args = [player, wavFile];
            } else {
              continue;
            }
            break;
          default:
            continue;
        }

        const proc = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
        await proc.exited;
        played = true;
        break;
      } catch {
        continue;
      }
    }

    // Fallback: try PowerShell on WSL
    if (!played) {
      try {
        // Convert to Windows path for WSL
        const winPath = tmpFile.replace(/^\/mnt\/([a-z])/, (_, drive: string) => `${drive.toUpperCase()}:`).replace(/\//g, "\\");

        // Try wslpath for proper conversion, fallback to manual
        let actualWinPath = winPath;
        try {
          const wslpathResult = Bun.spawnSync(["wslpath", "-w", tmpFile]);
          if (wslpathResult.exitCode === 0) {
            actualWinPath = wslpathResult.stdout.toString().trim();
          }
        } catch { }

        // Copy to a Windows-accessible temp location
        const winTmpDir = "/mnt/c/Windows/Temp";
        const winTmpFile = join(winTmpDir, "pai_voice.mp3");
        writeFileSync(winTmpFile, audioBuffer);

        const psCommand = `
          Add-Type -AssemblyName presentationCore
          $player = New-Object System.Windows.Media.MediaPlayer
          $player.Open([uri]"C:\\Windows\\Temp\\pai_voice.mp3")
          Start-Sleep -Milliseconds 500
          $player.Play()
          while ($player.NaturalDuration.HasTimeSpan -eq $false) { Start-Sleep -Milliseconds 100 }
          $duration = $player.NaturalDuration.TimeSpan.TotalMilliseconds
          Start-Sleep -Milliseconds ($duration + 500)
          $player.Close()
        `;

        const proc = Bun.spawn(
          ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", psCommand],
          { stdout: "pipe", stderr: "pipe" }
        );
        await proc.exited;
        played = true;
        log("INFO", "Played audio via PowerShell (WSL)");
      } catch (e) {
        log("WARN", `PowerShell playback failed: ${e}`);
      }
    }

    if (!played) {
      log("WARN", "No audio player available. Audio generated but not played.");
    }
  } finally {
    // Cleanup temp files
    try {
      const { unlinkSync } = require("fs");
      unlinkSync(tmpFile);
      const wavFile = tmpFile.replace(".mp3", ".wav");
      if (existsSync(wavFile)) unlinkSync(wavFile);
    } catch { }
  }
}

// ── TTS Providers ───────────────────────────────────────────────────────────

async function synthesizeElevenLabs(text: string, voiceId?: string): Promise<Buffer | null> {
  const vid = voiceId || ELEVENLABS_VOICE_ID;
  if (!ELEVENLABS_API_KEY || !vid) {
    log("ERROR", "ElevenLabs API key or voice ID not configured");
    return null;
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log("ERROR", `ElevenLabs API error (${response.status}): ${errorText}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (e) {
    log("ERROR", `ElevenLabs synthesis failed: ${e}`);
    return null;
  }
}

async function synthesizeGoogleTTS(text: string): Promise<Buffer | null> {
  if (!GOOGLE_API_KEY) {
    log("ERROR", "Google API key not configured");
    return null;
  }

  try {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;

    // Parse voice name to extract language code
    const voiceParts = GOOGLE_TTS_VOICE.split("-");
    const languageCode = voiceParts.slice(0, 2).join("-"); // e.g., "en-GB"

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode,
          name: GOOGLE_TTS_VOICE,
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log("ERROR", `Google TTS API error (${response.status}): ${errorText}`);
      return null;
    }

    const data = await response.json() as { audioContent: string };
    return Buffer.from(data.audioContent, "base64");
  } catch (e) {
    log("ERROR", `Google TTS synthesis failed: ${e}`);
    return null;
  }
}

async function synthesize(text: string, voiceId?: string): Promise<Buffer | null> {
  // If a specific voice_id is provided, always use ElevenLabs (voice_id is an ElevenLabs concept)
  if (voiceId && voiceId !== ELEVENLABS_VOICE_ID) {
    return synthesizeElevenLabs(text, voiceId);
  }

  // Otherwise use the configured provider
  const provider = TTS_PROVIDER.toLowerCase();

  if (provider === "google") {
    const result = await synthesizeGoogleTTS(text);
    if (result) return result;
    // Fallback to ElevenLabs if Google fails
    log("WARN", "Google TTS failed, falling back to ElevenLabs");
    return synthesizeElevenLabs(text, voiceId);
  }

  // Default: ElevenLabs
  const result = await synthesizeElevenLabs(text, voiceId);
  if (result) return result;
  // Fallback to Google if ElevenLabs fails
  log("WARN", "ElevenLabs failed, falling back to Google TTS");
  return synthesizeGoogleTTS(text);
}

// ── CORS ────────────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Request Handler ─────────────────────────────────────────────────────────

let notificationCount = 0;
const startTime = Date.now();

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  // CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // ── Health Check ────────────────────────────────────────────────────────
  if (path === "/health" && method === "GET") {
    return jsonResponse({
      status: "healthy",
      version: "1.0.0",
      port: PORT,
      provider: TTS_PROVIDER,
      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      notifications_sent: notificationCount,
      queue_length: playbackQueue.length,
      is_playing: isPlaying,
      timestamp: new Date().toISOString(),
    });
  }

  // ── Notify Endpoint ─────────────────────────────────────────────────────
  if (path === "/notify" && method === "POST") {
    try {
      const body = await req.json() as {
        message: string;
        voice_id?: string;
        title?: string;
        priority?: string;
      };

      if (!body.message) {
        return jsonResponse({ error: "Missing 'message' field" }, 400);
      }

      const { message, voice_id, title } = body;

      log("INFO", `Notification: "${message}" (voice: ${voice_id || "default"}, title: ${title || "none"})`);

      // Resolve voice_id from routing table if it looks like an agent name
      let resolvedVoiceId = voice_id;
      if (voice_id && voiceRouting[voice_id]) {
        resolvedVoiceId = voiceRouting[voice_id];
      }

      // Synthesize and play (non-blocking)
      notificationCount++;
      synthesize(message, resolvedVoiceId).then((audio) => {
        if (audio) {
          enqueueAudio(audio);
        } else {
          log("WARN", `No audio generated for: "${message}"`);
        }
      }).catch((e) => {
        log("ERROR", `Synthesis error: ${e}`);
      });

      return jsonResponse({
        status: "ok",
        message: "Notification queued",
        provider: resolvedVoiceId ? "elevenlabs" : TTS_PROVIDER,
        notification_id: notificationCount,
      }, 202);
    } catch (e: any) {
      log("ERROR", `Notify error: ${e.message}`);
      return jsonResponse({ error: e.message }, 500);
    }
  }

  // ── Voices Endpoint ─────────────────────────────────────────────────────
  if (path === "/voices" && method === "GET") {
    voiceRouting = loadVoices(); // Reload
    return jsonResponse({
      routing: voiceRouting,
      default_provider: TTS_PROVIDER,
      default_voice_id: ELEVENLABS_VOICE_ID,
      google_voice: GOOGLE_TTS_VOICE,
    });
  }

  // ── Stats Endpoint ──────────────────────────────────────────────────────
  if (path === "/stats" && method === "GET") {
    return jsonResponse({
      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      notifications_sent: notificationCount,
      queue_length: playbackQueue.length,
      is_playing: isPlaying,
      provider: TTS_PROVIDER,
    });
  }

  // ── Root ────────────────────────────────────────────────────────────────
  if (path === "/" && method === "GET") {
    return new Response(
      `<html>
<head><title>PAI Voice Server</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #0d1117; color: #c9d1d9; }
  h1 { color: #58a6ff; }
  .card { background: #161b22; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #30363d; }
  .stat { display: inline-block; margin-right: 30px; }
  .stat-value { font-size: 28px; font-weight: bold; color: #58a6ff; }
  .stat-label { color: #8b949e; font-size: 13px; }
  code { background: #161b22; padding: 2px 6px; border-radius: 4px; }
  a { color: #58a6ff; }
</style>
</head>
<body>
  <h1>🔊 PAI Voice Server</h1>
  <div class="card">
    <div class="stat"><div class="stat-value">✓</div><div class="stat-label">Status</div></div>
    <div class="stat"><div class="stat-value">${PORT}</div><div class="stat-label">Port</div></div>
    <div class="stat"><div class="stat-value">${notificationCount}</div><div class="stat-label">Sent</div></div>
  </div>
  <div class="card">
    <h3>Endpoints</h3>
    <ul>
      <li><a href="/health">/health</a> — Health check</li>
      <li><code>POST /notify</code> — Send notification</li>
      <li><a href="/voices">/voices</a> — Voice routing</li>
      <li><a href="/stats">/stats</a> — Statistics</li>
    </ul>
  </div>
  <div class="card">
    <h3>Test</h3>
    <code>curl -X POST http://localhost:${PORT}/notify -H "Content-Type: application/json" -d '{"message":"Hello from PAI"}'</code>
  </div>
</body>
</html>`,
      { headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  }

  return jsonResponse({ error: "Not found" }, 404);
}

// ── Server Startup ──────────────────────────────────────────────────────────

// Write PID file
writeFileSync(PID_FILE, process.pid.toString());

const server = serve({
  port: PORT,
  fetch: handleRequest,
});

log("INFO", `🔊 PAI Voice Server running on http://localhost:${PORT}`);
log("INFO", `📡 TTS Provider: ${TTS_PROVIDER}`);
log("INFO", `🎤 ElevenLabs Voice: ${ELEVENLABS_VOICE_ID || "not configured"}`);
log("INFO", `🗣️ Google Voice: ${GOOGLE_TTS_VOICE}`);
log("INFO", `📋 PID: ${process.pid}`);

// Cleanup on exit
process.on("SIGTERM", () => {
  log("INFO", "Received SIGTERM, shutting down...");
  try { require("fs").unlinkSync(PID_FILE); } catch { }
  process.exit(0);
});

process.on("SIGINT", () => {
  log("INFO", "Received SIGINT, shutting down...");
  try { require("fs").unlinkSync(PID_FILE); } catch { }
  process.exit(0);
});
