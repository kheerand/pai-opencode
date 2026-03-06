# SearchVault Workflow

Search Obsidian vaults for notes, content, tags, and links.

## Steps

### 1. Choose search type

| Search Type | Official CLI Command | Use When |
|-------------|---------------------|----------|
| **Text search** | `obsidian search query="<term>"` | Find files containing text |
| **Context search** | `obsidian search:context query="<term>"` | Find text with surrounding lines |
| **Tag search** | `obsidian tag name=<tag> verbose` | Find files by tag |
| **Backlink search** | `obsidian backlinks file="<name>" counts` | Find what links to a note |
| **Orphan search** | `obsidian orphans` | Find unlinked notes |
| **Unresolved links** | `obsidian unresolved verbose` | Find broken links |

### 2. Execute search

**Official CLI (preferred):**
```bash
# Full-text search
obsidian vault=PKM search query="<term>" format=json

# Search with context (grep-style output)
obsidian vault=PKM search:context query="<term>" format=json

# Limit results
obsidian vault=PKM search query="<term>" limit=10

# Search within folder
obsidian vault=PKM search query="<term>" path=Cards

# Case-sensitive search
obsidian vault=PKM search query="<term>" case

# Count matches only
obsidian vault=PKM search query="<term>" total

# Open search view in Obsidian
obsidian vault=PKM search:open query="<term>"
```

**notesmd-cli fallback:**
```bash
# Content search
notesmd-cli search-content "<term>" --vault PKM

# Fuzzy title search (interactive)
notesmd-cli search --vault PKM
```

**Direct file ops (rg):**
```bash
rg -i "<pattern>" /mnt/c/Users/kheer/Dropbox/PKM --type md
rg "tags:.*#<tag>" /mnt/c/Users/kheer/Dropbox/PKM --type md
```

### 3. Tag operations

**Official CLI:**
```bash
# List all tags with counts
obsidian vault=PKM tags counts sort=count

# Get tag details
obsidian vault=PKM tag name=<tagname> verbose

# Tags for specific file
obsidian vault=PKM tags file="<name>"

# Export as JSON
obsidian vault=PKM tags counts format=json
```

### 4. Link analysis

**Official CLI:**
```bash
# Backlinks to a file
obsidian vault=PKM backlinks file="<name>" counts format=json

# Outgoing links from a file
obsidian vault=PKM links file="<name>"

# Orphan files (no incoming links)
obsidian vault=PKM orphans

# Dead-end files (no outgoing links)
obsidian vault=PKM deadends

# Unresolved/broken links
obsidian vault=PKM unresolved verbose format=json
```
