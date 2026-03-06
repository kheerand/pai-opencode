# DailyNote Workflow

Create, read, and append to daily notes via CLI.

## Steps

### 1. Open or create daily note

**Official CLI (preferred):**
```bash
# Open today's daily note (creates if needed)
obsidian vault=PKM daily

# Open in specific pane
obsidian vault=PKM daily paneType=tab
```

### 2. Read daily note

**Official CLI:**
```bash
# Read daily note content
obsidian vault=PKM daily:read

# Get daily note path
obsidian vault=PKM daily:path
```

### 3. Append to daily note

**Official CLI:**
```bash
# Append a line
obsidian vault=PKM daily:append content="- [ ] Buy groceries"

# Append without newline (inline)
obsidian vault=PKM daily:append content=" continued text" inline

# Append and open
obsidian vault=PKM daily:append content="## Meeting Notes\n- Point 1\n- Point 2" open

# Prepend content (after frontmatter)
obsidian vault=PKM daily:prepend content="## Morning Priorities\n- [ ] First task"
```

### 4. Daily note tasks

**Official CLI:**
```bash
# List tasks from daily note
obsidian vault=PKM tasks daily

# List incomplete tasks from daily
obsidian vault=PKM tasks daily todo

# Count daily tasks
obsidian vault=PKM tasks daily total

# Toggle a task in daily note
obsidian vault=PKM task daily line=3 toggle

# Mark daily task done
obsidian vault=PKM task daily line=5 done
```

### 5. notesmd-cli fallback

```bash
# Open daily note
notesmd-cli daily --vault PKM

# Note: notesmd-cli daily respects .obsidian/daily-notes.json settings
```

## Common Patterns

**Morning routine:**
```bash
obsidian vault=PKM daily
obsidian vault=PKM daily:prepend content="## Morning Priorities\n- [ ] Priority 1\n- [ ] Priority 2\n- [ ] Priority 3"
```

**Capture quick thought:**
```bash
obsidian vault=PKM daily:append content="- $(date '+%H:%M') Quick thought about something"
```

**End of day review:**
```bash
obsidian vault=PKM tasks daily
obsidian vault=PKM tasks daily todo
```
