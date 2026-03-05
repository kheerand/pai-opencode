# Full Relationship Insights Workflow

**Purpose:** Complete 5-dimension analysis of your relationship with a nominated person.

## Prerequisites

1. Person name identified (ask if not provided)
2. PKM vault accessible at configured path
3. Person note exists in `Databases/People/` (optional but helpful)

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Running full relationship insights workflow"}' \
  > /dev/null 2>&1 &
```

## Step 1: Identify Person

If person name not provided, ask:

```
Who would you like relationship insights on?
```

**Person identification options:**
- Exact name: "Shannon Callaghan"
- First name search: "Shannon" (will find all with that first name)
- From person note: Check `Databases/People/` for matches

## Step 2: Search Vault

Find all files mentioning the person:

```bash
find "/mnt/c/Users/kheer/Dropbox/PKM/journals" -name "*.md" -exec grep -l "{PERSON_NAME}" {} \; 2>/dev/null
```

**Count and report:**
- Total files found
- Meetings vs journal entries vs other
- Date range

## Step 3: Create Project Structure

```bash
mkdir -p ~/.opencode/MEMORY/projects/{person-slug}-analysis/{data,analysis,reports}
```

Create file manifest:
```bash
find ... > ~/.opencode/MEMORY/projects/{person-slug}-analysis/data/file_manifest.txt
```

## Step 4: Extract Meeting Metadata

Use parallel Intern agents to:

**Agent A - Meeting Metadata:**
- Parse all meeting files
- Extract: date, filename, meeting type, purpose, attendees
- Create CSV at `data/meetings_metadata.csv`

**Agent B - AI Summaries:**
- Find AI-generated meeting summaries
- Extract: key takeaways, actions, topics
- Create structured file at `data/ai_summaries_extracted.md`

## Step 5: Create Analysis Reports

Create 5 analysis files in `analysis/`:

### 5.1 Communication Patterns (`communication-patterns.md`)
- Meeting frequency by year/month
- Meeting type distribution
- Cadence evolution (phases)
- Interaction patterns

### 5.2 Decisions & Actions (`decisions-actions.md`)
- Key decisions by date
- Action items tracking
- Commitments made (by/to person)
- Outstanding items

### 5.3 Sentiment & Relationship (`sentiment-relationship.md`)
- Relationship classification
- Phase dynamics
- Emotional indicators from transcripts
- Trust evolution

### 5.4 Themes & Topics (`themes-topics.md`)
- Primary themes with occurrence counts
- Topic evolution timeline
- Topic clusters
- Person's domain expertise

### 5.5 Person Insights (`person-insights.md`)
- Personal background (from person note if exists)
- Professional profile
- Values & beliefs (with quotes if available)
- Attitudes (toward work, colleagues, challenges)
- Motivations (inferred)
- Communication style
- Behavioral patterns
- Relationship recommendations

## Step 6: Create Summary Report

Create `reports/summary.md` with:
- Executive summary (2-3 paragraphs)
- Key findings (bullet points)
- Data quality notes
- Project file index
- Next steps

## Step 7: Update README

Update project README with:
- Key findings
- Relationship status
- Analysis date

## Step 8: Report Results

Output:

```
## Analysis Complete: {Person Name}

**Data Range:** {earliest} - {latest}
**Total Files:** {count}
**Meetings:** {meeting_count}

### Key Findings
- {Finding 1}
- {Finding 2}
- {Finding 3}

### Person Profile
{2-3 sentence summary of who they are}

### Promises
#### You have promised to
1. {Promise 1 I have made to Person}
2. {Promise 2 I have made to Person}

#### You are wating on them for
1. {Promise or action 1 they have made to me}
2. {Promise or action 2 they have made to me}

### Analysis Files
- `~/.opencode/MEMORY/projects/{slug}-analysis/analysis/person-insights.md` - Values, beliefs, motivations
- `~/.opencode/MEMORY/projects/{slug}-analysis/reports/summary.md` - Executive summary

### Recommendations
{How to work effectively with this person}
```

## Error Handling

**If no files found:**
```
No files found mentioning "{PERSON_NAME}". 

Possible reasons:
- Name spelled differently in vault
- Person note uses different format
- No interactions recorded

Would you like me to search for a different name or check the People folder?
```

**If person note not found:**
- Continue without it
- Note in analysis that person note wasn't available
- Person insights will be based on meeting content only

## Quality Notes

Include in all reports:
- Confidence level for each dimension
- Data limitations
- Gaps in information
