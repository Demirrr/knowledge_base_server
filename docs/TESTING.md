# Testing Your MCP Server Locally

## Method 1: Using MCP Inspector (Recommended for Testing)

The MCP Inspector provides a web-based UI to test your server interactively.

### Install and Run

```bash
cd /home/cdemir/Desktop/Softwares/knowledge_base

# Make sure the project is built
npm run build

# Run with MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

This will:
1. Start your MCP server
2. Open a web browser with the Inspector UI
3. Show all available tools
4. Let you test tool calls interactively

### Using the Inspector

1. **View Available Tools**: You'll see all 9 tools listed
2. **Test a Tool**: Click on any tool (e.g., `create_entities`)
3. **Fill in Parameters**: Use the JSON editor to provide input
4. **Execute**: Click "Call Tool" to test
5. **View Response**: See the structured output

Example test sequence in Inspector:

```json
// 1. Create entities
{
  "entities": [
    {
      "name": "Alice",
      "entityType": "person",
      "observations": ["Software engineer", "Likes coffee"]
    }
  ]
}

// 2. Search for the entity
{
  "query": "coffee"
}

// 3. Read entire graph
{}
```

## Method 2: Configure with Claude Desktop

### Step 1: Find Your Config File

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### Step 2: Add Your Server

```json
{
  "mcpServers": {
    "knowledge-base": {
      "command": "node",
      "args": [
        "/home/cdemir/Desktop/Softwares/knowledge_base/dist/index.js"
      ]
    }
  }
}
```

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop completely.

### Step 4: Test in Claude

Try these prompts:

```
"Create an entity named 'TestUser' of type 'person' with observations: 'Learning MCP', 'Building knowledge graphs'"

"Search for entities containing 'MCP'"

"Read the entire knowledge graph"

"Create a relation from 'TestUser' to 'KnowledgeBase' with type 'using'"
```

## Method 3: Direct stdio Testing (Advanced)

You can interact with the server directly via stdin/stdout:

```bash
cd /home/cdemir/Desktop/Softwares/knowledge_base
npm run build

# Run the server
node dist/index.js
```

The server will wait for JSON-RPC messages on stdin. Example:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

Press `Ctrl+D` to send the message.

## Method 4: Using with VS Code

### Step 1: Install GitHub Copilot Extension

Make sure you have GitHub Copilot installed in VS Code.

### Step 2: Create MCP Config

Create `.vscode/mcp.json` in your workspace:

```json
{
  "mcp": {
    "servers": {
      "knowledge-base": {
        "command": "node",
        "args": [
          "/home/cdemir/Desktop/Softwares/knowledge_base/dist/index.js"
        ]
      }
    }
  }
}
```

### Step 3: Reload VS Code

Press `Ctrl+Shift+P` and run "Reload Window"

### Step 4: Test with Copilot Chat

Open Copilot Chat and try MCP commands.

## Quick Verification Tests

### Test 1: Basic Entity Creation

```bash
# Use Inspector or Claude Desktop
"Create an entity named 'John_Doe' of type 'person' with observations: 'Software Developer', 'Python Expert'"
```

Expected: Success message with the created entity

### Test 2: Search Functionality

```bash
"Search for nodes containing 'Python'"
```

Expected: Should return John_Doe

### Test 3: Relations

```bash
"Create an entity named 'TechCorp' of type 'company' with observation: 'Tech company'"
"Create a relation from 'John_Doe' to 'TechCorp' with type 'works_at'"
```

Expected: Entities and relation created

### Test 4: Read Graph

```bash
"Read the entire knowledge graph"
```

Expected: JSON showing all entities and relations

### Test 5: Persistence

```bash
# After creating some entities, stop and restart the server
# Then:
"Read the entire knowledge graph"
```

Expected: Previously created data should still be there

## Troubleshooting

### Server Won't Start

```bash
# Check for TypeScript errors
cd /home/cdemir/Desktop/Softwares/knowledge_base
npm run build

# Check for runtime errors
node dist/index.js
# You should see: "Knowledge Base MCP Server running on stdio"
```

### Inspector Won't Connect

```bash
# Make sure no other process is using the port
# Try killing any existing Inspector instances
pkill -f inspector

# Run again
npx @modelcontextprotocol/inspector node dist/index.js
```

### Claude Desktop Not Detecting Server

1. **Verify config file location**:
   ```bash
   # Linux
   cat ~/.config/Claude/claude_desktop_config.json
   ```

2. **Check absolute path**:
   ```bash
   ls -la /home/cdemir/Desktop/Softwares/knowledge_base/dist/index.js
   ```

3. **View Claude Desktop logs**:
   - macOS: `~/Library/Logs/Claude/`
   - Linux: `~/.config/Claude/logs/`
   - Windows: `%APPDATA%\Claude\logs\`

### Data Not Persisting

```bash
# Check if the storage file is being created
ls -la /home/cdemir/Desktop/Softwares/knowledge_base/dist/

# You should see: knowledge_base.jsonl (after first write operation)

# Check file contents
cat /home/cdemir/Desktop/Softwares/knowledge_base/dist/knowledge_base.jsonl
```

### Permission Issues

```bash
# Ensure the dist directory is writable
chmod 755 /home/cdemir/Desktop/Softwares/knowledge_base/dist/

# Make sure index.js is executable
chmod +x /home/cdemir/Desktop/Softwares/knowledge_base/dist/index.js
```

## Viewing Server Logs

The server logs to stderr. To see logs:

```bash
# When using Inspector, logs appear in the terminal

# When using Claude Desktop, check logs:
tail -f ~/.config/Claude/logs/mcp*.log
```

## Test Data File Location

By default, data is stored at:
```
/home/cdemir/Desktop/Softwares/knowledge_base/dist/knowledge_base.jsonl
```

You can view it:
```bash
cat /home/cdemir/Desktop/Softwares/knowledge_base/dist/knowledge_base.jsonl
```

Or use a custom location:
```bash
KNOWLEDGE_BASE_FILE_PATH=/tmp/test_kb.jsonl node dist/index.js
```

## Next Steps

1. Start with **MCP Inspector** for quick testing
2. Move to **Claude Desktop** for real usage
3. Check **persistence** by restarting and reading the graph
4. Try **all 9 tools** to verify functionality
5. Review **logs** if anything doesn't work

## Example Test Session

Here's a complete test flow:

```bash
# Terminal 1: Start Inspector
cd /home/cdemir/Desktop/Softwares/knowledge_base
npx @modelcontextprotocol/inspector node dist/index.js

# Browser: Opens automatically
# 1. Click "create_entities"
# 2. Use this JSON:
{
  "entities": [
    {"name": "Alice", "entityType": "person", "observations": ["Engineer"]},
    {"name": "Bob", "entityType": "person", "observations": ["Designer"]}
  ]
}

# 3. Click "create_relations"
{
  "relations": [
    {"from": "Alice", "to": "Bob", "relationType": "works_with"}
  ]
}

# 4. Click "search_nodes"
{
  "query": "Engineer"
}

# 5. Click "read_graph" with empty {}

# 6. Stop server (Ctrl+C)
# 7. Restart and verify data persisted
```

You should now have a fully functional local MCP server! 🎉
