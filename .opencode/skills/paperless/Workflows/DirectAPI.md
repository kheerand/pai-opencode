# Direct API Access

Using the TypeScript API client for advanced operations beyond MCP capabilities.

## Setup

1. **Install the API client:**
   ```bash
   cp -r ~/.claude/skills/paperless/src ./paperless-api
   cd paperless-api
   npm install
   ```

2. **Configure authentication:**
   ```bash
   # Option 1: Use token (recommended)
   export PAPERLESS_BASE_URL=https://paperless.s.cytrax.com.au
   export PAPERLESS_TOKEN=your-token-here

   # Option 2: Login via CLI
   bun run ./src/cli.ts login username password
   ```

3. **Import in your code:**
   ```typescript
   import PaperlessClient from './paperless-api/src/PaperlessClient';

   const client = new PaperlessClient({
     baseUrl: 'https://paperless.s.cytrax.com.au',
     token: 'your-token',
   });
   ```

---

## API Examples

### Upload Document with Tag Color Update

```typescript
const client = new PaperlessClient({
  baseUrl: 'https://paperless.s.cytrax.com.au',
  token: 'your-token',
});

// Create or get tag
const tags = await client.listTags();
const folderTag = tags.results.find(t => t.name.startsWith('F '));

// Update folder tag color to correct terracotta
await client.updateTagColor(folderTag.id, '#B2654D');

// Upload document
const file = new Blob([...]);
const uploadResponse = await client.uploadDocument(file, {
  title: 'My Document',
  tags: [folderTag.id],
});
```

### Bulk Update Tag Colors

Fix all folder tag colors in one operation:

```typescript
const tags = await client.listTags();

// Update all folder tags to #B2654D
const folderTags = tags.results.filter(t => t.name.startsWith('F '));
for (const tag of folderTags) {
  await client.updateTagColor(tag.id, '#B2654D');
}

// Update lifecycle tags to #8C7760
const lifecycleTags = tags.results.filter(t =>
  ['Action', 'Archive', 'Record'].includes(t.name)
);
for (const tag of lifecycleTags) {
  if (tag.color !== '#8C7760') {
    await client.updateTagColor(tag.id, '#8C7760');
  }
}
```

### Search with Pagination

```typescript
let allDocuments: Document[] = [];
let page = 1;
let pageSize = 100;

do {
  const response = await client.listDocuments({ page, page_size: pageSize });
  allDocuments.push(...response.results);
  page++;
} while (response.next);

console.log(`Total documents: ${allDocuments.length}`);
```

### Bulk Process Inbox

```typescript
// Find all inbox documents
const inboxResults = await client.searchDocuments('tag:Inbox');
const inboxDocs = inboxResults.results;

// Get tag IDs
const tags = await client.listTags();
const recordTag = tags.results.find(t => t.name === 'Record');
const folderTag = tags.results.find(t => t.name.startsWith('F Tax '));

// Process all inbox documents
await client.bulkEditDocuments({
  documents: inboxDocs.map(d => d.id),
  method: 'modify_tags',
  parameters: {
    add_tags: [recordTag.id, folderTag.id],
    remove_tags: [28], // Inbox tag ID
  },
});
```

### Apply Retention Policy

```typescript
// Find documents needing retention review
const results30Days = await client.searchDocuments('tag:"R 30 days"');
const results1Year = await client.searchDocuments('tag:"R 1 year"');

// Get tags
const tags = await client.listTags();
const recordTag = tags.results.find(t => t.name === 'Record');
const expiredTag = tags.results.find(t => t.name === 'Expired');

// Update expired documents to Expired status
await client.bulkEditDocuments({
  documents: results30Days.results.map(d => d.id),
  method: 'modify_tags',
  parameters: {
    add_tags: [expiredTag.id],
    remove_tags: [recordTag.id],
  },
});
```

### Update Tag Colors (Complete Solution)

```typescript
const tags = await client.listTags();

// Folder tags: #B2654D
const folderTags = tags.results.filter(t => t.name.startsWith('F '));
for (const tag of folderTags) {
  await client.updateTagColor(tag.id, '#B2654D');
}

// Lifecycle tags: #8C7760
const lifecycleTags = tags.results.filter(t =>
  ['Action', 'Archive', 'Record'].includes(t.name)
);
for (const tag of lifecycleTags) {
  await client.updateTagColor(tag.id, '#8C7760');
}

// Related-to tags: #608080
const relatedTags = tags.results.filter(t =>
  ['Anaya', 'Cytrax', 'Family', 'Financial'].includes(t.name)
);
for (const tag of relatedTags) {
  await client.updateTagColor(tag.id, '#608080');
}

console.log('Updated all tag colors!');
```

### Advanced Search with Custom Fields

```typescript
// Search by custom field date range
const dateResults = await client.listDocuments({
  custom_field_query: JSON.stringify([
    'due', 'range', ['2025-01-01', '2025-12-31']
  ]),
});

// Search for exact match
const bobResults = await client.listDocuments({
  custom_field_query: JSON.stringify([
    'customer', 'exact', 'bob'
  ]),
});

// Search for documents that have field
const hasAddressResults = await client.listDocuments({
  custom_field_query: JSON.stringify([
    'address', 'exists', true
  ]),
});
```

### Split Documents

```typescript
// Split a multi-page document
await client.bulkEditDocuments({
  documents: [123],
  method: 'split',
  parameters: {
    pages: '[1,2,3,5-7]', // Pages 1, 2, 3, and 5-7
    delete_originals: true,
  },
});
```

### Merge Documents

```typescript
// Merge multiple documents
await client.bulkEditDocuments({
  documents: [124, 125, 126],
  method: 'merge',
  parameters: {
    metadata_document_id: 124, // Use metadata from first document
    delete_originals: true,
  },
});
```

### Delete Pages from PDF

```typescript
// Remove blank pages 2 and 4
await client.bulkEditDocuments({
  documents: [123],
  method: 'delete_pages',
  parameters: {
    pages: '[2,4]',
  },
});
```

---

## CLI Usage

The included CLI tool provides ready-to-use commands:

```bash
# List documents
bun run ./src/cli.ts list

# Search documents
bun run ./src/cli.ts search "AAMI insurance"

# Upload document
bun run ./src/cli.ts upload document.pdf --title "Invoice" --correspondent 3

# Bulk add tag
bun run ./src/cli.ts bulk add-tag 19 123 124 125

# Update tag colors (fix all!)
bun run ./src/cli.ts update-tag-color 19 "#8C7760"

# Download document
bun run ./src/cli.ts download 123
```

---

## API vs MCP

| Feature | MCP Tools | Direct API |
|---------|-----------|-------------|
| **Easy to use** | ✓ | Requires setup |
| **Type safety** | ✗ | ✓ TypeScript types |
| **Complete API** | ✗ | ✓ All endpoints |
| **Error handling** | Basic | Structured |
| **Async/Await** | N/A | ✓ |
| **CLI included** | ✗ | ✓ |
| **Can set tag colors** | ✗ | ✓ |
| **Bulk operations** | ✓ | ✓ |
| **Custom fields** | ✗ | ✓ |
| **PDF editing** | ✗ | ✓ |
| **Task management** | ✗ | ✓ |

---

## When to Use API vs MCP

### Use MCP Tools When:
- Quick, simple operations
- Already authenticated in web UI
- Don't need type safety
- Just want results quickly

### Use Direct API When:
- **Setting tag colors** - MCP doesn't support this
- **Bulk operations** - API is more efficient
- **PDF editing** (split, merge, rotate, delete pages)
- **Custom field management**
- **Task monitoring and acknowledgment**
- **Scripting and automation**
- **Type safety required** (TypeScript)
- **Better error handling** - Structured error objects
- **CLI automation** - Shell scripts for batch jobs

---

## Tag Color Correction Example

Complete tag color correction script using API:

```typescript
import PaperlessClient from './paperless-api/src/PaperlessClient';

async function fixAllTagColors() {
  const client = new PaperlessClient({
    baseUrl: 'https://paperless.s.cytrax.com.au',
    token: process.env.PAPERLESS_TOKEN!,
  });

  const tags = await client.listTags();

  // Folder tags: #B2654D
  const folderTags = tags.results.filter(t => t.name.startsWith('F '));
  for (const tag of folderTags) {
    if (tag.color !== '#B2654D') {
      await client.updateTagColor(tag.id, '#B2654D');
      console.log(`Fixed folder tag: ${tag.name}`);
    }
  }

  // Lifecycle tags: #8C7760
  const lifecycleTags = tags.results.filter(t =>
    ['Action', 'Archive', 'Record', 'Expired'].includes(t.name)
  );
  for (const tag of lifecycleTags) {
    if (tag.color !== '#8C7760') {
      await client.updateTagColor(tag.id, '#8C7760');
      console.log(`Fixed lifecycle tag: ${tag.name}`);
    }
  }

  // Related-to tags: #608080
  const relatedTags = tags.results.filter(t =>
    !t.name.startsWith('F ') &&
    !t.name.startsWith('R ') &&
    !['Action', 'Archive', 'Record', 'Delete', 'Expired'].includes(t.name)
  );
  for (const tag of relatedTags) {
    if (tag.color !== '#608080') {
      await client.updateTagColor(tag.id, '#608080');
      console.log(`Fixed related-to tag: ${tag.name}`);
    }
  }

  console.log('All tag colors corrected!');
}

fixAllTagColors();
```

Run with:
```bash
export PAPERLESS_TOKEN=your-token
bun run fix-colors.ts
```
