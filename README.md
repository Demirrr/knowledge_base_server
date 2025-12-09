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

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Installation

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

## Usage

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

## Core Concepts

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

## API Tools

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

## Integration

### Using with VS Code (GitHub Copilot)

VS Code supports MCP servers through GitHub Copilot Chat. Here's how to set it up:

#### Step 1: Configure VS Code Settings

1. Open VS Code Settings JSON:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
   - Type "Preferences: Open User Settings (JSON)"
   - Press Enter

2. Add the MCP server configuration to your `settings.json`:

   **Option A: Using npx (Recommended - no build required)**
   ```json
   {
     "mcp": {
       "servers": {
         "knowledge-base": {
           "command": "npx",
           "args": ["-y", "knowledge-base-server"],
           "env": {
             "KNOWLEDGE_BASE_FILE_PATH": "/path/to/your/knowledge_base.jsonl"
           }
         }
       }
     }
   }
   ```

   **Option B: Using global installation**
   ```json
   {
     "mcp": {
       "servers": {
         "knowledge-base": {
           "command": "knowledge-base-server",
           "env": {
             "KNOWLEDGE_BASE_FILE_PATH": "/path/to/your/knowledge_base.jsonl"
           }
         }
       }
     }
   }
   ```

   **Option C: Using local build**
   ```json
   {
     "mcp": {
       "servers": {
         "knowledge-base": {
           "command": "node",
           "args": ["/absolute/path/to/knowledge_base_server/dist/index.js"],
           "env": {
             "KNOWLEDGE_BASE_FILE_PATH": "/absolute/path/to/knowledge_base_server/dist/knowledge_base.jsonl"
           }
         }
       }
     }
   }
   ```

   > **Important**: Replace paths with actual paths to your desired storage location.

#### Step 3: Reload VS Code

Press `Ctrl+Shift+P` and run **"Developer: Reload Window"** to apply the new settings.

#### Step 4: Verify Connection

Open GitHub Copilot Chat and try one of these commands:
- "Read the knowledge graph"
- "Create an entity named Test with type person"

#### VS Code Settings Location

The settings file is typically located at:
- **Linux**: `~/.config/Code/User/settings.json`
- **macOS**: `~/Library/Application Support/Code/User/settings.json`
- **Windows**: `%APPDATA%\Code\User\settings.json`

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

## Your First Knowledge Graph

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

## Testing

Run the test suite:

```bash
npm test
```

You can also test the server with the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Development

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
│   │   └── tools.ts       # Tool registrations
│   └── utils/             # Utility functions
│       ├── index.ts       # Module exports
│       └── path.ts        # Path resolution utilities
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

## 🚀 Quick Reference

### Available Commands

```bash
npm install       # Install dependencies
npm run build     # Build the project
npm start         # Run the server
npm test          # Run tests
npm run watch     # Watch mode for development
./setup.sh        # Automated setup
```

## 📚 Additional Documentation

- **[docs/EXAMPLES.md](docs/EXAMPLES.md)** - Usage examples and patterns
- **[docs/CONFIGURATION.md](docs/CONFIGURATION.md)** - Configuration guide
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development guide
- **[docs/DOCKER.md](docs/DOCKER.md)** - Docker usage
- **[docs/TESTING.md](docs/TESTING.md)** - Testing guide
- **[docs/PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md)** - Complete project overview

## Troubleshooting

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
