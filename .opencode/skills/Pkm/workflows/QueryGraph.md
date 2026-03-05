# QueryGraph Workflow

Explore connections between notes in your PKM.

## Triggers
- "backlinks to"
- "what links to"
- "connections for"
- "related notes"
- "graph for"

## Steps

### 1. Identify Target Note

Get the note to query:
- Note title or partial name
- File path
- Topic keyword

### 2. Execute Graph Query

Run pkm-sync graph command:

```bash
bun ${PAI_DIR}/tools/pkm-sync.ts graph "note-name"
```

### 3. Present Results

**Output format:**
```
Graph for: Note Name

Forward links (N):
  → [[linked-note-1]]
  → [[linked-note-2]]

Backlinks (M):
  ← [[note-that-links-here]]
  ← [[another-linking-note]]
```

### 4. Offer Exploration

Suggest next steps:
- Read any of the connected notes
- Search for related topics
- Find orphan notes (no connections)

## Understanding the Graph

**Forward links:** Notes this note links TO
- Found by parsing `[[wiki-links]]` in the note content
- Shows what this note references

**Backlinks:** Notes that link TO this note
- Found by searching vault for `[[note-name]]`
- Shows what references this note

## Examples

```bash
# Find connections for a topic
bun ${PAI_DIR}/tools/pkm-sync.ts graph "typescript"

# Query a specific note
bun ${PAI_DIR}/tools/pkm-sync.ts graph "Cards/Zettels/api-design"

# Find what links to a concept
bun ${PAI_DIR}/tools/pkm-sync.ts graph "zettelkasten"
```

## Advanced Queries

**Find orphan notes (no backlinks):**
```bash
# Notes with no incoming links are harder to discover
# Consider adding them to a MOC or index
```

**Find hub notes (many connections):**
```bash
# Notes with many forward links often serve as indexes
# Good candidates for Atlas/Topics/
```

## Relationship to Obsidian

This workflow provides CLI access to graph data that Obsidian's Graph View shows visually. Use this when:
- You're in terminal and want quick connection info
- You need to script graph analysis
- You want to understand note relationships from PAI
