---
name: Pkm
description: Personal Knowledge Management with Obsidian vault integration. Create notes with Templater prefixes, search vault, sync PAI history, query Dataview, manage Excalidraw diagrams. USE WHEN user says 'create note', 'search my notes', 'add to obsidian', 'sync to PKM', 'new zettel', 'fleeting note', 'literature note', 'meeting note', 'person note', or needs Obsidian interaction.
---

# Pkm

Bidirectional integration between PAI and your Obsidian PKM vault with full plugin support.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **CreateNote** | "create note", "new zettel", "fleeting note" | `workflows/CreateNote.md` |
| **SearchNotes** | "search my notes", "find in PKM" | `workflows/SearchNotes.md` |
| **SyncHistory** | "sync to PKM", "save to obsidian" | `workflows/SyncHistory.md` |
| **QueryGraph** | "backlinks", "connections" | `workflows/QueryGraph.md` |
| **Dataview** | "dataview query", "list notes where" | `workflows/Dataview.md` |
| **Excalidraw** | "create diagram", "new drawing" | `workflows/Excalidraw.md` |

## PKM Configuration

**Vault Location:** `/mnt/c/Users/kheer/Dropbox/PKM`

**DEFAULT LOCATION: `Cards/`** - All notes go here unless specifically related to another folder.

**ACE Structure:**
| Folder | Purpose | When to Use |
|--------|---------|-------------|
| `Cards/` | **DEFAULT** - All notes, zettels, diagrams | Always, unless specific to another folder |
| `Atlas/` | MOCs, Topics, indexes | Topic overviews, maps of content |
| `Sources/` | Books, articles, references | Literature notes about specific sources |
| `Databases/` | People, organizations | Person/org-specific notes only |
| `Extras/assets/` | **Attachments only** | Images, PDFs, non-note files |
| `Extras/templates/` | Templates | Templater templates |
| `Extras/configs/` | Configs | Plugin configurations |
| `Spaces/Research/` | Research notes | Research notes, research reports |

**Key Rule:** Excalidraw diagrams are first-class notes, NOT attachments. Store in `Cards/`.

## Templater Auto-Prefix System

**Create notes with filename prefixes for automatic templating:**

| Prefix | Template | Use Case |
|--------|----------|----------|
| `FN - ...` | Fleeting note | Quick captures, ideas |
| `LN - ...` | Literature note | Book/article notes |
| `RN - ...` | Research note | Research notes, research reports |
| `Z - ...` | Zettel | Atomic concepts |
| `P - ...` | Person | Contact/person info |
| `M - ...` | Meeting notes | Meeting records |

**Example:**
```bash
# Creates fleeting note with auto-template
touch "/mnt/c/Users/kheer/Dropbox/PKM/Cards/FN Quick idea about API design.md"
```

## Installed Plugins

### Core Plugins Used
| Plugin | Purpose | Skill Integration |
|--------|---------|-------------------|
| **Templater** | Auto-templates via prefix | CreateNote workflow |
| **Dataview** | Query vault as database | Dataview workflow |
| **Excalidraw** | Visual diagrams | Excalidraw workflow |
| **Copilot** | AI chat with vault | N/A (use directly) |
| **Tasks** | Task tracking | SearchNotes finds tasks |
| **Kanban** | Board views | Create in Cards/ |
| **PDF++** | PDF annotation | Link in notes |
| **Tag Wrangler** | Tag management | SearchNotes queries |

### Navigation Plugins
| Plugin | Hotkey | Purpose |
|--------|--------|---------|
| **Spacekeys** | `Ctrl+Shift+Space` | Spacemacs-style leader keys |
| **Tab Switcher** | `Ctrl+Tab` | MRU tab cycling |
| **Hover Editor** | Hover + `Ctrl` | Popup editing |
| **Recent Files** | In sidebar | Quick access |

## Examples

**Example 1: Create a fleeting note**
```
User: "Create a fleeting note about API rate limiting"
→ Invokes CreateNote workflow
→ Creates: FN API rate limiting.md in Cards/
→ Templater auto-applies fleeting note template
→ Returns Obsidian link
```

**Example 2: Search for related notes**
```
User: "Search my notes for TypeScript patterns"
→ Invokes SearchNotes workflow
→ Greps vault for "TypeScript patterns"
→ Returns matches with snippets and paths
```

**Example 3: Run a Dataview query**
```
User: "Show me all notes tagged #concept from this month"
→ Invokes Dataview workflow
→ Generates: LIST FROM #concept WHERE file.cday >= date(2024-12-01)
→ Explains how to use in Obsidian
```

**Example 4: Create an Excalidraw diagram**
```
User: "Create an architecture diagram for the auth system"
→ Invokes Excalidraw workflow
→ Creates new Obsidian-Excalidraw file with extension .md file in appropriate folder
→ Provides template with initial shapes
```

## Quick Reference

**Create notes by type:**
```bash
# Fleeting note
touch "PKM/Cards/FN - ${title}.md"

# Literature note
touch "PKM/Cards/LN - ${title}.md"

# Zettel
touch "PKM/Cards/Zettels/Z - ${title}.md"

# Person
touch "PKM/Databases/People/P - ${name}.md"

# Meeting
touch "PKM/Cards/M - ${meeting_title}.md"
```

**Search vault:**
```bash
rg -i "pattern" /mnt/c/Users/kheer/Dropbox/PKM --type md
```

**Find by tag:**
```bash
rg "tags:.*#tagname" /mnt/c/Users/kheer/Dropbox/PKM --type md
```
