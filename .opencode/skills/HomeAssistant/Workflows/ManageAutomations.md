# ManageAutomations Workflow

**Manage Home Assistant automations: enable, disable, trigger, and list.**

## When to Use

User requests:
- "Enable/disable [automation]"
- "Trigger [automation]"
- "List all automations"
- "Reload automations"
- "What automations exist?"
- "Is [automation] running?"

## Prerequisites

```bash
export HOME_ASSISTANT_URL="http://192.168.4.222:8123"
export HOME_ASSISTANT_TOKEN="your_long_lived_access_token"
```

## Workflow Steps

### Step 1: List All Automations

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter automation | jq '
    .[] | {
      id: .entity_id,
      name: .attributes.friendly_name,
      state: .state,
      last_triggered: .attributes.last_triggered
    }
  '
```

### Step 2: Check Automation State

```bash
# Get specific automation
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action entity \
  --entity automation.good_morning | jq '{
    name: .attributes.friendly_name,
    state: .state,
    enabled: .state == "on",
    last_triggered: .attributes.last_triggered,
    mode: .attributes.mode
  }'
```

### Step 3: Trigger Automation

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain automation \
  --service trigger \
  --service_data '{"entity_id":"automation.good_morning"}'
```

### Step 4: Enable/Disable Automation

```bash
# Turn on (enable) automation
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain automation \
  --service turn_on \
  --service_data '{"entity_id":"automation.good_morning"}'

# Turn off (disable) automation
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain automation \
  --service turn_off \
  --service_data '{"entity_id":"automation.good_morning"}'
```

### Step 5: Reload All Automations

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain automation \
  --service reload
```

This reloads automation configurations from files.

### Step 6: Toggle Automation

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain homeassistant \
  --service toggle \
  --service_data '{"entity_id":"automation.good_morning"}'
```

### Step 7: Trigger with Conditions

Some automations have conditions that can be bypassed:

```bash
# Trigger automation bypassing conditions
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain automation \
  --service trigger \
  --service_data '{
    "entity_id":"automation.good_morning",
    "skip_condition": true
  }'
```

## Automation State Reference

| State | Meaning | Action to Enable |
|-------|---------|------------------|
| `on` | Automation is enabled and running | None |
| `off` | Automation is disabled | Use `turn_on` service |
| `unknown` | Automation state unknown | Use `reload` service |
| `unavailable` | Automation not available | Check configuration |

## Automation Attributes

When querying an automation entity, you'll see these attributes:

```json
{
  "entity_id": "automation.good_morning",
  "state": "on",
  "attributes": {
    "friendly_name": "Good Morning",
    "last_triggered": "2025-01-06T07:00:00+00:00",
    "mode": "single",
    "current": 0,
    "id": "12345678901234567"
  }
}
```

**Key Attributes:**
- `last_triggered` - When automation last ran
- `mode` - Execution mode (single, restart, queued, parallel)
- `current` - Currently running count
- `id` - Unique automation ID

## Common Operations

### Operation 1: Bulk Enable/Disable

```bash
# Disable all automations with "test" in name
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter automation | jq -r '
    .[] | select(.attributes.friendly_name | contains("test")) |
    .entity_id
  ' | while read entity; do
  bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
    --action call_service \
    --domain automation \
    --service turn_off \
    --service_data "{\"entity_id\":\"$entity\"}"
  done
```

### Operation 2: Trigger Multiple Automations

```bash
# Trigger multiple automations
for automation in "automation.good_morning" "automation.good_night" "automation.goodbye"; do
  bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
    --action call_service \
    --domain automation \
    --service trigger \
    --service_data "{\"entity_id\":\"$automation\"}"
done
```

### Operation 3: Check Recently Triggered

```bash
# Get automations triggered in last 24 hours
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter automation | jq '
    .[] | select(
      .attributes.last_triggered != null and
      (.attributes.last_triggered | fromdateiso8601) > (now - 86400)
    ) | {
      name: .attributes.friendly_name,
      last_triggered: .attributes.last_triggered
    }
  '
```

### Operation 4: Find Disabled Automations

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter automation | jq '
    .[] | select(.state == "off") |
    .attributes.friendly_name
  '
```

### Operation 5: Automation Health Check

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter automation | jq '
    group_by(.state) |
    map({
      state: .[0].state,
      count: length,
      automations: [.[] | .attributes.friendly_name]
    })
  '
```

## Automation Services

| Service | Parameters | Description |
|----------|------------|-------------|
| `trigger` | `entity_id`, `skip_condition` (optional) | Manually trigger automation |
| `turn_on` | `entity_id` | Enable automation |
| `turn_off` | `entity_id` | Disable automation |
| `reload` | (none) | Reload all automation configurations |
| `trigger_service` | `entity_id`, `variables` | Trigger with variables |

## Use Cases

### Use Case 1: Morning Routine
```bash
# Check if good morning automation is enabled
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action entity \
  --entity automation.good_morning | jq '.state'

# If not enabled, enable it
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain automation \
  --service turn_on \
  --service_data '{"entity_id":"automation.good_morning"}'

# Trigger it
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain automation \
  --service trigger \
  --service_data '{"entity_id":"automation.good_morning"}'
```

### Use Case 2: Test Automation
```bash
# Disable automation during testing
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain automation \
  --service turn_off \
  --service_data '{"entity_id":"automation.security_alert"}'

# Test triggers manually

# Re-enable after testing
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain automation \
  --service turn_on \
  --service_data '{"entity_id":"automation.security_alert"}'
```

### Use Case 3: Reload After Config Changes
```bash
# After editing automation files in /config/automations.yaml
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain automation \
  --service reload
```

### Use Case 4: Trigger with Scene
```bash
# Trigger automation that creates scene
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain automation \
  --service trigger \
  --service_data '{
    "entity_id":"automation.create_scene",
    "variables": {
      "scene_name": "Evening"
    }
  }'
```

## Error Handling

| Error | Cause | Solution |
|--------|--------|----------|
| `Automation not found` | Invalid entity_id | Verify automation exists with `--filter automation` |
| `404 Not Found` | Automation deleted or disabled | List automations to check |
| `Automation cannot be triggered` | Conditions not met | Use `skip_condition: true` |
| `Failed to reload` | Syntax error in automation files | Check configuration, use `check_config` |

## Quick Reference Card

**Automation Commands:**
```bash
# List all automations
--action states --filter automation

# Get specific automation
--action entity --entity automation.<name>

# Trigger automation
--action call_service --domain automation --service trigger --service_data '{"entity_id":"automation.<name>"}'

# Enable automation
--action call_service --domain automation --service turn_on --service_data '{"entity_id":"automation.<name>"}'

# Disable automation
--action call_service --domain automation --service turn_off --service_data '{"entity_id":"automation.<name>"}'

# Reload all automations
--action call_service --domain automation --service reload
```

**Status Check:**
```bash
# Check if enabled
--action entity --entity automation.<name> | jq '.state == "on"'

# Last triggered
--action entity --entity automation.<name> | jq '.attributes.last_triggered'
```

## Tips

1. **List first** to find automation entity IDs
2. **Use `automation.` prefix** for entity IDs
3. **Reload after changes** to automation YAML files
4. **Check automation attributes** for `last_triggered` times
5. **Toggle vs turn_on/turn_off**: Toggle flips state, turn_on/off sets state
6. **Bypass conditions** with `skip_condition: true` when testing
7. **Monitor automations** in logbook for debugging

## Creating Automations

**Note:** This workflow focuses on managing existing automations.

To **create** automations:
1. Use Home Assistant UI: Settings → Automations → Create Automation
2. Edit `automations.yaml` in your Home Assistant config directory
3. Use Blueprints for reusable automation templates

Automations in YAML:
```yaml
automation:
  - alias: "Good Morning"
    trigger:
      - platform: time
        at: "07:00:00"
    action:
      - service: light.turn_on
        data:
          entity_id: light.bedroom
```
