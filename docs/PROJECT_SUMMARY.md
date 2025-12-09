# Knowledge Base Server - Project Summary

## Overview

This project is a **Model Context Protocol (MCP) server** that provides persistent memory capabilities through a knowledge graph structure. It's based on the reference implementation from the official MCP servers repository but customized as a standalone application.

## What is MCP?

The Model Context Protocol (MCP) is a standard protocol that allows AI assistants (like Claude) to interact with external data sources and tools. This server implements MCP to provide persistent memory across conversations.

## Key Features

✅ **Entity Management** - Create, read, update, and delete entities in a knowledge graph
✅ **Relationship Tracking** - Define directed relationships between entities
✅ **Observations System** - Attach discrete pieces of information to entities
✅ **Full-Text Search** - Search across entity names, types, and observations
✅ **Persistent Storage** - Data stored in JSONL format for durability
✅ **MCP Compatible** - Works with Claude Desktop, VS Code, and other MCP clients
✅ **Docker Support** - Containerized deployment with volume persistence
✅ **TypeScript** - Fully typed codebase with strict type checking
✅ **Tested** - Comprehensive test suite included

## Project Structure

```
knowledge_base/
├── src/
│   ├── index.ts          # Main server implementation (470 lines)
│   └── index.test.ts     # Test suite
├── dist/                  # Compiled JavaScript (auto-generated)
├── documentation/
│   ├── README.md         # Main documentation
│   ├── QUICKSTART.md     # Getting started guide
│   ├── EXAMPLES.md       # Usage examples
│   ├── CONFIGURATION.md  # Config guide
│   ├── ARCHITECTURE.md   # Technical architecture
│   └── DOCKER.md         # Docker usage
├── Dockerfile            # Container definition
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript configuration
├── vitest.config.ts      # Test configuration
├── .gitignore           # Git ignore rules
└── LICENSE              # MIT License
```

## Technologies Used

- **Node.js 22** - Runtime environment
- **TypeScript 5.7** - Primary language
- **@modelcontextprotocol/sdk** - MCP protocol implementation
- **Zod** - Schema validation
- **Vitest** - Testing framework
- **Docker** - Containerization

## Core Concepts

### Knowledge Graph Structure

The server maintains a knowledge graph with three core types:

1. **Entities** - Nodes in the graph
   - Unique name identifier
   - Type classification (person, company, project, etc.)
   - Array of observations

2. **Relations** - Edges in the graph
   - Source entity (`from`)
   - Target entity (`to`)
   - Relationship type (active voice)

3. **Observations** - Facts about entities
   - Atomic pieces of information
   - Stored as strings
   - Can be added/removed independently

### Storage Format

Data is persisted in JSONL (JSON Lines) format:
- Each line is a complete JSON object
- Easy to parse and append
- Human-readable
- Suitable for streaming

Example:
```jsonl
{"type":"entity","name":"Alice","entityType":"person","observations":["Engineer"]}
{"type":"relation","from":"Alice","to":"TechCorp","relationType":"works_at"}
```

## API Tools

The server exposes 9 tools via MCP:

| Tool | Purpose |
|------|---------|
| `create_entities` | Add new entities to the graph |
| `create_relations` | Define relationships between entities |
| `add_observations` | Attach facts to existing entities |
| `delete_entities` | Remove entities and their relations |
| `delete_observations` | Remove specific facts from entities |
| `delete_relations` | Remove specific relationships |
| `read_graph` | Retrieve the entire knowledge graph |
| `search_nodes` | Full-text search across the graph |
| `open_nodes` | Get specific entities by name |

## Use Cases

### Personal Knowledge Management
Track people, relationships, and interactions across conversations.

### Project Management
Maintain project components, dependencies, and status.

### Learning & Research
Build a knowledge repository of concepts and their relationships.

### AI Assistant Memory
Give AI assistants persistent memory across sessions.

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the server
npm start
```

## Integration Examples

### Claude Desktop
```json
{
  "mcpServers": {
    "knowledge-base": {
      "command": "node",
      "args": ["/path/to/knowledge_base/dist/index.js"]
    }
  }
}
```

### Docker
```bash
docker build -t kb-server .
docker run -i --rm -v kb-data:/app/data kb-server
```

## Performance Characteristics

- **Scale**: Suitable for small to medium graphs (< 10,000 entities)
- **Memory**: Full graph loaded into memory per operation
- **Search**: Case-insensitive linear scan
- **Storage**: Append-only JSONL writes

## Design Decisions

### Why JSONL?
- Simple and human-readable
- Line-by-line processing
- Easy to append
- No complex parsing

### Why In-Memory?
- Simplicity for small to medium datasets
- Fast read/search operations
- Easy to understand and modify

### Why TypeScript?
- Type safety
- Better IDE support
- Easier refactoring
- Self-documenting code

## Future Enhancements

Potential improvements for future versions:

- [ ] Add graph visualization endpoint
- [ ] Implement indexing for faster search
- [ ] Support for graph export (GraphML, DOT)
- [ ] Bulk operations API
- [ ] Query language for complex searches
- [ ] WebSocket support for real-time updates
- [ ] Backup/restore functionality
- [ ] Migration tools for different storage formats

## Contributing

This is a standalone implementation. Feel free to:
- Fork and customize for your needs
- Add new features
- Improve performance
- Enhance documentation

## Credits

Based on the [MCP Memory Server](https://github.com/modelcontextprotocol/servers/tree/main/src/memory) reference implementation by Anthropic.

## License

MIT License - See LICENSE file for details.

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol)
- [Claude Desktop](https://claude.ai/desktop)
- [VS Code MCP Extension](https://marketplace.visualstudio.com/items?itemName=modelcontextprotocol.mcp)

## Version History

**v1.0.0** (2025-12-09)
- Initial release
- Full MCP compatibility
- Docker support
- Comprehensive documentation
- Test suite
