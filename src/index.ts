#!/usr/bin/env node

/**
 * Knowledge Base Server - Main Entry Point
 * 
 * A knowledge graph memory server based on the Model Context Protocol (MCP).
 * This server provides persistent memory capabilities using a local knowledge
 * graph structure, enabling AI assistants to remember information across conversations.
 */

import { startServer } from './server/index.js';

// Re-export public API for library usage
export * from './lib.js';

// Start the server
startServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
