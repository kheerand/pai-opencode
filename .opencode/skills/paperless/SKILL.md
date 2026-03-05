---
name: Paperless
description: Complete Paperless-NGX document management via MCP. Upload, organize, search, tag documents. Use for any document operations including full-text search, bulk editing, custom fields, workflows, user management.
---

# Paperless-NGX Document Management

**Complete document management system** for scanning, organizing, and storing documents with intelligent tagging, OCR, and full API access.

---

## Quick Start

**When to use this skill:**
- Upload and classify documents
- Search and retrieve documents with full-text search
- Organize with tags, correspondents, and document types
- Apply retention policies and lifecycle management
- Manage custom fields, workflows, and user permissions

**MCP Server:** Pre-configured for `paperless.s.cytrax.com.au`

---

## Tag System Overview

### Folder Tags (Prefix: `F`)
**Color:** `#B2654D` (Terracotta)

**IMPORTANT:** These are **Folder tags** - they function exactly like physical folders or file system folders. They represent the primary organizational structure for your documents, similar to how you would organize paper files in a filing cabinet or digital files in directories.

**Usage Guidelines:**
- Think of each "F" tag as a folder where related documents belong
- Documents can belong to multiple "folders" (multiple F tags)
- Use these as the primary way to categorize and group related documents
- Examples: "F Tax FY25" = All documents for the 2025 tax year folder

**Examples:**
- F Amateur radio license
- F Bellevue Ct, Mulgrave
- F Breast cancer 2025
- F DFP506
- F High school
- F Miller crescent property
- F Shares portfolio
- F Sri Lanka tax
- F Tax FY25

**Purpose:** Categorize documents as they would be stored in physical folders or file system directories.

---

### Process/Retention Tags (Prefix: `R`)
**Color:** `#B2654D` (Terracotta)

Document retention and processing actions.

**Tags:**
- R 30 days - Retain for 30 days
- R 1 year - Retain for 1 year
- R 7 years - Retain for 7 years
- R forever - Keep permanently

**Purpose:** Mark documents for review, deletion, or archival based on time.

---

### Lifecycle Tags
**Color:** `#8C7760` (Warm taupe)

Document lifecycle status.

**Tags:**
- Action - Requires action
- Archive - Ready for archiving
- Delete - Marked for deletion
- Expired - Past retention date
- Inbox - New/unprocessed
- Record - Permanent record

**Purpose:** Track document processing status and workflow.

---

### Related-to Tags
**Color:** `#608080` (Dusty blue-teal)

People, organizations, and entities related to documents.

**Examples:**
- Anaya
- Ammi and Thaththi
- Cytrax
- Ethan
- Family
- Financial
- Frodo
- Aviation
- Certificate

**Purpose:** Cross-reference documents to people, companies, or topics.

---

## Document Types

Pre-configured types in the system:
- Action
- Archive
- Correspondence
- Invoice
- Legal
- Note
- Receipt
- Reference

---

## Tool Naming Convention

All tools follow the `paperless_{resource}_{operation}` pattern:
- `paperless_list_*` - GET requests to list resources
- `paperless_get_*` - GET requests to retrieve a specific resource
- `paperless_create_*` - POST requests to create resources
- `paperless_update_*` - PUT requests to update resources
- `paperless_delete_*` - DELETE requests to remove resources
- `paperless_post_*` - Special POST operations like upload
- `paperless_bulk_*` - Bulk operations on multiple items

---

## Documents API

Tools for managing documents - the core of Paperless-NGX.

### paperless_list_documents

List all documents with optional filtering, pagination, and sorting.

**When to use:** Retrieve a list of documents for display, processing, or analysis. Use filters to narrow down results by date, tags, correspondent, etc.

**Parameters:**
```typescript
{
  page?: number,           // Page number (default: 1)
  page_size?: number,      // Items per page (default: 50, max: 1000)
  query?: string,          // Full-text search query
  tags?: number[],         // Filter by tag IDs
  document_type?: number,  // Filter by document type ID
  correspondent?: number,  // Filter by correspondent ID
  storage_path?: number,   // Filter by storage path ID
  created_date_after?: string,   // ISO date filter (created after)
  created_date_before?: string,  // ISO date filter (created before)
  added_date_after?: string,     // ISO date filter (added after)
  added_date_before?: string,    // ISO date filter (added before)
  sort?: string,           // Sort field (e.g., "created", "name", "added")
  ordering?: "asc" | "desc" // Sort order (default: "asc")
}
```

**Response:** Array of document objects with id, title, document_type, correspondent, tags, created, added, modified, checksum, mime_type, download_url, and more.

**Example:**
```javascript
const docs = await paperless_list_documents({
  page: 1,
  page_size: 25,
  query: "invoice",
  sort: "created",
  ordering: "desc"
});
```

---

### paperless_get_document

Retrieve a single document by ID with all its details.

**When to use:** Get complete information about a specific document including its metadata, content, and relationships.

**Parameters:**
```typescript
{
  id: number  // The document ID (required)
}
```

**Response:** Complete document object including custom fields, permissions, and original metadata.

**Example:**
```javascript
const doc = await paperless_get_document({ id: 123 });
console.log(doc.title, doc.correspondent, doc.tags);
```

---

### paperless_post_document

Upload and create a new document in Paperless-NGX.

**When to use:** Add new documents to the system, optionally with metadata and automatic processing.

**Parameters:**
```typescript
{
  file: string,              // Absolute path to file (required)
  filename: string,          // Filename to use (required)
  title?: string,            // Document title (defaults to filename)
  document_type?: number,    // Document type ID
  correspondent?: number,    // Correspondent ID
  storage_path?: number,     // Storage path ID
  tags?: number[],           // Tag IDs to apply
  created?: string,          // Created date (ISO format)
  archive_serial_number?: string,  // ASN for the document
}
```

**Response:** Created document object with ID and processing status.

**Example:**
```javascript
const doc = await paperless_post_document({
  file: "/home/user/documents/receipt.pdf",
  filename: "receipt-2024.pdf",
  title: "Office Supplies Receipt",
  tags: [1, 5],
  document_type: 2
});
```

---

### paperless_update_document

Update an existing document's metadata.

**When to use:** Modify document properties like title, correspondent, document type, tags, dates, etc.

**Parameters:**
```typescript
{
  id: number,                // Document ID (required)
  title?: string,            // New title
  document_type?: number | null,  // Set document type (null to remove)
  correspondent?: number | null,  // Set correspondent (null to remove)
  storage_path?: number | null,   // Set storage path
  tags?: number[],           // Replace all tags with these IDs
  created?: string,          // Created date
  archive_serial_number?: string | null,  // Set ASN
}
```

**Response:** Updated document object.

**Example:**
```javascript
const updated = await paperless_update_document({
  id: 123,
  title: "Updated Invoice Title",
  document_type: 2,
  tags: [1, 2, 3]
});
```

---

### paperless_delete_document

Delete a document from Paperless-NGX.

**When to use:** Remove unwanted or duplicate documents. Note: this deletes the document from storage.

**Parameters:**
```typescript
{
  id: number  // Document ID to delete (required)
}
```

**Response:** Success message.

**Example:**
```javascript
await paperless_delete_document({ id: 123 });
```

---

### paperless_bulk_edit_documents

Perform bulk operations on multiple documents simultaneously.

**When to use:** Efficiently apply changes to many documents at once - tagging, moving, modifying, or deleting.

**Parameters:**
```typescript
{
  documents: number[],   // Array of document IDs (required)
  method: "set_correspondent" | "set_document_type" | "set_storage_path" |
          "add_tag" | "remove_tag" | "modify_tags" | "delete" |
          "reprocess" | "set_permissions" | "merge" | "split" |
          "rotate" | "delete_pages" | "modify_custom_fields",  // Operation type (required)
  tag?: number,           // Tag ID for add_tag/remove_tag
  tags?: number[],        // Tags for modify_tags
  correspondent?: number | null,  // Correspondent to set
  document_type?: number | null,  // Document type to set
  storage_path?: number | null,   // Storage path to set
  permissions?: {         // Permissions for set_permissions
    view: { users: number[], groups: number[] },
    change: { users: number[], groups: number[] }
  },
  delete_originals?: boolean,     // For merge operation
  pages?: string,          // Page specification for split/delete_pages
  degrees?: number,        // Rotation degrees
  metadata_document_id?: number,  // For merge operations
  add_custom_fields?: Record<number, any>,  // For modify_custom_fields
  remove_custom_fields?: number[],           // For modify_custom_fields
}
```

**Response:** Bulk edit result with success count and any errors.

**Example - Tag multiple invoices:**
```javascript
const result = await paperless_bulk_edit_documents({
  documents: [123, 124, 125, 126],
  method: "add_tag",
  tag: 7  // invoice tag ID
});
console.log(`Tagged ${result.processed} documents`);
```

**Example - Delete old documents:**
```javascript
const oldDocs = await paperless_list_documents({
  created_date_before: "2020-01-01",
  page_size: 100
});

await paperless_bulk_edit_documents({
  documents: oldDocs.map(d => d.id),
  method: "delete"
});
```

---

### paperless_download_document

Download the original document file.

**When to use:** Retrieve the original uploaded file for backup, processing, or sharing.

**Parameters:**
```typescript
{
  id: number,         // Document ID (required)
  original?: boolean  // Download original vs archive version (default: false)
}
```

**Response:** File content as binary data.

**Example:**
```javascript
const pdf = await paperless_download_document({ id: 123 });
// Save to disk or process in memory
```

---

### paperless_search_documents

Full-text search across all documents.

**When to use:** Find documents containing specific text content or matching complex criteria.

**Parameters:**
```typescript
{
  query: string  // Search query (required)
}
```

**Response:** Array of matching document objects ranked by relevance with `__search_hit__` containing score, highlights, and rank.

**Example:**
```javascript
const results = await paperless_search_documents({
  query: "tax return 2023"
});
results.forEach(doc => {
  console.log(`${doc.title} (score: ${doc.__search_hit__.score})`);
  console.log(`Highlights: ${doc.__search_hit__.highlights}`);
});
```

---

## Tags API

Tools for managing tags that organize and categorize documents.

### paperless_list_tags

List all tags in the system.

**When to use:** Display available tags, populate dropdowns, or find tag IDs for filtering.

**Parameters:** None

**Response:** Array of tag objects with id, name, color, matching_algorithm, match, text_color, and usage_count.

**Example:**
```javascript
const tags = await paperless_list_tags();
tags.forEach(tag => {
  console.log(`${tag.name} (${tag.color}) - ${tag.usage_count} docs`);
});
```

---

### paperless_create_tag

Create a new tag for organizing documents.

**When to use:** Add new categories or organizational labels to your document management system.

**Parameters:**
```typescript
{
  name: string,              // Tag name (required)
  color?: string,            // Hex color (default: #607D8B)
  matching_algorithm?: "any" | "all" | "exact" | "regular expression" | "fuzzy",
  match?: string,            // Pattern for automatic matching
}
```

**Response:** Created tag object.

**Example:**
```javascript
const tag = await paperless_create_tag({
  name: "Urgent",
  color: "#FF5722"
});
```

---

### paperless_get_tag

Retrieve a specific tag by ID.

**When to use:** Get details about a tag including its matching rules and usage statistics.

**Parameters:**
```typescript
{
  id: number  // Tag ID (required)
}
```

**Response:** Complete tag object.

**Example:**
```javascript
const tag = await paperless_get_tag({ id: 5 });
```

---

### paperless_update_tag

Update an existing tag's properties.

**When to use:** Modify tag name, color, or matching rules.

**Parameters:**
```typescript
{
  id: number,                // Tag ID (required)
  name?: string,             // New name
  color?: string,            // New hex color
  matching_algorithm?: "any" | "all" | "exact" | "regular expression" | "fuzzy",
  match?: string,            // New matching pattern
}
```

**Response:** Updated tag object.

**Example:**
```javascript
await paperless_update_tag({
  id: 5,
  color: "#FF9800",
  name: "High Priority"
});
```

---

### paperless_delete_tag

Delete a tag from the system.

**When to use:** Remove obsolete or unused tags. Documents with this tag will lose the tag association.

**Parameters:**
```typescript
{
  id: number  // Tag ID to delete (required)
}
```

**Response:** Success message.

**Example:**
```javascript
await paperless_delete_tag({ id: 10 });
```

---

## Correspondents API

Tools for managing correspondents (senders/recipients of documents).

### paperless_list_correspondents

List all correspondents in the system.

**When to use:** Display available correspondents or find correspondent IDs for filtering documents.

**Parameters:** None

**Response:** Array of correspondent objects with id, name, match, matching_algorithm, and document_count.

**Example:**
```javascript
const correspondents = await paperless_list_correspondents();
correspondents.forEach(c => {
  console.log(`${c.name} - ${c.document_count} documents`);
});
```

---

### paperless_create_correspondent

Create a new correspondent entity.

**When to use:** Add new senders or recipients to organize documents by source.

**Parameters:**
```typescript
{
  name: string,              // Correspondent name (required)
  matching_algorithm?: "any" | "all" | "exact" | "regular expression" | "fuzzy",
  match?: string,            // Pattern for automatic assignment
}
```

**Response:** Created correspondent object.

**Example:**
```javascript
const correspondent = await paperless_create_correspondent({
  name: "Amazon.com",
  matching_algorithm: "fuzzy",
  match: "amazon"
});
```

---

### paperless_get_correspondent

Retrieve a specific correspondent by ID.

**When to use:** Get details about a correspondent including their documents.

**Parameters:**
```typescript
{
  id: number  // Correspondent ID (required)
}
```

**Response:** Complete correspondent object with document list.

**Example:**
```javascript
const correspondent = await paperless_get_correspondent({ id: 3 });
```

---

### paperless_update_correspondent

Update an existing correspondent's properties.

**When to use:** Modify correspondent name or matching rules.

**Parameters:**
```typescript
{
  id: number,                // Correspondent ID (required)
  name?: string,             // New name
  matching_algorithm?: "any" | "all" | "exact" | "regular expression" | "fuzzy",
  match?: string,            // New matching pattern
}
```

**Response:** Updated correspondent object.

**Example:**
```javascript
await paperless_update_correspondent({
  id: 3,
  name: "Amazon.com Inc."
});
```

---

### paperless_delete_correspondent

Delete a correspondent from the system.

**When to use:** Remove obsolete correspondents. Documents will become unassigned.

**Parameters:**
```typescript
{
  id: number  // Correspondent ID to delete (required)
}
```

**Response:** Success message.

**Example:**
```javascript
await paperless_delete_correspondent({ id: 5 });
```

---

## Document Types API

Tools for managing document types (categorize by document purpose).

### paperless_list_document_types

List all document types in the system.

**When to use:** Display available document types for filtering or assignment.

**Parameters:** None

**Response:** Array of document type objects with id, name, matching_algorithm, match, and document_count.

**Example:**
```javascript
const types = await paperless_list_document_types();
types.forEach(t => {
  console.log(`${t.name} - ${t.document_count} documents`);
});
```

---

### paperless_create_document_type

Create a new document type.

**When to use:** Add new categories like "Invoice", "Contract", "Letter", etc.

**Parameters:**
```typescript
{
  name: string,              // Document type name (required)
  matching_algorithm?: "any" | "all" | "exact" | "regular expression" | "fuzzy",
  match?: string,            // Pattern for automatic assignment
}
```

**Response:** Created document type object.

**Example:**
```javascript
const docType = await paperless_create_document_type({
  name: "Medical Record",
  matching_algorithm: "fuzzy",
  match: "diagnosis prescription"
});
```

---

### paperless_get_document_type

Retrieve a specific document type by ID.

**When to use:** Get details about a document type.

**Parameters:**
```typescript
{
  id: number  // Document type ID (required)
}
```

**Response:** Complete document type object.

**Example:**
```javascript
const docType = await paperless_get_document_type({ id: 2 });
```

---

### paperless_update_document_type

Update an existing document type.

**When to use:** Modify document type name or matching rules.

**Parameters:**
```typescript
{
  id: number,                // Document type ID (required)
  name?: string,             // New name
  matching_algorithm?: "any" | "all" | "exact" | "regular expression" | "fuzzy",
  match?: string,            // New matching pattern
}
```

**Response:** Updated document type object.

**Example:**
```javascript
await paperless_update_document_type({
  id: 2,
  name: "Healthcare Document"
});
```

---

### paperless_delete_document_type

Delete a document type from the system.

**When to use:** Remove obsolete document types.

**Parameters:**
```typescript
{
  id: number  // Document type ID to delete (required)
}
```

**Response:** Success message.

**Example:**
```javascript
await paperless_delete_document_type({ id: 3 });
```

---

## Storage Paths API

Tools for managing storage paths (custom file organization).

### paperless_list_storage_paths

List all storage paths in the system.

**When to use:** Display available storage paths or find IDs for document assignment.

**Parameters:** None

**Response:** Array of storage path objects with id, name, path, and document_count.

**Example:**
```javascript
const paths = await paperless_list_storage_paths();
paths.forEach(p => {
  console.log(`${p.name}: ${p.path}`);
});
```

---

### paperless_create_storage_path

Create a new storage path for custom file organization.

**When to use:** Set up custom directory structures for document storage using patterns.

**Parameters:**
```typescript
{
  name: string,    // Storage path name (required)
  path: string     // Path with {date}, {title}, etc. (required)
}
```

**Response:** Created storage path object.

**Example:**
```javascript
const path = await paperless_create_storage_path({
  name: "Invoices by Year",
  path: "invoices/{created_year}/{title}"
});
```

---

### paperless_get_storage_path

Retrieve a specific storage path by ID.

**When to use:** Get details about a storage path configuration.

**Parameters:**
```typescript
{
  id: number  // Storage path ID (required)
}
```

**Response:** Complete storage path object.

**Example:**
```javascript
const storagePath = await paperless_get_storage_path({ id: 1 });
```

---

### paperless_update_storage_path

Update an existing storage path.

**When to use:** Modify storage path name or path pattern.

**Parameters:**
```typescript
{
  id: number,      // Storage path ID (required)
  name?: string,   // New name
  path?: string,   // New path pattern
}
```

**Response:** Updated storage path object.

**Example:**
```javascript
await paperless_update_storage_path({
  id: 1,
  path: "documents/{created_year}/{document_type}/{title}"
});
```

---

### paperless_delete_storage_path

Delete a storage path from the system.

**When to use:** Remove obsolete storage paths.

**Parameters:**
```typescript
{
  id: number  // Storage path ID to delete (required)
}
```

**Response:** Success message.

**Example:**
```javascript
await paperless_delete_storage_path({ id: 2 });
```

---

## Custom Fields API

Tools for managing custom fields that add metadata to documents.

### paperless_list_custom_fields

List all custom field definitions in the system.

**When to use:** Display available custom fields for document configuration.

**Parameters:** None

**Response:** Array of custom field objects with id, name, type, and data.

**Example:**
```javascript
const fields = await paperless_list_custom_fields();
fields.forEach(f => {
  console.log(`${f.name} (${f.type})`);
});
```

---

### paperless_create_custom_field

Create a new custom field definition.

**When to use:** Add custom metadata fields like "Amount", "Due Date", "Account Number", etc.

**Parameters:**
```typescript
{
  name: string,        // Field name (required)
  type: "string" | "integer" | "decimal" | "boolean" | "date" | "url" | "monetary" | "select",  // Field type
  data?: object        // Additional field configuration (e.g., { options: [{id: 1, label: "Option 1"}] } for select)
}
```

**Response:** Created custom field object.

**Example:**
```javascript
const field = await paperless_create_custom_field({
  name: "Invoice Amount",
  type: "monetary",
  data: { currency: "USD" }
});
```

---

### paperless_get_custom_field

Retrieve a specific custom field by ID.

**When to use:** Get custom field definition details.

**Parameters:**
```typescript
{
  id: number  // Custom field ID (required)
}
```

**Response:** Complete custom field object.

**Example:**
```javascript
const field = await paperless_get_custom_field({ id: 1 });
```

---

### paperless_update_custom_field

Update an existing custom field.

**When to use:** Modify custom field name, type, or configuration.

**Parameters:**
```typescript
{
  id: number,      // Custom field ID (required)
  name?: string,   // New name
  type?: string,   // New type
  data?: object    // New configuration
}
```

**Response:** Updated custom field object.

**Example:**
```javascript
await paperless_update_custom_field({
  id: 1,
  name: "Total Amount"
});
```

---

### paperless_delete_custom_field

Delete a custom field definition.

**When to use:** Remove obsolete custom fields. Removes field from all documents.

**Parameters:**
```typescript
{
  id: number  // Custom field ID to delete (required)
}
```

**Response:** Success message.

**Example:**
```javascript
await paperless_delete_custom_field({ id: 2 });
```

---

### paperless_list_custom_field_instances

List custom field values assigned to documents.

**When to use:** Get all custom field data for documents, or find specific field values.

**Parameters:**
```typescript
{
  document?: number,  // Filter by document ID
  field?: number      // Filter by field ID
}
```

**Response:** Array of custom field instance objects.

**Example:**
```javascript
const instances = await paperless_list_custom_field_instances({
  document: 123
});
```

---

### paperless_update_custom_field_instance

Update a specific custom field value on a document.

**When to use:** Set or modify custom field data on a document.

**Parameters:**
```typescript
{
  id: number,       // Instance ID (required)
  value: any        // New value for the field
}
```

**Response:** Updated custom field instance.

**Example:**
```javascript
await paperless_update_custom_field_instance({
  id: 5,
  value: 299.99
});
```

---

## Users & Groups API

Tools for managing users and groups (requires admin permissions).

### paperless_list_users

List all users in the system.

**When to use:** Display user list for admin purposes.

**Parameters:**
```typescript
{
  limit?: number,   // Max results (default: 50)
  offset?: number   // Skip results
}
```

**Response:** Array of user objects with id, email, username, first_name, last_name, is_active, etc.

**Example:**
```javascript
const users = await paperless_list_users();
users.forEach(u => {
  console.log(`${u.username} (${u.email})`);
});
```

---

### paperless_create_user

Create a new user account.

**When to use:** Add new users to the system.

**Parameters:**
```typescript
{
  email: string,            // User email (required)
  password: string,         // User password (required, min 6 chars)
  username?: string,        // Username (defaults from email)
  first_name?: string,
  last_name?: string,
  is_active?: boolean,
  is_superuser?: boolean,
  groups?: number[],        // Group IDs
}
```

**Response:** Created user object.

**Example:**
```javascript
const user = await paperless_create_user({
  email: "john@example.com",
  password: "securepassword123",
  first_name: "John",
  last_name: "Doe",
  is_active: true
});
```

---

### paperless_get_user

Retrieve a specific user by ID.

**When to use:** Get user details for admin purposes.

**Parameters:**
```typescript
{
  user_id: string  // User UUID (required)
}
```

**Response:** Complete user object with permissions.

**Example:**
```javascript
const user = await paperless_get_user({ user_id: "uuid-here" });
```

---

### paperless_update_user

Update an existing user.

**When to use:** Modify user properties, permissions, or deactivate accounts.

**Parameters:**
```typescript
{
  user_id: string,       // User UUID (required)
  email?: string,        // New email
  password?: string,     // New password
  first_name?: string,
  last_name?: string,
  is_active?: boolean,
  is_superuser?: boolean,
  groups?: number[],     // Replace groups
}
```

**Response:** Updated user object.

**Example:**
```javascript
await paperless_update_user({
  user_id: "uuid-here",
  is_active: false
});
```

---

### paperless_delete_user

Delete a user from the system.

**When to use:** Remove user accounts (admin only).

**Parameters:**
```typescript
{
  user_id: string  // User UUID to delete (required)
}
```

**Response:** Success message.

**Example:**
```javascript
await paperless_delete_user({ user_id: "uuid-here" });
```

---

### paperless_list_groups

List all groups in the system.

**When to use:** Display available groups for permission management.

**Parameters:** None

**Response:** Array of group objects with id, name, and permissions.

**Example:**
```javascript
const groups = await paperless_list_groups();
groups.forEach(g => console.log(g.name));
```

---

### paperless_create_group

Create a new group.

**When to use:** Create permission groups for users.

**Parameters:**
```typescript
{
  name: string,            // Group name (required)
  permissions?: number[]   // Permission IDs
}
```

**Response:** Created group object.

**Example:**
```javascript
const group = await paperless_create_group({
  name: "Admins"
});
```

---

### paperless_get_group

Retrieve a specific group by ID.

**When to use:** Get group details including members.

**Parameters:**
```typescript
{
  id: number  // Group ID (required)
}
```

**Response:** Complete group object.

**Example:**
```javascript
const group = await paperless_get_group({ id: 1 });
```

---

### paperless_update_group

Update an existing group.

**When to use:** Modify group name or permissions.

**Parameters:**
```typescript
{
  id: number,             // Group ID (required)
  name?: string,          // New name
  permissions?: number[]  // New permissions
}
```

**Response:** Updated group object.

**Example:**
```javascript
await paperless_update_group({
  id: 1,
  name: "Administrators"
});
```

---

### paperless_delete_group

Delete a group from the system.

**When to use:** Remove obsolete groups.

**Parameters:**
```typescript
{
  id: number  // Group ID to delete (required)
}
```

**Response:** Success message.

**Example:**
```javascript
await paperless_delete_group({ id: 2 });
```

---

## Tasks API

Tools for managing background tasks and consumption queue.

### paperless_list_tasks

List all tasks in the system.

**When to use:** Monitor document processing status, check for errors, track consumption queue.

**Parameters:**
```typescript
{
  status?: "pending" | "processing" | "completed" | "failed",  // Filter by status
  type?: string,          // Task type filter
  limit?: number,         // Max results
  offset?: number
}
```

**Response:** Array of task objects with id, task_id, status, name, started, completed, result, etc.

**Example:**
```javascript
const tasks = await paperless_list_tasks({ status: "processing" });
tasks.forEach(t => {
  console.log(`${t.name}: ${t.status}`);
});
```

---

### paperless_acknowledge_task

Acknowledge a completed or failed task.

**When to use:** Clear task notifications or mark tasks as seen.

**Parameters:**
```typescript
{
  tasks: number[]  // Array of task IDs to acknowledge
}
```

**Response:** Success message.

**Example:**
```javascript
await paperless_acknowledge_task({
  tasks: [1, 2, 3]
});
```

---

## Search API

Tools for searching documents.

### paperless_search_autocomplete

Get autocomplete suggestions for search terms.

**When to use:** Implement search-as-you-type functionality or discover available terms.

**Parameters:**
```typescript
{
  term: string,     // Partial search term (required)
  limit?: number    // Max suggestions (default: 10)
}
```

**Response:** Array of suggested terms ordered by importance (Tf/Idf score).

**Example:**
```javascript
const suggestions = await paperless_search_autocomplete({
  term: "inv",
  limit: 5
});
// Returns: ["invoice", "invoices", "inventory", ...]
```

---

## Other APIs

### paperless_get_ui_settings

Retrieve current UI settings.

**When to use:** Read user preferences or display settings.

**Parameters:** None

**Response:** UI settings object with display preferences.

**Example:**
```javascript
const settings = await paperless_get_ui_settings();
```

---

### paperless_update_ui_settings

Update UI settings.

**When to use:** Modify user display preferences.

**Parameters:**
```typescript
{
  settings: object  // Settings to update
}
```

**Response:** Updated settings object.

**Example:**
```javascript
await paperless_update_ui_settings({
  settings: { theme: "dark", language: "en" }
});
```

---

### paperless_get_database_stats

Get database statistics.

**When to use:** Monitor system health, storage usage, document counts.

**Parameters:** None

**Response:** Database statistics object with table sizes, counts, etc.

**Example:**
```javascript
const stats = await paperless_get_database_stats();
console.log(`Documents: ${stats.document_count}`);
```

---

### paperless_get_statistics

Get document statistics and metrics.

**When to use:** Display dashboard metrics, generate reports.

**Parameters:** None

**Response:** Statistics object with document counts by type, tags, etc.

**Example:**
```javascript
const stats = await paperless_get_statistics();
console.log(`Total documents: ${stats.total_documents}`);
```

---

### paperless_bulk_edit_objects

Bulk edit object metadata (tags, correspondents, document types, storage paths).

**When to use:** Apply permission changes to multiple objects of the same type or delete multiple objects.

**Parameters:**
```typescript
{
  objects: number[],     // Object IDs (required)
  object_type: "tags" | "correspondents" | "document_types" | "storage_paths",
  method: "set_permissions" | "delete",
  permissions?: object,  // For set_permissions: { view: { users, groups }, change: { users, groups } }
  owner?: number | null, // Owner to set
  merge?: boolean        // Merge vs overwrite permissions
}
```

**Response:** Bulk edit result.

**Example - Delete multiple tags:**
```javascript
await paperless_bulk_edit_objects({
  objects: [1, 2, 3],
  object_type: "tags",
  method: "delete"
});
```

---

### paperless_list_file_mappings

List all file mappings.

**When to use:** Display available file name mappings.

**Parameters:** None

**Response:** Array of file mapping objects.

**Example:**
```javascript
const mappings = await paperless_list_file_mappings();
```

---

### paperless_create_file_mapping

Create a new file mapping.

**When to use:** Add custom filename patterns.

**Parameters:**
```typescript
{
  name: string,       // Mapping name (required)
  from_format: string,   // Source format (required)
  to_format: string      // Target format (required)
}
```

**Response:** Created file mapping object.

**Example:**
```javascript
const mapping = await paperless_create_file_mapping({
  name: "Date prefix",
  from_format: "{created}_{title}",
  to_format: "{created}_{title}"
});
```

---

### paperless_get_file_mapping

Retrieve a specific file mapping by ID.

**When to use:** Get file mapping details.

**Parameters:**
```typescript
{
  id: number  // File mapping ID (required)
}
```

**Response:** Complete file mapping object.

**Example:**
```javascript
const mapping = await paperless_get_file_mapping({ id: 1 });
```

---

### paperless_update_file_mapping

Update an existing file mapping.

**When to use:** Modify file mapping patterns.

**Parameters:**
```typescript
{
  id: number,          // File mapping ID (required)
  name?: string,       // New name
  from_format?: string,   // New source format
  to_format?: string      // New target format
}
```

**Response:** Updated file mapping object.

**Example:**
```javascript
await paperless_update_file_mapping({
  id: 1,
  to_format: "{created_year}/{title}"
});
```

---

### paperless_delete_file_mapping

Delete a file mapping.

**When to use:** Remove obsolete file mappings.

**Parameters:**
```typescript
{
  id: number  // File mapping ID to delete (required)
}
```

**Response:** Success message.

**Example:**
```javascript
await paperless_delete_file_mapping({ id: 2 });
```

---

## Workflows API (Consumption Templates)

Tools for managing workflows (consumption templates for automatic document processing).

### paperless_list_workflows

List all workflows in the system.

**When to use:** Display available workflows for document processing automation.

**Parameters:** None

**Response:** Array of workflow objects with id, name, actions, and trigger.

**Example:**
```javascript
const workflows = await paperless_list_workflows();
workflows.forEach(w => {
  console.log(`${w.name}: ${w.actions.length} actions`);
});
```

---

### paperless_create_workflow

Create a new workflow.

**When to use:** Set up automatic document processing rules.

**Parameters:**
```typescript
{
  name: string,           // Workflow name (required)
  actions: object[],      // Actions to perform (required)
  trigger?: string        // Trigger type
}
```

**Response:** Created workflow object.

**Example:**
```javascript
const workflow = await paperless_create_workflow({
  name: "Invoice Processing",
  actions: [
    { type: "assign_tag", tag: 1 },
    { type: "assign_correspondent", correspondent: 2 }
  ]
});
```

---

### paperless_get_workflow

Retrieve a specific workflow by ID.

**When to use:** Get workflow details and configuration.

**Parameters:**
```typescript
{
  id: number  // Workflow ID (required)
}
```

**Response:** Complete workflow object.

**Example:**
```javascript
const workflow = await paperless_get_workflow({ id: 1 });
```

---

### paperless_update_workflow

Update an existing workflow.

**When to use:** Modify workflow actions or trigger.

**Parameters:**
```typescript
{
  id: number,             // Workflow ID (required)
  name?: string,          // New name
  actions?: object[],     // New actions
  trigger?: string        // New trigger
}
```

**Response:** Updated workflow object.

**Example:**
```javascript
await paperless_update_workflow({
  id: 1,
  actions: [
    { type: "assign_tag", tag: 5 },
    { type: "assign_document_type", document_type: 3 }
  ]
});
```

---

### paperless_delete_workflow

Delete a workflow from the system.

**When to use:** Remove obsolete workflows.

**Parameters:**
```typescript
{
  id: number  // Workflow ID to delete (required)
}
```

**Response:** Success message.

**Example:**
```javascript
await paperless_delete_workflow({ id: 2 });
```

---

## Color Palette Reference

### Folder Tags (#B2654D)
**Main:** `#B2654D`
**Lightest:** `#D9947D`
**Darkest:** `#8C3621`

### Lifecycle Tags (#8C7760)
**Main:** `#8C7760`
**Lightest:** `#B5A591`
**Darkest:** `#634F3A`

### Related-to Tags (#608080)
**Main:** `#608080`
**Lightest:** `#8AB2B2`
**Darkest:** `#3B5454`

---

## Architecture Notes

```
Document store server
  → Backup to Dropbox
  → Final destination of records
  → Integration with Google Drive (admin/records)
```

---

## Common Workflows

### Workflow 1: Process and Tag New Documents

```javascript
// 1. Upload a batch of documents
const uploaded = await paperless_post_document({
  file: "/path/to/doc.pdf",
  filename: "monthly-report.pdf"
});

// 2. Create and assign tags
const tag = await paperless_create_tag({
  name: "Monthly Report",
  color: "#4CAF50"
});

await paperless_bulk_edit_documents({
  documents: [uploaded.id],
  method: "add_tag",
  tag: tag.id
});

// 3. Set correspondent
const correspondent = await paperless_create_correspondent({
  name: "Finance Department"
});

await paperless_update_document({
  id: uploaded.id,
  correspondent: correspondent.id
});
```

---

### Workflow 2: Find and Organize Documents by Date

```javascript
// 1. Search for documents in a date range
const docs = await paperless_list_documents({
  created_date_after: "2024-01-01",
  created_date_before: "2024-03-31",
  page_size: 100
});

// 2. Filter by content
const invoices = docs.filter(doc =>
  doc.title.toLowerCase().includes("invoice")
);

// 3. Tag them
const invoiceTag = (await paperless_list_tags())
  .find(t => t.name === "Invoice");

await paperless_bulk_edit_documents({
  documents: invoices.map(d => d.id),
  method: "add_tag",
  tag: invoiceTag.id
});
```

---

### Workflow 3: Bulk Organize by Correspondent

```javascript
// 1. Get all correspondents
const correspondents = await paperless_list_correspondents();

// 2. For each correspondent, find and organize their documents
for (const corr of correspondents) {
  const docs = await paperless_list_documents({
    correspondent: corr.id,
    page_size: 50
  });

  // Create storage path for correspondent
  const path = await paperless_create_storage_path({
    name: `${corr.name} Documents`,
    path: `correspondents/${corr.name}/{created_year}/{title}`
  });

  // Update documents with storage path
  await paperless_bulk_edit_documents({
    documents: docs.map(d => d.id),
    method: "set_storage_path",
    storage_path: path.id
  });
}
```

---

### Workflow 4: Audit Document Metadata

```javascript
// 1. Get statistics
const stats = await paperless_get_statistics();
const dbStats = await paperless_get_database_stats();

console.log("Document Statistics:", stats);
console.log("Database Stats:", dbStats);

// 2. Get all tags with usage
const tags = await paperless_list_tags();
const unusedTags = tags.filter(t => t.usage_count === 0);
console.log("Unused tags:", unusedTags.map(t => t.name));

// 3. Get documents missing metadata
const allDocs = await paperless_list_documents({ page_size: 1000 });
const missingCorrespondent = allDocs.filter(d => !d.correspondent);
const missingType = allDocs.filter(d => !d.document_type);

console.log(`Documents without correspondent: ${missingCorrespondent.length}`);
console.log(`Documents without type: ${missingType.length}`);
```

---

### Workflow 5: Cleanup Old Documents

```javascript
// 1. Find documents older than 3 years
const oldDocs = await paperless_list_documents({
  created_date_before: "2021-01-01",
  page_size: 200
});

// 2. Get the "Archive" tag
const archiveTag = (await paperless_list_tags())
  .find(t => t.name === "Archive");

// 3. Tag them first
await paperless_bulk_edit_documents({
  documents: oldDocs.map(d => d.id),
  method: "add_tag",
  tag: archiveTag.id
});

console.log(`Tagged ${oldDocs.length} old documents for archive`);
```

---

### Workflow 6: Set Custom Field on Document

```javascript
// 1. Get or create custom field
const fields = await paperless_list_custom_fields();
let amountField = fields.find(f => f.name === "Invoice Amount");

if (!amountField) {
  amountField = await paperless_create_custom_field({
    name: "Invoice Amount",
    type: "monetary",
    data: { currency: "USD" }
  });
}

// 2. Get document's custom field instances
const instances = await paperless_list_custom_field_instances({
  document: 123
});

// 3. Update the instance with value
const instance = instances.find(i => i.field === amountField.id);
if (instance) {
  await paperless_update_custom_field_instance({
    id: instance.id,
    value: 150.00
  });
}
```

---

## Response Format

```
📋 SUMMARY: [One sentence]
📊 DOCUMENTS: [Number processed]
🏷️ TAGS: [Tags applied]
⚡ ACTIONS: [Steps taken]
✅ RESULTS: [Outcomes]
```

---

## Error Handling

All tools return errors with descriptive messages. Common errors include:

- `401 Unauthorized`: Invalid or missing API token
- `404 Not Found`: Resource doesn't exist
- `400 Bad Request`: Invalid parameters
- `403 Forbidden`: Insufficient permissions

```javascript
try {
  const doc = await paperless_get_document({ id: 999999 });
} catch (error) {
  console.error("Failed to get document:", error.message);
}
```

---

## Rate Limiting

Paperless-NGX does not implement strict rate limiting, but be respectful of the API. For bulk operations, add delays between requests:

```javascript
for (const docId of documentIds) {
  await paperless_update_document({ id: docId, title: "Updated" });
  // Small delay to prevent overwhelming the server
  await new Promise(r => setTimeout(r, 100));
}
```

---

## Direct API Access (Advanced)

This section provides guidance for advanced operations using direct HTTP requests when MCP tools are insufficient.

### Security First

> **⚠️ IMPORTANT:** Never expose API tokens in code, logs, or documentation.
>
> - Store tokens in environment variables (e.g., `~/.claude/.env`)
> - Load them with `source ~/.claude/.env` before use
> - Never commit tokens to version control
> - Use the MCP tools when possible - tokens are auto-handled securely

### When to Use Direct API vs MCP

**Use MCP Tools when:**
- Standard CRUD operations (list, get, create, update, delete)
- Document uploads, searches, bulk edits
- Tag, correspondent, document type management

**Use Direct API when:**
- Advanced filtering with custom field queries
- PDF manipulation (rotate, split, merge, delete pages)
- Mail account/rule management
- Share link creation with expiration
- Workflow trigger/action management
- System status and statistics
- Logs access
- Saved views management
- Bulk downloads
- Documents with notes

### API Configuration

**Environment Variables Required:**
```bash
# Add to your ~/.claude/.env file:
PAPERLESS_URL="https://paperless.s.cytrax.com.au"
PAPERLESS_TOKEN="${PAPERLESS_TOKEN}"  # Set this in your shell or .env
```

**Set up your token:**
```bash
# Source your environment (add to ~/.bashrc or ~/.zshrc)
source ~/.claude/.env

# Or export directly in terminal
export PAPERLESS_TOKEN="your-token-here"
```

**Get your token:**
1. Log into Paperless-NGX web UI
2. Click your username in the dropdown
3. Click the circular arrow button to generate/regenerate token

### Direct API Helper Functions

Use the `bash` tool with these helper patterns. **Load your token first:**

```bash
# Load environment (run this first)
source ~/.claude/.env

# Generic helper - make any API request
paperless_api() {
  local method="${1:-GET}"
  local endpoint="$2"
  local data="$3"

  curl -s -X "$method" \
    -H "Authorization: Token $PAPERLESS_TOKEN" \
    -H "Content-Type: application/json" \
    "${PAPERLESS_URL}${endpoint}" \
    ${data:+-d "$data"}
}

# Usage examples:
# paperless_api GET "/api/tags/"
# paperless_api POST "/api/tags/" '{"name":"New Tag","color":"#FF5733"}'
# paperless_api GET "/api/documents/?page=1&page_size=10"
```

#### 2. Get System Status

```bash
# Load token first, then run:
source ~/.claude/.env

# Check overall system health
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/status/" | jq

# Get statistics
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/statistics/" | jq

# Get database info
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/database_stats/" | jq
```

#### 3. Advanced Document Search with Custom Field Queries

```bash
# Load token first:
source ~/.claude/.env

# Documents with custom field "due" (date) between Aug 1 and Sept 1, 2024
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/documents/?custom_field_query=%5B%22due%22%2C%22range%22%2C%5B%222024-08-01%22%2C%222024-09-01%22%5D%5D" | jq

# Documents with custom field "amount" > 1000
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/documents/?custom_field_query=%5B%22amount%22%2C%22gt%22%2C1000%5D" | jq

# Documents that have document links "references" to both doc 3 and 7
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/documents/?custom_field_query=%5B%22references%22%2C%22contains%22%2C%5B3%2C7%5D%5D" | jq

# Empty custom field query URL encoding:
# ["field_name","exact",""] -> %5B%22field_name%22%2C%22exact%22%2C%22%22%5D
```

#### 4. More-Like-This Search (Find Similar Documents)

```bash
# Load token first:
source ~/.claude/.env

# Find documents similar to document ID 123
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/documents/?more_like_id=123" | jq '.results[] | {id, title, score:.__search_hit__?.score}'
```

#### 5. PDF Operations via Bulk Edit

```bash
# Load token first:
source ~/.claude/.env

# Rotate document 123 by 90 degrees
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/documents/bulk_edit/" \
  -d '{
    "documents": [123],
    "method": "rotate",
    "parameters": {"degrees": 90}
  }' | jq

# Delete pages 2 and 3 from document 456
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/documents/bulk_edit/" \
  -d '{
    "documents": [456],
    "method": "delete_pages",
    "parameters": {"pages": "[2,3]"}
  }' | jq

# Split document 789 into pages 1 and 2-5
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/documents/bulk_edit/" \
  -d '{
    "documents": [789],
    "method": "split",
    "parameters": {"pages": "[1,2-5]"}
  }' | jq

# Merge documents 111, 222, 333 into one
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/documents/bulk_edit/" \
  -d '{
    "documents": [111, 222, 333],
    "method": "merge",
    "parameters": {"metadata_document_id": 111}
  }' | jq
```

#### 6. Create Share Links

```bash
# Load token first:
source ~/.claude/.env

# Create share link for document 123 (archive version), expires in 7 days
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/share_links/" \
  -d '{
    "document": 123,
    "file_version": "archive",
    "expiration": "2025-01-15T00:00:00Z"
  }' | jq

# List all share links
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/share_links/" | jq

# Delete share link ID 5
curl -s -X DELETE \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/share_links/5/"
```

#### 7. Document Notes

```bash
# Load token first:
source ~/.claude/.env

# Get notes for document 123
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/documents/123/notes/" | jq

# Add note to document 123
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/documents/123/notes/" \
  -d '{"note": "This is an important document for tax purposes"}' | jq

# Delete note ID 7 from document 123
curl -s -X DELETE \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/documents/123/notes/?id=7"
```

#### 8. Document History

```bash
# Load token first:
source ~/.claude/.env

# Get change history for document 123
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/documents/123/history/" | jq
```

#### 9. Document Suggestions

```bash
# Load token first:
source ~/.claude/.env

# Get suggestions for document 123 (tags, correspondents, etc.)
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/documents/123/suggestions/" | jq
```

#### 10. Bulk Download Documents

```bash
# Load token first:
source ~/.claude/.env

# Download documents 1,2,3 as a ZIP (archive version, deflated compression)
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/documents/bulk_download/" \
  -d '{
    "documents": [1, 2, 3],
    "content": "archive",
    "compression": "deflated"
  }' > documents.zip
```

#### 11. Selection Data (Metadata Summary)

```bash
# Load token first:
source ~/.claude/.env

# Get metadata summary for selected documents
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/documents/selection_data/" \
  -d '{"documents": [1, 2, 3, 4, 5]}' | jq
```

#### 12. Mail Account Management

```bash
# Load token first:
source ~/.claude/.env

# List mail accounts
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/mail_accounts/" | jq

# Create mail account
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/mail_accounts/" \
  -d '{
    "name": "Gmail",
    "imap_server": "imap.gmail.com",
    "imap_port": 993,
    "imap_security": 2,
    "username": "your-email@gmail.com",
    "password": "your-app-password",
    "character_set": "UTF-8"
  }' | jq

# Test mail account
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/mail_accounts/test/" \
  -d '{
    "imap_server": "imap.example.com",
    "imap_port": 993,
    "username": "test@example.com",
    "password": "password"
  }' | jq

# Process mail account manually
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/mail_accounts/1/process/" | jq
```

#### 13. Mail Rule Management

```bash
# Load token first:
source ~/.claude/.env

# List mail rules
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/mail_rules/" | jq

# Create mail rule
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/mail_rules/" \
  -d '{
    "name": "Process Invoices",
    "account": 1,
    "folder": "INBOX",
    "filter_subject": "invoice",
    "action": 3,
    "assign_document_type": 5,
    "assign_tags": [10, 11]
  }' | jq
```

#### 14. Saved Views Management

```bash
# Load token first:
source ~/.claude/.env

# List saved views
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/saved_views/" | jq

# Create saved view for invoices
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/saved_views/" \
  -d '{
    "name": "Pending Invoices",
    "show_on_dashboard": true,
    "show_in_sidebar": true,
    "filter_rules": [
      {"rule_type": 4, "value": "5"},  # document_type is Invoice
      {"rule_type": 6, "value": "10"}   # has tag "Pending"
    ],
    "page_size": 25
  }' | jq
```

#### 15. Workflow Management

```bash
# Load token first:
source ~/.claude/.env

# List workflows
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/workflows/" | jq

# Create workflow
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/workflows/" \
  -d '{
    "name": "Invoice Processing",
    "order": 1,
    "enabled": true,
    "triggers": [
      {
        "type": 2,
        "sources": [1, 2, 3],
        "filter_filename": "*.pdf"
      }
    ],
    "actions": [
      {
        "type": 1,
        "assign_tags": [5],
        "assign_document_type": 3
      }
    ]
  }' | jq

# List workflow actions
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/workflow_actions/" | jq

# List workflow triggers
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/workflow_triggers/" | jq
```

#### 16. User Profile Management

```bash
# Load token first:
source ~/.claude/.env

# Get current user profile
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/profile/" | jq

# Update profile
curl -s -X PATCH \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/profile/" \
  -d '{"email": "newemail@example.com"}' | jq

# Generate new auth token
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/profile/generate_auth_token/" | jq

# Setup TOTP MFA
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/profile/totp/" | jq  # Get secret and QR
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/profile/totp/" \
  -d '{"secret": "JBSWY3DPEHPK3PXP", "code": "123456"}' | jq  # Verify and activate
```

#### 17. Logs Access

```bash
# Load token first:
source ~/.claude/.env

# Get recent logs
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/logs/" | jq

# Get specific log file
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/logs/paperless.log/" | jq

# Get last 50 entries from paperless.log
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/logs/paperless.log/?limit=50" | jq
```

#### 18. Trash Management

```bash
# Load token first:
source ~/.claude/.env

# List documents in trash
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/trash/" | jq

# Restore documents from trash
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/trash/" \
  -d '{
    "documents": [123, 456],
    "action": "restore"
  }' | jq

# Empty trash
curl -s -X POST \
  -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Content-Type: application/json" \
  "${PAPERLESS_URL}/api/trash/" \
  -d '{
    "documents": [123, 456],
    "action": "empty"
  }' | jq
```

#### 19. Remote Version Check

```bash
# Load token first:
source ~/.claude/.env

# Check Paperless-NGX version
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/remote_version/" | jq
```

#### 20. Get Next ASN (Archive Serial Number)

```bash
# Load token first:
source ~/.claude/.env

# Get next available ASN
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "${PAPERLESS_URL}/api/documents/next_asn/" | jq
```

### URL Encoding for Query Parameters

Special characters in query parameters must be URL encoded:

| Character | Encoded |
|-----------|---------|
| ` ` | `%20` |
| `[` | `%5B` |
| `]` | `%5D` |
| `,` | `%2C` |
| `"` | `%22` |

**Example - custom_field_query encoding:**
```
Original: ["due","range",["2024-08-01","2024-09-01"]]
Encoded:  %5B%22due%22%2C%22range%22%2C%5B%222024-08-01%22%2C%222024-09-01%22%5D%5D
```

### API Versioning

Paperless-NGX API is versioned (currently v6, API version 9). Specify version with header:

```bash
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  -H "Accept: application/json; version=6" \
  "${PAPERLESS_URL}/api/documents/" | jq
```

### Full API Schema

Access the interactive API docs at:
- `https://paperless.s.cytrax.com.au/api/schema/view/`
- `https://paperless.s.cytrax.com.au/api/schema/`

---

## Response Format

```
📋 SUMMARY: [One sentence]
📊 DOCUMENTS: [Number processed]
🏷️ TAGS: [Tags applied]
⚡ ACTIONS: [Steps taken]
✅ RESULTS: [Outcomes]
```
