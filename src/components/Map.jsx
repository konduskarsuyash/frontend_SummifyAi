import React, { useEffect, useRef } from 'react';
import { Graph } from '@antv/x6';
import '@antv/x6-react-shape';

// Sample JSON data
const mindmapData = {
  "mindmap": {
    "title": "Time Series Analysis",
    "nodes": [
      {
        "id": "1",
        "text": "ARMA Model",
        "nodes": [
          { "id": "1.1", "text": "Definition" },
          {
            "id": "1.2",
            "text": "Components",
            "nodes": [
              { "id": "1.2.1", "text": "AR (Autoregressive)" },
              { "id": "1.2.2", "text": "MA (Moving Average)" }
            ]
          },
          { "id": "1.3", "text": "Example" }
        ]
      },
      {
        "id": "2",
        "text": "ARIMA Model",
        "nodes": [
          { "id": "2.1", "text": "Definition" },
          {
            "id": "2.2",
            "text": "Components",
            "nodes": [
              { "id": "2.2.1", "text": "AR (Autoregressive)" },
              { "id": "2.2.2", "text": "I (Integrated)" },
              { "id": "2.2.3", "text": "MA (Moving Average)" }
            ]
          },
          { "id": "2.3", "text": "Differencing" }
        ]
      },
      {
        "id": "3",
        "text": "Stationarity",
        "nodes": [
          { "id": "3.1", "text": "Definition" },
          {
            "id": "3.2",
            "text": "Types of Non-Stationarity",
            "nodes": [
              { "id": "3.2.1", "text": "Trend" },
              { "id": "3.2.2", "text": "Seasonality" }
            ]
          },
          { "id": "3.3", "text": "Transforming Non-Stationary Data" }
        ]
      },
      {
        "id": "4",
        "text": "Box-Jenkins Method",
        "nodes": [
          { "id": "4.1", "text": "Step 1: Identification" },
          { "id": "4.2", "text": "Step 2: Estimation" },
          { "id": "4.3", "text": "Step 3: Diagnostic Checking" }
        ]
      }
    ]
  }
};

const generateNodesAndEdges = (data) => {
  const nodes = [];
  const edges = [];
  let yOffset = 0;

  const traverseNodes = (node, parent = null, x = 0) => {
    nodes.push({
      id: node.id,
      shape: 'rect',
      x: x * 200,
      y: yOffset,
      width: 160,
      height: 60,
      label: node.text
    });

    if (parent) {
      edges.push({
        source: parent.id,
        target: node.id,
      });
    }

    yOffset += 100;

    if (node.nodes) {
      node.nodes.forEach((child) => traverseNodes(child, node, x + 1));
    }
  };

  data.nodes.forEach((node) => traverseNodes(node));

  return { nodes, edges };
};

const Map = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const { nodes, edges } = generateNodesAndEdges(mindmapData.mindmap);

    const graph = new Graph({
      container: containerRef.current,
      width: 800,
      height: 600,
      grid: true,
    });

    graph.fromJSON({ nodes, edges });
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '600px' }}></div>;
};

export default Map;
