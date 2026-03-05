# Home Assistant Skill - Setup and Configuration Guide

This guide will help you configure the Home Assistant skill to manage your Home Assistant instance at `http://192.168.4.222:8123`.

## Quick Start

### 1. Generate Access Token

1. Open Home Assistant in your browser: `http://192.168.4.222:8123`
2. Click on your user profile (bottom-left corner)
3. Scroll down to **Long-Lived Access Tokens**
4. Click **Create Token**
5. Enter a name: **"PAI Integration"**
6. Click **Generate**
7. **Copy the token** (you won't see it again!)

### 2. Configure Environment Variables

Add to your shell configuration (`.bashrc`, `.zshrc`, or run interactively):

```bash
export HOME_ASSISTANT_URL="http://192.168.4.222:8123"
export HOME_ASSISTANT_TOKEN="your_long_lived_access_token_here"
```

**Test the configuration:**
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts --action check_api
```

Expected output:
```json
{
  "message": "API running."
}
```

### 3. Skill Is Ready! 🎉

You can now ask about your smart home:
- "Turn on the living room light"
- "What's the current temperature?"
- "Show me all automations"
- "Check for errors in Home Assistant"

## Skill Structure

```
/home/prowler/.claude/skills/HomeAssistant/
├── SKILL.md                    # Main skill documentation
├── Tools/
│   └── HomeAssistant.ts       # REST API client
├── Workflows/
│   ├── ControlDevices.md        # Device control guide
│   ├── QueryStates.md         # Query entities and states
│   ├── ManageAutomations.md    # Automation management
│   └── MonitorSystem.md       # System health monitoring
└── README.md                  # This file
```

## Available Workflows

### 1. ControlDevices
Turn devices on/off, toggle switches, control lights, climate, media players, etc.

**When to use:**
- "Turn on/off [device]"
- "Toggle [light/switch]"
- "Set thermostat to [temperature]"
- "Play music on [speaker]"

### 2. QueryStates
Get entity information, filter by domain, query states, check device status.

**When to use:**
- "Show me all lights"
- "What entities are on?"
- "What's the temperature?"
- "List all sensors"

### 3. ManageAutomations
Enable, disable, trigger, and list automations.

**When to use:**
- "Trigger 'Good Morning' automation"
- "Enable 'Security' automation"
- "Show me all automations"
- "Reload automations after config changes"

### 4. MonitorSystem
Check system health, error logs, configuration, and diagnostics.

**When to use:**
- "Check Home Assistant health"
- "Show me any errors"
- "Validate configuration"
- "What components are loaded?"

## Common Tasks

### Control a Light
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain light \
  --service turn_on \
  --service_data '{"entity_id":"light.living_room"}'
```

### Check Entity State
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action entity \
  --entity light.living_room
```

### List All Lights
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter light
```

### Trigger Automation
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain automation \
  --service trigger \
  --service_data '{"entity_id":"automation.good_morning"}'
```

### Check Errors
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action error_log
```

### System Health Check
```bash
# Create health check script
cat > ~/health_check.sh << 'EOF'
#!/bin/bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts --action check_api && \
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts --action check_config && \
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts --action error_log | head -20
EOF

chmod +x ~/health_check.sh
~/health_check.sh
```

## Domain Reference

| Domain | Example Services | Use Case |
|--------|------------------|-----------|
| `light` | turn_on, turn_off, toggle | Lights, bulbs |
| `switch` | turn_on, turn_off, toggle | Smart plugs, relays |
| `climate` | set_temperature, set_hvac_mode | Thermostats |
| `sensor` | - | Temperature, humidity, battery |
| `binary_sensor` | - | Motion, door/window sensors |
| `media_player` | play_media, pause | TVs, speakers |
| `automation` | trigger, turn_on/off | Automations |
| `scene` | turn_on | Predefined scenes |
| `script` | turn_on | Custom scripts |

## Environment Variables

### Required Variables

```bash
HOME_ASSISTANT_URL     # Home Assistant URL (default: http://localhost:8123)
HOME_ASSISTANT_TOKEN     # Long-lived access token (REQUIRED)
```

### Optional Variables

```bash
PAI_DIR                # Path to PAI directory (default: $HOME/.config/pai)
```

## Security Best Practices

### 1. Token Management
- ✅ Use environment variables for tokens
- ❌ Never hardcode tokens in scripts
- 🔄 Rotate tokens if compromised
- 📝 Keep copy of token in secure password manager

### 2. Network Security
- 🔒 Use HTTPS for remote access (recommended)
- 🌐 Set up reverse proxy (Nginx, Traefik) for HTTPS
- 🚫 Don't expose Home Assistant directly to internet without auth
- 🔐 Enable Two-Factor Authentication in Home Assistant

### 3. Token Generation
- Generate dedicated tokens for different uses
- Use descriptive names: "PAI", "Homebridge", "App"
- Revoke unused tokens regularly
- Check active tokens in Home Assistant: Profile → Long-Lived Access Tokens

## Troubleshooting

### Issue: "HOME_ASSISTANT_TOKEN not set"

**Solution:**
```bash
# Check if token is set
echo $HOME_ASSISTANT_TOKEN

# If empty, set it
export HOME_ASSISTANT_TOKEN="your_token_here"

# Add to .bashrc for persistence
echo 'export HOME_ASSISTANT_TOKEN="your_token_here"' >> ~/.bashrc
source ~/.bashrc
```

### Issue: "Failed to connect to Home Assistant"

**Solutions:**
1. Check URL: `curl http://192.168.4.222:8123/`
2. Check firewall: Ensure port 8123 is accessible
3. Verify Home Assistant is running
4. Try from different network if on VPN

### Issue: "401 Unauthorized"

**Solutions:**
1. Verify token is correct: Copy from Home Assistant again
2. Check token hasn't expired (unlikely for long-lived tokens)
3. Ensure no extra whitespace in token value

### Issue: "Entity not found"

**Solutions:**
1. List all entities to find correct ID: `--action states`
2. Check entity ID format: `domain.unique_id`
3. Verify entity exists in Home Assistant UI

### Issue: "Service not found"

**Solutions:**
1. List available services: `--action services`
2. Check domain and service name
3. Verify entity type supports requested service

## Integration with PAI

This skill integrates seamlessly with PAI infrastructure:

### Auto-Routing
The skill auto-routes when you mention:
- "Home Assistant", "HASS"
- Smart home devices, lights, switches
- Automations, entities, services
- Home automation, IoT devices

### Example Conversations

**Conversation 1: Device Control**
```
You: "Turn on the living room light"
AI: [Calls ha_call_service]
    "Turning on light.living_room..."

You: "What's the temperature?"
AI: [Calls ha_entity]
    "The current temperature is 22°C from sensor.temperature"
```

**Conversation 2: Automation Management**
```
You: "Show me all automations"
AI: [Calls ha_states with filter]
    "Found 15 automations:
     - Good Morning (enabled)
     - Good Night (enabled)
     - Security Alert (disabled)
     ..."

You: "Trigger the Good Morning automation"
AI: [Calls ha_call_service with automation.trigger]
    "Triggering automation.good_morning..."
```

**Conversation 3: System Monitoring**
```
You: "Check Home Assistant for errors"
AI: [Calls ha_error_log]
    "No errors found in the log. System is healthy."
```

## Advanced Usage

### Bulk Operations

```bash
# Turn off all lights
for entity in $(bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states --filter light | jq -r '.[].entity_id'); do
  bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
    --action call_service \
    --domain light \
    --service turn_off \
    --service_data "{\"entity_id\":\"$entity\"}"
done
```

### Filtering with jq

```bash
# Get all "on" entities
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '[.[] | select(.state == "on")]'

# Get temperature sensors
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '[.[] | select(.entity_id | contains("temperature"))]'
```

### Automation Scripts

Create reusable scripts for common tasks:

```bash
# ~/scripts/ha_lights.sh
#!/bin/bash
case "$1" in
  on)
    bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
      --action call_service \
      --domain light \
      --service turn_on \
      --service_data '{"entity_id":"light.all"}'
    ;;
  off)
    bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
      --action call_service \
      --domain light \
      --service turn_off \
      --service_data '{"entity_id":"light.all"}'
    ;;
  *)
    echo "Usage: $0 {on|off}"
    ;;
esac

# Make executable and use
chmod +x ~/scripts/ha_lights.sh
~/scripts/ha_lights.sh on
```

## API Reference

### Available Actions

| Action | Description | Example |
|--------|-------------|----------|
| `check_api` | Verify API is running | `--action check_api` |
| `states` | Get all entity states | `--action states` |
| `entity` | Get specific entity | `--action entity --entity light.*` |
| `set_entity` | Set entity state | `--action set_entity --entity ... --state ...` |
| `delete_entity` | Delete entity | `--action delete_entity --entity ...` |
| `services` | List all services | `--action services` |
| `call_service` | Call service | `--action call_service --domain ... --service ...` |
| `history` | Get historical data | `--action history --filter ...` |
| `logbook` | Get logbook entries | `--action logbook` |
| `config` | Get configuration | `--action config` |
| `components` | List loaded components | `--action components` |
| `events` | List events | `--action events` |
| `error_log` | Get error log | `--action error_log` |
| `template` | Render template | `--action template --template "..."` |
| `calendars` | List calendars | `--action calendars` |
| `calendar_events` | Get calendar events | `--action calendar_events --entity ...` |
| `fire_event` | Fire custom event | `--action fire_event --entity ...` |
| `check_config` | Validate config | `--action check_config` |

## Next Steps

1. ✅ Generate your access token
2. ✅ Set environment variables
3. ✅ Test with `--action check_api`
4. ✅ Explore your entities: `--action states`
5. ✅ Try controlling a device
6. ✅ Review workflows for more examples

## Support

- **Home Assistant Documentation**: https://www.home-assistant.io
- **REST API Docs**: https://developers.home-assistant.io/docs/api/rest/
- **Community**: https://community.home-assistant.io

## Version

Home Assistant Skill v1.0.0
- Complete REST API coverage
- TypeScript-based client
- Comprehensive workflows
- Auto-routing integration

---

**Your Home Assistant skill is ready to manage your smart home!** 🏠
