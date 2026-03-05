# ControlDevices Workflow

**Control and manage Home Assistant devices through services and state changes.**

## When to Use

User requests:
- "Turn on/off [device]"
- "Toggle [light/switch]"
- "Set [device] to [state]"
- "Control [domain] devices"
- "Turn on all lights"

## Prerequisites

Ensure environment variables are set:
```bash
export HOME_ASSISTANT_URL="http://192.168.4.222:8123"
export HOME_ASSISTANT_TOKEN="your_long_lived_access_token"
```

## Workflow Steps

### Step 1: Identify the Action

Determine from user request:
- **Action**: turn_on, turn_off, toggle, or set_state
- **Entity**: Specific entity ID or domain wildcard
- **Domain**: light, switch, climate, media_player, etc.
- **Parameters**: Brightness, color, temperature, etc.

### Step 2: Execute the Control

#### Turn On Device
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain light \
  --service turn_on \
  --service_data '{"entity_id":"light.living_room"}'
```

#### Turn Off Device
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain light \
  --service turn_off \
  --service_data '{"entity_id":"light.living_room"}'
```

#### Toggle Device
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain homeassistant \
  --service toggle \
  --service_data '{"entity_id":"switch.plug_1"}'
```

#### Set Entity State Directly
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action set_entity \
  --entity input_boolean.mode \
  --state "on"
```

### Step 3: Control Multiple Devices

#### Turn On All Lights
```bash
# First get all light entities
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter light > lights.json

# Then call turn_on with all light entities
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain light \
  --service turn_on \
  --service_data '{"entity_id":"all"}'
```

#### Control Multiple Specific Devices
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain light \
  --service turn_on \
  --service_data '{"entity_id":["light.living_room","light.bedroom","light.kitchen"]}'
```

### Step 4: Advanced Device Control

#### Light with Brightness and Color
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain light \
  --service turn_on \
  --service_data '{
    "entity_id":"light.living_room",
    "brightness": 255,
    "rgb_color": [255, 100, 50]
  }'
```

#### Set Temperature (Thermostat)
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain climate \
  --service set_temperature \
  --service_data '{
    "entity_id":"climate.thermostat",
    "temperature": 22
  }'
```

#### Play Media
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain media_player \
  --service play_media \
  --service_data '{
    "entity_id":"media_player.tv",
    "media_content_type":"music",
    "media_content_id":"spotify:track:xyz"
  }'
```

## Domain Reference

| Domain | Services | Example Entities |
|--------|-----------|-----------------|
| `light` | turn_on, turn_off, toggle, turn_on, set_brightness, set_color | light.living_room, light.bedroom |
| `switch` | turn_on, turn_off, toggle | switch.plug_1, switch.pump |
| `climate` | set_temperature, set_hvac_mode, set_preset_mode | climate.thermostat, climate.hvac |
| `media_player` | play_media, pause, turn_on, turn_off | media_player.tv, media_player.spotify |
| `cover` | open_cover, close_cover, toggle, set_position | cover.garage, cover.blinds |
| `lock` | lock, unlock | lock.front_door |
| `scene` | turn_on, reload, apply | scene.good_morning, scene.movie_time |
| `script` | turn_on, reload, cancel | script.good_night |
| `homeassistant` | toggle, reload_core_config, restart | [toggle any entity] |
| `input_boolean` | turn_on, turn_off, toggle | input_boolean.guest_mode |
| `input_select` | select_option | input_select.house_mode |
| `input_number` | set_value | input_number.volume |

## Common Mistakes

### ❌ Wrong Domain for Entity
```bash
# WRONG: light. is domain, not entity_id in service_data
--service_data '{"entity_id":"light.light.living_room"}'

# CORRECT: Use just the entity_id
--service_data '{"entity_id":"light.living_room"}'
```

### ❌ Invalid Service Data Format
```bash
# WRONG: Single quotes around JSON
--service_data "'{\"entity_id\":\"light.living_room\"}'"

# CORRECT: Proper JSON (use double quotes inside)
--service_data '{"entity_id":"light.living_room"}'
```

### ❌ Forgetting Entity ID
```bash
# WRONG: No target specified
--action call_service --domain light --service turn_on

# CORRECT: Always specify entity_id
--service_data '{"entity_id":"light.living_room"}'
```

## Quick Reference Card

**Control Commands:**
```bash
# Turn on/off
--action call_service --domain <domain> --service turn_on|turn_off --service_data '{"entity_id":"<entity_id>"}'

# Toggle
--action call_service --domain homeassistant --service toggle --service_data '{"entity_id":"<entity_id>"}'

# Set state
--action set_entity --entity <entity_id> --state "<state>"
```

## Error Handling

| Error | Cause | Solution |
|--------|--------|----------|
| `400 Bad Request` | Invalid service_data format | Check JSON syntax |
| `404 Not Found` | Entity doesn't exist | Verify entity_id spelling |
| `Service not found` | Wrong domain/service combo | Check available services |
| `Value must be between X and Y` | Parameter out of range | Adjust brightness, temp, etc. |

## Examples

### Example 1: Evening Routine
```bash
# Turn on living room light at 50% brightness
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain light \
  --service turn_on \
  --service_data '{"entity_id":"light.living_room","brightness":128}'

# Turn on bedroom lamp
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain light \
  --service turn_on \
  --service_data '{"entity_id":"light.bedroom_lamp"}'

# Set thermostat to 22°C
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain climate \
  --service set_temperature \
  --service_data '{"entity_id":"climate.thermostat","temperature":22}'
```

### Example 2: Movie Mode
```bash
# Dim lights to 20%
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain light \
  --service turn_on \
  --service_data '{
    "entity_id":"light.living_room",
    "brightness":50,
    "color_name":"blue"
  }'

# Turn off other lights
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain light \
  --service turn_off \
  --service_data '{"entity_id":["light.kitchen","light.hallway"]}'
```

### Example 3: Morning Routine
```bash
# Trigger good morning scene
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain scene \
  --service turn_on \
  --service_data '{"entity_id":"scene.good_morning"}'

# Set house mode to Home
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action call_service \
  --domain input_select \
  --service select_option \
  --service_data '{
    "entity_id":"input_select.house_mode",
    "option":"Home"
  }'
```

## Notes

- Services are domain-specific (light.*, switch.*, etc.)
- Use `all` as entity_id to target all entities in domain
- Some services support `entity_id` as string or array
- Check `--action services` to see all available services
- Service parameters vary by domain and service type
