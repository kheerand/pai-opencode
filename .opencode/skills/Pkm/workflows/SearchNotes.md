# SearchNotes Workflow

Search your Obsidian PKM vault from PAI.

## Triggers
- "search my notes"
- "find in PKM"
- "look up in my knowledge base"
- "check my notes for"

## Steps

### 1. Clarify Search Query

If the query is vague, ask for:
- Specific keywords or phrases
- Topic area (if known)
- Time frame (recent vs all time)

### 2. Execute Search

Run the pkm-sync search command:

```bash
bun ${PAI_DIR}/tools/pkm-sync.ts search "your query here"
```

**Search capabilities:**
- Case-insensitive full-text search
- Searches all `.md` files in vault
- Excludes hidden folders (`.obsidian`, `.trash`, etc.)
- Returns up to 20 results

### 3. Present Results

Format results as Obsidian-compatible links:

```
Found N matching notes:

- [[path/to/note|Title]]
  ...snippet with context around match...

- [[another/note|Another Title]]
  ...relevant snippet...
```

### 4. Offer Follow-up Actions

After presenting results:
- Read a specific note in detail
- Narrow the search with additional terms
- Create a new note if nothing matches

## Search Tips

**For better results:**
- Use specific terms rather than common words
- Search for unique phrases from memory
- Try variations: "typescript", "TypeScript", "TS"

**Folder-specific searches** (advanced):
```bash
# Search only in Cards
grep -r -l -i "query" /mnt/c/Users/kheer/Dropbox/PKM/Cards --include="*.md"

# Search only in Sources
grep -r -l -i "query" /mnt/c/Users/kheer/Dropbox/PKM/Sources --include="*.md"
```

## Examples

```bash
# Search for AI-related notes
bun ${PAI_DIR}/tools/pkm-sync.ts search "artificial intelligence"

# Search for project notes
bun ${PAI_DIR}/tools/pkm-sync.ts search "FAIR4VRE"

# Search for a concept
bun ${PAI_DIR}/tools/pkm-sync.ts search "zettelkasten method"
```
