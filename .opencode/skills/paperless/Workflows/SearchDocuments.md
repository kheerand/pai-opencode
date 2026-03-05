# Search and Retrieve Documents

Search for documents in Document repository using full-text search, filters, and metadata queries.

## Search Methods

### 1. Full-Text Search

Search across document content, titles, and metadata.

```bash
paperless_search_documents "AAMI insurance renewal"
```

**Returns:** Documents matching the query with relevance score.

### 2. Filter by Tags

List documents and filter by specific tags.

```bash
# List all documents (paginated)
paperless_list_documents --page=1 --page_size=100

# Then search within results for specific tags
paperless_search_documents "tag:Action tag:R 1 year"
```

### 3. Get Specific Document

Retrieve complete document details by ID.

```bash
paperless_get_document --id=123
```

### 4. Download Documents

Download document or original file.

```bash
# Download processed PDF
paperless_download_document --id=123

# Download original file
paperless_download_document --id=123 --original=true
```

## Common Search Patterns

### Find Action Items

```bash
# Find all documents needing action
paperless_search_documents "tag:Action"
```

### Find by Folder

```bash
# All documents in specific folder
paperless_search_documents "tag:\"F Tax FY25\""
```

### Find by Correspondent

```bash
# All documents from ATO
paperless_search_documents "correspondent:ATO"
```

### Find by Retention Policy

```bash
# Documents expiring soon
paperless_search_documents "tag:\"R 30 days\""
```

### Find by Document Type

```bash
# All invoices
paperless_search_documents "type:Invoice"
```

### Combined Searches

```bash
# Tax documents from ATO
paperless_search_documents "ATO tax invoice"

# Cytrax receipts
paperless_search_documents "Cytrax receipt"

# Family-related action items
paperless_search_documents "Family tag:Action"
```

## Workflow: Review Expiring Documents

```bash
# 1. Find documents with retention tags
paperless_search_documents "tag:\"R 30 days\" OR tag:\"R 1 year\""

# 2. Review each document
paperless_get_document --id=<doc_id>

# 3. Update lifecycle if needed
paperless_bulk_edit_documents \
  --documents=[<doc_ids>] \
  --method=set_permissions \
  --permissions="tag:Archive"

# Or delete if expired
paperless_bulk_edit_documents \
  --documents=[<doc_ids>] \
  --method=delete
```

## Workflow: Monthly Review

```bash
# 1. Find all Inbox items
paperless_search_documents "tag:Inbox"

# 2. Find all Action items
paperless_search_documents "tag:Action"

# 3. Process each:
#    - Assign folder tags (F prefix)
#    - Set appropriate lifecycle (Record, Archive)
#    - Apply retention policy (R prefix)
#    - Add related-to tags

# 4. Update documents in bulk
paperless_bulk_edit_documents \
  --documents=[<doc_ids>] \
  --method=modify_tags \
  --add_tags=[<folder_tag_id>, <related_tag_id>, <retention_tag_id>] \
  --remove_tags=[19]  # Remove Inbox tag
```

## Export Results

```bash
# Download multiple documents (via script)
for doc_id in $(paperless_search_documents "tag:\"F Tax FY25\"" | jq -r '.results[].id'); do
  paperless_download_document --id=$doc_id
done
```

## Search Tips

1. **Use quotes** for exact phrases: `"AAMI insurance"`
2. **Combine terms** for refined results: `tax invoice ATO`
3. **Use wildcards** (if supported): `insur*`
4. **Filter by date** in title: `"2025-01"` or `"January 2025"`
5. **Tag-specific:** `tag:Action` or `tag:"F Tax FY25"`
