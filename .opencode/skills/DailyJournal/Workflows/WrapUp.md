# WrapUp Workflow

Apply the footer template to a journal as an end-of-day wrap-up. This adds the "Today's Files" dataview queries and the `next_Journal::` navigation link.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the WrapUp workflow in the DailyJournal skill"}' \
  > /dev/null 2>&1 &
```

Running the **WrapUp** workflow in the **DailyJournal** skill...

## When To Use

The footer template is applied:
- At the **end of the day** as a conscious wrap-up action
- The **next day** when reviewing yesterday's journal
- **Never at journal creation time** — the body template is sufficient for a new day

## Configuration

| Setting | Value |
|---------|-------|
| Vault | `/mnt/c/Users/kheer/Dropbox/PKM` |
| Journal folder | `journals/` |
| Footer template | `Extras/templates/Journal - footer.md` |

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | YYYY-MM-DD | today | The date of the journal to wrap up |
| `reflections` | string | (optional) | End-of-day reflections to add |
| `summary` | string | (optional) | End-of-day summary to add |

## Step 1: Locate the Journal

```bash
VAULT="/mnt/c/Users/kheer/Dropbox/PKM"
DATE="YYYY-MM-DD"
JOURNAL="${VAULT}/journals/${DATE}.md"
```

If journal doesn't exist, suggest the **Create** workflow first.

## Step 2: Check If Footer Already Applied

Search for `# Today's Files` in the journal content.

- If found: Footer already applied. Report "Journal already wrapped up" and offer to update reflections/summary instead.
- If not found: Proceed with footer application.

## Step 3: Optionally Add Reflections and Summary

If the user provides reflections or summary content (or wants to add them):

1. Find `> [!note]+ # Reflections on the day` and add reflection content
2. Find `> [!summary]+ # Summary of the day` and add summary content

If not provided, ask the user if they'd like to add end-of-day reflections. If they decline, skip this step.

## Step 4: Read Footer Template

Read `Extras/templates/Journal - footer.md`

## Step 5: Apply Footer Template Variables

| Template Variable | Replace With |
|-------------------|-------------|
| `<% tp.date.now("YYYY-MM-DD") %>` | Next day's date (for `next_Journal::` link) |

## Step 6: Append Footer

Append the footer content at the very end of the journal file:

```markdown

# Today's Files
## Files created
\`\`\`dataview
TABLE  
WHERE file.cday = date(this.file.cday)
\`\`\`

## Files modified
\`\`\`dataview
TABLE  
WHERE file.mday = date(this.file.cday) and file.cday != date(this.file.cday)
\`\`\`

# \ 
---
next_Journal:: [[NEXT_DATE]]
```

## Step 7: Update Adjacent Journal Links

If the next day's journal exists, ensure its `previous_Journal::` link points back to this journal.

If the previous day's journal exists, ensure its `next_Journal::` link points to this journal.

## Step 8: Verify

- [ ] Footer appended at end of journal
- [ ] `# Today's Files` section present with dataview queries
- [ ] `next_Journal::` link points to correct next date
- [ ] Navigation chain is intact (prev → this → next)
- [ ] Existing content was NOT modified or removed

## Done

Journal wrapped up with footer applied. Today's Files will now show in Obsidian, and navigation links are set.
