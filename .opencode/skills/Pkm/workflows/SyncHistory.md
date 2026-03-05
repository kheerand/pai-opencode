# SyncHistory Workflow

Sync PAI history captures to Obsidian PKM.

## Triggers
- "sync to PKM"
- "save to obsidian"
- "sync this session"
- "update my PKM"

## Steps

### 1. Identify Capture Type

Determine what type of capture to sync:
- **SESSION** - Current or recent session summary
- **LEARNING** - Problem-solving narrative or lesson learned
- **RESEARCH** - Investigation results
- **DECISION** - Architectural or design decision

### 2. Locate Source File

Find the history capture file:

```bash
# List recent captures
ls -lt ${PAI_DIR}/history/sessions/$(date +%Y-%m)/ | head -5

# Or for specific types
ls -lt ${PAI_DIR}/history/learnings/$(date +%Y-%m)/ | head -5
```

### 3. Execute Sync

Run the pkm-sync capture command:

```bash
bun ${PAI_DIR}/tools/pkm-sync.ts capture <TYPE> <FILE_PATH>
```

**Type mappings:**
| Type | Destination |
|------|-------------|
| SESSION | Appends to daily journal at `journals/YYYY/MM/YYYY-MM-DD.md` |
| LEARNING | Creates zettel in `Cards/Zettels/` |
| RESEARCH | Creates note in `Spaces/Research/` |
| DECISION | Creates note in `Atlas/Topics/` |

### 4. Confirm Success

Report the result:
- Path to created/updated note
- Summary of what was synced
- Obsidian link format: `[[path/to/note|Title]]`

## Manual Sync Example

```bash
# Sync today's session
bun ${PAI_DIR}/tools/pkm-sync.ts capture SESSION \
  ${PAI_DIR}/history/sessions/2024-12/2024-12-18-120000_session.md

# Sync a learning
bun ${PAI_DIR}/tools/pkm-sync.ts capture LEARNING \
  ${PAI_DIR}/history/learnings/2024-12/2024-12-18_debugging-lesson.md
```

## Auto-Sync

The Stop hook automatically triggers this workflow when:
1. A session ends with a history capture
2. The capture type is identified from frontmatter
3. pkm-sync is called with appropriate type

No manual intervention needed for routine syncs.
