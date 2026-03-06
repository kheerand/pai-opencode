# Maintain Workflow

Fix structural issues in daily journal entries — missing body sections, broken links. Note: a missing footer is NOT a structural issue for an active day's journal — the footer is applied at end-of-day via the **WrapUp** workflow.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Maintain workflow in the DailyJournal skill"}' \
  > /dev/null 2>&1 &
```

Running the **Maintain** workflow in the **DailyJournal** skill...

## Configuration

| Setting | Value |
|---------|-------|
| Vault | `/mnt/c/Users/kheer/Dropbox/PKM` |
| Journal folder | `journals/` |
| Body template | `Extras/templates/Journal - Body.md` |
| Footer template | `Extras/templates/Journal - footer.md` |

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | YYYY-MM-DD | today | The date of the journal to maintain |
| `scope` | string | "full" | "full" checks everything, "footer" only fixes footer, "links" only fixes nav links |

## Step 1: Read the Journal

```bash
VAULT="/mnt/c/Users/kheer/Dropbox/PKM"
DATE="YYYY-MM-DD"
JOURNAL="${VAULT}/journals/${DATE}.md"
```

Read the journal file. If it doesn't exist, suggest the **Create** workflow instead.

## Step 2: Structural Audit

Check for each canonical section (in order):

| # | Section | Check For | Source |
|---|---------|-----------|--------|
| 1 | YAML frontmatter | `type: Journal` and `id:` present | Body template |
| 2 | previous_Journal | `previous_Journal:: [[YYYY-MM-DD]]` link | Body template |
| 3 | Reflections callout | `> [!note]+ # Reflections on the day` | Body template |
| 4 | Summary callout | `> [!summary]+ # Summary of the day` | Body template |
| 5 | Tasks tabs | ````tabs` block with Urgent/High/Tasks` | Body template |
| 6 | Projects in focus | `![[Active projects#In focus]]` | Body template |
| 7 | Journal heading | `# Journal YYYY-MM-DD` | Body template |
| 8 | Meeting notes | `## Meeting notes` with dataviewjs | Body template |
| 9 | Tasks for the day | `## Tasks for the day` | Body template |
| 10 | General stuff | `## General stuff` | Body template |
| 11 | Today's Files | `# Today's Files` with dataview queries | Footer template (end-of-day) |
| 12 | next_Journal | `next_Journal:: [[YYYY-MM-DD]]` link | Footer template (end-of-day) |

**Report each as:** ✅ Present | ❌ Missing | ⚠️ Malformed | ⏳ Not yet (for footer on active day's journal)

## Step 3: Fix Missing Sections

### Missing Footer

**Important:** A missing footer is only a problem for PAST journals, not today's active journal.

- **Today's journal missing footer:** This is NORMAL. The footer is applied at end-of-day via the **WrapUp** workflow. Report as `⏳ Not yet` and do NOT auto-fix.
- **Past journal missing footer:** This IS a problem. Apply the footer template content:

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

Replace `NEXT_DATE` with the next day's date (YYYY-MM-DD format).

### Missing Navigation Links

- `previous_Journal::` should link to the day before
- `next_Journal::` should link to the day after
- Check adjacent journals and update their links too

### Missing Body Sections

If a body section is missing (unlikely unless journal was manually edited), re-insert the section from the body template in the correct position within the canonical order.

## Step 4: Fix Adjacent Journal Links

Check the previous day's journal:
```bash
PREV_JOURNAL="${VAULT}/journals/${PREV_DATE}.md"
```
- Should have `next_Journal:: [[${DATE}]]`

Check the next day's journal (if exists):
```bash
NEXT_JOURNAL="${VAULT}/journals/${NEXT_DATE}.md"
```
- Should have `previous_Journal:: [[${DATE}]]`

## Step 5: Report

Output a maintenance report:

```
## Journal Maintenance Report - YYYY-MM-DD

### Structural Audit
| Section | Status |
|---------|--------|
| YAML frontmatter | ✅ |
| previous_Journal link | ✅ |
| ... | ... |
| Today's Files | ❌ → FIXED |
| next_Journal link | ❌ → FIXED |

### Actions Taken
- Added footer with Today's Files dataview queries
- Added next_Journal:: link to 2026-03-07
- Updated 2026-03-05 with next_Journal:: link to 2026-03-06

### Result
Journal is now structurally complete.
```

## Done

Journal structure verified and repaired. All sections present, navigation links intact.
