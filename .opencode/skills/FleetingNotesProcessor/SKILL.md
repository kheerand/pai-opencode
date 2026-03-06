---
name: FleetingNotesProcessor
description: Review and process Fleeting notes with actionable recommendations. USE WHEN process fleeting notes, review fleeting notes, clean up fleeting notes, fleeting note recommendations, process FN.
---

## Customization

**Before executing, check for user customizations at:**
`~/.opencode/skills/CORE/USER/SKILLCUSTOMIZATIONS/FleetingNotesProcessor/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

# FleetingNotesProcessor

Process and triage Fleeting notes from your PKM vault with intelligent recommendations on what to do with each one.

---

## Workflow Routing

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `Workflows/Process.md` | "process fleeting notes", "review fleeting notes", "clean up fleeting notes" | Main workflow to review all FNs and generate recommendations |
| `Workflows/Triage.md` | "triage fleeting", "quick triage" | Quick triage mode - just categorize, no detailed analysis |
| `Workflows/Archive.md` | "archive processed", "clean up processed" | Archive notes that have been actioned |

---

## PKM Integration

**Vault Location:** `/mnt/c/Users/kheer/Dropbox/PKM`

**Fleeting Notes Path:** `/mnt/c/Users/kheer/Dropbox/PKM/Cards/Fleeting notes/`

**Journal Path:** `/mnt/c/Users/kheer/Dropbox/PKM/journals/YYYY-MM-DD.md`

---

## Recommendation Categories

When processing Fleeting notes, each note is categorized with one of these recommendations:

| Category | Icon | Action | When to Use |
|----------|------|--------|-------------|
| **CONVERT_TO_ZETTEL** | 📝 | Create permanent Zettel note | Contains a fully-formed concept or insight |
| **CREATE_TASK** | ✅ | Add to task list | Actionable item needing follow-up |
| **EXPAND_NOTE** | 📖 | Develop into fuller note | Seed of an idea needing development |
| **MERGE_EXISTING** | 🔗 | Combine with related note | Duplicates or extends existing content |
| **SCHEDULE_ACTION** | 📅 | Create scheduled task | Time-sensitive action item |
| **ARCHIVE** | 📦 | Move to archive | Processed or no longer relevant |
| **DELETE** | 🗑️ | Remove entirely | Empty, duplicate, or resolved |
| **RESEARCH** | 🔍 | Needs investigation | Topic requiring deeper research |
| **DISCUSS** | 💬 | Add to discussion list | Needs conversation with someone |
| **KEEP_FLEETING** | ⏳ | Leave as-is | Still incubating, not ready to process |

---

## Output Format

The workflow inserts a table into the daily journal with this structure:

```markdown
## Fleeting Notes Review - YYYY-MM-DD

| Note | Category | Recommendation | Priority |
|------|----------|----------------|----------|
| [[FN - Note title]] | 📝 CONVERT_TO_ZETTEL | Create Zettel on [topic] | High |
| [[FN - Another note]] | ✅ CREATE_TASK | Action: [specific task] | Medium |
```

---

## Quick Reference

**Run the processor:**
```
User: "Process my fleeting notes"
→ Scans all FN files in Cards/Fleeting notes/
→ Analyzes content for actionable recommendations
→ Generates prioritized table
→ Inserts into today's journal
```

**Filter by age:**
```
User: "Review fleeting notes from last week"
→ Processes only FNs created in past 7 days
```

**Focus on unprocessed:**
```
User: "Show me unprocessed fleeting notes"
→ Excludes FNs with #processed tag
```

---

## Integration with Other Skills

**Works with:**
- **DailyJournal** - Uses `DailyJournal:AppendSection` to insert FN review tables into the daily journal (canonical integration point)
- **Pkm** - Create notes, search vault, manage Zettels
- **Telos** - Link to projects and goals
- **Tasks** - Create actionable tasks from FNs

**Journal Integration:** When inserting the FN review table, this skill MUST use the `DailyJournal:AppendSection` workflow instead of writing directly to the journal file. This ensures correct section placement and structural integrity.

---

## Examples

**Example 1: Full processing**
```
User: "Process my fleeting notes"
→ Invokes Process workflow
→ Finds 15 FNs in Cards/Fleeting notes/
→ Categorizes each with recommendation
→ Inserts table into today's journal
→ Returns summary of findings
```

**Example 2: Quick triage**
```
User: "Quick triage my fleeting notes"
→ Invokes Triage workflow
→ Just categorizes (no detailed analysis)
→ Returns counts by category
```

**Example 3: Archive processed**
```
User: "Archive my processed fleeting notes"
→ Invokes Archive workflow
→ Moves FNs tagged #processed to Archive folder
→ Cleans up Fleeting notes folder
```
