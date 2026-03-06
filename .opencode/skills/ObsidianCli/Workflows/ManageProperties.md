# ManageProperties Workflow

Manage note properties (frontmatter/YAML) via CLI.

## Steps

### 1. Read properties

**Official CLI (preferred):**
```bash
# All properties for a file
obsidian vault=PKM properties file="<name>" format=yaml

# As JSON
obsidian vault=PKM properties file="<name>" format=json

# Specific property value
obsidian vault=PKM property:read name=<propname> file="<name>"

# All properties in vault with counts
obsidian vault=PKM properties counts sort=count

# Count of specific property usage
obsidian vault=PKM properties name=<propname>
```

### 2. Set properties

**Official CLI:**
```bash
# Set text property
obsidian vault=PKM property:set name=status value=done file="<name>"

# Set with type
obsidian vault=PKM property:set name=priority value=3 type=number file="<name>"

# Set date property
obsidian vault=PKM property:set name=due value="2026-03-15" type=date file="<name>"

# Set checkbox
obsidian vault=PKM property:set name=reviewed value=true type=checkbox file="<name>"

# Set list property
obsidian vault=PKM property:set name=tags value="concept, programming" type=list file="<name>"
```

### 3. Remove properties

**Official CLI:**
```bash
obsidian vault=PKM property:remove name=<propname> file="<name>"
```

### 4. Manage aliases

**Official CLI:**
```bash
# List aliases for file
obsidian vault=PKM aliases file="<name>"

# List all aliases in vault
obsidian vault=PKM aliases verbose
```

### 5. notesmd-cli fallback

```bash
# Print frontmatter
notesmd-cli frontmatter "<name>" --print --vault PKM

# Edit frontmatter
notesmd-cli frontmatter "<name>" --edit --key status --value done --vault PKM

# Delete frontmatter key
notesmd-cli frontmatter "<name>" --delete --key draft --vault PKM
```

## Property Types

| Type | Example Value | CLI Type Flag |
|------|--------------|---------------|
| Text | `"in-progress"` | `type=text` |
| Number | `42` | `type=number` |
| Checkbox | `true`/`false` | `type=checkbox` |
| Date | `"2026-03-06"` | `type=date` |
| DateTime | `"2026-03-06T14:30"` | `type=datetime` |
| List | `"tag1, tag2"` | `type=list` |
