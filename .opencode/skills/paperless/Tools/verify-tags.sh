#!/bin/bash
# Document Repository Tag Verification and Setup Script

set -e

echo "=== Document Repository Tag Verification ==="
echo ""

# Define required tags
declare -A LIFECYCLE_TAGS=(
    ["Action"]="Action"
    ["Archive"]="Archive"
    ["Delete"]="Delete"
    ["Expired"]="Expired"
    ["Inbox"]="Inbox"
    ["Record"]="Record"
)

declare -A RETENTION_TAGS=(
    ["R 30 days"]="R 30 days"
    ["R 1 year"]="R 1 year"
    ["R 7 years"]="R 7 years"
    ["R forever"]="R forever"
)

# Colors
LIFECYCLE_COLOR="#8C7760"
RETENTION_COLOR="#B2654D"

echo "Checking lifecycle tags..."
echo ""

for name in "${!LIFECYCLE_TAGS[@]}"; do
    echo "Checking for tag: $name"

    # Search for tag by name
    existing_tag=$(paperless_list_tags 2>/dev/null | grep -i "\"name\": \"$name\"" || true)

    if [ -n "$existing_tag" ]; then
        echo "  ✓ Tag exists"
    else
        echo "  ✗ Tag not found, creating..."
        paperless_create_tag \
            --name="$name" \
            --color="$LIFECYCLE_COLOR" \
            --match="" \
            --matching_algorithm="auto"
        echo "  ✓ Created tag: $name"
    fi
    echo ""
done

echo "Checking retention tags..."
echo ""

for name in "${!RETENTION_TAGS[@]}"; do
    echo "Checking for tag: $name"

    # Search for tag by name
    existing_tag=$(paperless_list_tags 2>/dev/null | grep -i "\"name\": \"$name\"" || true)

    if [ -n "$existing_tag" ]; then
        echo "  ✓ Tag exists"
    else
        echo "  ✗ Tag not found, creating..."
        paperless_create_tag \
            --name="$name" \
            --color="$RETENTION_COLOR" \
            --match="" \
            --matching_algorithm="auto"
        echo "  ✓ Created tag: $name"
    fi
    echo ""
done

echo "=== Tag Verification Complete ==="
echo ""
echo "Listing all tags for reference..."
paperless_list_tags
