---
name: Crawl4ai
description: Web crawling and data extraction via Crawl4AI API. USE WHEN crawl, scrape, extract data from websites, web scraping, markdown from URL, batch crawl.
version: 1.1.0
last_updated: 2026-02-24
---

# Crawl4ai

Web crawling and data extraction via your Crawl4AI API instance.

## When to Use Crawl4ai vs webfetch

**webfetch is faster (~1-3s) for simple, static pages.** Crawl4ai is more capable (~3-10s) but has higher latency.

| Scenario | Tool | Reason |
|----------|------|--------|
| Simple static page, quick fetch | **webfetch** | Faster, lower overhead |
| First attempt at unknown page | **webfetch** | Try simple first |
| SPA / React / Vue / JS-heavy | **Crawl4ai** | Browser rendering required |
| Need specific CSS element | **Crawl4ai** | CSS selector support |
| Extract structured data | **Crawl4ai** | Extraction schemas |
| Multiple URLs at once | **Crawl4ai** | Batch efficiency |
| Will fetch same URL repeatedly | **Crawl4ai** | Cache makes it instant |
| webfetch returned empty/wrong | **Crawl4ai** | Escalate to browser rendering |

**Default behavior:** Try webfetch first. Escalate to Crawl4ai if it fails or you need advanced features.

## API Endpoint

```
http://app-server-2.jerboa-boa.ts.net:11235
```

## Workflow Routing

| Trigger | Workflow |
|---------|----------|
| "crawl", "scrape", "fetch url" | `Workflows/Crawl.md` |
| "extract data", "extract from", "structured extraction" | `Workflows/Extract.md` |
| "batch crawl", "crawl multiple", "crawl list" | `Workflows/Batch.md` |

## Quick Reference

**Health Check:**
```bash
curl -s http://app-server-2.jerboa-boa.ts.net:11235/health
```

**Basic Crawl (sync):**
```bash
curl -X POST http://app-server-2.jerboa-boa.ts.net:11235/crawl_sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRAWL4AI_TOKEN" \
  -d '{"urls": "https://example.com"}'
```

**Key Endpoints:**
| Endpoint | Purpose |
|----------|---------|
| `/crawl_sync` | Synchronous crawl (wait for result) |
| `/crawl` | Async crawl (returns task_id) |
| `/crawl_direct` | Direct crawl (no queue) |
| `/task/{task_id}` | Get async task status |

**CrawlRequest Schema:**
- `urls` (required): Single URL or array of URLs
- `css_selector`: Focus on specific element
- `wait_for`: CSS selector or JS condition
- `js_code`: Array of JavaScript strings to execute
- `screenshot`: Capture page screenshot (default: false)
- `magic`: Enable magic mode for dynamic content
- `cache_mode`: enabled/disabled/read_only/write_only/bypass
- `extraction_config`: Structured extraction settings
- `content_filter`: BM25 or pruning content filter
- `session_id`: Persist session across crawls

## Authentication

Token is stored in `~/.opencode/.env` as `CRAWL4AI_API_TOKEN`.

**To use in commands:**
```bash
# Source the token
export CRAWL4AI_TOKEN=$(grep CRAWL4AI_API_TOKEN ~/.opencode/.env | cut -d= -f2)

# Or use directly
curl -H "Authorization: Bearer $(grep CRAWL4AI_API_TOKEN ~/.opencode/.env | cut -d= -f2)" ...
```

## Examples

**Crawl single URL to markdown (static page):**
```
User: "Crawl https://docs.python.org/3/whatsnew/3.12.html"
→ Try webfetch first (static docs page)
→ If needed: Crawl4ai POST /crawl_sync
→ Returns markdown content
```

**Crawl JS-heavy page:**
```
User: "Get content from https://app.example.com/dashboard"
→ Skip webfetch (SPA detected)
→ Crawl4ai with magic: true, wait_for
→ Returns rendered content
```

**Extract structured data:**
```
User: "Extract product info from https://shop.example.com/product/123"
→ Crawl4ai POST /crawl_sync with extraction_config
→ Returns structured JSON
```

**Batch crawl:**
```
User: "Crawl all these URLs: url1, url2, url3"
→ Crawl4ai POST /crawl_sync with urls array
→ Returns array of results
```

## Full Documentation

- API Reference: See `ApiReference.md` in this skill directory
