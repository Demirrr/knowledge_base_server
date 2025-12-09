import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KnowledgeGraphManager } from '../src/manager/index.js';
import type { Entity, Relation } from '../src/types/index.js';

describe('KnowledgeGraphManager', () => {
  let manager: KnowledgeGraphManager;
  let testFilePath: string;

  beforeEach(async () => {
    testFilePath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      `test-kb-${Date.now()}.jsonl`
    );
    manager = new KnowledgeGraphManager(testFilePath);
  });

  afterEach(async () => {
    try {
      await fs.unlink(testFilePath);
    } catch (error) {
      // Ignore errors if file doesn't exist
    }
  });

  describe('createEntities', () => {
    it('should create new entities', async () => {
      const entities: Entity[] = [
        { name: 'Alice', entityType: 'person', observations: ['works at TechCorp'] },
        { name: 'Bob', entityType: 'person', observations: ['likes coding'] },
      ];

      const newEntities = await manager.createEntities(entities);
      expect(newEntities).toHaveLength(2);
      expect(newEntities).toEqual(entities);

      const graph = await manager.readGraph();
      expect(graph.entities).toHaveLength(2);
    });

    it('should not create duplicate entities', async () => {
      const entities: Entity[] = [
        { name: 'Alice', entityType: 'person', observations: ['works at TechCorp'] },
      ];

      await manager.createEntities(entities);
      const newEntities = await manager.createEntities(entities);

      expect(newEntities).toHaveLength(0);

      const graph = await manager.readGraph();
      expect(graph.entities).toHaveLength(1);
    });
  });

  describe('createRelations', () => {
    it('should create new relations', async () => {
      await manager.createEntities([
        { name: 'Alice', entityType: 'person', observations: [] },
        { name: 'Bob', entityType: 'person', observations: [] },
      ]);

      const relations: Relation[] = [
        { from: 'Alice', to: 'Bob', relationType: 'knows' },
      ];

      const newRelations = await manager.createRelations(relations);
      expect(newRelations).toHaveLength(1);
      expect(newRelations).toEqual(relations);

      const graph = await manager.readGraph();
      expect(graph.relations).toHaveLength(1);
    });
  });

  describe('searchNodes', () => {
    beforeEach(async () => {
      await manager.createEntities([
        { name: 'Alice', entityType: 'person', observations: ['works at TechCorp', 'likes programming'] },
        { name: 'Bob', entityType: 'person', observations: ['works at StartupCo'] },
        { name: 'TechCorp', entityType: 'company', observations: ['tech company'] },
      ]);

      await manager.createRelations([
        { from: 'Alice', to: 'TechCorp', relationType: 'works_at' },
      ]);
    });

    it('should search by entity name', async () => {
      const result = await manager.searchNodes('Alice');
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('Alice');
    });

    it('should search by entity type', async () => {
      const result = await manager.searchNodes('company');
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('TechCorp');
    });

    it('should search by observation content', async () => {
      const result = await manager.searchNodes('programming');
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('Alice');
    });
  });

  describe('deleteEntities', () => {
    it('should delete entities and their relations', async () => {
      await manager.createEntities([
        { name: 'Alice', entityType: 'person', observations: [] },
        { name: 'Bob', entityType: 'person', observations: [] },
      ]);

      await manager.createRelations([
        { from: 'Alice', to: 'Bob', relationType: 'knows' },
      ]);

      await manager.deleteEntities(['Alice']);

      const graph = await manager.readGraph();
      expect(graph.entities).toHaveLength(1);
      expect(graph.entities[0].name).toBe('Bob');
      expect(graph.relations).toHaveLength(0);
    });
  });

  describe('addObservations', () => {
    it('should add observations to existing entities', async () => {
      await manager.createEntities([
        { name: 'Alice', entityType: 'person', observations: ['initial observation'] },
      ]);

      const result = await manager.addObservations([
        { entityName: 'Alice', contents: ['new observation'] },
      ]);

      expect(result[0].addedObservations).toEqual(['new observation']);

      const graph = await manager.readGraph();
      expect(graph.entities[0].observations).toContain('new observation');
    });

    it('should not add duplicate observations', async () => {
      await manager.createEntities([
        { name: 'Alice', entityType: 'person', observations: ['existing observation'] },
      ]);

      const result = await manager.addObservations([
        { entityName: 'Alice', contents: ['existing observation'] },
      ]);

      expect(result[0].addedObservations).toHaveLength(0);
    });
  });

  describe('openNodes', () => {
    it('should open specific nodes by name', async () => {
      await manager.createEntities([
        { name: 'Alice', entityType: 'person', observations: [] },
        { name: 'Bob', entityType: 'person', observations: [] },
        { name: 'Charlie', entityType: 'person', observations: [] },
      ]);

      const result = await manager.openNodes(['Alice', 'Bob']);
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map(e => e.name)).toContain('Alice');
      expect(result.entities.map(e => e.name)).toContain('Bob');
    });
  });
});
