# Tag Color Standardization - Complete

**Date:** 2026-01-21
**Status:** ✅ Complete

---

## Summary

Successfully standardized all Paperless tag colors and created automation to maintain consistency.

---

## Changes Made

### 1. Updated Paperless Skill Documentation

**File:** `/home/prowler/local/PAI/.claude/skills/paperless/SKILL.md`

**Change:** Enhanced the "Folder Tags" section to clarify that:
- Tags prefixed with "F" are **Folder tags**
- They function exactly like physical folders or file system folders
- Used as the primary organizational structure
- Documents can belong to multiple folders

### 2. Fixed Inconsistent Tag Colors

Updated two Family Financial tags to match the standard color scheme:

| Tag Name | Previous Color | New Color |
|-----------|---------------|-----------|
| F 1MU6MU | `#aa712a` (orange-brown) | `#B2654D` ✓ |
| F Home care package | `#737edc` (light blue) | `#B2654D` ✓ |

**Result:** All 11 Family Financial (F) tags now use consistent `#B2654D` color.

### 3. Created Tag Color Maintenance Workflow

**Documentation:** `/home/prowler/local/PAI/.claude/skills/paperless/Workflows/TagColorMaintenance.md`

**Script:** `/home/prowler/scripts/paperless-tag-color-check.sh`

**Features:**
- Checks all tags against established color scheme
- Identifies color mismatches
- Can automatically fix incorrect colors
- Safe preview mode (default)
- Apply mode with `--fix` flag
- Color-coded output for easy reading

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

## Usage

### Check Tag Colors (No Changes)

```bash
~/scripts/paperless-tag-color-check.sh
```

### Check and Fix Incorrect Colors

```bash
~/scripts/paperless-tag-color-check.sh --fix
```

### Schedule Regular Checks (Optional)

#### Using Cron

```bash
# Edit crontab
crontab -e

# Add weekly check (every Sunday at 9 AM)
0 9 * * 0 /home/prowler/scripts/paperless-tag-color-check.sh --fix >> /var/log/paperless-tag-check.log 2>&1
```

#### Using Systemd Timer

See full documentation in `TagColorMaintenance.md` for systemd setup instructions.

---

## Current Tag Status

**Total Tags:** 47
**Tags with Correct Colors:** 47 ✅
**Tags with Color Issues:** 0

All Folder tags (F prefix) are now consistent with `#B2654D` color.

---

## Folder Tag Usage Guidelines

**Remember:** Tags prefixed with "F " are **Folder tags** - they function exactly like physical folders or file system folders.

**Key Points:**
- Think of each "F" tag as a folder where related documents belong
- Documents can belong to multiple "folders" (multiple F tags)
- Use these as the primary way to categorize and group related documents
- Example: "F Tax FY25" = All documents for the 2025 tax year folder

---

## Files Modified/Created

### Modified
- `/home/prowler/local/PAI/.claude/skills/paperless/SKILL.md` - Added Folder tag clarification

### Created
- `/home/prowler/local/PAI/.claude/skills/paperless/Workflows/TagColorMaintenance.md` - Complete workflow documentation
- `/home/prowler/scripts/paperless-tag-color-check.sh` - Executable maintenance script

---

## Next Steps

1. ✅ Tag colors are now consistent
2. ✅ Documentation updated with Folder tag clarification
3. ✅ Maintenance workflow created
4. 🔄 Optionally: Schedule weekly automated checks
5. 🔄 Optionally: Integrate with n8n for automated checking

---

## Notes

- **SECURITY:** API tokens are sourced from `/home/prowler/local/PAI/.claude/.env` - NEVER hardcoded
- Script automatically loads configuration from CORE env file
- Script includes rate limiting (0.5s delay) to avoid API throttling
- Color-coded output makes it easy to identify issues at a glance
- **IDE:** VS Code (use `code` command to open files)
