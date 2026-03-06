# Create Workflow

Create a new daily journal entry using the PKM vault templates.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Create workflow in the DailyJournal skill"}' \
  > /dev/null 2>&1 &
```

Running the **Create** workflow in the **DailyJournal** skill...

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
| `date` | YYYY-MM-DD | today | The date for the journal entry |

## Step 1: Determine Target Date

- Default to today's date if not specified
- Format: `YYYY-MM-DD`

## Step 2: Check If Journal Already Exists

```bash
VAULT="/mnt/c/Users/kheer/Dropbox/PKM"
DATE="YYYY-MM-DD"  # replace with target date
JOURNAL="${VAULT}/journals/${DATE}.md"

if [ -f "$JOURNAL" ]; then
    echo "Journal already exists at: $JOURNAL"
    echo "Use Update or Maintain workflow instead."
    exit 0
fi
```

If the journal exists, suggest Update or Maintain workflow instead.

## Step 3: Read Body Template ONLY

Read `Extras/templates/Journal - Body.md`

**DO NOT apply the footer template at creation time.** The footer (`Journal - footer.md`) is an end-of-day wrap-up operation handled by the **WrapUp** workflow.

## Step 4: Apply Template Variables

Replace Templater variables with actual values:

| Template Variable | Replace With |
|-------------------|-------------|
| `<% tp.date.now('YYYYMMDDHHmmss') %>` | Current timestamp in format `YYYYMMDDHHmmss` |
| `<% tp.date.yesterday("YYYY-MM-DD") %>` | Yesterday's date relative to target date |
| `{{date:YYYY-MM-DD}}` | Target date in `YYYY-MM-DD` format |

## Step 5: Compose Journal Content

Use the body template content only:

```markdown
[Body template content with variables replaced]
```

The journal ends after `## General stuff` — content will be added throughout the day, and the footer will be applied at wrap-up.

## Step 6: Write the Journal File

```bash
VAULT="/mnt/c/Users/kheer/Dropbox/PKM"
DATE="YYYY-MM-DD"
JOURNAL="${VAULT}/journals/${DATE}.md"
```

Write the composed content to the journal file.

## Step 7: Update Previous Day's Journal

If the previous day's journal exists, ensure it has:
- `next_Journal:: [[YYYY-MM-DD]]` pointing to the new journal

```bash
PREV_DATE="YYYY-MM-DD"  # yesterday
PREV_JOURNAL="${VAULT}/journals/${PREV_DATE}.md"

if [ -f "$PREV_JOURNAL" ]; then
    # Check if next_Journal link exists and update if needed
fi
```

## Step 8: Verify

- [ ] Journal file exists at `journals/YYYY-MM-DD.md`
- [ ] YAML frontmatter has `type: Journal` and `id`
- [ ] `previous_Journal::` link points to correct date
- [ ] Body sections present (Reflections, Summary, Tasks, Projects, Meeting notes, Tasks for the day, General stuff)
- [ ] Footer is NOT present (will be added at end-of-day wrap-up)
- [ ] No raw Templater variables remaining in output

## Done

Journal created at `journals/YYYY-MM-DD.md` with body template. Footer will be added at end-of-day via the WrapUp workflow.
