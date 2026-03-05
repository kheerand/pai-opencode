# Bulk Process Documents

Process multiple documents at once using bulk operations for tagging, classification, and lifecycle management.

## Bulk Operations Available

### Set Metadata
- `set_correspondent` - Assign single correspondent
- `set_document_type` - Assign single document type
- `set_storage_path` - Set storage path
- `set_permissions` - Manage document access

### Tag Management
- `add_tag` - Add single tag to multiple documents
- `remove_tag` - Remove single tag from multiple documents
- `modify_tags` - Add/remove multiple tags at once

### Document Operations
- `delete` - Delete multiple documents
- `reprocess` - Re-run OCR on documents
- `merge` - Merge multiple documents
- `split` - Split documents
- `rotate` - Rotate pages
- `delete_pages` - Remove specific pages

## Workflow: Bulk Classify Inbox Documents

```bash
# 1. Find all Inbox documents
paperless_search_documents "tag:Inbox"

# 2. Extract document IDs
doc_ids=$(paperless_search_documents "tag:Inbox" | jq -r '.results[].id')

# 3. Process in batches by type
# Example: All utility bills
utility_docs=$(echo $doc_ids | tr ' ' '\n' | xargs -I {} paperless_get_document --id={} | \
  jq -r 'select(.title | contains("Utility")) | .id')

# 4. Apply folder tag
paperless_bulk_edit_documents \
  --documents=$utility_docs \
  --method=add_tag \
  --tag=<folder_tag_id>

# 5. Set document type
paperless_bulk_edit_documents \
  --documents=$utility_docs \
  --method=set_document_type \
  --document_type=4  # Invoice

# 6. Apply retention
paperless_bulk_edit_documents \
  --documents=$utility_docs \
  --method=add_tag \
  --tag=<r_1_year_tag_id>

# 7. Remove Inbox, add Record
paperless_bulk_edit_documents \
  --documents=$utility_docs \
  --method=modify_tags \
  --add_tags=[<record_tag_id>] \
  --remove_tags=[<inbox_tag_id>]
```

## Workflow: Monthly Bill Processing

```bash
# 1. Search for recent bills
paperless_search_documents "invoice bill 2025-01"

# 2. Get IDs for all January bills
january_bills=$(paperless_search_documents "invoice bill January 2025" | \
  jq -r '.results[].id' | paste -sd "," -)

# 3. Classify by sender
# AGL bills
agl_bills=$(echo $january_bills | tr ',' '\n' | xargs -I {} \
  paperless_get_document --id={} | jq -r 'select(.correspondent_name == "AGL") | .id')

# Apply tags to AGL bills
paperless_bulk_edit_documents \
  --documents=$agl_bills \
  --method=modify_tags \
  --add_tags=[<folder_tag_id>, <r_1_year_tag_id>, <record_tag_id>]

# Repeat for other correspondents
```

## Workflow: Archive Old Records

```bash
# 1. Find documents older than specified date
# (Note: Requires date-based search or filter)

# 2. Move to Archive
paperless_bulk_edit_documents \
  --documents=[123,124,125,126] \
  --method=modify_tags \
  --add_tags=[12] \
  --remove_tags=[31]  # Record → Archive

# 3. Apply retention policy if needed
paperless_bulk_edit_documents \
  --documents=[123,124,125,126] \
  --method=add_tag \
  --tag=<r_7_years_tag_id>
```

## Workflow: Bulk Retention Review

```bash
# 1. Find all documents with retention tags
docs_30days=$(paperless_search_documents "tag:\"R 30 days\"" | jq -r '.results[].id')
docs_1year=$(paperless_search_documents "tag:\"R 1 year\"" | jq -r '.results[].id')

# 2. Review each category
echo "Documents with R 30 days tag:"
for doc_id in $docs_30days; do
  paperless_get_document --id=$doc_id | jq -r '.title'
done

echo "Documents with R 1 year tag:"
for doc_id in $docs_1year; do
  paperless_get_document --id=$doc_id | jq -r '.title'
done

# 3. Bulk actions based on review
# Example: Change from R 30 days to R 1 year
paperless_bulk_edit_documents \
  --documents=$docs_30days \
  --method=modify_tags \
  --add_tags=[<r_1_year_tag_id>] \
  --remove_tags=[<r_30_days_tag_id>]
```

## Workflow: Merge Related Documents

```bash
# 1. Find related documents
related_docs=$(paperless_search_documents "project proposal" | jq -r '.results[].id' | paste -sd "," -)

# 2. Merge documents
paperless_bulk_edit_documents \
  --documents=$related_docs \
  --method=merge

# 3. Apply tags to merged document
merged_id=<new_merged_document_id>
paperless_bulk_edit_documents \
  --documents=[$merged_id] \
  --method=modify_tags \
  --add_tags=[<folder_tag_id>, <record_tag_id>]
```

## Workflow: Add Correspondent to Documents

```bash
# 1. Find documents from a specific sender (by title/content)
huntingtower_docs=$(paperless_search_documents "Huntingtower" | jq -r '.results[].id')

# 2. Assign correspondent
paperless_bulk_edit_documents \
  --documents=$huntingtower_docs \
  --method=set_correspondent \
  --correspondent=27  # Huntingtower correspondent ID

# 3. Add related tag
paperless_bulk_edit_documents \
  --documents=$huntingtower_docs \
  --method=add_tag \
  --tag=<education_tag_id>
```

## Workflow: Bulk Re-OCR Documents

```bash
# 1. Find documents with poor OCR
# (Based on search results or manual selection)

# 2. Reprocess
paperless_bulk_edit_documents \
  --documents=[123,124,125] \
  --method=reprocess

# 3. Wait and verify results
# Check documents again for improved searchability
```

## Workflow: Delete Test Documents

```bash
# 1. Find test documents
test_docs=$(paperless_search_documents "test document" | jq -r '.results[].id')

# 2. Review before deletion
for doc_id in $test_docs; do
  echo "Document $doc_id:"
  paperless_get_document --id=$doc_id | jq -r '.title, .created'
done

# 3. Bulk delete
paperless_bulk_edit_documents \
  --documents=$test_docs \
  --method=delete
```

## Best Practices

1. **Batch by type:** Process similar documents together (bills, receipts, correspondence)
2. **Review in groups:** Don't process all documents at once - group by month, type, or folder
3. **Backup before bulk:** Always verify before bulk delete operations
4. **Test on small sets:** Try operations on 2-3 documents before applying to 50+
5. **Document changes:** Keep a log of bulk operations for audit trail

## Error Handling

```bash
# Handle failed operations
if ! paperless_bulk_edit_documents --documents=[123,124] --method=delete; then
  echo "Bulk delete failed, checking individually"
  for doc_id in 123 124; do
    paperless_bulk_edit_documents --documents=[$doc_id] --method=delete
  done
fi
```
