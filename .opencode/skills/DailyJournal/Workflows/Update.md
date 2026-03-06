# Update Workflow

Add content to specific sections of an existing daily journal. Handles both guided updates ("update my journal") and quick adds ("add XYZ to my journal").

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Update workflow in the DailyJournal skill"}' \
  > /dev/null 2>&1 &
```

Running the **Update** workflow in the **DailyJournal** skill...

## Configuration

| Setting | Value |
|---------|-------|
| Vault | `/mnt/c/Users/kheer/Dropbox/PKM` |
| Journal folder | `journals/` |

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | YYYY-MM-DD | today | The date of the journal to update |
| `section` | string | "general" | Which section to update (see below) |
| `content` | string | (from user) | Content to add |

## Quick Add Pattern

When the user says something like:
- "Add smoke alarm update to my journal"
- "Add a note about the meeting to my journal"
- "Add XYZ to my journal"

**Do NOT prompt for which section.** Default to `"general"` (under `## General stuff`) and insert the content directly. The user's intent is speed — they want to capture something quickly.

### How Quick Add Works

1. Extract the content from the user's message (everything after "add" and before "to my journal", or the substantive content)
2. If the content is brief (a sentence or two), insert it directly as a bullet or paragraph under `## General stuff`
3. If the content has a clear topic, add it with a `###` sub-heading
4. If the content is a task, format it as an Obsidian task under `## Tasks for the day`

### Quick Add Examples

| User Says | Action |
|-----------|--------|
| "Add smoke alarm note to my journal" | → Insert under `## General stuff` with `### Smoke alarm` heading |
| "Add a task to call the dentist to my journal" | → Insert as `- [ ] Call the dentist` under `## Tasks for the day` |
| "Add to my journal: had a great meeting with Shannon about dataspaces" | → Insert under `## General stuff` as a note |
| "Add a note to my journal about the new server setup" | → Ask user for the note content, then insert under `## General stuff` |

## Guided Update Pattern

When the user says:
- "Update my daily journal" (no specific content)
- "Update my journal" (generic)

Ask which section to update (use AskUserQuestion tool):

| Section | Heading in Journal | What Goes Here |
|---------|-------------------|----------------|
| **Reflections** | `> [!note]+ # Reflections on the day` | Personal reflections, thoughts, feelings about the day |
| **Summary** | `> [!summary]+ # Summary of the day` | Brief summary of key events and outcomes |
| **Tasks** | `## Tasks for the day` | Specific tasks with Obsidian Tasks format |
| **General** | `## General stuff` | Any notes, observations, learnings, ad-hoc entries |

## Step 1: Locate the Journal

```bash
VAULT="/mnt/c/Users/kheer/Dropbox/PKM"
DATE="YYYY-MM-DD"  # replace with target date
JOURNAL="${VAULT}/journals/${DATE}.md"
```

If journal doesn't exist, invoke the **Create** workflow first, then continue.

## Step 2: Read Current Journal Content

Read the full journal file to understand current state.

## Step 3: Determine Mode (Quick Add vs Guided)

| Signal | Mode | Action |
|--------|------|--------|
| User message contains specific content | **Quick Add** | Extract content, default to "general", insert immediately |
| User message is generic ("update my journal") | **Guided** | Ask which section, then ask for content |
| Content looks like a task (has action verbs, mentions doing something) | **Quick Add → Tasks** | Format as Obsidian task, insert under "Tasks for the day" |

## Step 4: Format Content for Section

### Reflections Format
```markdown
> [!note]+ # Reflections on the day 
> [User's reflection content here]
```

### Summary Format
```markdown
> [!summary]+ # Summary of the day
> [User's summary content here]
```

### Tasks Format
Use Obsidian Tasks plugin format:
```markdown
- [ ] Task description #tag 🛫 YYYY-MM-DD 📅 YYYY-MM-DD 🔼
```

Priority markers:
| Symbol | Meaning |
|--------|---------|
| 🔺 | Highest |
| ⏫ | High |
| 🔼 | Medium |
| 🔽 | Low |
| ⏬ | Lowest |

### General Stuff Format
```markdown
### [Sub-heading if appropriate]
[Content in markdown]
```

## Step 5: Insert Content

Find the target section heading and insert content:

1. **Reflections/Summary:** Replace the empty callout with one containing the content
2. **Tasks for the day:** Append task items after the `## Tasks for the day` heading
3. **General stuff:** Append under `## General stuff` heading. If footer (`# Today's Files`) exists, insert ABOVE it.

**CRITICAL:** Do NOT overwrite existing content. Always APPEND to the section.

## Step 6: Ensure Structural Integrity

After update, verify:
- [ ] No sections were accidentally deleted or moved
- [ ] The canonical section order is preserved
- [ ] If footer exists, it remains at the bottom

## Step 7: Confirm

Report to user what was added and where. Keep confirmation brief for Quick Add mode.

## Done

Journal updated with new content in the specified section.
