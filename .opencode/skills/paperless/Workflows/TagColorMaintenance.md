# Tag Color Maintenance Workflow

**Purpose:** Regularly check and update tag colors to maintain consistency with established color scheme.

**Frequency:** Weekly or as needed when new tags are created.

---

## ⚠️ SECURITY WARNING

**NEVER HARDCODE API TOKENS IN DOCUMENTATION OR SCRIPTS**

All API tokens must be sourced from `/home/prowler/local/PAI/.claude/.env`

**Correct Pattern:**
```bash
# Load configuration from CORE env file
source /home/prowler/local/PAI/.claude/.env

# Use variables from env file
curl -H "Authorization: Token $PAPERLESS_TOKEN" ...
```

**Incorrect Pattern (NEVER DO THIS):**
```bash
PAPERLESS_TOKEN="ACTUAL_PAPERLESS_TOKEN"  # ❌ WRONG!
```

---

---

## Color Scheme Reference

### Tag Type → Color Mapping

| Tag Type | Prefix Pattern | Color | Hex Code |
|----------|---------------|--------|----------|
| **Folder Tags** | Starts with `F ` | Terracotta | `#B2654D` |
| **Retention Tags** | Starts with `R ` | Terracotta | `#B2654D` |
| **Lifecycle Tags** | Specific names | Warm Taupe | `#8C7760` |
| **Related-to Tags** | No prefix | Dusty Blue-Teal | `#608080` |

### Lifecycle Tag Names (Warm Taupe `#8C7760`)
- Action
- Archive
- Delete
- Expired
- Inbox
- Record

---

## Workflow Steps

### Step 1: Fetch All Tags

```bash
# Load configuration from CORE env file
source /home/prowler/local/PAI/.claude/.env

# Get all tags
curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
  "$PAPERLESS_URL/api/tags/" | jq '.results[]' > /tmp/all_tags.json
```

### Step 2: Check Tag Colors

```bash
# Create color check script
cat > /tmp/check_tag_colors.sh << 'EOF'
#!/bin/bash

# Load configuration from CORE env file
source /home/prowler/local/PAI/.claude/.env

# Function to determine expected color
get_expected_color() {
    local tag_name="$1"

    # Folder tags (F prefix)
    if [[ "$tag_name" =~ ^[Ff]\  ]]; then
        echo "#B2654D"
        return
    fi

    # Retention tags (R prefix)
    if [[ "$tag_name" =~ ^[Rr]\  ]]; then
        echo "#B2654D"
        return
    fi

    # Lifecycle tags
    case "$tag_name" in
        "Action"|"Archive"|"Delete"|"Expired"|"Inbox"|"Record")
            echo "#8C7760"
            return
            ;;
    esac

    # Default: Related-to tags
    echo "#608080"
}

# Read tags and check colors
jq -c '.[]' /tmp/all_tags.json | while read -r tag; do
    tag_id=$(echo "$tag" | jq -r '.id')
    tag_name=$(echo "$tag" | jq -r '.name')
    current_color=$(echo "$tag" | jq -r '.color')

    expected_color=$(get_expected_color "$tag_name")

    if [[ "$current_color" != "$expected_color" ]]; then
        echo "MISMATCH: $tag_name (ID: $tag_id)"
        echo "  Current:  $current_color"
        echo "  Expected: $expected_color"
        echo ""
    fi
done
EOF

chmod +x /tmp/check_tag_colors.sh
/tmp/check_tag_colors.sh
```

### Step 3: Update Incorrect Colors

```bash
# Create update script
cat > /tmp/fix_tag_colors.sh << 'EOF'
#!/bin/bash

# Load configuration from CORE env file
source /home/prowler/local/PAI/.claude/.env

# Function to determine expected color
get_expected_color() {
    local tag_name="$1"

    if [[ "$tag_name" =~ ^[Ff]\  ]]; then
        echo "#B2654D"
        return
    fi

    if [[ "$tag_name" =~ ^[Rr]\  ]]; then
        echo "#B2654D"
        return
    fi

    case "$tag_name" in
        "Action"|"Archive"|"Delete"|"Expired"|"Inbox"|"Record")
            echo "#8C7760"
            return
            ;;
    esac

    echo "#608080"
}

# Read tags and fix colors
jq -c '.[]' /tmp/all_tags.json | while read -r tag; do
    tag_id=$(echo "$tag" | jq -r '.id')
    tag_name=$(echo "$tag" | jq -r '.name')
    current_color=$(echo "$tag" | jq -r '.color')

    expected_color=$(get_expected_color "$tag_name")

    if [[ "$current_color" != "$expected_color" ]]; then
        echo "Updating: $tag_name (ID: $tag_id)"
        echo "  $current_color → $expected_color"

        curl -s -X PATCH \
            -H "Authorization: Token $PAPERLESS_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"color\": \"$expected_color\"}" \
            "$PAPERLESS_URL/api/tags/$tag_id/" | jq -r '{name: .name, color: .color}'

        echo ""
        sleep 0.5  # Rate limiting
    fi
done
EOF

chmod +x /tmp/fix_tag_colors.sh

# Preview changes first
echo "=== PREVIEW ==="
/tmp/check_tag_colors.sh

echo ""
echo "=== APPLY CHANGES? (y/n) ==="
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "Applying color fixes..."
    /tmp/fix_tag_colors.sh
else
    echo "No changes applied."
fi
```

---

## One-Click Automation Script

Save this as `~/scripts/paperless-tag-color-check.sh`:

```bash
#!/bin/bash
#
# Paperless Tag Color Consistency Checker
# Usage: ./paperless-tag-color-check.sh [--fix]
#

# Load configuration from CORE env file
source /home/prowler/local/PAI/.claude/.env

APPLY_FIXES="${1:-}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to determine expected color
get_expected_color() {
    local tag_name="$1"

    # Folder tags (F prefix)
    if [[ "$tag_name" =~ ^[Ff]\  ]]; then
        echo "#B2654D"
        return
    fi

    # Retention tags (R prefix)
    if [[ "$tag_name" =~ ^[Rr]\  ]]; then
        echo "#B2654D"
        return
    fi

    # Lifecycle tags
    case "$tag_name" in
        "Action"|"Archive"|"Delete"|"Expired"|"Inbox"|"Record")
            echo "#8C7760"
            return
            ;;
    esac

    # Default: Related-to tags
    echo "#608080"
}

echo "🎨 Paperless Tag Color Consistency Checker"
echo "======================================"
echo ""

# Fetch all tags
echo "📥 Fetching tags..."
TAGS=$(curl -s -H "Authorization: Token $PAPERLESS_TOKEN" \
    "$PAPERLESS_URL/api/tags/" | jq '.results[]')

# Count total and mismatched tags
TOTAL_TAGS=$(echo "$TAGS" | jq -s 'length')
MISMATCHED=0

# Check each tag
echo "$TAGS" | jq -c '.' | while read -r tag; do
    tag_id=$(echo "$tag" | jq -r '.id')
    tag_name=$(echo "$tag" | jq -r '.name')
    current_color=$(echo "$tag" | jq -r '.color')

    expected_color=$(get_expected_color "$tag_name")

    if [[ "$current_color" != "$expected_color" ]]; then
        echo -e "${RED}✗ MISMATCH${NC}: $tag_name (ID: $tag_id)"
        echo "  Current:  $current_color"
        echo "  Expected: $expected_color"
        echo ""

        # Apply fix if --fix flag is set
        if [[ "$APPLY_FIXES" == "--fix" ]]; then
            echo -e "${YELLOW}→ Fixing...${NC}"
            result=$(curl -s -X PATCH \
                -H "Authorization: Token $PAPERLESS_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{\"color\": \"$expected_color\"}" \
                "$PAPERLESS_URL/api/tags/$tag_id/")

            new_color=$(echo "$result" | jq -r '.color')
            if [[ "$new_color" == "$expected_color" ]]; then
                echo -e "${GREEN}✓ Updated to $expected_color${NC}"
            else
                echo -e "${RED}✗ Failed to update${NC}"
            fi
            echo ""
            sleep 0.5
        fi
    fi
done

echo ""
echo "======================================"
echo "Total tags checked: $TOTAL_TAGS"

if [[ "$APPLY_FIXES" == "--fix" ]]; then
    echo -e "${GREEN}✓ Fixes applied${NC}"
else
    echo ""
    echo -e "${YELLOW}To apply fixes, run:${NC}"
    echo "  $0 --fix"
fi
```

### Usage:

```bash
# Check only (no changes)
~/scripts/paperless-tag-color-check.sh

# Check and fix
~/scripts/paperless-tag-color-check.sh --fix
```

---

## Schedule Regular Checks (Optional)

### Using Cron

```bash
# Edit crontab
crontab -e

# Add weekly check (every Sunday at 9 AM)
0 9 * * 0 /home/prowler/scripts/paperless-tag-color-check.sh >> /var/log/paperless-tag-check.log 2>&1
```

### Using Systemd Timer

Create `/etc/systemd/system/paperless-tag-check.service`:

```ini
[Unit]
Description=Check Paperless tag colors
After=network.target

[Service]
Type=oneshot
User=prowler
ExecStart=/home/prowler/scripts/paperless-tag-color-check.sh --fix
```

Create `/etc/systemd/system/paperless-tag-check.timer`:

```ini
[Unit]
Description=Weekly Paperless tag color check

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable paperless-tag-check.timer
sudo systemctl start paperless-tag-check.timer
```

---

## Integration with n8n

If you use n8n for automation, create a workflow:

1. **Schedule Trigger** - Weekly cron
2. **HTTP Request** - GET all tags from Paperless API
3. **Code Node** - Check and fix colors using the logic above
4. **HTTP Request** - PATCH any mismatched tags

---

## Summary

This workflow ensures:
- ✅ All Folder tags (F prefix) use `#B2654D`
- ✅ All Retention tags (R prefix) use `#B2654D`
- ✅ All Lifecycle tags use `#8C7760`
- ✅ All other tags use `#608080`
- ✅ New tags automatically follow the color scheme
- ✅ Consistency maintained over time

Run this workflow:
- After creating new tags
- Weekly as part of maintenance routine
- When tag colors appear inconsistent in the UI
