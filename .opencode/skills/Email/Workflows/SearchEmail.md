# SearchEmail Workflow

Search for specific emails using Gmail search syntax.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Searching emails for your query"}' \
  > /dev/null 2>&1 &
```

Running the **SearchEmail** workflow in the **Email** skill...

## Account Selection

| User Says | Account | Endpoint |
|-----------|---------|----------|
| "personal", (default) | Personal | `gmail-personal` |
| "work" | Work | `gmail-work` |

## Steps

### 1. Parse Search Intent

Convert natural language to Gmail search query:

| User Says | Gmail Query |
|-----------|-------------|
| "from john" | `from:john` |
| "subject project" | `subject:project` |
| "last week" | `newer_than:7d` |
| "has attachment" | `has:attachment` |
| "before january" | `before:2024/01/01` |
| "after january" | `after:2024/01/01` |

### 2. Build Combined Query

Combine multiple filters with space:
- "from john last week" → `from:john newer_than:7d`
- "subject project has attachment" → `subject:project has:attachment`

### 3. Execute Search

```bash
source ~/.opencode/.env

curl -s -X POST "${MCP_ENDPOINT}" \
  -H "Authorization: Bearer ${N8N_MCP_AUTH}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc":"2.0",
    "id":3,
    "method":"tools/call",
    "params":{
      "name":"gmail_list_messages",
      "arguments":{
        "maxResults": 20,
        "q": "YOUR_SEARCH_QUERY"
      }
    }
  }'
```

## Output Format

```
🔍 SEARCH RESULTS - "[query]" - [X] messages found

| # | From | Subject | Date | Preview |
|---|------|---------|------|---------|
| 1 | ... | ... | ... | ... |

## Refine Search
- "Show emails from last month"
- "Only with attachments"
- "Read email #1"
```

## Common Search Patterns

```bash
# From specific person
from:john@example.com

# Subject contains
subject:"project update"

# Date range
after:2024/01/01 before:2024/02/01

# Has attachment
has:attachment

# Unread only
is:unread

# In specific label
label:work

# Exclude
-from:spam@example.com
```
