# Example Configuration Files

## Claude Desktop Configuration

Add this to your `claude_desktop_config.json`:

### Using Node.js directly

```json
{
  "mcpServers": {
    "knowledge-base": {
      "command": "node",
      "args": [
        "/absolute/path/to/knowledge_base/dist/index.js"
      ]
    }
  }
}
```

### Using npm start

```json
{
  "mcpServers": {
    "knowledge-base": {
      "command": "npm",
      "args": [
        "start",
        "--prefix",
        "/absolute/path/to/knowledge_base"
      ]
    }
  }
}
```

### With custom storage path

```json
{
  "mcpServers": {
    "knowledge-base": {
      "command": "node",
      "args": [
        "/absolute/path/to/knowledge_base/dist/index.js"
      ],
      "env": {
        "KNOWLEDGE_BASE_FILE_PATH": "/custom/path/to/knowledge_base.jsonl"
      }
    }
  }
}
```

## VS Code MCP Configuration

Add this to `.vscode/mcp.json` in your workspace:

```json
{
  "mcp": {
    "servers": {
      "knowledge-base": {
        "command": "node",
        "args": [
          "/absolute/path/to/knowledge_base/dist/index.js"
        ]
      }
    }
  }
}
```

## Testing the Server

You can test the server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

This will open a web interface where you can interact with the server and test all the tools.
