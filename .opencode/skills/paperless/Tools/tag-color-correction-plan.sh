#!/bin/bash
# Tag Color Correction Plan for Document Repository

# This script documents the color corrections needed and provides
# instructions for updating tags in the Document repository web UI

cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║           TAG COLOR CORRECTION PLAN                                   ║
╚════════════════════════════════════════════════════════════════╝

Documented Color Schemes:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Folder Tags (F prefix):      #B2654D (Terracotta)
  Retention Tags (R prefix):   #B2654D (Terracotta)
  Lifecycle Tags:              #8C7760 (Warm Taupe)
  Related-to Tags:             #608080 (Dusty Blue-Teal)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        CORRECTIONS NEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIORITY 1 - CRITICAL (Lifecycle Tags)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  DELETE TAG (ID: 18)
    Current:  #634F3A (Darker Taupe)
    Should Be: #8C7760 (Warm Taupe - Main Color)

    Reason: All lifecycle tags should use the main color #8C7760
    Impact: 0 documents affected

PRIORITY 2 - HIGH (Folder Tags)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  The following folder tags are using #B06040 instead of #B2654D:

  F Amateur radio license (ID: 16)
    Documents: 0
    Current:  #B06040
    Should Be: #B2654D

  F Bellevue Ct, Mulgrave (ID: 37)
    Documents: 5
    Current:  #B06040
    Should Be: #B2654D

  F Bellevue ct redevelopment (ID: 31)
    Documents: 1
    Current:  #B06040
    Should Be: #B2654D

  F Breast cancer 2025 (ID: 40)
    Documents: 20
    Current:  #B06040
    Should Be: #B2654D

  F DFP506 (ID: 38)
    Documents: 8
    Current:  #B06040
    Should Be: #B2654D

  F High school (ID: 45)
    Documents: 9
    Current:  #B06040
    Should Be: #B2654D

  F Miller crescent property (ID: 41)
    Documents: 6
    Current:  #B06040
    Should Be: #B2654D

  F Shares portfolio (ID: 42)
    Documents: 3
    Current:  #B06040
    Should Be: #B2654D

  Total Documents Affected: 52

PRIORITY 3 - MEDIUM (Related-to Tag)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Aviation (ID: 32)
    Documents: 2
    Current:  #B2654D (Folder Color)
    Should Be: #608080 (Related-to Color)

    Reason: Aviation is not a folder, should use Related-to color

SPECIAL TAGS - MANUAL REVIEW NEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  The following tags have special colors that may be intentional:

  F Sri Lanka tax (ID: 48)
    Documents: 1
    Current:  #ee4d40 (Red)
    Note: May be intentional for special categorization

  F Tax FY25 (ID: 46)
    Documents: 2
    Current:  #93d046 (Green)
    Note: May be intentional for current tax year visibility

  F Jini inheritance (ID: 49)
    Documents: 1
    Current:  #4f108e (Purple)
    Note: May be intentional for special legal/inheritance docs

  RECOMMENDATION: Review these special colors and decide if they should
  be changed to #B2654D (standard folder color) or kept as-is.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          UPDATE INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Since MCP tools don't include tag color update functionality, you'll need to
update these colors in the Document repository web interface:

STEP 1: Open Document Repository
  URL: http://paperless.s.cytrax.com.au

STEP 2: Navigate to Tags
  Go to Settings → Tags

STEP 3: Update Each Tag
  For each tag listed above:
    1. Click on the tag name
    2. Click "Edit"
    3. Change the color to the documented value
    4. Click "Save"

STEP 4: Verify Changes
  Run this script again to verify all colors are correct:
    ~/.claude/skills/paperless/Tools/verify-tags.sh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          QUICK REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Colors to Apply:

  Folder Tags (F prefix):      #B2654D
  Retention Tags (R prefix):   #B2654D
  Lifecycle Tags:              #8C7760
  Related-to Tags:             #608080

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
