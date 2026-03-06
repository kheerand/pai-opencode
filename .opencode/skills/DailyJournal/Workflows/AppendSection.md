# AppendSection Workflow

**API workflow for other skills** to insert content into the daily journal. This is the canonical way for any skill to write to the daily journal.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Appending content to the daily journal"}' \
  > /dev/null 2>&1 &
```

Running the **AppendSection** workflow in the **DailyJournal** skill...

## Why This Exists

Previously, skills like FleetingNotesProcessor and Pkm:SyncHistory wrote directly to the journal file. This created:
- Inconsistent section placement
- Missing footers (content appended after where footer should be)
- Duplicate content when multiple skills wrote simultaneously

**This workflow is the single point of entry for journal writes.**

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `date` | YYYY-MM-DD | No | today | Journal date to append to |
| `target_section` | string | Yes | — | Section heading to append under |
| `content` | string | Yes | — | Markdown content to insert |
| `heading` | string | No | — | Optional sub-heading (## or ###) to wrap content in |
| `position` | string | No | "append" | "append" (end of section) or "prepend" (start of section) |

## Valid Target Sections

| target_section value | Maps To | Typical Users |
|---------------------|---------|---------------|
| `"reflections"` | `> [!note]+ # Reflections on the day` | Update workflow (user content) |
| `"summary"` | `> [!summary]+ # Summary of the day` | Update workflow (user content) |
| `"tasks"` | `## Tasks for the day` | Update workflow, task-related skills |
| `"general"` | `## General stuff` | FleetingNotesProcessor, SyncHistory, any skill |
| `"meeting_notes"` | (creates meeting file in journals/Meetings/) | Pkm:CreateNote |

## Step 1: Ensure Journal Exists

```bash
VAULT="/mnt/c/Users/kheer/Dropbox/PKM"
DATE="YYYY-MM-DD"
JOURNAL="${VAULT}/journals/${DATE}.md"
```

If journal doesn't exist:
1. Invoke the **Create** workflow to create it
2. Then continue with the append

## Step 2: Read Current Journal

Read the full journal file content.

## Step 3: Find Insertion Point

For each target_section, find the correct insertion point:

### `"reflections"`
- Find `> [!note]+ # Reflections on the day`
- Insert content as callout body lines (prefixed with `> `)

### `"summary"`
- Find `> [!summary]+ # Summary of the day`
- Insert content as callout body lines (prefixed with `> `)

### `"tasks"`
- Find `## Tasks for the day`
- Insert after the heading (before the next `##` heading)

### `"general"` (most common)
- Find `## General stuff`
- Find the NEXT major section after it (typically `# Today's Files` from footer, or end of file)
- Insert content BEFORE the footer/next section
- If `heading` parameter provided, wrap content:
  ```markdown
  ### {heading}
  
  {content}
  ```

### `"meeting_notes"`
- Don't edit the journal directly
- Create a meeting file in `journals/Meetings/` instead
- The dataviewjs in the journal will auto-pick it up

## Step 4: Handle Footer Preservation

If the footer (`# Today's Files`) is already present in the journal, content must be inserted ABOVE it.

If the footer does NOT exist:
1. Insert the content at the end of the target section
2. Do NOT auto-add the footer — the footer is an end-of-day operation handled by the **WrapUp** workflow

## Step 5: Prevent Duplicates

Before inserting, check if the exact same content (or a heading matching the `heading` parameter) already exists in the target section.

If duplicate heading found:
- **append** mode: Add content under the existing heading
- **prepend** mode: Add content at the start of the existing heading's section

If exact content match found:
- Skip insertion
- Report "Content already present in journal"

## Step 6: Write Updated Journal

Write the modified content back to the journal file.

## Step 7: Return Result

Return a structured result for the calling skill:

```json
{
  "success": true,
  "journal_path": "journals/YYYY-MM-DD.md",
  "section": "general",
  "action": "appended",
  "heading": "Fleeting Notes Review - YYYY-MM-DD",
  "lines_added": 42
}
```

## Error Handling

| Error | Action |
|-------|--------|
| Journal doesn't exist | Auto-create via Create workflow |
| Target section not found | Add the section in canonical order, then insert |
| Footer missing | Normal for active day — do NOT auto-add. For past journals, suggest WrapUp workflow |
| Duplicate content | Skip, report "already present" |

## Usage Example (for other skill authors)

When building a skill that needs to write to the daily journal, follow this pattern:

```markdown
## Writing to Daily Journal

This workflow uses the DailyJournal skill to insert results.

1. Generate your content block (markdown)
2. Use the DailyJournal:AppendSection workflow:
   - target_section: "general"
   - heading: "Your Section Title - YYYY-MM-DD"
   - content: your generated markdown block
   - date: target date (default: today)
3. DailyJournal handles:
   - Creating journal if needed
   - Finding correct insertion point
   - Preserving footer
   - Preventing duplicates
```

## Done

Content appended to daily journal at the correct section, with structural integrity preserved.
