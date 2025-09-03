"use client"

import React, { useCallback, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { AssetNode } from './asset-node'

const nodeTypes = {
  assetNode: AssetNode,
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'assetNode',
    position: { x: 100, y: 100 },
    data: {
      type: 'style-ref',
      title: 'Medieval Fantasy Style',
      description: 'Art style reference for consistent generation',
      status: 'completed',
      inputs: [],
      outputs: ['style', 'palette'],
    },
  },
  {
    id: '2',
    type: 'assetNode',
    position: { x: 400, y: 50 },
    data: {
      type: 'generator',
      title: 'AI Asset Generator',
      description: 'Prompt-based asset creation with style consistency',
      status: 'idle',
      inputs: ['prompt', 'style'],
      outputs: ['asset'],
    },
  },
  {
    id: '3',
    type: 'assetNode',
    position: { x: 200, y: 300 },
    data: {
      type: 'sprite-sheet',
      title: 'Character Sprites',
      description: '8-frame walking animation sequence',
      status: 'generating',
      inputs: ['asset', 'style'],
      outputs: ['spritesheet', 'frames'],
    },
  },
  {
    id: '4',
    type: 'assetNode',
    position: { x: 600, y: 250 },
    data: {
      type: 'export',
      title: 'Unity Package',
      description: 'Export assets as Unity-ready package',
      status: 'idle',
      inputs: ['spritesheet', 'frames'],
      outputs: [],
    },
  },
]

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    sourceHandle: 'style',
    targetHandle: 'style',
    type: 'smoothstep',
    animated: false,
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    sourceHandle: 'asset',
    targetHandle: 'asset',
    type: 'smoothstep',
    animated: false,
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    sourceHandle: 'style',
    targetHandle: 'style',
    type: 'smoothstep',
    animated: false,
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    sourceHandle: 'spritesheet',
    targetHandle: 'spritesheet',
    type: 'smoothstep',
    animated: false,
  },
]

interface NodeCanvasProps {
  className?: string
}

function NodeCanvasInner({ className = "" }: NodeCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const reactFlowInstance = useRef<ReactFlowInstance>()

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onInit = (rfi: ReactFlowInstance) => {
    reactFlowInstance.current = rfi
  }

  // Handle node execution
  const handleNodeRun = useCallback((nodeId: string) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              status: 'generating',
            },
          }
        }
        return node
      })
    )

    // Simulate processing
    setTimeout(() => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                status: 'completed',
              },
            }
          }
          return node
        })
      )
    }, 2000)
  }, [setNodes])

  return (
    <div className={`h-full w-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-neutral-50 dark:bg-neutral-900"
        connectionLineType="smoothstep"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: {
            stroke: '#6366f1',
            strokeWidth: 2,
          },
        }}
      >
        {/* Dotted background */}
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#9ca3af"
          className="opacity-30"
        />
        
        {/* Controls */}
        <Controls 
          position="bottom-right"
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg"
        />
        
        {/* Minimap */}
        <MiniMap 
          position="top-right"
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg"
          nodeColor={(node) => {
            switch (node.data?.type) {
              case 'sprite-sheet': return '#a855f7'
              case 'parallax': return '#3b82f6'
              case 'style-ref': return '#10b981'
              case 'generator': return '#f59e0b'
              case 'export': return '#6b7280'
              default: return '#6b7280'
            }
          }}
        />
      </ReactFlow>
    </div>
  )
}

export function NodeCanvas(props: NodeCanvasProps) {
  return (
    <ReactFlowProvider>
      <NodeCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
