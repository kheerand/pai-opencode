# Crawl4AI API Reference

Complete reference for the Crawl4AI API at `http://app-server-2.jerboa-boa.ts.net:11235`

## Authentication

All crawl endpoints require Bearer token authentication:

```bash
-H "Authorization: Bearer $CRAWL4AI_TOKEN"
```

## Endpoints

### GET /health

Health check - no authentication required.

**Response:**
```json
{
  "status": "healthy",
  "available_slots": 5,
  "memory_usage": 40.8,
  "cpu_usage": 1.2
}
```

### POST /crawl_sync

Synchronous crawl - waits for result before returning.

**Request Body (CrawlRequest):**
```json
{
  "urls": "https://example.com",
  "css_selector": null,
  "wait_for": null,
  "js_code": null,
  "screenshot": false,
  "magic": false,
  "cache_mode": "enabled",
  "priority": 5,
  "ttl": 3600,
  "session_id": null,
  "extraction_config": null,
  "content_filter": null,
  "chunking_strategy": null,
  "crawler_params": {},
  "extra": {}
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "markdown": "# Page Title\n\nContent...",
  "html": "<html>...</html>",
  "links": {
    "internal": ["/page1", "/page2"],
    "external": ["https://other.com"]
  },
  "media": {
    "images": [{"src": "...", "alt": "..."}],
    "videos": []
  },
  "metadata": {
    "title": "Page Title",
    "description": "Page description"
  }
}
```

### POST /crawl

Asynchronous crawl - returns task_id immediately.

**Response:**
```json
{
  "task_id": "abc123",
  "status": "pending"
}
```

### GET /task/{task_id}

Get status of async crawl task.

**Response:**
```json
{
  "task_id": "abc123",
  "status": "completed",
  "result": { /* CrawlResult */ }
}
```

### POST /crawl_direct

Direct crawl - bypasses queue, immediate execution.

Same request/response as `/crawl_sync`.

## CrawlRequest Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `urls` | string \| array | Yes | - | URL(s) to crawl |
| `css_selector` | string | No | null | Extract only this element |
| `wait_for` | string | No | null | CSS selector or JS condition to wait for |
| `js_code` | array | No | null | JavaScript to execute before extraction |
| `screenshot` | boolean | No | false | Capture page screenshot |
| `magic` | boolean | No | false | Enable magic mode for dynamic content |
| `cache_mode` | string | No | "enabled" | Cache behavior |
| `priority` | integer | No | 5 | Task priority (1-10) |
| `ttl` | integer | No | 3600 | Cache TTL in seconds |
| `session_id` | string | No | null | Session ID for persistent browsing |
| `extraction_config` | object | No | null | Structured extraction config |
| `content_filter` | object | No | null | Content filtering config |
| `chunking_strategy` | object | No | null | Text chunking config |
| `crawler_params` | object | No | {} | Additional crawler parameters |
| `extra` | object | No | {} | Extra metadata |

## Cache Modes

| Mode | Description |
|------|-------------|
| `enabled` | Normal caching (read and write) |
| `disabled` | No caching |
| `read_only` | Only read from cache |
| `write_only` | Only write to cache |
| `bypass` | Bypass cache for this operation |

## Extraction Config

For structured data extraction:

```json
{
  "extraction_config": {
    "type": "json_css",
    "params": {
      "schema": {
        "name": "products",
        "baseSelector": ".product-item",
        "fields": [
          {"name": "title", "selector": "h2", "type": "text"},
          {"name": "price", "selector": ".price", "type": "text"},
          {"name": "link", "selector": "a", "type": "attribute", "attribute": "href"}
        ]
      }
    }
  }
}
```

**Extraction Types:**
- `basic` - Simple text extraction
- `json_css` - CSS selector-based JSON extraction
- `llm` - LLM-based extraction (requires LLM config)
- `cosine` - Cosine similarity-based extraction

## Content Filter

Filter content before extraction:

```json
{
  "content_filter": {
    "type": "bm25",
    "params": {
      "query": "machine learning tutorials",
      "threshold": 1.0
    }
  }
}
```

**Filter Types:**
- `bm25` - Relevance-based filtering with query
- `pruning` - Remove low-quality content

## Chunking Strategy

Split content into chunks:

```json
{
  "chunking_strategy": {
    "type": "regex",
    "params": {
      "pattern": "\\n\\n",
      "strip": true
    }
  }
}
```

## JavaScript Execution

Execute JavaScript before extraction:

```json
{
  "js_code": [
    "window.scrollTo(0, document.body.scrollHeight)",
    "document.querySelector('.load-more')?.click()"
  ],
  "wait_for": "css:.ajax-content"
}
```

## Session Management

Maintain session across multiple crawls:

```json
// First request - establish session
{
  "urls": "https://site.com/login",
  "session_id": "my_session",
  "js_code": [
    "document.querySelector('#username').value = 'user'",
    "document.querySelector('#password').value = 'pass'",
    "document.querySelector('#submit').click()"
  ],
  "wait_for": "css:.dashboard"
}

// Subsequent requests - reuse session
{
  "urls": "https://site.com/protected",
  "session_id": "my_session"
}
```

## Error Responses

**422 Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "urls"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Rate Limits

- 5 concurrent slots available
- Use `priority` (1-10) to prioritize tasks
- Use async `/crawl` for batch operations
