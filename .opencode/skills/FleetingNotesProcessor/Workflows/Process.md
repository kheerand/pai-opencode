# Process Fleeting Notes Workflow

Reviews all Fleeting notes and generates actionable recommendations table for the daily journal.

---

## Workflow Steps

### Step 1: Gather Fleeting Notes

```bash
# Find all Fleeting notes (excluding Excalidraw files for cleaner processing)
find "/mnt/c/Users/kheer/Dropbox/PKM/Cards/Fleeting notes" -name "FN*.md" -not -name "*.excalidraw.md" | head -50
```

### Step 2: Analyze Each Note

For each Fleeting note, analyze:

1. **Content Type**: Is it a concept, task, idea, question, reference?
2. **Completeness**: Is it fully-formed or just a seed?
3. **Actionability**: Can it be acted on immediately?
4. **Relationships**: Does it relate to existing notes or projects?
5. **Urgency**: Is there a time component?

### Step 3: Categorize

Apply the recommendation categories:

| Category | Criteria |
|----------|----------|
| **CONVERT_TO_ZETTEL** | Contains a coherent concept, insight, or principle that stands alone |
| **CREATE_TASK** | Has clear action items with verbs (create, write, send, etc.) |
| **EXPAND_NOTE** | Has potential but needs more development, questions to answer |
| **MERGE_EXISTING** | Overlaps with existing note content |
| **SCHEDULE_ACTION** | Mentions specific dates, deadlines, or time-sensitive items |
| **ARCHIVE** | Already processed, or no longer relevant |
| **DELETE** | Empty file, exact duplicate, or fully resolved |
| **RESEARCH** | Poses questions needing external investigation |
| **DISCUSS** | Mentions specific people or needs collaboration |
| **KEEP_FLEETING** | Still raw, incubating, or dependent on other pending items |

### Step 4: Generate Priority

Assign priority based on:
- **High**: Time-sensitive, blocking other work, or high-value outcome
- **Medium**: Important but not urgent
- **Low**: Nice to have, can wait

### Step 5: Insert Table into Journal

The table format:

```markdown
## Fleeting Notes Review - YYYY-MM-DD

> [!info] Recommendations for processing your Fleeting notes

| Note | Category | Recommendation | Priority |
|------|----------|----------------|----------|
| [[FN - Note title]] | 📝 CONVERT_TO_ZETTEL | Create Zettel on [topic] | High |
| [[FN - Another note]] | ✅ CREATE_TASK | Action: [specific task] | Medium |

**Summary:**
- 📝 Convert to Zettel: X notes
- ✅ Create Tasks: X notes
- 📦 Archive: X notes
- ...etc
```

---

## Execution Pattern

When this workflow is invoked:

1. **Send voice notification:**
```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Processing your Fleeting notes and generating recommendations"}' \
  > /dev/null 2>&1 &
```

2. **Gather all FN files** from the Fleeting notes folder

3. **Read each note** and analyze content

4. **Categorize** with recommendation and priority

5. **Build the table** with all recommendations

6. **Read today's journal** to find insertion point

7. **Insert the table** after the "## General stuff" section or at the end

8. **Report summary** to user

---

## Journal Insertion Logic

The table should be inserted:
- After `## General stuff` section if it exists
- Before the last few lines if no clear section
- As a new section `## Fleeting Notes Review - YYYY-MM-DD`

---

## Filtering Options

| Option | Flag | Behavior |
|--------|------|----------|
| **Recent only** | `--recent 7` | Only process FNs from last 7 days |
| **Unprocessed only** | `--unprocessed` | Skip FNs with #processed tag |
| **Specific folder** | `--folder "Cards/Fleeting notes"` | Target different folder |
| **Exclude excalidraw** | `--no-excalidraw` | Skip .excalidraw.md files (default) |

---

## Output Example

```
## Fleeting Notes Review - 2026-03-04

> [!info] 12 Fleeting notes reviewed with recommendations

| Note | Category | Recommendation | Priority |
|------|----------|----------------|----------|
| [[FN - Mico tasks]] | ✅ CREATE_TASK | Multiple actionable items for Mico automation | High |
| [[FN - Ideas on wardley doctrine]] | 📝 CONVERT_TO_ZETTEL | Create Zettel on Wardley Doctrine principles | Medium |
| [[FN - Japan dataspace agenda]] | 📅 SCHEDULE_ACTION | Prepare for Japan dataspaces discussion | High |
| [[FN - Create permanent notes on ARDC from project notes]] | 🔍 RESEARCH | Review project notes for ARDC content | Medium |
| [[FN - water feature]] | 📖 EXPAND_NOTE | Develop garden/water feature idea | Low |

**Summary:**
- ✅ Create Tasks: 3 notes
- 📝 Convert to Zettel: 2 notes  
- 📅 Schedule: 1 note
- 🔍 Research: 2 notes
- 📖 Expand: 2 notes
- ⏳ Keep Fleeting: 2 notes
```
