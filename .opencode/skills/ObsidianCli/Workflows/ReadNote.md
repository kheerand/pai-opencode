# ReadNote Workflow

Read note contents from Obsidian vaults via CLI.

## Steps

### 1. Read note content

**Official CLI (preferred):**
```bash
# Read by name (wikilink-style resolution)
obsidian vault=PKM read file="<note name>"

# Read by exact path
obsidian vault=PKM read path="Cards/<note name>.md"

# Read active file (if Obsidian is focused)
obsidian read

# Copy output to clipboard
obsidian vault=PKM read file="<note name>" --copy
```

**notesmd-cli fallback:**
```bash
notesmd-cli print "<note name>" --vault PKM
```

**Direct file ops:**
```bash
cat "/mnt/c/Users/kheer/Dropbox/PKM/Cards/<note name>.md"
```

### 2. Get file info

**Official CLI:**
```bash
# File metadata (path, size, created, modified)
obsidian vault=PKM file file="<note name>"

# Outline / headings
obsidian vault=PKM outline file="<note name>"
obsidian vault=PKM outline file="<note name>" format=json

# Word count
obsidian vault=PKM wordcount file="<note name>"

# Backlinks
obsidian vault=PKM backlinks file="<note name>" counts

# Outgoing links
obsidian vault=PKM links file="<note name>"
```

### 3. Read specific properties

**Official CLI:**
```bash
# All properties
obsidian vault=PKM properties file="<note name>" format=yaml

# Specific property
obsidian vault=PKM property:read name=status file="<note name>"

# Tags for file
obsidian vault=PKM tags file="<note name>"

# Aliases
obsidian vault=PKM aliases file="<note name>"
```
