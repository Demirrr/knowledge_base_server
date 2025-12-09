/**
 * Core type definitions for the Knowledge Base Server
 */

/**
 * Represents an entity in the knowledge graph
 */
export interface Entity {
  name: string;
  entityType: string;
  observations: string[];
}

/**
 * Represents a relationship between two entities
 */
export interface Relation {
  from: string;
  to: string;
  relationType: string;
}

/**
 * The complete knowledge graph structure
 */
export interface KnowledgeGraph {
  entities: Entity[];
  relations: Relation[];
}

/**
 * Input for adding observations to entities
 */
export interface ObservationInput {
  entityName: string;
  contents: string[];
}

/**
 * Result of adding observations
 */
export interface ObservationResult {
  entityName: string;
  addedObservations: string[];
}

/**
 * Input for deleting observations from entities
 */
export interface ObservationDeletion {
  entityName: string;
  observations: string[];
}
