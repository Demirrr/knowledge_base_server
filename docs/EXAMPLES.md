# Example Usage

This document provides examples of how to use the Knowledge Base Server.

## Basic Examples

### Creating Entities

```json
{
  "tool": "create_entities",
  "arguments": {
    "entities": [
      {
        "name": "John_Doe",
        "entityType": "person",
        "observations": [
          "Software engineer",
          "Speaks English and Spanish",
          "Lives in San Francisco"
        ]
      },
      {
        "name": "TechCorp",
        "entityType": "company",
        "observations": [
          "Technology company",
          "Founded in 2010",
          "Specializes in AI"
        ]
      }
    ]
  }
}
```

### Creating Relations

```json
{
  "tool": "create_relations",
  "arguments": {
    "relations": [
      {
        "from": "John_Doe",
        "to": "TechCorp",
        "relationType": "works_at"
      },
      {
        "from": "John_Doe",
        "to": "Jane_Smith",
        "relationType": "collaborates_with"
      }
    ]
  }
}
```

### Adding Observations

```json
{
  "tool": "add_observations",
  "arguments": {
    "observations": [
      {
        "entityName": "John_Doe",
        "contents": [
          "Prefers morning meetings",
          "Expert in Python and TypeScript"
        ]
      }
    ]
  }
}
```

### Searching the Knowledge Graph

```json
{
  "tool": "search_nodes",
  "arguments": {
    "query": "engineer"
  }
}
```

This will return all entities whose name, type, or observations contain "engineer".

### Opening Specific Nodes

```json
{
  "tool": "open_nodes",
  "arguments": {
    "names": ["John_Doe", "TechCorp"]
  }
}
```

### Visualizing the Graph

```json
{
  "tool": "visualize_graph",
  "arguments": {}
}
```

Opens interactive D3.js visualization at `http://127.0.0.1:3000` with **live updates** (2s polling). Features: force-directed layout, zoom/pan, node drag, click details sidebar, entity type colors, relation labels toggle, pause/resume live updates.

This returns the specified entities and any relations between them.

### Reading the Entire Graph

```json
{
  "tool": "read_graph",
  "arguments": {}
}
```

## Use Case: Personal Knowledge Management

### Building a Personal Network

```javascript
// Step 1: Add people you know
create_entities({
  entities: [
    {
      name: "Alice_Johnson",
      entityType: "person",
      observations: ["Colleague", "Expert in machine learning", "Lives in Seattle"]
    },
    {
      name: "Bob_Chen",
      entityType: "person",
      observations: ["Friend", "Runs a startup", "Interested in blockchain"]
    }
  ]
});

// Step 2: Define relationships
create_relations({
  relations: [
    { from: "Alice_Johnson", to: "Bob_Chen", relationType: "introduced_me_to" }
  ]
});

// Step 3: Add new observations over time
add_observations({
  observations: [
    {
      entityName: "Alice_Johnson",
      contents: ["Recommended a book on deep learning"]
    }
  ]
});

// Step 4: Search for specific information
search_nodes({ query: "machine learning" });
```

## Use Case: Project Management

### Tracking Project Components

```javascript
// Add project entities
create_entities({
  entities: [
    {
      name: "ProjectAlpha",
      entityType: "project",
      observations: ["Web application", "Deadline: Q2 2024", "Budget: $50k"]
    },
    {
      name: "Authentication_Module",
      entityType: "component",
      observations: ["OAuth2 implementation", "Status: In Progress"]
    },
    {
      name: "Database_Layer",
      entityType: "component",
      observations: ["PostgreSQL", "Status: Complete"]
    }
  ]
});

// Link components to project
create_relations({
  relations: [
    { from: "Authentication_Module", to: "ProjectAlpha", relationType: "part_of" },
    { from: "Database_Layer", to: "ProjectAlpha", relationType: "part_of" },
    { from: "Authentication_Module", to: "Database_Layer", relationType: "depends_on" }
  ]
});
```

## Use Case: Learning and Research

### Building a Knowledge Repository

```javascript
// Add concepts you're learning
create_entities({
  entities: [
    {
      name: "Neural_Networks",
      entityType: "concept",
      observations: [
        "Computational models inspired by biological neural networks",
        "Used in deep learning",
        "Consists of layers of interconnected nodes"
      ]
    },
    {
      name: "Backpropagation",
      entityType: "algorithm",
      observations: [
        "Method for training neural networks",
        "Uses gradient descent",
        "Calculates partial derivatives"
      ]
    }
  ]
});

// Create conceptual relationships
create_relations({
  relations: [
    { from: "Backpropagation", to: "Neural_Networks", relationType: "trains" },
    { from: "Neural_Networks", to: "Deep_Learning", relationType: "foundation_of" }
  ]
});

// Later, search for related concepts
search_nodes({ query: "gradient" });
```

## Maintenance Operations

### Cleaning Up Old Data

```javascript
// Remove outdated entities
delete_entities({
  entityNames: ["Old_Project", "Deprecated_Tool"]
});

// Remove specific observations
delete_observations({
  deletions: [
    {
      entityName: "John_Doe",
      observations: ["Old phone number"]
    }
  ]
});

// Remove broken relationships
delete_relations({
  relations: [
    { from: "Person_A", to: "Company_B", relationType: "works_at" }
  ]
});
```

## Tips for Effective Use

1. **Use descriptive entity names**: Prefer `John_Smith_CEO` over `John` for clarity
2. **Keep observations atomic**: One fact per observation
3. **Use active voice for relations**: "works_at" not "employed_by"
4. **Regular cleanup**: Periodically review and remove outdated information
5. **Consistent naming**: Establish conventions for entity types and relation types
