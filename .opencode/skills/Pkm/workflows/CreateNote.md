# CreateNote Workflow

Create notes in your Obsidian PKM vault with automatic Templater templating.

## Triggers
- "create note", "new note"
- "fleeting note", "quick note"
- "literature note", "book note"
- "zettel", "concept note"
- "person note", "contact"
- "meeting note"

## Templater Prefix System

Your vault uses filename prefixes to auto-apply templates:

| Prefix | Template Applied | Default Location |
|--------|-----------------|------------------|
| `FN ` | `Notes - Fleeting note.md` | `Cards/Fleeting notes` |
| `LN ` | `Notes - Literature notes.md` | `Cards/` |
| `Z ` | `Notes - Zettel.md` | `Cards/Zettels/` |
| `P ` | `Notes - Person.md` | `Databases/People/` |
| `M ` | `Meeting - notes.md` | `journals/Meetings` |

## Steps

### 1. Determine Note Type

**DEFAULT: All notes go to `Cards/`** unless specifically related to another folder.

Ask user or infer from context:

| User Says | Note Type | Prefix | Location |
|-----------|-----------|--------|----------|
| "quick thought", "capture this" | Fleeting | `FN ` | `Cards/Fleeting notes` |
| "from this book/article" | Literature | `LN ` | `Cards/` |
| "concept", "idea", "atomic" | Zettel | `Z ` | `Cards/` |
| "about [person name]" | Person | `P ` | `Databases/People/` |
| "meeting with", "notes from call" | Meeting | `M ` | `journals/Meetings` |
| "diagram", "drawing" | Excalidraw | none | `Cards/` |
| No specific type | Plain note | none | `Cards/` |

### 2. Build the File Path

```bash
VAULT="/mnt/c/Users/kheer/Dropbox/PKM"

# DEFAULT: Cards/ for everything
FILE="${VAULT}/Cards/${title}.md"

# Fleeting note (with prefix for Templater)
FILE="${VAULT}/Cards/Fleeting notes/FN ${title}.md"

# Literature note
FILE="${VAULT}/Cards/LN ${title}.md"

# Zettel
FILE="${VAULT}/Cards/Zettels/Z ${title}.md"

# Meeting
FILE="${VAULT}/journals/Meetings/M ${title}.md"

# Excalidraw diagram (first-class note, NOT in assets)
FILE="${VAULT}/Cards/${title}.excalidraw.md"

# ONLY use other folders when specifically relevant:
# Person → Databases/People/
FILE="${VAULT}/Databases/People/P ${name}.md"
```

### 3. Create the Note

**Method A: Empty file (Templater fills on open)**
```bash
touch "${FILE}"
```

**Method B: With initial content (bypasses Templater)**
Use the Write tool to create with content:

```markdown
---
type:
id: 'YYYYMMDDHHmmss'
aliases:
related:
parent:
children:
created: 2024-12-21
source: PAI
tags: []
---

# Title

Initial content...
```

### 4. Return Information

Provide:
- Full file path
- Obsidian URI: `obsidian://open?vault=PKM&file=path/to/note`
- Reminder that Templater will apply template when opened

## Examples

**Fleeting Note:**
```bash
touch "/mnt/c/Users/kheer/Dropbox/PKM/Cards/Fleeting notes/FN Quick thought about caching strategies.md"
```

**Literature Note:**
```bash
touch "/mnt/c/Users/kheer/Dropbox/PKM/Cards/LN Clean Code by Robert Martin.md"
```

**Zettel:**
```bash
touch "/mnt/c/Users/kheer/Dropbox/PKM/Cards/Zettels/Z Separation of concerns principle.md"
```

**Person:**
```bash
touch "/mnt/c/Users/kheer/Dropbox/PKM/Databases/People/P John Smith.md"
```

**Meeting:**
```bash
touch "/mnt/c/Users/kheer/Dropbox/PKM/journals/Meetings/M Weekly standup 2024-12-21.md"
```

## Template Reference

Templates are in `Extras/templates/`:

| Template | Key Fields |
|----------|------------|
| `Notes - Fleeting note.md` | id, type, related, created, source |
| `Notes - Literature notes.md` | id, type, created, author, source |
| `Notes - Zettel.md` | id, type, parent, related, created, source, related |
| `Notes - Person.md` | id, type, name, role, workedAt, contact |
| `Meeting - notes.md` | id, type, date, attendees, agenda, action items |

## Obsidian URI Scheme

To open the note directly:
```
obsidian://open?vault=PKM&file=Cards/FN%20My%20note.md
```

To create and open:
```
obsidian://new?vault=PKM&file=Cards/FN%20My%20note.md
```
