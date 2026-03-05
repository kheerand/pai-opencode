# Paperless Skill

Personal document management system skill for the Document repository via MCP integration.

## Overview

This skill provides comprehensive workflows and documentation for managing documents in your Document store at `paperless.s.cytrax.com.au`. It includes:

- **Tag system** with color-coded categories
- **Document workflows** for upload, search, and processing
- **Bulk operations** for efficient document management
- **Retention policies** for compliant document lifecycle
- **MCP integration** for direct API access

---

## What's Included

### Documentation
- **SKILL.md** - Main skill definition and quick reference
- **Documentation/TagSystem.md** - Complete tag system reference
- **Documentation/Architecture.md** - System architecture and configuration
- **Documentation/QuickReference.md** - Common commands and workflows

### Workflows
- **UploadDocument.md** - Upload and classify documents
- **SearchDocuments.md** - Search and retrieve documents
- **ApplyRetention.md** - Apply retention policies
- **BulkProcess.md** - Bulk document operations

---

## Tag System

The skill implements a 4-category tagging system:

### 1. Folder Tags (F prefix)
**Color:** `#B2654D` (Terracotta)

Physical filing cabinet equivalent for primary organization.

**Examples:**
- F Amateur radio license
- F Bellevue Ct, Mulgrave
- F Tax FY25
- F Shares portfolio

### 2. Retention Tags (R prefix)
**Color:** `#B2654D` (Terracotta)

Time-based retention policies.

**Tags:**
- R 30 days
- R 1 year
- R 7 years
- R forever

### 3. Lifecycle Tags
**Color:** `#8C7760` (Warm taupe)

Document processing status.

**Tags:**
- Action
- Archive
- Delete
- Expired
- Inbox
- Record

### 4. Related-to Tags
**Color:** `#608080` (Dusty blue-teal)

People, organizations, and topics.

**Examples:**
- Anaya
- Cytrax
- Family
- Financial
- Frodo

---

## Quick Start

### Upload a Document

```bash
paperless_post_document \
  --file="/path/to/document.pdf" \
  --filename="document.pdf" \
  --title="Clear Descriptive Title" \
  --document_type=4 \
  --tags=[
    <folder_tag_id>,     # F prefix - REQUIRED
    <inbox_tag_id>,      # Initial lifecycle
    <related_tag_id>,    # Optional: people/orgs
    <retention_tag_id>   # Optional: time-sensitive
  ]
```

### Search Documents

```bash
# Full-text search
paperless_search_documents "AAMI insurance"

# By tag
paperless_search_documents "tag:Action"

# By document type
paperless_search_documents "type:Invoice"
```

### Process Inbox

```bash
# Find inbox items
paperless_search_documents "tag:Inbox"

# Get IDs
doc_ids=$(paperless_search_documents "tag:Inbox" | jq -r '.results[].id')

# Apply tags in bulk
paperless_bulk_edit_documents \
  --documents=$doc_ids \
  --method=modify_tags \
  --add_tags=[<record_tag_id>] \
  --remove_tags=[<inbox_tag_id>]
```

---

## Common Workflows

1. **Upload & Classify** - Upload documents with appropriate tags
2. **Search & Retrieve** - Find documents by content, tags, or metadata
3. **Apply Retention** - Set and review time-based retention policies
4. **Bulk Process** - Batch operations for efficient management

See `Workflows/` directory for detailed guides.

---

## Architecture

```
Document Sources
    ↓
Document store server (paperless.s.cytrax.com.au)
    ├─ OCR Processing
    ├─ Auto-tagging
    └─ Search Index
    ↓
    ├─ Dropbox Backup
    ├─ Storage Paths
    └─ MCP Integration (Claude Code)
```

---

## MCP Tools

The skill uses these MCP tools:

### Document Operations
- `paperless_post_document` - Upload documents
- `paperless_list_documents` - List documents
- `paperless_get_document` - Get document details
- `paperless_search_documents` - Search documents
- `paperless_download_document` - Download documents

### Bulk Operations
- `paperless_bulk_edit_documents` - Batch operations (tags, types, delete, etc.)

### Metadata Management
- `paperless_list_tags` - List tags
- `paperless_create_tag` - Create tags
- `paperless_list_correspondents` - List correspondents
- `paperless_create_correspondent` - Create correspondents
- `paperless_list_document_types` - List document types
- `paperless_create_document_type` - Create document types

---

## Usage

### When to Use This Skill

- Upload and classify new documents
- Search and retrieve existing documents
- Apply retention policies
- Process inbox documents
- Bulk document operations
- Review expiring documents
- Archive or delete old documents

### Response Format

```
📋 SUMMARY: [One sentence]
📊 DOCUMENTS: [Number processed]
🏷️ TAGS: [Tags applied]
⚡ ACTIONS: [Steps taken]
✅ RESULTS: [Outcomes]
```

---

## Configuration

### Server
- **URL:** `paperless.s.cytrax.com.au`
- **MCP:** Pre-configured with API access

### Backup
- **Primary:** Dropbox (daily sync)
- **Secondary:** Google Drive (`work/admin/records`)

### Storage
- **Internal:** Document store database
- **Final:** File paths for records

---

## Maintenance

### Daily
- Automatic Dropbox backup

### Weekly
- Process Inbox (28) tagged documents
- Process Action (19) tagged documents

### Monthly
- Review retention tags (R prefix)
- Archive old documents

### Quarterly
- Verify backup integrity
- Clean up expired documents

---

## Best Practices

1. **Always add folder tags** (F prefix) to new documents
2. **Use descriptive titles** with dates
3. **Set retention policies** on upload
4. **Process inbox weekly** to prevent backlog
5. **Review action items** regularly
6. **Test bulk operations** on small batches first
7. **Use related-to tags** for cross-referencing

---

## Troubleshooting

### OCR Issues
- Reprocess: `paperless_bulk_edit_documents --method=reprocess`
- Check document quality
- Verify Tesseract service

### Auto-tagging Not Working
- Verify matching algorithms
- Check tags/correspondents exist
- Review matching patterns

### Search Issues
- Wait for OCR processing
- Check document not deleted
- Try broader terms

### MCP Connection Issues
- Verify server accessibility
- Check API credentials
- Test with `paperless_list_documents`

---

## Documentation

- **SKILL.md** - Skill definition and overview
- **Documentation/TagSystem.md** - Complete tag system reference
- **Documentation/Architecture.md** - System architecture and configuration
- **Documentation/QuickReference.md** - Common commands and workflows

## Workflows

- **UploadDocument.md** - Upload and classify documents
- **SearchDocuments.md** - Search and retrieve documents
- **ApplyRetention.md** - Apply retention policies
- **BulkProcess.md** - Bulk document operations

---

## Version

**Version:** 1.0
**Last Updated:** January 2025
**Document store:** `paperless.s.cytrax.com.au`

---

## Support

For issues or questions about this skill:
1. Check troubleshooting section
2. Review workflow documentation
3. Verify MCP connection to Document repository
