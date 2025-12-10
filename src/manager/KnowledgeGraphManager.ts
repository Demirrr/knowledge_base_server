/**
 * Knowledge Graph Manager - handles all CRUD operations for the knowledge graph
 */

import { promises as fs } from 'fs';
import type { 
  Entity, 
  Relation, 
  KnowledgeGraph, 
  ObservationInput, 
  ObservationResult, 
  ObservationDeletion 
} from '../types/index.js';

/**
 * Manages the knowledge graph data stored in a JSONL file
 */
export class KnowledgeGraphManager {
  constructor(private memoryFilePath: string) {}

  /**
   * Load the knowledge graph from the file
   */
  private async loadGraph(): Promise<KnowledgeGraph> {
    try {
      const data = await fs.readFile(this.memoryFilePath, "utf-8");
      const lines = data.split("\n").filter(line => line.trim() !== "");
      return lines.reduce((graph: KnowledgeGraph, line) => {
        const item = JSON.parse(line);
        if (item.type === "entity") graph.entities.push(item as Entity);
        if (item.type === "relation") graph.relations.push(item as Relation);
        return graph;
      }, { entities: [], relations: [] });
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as any).code === "ENOENT") {
        return { entities: [], relations: [] };
      }
      throw error;
    }
  }

  /**
   * Save the knowledge graph to the file
   */
  private async saveGraph(graph: KnowledgeGraph): Promise<void> {
    const lines = [
      ...graph.entities.map(e => JSON.stringify({
        type: "entity",
        name: e.name,
        entityType: e.entityType,
        observations: e.observations
      })),
      ...graph.relations.map(r => JSON.stringify({
        type: "relation",
        from: r.from,
        to: r.to,
        relationType: r.relationType
      })),
    ];
    await fs.writeFile(this.memoryFilePath, lines.join("\n"));
  }

  /**
   * Create new entities in the knowledge graph
   */
  async createEntities(entities: Entity[]): Promise<Entity[]> {
    const graph = await this.loadGraph();
    const newEntities = entities.filter(e => 
      !graph.entities.some(existingEntity => existingEntity.name === e.name)
    );
    graph.entities.push(...newEntities);
    await this.saveGraph(graph);
    return newEntities;
  }

  /**
   * Create new relations between entities
   */
  async createRelations(relations: Relation[]): Promise<Relation[]> {
    const graph = await this.loadGraph();
    const newRelations = relations.filter(r => 
      !graph.relations.some(existingRelation => 
        existingRelation.from === r.from && 
        existingRelation.to === r.to && 
        existingRelation.relationType === r.relationType
      )
    );
    graph.relations.push(...newRelations);
    await this.saveGraph(graph);
    return newRelations;
  }

  /**
   * Add observations to existing entities
   */
  async addObservations(observations: ObservationInput[]): Promise<ObservationResult[]> {
    const graph = await this.loadGraph();
    const results = observations.map(o => {
      const entity = graph.entities.find(e => e.name === o.entityName);
      if (!entity) {
        throw new Error(`Entity with name ${o.entityName} not found`);
      }
      const newObservations = o.contents.filter(content => !entity.observations.includes(content));
      entity.observations.push(...newObservations);
      return { entityName: o.entityName, addedObservations: newObservations };
    });
    await this.saveGraph(graph);
    return results;
  }

  /**
   * Delete entities and their associated relations
   */
  async deleteEntities(entityNames: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !entityNames.includes(e.name));
    graph.relations = graph.relations.filter(r => 
      !entityNames.includes(r.from) && !entityNames.includes(r.to)
    );
    await this.saveGraph(graph);
  }

  /**
   * Delete specific observations from entities
   */
  async deleteObservations(deletions: ObservationDeletion[]): Promise<void> {
    const graph = await this.loadGraph();
    deletions.forEach(d => {
      const entity = graph.entities.find(e => e.name === d.entityName);
      if (entity) {
        entity.observations = entity.observations.filter(o => !d.observations.includes(o));
      }
    });
    await this.saveGraph(graph);
  }

  /**
   * Delete relations from the knowledge graph
   */
  async deleteRelations(relations: Relation[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.relations = graph.relations.filter(r => 
      !relations.some(delRelation => 
        r.from === delRelation.from && 
        r.to === delRelation.to && 
        r.relationType === delRelation.relationType
      )
    );
    await this.saveGraph(graph);
  }

  /**
   * Read the entire knowledge graph
   */
  async readGraph(): Promise<KnowledgeGraph> {
    return this.loadGraph();
  }

  /**
   * Search for nodes matching a query
   */
  async searchNodes(query: string): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();
    
    const filteredEntities = graph.entities.filter(e => 
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.entityType.toLowerCase().includes(query.toLowerCase()) ||
      e.observations.some(o => o.toLowerCase().includes(query.toLowerCase()))
    );
  
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));
  
    const filteredRelations = graph.relations.filter(r => 
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );
  
    return {
      entities: filteredEntities,
      relations: filteredRelations,
    };
  }

  /**
   * Open specific nodes by their names
   */
  async openNodes(names: string[]): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();
    
    const filteredEntities = graph.entities.filter(e => names.includes(e.name));
  
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));
  
    const filteredRelations = graph.relations.filter(r => 
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );
  
    return {
      entities: filteredEntities,
      relations: filteredRelations,
    };
  }

  /**
   * Search observations of a specific entity
   */
  async searchObservations(entityName: string, query: string): Promise<string[]> {
    const graph = await this.loadGraph();
    const entity = graph.entities.find(e => e.name === entityName);
    if (!entity) {
      throw new Error(`Entity with name ${entityName} not found`);
    }
    return entity.observations.filter(observation => 
      observation.toLowerCase().includes(query.toLowerCase())
    );
  }
}
