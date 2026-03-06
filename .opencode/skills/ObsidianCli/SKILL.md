---
name: ObsidianCli
description: "Obsidian vault management via official Obsidian CLI and notesmd-cli fallback. USE WHEN obsidian cli, vault command, obsidian command, create note cli, search vault cli, daily note cli, manage tasks cli, manage properties cli, obsidian automation, obsidian scripting."
---

# ObsidianCli

Command-line interface for Obsidian vault management. Uses the **official Obsidian CLI** (requires Obsidian 1.12+ running) as primary, with **notesmd-cli** as headless fallback.

## Tool Selection

| Tool | When | Requirement |
|------|------|-------------|
| **`obsidian`** (Official) | **1st preference always** | Obsidian 1.12+ running, CLI enabled in Settings → General |
| **`notesmd-cli`** (Fallback) | Obsidian not running, headless, or official CLI unavailable | Binary at `~/.local/bin/notesmd-cli` |
| **Direct file ops** | Last resort — simple reads/writes | Vault path known |

**Detection:** Run `obsidian version` first. If it fails, fall back to `notesmd-cli print-default`.

## Vault Configuration

**PKM Vault Path:** `/mnt/c/Users/kheer/Dropbox/PKM`

**Official CLI vault targeting:**
```bash
obsidian vault=PKM <command>
```

**notesmd-cli vault targeting:**
```bash
notesmd-cli <command> --vault PKM
```

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **CreateNote** | "create note", "new note", "make note" | `Workflows/CreateNote.md` |
| **ReadNote** | "read note", "show note", "print note" | `Workflows/ReadNote.md` |
| **SearchVault** | "search vault", "find in vault", "search notes" | `Workflows/SearchVault.md` |
| **DailyNote** | "daily note", "today's note", "append to daily" | `Workflows/DailyNote.md` |
| **ManageProperties** | "set property", "frontmatter", "metadata" | `Workflows/ManageProperties.md` |
| **ManageTasks** | "list tasks", "toggle task", "show todos" | `Workflows/ManageTasks.md` |
| **VaultInfo** | "vault info", "list files", "vault stats" | `Workflows/VaultInfo.md` |

## Quick Reference

**Official CLI patterns:**
```bash
# Create note with content and template
obsidian create name="Note Title" content="Body text" template=TemplateName open

# Read a note
obsidian read file="Note Name"

# Search with context
obsidian search:context query="search term" format=json

# Daily note operations
obsidian daily
obsidian daily:append content="- [ ] New task"

# Properties
obsidian property:set name=status value=done file="Note Name"

# Tasks
obsidian tasks todo
obsidian task file="Note Name" line=8 toggle

# Tags
obsidian tags counts
obsidian tag name=project verbose
```

**notesmd-cli fallback patterns:**
```bash
notesmd-cli create "Note Title" --content "Body"
notesmd-cli print "Note Name"
notesmd-cli search-content "query"
notesmd-cli daily
notesmd-cli frontmatter "Note" --edit --key status --value done
```

**Full command reference:** `ObsidianSearch('obsidiancli commands')` → loads CommandReference.md
