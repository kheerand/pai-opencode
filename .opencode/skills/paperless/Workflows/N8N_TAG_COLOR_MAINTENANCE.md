# n8n Workflow: Paperless Tag Color Maintenance

**Workflow ID:** `gJxjB0AzYfNDrPh7`
**Status:** Created (inactive - needs activation)

---

## Purpose

Automatically check and fix Paperless tag colors on a weekly schedule to maintain consistency with the established color scheme.

**Schedule:** Every Sunday at 9:00 AM (0 9 * * 0)

---

## Workflow Structure

### 1. Weekly Schedule (Trigger)
**Node Type:** Schedule Trigger
**Type:** `n8n-nodes-base.scheduleTrigger`
**Configuration:**
```json
{
  "rule": {
    "interval": [
      {
        "field": "cronExpression",
        "expression": "0 9 * * 0"
      }
    ]
    }
  }
}
```

**Purpose:** Triggers workflow every Sunday at 9 AM.

---

### 2. Get All Tags
**Node Type:** HTTP Request
**Type:** `n8n-nodes-base.httpRequest`
**Method:** GET
**Configuration:**
```
URL: {{ $credentials.PAPERLESS_URL }}/api/tags/
Authentication: Generic Credential Type
Headers:
  Authorization: {{ $credentials.PAPERLESS_TOKEN }}
```

**Purpose:** Fetches all tags from Paperless API.

---

### 3. Check Tag Colors
**Node Type:** Code
**Type:** `n8n-nodes-base.code`
**Mode:** Run Once for All Items
**JavaScript Code:**
```javascript
// Get all tags from previous node
const allTags = $input.all();
const tags = allTags[0].json.results;

// Function to determine expected color based on tag name
function getExpectedColor(tagName) {
  // Folder tags (F prefix) - Note: space after F is important
  if (tagName.match(/^[Ff]\s/)) {
    return '#B2654D';
  }

  // Retention tags (R prefix)
  if (tagName.match(/^[Rr]\s/)) {
    return '#B2654D';
  }

  // Lifecycle tags
  const lifecycleTags = ['Action', 'Archive', 'Delete', 'Expired', 'Inbox', 'Record'];
  if (lifecycleTags.includes(tagName)) {
    return '#8C7760';
  }

  // Default: Related-to tags
  return '#608080';
}

// Check each tag and identify mismatches
const mismatches = [];

for (const tag of tags) {
  const expectedColor = getExpectedColor(tag.name);

  if (tag.color !== expectedColor) {
    mismatches.push({
      id: tag.id,
      name: tag.name,
      currentColor: tag.color,
      expectedColor: expectedColor
    });
  }
}

// Return results
return {
  json: {
    totalTags: tags.length,
    mismatchedCount: mismatches.length,
    mismatches: mismatches
  }
};
```

**Purpose:** Analyzes each tag and identifies color mismatches against color scheme.

**Output:**
```json
{
  "totalTags": 47,
  "mismatchedCount": 2,
  "mismatches": [
    {
      "id": 50,
      "name": "F 1MU6MU",
      "currentColor": "#aa712a",
      "expectedColor": "#B2654D"
    }
  ]
}
```

---

### 4. Loop Through Tags
**Node Type:** Split In Batches
**Type:** `n8n-nodes-base.splitInBatches`
**Configuration:**
```
Batch Size: 1
Source Data: {{ $json.mismatches }}
```

**Purpose:** Processes each mismatched tag individually.

---

### 5. Fix Tag Color
**Node Type:** HTTP Request
**Type:** `n8n-nodes-base.httpRequest`
**Method:** PATCH
**Configuration:**
```
URL: {{ $credentials.PAPERLESS_URL }}/api/tags/{{ $json.id }}/
Authentication: Generic Credential Type
Headers:
  Authorization: {{ $credentials.PAPERLESS_TOKEN }}
Body:
  color: {{ $json.expectedColor }}
```

**Purpose:** Updates each mismatched tag with the correct color.

---

## Color Scheme Reference

| Tag Type | Prefix/Pattern | Color | Hex Code |
|----------|----------------|--------|----------|
| **Folder Tags** | Starts with `F ` | Terracotta | `#B2654D` |
| **Retention Tags** | Starts with `R ` | Terracotta | `#B2654D` |
| **Lifecycle Tags** | Specific names | Warm Taupe | `#8C7760` |
| **Related-to Tags** | No prefix | Dusty Blue-Teal | `#608080` |

### Lifecycle Tags (Warm Taupe `#8C7760`)
- Action
- Archive
- Delete
- Expired
- Inbox
- Record

---

## Setup Instructions

### Step 1: Configure Credentials

Create credentials in n8n for Paperless API access:

**Credential Type:** Generic Credential Type
**Fields:**
```
PAPERLESS_TOKEN: [Load from /home/prowler/local/PAI/.claude/.env]
PAPERLESS_URL: https://paperless.s.cytrax.com.au
```

**⚠️ SECURITY WARNING:**
- NEVER hardcode API tokens in credentials
- Store token in `/home/prowler/local/PAI/.claude/.env`
- Reference env file in credential documentation

---

### Step 2: Activate Workflow

1. Open n8n
2. Navigate to Workflows
3. Find "Paperless Tag Color Maintenance" workflow
4. Click "Active" toggle
5. Confirm activation
6. Workflow will run automatically on schedule

---

### Step 3: Test Workflow

**Manual Test:**
1. Open workflow in n8n
2. Click "Execute Workflow" button
3. Review execution results
4. Check output for:
   - Total tags checked
   - Number of mismatches found
   - List of tags fixed (if any)

---

## Workflow Diagram

```
┌──────────────────┐
│  Weekly Schedule │ (Trigger: Sundays at 9 AM)
└──────┬─────────┘
       │
       ▼
┌──────────────────┐
│  Get All Tags   │ (HTTP GET)
└──────┬─────────┘
       │
       ▼
┌──────────────────┐
│ Check Tag Colors │ (Code Node)
└──────┬─────────┘
       │
       ▼
┌──────────────────┐
│ Loop Through    │ (Split In Batches)
│     Tags        │
└──────┬─────────┘
       │
       ▼
┌──────────────────┐
│  Fix Tag Color  │ (HTTP PATCH)
└──────────────────┘
```

---

## Monitoring and Logs

### Execution Log Location
n8n maintains execution logs for each workflow run:
- View in n8n UI: Workflow → Executions
- Check for errors or warnings
- Review number of tags processed

### Success Indicators
✅ **Successful Run:**
- Status: Success
- Tags checked: Number of total tags
- Mismatches found: Number of tags needing fixes
- Tags fixed: Number of tags updated

❌ **Failed Run:**
- Status: Error
- Check error message in execution log
- Verify credentials are configured
- Check API connectivity

---

## Troubleshooting

### Issue: Workflow not triggering
**Solution:**
1. Verify workflow is active
2. Check schedule expression: `0 9 * * 0`
3. Ensure n8n is running

### Issue: Authentication failed
**Solution:**
1. Verify credentials are configured correctly
2. Check token is loaded from env file
3. Ensure token hasn't expired

### Issue: No tags being checked
**Solution:**
1. Verify API URL is correct
2. Check HTTP GET request response
3. Review API connectivity

### Issue: Tags not being fixed
**Solution:**
1. Check PATCH request parameters
2. Verify tag IDs are correct
3. Review code node logic

---

## Security Considerations

**⚠️ CRITICAL SECURITY RULES:**

1. **NEVER hardcode API tokens** in workflow nodes or credentials
2. **ALWAYS source tokens** from `/home/prowler/local/PAI/.claude/.env`
3. **Use credential references** like `{{ $credentials.PAPERLESS_TOKEN }}`
4. **Reference SecurityProtocols.md** for complete security guidelines

**Correct Pattern:**
```
Authorization: {{ $credentials.PAPERLESS_TOKEN }}
```

**Incorrect Pattern (NEVER DO THIS):**
```
Authorization: Token 71876aac7ae059cdbdcd61e19c69a704907118d3  // ❌ WRONG!
```

---

## Maintenance Schedule

### Weekly (Automated)
- Workflow runs automatically every Sunday at 9 AM
- No manual intervention required
- Logs available in n8n UI

### Monthly (Review)
- Review workflow execution logs
- Verify color scheme is still correct
- Check for any new tag types

### Quarterly
- Update color scheme if needed
- Review schedule frequency
- Optimize workflow performance

### Updates
**When to update:**
- New tag types added to system
- Color scheme changes
- API endpoint changes
- Security protocols updated

---

## Related Files

- **Tag Color Maintenance Workflow:** `/home/prowler/local/PAI/.claude/skills/paperless/Workflows/TagColorMaintenance.md`
- **Executable Script:** `/home/prowler/scripts/paperless-tag-color-check.sh`
- **Security Protocols:** `/home/prowler/local/PAI/.claude/skills/CORE/SecurityProtocols.md`
- **Paperless Skill:** `/home/prowler/local/PAI/.claude/skills/paperless/SKILL.md`

---

## Summary

This n8n workflow provides automated tag color maintenance with the following:

**🎯 Features:**
- Weekly automatic execution
- Color scheme validation
- Automatic fixes for mismatches
- Detailed execution logging
- Secure credential handling

**✅ Benefits:**
- Consistent tag colors
- Reduced manual maintenance
- Early detection of issues
- Scalable automation

**🔒 Security:**
- No hardcoded tokens
- Credential-based authentication
- Env file sourcing
- Secure execution

---

## Next Steps

1. ✅ Workflow created in n8n
2. ⏸️ Configure credentials (PAPERLESS_TOKEN, PAPERLESS_URL)
3. ⏸️ Activate workflow (toggle Active)
4. ⏸️ Test workflow execution
5. ⏸️ Monitor execution logs

**Note:** Workflow is currently inactive. Activate it in n8n UI to start automatic weekly checks.
