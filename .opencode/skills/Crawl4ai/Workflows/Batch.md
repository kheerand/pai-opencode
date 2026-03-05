# Batch Workflow

Crawl multiple URLs efficiently using the batch API.

## Trigger

- "batch crawl", "crawl multiple"
- "crawl these URLs"
- "scrape list of sites"

## Steps

### 1. Collect URLs

Accept URLs in any format:
- Comma-separated list
- One per line
- From file
- From array

### 2. Validate URLs

Check each URL is valid format.

### 3. Execute Batch Crawl

**Single request with multiple URLs:**
```bash
curl -X POST http://app-server-2.jerboa-boa.ts.net:11235/crawl_sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRAWL4AI_TOKEN" \
  -d '{
    "urls": [
      "https://site1.com",
      "https://site2.com",
      "https://site3.com"
    ]
  }'
```

**With shared configuration:**
```bash
curl -X POST http://app-server-2.jerboa-boa.ts.net:11235/crawl_sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRAWL4AI_TOKEN" \
  -d '{
    "urls": ["url1", "url2", "url3"],
    "css_selector": ".main-content",
    "cache_mode": "enabled"
  }'
```

### 4. Process Results

For each result:
- Check success status
- Extract markdown content
- Collect links/media
- Handle errors gracefully

### 5. Present Summary

Show:
- Total URLs crawled
- Success/failure count
- Summary of each page
- Combined content or separate files

## Large Batches (10+ URLs)

For large batches, use async API:

```bash
# Submit async crawl
TASK_ID=$(curl -s -X POST http://app-server-2.jerboa-boa.ts.net:11235/crawl \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRAWL4AI_TOKEN" \
  -d '{"urls": ["url1", "url2", ...]}' | jq -r '.task_id')

# Poll for completion
curl -s http://app-server-2.jerboa-boa.ts.net:11235/task/$TASK_ID \
  -H "Authorization: Bearer $CRAWL4AI_TOKEN"
```

## Priority Handling

Set priority for important URLs:

```json
{
  "urls": ["important-url", "less-important", "background"],
  "priority": 10
}
```

Priority range: 1-10 (10 = highest)

## Session Reuse

For related URLs on same domain:

```bash
curl -X POST http://app-server-2.jerboa-boa.ts.net:11235/crawl_sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRAWL4AI_TOKEN" \
  -d '{
    "urls": [
      "https://site.com/page1",
      "https://site.com/page2",
      "https://site.com/page3"
    ],
    "session_id": "batch_session",
    "cache_mode": "enabled"
  }'
```

## Output Formats

### Combined Markdown

Concatenate all results into single document:

```markdown
# Batch Crawl Results

## Page 1: https://site1.com
[Content...]

## Page 2: https://site2.com
[Content...]
```

### JSON Summary

```json
{
  "total": 5,
  "successful": 4,
  "failed": 1,
  "results": [
    {"url": "...", "title": "...", "word_count": 500},
    ...
  ]
}
```

### Individual Files

Save each URL to separate file:
- `site1.com.md`
- `site2.com.md`
- etc.

## Example Usage

**User:** "Crawl these 5 documentation pages: [list]"

**Response:**
1. Parse URL list
2. Execute batch crawl
3. Show progress
4. Present combined results
5. Offer to save to files

## Error Handling

For partial failures:
```json
{
  "total": 5,
  "successful": 3,
  "failed": [
    {"url": "https://failed.com", "error": "timeout"}
  ]
}
```

Report which URLs failed and offer to retry.
