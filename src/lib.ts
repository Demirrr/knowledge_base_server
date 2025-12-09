/**
 * Knowledge Base Server - Public API Exports
 * 
 * This file exports the public API for the knowledge base server,
 * allowing it to be used as a library in other projects.
 */

// Types
export type { Entity, Relation, KnowledgeGraph, ObservationInput, ObservationResult, ObservationDeletion } from './types/index.js';

// Schemas
export { EntitySchema, RelationSchema, ObservationInputSchema, ObservationDeletionSchema, ObservationResultSchema, SuccessResponseSchema } from './schemas/index.js';

// Manager
export { KnowledgeGraphManager } from './manager/index.js';

// Server
export { createServer, startServer, registerTools } from './server/index.js';

// Utils
export { getDirname, getDefaultMemoryPath, resolveMemoryFilePath } from './utils/path.js';
