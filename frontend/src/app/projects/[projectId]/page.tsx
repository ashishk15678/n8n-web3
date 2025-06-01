"use client";

import "@/app/globals.css";

import { useParams } from "react-router";
import React, { useCallback, useEffect, useState } from "react";
import { useProject } from "@/server-store";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  SendToken,
  FlowProvider,
} from "@/app/components/react-flow/custom-comp";
import { Project } from "@/generated/prisma";
import { workFlow } from "@/store";
import { Plus, X } from "lucide-react";
import { CodeEditor } from "@/app/components/code-editor/CodeEditor";

type SendTokenNode = Node<{
  label?: string;
}>;

// Add this style block at the top of the file, after imports
const dialogStyles = `
  dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
  }
`;

export default function ProjectRoute() {
  const { projectId } = useParams();
  return <ProjectPageContent projectId={projectId as string} />;
}

const nodeTypes = {
  sendtoken: SendToken,
};

const initialNodes = [
  {
    id: "1",
    type: "sendtoken",
    position: { x: 200, y: 200 },
    data: {
      label: "Send Token",
    },
  },
];

function ProjectPageContent({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId);
  const { nodes, edges, setNodes, setEdges } = workFlow();

  // Initialize nodes if empty
  useEffect(() => {
    if (nodes.length === 0) {
      initialNodes.forEach((node) => {
        setNodes({ type: "add", node });
      });
    }
  }, []);

  const onNodesChange = useCallback(
    (changes: any) => {
      changes.forEach((change: any) => {
        setNodes(change);
      });
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      changes.forEach((change: any) => {
        if (change.type === "remove") {
          setEdges(change);
        }
      });
    },
    [setEdges]
  );

  const onConnect = useCallback((params: any) => setEdges(params), [setEdges]);

  return (
    <div>
      <div className="absolute top-2 left-4 w-full flex items-center justify-between gap-2">
        <span className="font-bold text-2xl hover:underline">
          {(project as Project)?.name}
        </span>
        <InputBox />
        <div />
      </div>
      <div
        style={{ height: "95vh", width: "100vw", marginTop: "5vh" }}
        className="flex flex-row"
      >
        <div className="w-3/4">
          <ReactFlowProvider>
            <FlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                className="bg-zinc-100/50"
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
              >
                <Controls />
                <Background variant={BackgroundVariant.Dots} size={2} />
                {/* <MiniMap /> */}
              </ReactFlow>
            </FlowProvider>
          </ReactFlowProvider>
        </div>
        <div className="w-1/4">
          <Slider />
        </div>
      </div>
    </div>
  );
}

export function InputBox() {
  const [searchbox, setSearchBox] = useState<string>("");

  useEffect(() => {
    const search = document.getElementById("search");
    if (search) {
      window.addEventListener("keydown", (e) => {
        if (e.key === "k" && e.ctrlKey) {
          e.preventDefault();
          search.focus();
        }
      });
    }

    return () => {
      window.removeEventListener("keydown", (e) => {
        e.preventDefault();
        if (e.key === "k" && e.ctrlKey) {
          search?.focus();
        }
      });
    };
  }, [searchbox]);

  const commands = [
    {
      id: 1,
      name: "Add box",
      fn: () => {},
    },
    {
      id: 2,
      name: "Set Environment",
      fn: () => {},
    },
  ];

  return (
    <div>
      <input
        type="text"
        id="search"
        className="ring-2 text-center active:shadow-xl  focus:scale-x-110
         ring-zinc-300 text-xl rounded-3xl active:ring-zinc-400 px-4 py-1 transition-all duration-300 "
        placeholder="Ctrl + k"
        value={searchbox}
        onChange={(e) => setSearchBox(e.target.value)}
      />
      {searchbox.length > 0 ? (
        <div className="text-black   absolute mt-2 p-2 rounded-md">
          {commands.map((com) =>
            com.name.toLowerCase().startsWith(searchbox.toLowerCase()) ? (
              <div key={com.id} onClick={com.fn}>
                {com.name}
              </div>
            ) : (
              <></>
            )
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

const Nodes = [
  {
    id: 1,
    name: "Send Token",
    type: "sendtoken",
    component: SendToken,
  },
  {
    id: 2,
    name: "Custom",
    type: "custom",
    component: <div>Custom</div>,
  },
];

export const CustomNodeModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<boolean>;
}) => {
  const [code, setCode] = useState<string>(`// Custom Node Component
import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface NodeData {
  label: string;
  type: 'input' | 'output' | 'default';
  value?: string | number;
  color?: string;
}

const CustomNode: React.FC<{ data: NodeData }> = ({ data }) => {
  const { label, type, value, color = '#ff6b6b' } = data;

  return (
    <div className="p-4 rounded-lg shadow-lg" style={{ borderColor: color }}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500"
      />
      
      <div className="text-center">
        <h3 className="text-lg font-semibold">{label}</h3>
        <p className="text-sm text-gray-600">Type: {type}</p>
        {value && (
          <p className="mt-2 text-sm font-mono bg-gray-100 p-1 rounded">
            {value}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
};

export default CustomNode;`);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative w-1/2 h-1/2 bg-white rounded-lg p-4 shadow-lg border border-gray-200">
        <div className="w-full h-full bg-white rounded-lg p-4 flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Custom Node</h1>

          <div className="flex-1 min-h-0 bg-white rounded-lg border border-gray-200">
            <CodeEditor
              initialValue={code}
              onChange={setCode}
              language="typescript"
              height="100%"
              className="h-full"
              readOnly={false}
            />
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 bg-gray-100 text-gray-500 rounded-full p-2 
            cursor-pointer hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export function Slider() {
  const { nodes, setNodes } = workFlow();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="top-2 right-4 ring-2 rounded-lg ring-zinc-300 h-full">
      <span className="text-2xl font-bold w-full p-4">Nodes</span>

      {Nodes.map((node) => (
        <div key={node.id} className="p-4">
          <button
            className="ml-2 px-4 py-2 w-full rounded-full bg-zinc-100/40 ring ring-zinc-100 ring-2 text-zinc-500 hover:text-orange-700 
            hover:bg-orange-100/80 hover:ring-orange-200 transition-all duration-200 cursor-pointer flex flex-row items-center gap-2"
            onClick={() => {
              if (node.type === "custom") {
                setIsOpen(true);
                return;
              }

              setNodes({
                type: "add",
                node: {
                  id: `${nodes.length + 1}`,
                  type: node.type,
                  position: { x: 200, y: 200 },
                  data: { label: node.name },
                },
              });
            }}
          >
            {node.name} <Plus size={16} />
          </button>
        </div>
      ))}
      <CustomNodeModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}
