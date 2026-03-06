# Obsidian CLI Command Reference

Complete command reference for the official Obsidian CLI (v1.12+).

**Source:** https://help.obsidian.md/cli

## Prerequisites

- Obsidian 1.12+ installer
- CLI enabled: Settings → General → Command line interface
- Obsidian must be running (or first command launches it)

## Command Syntax

```bash
obsidian [vault=<name>] <command> [parameters] [flags]
```

- **Parameters** take values: `name=value` or `name="value with spaces"`
- **Flags** are boolean switches: `open`, `overwrite`, `verbose`
- **Multiline content:** use `\n` for newline, `\t` for tab
- **`--copy`** flag copies output to clipboard on any command
- **`file=<name>`** resolves like wikilinks (name only, no path/extension needed)
- **`path=<path>`** requires exact path from vault root

## Command Categories

### Files & Folders
| Command | Description |
|---------|-------------|
| `create` | Create/overwrite file (name, path, content, template, overwrite, open, newtab) |
| `read` | Read file contents (file, path) |
| `append` | Append content to file (file, path, content, inline) |
| `prepend` | Prepend after frontmatter (file, path, content, inline) |
| `open` | Open file in Obsidian (file, path, newtab) |
| `move` | Move/rename file, updates links (file, path, to) |
| `rename` | Rename file (file, path, name) |
| `delete` | Delete file to trash (file, path, permanent) |
| `file` | Show file info (file, path) |
| `files` | List files (folder, ext, total) |
| `folder` | Show folder info (path, info=files\|folders\|size) |
| `folders` | List folders (folder, total) |

### Daily Notes
| Command | Description |
|---------|-------------|
| `daily` | Open daily note (paneType) |
| `daily:path` | Get daily note path |
| `daily:read` | Read daily note contents |
| `daily:append` | Append to daily (content, inline, open) |
| `daily:prepend` | Prepend to daily (content, inline, open) |

### Search
| Command | Description |
|---------|-------------|
| `search` | Search vault (query, path, limit, format, total, case) |
| `search:context` | Search with line context (query, path, limit, format, case) |
| `search:open` | Open search view in Obsidian (query) |

### Properties
| Command | Description |
|---------|-------------|
| `properties` | List properties (file, path, name, sort, format, total, counts, active) |
| `property:set` | Set property (name, value, type, file, path) |
| `property:remove` | Remove property (name, file, path) |
| `property:read` | Read property value (name, file, path) |

### Tags
| Command | Description |
|---------|-------------|
| `tags` | List tags (file, path, sort, total, counts, format, active) |
| `tag` | Tag info (name, total, verbose) |

### Tasks
| Command | Description |
|---------|-------------|
| `tasks` | List tasks (file, path, status, total, done, todo, verbose, format, active, daily) |
| `task` | Show/update task (ref, file, path, line, status, toggle, daily, done, todo) |

### Links
| Command | Description |
|---------|-------------|
| `backlinks` | List backlinks (file, path, counts, total, format) |
| `links` | List outgoing links (file, path, total) |
| `unresolved` | Unresolved links (total, counts, verbose, format) |
| `orphans` | Files with no incoming links (total) |
| `deadends` | Files with no outgoing links (total) |

### Templates
| Command | Description |
|---------|-------------|
| `templates` | List templates (total) |
| `template:read` | Read template (name, title, resolve) |
| `template:insert` | Insert into active file (name) |

### Bases
| Command | Description |
|---------|-------------|
| `bases` | List .base files |
| `base:views` | List views in base |
| `base:create` | Create base item (file, path, view, name, content, open, newtab) |
| `base:query` | Query base (file, path, view, format=json\|csv\|tsv\|md\|paths) |

### Bookmarks
| Command | Description |
|---------|-------------|
| `bookmarks` | List bookmarks (total, verbose, format) |
| `bookmark` | Add bookmark (file, subpath, folder, search, url, title) |

### Commands & Hotkeys
| Command | Description |
|---------|-------------|
| `commands` | List command IDs (filter) |
| `command` | Execute command (id) |
| `hotkeys` | List hotkeys (total, verbose, format) |
| `hotkey` | Get hotkey for command (id, verbose) |

### Plugins
| Command | Description |
|---------|-------------|
| `plugins` | List installed (filter, versions, format) |
| `plugins:enabled` | List enabled (filter, versions, format) |
| `plugin` | Plugin info (id) |
| `plugin:enable` | Enable plugin (id, filter) |
| `plugin:disable` | Disable plugin (id, filter) |
| `plugin:install` | Install community plugin (id, enable) |
| `plugin:uninstall` | Uninstall plugin (id) |
| `plugin:reload` | Reload plugin for dev (id) |

### Workspaces
| Command | Description |
|---------|-------------|
| `workspace` | Show workspace tree (ids) |
| `workspaces` | List workspaces (total) |
| `workspace:save` | Save layout (name) |
| `workspace:load` | Load workspace (name) |
| `workspace:delete` | Delete workspace (name) |
| `tabs` | List open tabs (ids) |
| `tab:open` | Open new tab (group, file, view) |
| `recents` | Recently opened files (total) |

### Sync
| Command | Description |
|---------|-------------|
| `sync` | Pause/resume (on, off) |
| `sync:status` | Show status and usage |
| `sync:history` | Version history (file, path, total) |
| `sync:read` | Read sync version (file, path, version) |
| `sync:restore` | Restore sync version (file, path, version) |
| `sync:deleted` | List deleted files (total) |

### File History
| Command | Description |
|---------|-------------|
| `diff` | Compare versions (file, path, from, to, filter) |
| `history` | Local history versions (file, path) |
| `history:list` | All files with history |
| `history:read` | Read history version (file, path, version) |
| `history:restore` | Restore version (file, path, version) |

### Publish
| Command | Description |
|---------|-------------|
| `publish:site` | Show site info |
| `publish:list` | List published files (total) |
| `publish:status` | List changes (total, new, changed, deleted) |
| `publish:add` | Publish file (file, path, changed) |
| `publish:remove` | Unpublish file (file, path) |
| `publish:open` | Open on published site (file, path) |

### Developer
| Command | Description |
|---------|-------------|
| `devtools` | Toggle dev tools |
| `dev:debug` | Attach/detach debugger (on, off) |
| `dev:screenshot` | Take screenshot (path) |
| `dev:console` | Console messages (limit, level, clear) |
| `dev:errors` | JS errors (clear) |
| `dev:css` | Inspect CSS (selector, prop) |
| `dev:dom` | Query DOM (selector, attr, css, total, text, inner, all) |
| `dev:mobile` | Toggle mobile emulation (on, off) |
| `eval` | Execute JavaScript (code) |

### Misc
| Command | Description |
|---------|-------------|
| `help` | Show help (command) |
| `version` | Show version |
| `reload` | Reload app |
| `restart` | Restart app |
| `random` | Open random note (folder, newtab) |
| `random:read` | Read random note (folder) |
| `outline` | File headings (file, path, format, total) |
| `wordcount` | Word/char count (file, path, words, characters) |
| `aliases` | List aliases (file, path, total, verbose, active) |
| `web` | Open URL in viewer (url, newtab) |
| `unique` | Create unique note (name, content, paneType, open) |

## Output Formats

Many commands support `format=` parameter:
- `json` — Machine-readable JSON
- `tsv` — Tab-separated values
- `csv` — Comma-separated values
- `md` — Markdown table
- `text` — Plain text (default for most)
- `yaml` — YAML (properties)
- `tree` — Tree view (outline)
- `paths` — File paths only (base:query)
