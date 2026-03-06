# CreateNote Workflow

Create notes in Obsidian vaults via CLI.

## Steps

### 1. Detect available CLI

```bash
obsidian version 2>/dev/null && echo "OFFICIAL" || (notesmd-cli --version 2>/dev/null && echo "NOTESMD" || echo "DIRECT")
```

### 2. Create the note

**Official CLI (preferred):**
```bash
# Basic creation
obsidian vault=PKM create name="<title>" content="<body>"

# With template (respects Obsidian template settings)
obsidian vault=PKM create name="<title>" template=<TemplateName> open

# With content and open in Obsidian
obsidian vault=PKM create name="<title>" content="<body>" open

# Overwrite existing
obsidian vault=PKM create name="<title>" content="<body>" overwrite

# Create at specific path
obsidian vault=PKM create path="Cards/<title>.md" content="<body>"
```

**notesmd-cli fallback:**
```bash
# Basic creation
notesmd-cli create "<title>" --content "<body>" --vault PKM

# Create and open
notesmd-cli create "<title>" --content "<body>" --open --vault PKM

# Append to existing
notesmd-cli create "<title>" --content "<body>" --append --vault PKM
```

**Direct file ops (last resort):**
```bash
# Use PAI's Pkm skill prefix system for auto-templating
# FN = Fleeting, LN = Literature, Z = Zettel, P = Person, M = Meeting
cat > "/mnt/c/Users/kheer/Dropbox/PKM/Cards/FN - <title>.md" << 'EOF'
---
type: fleeting
created: <date>
tags: []
---

<content>
EOF
```

### 3. Verify creation

**Official CLI:**
```bash
obsidian vault=PKM read file="<title>"
```

**notesmd-cli:**
```bash
notesmd-cli print "<title>" --vault PKM
```

## PKM Note Prefix Convention

When creating notes for the PKM vault, apply the Templater auto-prefix system:

| Prefix | Type | Example |
|--------|------|---------|
| `FN - ` | Fleeting note | `FN - Quick idea about APIs` |
| `LN - ` | Literature note | `LN - Designing Data-Intensive Apps` |
| `RN - ` | Research note | `RN - LLM Agent Patterns` |
| `Z - ` | Zettel | `Z - Separation of Concerns` |
| `P - ` | Person | `P - John Smith` |
| `M - ` | Meeting | `M - Weekly Standup 2026-03-06` |

## Folder Routing

| Note Type | Folder |
|-----------|--------|
| Default / Cards | `Cards/` |
| Zettels | `Cards/Zettels/` |
| People | `Databases/People/` |
| Sources | `Sources/` |
| MOCs | `Atlas/` |
| Research | `Spaces/Research/` |
