#!/usr/bin/env node

/**
 * Knowledge Base Visualization Example
 * 
 * This script demonstrates the visualization feature of the Knowledge Base Server.
 * It can either:
 * 1. Load an existing knowledge base from a JSONL file
 * 2. Create sample data for demonstration
 * 
 * Usage:
 *   node examples/visualize.js                    # Use sample data
 *   node examples/visualize.js path/to/kb.jsonl   # Load from file
 */

import { KnowledgeGraphManager, visualizeGraph } from '../dist/lib.js';
import { existsSync } from 'fs';
import { resolve } from 'path';

const SAMPLE_ENTITIES = [
  { name: 'Alice', entityType: 'person', observations: ['Software Engineer', 'Loves hiking', 'Based in Berlin'] },
  { name: 'Bob', entityType: 'person', observations: ['Data Scientist', 'Plays guitar', 'Coffee enthusiast'] },
  { name: 'Carol', entityType: 'person', observations: ['Product Manager', 'Former developer'] },
  { name: 'TechCorp', entityType: 'company', observations: ['Founded in 2015', 'AI startup', '50 employees'] },
  { name: 'DataInc', entityType: 'company', observations: ['Big data analytics', 'Remote-first company'] },
  { name: 'ML_Project', entityType: 'project', observations: ['Machine learning pipeline', 'Python based', 'In production'] },
  { name: 'WebApp', entityType: 'project', observations: ['Customer-facing application', 'React frontend'] },
  { name: 'Berlin', entityType: 'city', observations: ['Capital of Germany', 'Major tech hub'] },
  { name: 'San_Francisco', entityType: 'city', observations: ['Tech capital', 'Bay Area'] },
  { name: 'Python', entityType: 'technology', observations: ['Programming language', 'Great for ML'] },
  { name: 'TypeScript', entityType: 'technology', observations: ['JavaScript with types', 'Enterprise ready'] }
];

const SAMPLE_RELATIONS = [
  { from: 'Alice', to: 'TechCorp', relationType: 'works_at' },
  { from: 'Bob', to: 'DataInc', relationType: 'works_at' },
  { from: 'Carol', to: 'TechCorp', relationType: 'works_at' },
  { from: 'Alice', to: 'Bob', relationType: 'collaborates_with' },
  { from: 'Alice', to: 'Carol', relationType: 'mentors' },
  { from: 'Alice', to: 'ML_Project', relationType: 'leads' },
  { from: 'Bob', to: 'ML_Project', relationType: 'contributes_to' },
  { from: 'Carol', to: 'WebApp', relationType: 'manages' },
  { from: 'TechCorp', to: 'Berlin', relationType: 'headquartered_in' },
  { from: 'DataInc', to: 'San_Francisco', relationType: 'headquartered_in' },
  { from: 'Alice', to: 'Berlin', relationType: 'lives_in' },
  { from: 'Bob', to: 'San_Francisco', relationType: 'lives_in' },
  { from: 'ML_Project', to: 'Python', relationType: 'built_with' },
  { from: 'WebApp', to: 'TypeScript', relationType: 'built_with' },
  { from: 'Alice', to: 'Python', relationType: 'expert_in' },
  { from: 'Bob', to: 'Python', relationType: 'uses' }
];

async function createSampleData(manager) {
  console.log('📝 Creating sample knowledge base...');
  await manager.createEntities(SAMPLE_ENTITIES);
  await manager.createRelations(SAMPLE_RELATIONS);
  console.log(`   Created ${SAMPLE_ENTITIES.length} entities and ${SAMPLE_RELATIONS.length} relations`);
}

async function main() {
  const args = process.argv.slice(2);
  let knowledgeBasePath;
  let useSampleData = false;

  // Parse arguments
  if (args.length === 0) {
    // No arguments - use sample data with temp file
    knowledgeBasePath = '/tmp/knowledge_base_example.jsonl';
    useSampleData = true;
    console.log('🧠 Knowledge Base Visualization Example\n');
    console.log('No file provided - using sample data.\n');
  } else if (args[0] === '--help' || args[0] === '-h') {
    console.log(`
🧠 Knowledge Base Visualization

Usage:
  node examples/visualize.js                    Use sample data for demonstration
  node examples/visualize.js <path>             Load knowledge base from JSONL file
  node examples/visualize.js --help             Show this help message

Examples:
  node examples/visualize.js
  node examples/visualize.js ./my_knowledge_base.jsonl
  node examples/visualize.js ~/Documents/notes.jsonl

The visualization will open in your default browser with an interactive
D3.js graph where you can:
  • Drag nodes to rearrange the layout
  • Click nodes to see their details
  • Zoom and pan to navigate
  • Toggle edge labels
`);
    process.exit(0);
  } else {
    // File path provided
    knowledgeBasePath = resolve(args[0]);
    if (!existsSync(knowledgeBasePath)) {
      console.error(`❌ Error: File not found: ${knowledgeBasePath}`);
      console.error('\nUse --help for usage information.');
      process.exit(1);
    }
    console.log('🧠 Knowledge Base Visualization\n');
    console.log(`📂 Loading from: ${knowledgeBasePath}\n`);
  }

  try {
    // Initialize manager
    const manager = new KnowledgeGraphManager(knowledgeBasePath);

    // Create sample data if needed
    if (useSampleData) {
      await createSampleData(manager);
    }

    // Read the graph
    const graph = await manager.readGraph();
    
    if (graph.entities.length === 0) {
      console.log('⚠️  The knowledge base is empty. Nothing to visualize.');
      console.log('   Run without arguments to see sample data.');
      process.exit(0);
    }

    console.log(`📊 Graph Statistics:`);
    console.log(`   Entities: ${graph.entities.length}`);
    console.log(`   Relations: ${graph.relations.length}`);
    
    // Get unique entity types
    const entityTypes = [...new Set(graph.entities.map(e => e.entityType))];
    console.log(`   Entity Types: ${entityTypes.join(', ')}\n`);

    // Start visualization
    console.log('🚀 Starting visualization server...');
    const url = await visualizeGraph(graph);
    console.log(`\n✨ Visualization opened at: ${url}`);
    console.log('\n💡 Tips:');
    console.log('   • Drag nodes to rearrange the layout');
    console.log('   • Click on a node to see its details');
    console.log('   • Use mouse wheel to zoom in/out');
    console.log('   • Press "Reset View" to reset zoom\n');
    console.log('Press Ctrl+C to stop the server...');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
