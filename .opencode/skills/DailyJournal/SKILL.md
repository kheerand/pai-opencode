---
name: DailyJournal
description: Daily journal management for PKM vault. Create, update, and maintain daily journals using Obsidian templates. USE WHEN daily journal, update journal, create journal, journal entry, add to journal, add a note to my journal, add XYZ to my journal, journal maintenance, fix journal, today's journal, wrap up journal, close journal OR when any skill needs to append content to the daily journal.
---

## Customization

**Before executing, check for user customizations at:**
`~/.opencode/skills/CORE/USER/SKILLCUSTOMIZATIONS/DailyJournal/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

# DailyJournal

Canonical skill for creating, updating, and maintaining daily journal entries in the Obsidian PKM vault. **All other skills MUST use this skill's AppendSection workflow when inserting content into the daily journal.**

## Voice Notification

**When executing a workflow, do BOTH:**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:8888/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running WORKFLOWNAME in the DailyJournal skill"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running **WorkflowName** in the **DailyJournal** skill...
   ```

## PKM Configuration

| Setting | Value |
|---------|-------|
| **Vault** | `/mnt/c/Users/kheer/Dropbox/PKM` |
| **Journal folder** | `journals/` |
| **Journal filename** | `YYYY-MM-DD.md` |
| **Body template** | `Extras/templates/Journal - Body.md` |
| **Footer template** | `Extras/templates/Journal - footer.md` |
| **Meeting notes folder** | `journals/Meetings/` |
| **Obsidian daily-notes config** | `.obsidian/daily-notes.json` |

## Journal Lifecycle

Journals have TWO phases with DIFFERENT templates:

| Phase | When | Template Applied |
|-------|------|-----------------|
| **Creation** | Start of day (or when first needed) | `Journal - Body.md` only |
| **Wrap-up** | End of day or next day | `Journal - footer.md` appended |

**The footer template (`Journal - footer.md`) is NEVER applied at creation time.** It contains `# Today's Files` dataview queries and `next_Journal::` link, which are only meaningful as an end-of-day wrap-up.

## Journal Structure

Every journal follows this canonical section order:

```
── BODY (applied at creation) ──────────────────
1. YAML frontmatter (type: Journal, id)
2. previous_Journal:: link
3. Reflections on the day (callout)
4. Summary of the day (callout)
5. Tasks (tabs: Urgent, High, Tasks)
6. Projects in focus
7. Journal YYYY-MM-DD heading
8. Meeting notes (dataviewjs)
9. Tasks for the day
10. General stuff
11. --- (content accumulates here throughout the day) ---

── FOOTER (applied at wrap-up / end of day) ────
12. Today's Files (dataview - from footer template)
13. next_Journal:: link (from footer template)
```

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Create** | "create journal", "new journal", "today's journal" | `Workflows/Create.md` |
| **Update** | "update journal", "add to journal", "journal entry", "add a note to my journal", "add XYZ to my journal" | `Workflows/Update.md` |
| **WrapUp** | "wrap up journal", "close journal", "end of day journal" | `Workflows/WrapUp.md` |
| **Maintain** | "fix journal", "journal maintenance", "repair journal" | `Workflows/Maintain.md` |
| **AppendSection** | (API for other skills) "append to journal" | `Workflows/AppendSection.md` |

## Cross-Skill Integration

**Other skills SHOULD use this skill when writing to the daily journal:**

| Skill | How It Should Use DailyJournal |
|-------|-------------------------------|
| `FleetingNotesProcessor` | AppendSection → inserts FN review table under "General stuff" |
| `Pkm:SyncHistory` | AppendSection → appends session summary under "General stuff" |
| `Pkm:CreateNote` (meetings) | Creates meeting file in `journals/Meetings/` (dataviewjs auto-picks up) |

**Integration pattern:**
```
1. Other skill generates its content block
2. Calls DailyJournal:AppendSection with:
   - target_section: "General stuff" (or specific section)
   - content: the markdown block to insert
   - date: YYYY-MM-DD (defaults to today)
3. DailyJournal handles:
   - Creating journal if it doesn't exist
   - Finding the correct insertion point
   - Inserting ABOVE footer if footer is present
```

## Examples

**Example 1: Quick add a note to journal**
```
User: "Add smoke alarm update to my journal"
→ Invokes Update workflow
→ Detects inline content from user message
→ Inserts under "General stuff" without prompting for section
→ Confirms what was added
```

**Example 2: Update journal with reflections**
```
User: "Update my daily journal"
→ Invokes Update workflow
→ Asks what to add (reflections, tasks, notes)
→ Inserts content in correct section
```

**Example 3: Create tomorrow's journal**
```
User: "Create journal for 2026-03-07"
→ Invokes Create workflow
→ Uses Journal - Body template ONLY (no footer)
→ Sets previous_Journal link
```

**Example 4: Wrap up the day's journal**
```
User: "Wrap up my journal"
→ Invokes WrapUp workflow
→ Appends footer template (Today's Files, next_Journal link)
→ Optionally prompts for reflections and summary
```

**Example 5: Another skill appends content**
```
FleetingNotesProcessor: AppendSection("general", fnReviewTable)
→ Ensures today's journal exists
→ Finds "## General stuff" section
→ Appends the FN review table
→ Inserts above footer if present
```
