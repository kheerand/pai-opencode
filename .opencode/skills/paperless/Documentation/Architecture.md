# Document Repository Architecture

System architecture, integration points, and configuration reference for the personal document management system.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Document Sources                         │
│  ├─ Scanned documents (physical scanner)                     │
│  ├─ Email attachments (consumption folders)                  │
│  ├─ Mobile uploads (app uploads)                             │
│  └─ Direct uploads (web UI or API)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
 ┌─────────────────────────────────────────────────────────────┐
│                 Document Store Server                         │
│  URL: paperless.s.cytrax.com.au                               │
│                                                               │
│  ├─ OCR Processing (Tesseract)                               │
│  ├─ Document Parsing (document-date, amount, etc.)           │
│  ├─ Auto-tagging (matching algorithms)                       │
│  ├─ Classification (types, correspondents, tags)            │
│  └─ Search & Retrieval (full-text search)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│   Dropbox    │ │ Storage  │ │   MCP API    │
│   Backup     │ │   Path   │ │  Integration  │
│              │ │          │ │              │
│  └─ Daily    │ │ └─ Final │ │  └─ Claude   │
│    backup    │ │   dest   │ │     Code     │
└──────────────┘ └──────────┘ └──────────────┘
```

## Architecture Components

### 1. Document Store Server

**Location:** `paperless.s.cytrax.com.au`

**Primary Functions:**
- Document ingestion (PDF, images, Office docs)
- OCR text extraction (Tesseract engine)
- Document parsing (date, amount, sender extraction)
- Auto-tagging based on matching algorithms
- Full-text search indexing
- Web UI for manual operations

**Matching Algorithms:**
1. Any - Match any of the words
2. All - Match all words
3. Exact - Match exact phrase
4. Regular expression - Advanced pattern matching
5. Fuzzy - Approximate matching (typos, variations)
6. Auto - Automatic detection (default)

### 2. Storage Integration

**Primary Storage:** Document store internal storage
**Final Destination:** File paths for records
**Google Drive:** `Google work/admin/records`

**Path Mapping:**
```
Paperless server storage
  → Dropbox backup (daily sync)
  → Final destination records path
  → Google Drive work/admin/records (integration)
```

### 3. Backup Strategy

**Primary Backup:** Dropbox
- Daily automated backup
- Full document repository sync
- Includes metadata and OCR data
- Disaster recovery point

**Secondary Storage:** Google Drive
- Manual or selective sync
- Records folder for important documents
- Integration with Google Workspace

### 4. MCP Integration

**MCP Server:** Document repository MCP Tools

**Available Operations:**
- Document CRUD (Create, Read, Update, Delete)
- Metadata management (tags, correspondents, types)
- Bulk operations (batch processing)
- Search and retrieval
- File downloads

**Tool Reference:**
- `paperless_post_document` - Upload new documents
- `paperless_list_documents` - List documents with pagination
- `paperless_get_document` - Get document details
- `paperless_search_documents` - Full-text search
- `paperless_download_document` - Download documents
- `paperless_bulk_edit_documents` - Bulk operations

---

## Data Flow

### Document Ingestion

```
Source → Upload → OCR → Parse → Auto-tag → Store → Index
```

**Stages:**
1. **Source:** Scanner, email, mobile, manual upload
2. **Upload:** File ingestion into Paperless consumption folders
3. **OCR:** Tesseract extracts text from images/scans
4. **Parse:** Extract dates, amounts, senders from content
5. **Auto-tag:** Apply tags based on matching rules
6. **Store:** Save document and metadata to database
7. **Index:** Add to full-text search index

### Document Processing

```
Inbox → Review → Classify → Tag → Retention Policy → Archive/Delete
```

**Stages:**
1. **Inbox:** New documents land here (lifecycle: Inbox)
2. **Review:** Manual review of auto-classification
3. **Classify:** Assign document type, correspondent
4. **Tag:** Add folder tags, related-to tags, retention tags
5. **Retention Policy:** Apply R prefix tags for time-based rules
6. **Archive/Delete:** Move to Archive (12) or Delete (18)

---

## Configuration Reference

### Auto-tagging Rules

**Correspondent Matching:**
```
Tag: "AAMI"
Match: "AAMI"
Algorithm: 1 (Any)
Case: Insensitive
Result: Auto-assign correspondent "AAMI"
```

**Tag Matching:**
```
Tag: "Anaya"
Match: "Anaya"
Algorithm: 1 (Any)
Case: Insensitive
Result: Auto-add "Anaya" related-to tag
```

**Document Type Detection:**
```
Type: "Invoice"
Match: "invoice, bill, statement"
Algorithm: 1 (Any)
Case: Insensitive
Result: Auto-assign document type "Invoice"
```

### Consumption Folders

Configure Paperless to monitor folders for automatic ingestion:

```
/home/user/Paperless/consume/
├─ inbox/         # General documents
├─ receipts/      # Receipts folder
├─ bills/         # Bills folder
└─ tax/           # Tax documents folder
```

---

## Security & Access

### MCP Access
- **Server:** Pre-configured with API credentials
- **Permissions:** Full document access (read/write)
- **Rate Limiting:** Managed by MCP server

### User Access
- **Web UI:** `paperless.s.cytrax.com.au`
- **Authentication:** Configured with user accounts
- **Permissions:** Role-based access control

### Backup Security
- **Dropbox:** Encrypted sync
- **Google Drive:** Workspace security
- **Local Storage:** Server filesystem permissions

---

## Performance Considerations

### OCR Processing
- **Speed:** ~1-3 seconds per page
- **Quality:** Tesseract with language packs
- **Language:** English primarily

### Search Performance
- **Full-text:** Indexed search (fast)
- **Filters:** Tag-based filtering (very fast)
- **Complex queries:** May take longer

### Storage
- **PDFs:** Average 100KB - 5MB per document
- **Database:** SQLite or PostgreSQL (metadata)
- **OCR Data:** Stored alongside documents

---

## Scalability

### Current Capacity
- **Documents:** 200+ (growing)
- **Storage:** Cloud-based (expandable)
- **Search:** Optimized for thousands of documents

### Future Scaling
- **Database:** Can migrate to PostgreSQL for larger scale
- **Storage:** Add additional backup targets
- **Processing:** Can add dedicated OCR servers

---

## Integration Points

### With Google Workspace
- **Drive:** `work/admin/records` folder
- **Gmail:** Consumption via email attachments
- **Calendar:** Future integration possible

### With Mobile
- **Document App:** iOS/Android for scanning
- **Camera Uploads:** Direct to consumption folders

### With Claude Code (PAI)
- **MCP Tools:** Direct API access
- **Workflows:** Automated processing workflows
- **PKM Integration:** Obsidian vault synchronization

---

## Monitoring & Maintenance

### Daily Tasks
- **Backup:** Automated Dropbox sync
- **Consumption:** Process new documents from consumption folders

### Weekly Tasks
- **Inbox Review:** Process Inbox (28) tagged documents
- **Action Review:** Process Action (19) tagged documents

### Monthly Tasks
- **Retention Review:** Review R prefix tags for expiration
- **Archive Review:** Move old records to Archive (12)

### Quarterly Tasks
- **Backup Verification:** Confirm Dropbox backup integrity
- **Storage Cleanup:** Remove truly expired documents

---

## Troubleshooting

### OCR Not Working
- Check Tesseract service status
- Verify document is readable (not corrupted)
- Try reprocessing: `paperless_bulk_edit_documents --method=reprocess`

### Auto-tagging Not Applied
- Verify matching algorithms are correct
- Check if tags/correspondents exist
- Review matching patterns (case sensitivity)

### Search Not Finding Documents
- Wait for OCR processing to complete
- Check document is not deleted
- Try broader search terms

### MCP Connection Issues
- Verify Paperless server is accessible
- Check API credentials in MCP config
- Test connectivity: `paperless_list_documents`
