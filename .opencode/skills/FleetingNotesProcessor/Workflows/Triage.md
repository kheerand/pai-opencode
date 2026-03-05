# Triage Fleeting Notes Workflow

Quick categorization of Fleeting notes without detailed analysis. Just counts and categories.

---

## Purpose

When you want a quick overview of what's in your Fleeting notes folder without the full processing workflow.

---

## Workflow Steps

### Step 1: Scan and Categorize

Quickly scan each Fleeting note and assign a single category.

### Step 2: Generate Summary

Output a summary with counts, not a full table.

---

## Output Format

```markdown
## Fleeting Notes Triage - YYYY-MM-DD

**Total Notes:** X
**Unprocessed:** X

| Category | Count | Example |
|----------|-------|---------|
| 📝 Convert to Zettel | 5 | [[FN - Example]] |
| ✅ Create Task | 8 | [[FN - Example]] |
| 📦 Archive | 3 | [[FN - Example]] |
| ⏳ Keep Fleeting | 4 | [[FN - Example]] |

**Recommendation:** Focus on the 8 task-related notes first.
```

---

## Execution

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Quick triage of your Fleeting notes"}' \
  > /dev/null 2>&1 &
```

1. Scan all FN files
2. Quick categorize (no deep analysis)
3. Output summary counts
4. Optionally insert into journal
