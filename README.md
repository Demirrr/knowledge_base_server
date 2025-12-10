# 🧠 Knowledge Base MCP Server

[![npm version](https://badge.fury.io/js/knowledge-base-server.svg)](https://www.npmjs.com/package/knowledge-base-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A knowledge graph memory server based on the Model Context Protocol (MCP). This server provides persistent memory capabilities using a local knowledge graph structure, enabling AI assistants to remember information across conversations.

## Features

- **Entity Management**: Create, read, update, and delete entities in the knowledge graph
- **Relationship Tracking**: Define and manage relationships between entities
- **Observations**: Attach and manage discrete pieces of information to entities
- **Search Capabilities**: Search across entity names, types, and observations
- **Persistent Storage**: Data stored in JSONL format for durability

## Quick Start

```bash
# Install globally
npm install -g knowledge-base-server

# Run the server
knowledge-base-server
```

<details>
<summary>📦 Installation Options</summary>

### Option 1: Install from npm (Recommended)

```bash
npm install -g knowledge-base-server
```

After installation, you can run the server directly:

```bash
knowledge-base-server
```

### Option 2: Install from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/Demirrr/knowledge_base_server.git
   cd knowledge_base_server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

**Prerequisites**: Node.js 18 or higher, npm or yarn

</details>

<details>
<summary>🚀 Usage & Configuration</summary>

### Running the Server

#### Option 1: Direct Execution

```bash
npm start
```

The server will start and listen on stdio (standard input/output).

#### Option 2: With Custom Storage Path

```bash
KNOWLEDGE_BASE_FILE_PATH=/path/to/storage.jsonl npm start
```

#### Option 3: Development Mode (with auto-rebuild)

```bash
npm run watch
# In another terminal
npm start
```

### Configuration

The server can be configured using the `KNOWLEDGE_BASE_FILE_PATH` environment variable:

```bash
KNOWLEDGE_BASE_FILE_PATH=/path/to/custom/knowledge_base.jsonl npm start
```

By default, the knowledge base is stored in `knowledge_base.jsonl` in the dist directory.

</details>

<details>
<summary>📚 Core Concepts</summary>

### Entities

Entities are the primary nodes in the knowledge graph. Each entity has:
- A unique name (identifier)
- An entity type (e.g., "person", "organization", "event")
- A list of observations

Example:
```json
{
  "name": "John_Smith",
  "entityType": "person",
  "observations": ["Speaks fluent Spanish", "Works at TechCorp"]
}
```

### Relations

Relations define directed connections between entities. They are stored in active voice and describe how entities interact.

Example:
```json
{
  "from": "John_Smith",
  "to": "TechCorp",
  "relationType": "works_at"
}
```

### Observations

Observations are discrete pieces of information about an entity:
- Stored as strings
- Attached to specific entities
- Can be added or removed independently
- Should be atomic (one fact per observation)

</details>

<details>
<summary>🔧 API Tools</summary>

### create_entities
Create multiple new entities in the knowledge graph.

**Input**: `entities` (array of Entity objects)
- Each entity contains: `name`, `entityType`, `observations`

**Output**: Array of created entities (duplicates ignored)

### create_relations
Create multiple new relations between entities.

**Input**: `relations` (array of Relation objects)
- Each relation contains: `from`, `to`, `relationType`

**Output**: Array of created relations (duplicates skipped)

### add_observations
Add new observations to existing entities.

**Input**: `observations` (array of objects)
- Each object contains: `entityName`, `contents` (array of strings)

**Output**: Array showing added observations per entity

### delete_entities
Remove entities and their associated relations.

**Input**: `entityNames` (array of strings)

**Output**: Success message

### delete_observations
Remove specific observations from entities.

**Input**: `deletions` (array of objects)
- Each object contains: `entityName`, `observations` (array of strings)

**Output**: Success message

### delete_relations
Remove specific relations from the graph.

**Input**: `relations` (array of Relation objects)

**Output**: Success message

### read_graph
Read the entire knowledge graph.

**Input**: None

**Output**: Complete graph structure with all entities and relations

### search_nodes
Search for nodes based on a query.

**Input**: `query` (string)
- Searches across entity names, types, and observation content

**Output**: Filtered graph with matching entities and their relations

### open_nodes
Retrieve specific nodes by name.

**Input**: `names` (array of strings)

**Output**: Filtered graph containing requested entities and relations between them

### search_observations
Search for observations within a specific entity's observations that match a query.

**Input**: 
- `entityName` (string): The name of the entity to search observations for
- `query` (string): The query string to search within the entity's observations

**Output**: Array of observation strings that match the query

### visualize_graph
Open an interactive visualization of the knowledge graph in your browser.

**Input**: None

**Output**: Opens a browser window with an interactive D3.js visualization where:
- Entities are displayed as colored nodes (color-coded by entity type)
- Relations are displayed as directed edges with labels
- Nodes can be dragged to rearrange the layout
- Click on a node to see its details (observations and relations)
- Zoom and pan to navigate large graphs

</details>

<details>
<summary>🔌 Integration (VS Code & Claude Desktop)</summary>

### Using with VS Code (GitHub Copilot)

VS Code supports MCP servers through GitHub Copilot Chat. Here's how to set it up:

#### Step 1: Configure MCP Settings

1. Open VS Code MCP configuration:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
   - Type "Preferences: Open MCP Settings (JSON)"
   - Press Enter

2. Add the MCP server configuration to your `mcp.json`:

   **Option A: Using local build (Recommended for development)**
   ```json
   {
     "servers": {
       "knowledge-base": {
         "command": "node",
         "args": ["/absolute/path/to/knowledge_base_server/dist/index.js"],
         "env": {
           "KNOWLEDGE_BASE_FILE_PATH": "/path/to/your/knowledge_base.jsonl"
         },
         "type": "stdio"
       }
     },
     "inputs": []
   }
   ```

   **Option B: Using npx (no build required)**
   ```json
   {
     "servers": {
       "knowledge-base": {
         "command": "npx",
         "args": ["-y", "knowledge-base-server"],
         "env": {
           "KNOWLEDGE_BASE_FILE_PATH": "/path/to/your/knowledge_base.jsonl"
         },
         "type": "stdio"
       }
     },
     "inputs": []
   }
   ```

   **Option C: Using global installation**
   ```json
   {
     "servers": {
       "knowledge-base": {
         "command": "knowledge-base-server",
         "env": {
           "KNOWLEDGE_BASE_FILE_PATH": "/path/to/your/knowledge_base.jsonl"
         },
         "type": "stdio"
       }
     },
     "inputs": []
   }
   ```

   > **Important**: Replace paths with actual paths to your desired storage location.

#### Step 2: Reload VS Code

Press `Ctrl+Shift+P` and run **"Developer: Reload Window"** to apply the new settings.

#### Step 3: Start the MCP Server

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Type **"MCP: List Servers"** and press Enter
3. Find `knowledge-base` in the list and click the **Start** button to start the server

#### Step 4: Verify Connection

Open GitHub Copilot Chat and try one of these commands:
- "Read the knowledge graph"
- "Create an entity named Test with type person"

#### MCP Configuration File Location

The MCP configuration file (`mcp.json`) is typically located at:
- **Linux**: `~/.config/Code/User/mcp.json`
- **macOS**: `~/Library/Application Support/Code/User/mcp.json`
- **Windows**: `%APPDATA%\Code\User\mcp.json`

#### Available MCP Tools

Once connected, these tools become available in Copilot Chat:

| Tool | Description |
|------|-------------|
| `create_entities` | Create new entities in the knowledge graph |
| `create_relations` | Create relationships between entities |
| `add_observations` | Add observations to existing entities |
| `delete_entities` | Remove entities from the graph |
| `delete_relations` | Remove relationships |
| `delete_observations` | Remove specific observations |
| `read_graph` | Read the entire knowledge graph |
| `search_nodes` | Search for nodes by query |
| `open_nodes` | Retrieve specific nodes by name |
| `search_observations` | Search observations within a specific entity |
| `visualize_graph` | Open interactive graph visualization in browser |

### Using with Claude Desktop

1. Edit your Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add one of these configurations:

   **Option A: Using npx (Recommended)**
   ```json
   {
     "mcpServers": {
       "knowledge-base": {
         "command": "npx",
         "args": ["-y", "knowledge-base-server"],
         "env": {
           "KNOWLEDGE_BASE_FILE_PATH": "/path/to/your/knowledge_base.jsonl"
         }
       }
     }
   }
   ```

   **Option B: Using global installation**
   ```json
   {
     "mcpServers": {
       "knowledge-base": {
         "command": "knowledge-base-server"
       }
     }
   }
   ```

   **Option C: Using local build**
   ```json
   {
     "mcpServers": {
       "knowledge-base": {
         "command": "node",
         "args": [
           "/absolute/path/to/knowledge_base_server/dist/index.js"
         ]
       }
     }
   }
   ```

3. Restart Claude Desktop

</details>

<details>
<summary>🎯 Your First Knowledge Graph</summary>

Try these commands in Claude or VS Code Copilot Chat:

1. **Create an entity**:
   "Create an entity called 'Me' of type 'person' with observations: 'Learning MCP', 'Interested in AI'"

2. **Create another entity**:
   "Create an entity called 'KnowledgeBase' of type 'project' with observation: 'MCP server for persistent memory'"

3. **Create a relationship**:
   "Create a relation from 'Me' to 'KnowledgeBase' with type 'working_on'"

4. **Search the graph**:
   "Search for nodes containing 'MCP'"

5. **View everything**:
   "Read the entire knowledge graph"

</details>

<details>
<summary>🧪 Testing & Development</summary>

### Testing

Run the test suite:

```bash
npm test
```

You can also test the server with the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

### Project Structure

```
knowledge_base_server/
├── src/
│   ├── index.ts           # Main entry point
│   ├── lib.ts             # Public API exports
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Entity, Relation, KnowledgeGraph types
│   ├── schemas/           # Zod validation schemas
│   │   └── index.ts       # Input/output validation
│   ├── manager/           # Business logic
│   │   ├── index.ts       # Module exports
│   │   └── KnowledgeGraphManager.ts  # Graph operations
│   ├── server/            # MCP server setup
│   │   ├── index.ts       # Server initialization
│   │   ├── tools.ts       # Tool registrations
│   │   └── visualize.ts   # Browser visualization
│   └── utils/             # Utility functions
│       ├── index.ts       # Module exports
│       └── path.ts        # Path resolution utilities
├── examples/              # Example scripts
│   ├── README.md          # Examples documentation
│   ├── visualize.js       # Visualization demo script
│   └── sample_knowledge_base.jsonl  # Sample data
├── tests/                 # Test suite
│   └── manager.test.ts    # KnowledgeGraphManager tests
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md    # Technical architecture
│   ├── CONFIGURATION.md   # Configuration guide
│   ├── DEVELOPMENT.md     # Development guide
│   ├── DOCKER.md          # Docker usage
│   ├── EXAMPLES.md        # Usage examples
│   ├── TESTING.md         # Testing guide
│   └── PROJECT_SUMMARY.md # Project overview
├── dist/                  # Compiled JavaScript
├── Dockerfile             # Container definition
├── package.json
├── tsconfig.json
├── vitest.config.ts       # Test configuration
└── setup.sh               # Quick setup script
```

### Available Commands

```bash
npm install       # Install dependencies
npm run build     # Build the project
npm start         # Run the server
npm test          # Run tests
npm run watch     # Watch mode for development
npm run visualize # Open graph visualization in browser
./setup.sh        # Automated setup
```

### Try the Visualization

After building, you can instantly visualize a sample knowledge graph:

```bash
npm run visualize
```

Or visualize your own knowledge base:

```bash
node examples/visualize.js path/to/your/knowledge_base.jsonl
```

See [examples/README.md](examples/README.md) for more details.

</details>

<details>
<summary>❓ Troubleshooting</summary>

### Server won't start

- Make sure you've run `npm install` and `npm run build`
- Check that Node.js version is 18 or higher: `node --version`

### Changes not persisting

- Check file permissions for the storage directory
- Verify the `KNOWLEDGE_BASE_FILE_PATH` environment variable if using custom path

### Can't connect from Claude Desktop or VS Code

- Verify the absolute path in the config is correct
- Make sure the server builds without errors: `npm run build`
- Check application logs for error messages
- For VS Code: Reload the window after changing settings

</details>

## 📚 Additional Documentation

- **[examples/README.md](examples/README.md)** - Visualization examples
- **[docs/EXAMPLES.md](docs/EXAMPLES.md)** - Usage examples and patterns
- **[docs/CONFIGURATION.md](docs/CONFIGURATION.md)** - Configuration guide
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development guide
- **[docs/DOCKER.md](docs/DOCKER.md)** - Docker usage
- **[docs/TESTING.md](docs/TESTING.md)** - Testing guide
- **[docs/PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md)** - Complete project overview

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🙏 Credits

Based on the [MCP Memory Server](https://github.com/modelcontextprotocol/servers/tree/main/src/memory) reference implementation.

## 📞 Support

- [MCP Documentation](https://modelcontextprotocol.io/)
- [GitHub Issues](https://github.com/Demirrr/knowledge_base_server/issues)

---

**Built with ❤️ using the Model Context Protocol**
