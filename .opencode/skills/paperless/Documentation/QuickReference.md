# Quick Reference Guide

Common Document repository operations and workflows with example commands.

## Quick Commands

### List Documents
```bash
# First 100 documents
paperless_list_documents --page=1 --page_size=100

# All documents (loop through pages)
```

### Search Documents
```bash
# Full-text search
paperless_search_documents "AAMI insurance"

# By tag
paperless_search_documents "tag:Action"

# By type
paperless_search_documents "type:Invoice"
```

### Get Document
```bash
# Get details
paperless_get_document --id=123

# Download PDF
paperless_download_document --id=123

# Download original
paperless_download_document --id=123 --original=true
```

### Upload Document
```bash
# Basic upload
paperless_post_document \
  --file="/path/to/document.pdf" \
  --filename="document.pdf" \
  --title="Document Title"

# Full upload with metadata
paperless_post_document \
  --file="/path/to/document.pdf" \
  --filename="document.pdf" \
  --title="Document Title" \
  --correspondent=3 \
  --document_type=4 \
  --tags=[19,16,44,1]
```

### Bulk Operations
```bash
# Add tag to multiple documents
paperless_bulk_edit_documents \
  --documents=[123,124,125] \
  --method=add_tag \
  --tag=16

# Remove tag
paperless_bulk_edit_documents \
  --documents=[123,124,125] \
  --method=remove_tag \
  --tag=19

# Modify multiple tags
paperless_bulk_edit_documents \
  --documents=[123,124,125] \
  --method=modify_tags \
  --add_tags=[12,16] \
  --remove_tags=[19,28]

# Set document type
paperless_bulk_edit_documents \
  --documents=[123,124,125] \
  --method=set_document_type \
  --document_type=4

# Delete documents
paperless_bulk_edit_documents \
  --documents=[123,124,125] \
  --method=delete
```

### Create Metadata
```bash
# Create tag
paperless_create_tag \
  --name="New Tag" \
  --color="#B2654D" \
  --match="search term" \
  --matching_algorithm="any"

# Create correspondent
paperless_create_correspondent \
  --name="Company Name" \
  --match="Company" \
  --matching_algorithm="any"

# Create document type
paperless_create_document_type \
  --name="New Type" \
  --match="type keyword" \
  --matching_algorithm="any"
```

---

## Common Workflows

### Process Inbox
```bash
# 1. Find inbox items
paperless_search_documents "tag:Inbox"

# 2. Get IDs
doc_ids=$(paperless_search_documents "tag:Inbox" | jq -r '.results[].id')

# 3. Review each and classify
for doc_id in $doc_ids; do
  paperless_get_document --id=$doc_id
  # Decide on classification
done

# 4. Apply tags in bulk
paperless_bulk_edit_documents \
  --documents=$doc_ids \
  --method=modify_tags \
  --add_tags=[<record_tag_id>] \
  --remove_tags=[<inbox_tag_id>]
```

### Review Action Items
```bash
# Find action items
paperless_search_documents "tag:Action"

# Process each
# Either complete (→ Record) or keep in Action
```

### Monthly Retention Check
```bash
# Find retention tags
paperless_search_documents "tag:\"R 30 days\""
paperless_search_documents "tag:\"R 1 year\""
paperless_search_documents "tag:\"R 7 years\""

# Review and decide: extend retention, archive, or delete
```

### Find Tax Documents
```bash
# All tax-related documents
paperless_search_documents "tax ATO invoice"

# By folder tag
paperless_search_documents "tag:\"F Tax FY25\""

# By correspondent
paperless_search_documents "correspondent:ATO"
```

---

## Tag IDs Reference

### Lifecycle Tags
- Action: 19
- Archive: 12
- Delete: 18
- Expired: 20
- Inbox: [find with `paperless_list_tags`]
- Record: [find with `paperless_list_tags`]

### Document Types
- Action: 6
- Archive: 8
- Correspondence: 2
- Invoice: 4
- Legal: 7
- Note: 3
- Receipt: 1
- Reference: 5

### Common Correspondents
- AAMI: 3
- ATO: 23
- Huntingtower: 27
- National Australia Bank: 12
- JB Hi Fi: 18

### Common Folder Tags (F prefix)
- F Amateur radio license: 16
- F Bellevue Ct, Mulgrave: 37
- F DFP506: 38
- F High school: 45
- F Miller crescent property: 41
- F Shares portfolio: 42
- F Tax FY25: 46

### Common Related-to Tags
- Anaya: 29
- Cytrax: 34
- Family: 2
- Financial: 3
- Frodo: 4

---

## Search Patterns

### By Date
```bash
"January 2025"
"2025-01"
"2024"
```

### By Type
```bash
"invoice"
"receipt"
"correspondence"
"legal"
```

### By Organization
```bash
"AAMI"
"ATO"
"Cytrax"
"Huntingtower"
```

### By Person
```bash
"Anaya"
"Ethan"
"Family"
```

### Combined
```bash
"AAMI insurance 2025"
"tax invoice ATO"
"Cytrax receipt"
"Anaya certificate"
```

---

## Color Quick Reference

### Folder Tags: #B2654D (Terracotta)
Physical filing cabinet equivalent

### Retention Tags: #B2654D (Terracotta)
Time-based retention policies

### Lifecycle Tags: #8C7760 (Warm Taupe)
Document processing status

### Related-to Tags: #608080 (Dusty Blue-Teal)
People, organizations, topics

---

## Common Issues & Solutions

### Document Not Found
- Check if deleted: `paperless_list_documents`
- Try broader search terms
- Check if OCR processing completed

### OCR Poor Quality
- Reprocess: `paperless_bulk_edit_documents --documents=[123] --method=reprocess`
- Check original file quality
- Verify document is not image-only without text

### Tags Not Applying
- Verify tag exists: `paperless_list_tags`
- Check tag ID is correct
- Try using slug name instead of ID

### Bulk Operation Fails
- Try smaller batch sizes
- Check individual documents first
- Verify all documents exist

---

## Tips & Tricks

1. **Use descriptive titles** with dates for easy searching
2. **Always add folder tags** (F prefix) to new documents
3. **Set retention policies** on upload to avoid backlog
4. **Process inbox weekly** to prevent pile-up
5. **Review action items** regularly
6. **Use related-to tags** for cross-referencing
7. **Test on small batches** before bulk operations
8. **Backup before major changes** (automatic Dropbox sync)

---

## Integration with Claude Code

This skill provides MCP tools for direct Document repository access. Use these tools in:
- Automated document processing workflows
- Search and retrieval tasks
- Bulk classification operations
- Periodic maintenance tasks

For complex operations, combine multiple workflows:
1. Search → 2. Classify → 3. Tag → 4. Archive
