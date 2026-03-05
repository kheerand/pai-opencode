---
name: HomeAssistant
description: Home Assistant management and automation. USE WHEN user asks about smart home, devices, automations, entities, services, OR mentions home automation, IoT devices, smart lights, thermostats, sensors, home control.
type: skill
purpose-type: [automation, monitoring, iot]
platform: claude-code
dependencies: []
keywords: [home assistant, smart home, automation, entities, services, iot, devices, lights, sensors, thermostat, home automation]
---

# Home Assistant Skill

> Complete management and automation for Home Assistant instances - control devices, manage automations, query states, and interact with your smart home

## Overview

The Home Assistant skill provides comprehensive management for Home Assistant instances:
- **Entity Control**: Query and control all devices (lights, switches, sensors, etc.)
- **Service Execution**: Call any Home Assistant service with parameters
- **Automation Management**: Enable/disable, list, trigger automations
- **History & Logs**: Access historical data and error logs
- **System Monitoring**: Check configuration, components, and system status
- **WebSocket Integration**: Real-time state updates and subscriptions

## Auto-Routing Triggers

This skill auto-routes when user mentions:
- "Home Assistant", "HASS"
- Smart home devices (lights, switches, thermostats, sensors)
- Home automation, automations
- Entities, services, states
- IoT devices, smart home control

## Key Concepts

### Entities
Everything in Home Assistant is an entity:
- `light.living_room` - Controls a light
- `sensor.temperature` - Reads temperature
- `switch.plug_1` - Controls a smart plug
- `binary_sensor.motion` - Motion detector

### Services
Actions you can perform:
- `light.turn_on`, `light.turn_off` - Control lights
- `switch.toggle`, `homeassistant.toggle` - Toggle devices
- `automation.trigger`, `automation.reload` - Manage automations

### Domains
Entity prefixes that indicate type:
- `light.*`, `switch.*`, `sensor.*`, `binary_sensor.*`
- `climate.*`, `media_player.*`, `camera.*`, `automation.*`

## Configuration

Required environment variables:

```bash
# Home Assistant instance URL
export HOME_ASSISTANT_URL="http://192.168.4.222:8123"

# Long-lived access token (generate in Home Assistant UI: Profile → Create Token)
export HOME_ASSISTANT_TOKEN="your_long_lived_access_token"
```

**Generate Token:**
1. Open Home Assistant UI: http://192.168.4.222:8123
2. Click profile (bottom left)
3. Scroll to "Long-Lived Access Tokens"
4. Click "Create Token"
5. Name it "PAI Integration"
6. Copy token and set as HOME_ASSISTANT_TOKEN

## Available Tools

| Tool | Purpose |
|------|---------|
| `ha_states` | Get all entity states |
| `ha_entity` | Get/set specific entity state |
| `ha_services` | List all available services |
| `ha_call_service` | Call a service with parameters |
| `ha_history` | Get historical state changes |
| `ha_logbook` | Get logbook entries |
| `ha_config` | Get Home Assistant configuration |
| `ha_components` | List loaded components |
| `ha_error_log` | Retrieve error logs |
| `ha_template` | Render Home Assistant templates |
| `ha_calendar` | Get calendar events |
| `ha_fire_event` | Fire custom events |
| `ha_check_config` | Validate configuration |

## Workflow Routing

### Common Tasks

| Task | Workflow |
|------|----------|
| "Turn on lights" | Direct API call via tools |
| "Check all sensors" | `ha_states` with filtering |
| "Create automation" | Guide user to UI (limited API) |
| "View history" | `ha_history` workflow |
| "Debug errors" | `ha_error_log` → analyze |
| "Trigger automation" | `ha_call_service` → `automation.trigger` |

## Model Selection

| Task Type | Model | Reason |
|-----------|-------|--------|
| Entity queries | `haiku` | Fast, structured data |
| Service calls | `sonnet` | Balanced reliability |
| Complex automation analysis | `opus` | Maximum reasoning |

## Usage Examples

### Control Devices
```
User: "Turn on the living room light"
→ ha_call_service(light.turn_on, entity_id: light.living_room)

User: "What's the current temperature?"
→ ha_entity(sensor.temperature)

User: "Toggle the bedroom lamp"
→ ha_call_service(homeassistant.toggle, entity_id: light.bedroom_lamp)
```

### Query States
```
User: "Show me all lights"
→ ha_states → filter for light.* entities

User: "What entities are on?"
→ ha_states → filter state == "on"

User: "List all sensors"
→ ha_states → filter for sensor.* entities
```

### Automation Management
```
User: "Trigger the 'Good Morning' automation"
→ ha_call_service(automation.trigger, entity_id: automation.good_morning)

User: "Reload all automations"
→ ha_call_service(automation.reload)

User: "List all automations"
→ ha_states → filter for automation.* entities
```

### History & Monitoring
```
User: "What happened yesterday?"
→ ha_logbook with time range

User: "Temperature history for the past week"
→ ha_history(sensor.temperature, start: 7 days ago)

User: "Any errors recently?"
→ ha_error_log → analyze issues
```

## Architecture

### Home Assistant API Client
- REST API wrapper with authentication
- Automatic token management
- Error handling and retry logic
- Response caching for performance

### WebSocket Support (Future)
Real-time state subscriptions for:
- Live entity updates
- Event streaming
- Automation triggers

## Security Notes

- **Never expose tokens** in commits or logs
- Use environment variables for credentials
- Long-lived tokens are valid for 10 years
- Rotate tokens if compromised
- HTTPS recommended for remote access

## Error Handling

Common errors:
- `401 Unauthorized` → Invalid token
- `404 Not Found` → Entity doesn't exist
- `400 Bad Request` → Invalid service parameters

Always provide clear error messages and suggested fixes.

## Customization

### Extending Tools
Add new API endpoints to `Tools/` directory following the naming pattern `ha_<endpoint>.ts`.

### Domain-Specific Workflows
Create custom workflows in `Workflows/` for specific domains (Zigbee, Z-Wave, etc.).

### Voice Integration
Map entity names to voice commands for hands-free control.

## Credits

- Home Assistant: https://www.home-assistant.io
- REST API: https://developers.home-assistant.io/docs/api/rest/
- WebSocket API: https://developers.home-assistant.io/docs/api/websocket/

## Related Work

- This skill provides Home Assistant management capabilities
- Integrates with PAI's observability system for monitoring
- Can trigger automations based on other PAI events

## Changelog

### 1.0.0 - 2025-01-06
- Initial release
- Complete REST API coverage
- Entity and service management
- History and logbook access
- Configuration validation
- Error log retrieval
