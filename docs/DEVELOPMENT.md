# Development Guide

This guide covers development workflows, debugging, and extending the Knowledge Base Server.

## Development Setup

### Prerequisites

- Node.js 18+ (22 recommended)
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Initial Setup

```bash
# Clone or initialize the repository
cd knowledge_base

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Development Workflow

#### Watch Mode for Development

Terminal 1 - TypeScript compiler in watch mode:
```bash
npm run watch
```

Terminal 2 - Run the server:
```bash
npm start
```

#### Making Changes

1. Edit `src/index.ts`
2. TypeScript compiler automatically rebuilds (if using watch mode)
3. Restart the server to see changes

## Project Architecture

### File Organization

```
src/
└── index.ts                # Single file containing:
    ├── File path utilities
    ├── Data structures (Entity, Relation, KnowledgeGraph)
    ├── KnowledgeGraphManager class
    ├── Zod schemas
    ├── MCP server setup
    └── Tool registration
```

### Class: KnowledgeGraphManager

The core class managing all graph operations:

```typescript
class KnowledgeGraphManager {
  constructor(private memoryFilePath: string)
  
  // Private methods
  private async loadGraph(): Promise<KnowledgeGraph>
  private async saveGraph(graph: KnowledgeGraph): Promise<void>
  
  // Public API methods
  async createEntities(entities: Entity[]): Promise<Entity[]>
  async createRelations(relations: Relation[]): Promise<Relation[]>
  async addObservations(...): Promise<...>
  async deleteEntities(entityNames: string[]): Promise<void>
  async deleteObservations(...): Promise<void>
  async deleteRelations(relations: Relation[]): Promise<void>
  async readGraph(): Promise<KnowledgeGraph>
  async searchNodes(query: string): Promise<KnowledgeGraph>
  async openNodes(names: string[]): Promise<KnowledgeGraph>
}
```

### Adding a New Tool

To add a new MCP tool:

1. **Define the functionality in KnowledgeGraphManager**:

```typescript
async getEntityStatistics(): Promise<{
  totalEntities: number;
  totalRelations: number;
  entitiesByType: Record<string, number>;
}> {
  const graph = await this.loadGraph();
  
  const stats = {
    totalEntities: graph.entities.length,
    totalRelations: graph.relations.length,
    entitiesByType: {}
  };
  
  graph.entities.forEach(e => {
    stats.entitiesByType[e.entityType] = 
      (stats.entitiesByType[e.entityType] || 0) + 1;
  });
  
  return stats;
}
```

2. **Register the tool with the MCP server**:

```typescript
server.registerTool(
  "get_statistics",
  {
    title: "Get Statistics",
    description: "Get statistics about the knowledge graph",
    inputSchema: {},
    outputSchema: {
      totalEntities: z.number(),
      totalRelations: z.number(),
      entitiesByType: z.record(z.number())
    }
  },
  async () => {
    const stats = await knowledgeGraphManager.getEntityStatistics();
    return {
      content: [{ 
        type: "text" as const, 
        text: JSON.stringify(stats, null, 2) 
      }],
      structuredContent: stats
    };
  }
);
```

3. **Add tests**:

```typescript
describe('getEntityStatistics', () => {
  it('should return correct statistics', async () => {
    await manager.createEntities([
      { name: 'A', entityType: 'person', observations: [] },
      { name: 'B', entityType: 'person', observations: [] },
      { name: 'C', entityType: 'company', observations: [] },
    ]);
    
    const stats = await manager.getEntityStatistics();
    
    expect(stats.totalEntities).toBe(3);
    expect(stats.entitiesByType.person).toBe(2);
    expect(stats.entitiesByType.company).toBe(1);
  });
});
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/index.test.ts

# Run with coverage
npm test -- --coverage
```

### Writing Tests

Tests use Vitest. Example structure:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Feature Name', () => {
  let manager: KnowledgeGraphManager;
  let testFilePath: string;

  beforeEach(async () => {
    // Setup test environment
    testFilePath = path.join(__dirname, `test-${Date.now()}.jsonl`);
    manager = new KnowledgeGraphManager(testFilePath);
  });

  afterEach(async () => {
    // Cleanup
    try {
      await fs.unlink(testFilePath);
    } catch {}
  });

  it('should do something', async () => {
    // Arrange
    const input = { ... };
    
    // Act
    const result = await manager.someMethod(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

## Debugging

### Debug with VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/dist/index.js",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Using MCP Inspector

The MCP Inspector provides a web UI for testing:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a browser where you can:
- See all available tools
- Test tool calls
- View responses
- Inspect the protocol communication

### Logging

Add debug logging:

```typescript
// In development
if (process.env.DEBUG) {
  console.error('DEBUG: Loading graph from', this.memoryFilePath);
}

// Always log errors
console.error('Error loading graph:', error);
```

Run with debug logs:
```bash
DEBUG=1 npm start
```

## Performance Optimization

### Current Bottlenecks

1. **Full graph loads**: Every operation loads the entire graph
2. **Linear search**: O(n) search through all entities
3. **File I/O**: Frequent disk reads/writes

### Optimization Strategies

#### 1. Add Caching

```typescript
class KnowledgeGraphManager {
  private cache: KnowledgeGraph | null = null;
  private cacheInvalidated = true;

  private async loadGraph(): Promise<KnowledgeGraph> {
    if (this.cache && !this.cacheInvalidated) {
      return this.cache;
    }
    
    this.cache = await this.loadFromDisk();
    this.cacheInvalidated = false;
    return this.cache;
  }

  private async saveGraph(graph: KnowledgeGraph): Promise<void> {
    await this.saveToDisk(graph);
    this.cache = graph;
    this.cacheInvalidated = false;
  }
}
```

#### 2. Add Indexes

```typescript
class KnowledgeGraphManager {
  private entityIndex: Map<string, Entity> = new Map();
  
  private buildIndex(graph: KnowledgeGraph) {
    this.entityIndex.clear();
    graph.entities.forEach(e => {
      this.entityIndex.set(e.name, e);
    });
  }
  
  async openNodes(names: string[]): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();
    
    // Fast lookup using index
    const entities = names
      .map(name => this.entityIndex.get(name))
      .filter(e => e !== undefined);
    
    // ... rest of logic
  }
}
```

#### 3. Implement Lazy Loading

For large graphs, consider loading only what's needed:

```typescript
async searchNodesLazy(query: string): Promise<KnowledgeGraph> {
  // Stream the file line by line instead of loading everything
  const matches: Entity[] = [];
  const fileStream = createReadStream(this.memoryFilePath);
  const lineReader = readline.createInterface({ input: fileStream });
  
  for await (const line of lineReader) {
    const item = JSON.parse(line);
    if (item.type === 'entity' && this.matchesQuery(item, query)) {
      matches.push(item);
    }
  }
  
  return { entities: matches, relations: [] };
}
```

## Code Style

### TypeScript Conventions

- Use `async/await` instead of promises
- Prefer `const` over `let`
- Use descriptive variable names
- Add JSDoc comments for public methods
- Use strict type checking

### Example:

```typescript
/**
 * Searches for entities matching the given query.
 * 
 * @param query - Search string (case-insensitive)
 * @returns Filtered knowledge graph containing matching entities
 */
async searchNodes(query: string): Promise<KnowledgeGraph> {
  const graph = await this.loadGraph();
  const lowerQuery = query.toLowerCase();
  
  const filteredEntities = graph.entities.filter(entity => 
    entity.name.toLowerCase().includes(lowerQuery) ||
    entity.entityType.toLowerCase().includes(lowerQuery) ||
    entity.observations.some(obs => obs.toLowerCase().includes(lowerQuery))
  );
  
  // ... rest of implementation
}
```

## Building for Production

### Optimization

```bash
# Build with optimizations
npm run build

# Check bundle size
du -sh dist/
```

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] Version bumped in package.json
- [ ] CHANGELOG updated (if maintaining one)
- [ ] Docker image builds successfully
- [ ] License headers present

### Docker Build

```bash
# Build image
docker build -t kb-server:latest .

# Test image
docker run -i --rm kb-server:latest

# Push to registry (if needed)
docker tag kb-server:latest your-registry/kb-server:latest
docker push your-registry/kb-server:latest
```

## Troubleshooting

### Common Issues

**Problem**: `Cannot find module '@modelcontextprotocol/sdk'`
**Solution**: Run `npm install`

**Problem**: Tests fail with ENOENT
**Solution**: Check that test cleanup is working properly

**Problem**: Server doesn't respond
**Solution**: Verify stdio transport is working (server communicates via stdin/stdout)

**Problem**: Changes not reflected
**Solution**: Rebuild with `npm run build`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit a pull request

## Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vitest Documentation](https://vitest.dev/)
- [Zod Documentation](https://zod.dev/)
