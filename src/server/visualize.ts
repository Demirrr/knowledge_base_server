/**
 * Knowledge Base Visualization Server
 * 
 * Creates an interactive visualization of the knowledge base using D3.js
 * and serves it via a local HTTP server with live updates via polling.
 */

import * as http from 'http';
import type { KnowledgeGraph } from '../types/index.js';

let currentServer: http.Server | null = null;

/** Function type for loading the current graph state */
export type GraphLoader = () => Promise<KnowledgeGraph>;

/**
 * Generate the HTML page with D3.js visualization
 */
function generateVisualizationHTML(graph: KnowledgeGraph): string {
  const nodes = graph.entities.map(entity => ({
    id: entity.name,
    type: entity.entityType,
    observations: entity.observations
  }));

  const links = graph.relations.map(relation => ({
    source: relation.from,
    target: relation.to,
    type: relation.relationType
  }));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Interactive knowledge base graph visualization">
  <meta name="theme-color" content="#1a1a2e">
  <title>Knowledge Base Visualization</title>
  <link rel="preconnect" href="https://d3js.org" crossorigin>
  <script src="https://d3js.org/d3.v7.min.js" defer></script>
  <style>
    :root {
      --color-primary: #4fc3f7;
      --color-secondary: #81c784;
      --color-accent: #ffd700;
      --color-success: #4caf50;
      --color-warning: #ff9800;
      --color-bg-dark: #1a1a2e;
      --color-bg-darker: #16213e;
      --color-text: #ffffff;
      --color-text-muted: rgba(255, 255, 255, 0.7);
      --color-text-dim: rgba(255, 255, 255, 0.5);
      --color-border: rgba(255, 255, 255, 0.1);
      --color-surface: rgba(255, 255, 255, 0.05);
      --color-surface-hover: rgba(255, 255, 255, 0.1);
      --color-overlay: rgba(0, 0, 0, 0.3);
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-full: 9999px;
      --transition-fast: 150ms ease;
      --transition-normal: 200ms ease;
      --sidebar-width: 350px;
      --header-height: 70px;
      --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    *,
    *::before,
    *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      font-family: var(--font-family);
      background: linear-gradient(135deg, var(--color-bg-dark) 0%, var(--color-bg-darker) 100%);
      min-height: 100vh;
      min-height: 100dvh;
      color: var(--color-text);
      line-height: 1.5;
      overflow: hidden;
    }

    /* Focus styles for accessibility */
    :focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    button:focus:not(:focus-visible) {
      outline: none;
    }

    /* Header */
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      height: var(--header-height);
      padding: 0 1.25rem;
      background: var(--color-overlay);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
    }

    .header h1 {
      font-size: 1.5rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.625rem;
      letter-spacing: -0.02em;
    }

    .header h1::before {
      content: "🧠";
      font-size: 1.75rem;
    }

    .stats {
      display: flex;
      gap: 0.75rem;
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }

    .stat {
      background: var(--color-surface-hover);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-full);
      font-variant-numeric: tabular-nums;
      transition: background var(--transition-fast);
    }

    .stat:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    /* Main Layout */
    .container {
      display: flex;
      height: calc(100vh - var(--header-height));
      height: calc(100dvh - var(--header-height));
    }

    #graph {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    /* Empty state for graph */
    .graph-empty {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--color-text-dim);
      gap: 1rem;
      pointer-events: none;
    }

    .graph-empty-icon {
      font-size: 4rem;
      opacity: 0.5;
    }

    /* Sidebar */
    .sidebar {
      width: var(--sidebar-width);
      background: var(--color-overlay);
      border-left: 1px solid var(--color-border);
      padding: 1.25rem;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--color-surface-hover) transparent;
    }

    .sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: var(--color-surface-hover);
      border-radius: var(--radius-full);
    }

    .sidebar h2 {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
      color: var(--color-text-muted);
    }

    .sidebar h3 {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-muted);
      margin: 1.25rem 0 0.75rem;
    }

    /* Legend */
    .legend {
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--color-border);
    }

    .legend-items {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      background: var(--color-surface);
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-full);
      transition: background var(--transition-fast);
      cursor: default;
    }

    .legend-item:hover {
      background: var(--color-surface-hover);
    }

    .legend-color {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* Node Info Panel */
    .node-info {
      display: none;
      animation: fadeIn var(--transition-normal);
    }

    .node-info.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .node-info .name {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
      color: var(--color-primary);
      word-break: break-word;
    }

    .node-info .type {
      display: inline-block;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--color-surface);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;
    }

    /* Observations List */
    .observations-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .observations-list li {
      background: var(--color-surface);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      line-height: 1.5;
      border-left: 3px solid var(--color-primary);
      transition: background var(--transition-fast);
    }

    .observations-list li:hover {
      background: var(--color-surface-hover);
    }

    .observations-list .empty {
      color: var(--color-text-dim);
      border-left-color: transparent;
      font-style: italic;
    }

    /* Relations */
    .relations-section {
      margin-top: 1.25rem;
    }

    .relations-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .relation-item {
      background: var(--color-surface);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background var(--transition-fast);
    }

    .relation-item:hover {
      background: var(--color-surface-hover);
    }

    .relation-item .relation-type {
      color: var(--color-secondary);
      font-weight: 500;
      background: rgba(129, 199, 132, 0.15);
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
    }

    .relation-item .arrow {
      color: var(--color-text-dim);
    }

    .relation-item.empty {
      color: var(--color-text-dim);
      font-style: italic;
    }

    /* Placeholder */
    .placeholder {
      color: var(--color-text-dim);
      font-style: italic;
      text-align: center;
      padding: 2.5rem 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .placeholder-icon {
      font-size: 2.5rem;
      opacity: 0.6;
    }

    /* D3 Graph Styles */
    .node circle {
      stroke: var(--color-text);
      stroke-width: 2px;
      cursor: pointer;
      transition: stroke-width var(--transition-fast), filter var(--transition-fast);
    }

    .node circle:hover {
      stroke-width: 3px;
      filter: brightness(1.2) drop-shadow(0 0 8px currentColor);
    }

    .node.selected circle {
      stroke: var(--color-accent);
      stroke-width: 4px;
      filter: drop-shadow(0 0 12px var(--color-accent));
    }

    .node text {
      font-size: 11px;
      font-weight: 500;
      fill: var(--color-text);
      pointer-events: none;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
      user-select: none;
    }

    .link {
      stroke: rgba(255, 255, 255, 0.25);
      stroke-width: 1.5px;
      fill: none;
      transition: stroke var(--transition-fast);
    }

    .link:hover {
      stroke: rgba(255, 255, 255, 0.5);
    }

    .link-label {
      font-size: 9px;
      font-weight: 500;
      fill: var(--color-text-dim);
      text-anchor: middle;
      pointer-events: none;
      user-select: none;
    }

    .arrow {
      fill: var(--color-primary);
      stroke: none;
    }

    /* Controls */
    .controls {
      position: fixed;
      bottom: 1.25rem;
      left: 1.25rem;
      display: flex;
      gap: 0.5rem;
      z-index: 100;
    }

    .controls button {
      background: var(--color-overlay);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      padding: 0.625rem 1rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.8125rem;
      font-weight: 500;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }

    .controls button:hover {
      background: var(--color-surface-hover);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .controls button:active {
      transform: translateY(0);
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--color-text-muted);
      background: var(--color-overlay);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 0.625rem 1rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
    }

    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-success);
      animation: pulse 2s ease-in-out infinite;
    }

    .live-dot.paused {
      background: var(--color-warning);
      animation: none;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.9); }
    }

    /* Search */
    .search-container {
      margin-bottom: 1rem;
    }

    .search-input {
      width: 100%;
      padding: 0.625rem 1rem;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      font-size: 0.875rem;
      font-family: inherit;
      transition: border-color var(--transition-fast), background var(--transition-fast);
    }

    .search-input::placeholder {
      color: var(--color-text-dim);
    }

    .search-input:hover {
      background: var(--color-surface-hover);
    }

    .search-input:focus {
      border-color: var(--color-primary);
      background: var(--color-surface-hover);
    }

    /* Loading state */
    .loading {
      position: fixed;
      inset: 0;
      background: var(--color-bg-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      transition: opacity 0.3s ease;
    }

    .loading.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-surface);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      :root {
        --sidebar-width: 100%;
        --header-height: 60px;
      }

      .header {
        padding: 0 1rem;
      }

      .header h1 {
        font-size: 1.25rem;
      }

      .stats {
        gap: 0.5rem;
      }

      .stat {
        padding: 0.375rem 0.75rem;
        font-size: 0.8125rem;
      }

      .container {
        flex-direction: column;
      }

      #graph {
        height: 50%;
      }

      .sidebar {
        height: 50%;
        border-left: none;
        border-top: 1px solid var(--color-border);
      }

      .controls {
        bottom: auto;
        top: calc(var(--header-height) + 0.75rem);
        left: 0.75rem;
        flex-wrap: wrap;
      }

      .controls button,
      .live-indicator {
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Print styles */
    @media print {
      .controls,
      .live-indicator,
      .search-container {
        display: none !important;
      }

      body {
        background: white;
        color: black;
      }
    }
  </style>
</head>
<body>
  <div class="loading" id="loading" aria-label="Loading visualization">
    <div class="spinner"></div>
  </div>

  <header class="header" role="banner">
    <h1>Knowledge Base</h1>
    <div class="stats" role="status" aria-live="polite">
      <span class="stat" id="node-count" aria-label="Number of nodes">Nodes: 0</span>
      <span class="stat" id="edge-count" aria-label="Number of edges">Edges: 0</span>
    </div>
  </header>

  <main class="container" role="main">
    <div id="graph" role="img" aria-label="Knowledge graph visualization">
      <div class="graph-empty" id="graph-empty" style="display: none;">
        <span class="graph-empty-icon">📊</span>
        <span>No data to visualize</span>
      </div>
    </div>
    <aside class="sidebar" role="complementary" aria-label="Graph details">
      <div class="search-container">
        <label for="search-input" class="visually-hidden">Search nodes</label>
        <input 
          type="search" 
          id="search-input" 
          class="search-input" 
          placeholder="Search nodes..."
          autocomplete="off"
          aria-describedby="search-hint"
        >
        <span id="search-hint" class="visually-hidden">Type to filter nodes in the graph</span>
      </div>

      <nav class="legend" aria-label="Entity type legend">
        <h2>Entity Types</h2>
        <div id="legend-items" class="legend-items" role="list"></div>
      </nav>

      <section class="node-info" id="node-info" aria-label="Selected node details">
        <h2>Selected Node</h2>
        <div class="name" id="node-name"></div>
        <div class="type" id="node-type"></div>

        <h3 id="observations-heading">Observations</h3>
        <ul class="observations-list" id="observations-list" aria-labelledby="observations-heading"></ul>

        <div class="relations-section">
          <h3 id="relations-heading">Relations</h3>
          <div id="relations-list" class="relations-list" role="list" aria-labelledby="relations-heading"></div>
        </div>
      </section>

      <div class="placeholder" id="placeholder" aria-hidden="true">
        <span class="placeholder-icon">👆</span>
        <span>Click on a node to see its details</span>
      </div>
    </aside>
  </main>

  <nav class="controls" role="toolbar" aria-label="Graph controls">
    <button type="button" onclick="resetZoom()" aria-label="Reset zoom and pan">
      <span aria-hidden="true">⟲</span> Reset View
    </button>
    <button type="button" onclick="toggleLabels()" aria-pressed="true" id="labels-btn">
      <span aria-hidden="true">🏷️</span> Toggle Labels
    </button>
    <button type="button" onclick="toggleLiveUpdate()" id="live-btn" aria-pressed="true">
      <span aria-hidden="true">⏸</span> Pause Live
    </button>
    <div class="live-indicator" role="status" aria-live="polite">
      <div class="live-dot" id="live-dot" aria-hidden="true"></div>
      <span id="live-status">Live</span>
    </div>
  </nav>

  <style>.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}</style>

  <script>
    // Wait for D3 to load
    document.addEventListener('DOMContentLoaded', initGraph);
    if (typeof d3 !== 'undefined') initGraph();

    let initialized = false;
    function initGraph() {
      if (initialized || typeof d3 === 'undefined') return;
      initialized = true;

      // Hide loading screen
      const loadingEl = document.getElementById('loading');
      setTimeout(() => loadingEl.classList.add('hidden'), 300);

      // Graph data from server
      const nodes = ${JSON.stringify(nodes)};
      const links = ${JSON.stringify(links)};

      // Show empty state if no data
      const graphEmpty = document.getElementById('graph-empty');
      if (nodes.length === 0) {
        graphEmpty.style.display = 'flex';
      }

      // Update stats
      const updateStats = () => {
        document.getElementById('node-count').textContent = 'Nodes: ' + nodes.length;
        document.getElementById('edge-count').textContent = 'Edges: ' + links.length;
      };
      updateStats();

      // Color scale for entity types with better colors
      const entityTypes = [...new Set(nodes.map(n => n.type))];
      const colorPalette = [
        '#4fc3f7', '#81c784', '#ffb74d', '#f06292', '#ba68c8',
        '#4db6ac', '#ff8a65', '#a1887f', '#90a4ae', '#aed581',
        '#64b5f6', '#dce775', '#ffd54f', '#4dd0e1', '#e57373'
      ];
      const colorScale = d3.scaleOrdinal()
        .domain(entityTypes)
        .range(colorPalette);

      // Build legend
      const legendContainer = document.getElementById('legend-items');
      const buildLegend = (types) => {
        legendContainer.innerHTML = '';
        types.forEach(type => {
          const item = document.createElement('div');
          item.className = 'legend-item';
          item.setAttribute('role', 'listitem');
          item.innerHTML = \`<div class="legend-color" style="background: \${colorScale(type)}"></div><span>\${type}</span>\`;
          item.addEventListener('click', () => highlightByType(type));
          item.style.cursor = 'pointer';
          legendContainer.appendChild(item);
        });
      };
      buildLegend(entityTypes);

      // Setup SVG
      const container = document.getElementById('graph');
      let width = container.clientWidth || 800;
      let height = container.clientHeight || 600;

      const svg = d3.select('#graph')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', [0, 0, width, height])
        .attr('preserveAspectRatio', 'xMidYMid meet');

      // Add zoom behavior
      const g = svg.append('g');

      const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });

      svg.call(zoom);

      // Arrow marker for directed edges
      const defs = svg.append('defs');
      defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 28)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .append('path')
        .attr('d', 'M 0,-5 L 10,0 L 0,5')
        .attr('class', 'arrow');

      // Create a map for node lookup
      let nodeById = new Map(nodes.map(n => [n.id, n]));

      // Resolve link source/target strings to node objects
      const resolveLinks = () => {
        const resolved = [];
        links.forEach(l => {
          const sourceNode = typeof l.source === 'string' ? nodeById.get(l.source) : l.source;
          const targetNode = typeof l.target === 'string' ? nodeById.get(l.target) : l.target;
          if (sourceNode && targetNode) {
            resolved.push({ source: sourceNode, target: targetNode, type: l.type });
          }
        });
        links.length = 0;
        resolved.forEach(l => links.push(l));
      };
      resolveLinks();

      // Create force simulation
      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).distance(150).strength(0.5))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(50))
        .force('x', d3.forceX(width / 2).strength(0.05))
        .force('y', d3.forceY(height / 2).strength(0.05));

      // Draw links
      const linkGroup = g.append('g').attr('class', 'links-group');
      let link = linkGroup
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('class', 'link')
        .attr('marker-end', 'url(#arrowhead)');

      // Draw link labels
      let showLabels = true;
      const labelGroup = g.append('g').attr('class', 'labels-group');
      let linkLabel = labelGroup
        .selectAll('text')
        .data(links)
        .join('text')
        .attr('class', 'link-label')
        .text(d => d.type);

      // Draw nodes
      const nodeGroup = g.append('g').attr('class', 'nodes-group');
      let node = nodeGroup
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('class', 'node')
        .attr('tabindex', '0')
        .attr('role', 'button')
        .attr('aria-label', d => \`Node: \${d.id}, Type: \${d.type}\`)
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

      node.append('circle')
        .attr('r', 20)
        .attr('fill', d => colorScale(d.type));
    
    node.append('text')
      .attr('dy', 35)
      .attr('text-anchor', 'middle')
      .text(d => d.id.length > 15 ? d.id.substring(0, 15) + '...' : d.id);

    // Node click handler
    let selectedNode = null;
    node.on('click', (event, d) => {
      event.stopPropagation();
      selectNode(d);
    });

    // Keyboard navigation for accessibility
    node.on('keydown', (event, d) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectNode(d);
      }
    });

    svg.on('click', () => deselectNode());

    // Escape key to deselect
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') deselectNode();
    });

    function selectNode(d) {
      if (selectedNode) {
        d3.selectAll('.node').classed('selected', false);
      }

      selectedNode = d;
      d3.selectAll('.node').filter(n => n.id === d.id).classed('selected', true);

      // Update sidebar
      document.getElementById('placeholder').style.display = 'none';
      document.getElementById('placeholder').setAttribute('aria-hidden', 'true');
      const nodeInfo = document.getElementById('node-info');
      nodeInfo.classList.add('active');
      document.getElementById('node-name').textContent = d.id;
      document.getElementById('node-type').textContent = d.type;

      // Observations
      const obsList = document.getElementById('observations-list');
      obsList.innerHTML = '';
      if (d.observations && d.observations.length > 0) {
        d.observations.forEach(obs => {
          const li = document.createElement('li');
          li.textContent = obs;
          obsList.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.className = 'empty';
        li.textContent = 'No observations';
        obsList.appendChild(li);
      }

      // Relations
      const relList = document.getElementById('relations-list');
      relList.innerHTML = '';
      const outgoing = links.filter(l => (l.source.id || l.source) === d.id);
      const incoming = links.filter(l => (l.target.id || l.target) === d.id);

      if (outgoing.length === 0 && incoming.length === 0) {
        const div = document.createElement('div');
        div.className = 'relation-item empty';
        div.textContent = 'No relations';
        relList.appendChild(div);
      } else {
        outgoing.forEach(rel => {
          const div = document.createElement('div');
          div.className = 'relation-item';
          div.setAttribute('role', 'listitem');
          const targetId = typeof rel.target === 'object' ? rel.target.id : rel.target;
          div.innerHTML = \`<span class="arrow">→</span> <span class="relation-type">\${escapeHtml(rel.type)}</span> <span class="arrow">→</span> \${escapeHtml(targetId)}\`;
          relList.appendChild(div);
        });
        incoming.forEach(rel => {
          const div = document.createElement('div');
          div.className = 'relation-item';
          div.setAttribute('role', 'listitem');
          const sourceId = typeof rel.source === 'object' ? rel.source.id : rel.source;
          div.innerHTML = \`\${escapeHtml(sourceId)} <span class="arrow">→</span> <span class="relation-type">\${escapeHtml(rel.type)}</span> <span class="arrow">→</span>\`;
          relList.appendChild(div);
        });
      }

      // Announce to screen readers
      nodeInfo.setAttribute('aria-live', 'polite');
    }

    function deselectNode() {
      selectedNode = null;
      d3.selectAll('.node').classed('selected', false);
      document.getElementById('node-info').classList.remove('active');
      const placeholder = document.getElementById('placeholder');
      placeholder.style.display = 'flex';
      placeholder.setAttribute('aria-hidden', 'false');
    }

    // Utility function to escape HTML
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Highlight nodes by type
    function highlightByType(type) {
      d3.selectAll('.node')
        .style('opacity', d => d.type === type ? 1 : 0.3);
      d3.selectAll('.link')
        .style('opacity', 0.15);

      setTimeout(() => {
        d3.selectAll('.node').style('opacity', 1);
        d3.selectAll('.link').style('opacity', 1);
      }, 2000);
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          d3.selectAll('.node').style('opacity', 1);
          d3.selectAll('.link').style('opacity', 1);
          return;
        }

        d3.selectAll('.node').style('opacity', d => {
          const matches = d.id.toLowerCase().includes(query) ||
            d.type.toLowerCase().includes(query) ||
            (d.observations && d.observations.some(o => o.toLowerCase().includes(query)));
          return matches ? 1 : 0.15;
        });

        d3.selectAll('.link').style('opacity', d => {
          const sourceMatch = d.source.id.toLowerCase().includes(query);
          const targetMatch = d.target.id.toLowerCase().includes(query);
          return (sourceMatch || targetMatch) ? 0.5 : 0.1;
        });
      }, 150);
    });

    // Clear search on Escape
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.blur();
      }
    });
    
    // Simulation tick
    simulation.on('tick', () => {
      g.select('.links-group').selectAll('line')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      g.select('.labels-group').selectAll('text')
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);

      g.select('.nodes-group').selectAll('g.node')
        .attr('transform', d => \`translate(\${d.x},\${d.y})\`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Control functions - expose to window for onclick handlers
    window.resetZoom = function() {
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.translate(0, 0).scale(1)
      );
    };

    window.toggleLabels = function() {
      showLabels = !showLabels;
      linkLabel.style('opacity', showLabels ? 1 : 0);
      const btn = document.getElementById('labels-btn');
      btn.setAttribute('aria-pressed', showLabels);
    };

    // Handle window resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        width = container.clientWidth || 800;
        height = container.clientHeight || 600;
        svg.attr('viewBox', [0, 0, width, height]);
        simulation.force('center', d3.forceCenter(width / 2, height / 2));
        simulation.force('x', d3.forceX(width / 2).strength(0.05));
        simulation.force('y', d3.forceY(height / 2).strength(0.05));
        simulation.alpha(0.3).restart();
      }, 150);
    });

    // Live update polling
    let liveUpdateEnabled = true;
    let pollInterval = null;
    const POLL_INTERVAL_MS = 2000;

    function updateGraph(newNodes, newLinks) {
      // Build maps for quick lookup
      const existingNodesMap = new Map(nodes.map(n => [n.id, n]));
      const existingLinksSet = new Set(links.map(l => {
        const src = typeof l.source === 'object' ? l.source.id : l.source;
        const tgt = typeof l.target === 'object' ? l.target.id : l.target;
        return src + '|' + l.type + '|' + tgt;
      }));

      // Detect changes
      let hasChanges = nodes.length !== newNodes.length || links.length !== newLinks.length;

      if (!hasChanges) {
        for (const n of newNodes) {
          const existing = existingNodesMap.get(n.id);
          if (!existing || existing.type !== n.type ||
              JSON.stringify(existing.observations) !== JSON.stringify(n.observations)) {
            hasChanges = true;
            break;
          }
        }
      }
      if (!hasChanges) {
        for (const l of newLinks) {
          if (!existingLinksSet.has(l.source + '|' + l.type + '|' + l.target)) {
            hasChanges = true;
            break;
          }
        }
      }

      if (!hasChanges) return;

      // Update empty state
      graphEmpty.style.display = newNodes.length === 0 ? 'flex' : 'none';

      // Preserve positions for existing nodes
      const positions = new Map();
      nodes.forEach(n => {
        if (n.x !== undefined) positions.set(n.id, { x: n.x, y: n.y, vx: n.vx, vy: n.vy });
      });

      // Update nodes array
      nodes.length = 0;
      newNodes.forEach(n => {
        const pos = positions.get(n.id);
        if (pos) {
          n.x = pos.x; n.y = pos.y; n.vx = pos.vx; n.vy = pos.vy;
        } else {
          n.x = width / 2 + (Math.random() - 0.5) * 100;
          n.y = height / 2 + (Math.random() - 0.5) * 100;
        }
        nodes.push(n);
      });

      // Rebuild node map
      nodeById = new Map(nodes.map(n => [n.id, n]));

      // Update links array
      links.length = 0;
      newLinks.forEach(l => {
        const sourceNode = nodeById.get(l.source);
        const targetNode = nodeById.get(l.target);
        if (sourceNode && targetNode) {
          links.push({ source: sourceNode, target: targetNode, type: l.type });
        }
      });

      // Update stats
      updateStats();

      // Update legend
      const newEntityTypes = [...new Set(nodes.map(n => n.type))];
      colorScale.domain(newEntityTypes);
      buildLegend(newEntityTypes);

      // Update D3 bindings
      const linkKey = d => {
        const src = typeof d.source === 'object' ? d.source.id : d.source;
        const tgt = typeof d.target === 'object' ? d.target.id : d.target;
        return src + '|' + d.type + '|' + tgt;
      };

      const linkSelection = g.select('.links-group').selectAll('line').data(links, linkKey);
      linkSelection.exit().remove();
      const linkEnter = linkSelection.enter().append('line')
        .attr('class', 'link')
        .attr('marker-end', 'url(#arrowhead)');
      link = linkEnter.merge(linkSelection);

      const labelSelection = g.select('.labels-group').selectAll('text').data(links, linkKey);
      labelSelection.exit().remove();
      const labelEnter = labelSelection.enter().append('text')
        .attr('class', 'link-label')
        .text(d => d.type);
      linkLabel = labelEnter.merge(labelSelection);
      linkLabel.style('opacity', showLabels ? 1 : 0);

      const nodeSelection = g.select('.nodes-group').selectAll('g.node').data(nodes, d => d.id);
      nodeSelection.exit().remove();
      const nodeEnter = nodeSelection.enter().append('g')
        .attr('class', 'node')
        .attr('tabindex', '0')
        .attr('role', 'button')
        .attr('aria-label', d => \`Node: \${d.id}, Type: \${d.type}\`)
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
        .on('click', (event, d) => { event.stopPropagation(); selectNode(d); })
        .on('keydown', (event, d) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectNode(d);
          }
        });
      nodeEnter.append('circle').attr('r', 20);
      nodeEnter.append('text').attr('dy', 35).attr('text-anchor', 'middle');

      node = nodeEnter.merge(nodeSelection);
      node.select('circle').attr('fill', d => colorScale(d.type));
      node.select('text').text(d => d.id.length > 15 ? d.id.substring(0, 15) + '...' : d.id);

      // Update simulation
      simulation.nodes(nodes);
      simulation.force('link').links(links);
      simulation.alpha(0.3).restart();

      // Update selected node if still exists
      if (selectedNode) {
        const stillExists = nodes.find(n => n.id === selectedNode.id);
        if (stillExists) {
          selectNode(stillExists);
        } else {
          deselectNode();
        }
      }
    }

    async function pollForUpdates() {
      if (!liveUpdateEnabled) return;
      try {
        const response = await fetch('/api/graph');
        if (response.ok) {
          const data = await response.json();
          updateGraph(data.nodes, data.links);
        }
      } catch (e) {
        // Silently handle poll failures
      }
    }

    window.toggleLiveUpdate = function() {
      liveUpdateEnabled = !liveUpdateEnabled;
      const btn = document.getElementById('live-btn');
      const dot = document.getElementById('live-dot');
      const status = document.getElementById('live-status');
      btn.setAttribute('aria-pressed', liveUpdateEnabled);

      if (liveUpdateEnabled) {
        btn.innerHTML = '<span aria-hidden="true">⏸</span> Pause Live';
        dot.classList.remove('paused');
        status.textContent = 'Live';
        pollInterval = setInterval(pollForUpdates, POLL_INTERVAL_MS);
      } else {
        btn.innerHTML = '<span aria-hidden="true">▶</span> Resume Live';
        dot.classList.add('paused');
        status.textContent = 'Paused';
        clearInterval(pollInterval);
      }
    };

    // Start polling
    pollInterval = setInterval(pollForUpdates, POLL_INTERVAL_MS);
    } // End initGraph
  </script>
</body>
</html>`;
}

/**
 * Start a local HTTP server to serve the visualization with live updates
 * @param graph Initial graph state
 * @param port Server port (auto-increments if busy)
 * @param graphLoader Optional function to fetch current graph for live updates
 */
export function startVisualizationServer(
  graph: KnowledgeGraph, 
  port: number = 3000,
  graphLoader?: GraphLoader
): Promise<{ url: string; close: () => void }> {
  return new Promise((resolve, reject) => {
    // Close existing server if running
    if (currentServer) {
      currentServer.close();
      currentServer = null;
    }

    // Generate initial HTML (used as fallback if no graphLoader)
    const initialHtml = generateVisualizationHTML(graph);

    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      
      if (url.pathname === '/api/graph' && graphLoader) {
        // Live update endpoint
        try {
          const currentGraph = await graphLoader();
          const nodes = currentGraph.entities.map(entity => ({
            id: entity.name,
            type: entity.entityType,
            observations: entity.observations
          }));
          const links = currentGraph.relations.map(relation => ({
            source: relation.from,
            target: relation.to,
            type: relation.relationType
          }));
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          });
          res.end(JSON.stringify({ nodes, links }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to load graph' }));
        }
      } else {
        // Serve HTML - regenerate with fresh data if graphLoader available
        try {
          let html = initialHtml;
          if (graphLoader) {
            const currentGraph = await graphLoader();
            html = generateVisualizationHTML(currentGraph);
          }
          res.writeHead(200, { 
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
          });
          res.end(html);
        } catch (err) {
          // Fallback to initial HTML on error
          res.writeHead(200, { 
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
          });
          res.end(initialHtml);
        }
      }
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        // Try next port
        resolve(startVisualizationServer(graph, port + 1, graphLoader));
      } else {
        reject(err);
      }
    });

    server.listen(port, '127.0.0.1', () => {
      currentServer = server;
      const url = `http://127.0.0.1:${port}`;
      resolve({
        url,
        close: () => {
          server.close();
          if (currentServer === server) {
            currentServer = null;
          }
        }
      });
    });
  });
}

/**
 * Open URL in the default browser
 */
export async function openInBrowser(url: string): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const platform = process.platform;
  let command: string;

  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else {
    // Linux and others
    command = `xdg-open "${url}"`;
  }

  await execAsync(command);
}

/**
 * Visualize the knowledge graph - starts server and opens browser
 * @param graph Initial graph state
 * @param graphLoader Optional function for live updates (polls every 2s)
 */
export async function visualizeGraph(graph: KnowledgeGraph, graphLoader?: GraphLoader): Promise<string> {
  const { url } = await startVisualizationServer(graph, 3000, graphLoader);
  await openInBrowser(url);
  return url;
}
