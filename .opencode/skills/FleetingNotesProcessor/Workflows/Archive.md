# Archive Processed Fleeting Notes Workflow

Moves processed Fleeting notes to an archive folder to keep the main folder clean.

---

## Purpose

After you've acted on Fleeting note recommendations, move them to an archive to declutter your active Fleeting notes folder.

---

## Archive Location

`/mnt/c/Users/kheer/Dropbox/PKM/Cards/Fleeting notes/Archive/`

---

## Workflow Steps

### Step 1: Identify Processed Notes

Look for notes that:
- Have `#processed` tag
- Have been converted to Zettels (check for links)
- Are older than X days (configurable)

### Step 2: Create Archive Folder

```bash
mkdir -p "/mnt/c/Users/kheer/Dropbox/PKM/Cards/Fleeting notes/Archive"
```

### Step 3: Move Files

```bash
# Move processed notes to archive
mv "/mnt/c/Users/kheer/Dropbox/PKM/Cards/Fleeting notes/FN - Processed.md" \
   "/mnt/c/Users/kheer/Dropbox/PKM/Cards/Fleeting notes/Archive/"
```

---

## Output Format

```markdown
## Fleeting Notes Archived - YYYY-MM-DD

**Moved to Archive:** X notes

| Note | Reason |
|------|--------|
| [[FN - Example]] | Converted to Zettel |
| [[FN - Another]] | Task completed |
| [[FN - Third]] | Older than 30 days |

**Remaining in Fleeting notes:** X notes
```

---

## Safety Rules

- **Never delete** - only move to Archive
- **Preserve filenames** - don't rename during archive
- **Create dated subfolders** if archive gets large: `Archive/2026-03/`
