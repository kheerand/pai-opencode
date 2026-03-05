# Extract Workflow

Extract structured data from web pages using CSS selectors or LLM-based extraction.

## Trigger

- "extract data from"
- "extract structured"
- "get products from"
- "scrape table from"

## Steps

### 1. Understand Extraction Goal

Ask user:
- What data to extract?
- What format? (JSON, CSV, etc.)
- Any specific patterns?

### 2. Build Extraction Schema

**CSS-based extraction (fast, no LLM):**
```json
{
  "extraction_config": {
    "type": "json_css",
    "params": {
      "schema": {
        "name": "items",
        "baseSelector": ".item",
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

**Field Types:**
- `text` - Inner text content
- `attribute` - HTML attribute value
- `html` - Inner HTML
- `element` - Full element HTML

### 3. Execute Extraction

```bash
curl -X POST http://app-server-2.jerboa-boa.ts.net:11235/crawl_sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CRAWL4AI_TOKEN" \
  -d '{
    "urls": "https://shop.example.com/products",
    "extraction_config": {
      "type": "json_css",
      "params": {
        "schema": {
          "name": "products",
          "baseSelector": ".product-card",
          "fields": [
            {"name": "name", "selector": ".product-title", "type": "text"},
            {"name": "price", "selector": ".price", "type": "text"},
            {"name": "image", "selector": "img", "type": "attribute", "attribute": "src"}
          ]
        }
      }
    }
  }'
```

### 4. Process Extracted Data

Parse response and format:
- As JSON for API consumption
- As markdown table for display
- As CSV for export

## Common Patterns

### E-commerce Products

```json
{
  "name": "products",
  "baseSelector": "[data-product-id]",
  "fields": [
    {"name": "id", "selector": null, "type": "attribute", "attribute": "data-product-id"},
    {"name": "title", "selector": ".product-name", "type": "text"},
    {"name": "price", "selector": ".current-price", "type": "text"},
    {"name": "rating", "selector": ".stars", "type": "attribute", "attribute": "data-rating"},
    {"name": "url", "selector": "a", "type": "attribute", "attribute": "href"}
  ]
}
```

### News Articles

```json
{
  "name": "articles",
  "baseSelector": "article",
  "fields": [
    {"name": "headline", "selector": "h2, h3", "type": "text"},
    {"name": "summary", "selector": "p", "type": "text"},
    {"name": "author", "selector": ".author", "type": "text"},
    {"name": "date", "selector": "time", "type": "attribute", "attribute": "datetime"},
    {"name": "link", "selector": "a", "type": "attribute", "attribute": "href"}
  ]
}
```

### Table Data

```json
{
  "name": "table_rows",
  "baseSelector": "table tbody tr",
  "fields": [
    {"name": "col1", "selector": "td:nth-child(1)", "type": "text"},
    {"name": "col2", "selector": "td:nth-child(2)", "type": "text"},
    {"name": "col3", "selector": "td:nth-child(3)", "type": "text"}
  ]
}
```

### Job Listings

```json
{
  "name": "jobs",
  "baseSelector": ".job-listing",
  "fields": [
    {"name": "title", "selector": ".job-title", "type": "text"},
    {"name": "company", "selector": ".company-name", "type": "text"},
    {"name": "location", "selector": ".location", "type": "text"},
    {"name": "salary", "selector": ".salary", "type": "text"},
    {"name": "posted", "selector": ".date-posted", "type": "text"}
  ]
}
```

## Content Filtering

Use content filtering to focus extraction:

```json
{
  "urls": "https://blog.example.com",
  "content_filter": {
    "type": "bm25",
    "params": {
      "query": "python async programming",
      "threshold": 0.5
    }
  },
  "extraction_config": {...}
}
```

## Example Usage

**User:** "Extract all product names and prices from https://shop.example.com/sale"

**Response:**
1. Build schema for products
2. Execute extraction
3. Format as table:

| Name | Price |
|------|-------|
| Product 1 | $29.99 |
| Product 2 | $49.99 |
