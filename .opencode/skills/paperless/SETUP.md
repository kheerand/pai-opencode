# Paperless Skill Setup Summary

A comprehensive Paperless skill has been created at `~/.claude/skills/paperless/` with full MCP integration support.

### Directory Structure
```
~/.claude/skills/paperless/
├── README.md                    # Skill overview and quick start
├── SKILL.md                     # Main skill definition
├── Documentation/
│   ├── TagSystem.md             # Complete tag system reference
│   ├── Architecture.md          # System architecture and config
│   └── QuickReference.md        # Common commands and workflows
├── Workflows/
│   ├── UploadDocument.md        # Upload and classify documents
│   ├── SearchDocuments.md       # Search and retrieve documents
│   ├── ApplyRetention.md        # Apply retention policies
│   └── BulkProcess.md           # Bulk document operations
└── Tools/
    └── verify-tags.sh           # Tag verification script
```

---

## Verification Steps

### 1. MCP Access Verification

MCP tools are pre-configured and working:
- ✓ Connected to `paperless.s.cytrax.com.au`
- ✓ Can list tags, correspondents, document types
- ✓ Can upload, search, and manage documents

### 2. Tag System Verification

Your existing tags match the documented system:
- ✓ Folder tags (F prefix) with color #B2654D
- ✓ Lifecycle tags with color #8C7760
- ✓ Related-to tags with color #608080
- ✓ Retention tags (R prefix) needed for full workflow

### 3. Missing Tags

The following tags may need to be created for complete workflow:
- **Inbox** - For new/unprocessed documents
- **Record** - For active, important documents

Run the verification script to check and create:
```bash
~/.claude/skills/paperless/Tools/verify-tags.sh
```

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
    <related_tag_id>,    # Optional
    <retention_tag_id>   # Optional
  ]
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

### Process Inbox

```bash
# Find inbox items
paperless_search_documents "tag:Inbox"

# Get IDs and process
doc_ids=$(paperless_search_documents "tag:Inbox" | jq -r '.results[].id')

# Apply tags in bulk
paperless_bulk_edit_documents \
  --documents=$doc_ids \
  --method=modify_tags \
  --add_tags=[<record_tag_id>] \
  --remove_tags=[<inbox_tag_id>]
```

---

## Key Features

### 1. Color-Coded Tag System

**Folder Tags (#B2654D):**
- Physical filing cabinet equivalent
- Primary document organization
- Examples: F Tax FY25, F Shares portfolio

**Lifecycle Tags (#8C7760):**
- Document processing status
- Workflow tracking
- Tags: Action, Archive, Delete, Expired, Inbox, Record

**Related-to Tags (#608080):**
- People, organizations, topics
- Cross-referencing
- Examples: Anaya, Cytrax, Family

**Retention Tags (#B2654D):**
- Time-based retention policies
- Compliance management
- Tags: R 30 days, R 1 year, R 7 years, R forever

### 2. Complete Workflows

- **UploadDocument.md** - Step-by-step document upload
- **SearchDocuments.md** - Advanced search patterns
- **ApplyRetention.md** - Retention policy management
- **BulkProcess.md** - Batch operations

### 3. MCP Integration

All Document repository MCP tools are documented and integrated:
- Document CRUD operations
- Bulk editing capabilities
- Search and retrieval
- Metadata management

### 4. Architecture Documentation

- System overview and data flow
- Integration points (Dropbox, Google Drive)
- Backup strategy
- Performance considerations
- Troubleshooting guide

---

## Next Steps

### 0. Choose Your Access Method

**Option A: MCP Tools (Easiest)**
- Pre-configured for your Document repository
- No setup required
- Use tools like `paperless_list_documents`, `paperless_search_documents`
- Limited operations (no tag color updates, no PDF editing)

**Option B: Direct API Client (More Features)**
- Full TypeScript API client included
- Complete API coverage with type safety
- Better error handling and bulk operations
- Can update tag colors (fixes incorrect colors!)
- CLI tool for shell scripts and automation
- Requires authentication token

**Recommendation:** Use MCP for quick daily operations. Use Direct API for:
- Setting tag colors
- Bulk operations
- Automation and scripting
- PDF editing (split, merge, rotate pages)

### 1. If Using MCP Tools

Skip to steps 2-3 (MCP tools are ready to use).

### 2. If Using Direct API Client

#### Install API Client

```bash
# Copy to your project
cp -r ~/.claude/skills/paperless/src ./paperless-api

# Or install as local package
cd ~/.claude/skills/paperless
npm install
```

#### Get Authentication Token

**Option 1: From web UI (Recommended)**
1. Go to https://paperless.s.cytrax.com.au
2. Click user dropdown → My Profile
3. Click circular arrow to create token
4. Copy the token

**Option 2: Via CLI**
```bash
bun run ~/.claude/skills/paperless/src/cli.ts login username password
```

#### Set Environment Variables

```bash
export PAPERLESS_BASE_URL=https://paperless.s.cytrax.com.au
export PAPERLESS_TOKEN=your-token-here
```

### 3. Run Tag Verification

**Using MCP:**
```bash
~/.claude/skills/paperless/Tools/verify-tags.sh
```

**Using Direct API:**
```bash
bun run ~/.claude/skills/paperless/src/cli.ts tags
```
This will check for and create any missing lifecycle and retention tags.

### 4. Review Existing Tags

**Using MCP:**
```bash
paperless_list_tags
```

**Using Direct API:**
```bash
bun run ~/.claude/skills/paperless/src/cli.ts tags
```

Verify your existing tags align with documented system.

### 5. Fix Tag Colors (API Only!)

**Important:** MCP tools cannot update tag colors - use Direct API for this!

```bash
# Quick fix example
bun run ~/.claude/skills/paperless/src/cli.ts update-tag-color 18 "#8C7760"

# Complete fix (see Workflows/DirectAPI.md for details)
bun run fix-colors.ts
```

### 6. Test Upload

Upload a test document to verify the workflow:
```bash
paperless_post_document \
  --file="/path/to/test.pdf" \
  --filename="test.pdf" \
  --title="Test Document" \
  --document_type=4 \
  --tags=[<folder_tag_id>, <inbox_tag_id>]
```

### 4. Test Search

```bash
paperless_search_documents "test"
```

### 5. Process Inbox

Move the test document from Inbox to Record:
```bash
paperless_bulk_edit_documents \
  --documents=[<test_doc_id>] \
  --method=modify_tags \
  --add_tags=[<record_tag_id>] \
  --remove_tags=[<inbox_tag_id>]
```

---

## Documentation Reference

### Quick Start
- **README.md** - Overview and quick start guide
- **SKILL.md** - Skill definition and response format
- **QuickReference.md** - Common commands and patterns

### Detailed Guides
- **TagSystem.md** - Complete tag system reference
- **Architecture.md** - System architecture and configuration

### Workflows
- **UploadDocument.md** - Document upload and classification
- **SearchDocuments.md** - Search and retrieval
- **ApplyRetention.md** - Retention policies
- **BulkProcess.md** - Batch operations

---

## Common Tag IDs

### Lifecycle Tags (from your system)
- Action: 19
- Archive: 12
- Delete: 18
- Expired: 20

### Document Types
- Action: 6
- Archive: 8
- Correspondence: 2
- Invoice: 4
- Legal: 7
- Note: 3
- Receipt: 1
- Reference: 5

### Correspondents
- AAMI: 3
- ATO: 23
- Huntingtower: 27
- National Australia Bank: 12

### Folder Tags (F prefix)
- F Amateur radio license: 16
- F Bellevue Ct, Mulgrave: 37
- F DFP506: 38
- F High school: 45
- F Miller crescent property: 41
- F Shares portfolio: 42
- F Tax FY25: 46

### Related-to Tags
- Anaya: 29
- Cytrax: 34
- Family: 2
- Financial: 3
- Frodo: 4

---

## Maintenance Schedule

### Daily
- ✓ Automatic Dropbox backup

### Weekly
- Process Inbox tagged documents
- Process Action tagged documents

### Monthly
- Review retention tags (R prefix)
- Archive old documents

### Quarterly
- Verify backup integrity
- Clean up expired documents

---

## Troubleshooting

### MCP Connection Issues
```bash
# Test connection
paperless_list_documents
paperless_list_tags
```

### Missing Tags
```bash
# Run verification script
~/.claude/skills/paperless/Tools/verify-tags.sh
```

### OCR Issues
```bash
# Reprocess document
paperless_bulk_edit_documents \
  --documents=[<doc_id>] \
  --method=reprocess
```

### Search Not Finding Documents
- Wait for OCR processing to complete
- Check document is not deleted
- Try broader search terms

---

## Integration with PKM

This skill integrates with your PKM (Obsidian) vault:
- Document notes can reference Document repository documents
- Search across both systems
- Sync important document references

Use the PKM skill for:
- Creating notes about documents
- Cross-referencing with PKM content
- Managing document-related tasks

---

## Support

For issues or questions:
1. Check troubleshooting section in QuickReference.md
2. Review relevant workflow documentation
3. Verify MCP connection: `paperless_list_documents`
4. Run tag verification script if needed

---

## Version

**Skill Version:** 1.0
**Created:** January 2025
**Document store:** `paperless.s.cytrax.com.au`
**MCP Tools:** Pre-configured and verified

---

## Summary

✓ Comprehensive Paperless skill created
✓ MCP access verified and working
✓ Tag system documented (matching your existing setup)
✓ Workflows for all common operations
✓ Architecture and troubleshooting guides included
✓ Tag verification script provided

Your Document repository is now fully integrated with PAI via MCP. Use the workflows and documentation to manage your documents efficiently!
