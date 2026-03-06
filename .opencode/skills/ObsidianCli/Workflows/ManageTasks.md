# ManageTasks Workflow

List, filter, and toggle tasks across the vault via CLI.

## Steps

### 1. List tasks

**Official CLI (preferred):**
```bash
# All tasks in vault
obsidian vault=PKM tasks

# Incomplete tasks only
obsidian vault=PKM tasks todo

# Completed tasks only
obsidian vault=PKM tasks done

# Tasks in specific file
obsidian vault=PKM tasks file="<name>"

# Tasks from daily note
obsidian vault=PKM tasks daily

# Tasks with file paths and line numbers
obsidian vault=PKM tasks verbose

# Count tasks
obsidian vault=PKM tasks total

# Export as JSON
obsidian vault=PKM tasks format=json

# Filter by custom status
obsidian vault=PKM tasks 'status=?'
```

### 2. Show/update individual task

**Official CLI:**
```bash
# Show task info
obsidian vault=PKM task file="<name>" line=<n>
obsidian vault=PKM task ref="<path>:<line>"

# Toggle task (done ↔ todo)
obsidian vault=PKM task file="<name>" line=<n> toggle

# Mark as done
obsidian vault=PKM task file="<name>" line=<n> done

# Mark as todo
obsidian vault=PKM task file="<name>" line=<n> todo

# Set custom status
obsidian vault=PKM task file="<name>" line=<n> status=-

# Toggle daily note task
obsidian vault=PKM task daily line=<n> toggle
```

### 3. Common task patterns

**Review all open tasks:**
```bash
obsidian vault=PKM tasks todo verbose format=json
```

**Daily task management:**
```bash
# See today's tasks
obsidian vault=PKM tasks daily todo

# Add new task to daily
obsidian vault=PKM daily:append content="- [ ] New task item"

# Complete a daily task
obsidian vault=PKM task daily line=5 done
```

**Task counts for reporting:**
```bash
# Total tasks
obsidian vault=PKM tasks total

# Open tasks count
obsidian vault=PKM tasks todo total

# Done tasks count
obsidian vault=PKM tasks done total
```
