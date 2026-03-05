# Apply Retention Policy

Apply and manage document retention policies using R prefix tags and lifecycle management.

## Retention Tags

**Available Tags:**
- R 30 days - Retain for 30 days
- R 1 year - Retain for 1 year
- R 7 years - Retain for 7 years
- R forever - Keep permanently

## Workflow: Set Retention on New Document

```bash
# Upload with retention tag
paperless_post_document \
  --file="/path/to/document.pdf" \
  --filename="temp_document.pdf" \
  --title="Temporary Document" \
  --document_type=4 \
  --tags=[<folder_tag>, <retention_tag_30days>, 28]  # 28 = Inbox
```

## Workflow: Review Expiring Documents

```bash
# 1. Find documents with retention tags
paperless_search_documents "tag:\"R 30 days\""
paperless_search_documents "tag:\"R 1 year\""
paperless_search_documents "tag:\"R 7 years\""

# 2. Review document details
paperless_get_document --id=123

# 3. Decide action:
#    - Delete if expired and no longer needed
#    - Archive if still valuable
#    - Change to longer retention if needed
```

## Workflow: Bulk Update Retention

```bash
# Change multiple documents from R 30 days to R 1 year
paperless_bulk_edit_documents \
  --documents=[123, 124, 125] \
  --method=modify_tags \
  --add_tags=[<r_1_year_tag_id>] \
  --remove_tags=[<r_30_days_tag_id>]
```

## Workflow: Expire and Delete Documents

```bash
# 1. Find expired documents
paperless_search_documents "tag:\"R 30 days\""

# 2. Review and confirm deletion
for doc_id in $(paperless_search_documents "tag:\"R 30 days\"" | jq -r '.results[].id'); do
  echo "Reviewing document $doc_id"
  paperless_get_document --id=$doc_id
  # Prompt for confirmation
done

# 3. Delete confirmed documents
paperless_bulk_edit_documents \
  --documents=[123, 124, 125] \
  --method=delete
```

## Workflow: Permanent Records

```bash
# Mark important documents as permanent
paperless_bulk_edit_documents \
  --documents=[123, 124, 125] \
  --method=modify_tags \
  --add_tags=[<r_forever_tag_id>, 12]  # 12 = Archive
```

## Retention Policy Guidelines

### 30-Day Retention
- Temporary notices
- Confirmations that are verified elsewhere
- Draft documents
- Non-critical communication

### 1-Year Retention
- Annual statements
- Regular bills (after payment confirmation)
- Routine correspondence
- Temporary insurance documents

### 7-Year Retention
- Tax documents
- Financial records
- Legal documents
- Important contracts
- Insurance policies

### Forever
- Birth certificates
- Marriage certificates
- Property titles
- Wills and legal documents
- Permanent identification
- Historical family records

## Lifecycle Flow

```
Inbox (28) → Action (19) → Record (31) → Archive (12) → Delete (18)
     ↓          ↓              ↓                ↓            ↓
 [Review]  [Process]     [Categorize]    [Long-term]   [Expired]
```

**Lifecycle Tags:**
- Inbox: New/unprocessed documents
- Action: Requires processing or attention
- Record: Active, important documents
- Archive: Inactive but retainable
- Delete: Marked for removal
- Expired: Past retention date

## Example: Complete Retention Flow

```bash
# Step 1: Upload with R 1 year and Inbox
paperless_post_document \
  --file="/path/to/utility_bill.pdf" \
  --title="Utility Bill January 2025" \
  --document_type=4 \
  --tags=[<folder_tag>, <r_1_year_tag_id>, 28]

# Step 2: Move to Action for review
paperless_bulk_edit_documents \
  --documents=[123] \
  --method=modify_tags \
  --add_tags=[19] \
  --remove_tags=[28]  # Remove Inbox

# Step 3: After review, mark as Record
paperless_bulk_edit_documents \
  --documents=[123] \
  --method=modify_tags \
  --add_tags=[12] \
  --remove_tags=[19]  # Remove Action

# Step 4: After 1 year, review for deletion or archive
paperless_bulk_edit_documents \
  --documents=[123] \
  --method=modify_tags \
  --add_tags=[20] \
  --remove_tags=[12]  # Remove Record
```

## Automation Ideas

### Monthly Retention Review
```bash
# Find all documents with retention tags due this month
paperless_search_documents "tag:\"R 30 days\" OR tag:\"R 1 year\""

# Generate review report
# Notify for manual review
```

### Automatic Lifecycle Transitions
Set up Paperless rules:
- Auto-move from Inbox to Record after 7 days
- Auto-apply retention tags by document type
- Auto-expire documents based on created date
