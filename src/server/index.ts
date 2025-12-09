/**
 * MCP Server setup and initialization
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { KnowledgeGraphManager } from '../manager/index.js';
import { resolveMemoryFilePath } from '../utils/path.js';
import { registerTools } from './tools.js';

/**
 * Create and configure the MCP server
 */
export function createServer(): McpServer {
  return new McpServer({
    name: "knowledge-base-server",
    version: "1.0.0",
  });
}

/**
 * Start the MCP server
 */
export async function startServer(): Promise<void> {
  const server = createServer();
  
  // Resolve memory file path
  const memoryFilePath = await resolveMemoryFilePath(import.meta.url);
  const knowledgeGraphManager = new KnowledgeGraphManager(memoryFilePath);
  
  // Register all tools
  registerTools(server, () => knowledgeGraphManager);
  
  // Connect transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("Knowledge Base MCP Server running on stdio");
}

export { registerTools } from './tools.js';
