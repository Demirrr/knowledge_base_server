# Examples

This folder contains example scripts demonstrating the Knowledge Base Server features.

## Visualization Example

The `visualize.js` script opens an interactive browser visualization of your knowledge base.

### Prerequisites

Make sure the project is built first:

```bash
npm install
npm run build
```

### Usage

#### Option 1: Use Sample Data

Run without arguments to see a demonstration with sample data:

```bash
node examples/visualize.js
```

This creates a sample knowledge base with people, companies, projects, cities, and technologies - perfect for exploring the visualization features.

#### Option 2: Visualize Your Own Knowledge Base

Provide a path to your JSONL knowledge base file:

```bash
node examples/visualize.js path/to/your/knowledge_base.jsonl
```

#### Option 3: Use the Provided Sample File

```bash
node examples/visualize.js examples/sample_knowledge_base.jsonl
```

### What You'll See

The visualization opens in your default browser with:

- **Nodes**: Entities displayed as colored circles (color-coded by entity type)
- **Edges**: Relations shown as directed arrows with labels
- **Sidebar**: Click any node to see its observations and relationships
- **Legend**: Shows all entity types and their colors

### Interactive Features

- **Drag**: Click and drag nodes to rearrange the layout
- **Zoom**: Use mouse wheel to zoom in/out
- **Pan**: Click and drag on empty space to pan
- **Select**: Click a node to view its details in the sidebar
- **Reset**: Click "Reset View" button to reset zoom level
- **Toggle Labels**: Click "Toggle Labels" to show/hide edge labels

### Sample Knowledge Base Format

The knowledge base uses JSONL (JSON Lines) format. Each line is a JSON object:

**Entity format:**
```json
{"type":"entity","name":"Alice","entityType":"person","observations":["Software Engineer","Loves hiking"]}
```

**Relation format:**
```json
{"type":"relation","from":"Alice","to":"TechCorp","relationType":"works_at"}
```

See `sample_knowledge_base.jsonl` for a complete example.

## Screenshot

When you run the visualization, you'll see something like this:

```
🧠 Knowledge Base Visualization Example

No file provided - using sample data.

📝 Creating sample knowledge base...
   Created 11 entities and 16 relations

📊 Graph Statistics:
   Entities: 11
   Relations: 16
   Entity Types: person, company, project, city, technology

🚀 Starting visualization server...

✨ Visualization opened at: http://127.0.0.1:3000

💡 Tips:
   • Drag nodes to rearrange the layout
   • Click on a node to see its details
   • Use mouse wheel to zoom in/out
   • Press "Reset View" to reset zoom

Press Ctrl+C to stop the server...
```
