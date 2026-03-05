# Dataview Workflow

Generate and explain Dataview queries for your Obsidian vault.

## Triggers
- "dataview query"
- "list notes where"
- "show me all notes"
- "find notes with tag"
- "query my vault"

## Dataview Query Types

### LIST - Simple Lists
```dataview
LIST
FROM #tag
WHERE file.cday >= date(2024-12-01)
SORT file.cday DESC
```

### TABLE - Structured Data
```dataview
TABLE author, rating, file.cday as "Created"
FROM "Sources/Books"
WHERE rating >= 4
SORT rating DESC
```

### TASK - Task Lists
```dataview
TASK
FROM "Cards"
WHERE !completed
GROUP BY file.link
```

### CALENDAR - Date Views
```dataview
CALENDAR file.cday
FROM "journals"
```

## Common Query Patterns

### Recent Notes
```dataview
LIST
FROM ""
WHERE file.cday >= date(today) - dur(7 days)
SORT file.cday DESC
LIMIT 20
```

### Notes by Tag
```dataview
LIST
FROM #concept OR #idea
SORT file.name ASC
```

### Notes Mentioning Topic
```dataview
LIST
FROM ""
WHERE contains(file.name, "TypeScript") OR contains(file.content, "TypeScript")
```

### Orphan Notes (No Links)
```dataview
LIST
FROM "Cards"
WHERE length(file.inlinks) = 0 AND length(file.outlinks) = 0
```

### Notes Modified Today
```dataview
LIST
FROM ""
WHERE file.mday = date(today)
```

### People by Organization
```dataview
TABLE role, organization, email
FROM "Databases/People"
WHERE organization = "Acme Corp"
SORT file.name ASC
```

### Incomplete Tasks by Priority
```dataview
TASK
FROM ""
WHERE !completed AND contains(text, "🔴")
GROUP BY file.link
```

### Meeting Notes This Week
```dataview
TABLE attendees, file.cday as "Date"
FROM "Cards"
WHERE startswith(file.name, "M ")
WHERE file.cday >= date(today) - dur(7 days)
SORT file.cday DESC
```

## Inline Queries

For inline values in notes:
```markdown
Total zettels: `= length(filter(dv.pages("Cards/Zettels"), (p) => true))`

Last modified: `= this.file.mtime`

Days since created: `= date(today) - this.file.cday`
```

## DataviewJS (Advanced)

For complex logic:
```dataviewjs
const pages = dv.pages("#concept")
    .where(p => p.file.cday >= dv.date("2024-12-01"))
    .sort(p => p.file.cday, 'desc');

dv.table(
    ["Note", "Created", "Tags"],
    pages.map(p => [p.file.link, p.file.cday, p.tags])
);
```

## Query Building Steps

### 1. Identify What You Want
- List of notes? → `LIST`
- Structured data? → `TABLE`
- Tasks? → `TASK`
- Calendar? → `CALENDAR`

### 2. Specify Source
- All notes: `FROM ""`
- Folder: `FROM "Cards/Zettels"`
- Tag: `FROM #concept`
- Combined: `FROM "Cards" OR #idea`

### 3. Add Filters
- By date: `WHERE file.cday >= date(2024-01-01)`
- By content: `WHERE contains(file.content, "keyword")`
- By property: `WHERE rating >= 4`

### 4. Sort and Limit
- Sort: `SORT file.cday DESC`
- Limit: `LIMIT 10`

## Output Format

When generating queries, provide:

1. **The query code block** (ready to paste)
2. **Explanation** of what it does
3. **Customization tips** if applicable

## Examples

**User: "Show me notes tagged #concept from December"**
```dataview
LIST
FROM #concept
WHERE file.cday >= date(2024-12-01) AND file.cday <= date(2024-12-31)
SORT file.cday DESC
```

**User: "Find all people at Google"**
```dataview
TABLE role, email
FROM "Databases/People"
WHERE organization = "Google"
SORT file.name ASC
```

**User: "What are my incomplete tasks?"**
```dataview
TASK
FROM ""
WHERE !completed
GROUP BY file.link
SORT file.cday DESC
```
