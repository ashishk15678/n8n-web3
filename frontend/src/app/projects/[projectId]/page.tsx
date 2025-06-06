"use client";

import "@/app/globals.css";

import { Navigate, useParams } from "react-router";
import React, { useCallback, useEffect, useState } from "react";
import { useProject, useUpdateWorkflow, useWorkflow } from "@/server-store";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  SendToken,
  FlowProvider,
  InputText,
  InputNumber,
  CustomEdge,
  CustomNode,
} from "@/app/components/react-flow/custom-comp";
import { Project } from "@/generated/prisma";
import { workFlow } from "@/store";
import { Loader2, Plus, Save, X } from "lucide-react";
import { CodeEditor } from "@/app/components/code-editor/CodeEditor";
import { EnvModalButton } from "@/app/components/env";

export default function ProjectRoute() {
  const { projectId } = useParams();
  if (!projectId) {
    return Navigate({ to: "/signin" });
  }
  return <ProjectPageContent projectId={projectId as string} />;
}

const nodeTypes = {
  sendtoken: SendToken,
  inputtext: InputText,
  inputnumber: InputNumber,
  custom: CustomNode,
};

const edgeTypes = {
  default: CustomEdge,
  "sendtoken-edge": CustomEdge,
  "inputtext-edge": CustomEdge,
  "inputnumber-edge": CustomEdge,
  "custom-edge": CustomEdge,
};

function ProjectPageContent({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId);
  const { data: workflowData, isLoading: isWorkflowLoading } =
    useWorkflow(projectId);
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    loading,
    setLoading,
    debouncedUpdate,
  } = workFlow();
  const updateWorkflow = useUpdateWorkflow();

  useEffect(() => {
    window.addEventListener("keydown", async (e) => {
      if (e.key === "s" && e.ctrlKey) {
        e.preventDefault();

        if (!projectId) return;

        setLoading(true);
        try {
          await updateWorkflow.mutateAsync(
            { projectId, nodes, edges },
            {
              onSuccess: () => {
                console.log("Workflow saved successfully");
              },
              onError: (error) => {
                console.error("Failed to save workflow:", error);
              },
            }
          );
        } finally {
          setLoading(false);
        }
      }

      return () => {
        window.removeEventListener("keydown", (e) => {
          if (e.key === "s" && e.ctrlKey) {
            e.preventDefault();
          }
        });
      };
    });
  }, []);

  // Initialize workflow data when it's fetched
  useEffect(() => {
    if (workflowData && !isWorkflowLoading) {
      setNodes({ type: "remove", id: "all" });
      setEdges({ type: "clear" });

      workflowData.nodes.forEach((node) => {
        setNodes({ type: "add", node });
      });

      workflowData.edges.forEach((edge) => {
        setEdges(edge);
      });
    }
  }, [workflowData, isWorkflowLoading]);

  // Debounced update for any changes
  useEffect(() => {
    if (project && nodes.length > 0 && workflowData && !isWorkflowLoading) {
      const hasChanges =
        JSON.stringify(nodes) !== JSON.stringify(workflowData.nodes) ||
        JSON.stringify(edges) !== JSON.stringify(workflowData.edges);

      if (hasChanges) {
        debouncedUpdate(() => {
          updateWorkflow.mutate(
            { projectId, nodes, edges },
            {
              onSuccess: () => {
                console.log("Workflow updated");
              },
              onError: (error) => {
                console.error("Failed to update workflow:", error);
              },
            }
          );
        });
      }
    }
  }, [nodes, edges, project, workflowData, isWorkflowLoading]);

  const onNodesChange = useCallback(
    (changes: any) => {
      changes.forEach((change: any) => {
        if (change.type === "remove") {
          // When removing a node, also remove connected edges
          const connectedEdges = edges.filter(
            (edge) => edge.source === change.id || edge.target === change.id
          );
          connectedEdges.forEach((edge) => {
            setEdges({ type: "remove", id: edge.id });
          });
        }
        setNodes(change);
      });
    },
    [setNodes, setEdges, edges]
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

  const onConnect = useCallback(
    (params: any) => {
      setEdges(params);
    },
    [setEdges]
  );

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
                edgeTypes={edgeTypes}
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
                {isWorkflowLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                )}
              </ReactFlow>
            </FlowProvider>
          </ReactFlowProvider>
        </div>
        <div className="w-1/4">
          <NodePalette />
          <SaveButton />
        </div>
      </div>
      <EnvModalButton />
    </div>
  );
}

export function SaveButton() {
  const { loading, setLoading } = workFlow();
  const updateWorkflow = useUpdateWorkflow();
  const { nodes, edges } = workFlow();
  const { projectId } = useParams();

  const handleSave = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      await updateWorkflow.mutateAsync(
        { projectId, nodes, edges },
        {
          onSuccess: () => {
            console.log("Workflow saved successfully");
          },
          onError: (error) => {
            console.error("Failed to save workflow:", error);
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`bg-green-100 text-green-600 px-2 py-0.5 rounded-lg absolute top-2 flex flex-row items-center gap-2 ${
        loading ? "animate-pulse cursor-not-allowed" : "cursor-pointer"
      }`}
      disabled={loading}
      onClick={handleSave}
    >
      {loading ? (
        <>
          <div className="animate-pulse rounded-full flex flex-row items-center gap-2">
            <span className="">Saving...</span>
            <Loader2 size={16} className="animate-spin text-green-500" />
          </div>
        </>
      ) : (
        <>
          <span className="">Save</span>
          <Save size={16} />
        </>
      )}
    </button>
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

export function NodePalette() {
  const { setNodes } = workFlow();
  const [isOpen, setIsOpen] = useState(false);
  const [customCode, setCustomCode] = useState<string>(`// Custom Node Component
function CustomNode({ data }) {
  const { label, type, value, color = '#ff6b6b' } = data;
  return (
    <div className="p-4 rounded-lg shadow-lg" style={{ borderColor: color }}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
      <div className="text-center">
        <h3 className="text-lg font-semibold">{label}</h3>
        <p className="text-sm text-gray-600">Type: {type}</p>
        {value && (
          <p className="mt-2 text-sm font-mono bg-gray-100 p-1 rounded">{value}</p>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500" />
    </div>
  );
}`);

  const nodeTypes = [
    { type: "sendtoken", name: "Send Token" },
    { type: "inputtext", name: "Input Text" },
    { type: "inputnumber", name: "Input Number" },
    { type: "custom", name: "Custom Node" },
  ];

  const addNode = (type: string, name: string) => {
    if (type === "custom") {
      setIsOpen(true);
      return;
    }

    const newNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      position: { x: 200, y: 200 },
      data: {
        label: name,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    };
    setNodes({ type: "add", node: newNode });
  };

  const handleCustomNodeCreate = () => {
    const newNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "custom",
      position: { x: 200, y: 200 },
      data: {
        label: "Custom Node",
        code: customCode,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    };
    setNodes({ type: "add", node: newNode });
    setIsOpen(false);
  };

  return (
    <div className="top-2 right-4 ring-2 rounded-lg ring-zinc-300 h-full">
      <span className="text-2xl font-bold w-full p-4">Nodes</span>
      {nodeTypes.map((node) => (
        <div key={node.type} className="p-4">
          <button
            className="ml-2 px-4 py-2 w-full rounded-full bg-zinc-100/40 ring ring-zinc-100 ring-2 text-zinc-500 
              hover:text-orange-700 hover:bg-orange-100/80 hover:ring-orange-200 transition-all duration-200 
              cursor-pointer flex flex-row items-center gap-2"
            onClick={() => addNode(node.type, node.name)}
          >
            {node.name} <Plus size={16} />
          </button>
        </div>
      ))}
      <CustomNodeModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        code={customCode}
        setCode={setCustomCode}
        onCreate={handleCustomNodeCreate}
      />
    </div>
  );
}

export const CustomNodeModal = ({
  isOpen,
  setIsOpen,
  code,
  setCode,
  onCreate,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<boolean>;
  code: string;
  setCode: (code: string) => void;
  onCreate: () => void;
}) => {
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

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Create Node
            </button>
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
