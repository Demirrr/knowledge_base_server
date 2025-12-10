# Architecture

## System Overview

```
┌─────────────────────────────────────────────────┐
│                 MCP Client                       │
│          (Claude Desktop, VS Code, etc.)         │
└───────────────────┬─────────────────────────────┘
                    │
                    │ MCP Protocol (stdio)
                    │
┌───────────────────▼─────────────────────────────┐
│          Knowledge Base MCP Server               │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │         McpServer Instance               │  │
│  │  - Handles MCP protocol communication    │  │
│  │  - Registers tools                       │  │
│  │  - Routes requests                       │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                                │
│  ┌──────────────▼───────────────────────────┐  │
│  │      KnowledgeGraphManager              │  │
│  │  - Entity management                     │  │
│  │  - Relation management                   │  │
│  │  - Search operations                     │  │
│  │  - Graph persistence                     │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                                │
└─────────────────┼────────────────────────────────┘
                  │
                  │ File I/O
                  │
┌─────────────────▼────────────────────────────────┐
│         knowledge_base.jsonl                      │
│  (Persistent Storage in JSONL format)            │
└──────────────────────────────────────────────────┘
```

## Data Flow

### Creating Entities

```
Client Request
     │
     ▼
┌─────────────────────┐
│  create_entities    │ Tool Handler
│  - Validate input   │
│  - Call manager     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ KnowledgeGraphMgr   │
│ - Load graph        │
│ - Filter duplicates │
│ - Add entities      │
│ - Save graph        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  knowledge_base     │
│  .jsonl             │
└─────────────────────┘
```

### Searching Nodes

```
Client Request (query: "engineer")
     │
     ▼
┌─────────────────────┐
│   search_nodes      │ Tool Handler
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  KnowledgeGraphManager          │
│  1. Load entire graph           │
│  2. Filter entities by query:   │
│     - Match entity names        │
│     - Match entity types        │
│     - Match observations        │
│  3. Get relations between       │
│     matching entities           │
│  4. Return filtered graph       │
└──────────┬──────────────────────┘
           │
           ▼
    Filtered Results
```

## Component Details

### McpServer

**Responsibilities:**
- Handle MCP protocol communication via stdio transport
- Register and expose tools to clients
- Validate inputs using Zod schemas
- Format and structure responses

**Tools Registered:**
- `create_entities`
- `create_relations`
- `add_observations`
- `delete_entities`
- `delete_observations`
- `delete_relations`
- `read_graph`
- `search_nodes`
- `open_nodes`
- `visualize_graph`

### KnowledgeGraphManager

**Responsibilities:**
- CRUD operations on entities and relations
- Graph traversal and filtering
- Data persistence to JSONL format
- Duplicate prevention

**Key Methods:**
- `loadGraph()`: Read and parse JSONL file
- `saveGraph()`: Serialize and write to JSONL
- `createEntities()`: Add new entities (skip duplicates)
- `createRelations()`: Add new relations (skip duplicates)
- `searchNodes()`: Filter graph by text query
- `openNodes()`: Retrieve specific nodes by name

### Storage Format (JSONL)

Each line is a JSON object representing either an entity or relation:

```jsonl
{"type":"entity","name":"John_Smith","entityType":"person","observations":["Software engineer"]}
{"type":"relation","from":"John_Smith","to":"TechCorp","relationType":"works_at"}
```

**Advantages:**
- Line-by-line processing (streaming capable)
- Easy to append
- Human-readable
- Simple parsing

## Tool Schemas

### Entity Schema

```typescript
{
  name: string,        // Unique identifier
  entityType: string,  // Category/type
  observations: string[] // Facts about entity
}
```

### Relation Schema

```typescript
{
  from: string,        // Source entity name
  to: string,          // Target entity name
  relationType: string // Relationship type (active voice)
}
```

## Configuration

### Environment Variables

- `KNOWLEDGE_BASE_FILE_PATH`: Custom storage path (optional)
  - Default: `./dist/knowledge_base.jsonl`

### File Locations

```
knowledge_base/
├── src/
│   ├── index.ts           # Main server implementation
│   └── index.test.ts      # Tests
├── dist/
│   ├── index.js           # Compiled server
│   ├── index.d.ts         # Type definitions
│   └── knowledge_base.jsonl  # Default storage (created at runtime)
└── configuration files
```

## Error Handling

- **Entity not found**: Throws error when adding observations to non-existent entity
- **File not found**: Returns empty graph on first run
- **Duplicate prevention**: Silently skips duplicate entities/relations
- **Validation errors**: Zod schema validation catches invalid inputs

## Visualization

Interactive D3.js-based graph visualization served via local HTTP with live updates.

```
visualizeGraph(graph, graphLoader?) → startVisualizationServer(port:3000, graphLoader) → openInBrowser(url)
```

**Components:** `src/server/visualize.ts`
- `generateVisualizationHTML()`: Renders nodes/edges with D3 force layout
- `startVisualizationServer()`: HTTP server on 127.0.0.1, serves `/api/graph` for polling
- `openInBrowser()`: Cross-platform (darwin/win32/linux)

**Features:** Zoom/pan, drag nodes, click for details, entity type colors, toggle labels, **live updates** (2s polling, pause/resume).

## Performance Considerations

- Full graph is loaded into memory for each operation
- Suitable for small to medium knowledge graphs (< 10,000 entities)
- For larger graphs, consider using a proper graph database
- Search is case-insensitive linear scan
