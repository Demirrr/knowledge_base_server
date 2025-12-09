/**
 * MCP Tool registrations for the Knowledge Base Server
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { KnowledgeGraphManager } from '../manager/KnowledgeGraphManager.js';
import { 
  EntitySchema, 
  RelationSchema, 
  ObservationInputSchema, 
  ObservationDeletionSchema,
  ObservationResultSchema,
  SuccessResponseSchema 
} from '../schemas/index.js';

/**
 * Register all tools on the MCP server
 */
export function registerTools(server: McpServer, getManager: () => KnowledgeGraphManager): void {
  // Create Entities
  server.registerTool(
    "create_entities",
    {
      title: "Create Entities",
      description: "Create multiple new entities in the knowledge graph",
      inputSchema: {
        entities: z.array(EntitySchema)
      },
      outputSchema: {
        entities: z.array(EntitySchema)
      }
    },
    async ({ entities }) => {
      const result = await getManager().createEntities(entities);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        structuredContent: { entities: result }
      };
    }
  );

  // Create Relations
  server.registerTool(
    "create_relations",
    {
      title: "Create Relations",
      description: "Create multiple new relations between entities in the knowledge graph. Relations should be in active voice",
      inputSchema: {
        relations: z.array(RelationSchema)
      },
      outputSchema: {
        relations: z.array(RelationSchema)
      }
    },
    async ({ relations }) => {
      const result = await getManager().createRelations(relations);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        structuredContent: { relations: result }
      };
    }
  );

  // Add Observations
  server.registerTool(
    "add_observations",
    {
      title: "Add Observations",
      description: "Add new observations to existing entities in the knowledge graph",
      inputSchema: {
        observations: z.array(ObservationInputSchema)
      },
      outputSchema: {
        results: z.array(ObservationResultSchema)
      }
    },
    async ({ observations }) => {
      const result = await getManager().addObservations(observations);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        structuredContent: { results: result }
      };
    }
  );

  // Delete Entities
  server.registerTool(
    "delete_entities",
    {
      title: "Delete Entities",
      description: "Delete multiple entities and their associated relations from the knowledge graph",
      inputSchema: {
        entityNames: z.array(z.string()).describe("An array of entity names to delete")
      },
      outputSchema: SuccessResponseSchema.shape
    },
    async ({ entityNames }) => {
      await getManager().deleteEntities(entityNames);
      return {
        content: [{ type: "text" as const, text: "Entities deleted successfully" }],
        structuredContent: { success: true, message: "Entities deleted successfully" }
      };
    }
  );

  // Delete Observations
  server.registerTool(
    "delete_observations",
    {
      title: "Delete Observations",
      description: "Delete specific observations from entities in the knowledge graph",
      inputSchema: {
        deletions: z.array(ObservationDeletionSchema)
      },
      outputSchema: SuccessResponseSchema.shape
    },
    async ({ deletions }) => {
      await getManager().deleteObservations(deletions);
      return {
        content: [{ type: "text" as const, text: "Observations deleted successfully" }],
        structuredContent: { success: true, message: "Observations deleted successfully" }
      };
    }
  );

  // Delete Relations
  server.registerTool(
    "delete_relations",
    {
      title: "Delete Relations",
      description: "Delete multiple relations from the knowledge graph",
      inputSchema: {
        relations: z.array(RelationSchema).describe("An array of relations to delete")
      },
      outputSchema: SuccessResponseSchema.shape
    },
    async ({ relations }) => {
      await getManager().deleteRelations(relations);
      return {
        content: [{ type: "text" as const, text: "Relations deleted successfully" }],
        structuredContent: { success: true, message: "Relations deleted successfully" }
      };
    }
  );

  // Read Graph
  server.registerTool(
    "read_graph",
    {
      title: "Read Graph",
      description: "Read the entire knowledge graph",
      inputSchema: {},
      outputSchema: {
        entities: z.array(EntitySchema),
        relations: z.array(RelationSchema)
      }
    },
    async () => {
      const graph = await getManager().readGraph();
      return {
        content: [{ type: "text" as const, text: JSON.stringify(graph, null, 2) }],
        structuredContent: { ...graph }
      };
    }
  );

  // Search Nodes
  server.registerTool(
    "search_nodes",
    {
      title: "Search Nodes",
      description: "Search for nodes in the knowledge graph based on a query",
      inputSchema: {
        query: z.string().describe("The search query to match against entity names, types, and observation content")
      },
      outputSchema: {
        entities: z.array(EntitySchema),
        relations: z.array(RelationSchema)
      }
    },
    async ({ query }) => {
      const graph = await getManager().searchNodes(query);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(graph, null, 2) }],
        structuredContent: { ...graph }
      };
    }
  );

  // Open Nodes
  server.registerTool(
    "open_nodes",
    {
      title: "Open Nodes",
      description: "Open specific nodes in the knowledge graph by their names",
      inputSchema: {
        names: z.array(z.string()).describe("An array of entity names to retrieve")
      },
      outputSchema: {
        entities: z.array(EntitySchema),
        relations: z.array(RelationSchema)
      }
    },
    async ({ names }) => {
      const graph = await getManager().openNodes(names);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(graph, null, 2) }],
        structuredContent: { ...graph }
      };
    }
  );
}
