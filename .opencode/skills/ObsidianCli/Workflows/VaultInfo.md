# VaultInfo Workflow

Get vault information, list files/folders, and manage vault structure via CLI.

## Steps

### 1. Vault overview

**Official CLI (preferred):**
```bash
# Vault info (name, path, file count, folder count, size)
obsidian vault=PKM vault

# Specific info only
obsidian vault=PKM vault info=name
obsidian vault=PKM vault info=path
obsidian vault=PKM vault info=files
obsidian vault=PKM vault info=size

# List all known vaults
obsidian vaults verbose
```

### 2. List files and folders

**Official CLI:**
```bash
# All files in vault
obsidian vault=PKM files

# Files in specific folder
obsidian vault=PKM files folder=Cards

# Filter by extension
obsidian vault=PKM files ext=md

# File count
obsidian vault=PKM files total

# All folders
obsidian vault=PKM folders

# Folders in specific parent
obsidian vault=PKM folders folder=Cards

# Folder count
obsidian vault=PKM folders total

# Folder details
obsidian vault=PKM folder path=Cards info=files
```

**notesmd-cli fallback:**
```bash
notesmd-cli list --vault PKM
notesmd-cli list "Cards" --vault PKM
```

### 3. File operations

**Official CLI:**
```bash
# Move/rename file (auto-updates links)
obsidian vault=PKM move file="<name>" to="NewFolder/<name>.md"

# Rename only
obsidian vault=PKM rename file="<name>" name="New Name"

# Delete (to trash)
obsidian vault=PKM delete file="<name>"

# Delete permanently
obsidian vault=PKM delete file="<name>" permanent

# Open file in Obsidian
obsidian vault=PKM open file="<name>"
obsidian vault=PKM open file="<name>" newtab
```

### 4. Templates

**Official CLI:**
```bash
# List available templates
obsidian vault=PKM templates

# Read template content
obsidian vault=PKM template:read name="<template>"

# Read with variables resolved
obsidian vault=PKM template:read name="<template>" title="My Note" resolve

# Insert template into active file
obsidian vault=PKM template:insert name="<template>"
```

### 5. Plugins and themes

**Official CLI:**
```bash
# List installed plugins
obsidian vault=PKM plugins versions

# List enabled plugins
obsidian vault=PKM plugins:enabled

# Enable/disable plugin
obsidian vault=PKM plugin:enable id=<plugin-id>
obsidian vault=PKM plugin:disable id=<plugin-id>

# Install community plugin
obsidian vault=PKM plugin:install id=<plugin-id> enable

# Reload plugin (dev)
obsidian vault=PKM plugin:reload id=<plugin-id>
```

### 6. Workspaces

**Official CLI:**
```bash
# List workspaces
obsidian vault=PKM workspaces

# Save current layout
obsidian vault=PKM workspace:save name="<workspace>"

# Load workspace
obsidian vault=PKM workspace:load name="<workspace>"

# List open tabs
obsidian vault=PKM tabs
```

### 7. Developer commands

**Official CLI:**
```bash
# Open devtools
obsidian devtools

# Run JavaScript in Obsidian
obsidian eval code="app.vault.getFiles().length"

# Take screenshot
obsidian dev:screenshot path=screenshot.png

# Console messages
obsidian dev:console limit=20

# JS errors
obsidian dev:errors
```
