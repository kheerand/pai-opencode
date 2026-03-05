---
name: RelationshipInsights
description: Extract deep insights about your relationships from PKM vault. USE WHEN relationship insights, understand relationship, analyze meetings with someone, person analysis, how to work with someone, relationship dynamics, communication patterns with a person.
---

# RelationshipInsights

Extract deep insights about your professional relationships from meetings, journals, and interactions in your Obsidian PKM vault.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Full** | "relationship insights on [person]", "analyze my relationship with [person]", "full analysis of [person]" | `Workflows/Full.md` |
| **Quick** | "quick insights on [person]", "summary of [person]" | `Workflows/Quick.md` |
| **Update** | "update [person] insights", "add to [person] analysis" | `Workflows/Update.md` |

## Voice Notification

**When executing a workflow, do BOTH:**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:8888/notify \
     -H "Content-Type: application/json" \
     -d '{"message":"Running WORKFLOW workflow in RelationshipInsights skill"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **RelationshipInsights** skill...
   ```

## Insight Dimensions

| Dimension | What You'll Learn |
|-----------|-------------------|
| Communication Patterns | How often you meet, cadence, format evolution |
| Decisions & Actions | What you've decided together, commitments made |
| Sentiment & Relationship | Trust level, dynamics, emotional undertones |
| Themes & Topics | What you talk about, their expertise areas |
| Person Insights | Their values, beliefs, motivations, how to work with them |

## Output Structure

All analyses are stored in:
```
~/.opencode/MEMORY/projects/{person-slug}-analysis/
├── README.md                    # Project overview
├── data/
│   ├── file_manifest.txt        # All source files
│   └── meetings_metadata.csv    # Meeting records
├── analysis/
│   ├── communication-patterns.md
│   ├── decisions-actions.md
│   ├── sentiment-relationship.md
│   ├── themes-topics.md
│   └── person-insights.md
└── reports/
    └── summary.md               # Executive summary
```

## Dependencies

- **Pkm skill** - For Obsidian vault access and structure
- **Vault location:** Configured in Pkm skill (`/mnt/c/Users/kheer/Dropbox/PKM`)
- **Meeting folder:** `journals/Meetings/`
- **People folder:** `Databases/People/`

## Examples

**Example 1: Understand a relationship**
```
User: "Give me relationship insights on Shannon Callaghan"
→ Invokes Full workflow
→ Searches vault for all interactions
→ Extracts meetings, journals, summaries
→ Creates 5-dimension analysis
→ Returns: who they are, how to work with them, relationship status
```

**Example 2: Quick check before a meeting**
```
User: "Quick insights on Hamish Holewa"
→ Invokes Quick workflow
→ Extracts meeting list and key themes
→ Provides condensed summary
→ Quick reference for upcoming meeting
```

**Example 3: Keep insights current**
```
User: "Update my Shannon Callaghan insights"
→ Invokes Update workflow
→ Finds new meetings since last analysis
→ Appends new findings
→ Updates recommendations
```

## Quick Reference

**Get full insights:**
```
"Relationship insights on [person name]"
"Analyze my relationship with [person]"
```

**Quick check:**
```
"Quick insights on [person name]"
```

**Stay current:**
```
"Update [person name] insights"
```

**Person name formats accepted:**
- First name only: "Shannon"
- Full name: "Shannon Callaghan"
- With context: "my relationship with Hamish"
