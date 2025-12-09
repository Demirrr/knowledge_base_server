/**
 * Zod validation schemas for the Knowledge Base Server
 */

import { z } from "zod";

/**
 * Schema for validating entity objects
 */
export const EntitySchema = z.object({
  name: z.string().describe("The name of the entity"),
  entityType: z.string().describe("The type of the entity"),
  observations: z.array(z.string()).describe("An array of observation contents associated with the entity")
});

/**
 * Schema for validating relation objects
 */
export const RelationSchema = z.object({
  from: z.string().describe("The name of the entity where the relation starts"),
  to: z.string().describe("The name of the entity where the relation ends"),
  relationType: z.string().describe("The type of the relation")
});

/**
 * Schema for observation input
 */
export const ObservationInputSchema = z.object({
  entityName: z.string().describe("The name of the entity to add the observations to"),
  contents: z.array(z.string()).describe("An array of observation contents to add")
});

/**
 * Schema for observation deletion input
 */
export const ObservationDeletionSchema = z.object({
  entityName: z.string().describe("The name of the entity containing the observations"),
  observations: z.array(z.string()).describe("An array of observations to delete")
});

/**
 * Schema for observation result
 */
export const ObservationResultSchema = z.object({
  entityName: z.string(),
  addedObservations: z.array(z.string())
});

/**
 * Schema for success response
 */
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});
