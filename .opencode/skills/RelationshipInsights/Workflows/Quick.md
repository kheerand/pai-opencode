# Quick Relationship Insights Workflow

**Purpose:** Condensed insights with meeting patterns and key themes only.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Running quick relationship insights workflow"}' \
  > /dev/null 2>&1 &
```

## Step 1: Identify Person

Same as Full workflow - ask if not provided.

## Step 2: Search and Count

```bash
find "/mnt/c/Users/kheer/Dropbox/PKM/journals" -name "*.md" -exec grep -l "{PERSON_NAME}" {} \; 2>/dev/null
```

## Step 3: Extract Meeting List

Quick extraction of meeting files:
- Date
- Meeting type (from filename)
- Count by year

## Step 4: Identify Top Themes

Scan meeting filenames for:
- Topic keywords
- Project names
- Meeting types

## Step 5: Output Summary

```
## Quick Insights: {Person Name}

**Total Files:** {count}
**Meetings:** {meeting_count}
**Date Range:** {earliest} - {latest}

### Meeting Breakdown
| Year | Meetings | 
|------|----------|
| {year} | {count} |

### Top Themes
1. {Theme 1}
2. {Theme 2}
3. {Theme 3}

### Promises
#### You have promised to
1. {Promise 1 I have made to Person}
2. {Promise 2 I have made to Person}

#### You are wating on them for
1. {Promise or action 1 they have made to me}
2. {Promise or action 2 they have made to me}

### Meeting Pattern
{2-3 sentences about frequency and cadence}

---
*For full insights including how to work with them, run: "Relationship insights on {Person Name}"*
```

## When to Use

- First look at a relationship
- Quick reference before a meeting
- Checking if full analysis warranted
