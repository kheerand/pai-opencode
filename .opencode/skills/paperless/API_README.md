# Paperless API Client

TypeScript API client for direct Paperless-ngx API access.

## Overview

This package provides a complete TypeScript API client for interacting with Paperless-ngx, enabling direct API calls instead of relying on MCP tools. Based on official API documentation from paperless-ngx.

## Features

- **Full API Coverage** - All major endpoints supported
- **Type Safety** - Full TypeScript definitions
- **Authentication** - Token, Basic, and Session auth
- **Error Handling** - Structured error responses
- **Async/Await** - Modern async/await syntax
- **No Dependencies** - Uses built-in fetch API

## Installation

```bash
# Copy to your project
cp -r ~/.claude/skills/paperless/src ./paperless-api

# Or install as local package
cd ~/.claude/skills/paperless
npm install
```

## Quick Start

### TypeScript/JavaScript

```typescript
import PaperlessClient from './paperless-api/src/PaperlessClient';

const client = new PaperlessClient({
  baseUrl: 'https://paperless.s.cytrax.com.au',
  token: 'your-auth-token',
});

// List documents
const response = await client.listDocuments({ page: 1, page_size: 100 });
console.log(`Found ${response.count} documents`);

// Search documents
const searchResults = await client.searchDocuments('AAMI insurance');
searchResults.results.forEach(doc => {
  console.log(doc.title, doc.id);
});

// Upload document
const file = new Blob([...]);
const uploadResponse = await client.uploadDocument(file, {
  title: 'My Document',
  correspondent: 3,
  tags: [19, 16],
});
```

### Command Line Interface

```bash
# Set up authentication
export PAPERLESS_BASE_URL=https://paperless.s.cytrax.com.au
export PAPERLESS_TOKEN=your-token-here

# Or login and get token
bun run ~/.claude/skills/paperless/src/cli.ts login username password

# List documents
bun run ~/.claude/skills/paperless/src/cli.ts list

# Search documents
bun run ~/.claude/skills/paperless/src/cli.ts search "AAMI insurance"

# Get document details
bun run ~/.claude/skills/paperless/src/cli.ts get 123

# Upload document
bun run ~/.claude/skills/paperless/src/cli.ts upload document.pdf --title "Invoice" --correspondent 3

# Bulk add tag to documents
bun run ~/.claude/skills/paperless/src/cli.ts bulk add-tag 19 123 124 125

# Download document
bun run ~/.claude/skills/paperless/src/cli.ts download 123

# List tags
bun run ~/.claude/skills/paperless/src/cli.ts tags

# Create tag
bun run ~/.claude/skills/paperless/src/cli.ts create-tag "My Tag" --color "#B2654D"

# Update tag color
bun run ~/.claude/skills/paperless/src/cli.ts update-tag-color 19 "#8C7760"
```

## API Methods

### Authentication

```typescript
// Set authentication token
client.setToken('your-token');

// Create or recreate authentication token
const tokenResponse = await client.createToken('username', 'password');

// Clear authentication
client.clearToken();
```

### Documents

```typescript
// List documents
const response = await client.listDocuments({ page: 1, page_size: 100 });

// Get document by ID
const document = await client.getDocument(123);

// Search documents
const results = await client.searchDocuments('search query');

// Search similar documents
const similar = await client.searchSimilar(123);

// Upload document
const file = new Blob([...]);
const upload = await client.uploadDocument(file, {
  title: 'Document Title',
  created: '2025-01-06',
  correspondent: 3,
  document_type: 4,
  tags: [19, 16],
});

// Bulk edit documents
await client.bulkEditDocuments({
  documents: [123, 124, 125],
  method: 'add_tag',
  parameters: { tag: 19 },
});

// Download document
const blob = await client.downloadDocument(123);
const original = await client.downloadDocument(123, true); // Original file

// Get thumbnail
const thumbnail = await client.getDocumentThumbnail(123);

// Get preview
const preview = await client.getDocumentPreview(123);
```

### Tags

```typescript
// List tags
const tags = await client.listTags();

// Get tag by ID
const tag = await client.getTag(19);

// Create tag
const newTag = await client.createTag({
  name: 'Important',
  color: '#B2654D',
  match: 'important',
  matching_algorithm: 6,
});

// Update tag
await client.updateTag(19, {
  name: 'Updated Name',
  match: 'updated match',
});

// Update tag color
await client.updateTagColor(19, '#8C7760');

// Update tag text color
await client.updateTagTextColor(19, '#000000');

// Delete tag
await client.deleteTag(19);
```

### Correspondents

```typescript
// List correspondents
const correspondents = await client.listCorrespondents();

// Get correspondent by ID
const correspondent = await client.getCorrespondent(3);

// Create correspondent
const newCorrespondent = await client.createCorrespondent({
  name: 'AAMI',
  match: 'AAMI',
  matching_algorithm: 1,
});

// Update correspondent
await client.updateCorrespondent(3, {
  name: 'AAMI Updated',
});

// Delete correspondent
await client.deleteCorrespondent(3);
```

### Document Types

```typescript
// List document types
const types = await client.listDocumentTypes();

// Get document type by ID
const type = await client.getDocumentType(4);

// Create document type
const newType = await client.createDocumentType({
  name: 'Invoice',
  match: 'invoice',
});

// Update document type
await client.updateDocumentType(4, {
  name: 'Updated Invoice',
});

// Delete document type
await client.deleteDocumentType(4);
```

### Storage Paths

```typescript
// List storage paths
const paths = await client.listStoragePaths();

// Get storage path by ID
const path = await client.getStoragePath(1);

// Create storage path
const newPath = await client.createStoragePath({
  name: 'Tax Documents',
  path: 'tax_documents/{{ created_year }}/{{ title }}',
});

// Update storage path
await client.updateStoragePath(1, {
  name: 'Updated Path',
});

// Delete storage path
await client.deleteStoragePath(1);
```

### Search & Autocomplete

```typescript
// Get autocomplete suggestions
const suggestions = await client.searchAutocomplete('AAMI');

// Get task status
const task = await client.getTask('task-uuid');

// Acknowledge task
await client.acknowledgeTask('task-uuid');
```

## Bulk Operations

The `bulkEditDocuments` method supports many operations:

### Set Correspondent

```typescript
await client.bulkEditDocuments({
  documents: [1, 2, 3],
  method: 'set_correspondent',
  parameters: { correspondent: 10 },
});
```

### Set Document Type

```typescript
await client.bulkEditDocuments({
  documents: [1, 2, 3],
  method: 'set_document_type',
  parameters: { document_type: 4 },
});
```

### Add Tag

```typescript
await client.bulkEditDocuments({
  documents: [1, 2, 3],
  method: 'add_tag',
  parameters: { tag: 19 },
});
```

### Remove Tag

```typescript
await client.bulkEditDocuments({
  documents: [1, 2, 3],
  method: 'remove_tag',
  parameters: { tag: 19 },
});
```

### Modify Tags

```typescript
await client.bulkEditDocuments({
  documents: [1, 2, 3],
  method: 'modify_tags',
  parameters: {
    add_tags: [19, 16],
    remove_tags: [20],
  },
});
```

### Delete Documents

```typescript
await client.bulkEditDocuments({
  documents: [1, 2, 3],
  method: 'delete',
});
```

### Reprocess Documents

```typescript
await client.bulkEditDocuments({
  documents: [1, 2, 3],
  method: 'reprocess',
});
```

### Set Permissions

```typescript
await client.bulkEditDocuments({
  documents: [1, 2, 3],
  method: 'set_permissions',
  parameters: {
    set_permissions: {
      view: { users: [100], groups: [] },
      change: { users: [101], groups: [] },
    },
  },
});
```

### Merge Documents

```typescript
await client.bulkEditDocuments({
  documents: [1, 2, 3],
  method: 'merge',
  parameters: {
    metadata_document_id: 1, // Use metadata from doc 1
    delete_originals: true,
  },
});
```

### Rotate Document

```typescript
await client.bulkEditDocuments({
  documents: [1],
  method: 'rotate',
  parameters: { degrees: 90 },
});
```

### Split Document

```typescript
await client.bulkEditDocuments({
  documents: [1],
  method: 'split',
  parameters: {
    pages: '[1,2,3,5-7]', // Pages 1, 2, 3, and 5-7
    delete_originals: true,
  },
});
```

## Configuration

### Environment Variables

```bash
# Document repository URL (required)
export PAPERLESS_BASE_URL=https://paperless.s.cytrax.com.au

# Authentication token (optional - can use login command)
export PAPERLESS_TOKEN=your-token-here

# Username for login command
export PAPERLESS_USERNAME=username

# Password for login command
export PAPERLESS_PASSWORD=password

# Config file path (optional)
export PAPERLESS_CONFIG=/path/to/config.json
```

### Config File (JSON)

```json
{
  "baseUrl": "https://paperless.s.cytrax.com.au",
  "token": "your-auth-token",
  "username": "username",
  "password": "password"
}
```

## Error Handling

The client throws `PaperlessError` for failed requests:

```typescript
try {
  const doc = await client.getDocument(123);
} catch (error) {
  if (error instanceof PaperlessError) {
    console.error(`Request failed: ${error.statusCode}`);
    console.error(`Details: ${error.details}`);
  } else {
    console.error(`Unexpected error: ${error.message}`);
  }
}
```

## Authentication Methods

### Token Authentication (Recommended)

```typescript
const client = new PaperlessClient({
  baseUrl: 'https://paperless.s.cytrax.com.au',
  token: 'your-token-from-web-ui',
});
```

### Basic Authentication

```typescript
// The client can be configured with username/password for Basic auth
// (implementation: encode to base64 and add Authorization header)
```

### Session Authentication

When you're logged into Paperless in your browser, the session cookie will be used automatically for API requests.

## API Versioning

The client uses API version 6 by default. This can be changed:

```typescript
// To use a different API version (not typically needed)
client.apiVersion = '5'; // Or '4', '6', etc.
```

## Type Definitions

Complete TypeScript types are exported for:

- `Document`
- `Tag`
- `Correspondent`
- `DocumentType`
- `StoragePath`
- `Task`
- `PaginationParams`
- `ApiResponse<T>`
- `BulkEditOptions`
- `Permissions`
- `BulkEditParameters`
- `SearchHit`
- `And many more...`

## Examples

### Upload and Tag Documents

```typescript
import PaperlessClient from './paperless-api/src/PaperlessClient';

const client = new PaperlessClient({
  baseUrl: 'https://paperless.s.cytrax.com.au',
  token: process.env.PAPERLESS_TOKEN,
});

// Get tag IDs
const tags = await client.listTags();
const actionTag = tags.results.find(t => t.name === 'Action');
const recordTag = tags.results.find(t => t.name === 'Record');
const folderTag = tags.results.find(t => t.name === 'F Tax FY25');

// Upload document
const file = new Blob([...]);
await client.uploadDocument(file, {
  title: 'Tax Return 2025',
  created: '2025-01-15',
  correspondent: 23, // ATO
  document_type: 4, // Invoice
  tags: [folderTag?.id, recordTag?.id],
});
```

### Search and Process Inbox

```typescript
// Search for inbox documents
const inboxResults = await client.searchDocuments('tag:Inbox');
const inboxDocs = inboxResults.results;

// Process each document
for (const doc of inboxDocs) {
  // Determine appropriate tags
  const folderTag = determineFolderTag(doc.title);
  const recordTag = tags.results.find(t => t.name === 'Record');

  // Update tags
  await client.bulkEditDocuments({
    documents: [doc.id],
    method: 'modify_tags',
    parameters: {
      add_tags: [folderTag.id, recordTag.id],
      remove_tags: [28], // Remove Inbox tag
    },
  });
}
```

### Bulk Update Tag Colors

```typescript
// Get all tags
const tags = await client.listTags();

// Update lifecycle tags to correct colors
const lifecycleTags = tags.results.filter(t =>
  ['Action', 'Archive', 'Record'].includes(t.name)
);

for (const tag of lifecycleTags) {
  await client.updateTagColor(tag.id, '#8C7760'); // Warm taupe
  console.log(`Updated ${tag.name} color`);
}

// Update folder tags
const folderTags = tags.results.filter(t => t.name.startsWith('F '));

for (const tag of folderTags) {
  if (tag.color !== '#B2654D') {
    await client.updateTagColor(tag.id, '#B2654D'); // Terracotta
    console.log(`Updated ${tag.name} color`);
  }
}
```

## Migration from MCP

If you've been using MCP tools, here's how to migrate:

### Before (MCP)
```typescript
// Using MCP tools
const doc = await paperless_get_document({ id: 123 });
```

### After (Direct API)
```typescript
// Using direct API client
const client = new PaperlessClient({
  baseUrl: 'https://paperless.s.cytrax.com.au',
  token: 'your-token',
});
const doc = await client.getDocument(123);
```

## Benefits Over MCP

1. **No MCP Dependency** - Works independently of MCP server
2. **Full Type Safety** - Complete TypeScript definitions
3. **Better Error Handling** - Structured error objects with status codes
4. **Async/Await** - Modern async patterns
5. **More Features** - All API endpoints, not just MCP subset
6. **Programmatic** - Can be used in scripts, automation, etc.
7. **CLI Included** - Ready-to-use command-line interface

## Building

```bash
# Build TypeScript
bun build src/PaperlessClient.ts --outfile=dist/index.js --format=esm --target=browser

# Or using npm
npm run build
```

## License

MIT

## Support

For issues or questions, refer to:
- Paperless API docs: https://github.com/paperless-ngx/paperless-ngx/blob/main/docs/api.md
- This skill: ~/.claude/skills/paperless/
