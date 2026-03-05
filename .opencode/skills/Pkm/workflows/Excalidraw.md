# Excalidraw Workflow

Create and manage Excalidraw diagrams in your Obsidian vault.

## Triggers
- "create diagram"
- "new drawing"
- "excalidraw"
- "visual diagram"
- "architecture diagram"
- "flowchart"

## Excalidraw in Obsidian

Your vault has the Excalidraw plugin configured:
- **Version:** 2.18.0
- **Drawing templates:** `Extras/templates/Excalidraw/`
- **Default save location:** `Cards/` (diagrams are first-class notes, NOT attachments)

**IMPORTANT:** Excalidraw diagrams are notes, not attachments. Always save to `Cards/` unless the diagram is specifically about a topic that belongs elsewhere.

## Creating a New Drawing

### Method 1: Create Empty Excalidraw File

```bash
VAULT="/mnt/c/Users/kheer/Dropbox/PKM"
TITLE="Architecture Diagram"

cat > "${VAULT}/Cards/${TITLE}.excalidraw.md" << 'EOF'
---
excalidraw-plugin: parsed
tags: [excalidraw, diagram]
---
# ${TITLE}

==⚠  Switch to TORTURE MODE to edit this Excalidraw drawing  ⚠==

# Excalidraw Data
```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://github.com/zsviczian/obsidian-excalidraw-plugin",
  "elements": [],
  "appState": {
    "gridSize": null,
    "viewBackgroundColor": "#ffffff"
  },
  "files": {}
}
```
EOF
```

### Method 2: Use Obsidian Command

Tell user to:
1. Open Obsidian
2. `Ctrl+P` → "Excalidraw: Create new drawing"
3. Or use Spacekeys: `SPC e` → Excalidraw menu

## Embedding Drawings in Notes

### Embed Full Drawing
```markdown
![[path/to/drawing.excalidraw]]
```

### Embed Specific Group/Frame
```markdown
![[drawing.excalidraw#^group=groupId]]
![[drawing.excalidraw#^frame=frameName]]
```

### Embed as Image (PNG)
```markdown
![[drawing.excalidraw|width=500]]
```

## Diagram Types & Templates

### Architecture Diagram
Components: boxes, arrows, labels
```
┌─────────────┐     ┌─────────────┐
│   Client    │────▶│    API      │
└─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │  Database   │
                    └─────────────┘
```

### Flowchart
Components: shapes, decision diamonds, flow arrows
```
    ┌───────┐
    │ Start │
    └───┬───┘
        ▼
    ┌───────┐
    │ Step  │
    └───┬───┘
        ▼
    ◇ Decision ◇
   /           \
  ▼             ▼
┌───┐         ┌───┐
│Yes│         │ No│
└───┘         └───┘
```

### Mind Map
Components: central topic, branches, nodes
```
           ┌─── Subtopic 1
           │
Topic ─────┼─── Subtopic 2
           │
           └─── Subtopic 3
```

### Sequence Diagram
Components: lifelines, messages, activations
```
Client          Server          Database
  │                │                │
  │───request────▶│                │
  │                │───query──────▶│
  │                │◀──result──────│
  │◀──response────│                │
```

## Hotkeys Reference

| Action | Hotkey |
|--------|--------|
| Toggle Excalidraw view | `Alt+Ctrl+E` |
| Search text in drawings | `Alt+Ctrl+F` |
| Add file to drawing | `Alt+Ctrl+I` |
| Open drawing properties | `Alt+Shift+P` |

## Best Practices

1. **Naming:** Use descriptive names (dates optional)
   - `Auth Flow.excalidraw.md`
   - `System Architecture.excalidraw.md`

2. **Organization:** Store in `Cards/` (default) - diagrams are first-class notes

3. **Linking:** Reference from notes:
   ```markdown
   ## Architecture
   See the diagram: ![[2024-12-21-auth-flow.excalidraw|600]]
   ```

4. **Groups:** Use frames to organize sections
   - Frame: "Overview", "Details", "Legend"

5. **Export:** Use plugin export for sharing
   - PNG for images
   - SVG for scalable graphics

## ExcaliBrain Integration

Your vault also has ExcaliBrain for visual graph navigation:
- Shows note connections visually
- Navigate by clicking nodes
- Hotkey: Check Spacekeys config

## Output Format

When creating diagrams:
1. **Create the file** with basic Excalidraw structure
2. **Provide the path** to the new file
3. **Give Obsidian URI** to open directly
4. **Explain next steps** for editing in Obsidian
