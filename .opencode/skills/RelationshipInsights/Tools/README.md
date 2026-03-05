# PersonAnalysis Tools

This skill uses parallel Intern agents for data extraction rather than dedicated CLI tools.

## Agent-Based Extraction

### Meeting Metadata Agent

**Purpose:** Extract structured metadata from meeting files.

**Input:** File manifest path
**Output:** CSV file with columns: date, filename, meeting_type, purpose, attendees

**Usage:**
```typescript
Task({
  subagent_type: "Intern",
  prompt: `
    Read file manifest at: {MANIFEST_PATH}
    For each meeting file, extract: date, filename, meeting_type, purpose, attendees
    Create CSV at: {OUTPUT_PATH}
  `
})
```

### AI Summary Agent

**Purpose:** Extract structured data from AI-generated meeting summaries.

**Input:** Vault path, person name
**Output:** Markdown file with key takeaways, actions, topics

**Usage:**
```typescript
Task({
  subagent_type: "Intern",
  prompt: `
    Search for AI meeting summaries mentioning {PERSON_NAME}
    Extract: key takeaways, actions, topics
    Create structured file at: {OUTPUT_PATH}
  `
})
```

## Future Tools (Planned)

### Analysis CLI

```
bun Tools/Analyze.ts --person "Shannon Callaghan" --mode full
bun Tools/Analyze.ts --person "Hamish" --mode quick
bun Tools/Analyze.ts --update --project shannon-callaghan-analysis
```

### Status CLI

```
bun Tools/Status.ts --project shannon-callaghan-analysis
# Output: Last analyzed, total meetings, date range
```
