# QueryStates Workflow

**Query and analyze Home Assistant entity states, filter entities, and get device information.**

## When to Use

User requests:
- "Show me all [lights/sensors/devices]"
- "What entities are on/off?"
- "Get state of [device]"
- "List all [domain] entities"
- "What's the temperature/humidity?"
- "Which entities are in [state]?"

## Prerequisites

```bash
export HOME_ASSISTANT_URL="http://192.168.4.222:8123"
export HOME_ASSISTANT_TOKEN="your_long_lived_access_token"
```

## Workflow Steps

### Step 1: Get All States

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  > all_states.json
```

This retrieves all entity states (entities, attributes, last changed, etc.).

### Step 2: Filter by Domain

#### Get All Lights
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter light
```

#### Get All Sensors
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter sensor
```

#### Get All Switches
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter switch
```

#### Get All Automations
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter automation
```

### Step 3: Get Specific Entity

```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action entity \
  --entity light.living_room
```

### Step 4: Filter by State Programmatically

```bash
# Get all entities and filter with jq
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | \
  jq '[.[] | select(.state == "on")] | \
    {entity_id: .[].entity_id, friendly_name: .[].attributes.friendly_name}'
```

### Step 5: Common Queries

#### Query Lights Status
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter light | \
  jq '.[] | {entity: .entity_id, state: .state, name: .attributes.friendly_name}'
```

#### Query Temperature Sensors
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | \
  jq '.[] | select(.entity_id | contains("temperature")) | \
    {entity: .entity_id, temp: .state, unit: .attributes.unit_of_measurement}'
```

#### Query Battery Levels
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | \
  jq '.[] | select(.attributes.unit_of_measurement == "%") | \
    {entity: .entity_id, battery: .state, name: .attributes.friendly_name}'
```

#### Query Devices with "off" State
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | \
  jq '[.[] | select(.state == "off")] | \
    {entity_id: .[].entity_id, state: .[].state}'
```

## Domain Reference

| Domain | Description | Example Pattern |
|--------|-------------|-----------------|
| `light.*` | Lights and lighting | light.living_room, light.bedroom |
| `switch.*` | Switches and plugs | switch.plug_1, switch.pump |
| `sensor.*` | Sensors (temp, humidity, etc.) | sensor.temperature, sensor.humidity |
| `binary_sensor.*` | Binary sensors (motion, door) | binary_sensor.motion, binary_sensor.door |
| `climate.*` | Thermostats and HVAC | climate.thermostat |
| `media_player.*` | Media devices | media_player.tv, media_player.spotify |
| `camera.*` | Cameras | camera.front_door, camera.backyard |
| `cover.*` | Blinds, shades, garage | cover.garage, cover.blinds |
| `lock.*` | Smart locks | lock.front_door |
| `person.*` | People tracking | person.kheeran, person.guest |
| `device_tracker.*` | Device presence | device_tracker.phone |
| `automation.*` | Automations | automation.good_morning |
| `scene.*` | Scenes | scene.movie_time |
| `script.*` | Scripts | script.good_night |
| `zone.*` | Zones | zone.home, zone.work |

## Query Patterns

### Pattern 1: All Entities in State
```bash
# All "on" entities
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '[.[] | select(.state == "on")]'

# All "unavailable" entities
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '[.[] | select(.state == "unavailable")]'
```

### Pattern 2: Filter by Attribute
```bash
# All entities with "battery" in name
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '[.[] | select(.entity_id | contains("battery"))]'

# All entities with specific attribute value
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '[.[] | select(.attributes.device_class == "temperature")]'
```

### Pattern 3: Recently Changed Entities
```bash
# Entities changed in last hour
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '[.[] | select(
    (.last_changed | fromdateiso8601) > (now - 3600)
  )]'
```

### Pattern 4: Extract Specific Information
```bash
# Get all temperatures with friendly names
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '
    [.[] | select(.entity_id | startswith("sensor."))]
    | map({
      name: .attributes.friendly_name // .entity_id,
      value: .state,
      unit: .attributes.unit_of_measurement
    })
  '
```

## Common Use Cases

### Use Case 1: Check All Lights
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter light | jq '
    .[] | select(.state == "on") |
    "\(.attributes.friendly_name): \(.state)"
  '
```

### Use Case 2: Temperature Dashboard
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '
    [.[] | select(
      .entity_id | contains("temperature") or
      .entity_id | contains("humidity")
    )]
    | .[] | "\(.attributes.friendly_name): \(.state)\(.attributes.unit_of_measurement // "")"
  '
```

### Use Case 3: Battery Levels
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '
    [.[] | select(.attributes.unit_of_measurement == "%")]
    | sort_by(.state | tonumber)
    | .[] | "\(.attributes.friendly_name): \(.state)%"
  '
```

### Use Case 4: Automation Status
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter automation | jq '
    .[] | "\(.attributes.friendly_name): \(.state)"
  '
```

### Use Case 5: Device Health Check
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq '
    [.[] | select(.state == "unavailable" or .state == "unknown")]
    | map(.entity_id)
  '
```

## Output Formatting

### Table Format (with column)
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter light | jq -r '
    .[] | [.entity_id, .state, .attributes.friendly_name]
    | @tsv
  ' | column -t -s $'\t'
```

### JSON Pretty Print
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states \
  --filter sensor | jq '.'
```

### CSV Format
```bash
bun run $PAI_DIR/skills/HomeAssistant/Tools/HomeAssistant.ts \
  --action states | jq -r '
    .[] | [
      .entity_id,
      .state,
      .attributes.friendly_name
    ] | @csv'
```

## Error Handling

| Error | Cause | Solution |
|--------|--------|----------|
| `Entity not found` | Invalid entity_id | Check spelling and domain |
| `Empty result` | No entities match filter | Verify domain or filter criteria |
| `jq: error` | Invalid jq syntax | Check jq query format |
| `401 Unauthorized` | Invalid token | Check HOME_ASSISTANT_TOKEN |

## Quick Reference Card

**Query Commands:**
```bash
# All states
--action states

# Filter by domain
--action states --filter <domain>

# Single entity
--action entity --entity <entity_id>

# Filter with jq
--action states | jq '<query>'
```

**Common jq Patterns:**
```bash
# State equals value
select(.state == "on")

# Domain filter
select(.entity_id | startswith("light."))

# Attribute filter
select(.attributes.battery_level < 20)

# Contains pattern
select(.entity_id | contains("temperature"))
```

## Tips

1. **Use domain filtering first** to reduce payload size
2. **Pipe to jq** for complex filtering and formatting
3. **Save to file** for large queries: `> states.json`
4. **Check attributes** for friendly names and units
5. **Use `select()`** in jq for filtering entities
6. **Sort results** with `sort_by(.state | tonumber)` for numeric values
