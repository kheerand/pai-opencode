# Update Relationship Insights Workflow

**Purpose:** Incrementally update existing relationship insights with new meetings.

## Prerequisites

- Existing analysis at `~/.opencode/MEMORY/projects/{person-slug}-analysis/`
- New files added to vault since last analysis

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Updating relationship insights with new data"}' \
  > /dev/null 2>&1 &
```

## Step 1: Find Existing Analysis

Check for existing project:
```bash
ls ~/.opencode/MEMORY/projects/*{person-name}*analysis/
```

If not found:
```
No existing insights found for {Person Name}. 
Would you like me to create a new full analysis instead?
```

## Step 2: Get Last Analysis Date

Read the README.md or summary.md to find:
- Last analysis date
- Last meeting date included
- Total meetings count

## Step 3: Find New Files

```bash
find "/mnt/c/Users/kheer/Dropbox/PKM/journals" -name "*.md" -newer ~/.opencode/MEMORY/projects/{slug}-analysis/README.md -exec grep -l "{PERSON_NAME}" {} \;
```

## Step 4: Process New Files

If new files found:
1. Append to file_manifest.txt
2. Extract new meeting metadata
3. Append to meetings_metadata.csv
4. Identify any new AI summaries

## Step 5: Update Analysis Files

For each analysis file, append new section:

```markdown
## Update: {DATE}

### New Meetings Added
- {meeting list}

### New Patterns Observed
- {patterns}

### Updated Statistics
- Total meetings: {old} → {new}
- Date range: {old} → {new}
```

## Step 6: Update Summary

Update `reports/summary.md`:
- Update total counts
- Add new key findings
- Update relationship status if changed

## Step 7: Report Changes

```
## Insights Updated: {Person Name}

**Previous:** {old_count} meetings ({old_range})
**Added:** {new_count} new meetings
**Current:** {total_count} meetings ({new_range})

### New Findings
- {finding 1}
- {finding 2}

### Files Updated
- `analysis/communication-patterns.md`
- `analysis/decisions-actions.md`
- `reports/summary.md`
```

## If No New Files

```
No new files found since last analysis ({last_date}).

Current analysis is up to date with {count} meetings.
```
