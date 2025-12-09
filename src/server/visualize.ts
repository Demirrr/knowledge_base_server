/**
 * Knowledge Base Visualization Server
 * 
 * Creates an interactive visualization of the knowledge base using D3.js
 * and serves it via a local HTTP server.
 */

import * as http from 'http';
import type { KnowledgeGraph } from '../types/index.js';

let currentServer: http.Server | null = null;

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
  <title>Knowledge Base Visualization</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      color: #fff;
    }
    
    .header {
      padding: 20px;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .header h1 {
      font-size: 1.5rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .header h1::before {
      content: "🧠";
    }
    
    .stats {
      display: flex;
      gap: 20px;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .stat {
      background: rgba(255, 255, 255, 0.1);
      padding: 8px 16px;
      border-radius: 20px;
    }
    
    .container {
      display: flex;
      height: calc(100vh - 80px);
    }
    
    #graph {
      flex: 1;
      overflow: hidden;
    }
    
    .sidebar {
      width: 350px;
      background: rgba(0, 0, 0, 0.3);
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      padding: 20px;
      overflow-y: auto;
    }
    
    .sidebar h2 {
      font-size: 1.1rem;
      margin-bottom: 15px;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .node-info {
      display: none;
    }
    
    .node-info.active {
      display: block;
    }
    
    .node-info .name {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 5px;
      color: #4fc3f7;
    }
    
    .node-info .type {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .observations-list {
      list-style: none;
    }
    
    .observations-list li {
      background: rgba(255, 255, 255, 0.05);
      padding: 10px 15px;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 0.9rem;
      line-height: 1.4;
      border-left: 3px solid #4fc3f7;
    }
    
    .relations-section {
      margin-top: 20px;
    }
    
    .relation-item {
      background: rgba(255, 255, 255, 0.05);
      padding: 10px 15px;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 0.85rem;
    }
    
    .relation-item .relation-type {
      color: #81c784;
      font-weight: 500;
    }
    
    .legend {
      margin-bottom: 20px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 0.85rem;
    }
    
    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
    }
    
    .placeholder {
      color: rgba(255, 255, 255, 0.5);
      font-style: italic;
      text-align: center;
      padding: 40px 20px;
    }
    
    /* D3 Styles */
    .node circle {
      stroke: #fff;
      stroke-width: 2px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .node circle:hover {
      stroke-width: 3px;
      filter: brightness(1.2);
    }
    
    .node.selected circle {
      stroke: #ffd700;
      stroke-width: 4px;
    }
    
    .node text {
      font-size: 12px;
      fill: #fff;
      pointer-events: none;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    }
    
    .link {
      stroke: rgba(255, 255, 255, 0.3);
      stroke-width: 2px;
      fill: none;
    }
    
    .link-label {
      font-size: 10px;
      fill: rgba(255, 255, 255, 0.6);
      text-anchor: middle;
    }
    
    .arrow {
      fill: rgba(255, 255, 255, 0.5);
    }

    .controls {
      position: fixed;
      bottom: 20px;
      left: 20px;
      display: flex;
      gap: 10px;
    }

    .controls button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 10px 15px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }

    .controls button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Knowledge Base</h1>
    <div class="stats">
      <span class="stat" id="node-count">Nodes: 0</span>
      <span class="stat" id="edge-count">Edges: 0</span>
    </div>
  </div>
  
  <div class="container">
    <div id="graph"></div>
    <div class="sidebar">
      <div class="legend">
        <h2>Entity Types</h2>
        <div id="legend-items"></div>
      </div>
      
      <div class="node-info" id="node-info">
        <h2>Selected Node</h2>
        <div class="name" id="node-name"></div>
        <div class="type" id="node-type"></div>
        
        <h3 style="margin: 15px 0 10px; font-size: 0.95rem;">Observations</h3>
        <ul class="observations-list" id="observations-list"></ul>
        
        <div class="relations-section">
          <h3 style="margin-bottom: 10px; font-size: 0.95rem;">Relations</h3>
          <div id="relations-list"></div>
        </div>
      </div>
      
      <div class="placeholder" id="placeholder">
        Click on a node to see its details
      </div>
    </div>
  </div>

  <div class="controls">
    <button onclick="resetZoom()">Reset View</button>
    <button onclick="toggleLabels()">Toggle Labels</button>
  </div>

  <script>
    // Graph data from server
    const nodes = ${JSON.stringify(nodes)};
    const links = ${JSON.stringify(links)};
    
    // Update stats
    document.getElementById('node-count').textContent = 'Nodes: ' + nodes.length;
    document.getElementById('edge-count').textContent = 'Edges: ' + links.length;
    
    // Color scale for entity types
    const entityTypes = [...new Set(nodes.map(n => n.type))];
    const colorScale = d3.scaleOrdinal()
      .domain(entityTypes)
      .range(d3.schemeSet2.concat(d3.schemeSet3));
    
    // Build legend
    const legendContainer = document.getElementById('legend-items');
    entityTypes.forEach(type => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = \`
        <div class="legend-color" style="background: \${colorScale(type)}"></div>
        <span>\${type}</span>
      \`;
      legendContainer.appendChild(item);
    });
    
    // Setup SVG
    const container = document.getElementById('graph');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const svg = d3.select('#graph')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height]);
    
    // Add zoom behavior
    const g = svg.append('g');
    
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Arrow marker for directed edges
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('class', 'arrow');
    
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));
    
    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('marker-end', 'url(#arrowhead)');
    
    // Draw link labels
    let showLabels = true;
    const linkLabel = g.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('class', 'link-label')
      .text(d => d.type);
    
    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
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
    
    svg.on('click', () => {
      deselectNode();
    });
    
    function selectNode(d) {
      // Deselect previous
      if (selectedNode) {
        d3.selectAll('.node').classed('selected', false);
      }
      
      selectedNode = d;
      d3.selectAll('.node').filter(n => n.id === d.id).classed('selected', true);
      
      // Update sidebar
      document.getElementById('placeholder').style.display = 'none';
      document.getElementById('node-info').classList.add('active');
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
        obsList.innerHTML = '<li style="color: rgba(255,255,255,0.5); border-left-color: transparent;">No observations</li>';
      }
      
      // Relations
      const relList = document.getElementById('relations-list');
      relList.innerHTML = '';
      const outgoing = links.filter(l => l.source.id === d.id || l.source === d.id);
      const incoming = links.filter(l => l.target.id === d.id || l.target === d.id);
      
      if (outgoing.length === 0 && incoming.length === 0) {
        relList.innerHTML = '<div class="relation-item" style="color: rgba(255,255,255,0.5);">No relations</div>';
      } else {
        outgoing.forEach(rel => {
          const div = document.createElement('div');
          div.className = 'relation-item';
          const targetId = typeof rel.target === 'object' ? rel.target.id : rel.target;
          div.innerHTML = \`→ <span class="relation-type">\${rel.type}</span> → \${targetId}\`;
          relList.appendChild(div);
        });
        incoming.forEach(rel => {
          const div = document.createElement('div');
          div.className = 'relation-item';
          const sourceId = typeof rel.source === 'object' ? rel.source.id : rel.source;
          div.innerHTML = \`\${sourceId} → <span class="relation-type">\${rel.type}</span> →\`;
          relList.appendChild(div);
        });
      }
    }
    
    function deselectNode() {
      selectedNode = null;
      d3.selectAll('.node').classed('selected', false);
      document.getElementById('node-info').classList.remove('active');
      document.getElementById('placeholder').style.display = 'block';
    }
    
    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      linkLabel
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);
      
      node.attr('transform', d => \`translate(\${d.x},\${d.y})\`);
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
    
    // Control functions
    function resetZoom() {
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.translate(0, 0).scale(1)
      );
    }
    
    function toggleLabels() {
      showLabels = !showLabels;
      linkLabel.style('opacity', showLabels ? 1 : 0);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      svg.attr('viewBox', [0, 0, newWidth, newHeight]);
      simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
      simulation.alpha(0.3).restart();
    });
  </script>
</body>
</html>`;
}

/**
 * Start a local HTTP server to serve the visualization
 */
export function startVisualizationServer(graph: KnowledgeGraph, port: number = 3000): Promise<{ url: string; close: () => void }> {
  return new Promise((resolve, reject) => {
    // Close existing server if running
    if (currentServer) {
      currentServer.close();
      currentServer = null;
    }

    const html = generateVisualizationHTML(graph);

    const server = http.createServer((req, res) => {
      res.writeHead(200, { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      });
      res.end(html);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        // Try next port
        resolve(startVisualizationServer(graph, port + 1));
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
 */
export async function visualizeGraph(graph: KnowledgeGraph): Promise<string> {
  const { url } = await startVisualizationServer(graph);
  await openInBrowser(url);
  return url;
}
