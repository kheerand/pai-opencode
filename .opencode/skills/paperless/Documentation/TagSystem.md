# Tag System Documentation

Complete reference for the Document repository tagging system, color schemes, and usage guidelines.

## Tag Categories

### 1. Folder Tags (Prefix: `F`)

**Color:** `#B2654D` (Terracotta)

**Purpose:** Primary organization method - equivalent to physical filing cabinet folders.

**Usage:**
- Every document should have at least one folder tag
- Represents the "where would this live in a physical filing cabinet?" decision
- Multiple folder tags allowed for cross-referencing

**Examples:**
- F Amateur radio license
- F Bellevue Ct, Mulgrave
- F Bellevue ct redevelopment
- F Breast cancer 2025
- F DFP506
- F High school
- F Jini inheritance
- F Miller crescent property
- F Shares portfolio
- F Sri Lanka tax
- F Tax FY25

**Color Palette:**
```
Main:   #B2654D
Light:  #D9947D, #D08A74, #C7806B, #BE7662, #B56C59
Medium: #AC6250, #A35847, #9A4E3E, #914435
Dark:   #8C3621
```

---

### 2. Retention/Process Tags (Prefix: `R`)

**Color:** `#B2654D` (Terracotta - same as folder tags)

**Purpose:** Define how long documents should be retained and processing actions.

**Usage:**
- Apply to documents with time-sensitive retention requirements
- Helps with periodic cleanup and compliance
- Use with lifecycle tags for full management

**Tags:**
- R 30 days - Short-term retention
- R 1 year - Annual retention
- R 7 years - Legal/tax retention
- R forever - Permanent records

**When to use:**
- **R 30 days:** Temporary notices, confirmations, draft documents
- **R 1 year:** Annual statements, regular bills, routine correspondence
- **R 7 years:** Tax documents, financial records, legal documents, contracts
- **R forever:** Certificates, titles, wills, identification, historical records

---

### 3. Lifecycle Tags

**Color:** `#8C7760` (Warm taupe)

**Purpose:** Track document processing status and workflow.

**Usage:**
- Documents typically move through lifecycle stages
- Only one active lifecycle tag at a time
- Helps track processing queue and completed work

**Tags:**
- Action - Requires processing or attention
- Archive - Inactive but retained
- Delete - Marked for deletion
- Expired - Past retention date
- Inbox - New/unprocessed documents
- Record - Active, important documents

**Lifecycle Flow:**
```
Inbox → Action → Record → Archive → Delete
  ↓        ↓         ↓         ↓        ↓
 [New]   [Process] [Categorize] [Store] [Remove]
```

**Color Palette:**
```
Main:   #8C7760
Light:  #B5A591, #AC9B88, #A3917F, #9A8776, #917D6D
Medium: #887364, #7F695B, #765F52, #6D5549
Dark:   #634F3A
```

---

### 4. Related-to Tags

**Color:** `#608080` (Dusty blue-teal)

**Purpose:** Cross-reference documents to people, organizations, and topics.

**Usage:**
- Connect documents across different folders
- Enable quick search by person or organization
- Support family and business relationship tracking

**Examples:**
- People: Anaya, Ammi and Thaththi, Chandima, Ethan, Frodo, Kheeran
- Organizations: Cytrax, Family, Financial
- Topics: Aviation, Certificate, Education

**When to add:**
- Family members mentioned in document
- Companies or organizations involved
- Relevant topics or projects
- Cross-references needed for future searches

**Color Palette:**
```
Main:   #608080
Light:  #8AB2B2, #80A8A8, #769E9E, #6C9494, #628A8A
Medium: #588080, #4E7676, #446C6C, #3A6262
Dark:   #3B5454
```

---

## Tagging Workflow

### New Document Upload

```bash
# Recommended minimum tags:
# 1. Folder tag (F prefix) - REQUIRED
# 2. Document type (Invoice, Receipt, etc.)
# 3. Lifecycle tag (Inbox initially)
# 4. Related-to tags (if applicable)
# 5. Retention tag (if time-sensitive)

paperless_post_document \
  --file="document.pdf" \
  --title="Clear Descriptive Title" \
  --document_type=4 \
  --tags=[
    <folder_tag_id>,      # F prefix - REQUIRED
    <inbox_tag_id>,       # Initial lifecycle
    <related_tag_id>,     # Optional: people/orgs
    <retention_tag_id>    # Optional: time-sensitive
  ]
```

### Processing from Inbox

```bash
# 1. Remove Inbox tag
# 2. Add Action or Record tag
# 3. Confirm folder tag is correct
# 4. Add any missing related-to tags
# 5. Set retention policy if needed

paperless_bulk_edit_documents \
  --documents=[123] \
  --method=modify_tags \
  --add_tags=[<record_tag_id>, <related_tag_id>, <retention_tag_id>] \
  --remove_tags=[<inbox_tag_id>]
```

### Monthly Review

```bash
# 1. Find all Action tags - process these first
# 2. Find all Inbox tags - categorize these
# 3. Find retention tags - review for expiration
# 4. Find Expired tags - delete or archive
```

---

## Color Code Reference

### Folder Tags - Terracotta (#B2654D)
Use for primary document categorization

### Lifecycle Tags - Warm Taupe (#8C7760)
Use for document status tracking

### Related-to Tags - Dusty Blue-Teal (#608080)
Use for people, organizations, topics

---

## Tag Naming Conventions

### Folder Tags
- Prefix: `F ` (F followed by space)
- Format: `F [Category]` or `F [Category] [Subcategory]`
- Examples: `F Amateur radio license`, `F Tax FY25`

### Retention Tags
- Prefix: `R ` (R followed by space)
- Format: `R [Time period]`
- Examples: `R 30 days`, `R 1 year`, `R 7 years`

### Lifecycle Tags
- No prefix
- Single words: `Action`, `Archive`, `Delete`, `Expired`, `Inbox`, `Record`

### Related-to Tags
- No prefix
- Names, organizations, topics
- Examples: `Anaya`, `Cytrax`, `Aviation`, `Family`

---

## Advanced Tagging Strategies

### Hierarchical Folder Tags
Consider using parent-child relationships in the Document repository:
```
F Financial
  ├─ F Tax FY25
  └─ F Shares portfolio
```

### Cross-Reference Tags
Use multiple folder tags for documents that belong in multiple categories:
```
F Bellevue Ct, Mulgrave
F Breast cancer 2025
```

### Project-Based Tags
Combine folder tags with related-to tags for project tracking:
```
Folder: F DFP506
Related: Cytrax, Certificate
Lifecycle: Action
Retention: R 1 year
```
