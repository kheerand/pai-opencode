# Crawl Workflow

Basic web crawling to extract markdown content from URLs.

## Trigger

- "crawl", "scrape", "fetch"
- "get content from URL"
- "convert URL to markdown"

## Decision: webfetch vs Crawl4ai

**Ask yourself: Is this a simple, static page where speed matters?**

```
Is it a simple static page AND just need content?
├── YES → Try webfetch first (faster, ~1-3s)
│         └── If webfetch returns empty/wrong → Escalate to Crawl4ai
└── NO → Any of these?
          ├── JS rendering needed (SPA, React, Vue)
          ├── CSS selector needed (specific element)
          ├── Will fetch same URL repeatedly (caching)
          ├── Page known to be dynamic
          └── Crawl4ai (more capable, ~3-10s)
```

## Steps

### 1. Validate URL

Ensure the user provides a valid URL. If not, ask.

### 2. Choose Tool

**Quick decision checklist:**
- [ ] Static HTML page? → `webfetch`
- [ ] Unknown page type? → `webfetch` first, escalate if needed
- [ ] SPA / JS-heavy? → `Crawl4ai` with `magic: true`
- [ ] Need specific element? → `Crawl4ai` with `css_selector`
- [ ] Repeated fetches expected? → `Crawl4ai` (caching)

### 3a. If Using webfetch

```
webfetch(url="https://example.com", format="markdown")
```

**Check result:**
- Content looks good → Done
- Empty or clearly wrong → Proceed to Crawl4ai (step 3b)

### 3b. If Using Crawl4ai

**Check API Health:**
```bash
curl -s http://app-server-2.jerboa-boa.ts.net:11235/health
```

**Execute Crawl:**

**Basic crawl:**
```bash
curl -X POST http://app-server-2.jerboa-boa.ts.net:11235/crawl_sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRAWL4AI_TOKEN" \
  -d '{"urls": "https://example.com"}'
```

**With CSS selector (extract specific element):**
```bash
curl -X POST http://app-server-2.jerboa-boa.ts.net:11235/crawl_sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRAWL4AI_TOKEN" \
  -d '{
    "urls": "https://example.com",
    "css_selector": ".main-content"
  }'
```

**For JavaScript-heavy pages:**
```bash
curl -X POST http://app-server-2.jerboa-boa.ts.net:11235/crawl_sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRAWL4AI_TOKEN" \
  -d '{
    "urls": "https://example.com",
    "wait_for": "css:.content-loaded",
    "magic": true
  }'
```

**With screenshot:**
```bash
curl -X POST http://app-server-2.jerboa-boa.ts.net:11235/crawl_sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRAWL4AI_TOKEN" \
  -d '{
    "urls": "https://example.com",
    "screenshot": true
  }'
```

### 4. Process Result (Crawl4ai only)

Extract from response:
- `result.markdown` - Clean markdown content
- `result.links` - Internal and external links
- `result.media` - Images and videos
- `result.metadata` - Page metadata

### 5. Present to User

Display:
- Title and metadata
- Markdown content (truncate if very long)
- Links summary
- Any images/media found

## Example Usage

**User:** "Crawl https://docs.python.org/3/library/asyncio.html"

**Response:**
1. Assess: Static docs page → Try webfetch first
2. webfetch returns good content → Done
3. If webfetch failed → Crawl4ai crawl_sync
4. Present markdown content + links

**User:** "Get the content from https://app.example.com/dashboard"

**Response:**
1. Assess: "app" suggests SPA → Skip webfetch, go directly to Crawl4ai
2. Crawl4ai with `magic: true` and `wait_for`
3. Present rendered content

## Troubleshooting

**webfetch returned empty content:**
- Page is likely JS-heavy → Escalate to Crawl4ai with `magic: true`

**Crawl4ai empty content:**
- Try `magic: true` for dynamic pages
- Add `wait_for` with appropriate selector
- Check if JavaScript execution needed

**Timeout:**
- API may be busy - check health endpoint
- Try async `/crawl` instead of sync

**Authentication error:**
- Verify CRAWL4AI_TOKEN is set
- Check token hasn't expired
