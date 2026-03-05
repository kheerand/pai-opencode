# MonitorSystem Workflow

**Monitor Home Assistant system health, check logs, validate configuration, and analyze errors.**

## When to Use

User requests:
- "Check system health"
- "Are there any errors?"
- "Show error logs"
- "Validate configuration"
- "What components are loaded?"
- "Check API status"
- "System diagnostics"

## Prerequisites

```bash
export HOME_ASSISTANT_URL="http://192.168.4.222:8123"
export HOME_ASSISTANT_TOKEN="your_long_lived_access_token"
```

## Workflow Steps

### Step 1: API Health Check

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action check_api
```

Expected output:
```json
{
  "message": "API running."
}
```

### Step 2: Get Error Log

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action error_log
```

### Step 3: Analyze Error Patterns

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action error_log | grep -E "ERROR|WARNING|CRITICAL"
```

### Step 4: Check Configuration

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action check_config
```

Expected output:
```json
{
  "errors": null,
  "result": "valid"
}
```

Or if errors exist:
```json
{
  "errors": "Integration not found: some_integration",
  "result": "invalid"
}
```

### Step 5: Get System Configuration

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action config
```

### Step 6: List Loaded Components

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action components
```

### Step 7: Get Registered Events

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action events
```

## System Health Dashboard

```bash
#!/bin/bash
# Complete system health check

echo "=== Home Assistant System Health ==="
echo ""

# 1. API Status
echo "1. API Status:"
API_STATUS=$(bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts --action check_api 2>&1)
if echo "$API_STATUS" | grep -q "API running"; then
  echo "   ✅ API is running"
else
  echo "   ❌ API is down"
fi

# 2. Configuration Check
echo ""
echo "2. Configuration:"
CONFIG=$(bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts --action check_config 2>&1)
if echo "$CONFIG" | grep -q '"result": "valid"'; then
  echo "   ✅ Configuration is valid"
else
  echo "   ❌ Configuration errors found:"
  echo "$CONFIG" | jq '.errors'
fi

# 3. Component Count
echo ""
echo "3. Loaded Components:"
COMP_COUNT=$(bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts --action components 2>&1 | jq 'length')
echo "   📊 Total components: $COMP_COUNT"

# 4. Entity Count by Domain
echo ""
echo "4. Entity Counts:"
ALL_STATES=$(bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts --action states 2>&1)

for domain in light switch sensor binary_sensor automation; do
  COUNT=$(echo "$ALL_STATES" | jq "[.[] | select(.entity_id | startswith(\"${domain}.\") ] | length")
  echo "   ${domain}: $COUNT"
done

# 5. Error Log Summary
echo ""
echo "5. Error Log (Last 10 lines):"
ERROR_LOG=$(bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts --action error_log 2>&1)
ERROR_COUNT=$(echo "$ERROR_LOG" | wc -l)
if [ $ERROR_COUNT -eq 0 ]; then
  echo "   ✅ No errors"
else
  echo "   ⚠️  $ERROR_COUNT lines in error log"
  echo "$ERROR_LOG" | tail -10 | sed 's/^/     /'
fi

# 6. Recent Event Activity
echo ""
echo "6. Recent Events:"
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts --action events 2>&1 | \
  jq -r '.[] | "   \(.event): \(.listener_count) listeners"' | \
  head -5

echo ""
echo "=== End of Health Check ==="
```

Save as `health_check.sh` and run:
```bash
chmod +x health_check.sh
./health_check.sh
```

## Error Analysis Patterns

### Pattern 1: Integration Errors
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action error_log | grep "Integration\|component"

# Example output:
# Error while setting up platform sonos
# Failed to setup integration hue
```

**Solutions:**
- Check integration configuration in `configuration.yaml`
- Verify integration is installed
- Check network connectivity to integration
- Restart integration: `--action call_service --domain homeassistant --service reload_core_config`

### Pattern 2: Entity Errors
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action error_log | grep "entity\|state"

# Example output:
# State of sensor.temperature is not valid
# Entity light.unknown not found
```

**Solutions:**
- Check entity ID spelling
- Verify entity exists: `--action entity --entity <entity_id>`
- Remove invalid entities from configuration
- Restart Home Assistant if entity database corrupted

### Pattern 3: Service Errors
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action error_log | grep "Service\|service"

# Example output:
# Service light.turn_on failed
# Unknown service automation.trigger
```

**Solutions:**
- Check service availability: `--action services`
- Verify service parameters
- Check domain is correct

### Pattern 4: Connection Errors
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action error_log | grep -E "Connection|Timeout|Network"

# Example output:
# Connection to device failed
# Timeout waiting for response
```

**Solutions:**
- Check network connectivity
- Verify device is powered on
- Check firewall rules
- Increase timeout in integration config

## Component Analysis

### List All Components
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action components | jq -r '.[]'
```

### Filter Components by Type
```bash
# Integrations
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action components | grep -E "^integration\."

# Custom components
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action components | grep "custom_component"

# Built-in components
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action components | grep -v "custom" | grep -v "integration"
```

### Check Specific Component
```bash
# Check if integration is loaded
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action components | grep -q "integration.mqtt" && echo "MQTT loaded" || echo "MQTT not loaded"
```

## Configuration Validation

### Validate Full Configuration
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action check_config | jq '.'
```

### Check for Specific Errors
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action check_config | jq '.errors' | grep -i "automation\|script\|sensor"
```

### Fix Configuration Errors

**Example 1: Missing Integration**
```
Error: Integration not found: mqtt
Solution: Add MQTT to configuration.yaml:
mqtt:
  broker: localhost
```

**Example 2: Invalid Entity**
```
Error: Entity sensor.invalid does not exist
Solution: Remove entity from automations/scripts or correct ID
```

**Example 3: YAML Syntax Error**
```
Error: Invalid YAML
Solution: Check indentation and syntax in configuration files
```

## Event Monitoring

### List All Events
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action events | jq -r '.[] | "\(.event): \(.listener_count) listeners"'
```

### Monitor Specific Event
```bash
# Check state_changed event listeners
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action events | jq '.[] | select(.event == "state_changed")'
```

### High-Listener Events
```bash
# Events with many listeners (potential performance issues)
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action events | jq '.[] | select(.listener_count > 5)'
```

## Log Monitoring Script

```bash
#!/bin/bash
# Real-time error monitoring

INTERVAL=60  # Check every 60 seconds

while true; do
  echo "[$(date)] Checking for errors..."
  ERROR_COUNT=$(bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
    --action error_log 2>&1 | wc -l)

  if [ $ERROR_COUNT -gt 0 ]; then
    echo "⚠️  Found $ERROR_COUNT error lines"

    # Show new errors
    bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
      --action error_log 2>&1
  else
    echo "✅ No errors"
  fi

  echo "Waiting $INTERVAL seconds..."
  sleep $INTERVAL
done
```

## System Diagnostics

### Check Home Assistant Version
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action config | jq '.version'
```

### Check Time Zone
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action config | jq '.time_zone'
```

### Check Location
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action config | jq '{
  location: .location_name,
  latitude: .latitude,
  longitude: .longitude,
  elevation: .elevation
}'
```

### Check Unit System
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant/Tools/HomeAssistant.ts \
  --action config | jq '.unit_system'
```

## Performance Monitoring

### Count Unavailable Entities
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '[.[] | select(.state == "unavailable")] | length'
```

### Count Unknown States
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '[.[] | select(.state == "unknown")] | length'
```

### Entity State Distribution
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '
    group_by(.state) |
    map({state: .[0].state, count: length}) |
    sort_by(.count) | reverse
  '
```

## Quick Reference Card

**Health Commands:**
```bash
# API health
--action check_api

# Configuration check
--action check_config

# Error log
--action error_log

# Components
--action components

# System config
--action config

# Events
--action events
```

**Error Analysis:**
```bash
# All errors
--action error_log

# Integration errors
--action error_log | grep -i "integration\|component"

# Entity errors
--action error_log | grep -i "entity\|state"

# Connection errors
--action error_log | grep -i "connection\|timeout"
```

## Tips

1. **Run health checks regularly** - catch issues early
2. **Monitor error logs** - look for patterns and recurring errors
3. **Validate config after changes** - use `check_config`
4. **Check unavailable entities** - might indicate device issues
5. **Review event listeners** - high counts may indicate performance issues
6. **Keep Home Assistant updated** - fixes known bugs
7. **Backup configuration** before making changes
8. **Test automations** after reload

## Troubleshooting Guide

| Issue | Diagnostic Command | Solution |
|-------|-------------------|----------|
| API down | `--action check_api` | Restart Home Assistant |
| Config errors | `--action check_config` | Fix YAML syntax, remove invalid components |
| Many unavailable entities | `--action states \| jq 'unavailable count'` | Check device connectivity |
| Integration errors | `--action error_log \| grep integration` | Check integration config, restart integration |
| High CPU/memory | Check component count | Disable unused integrations |
| Automations not firing | Check automation state, error log | Ensure automation is enabled, check trigger conditions |
