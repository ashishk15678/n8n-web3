"use client";

import "@/app/globals.css";

import { Link, Navigate, useParams } from "react-router";
import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  memo,
  type FC,
} from "react";
import { useProject, useUpdateWorkflow, useWorkflow } from "@/server-store";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  Edge,
  Node,
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
import {
  ArrowLeft,
  Loader2,
  Menu,
  Plus,
  Save,
  Trash,
  X,
  Search,
  ChevronDown,
  ArrowDownAz,
  Download,
  Upload,
} from "lucide-react";
import { EnvModalButton } from "@/app/components/env";
import EthTransaction from "@/app/components/react-flow/eth/transaction";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { type NodeData, type EdgeData, type WorkflowData } from "@/types";
import type { Node as FlowNode, Edge as FlowEdge } from "@xyflow/react";
import {
  useCustomNodes,
  useCreateCustomNode,
  useUpdateCustomNode,
  type CustomNode as CustomNodeDefinition,
} from "@/hooks/useCustomNodes";
import { CustomNodeModal } from "@/app/components/custom-node/CustomNodeModal";

// Define WorkflowStore type
type WorkflowStore = {
  nodes: FlowNode<NodeData>[];
  edges: FlowEdge<EdgeData>[];
  setNodes: (change: any) => void;
  setEdges: (
    edge:
      | FlowEdge<EdgeData>
      | { type: "clear" }
      | { type: "remove"; id: string }
  ) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  debouncedUpdate: (callback: () => void, immediate?: boolean) => void;
  workflowData: WorkflowData | null;
  setWorkflowData: (data: WorkflowData) => void;
};

// Custom node template
const customNodeTemplate = `import { Handle, Position } from '@xyflow/react';

interface CustomNodeProps {
  data: {
    label: string;
    inputs?: { name: string; value: any }[];
    outputs?: { name: string; value: any }[];
    config?: {
      color?: string;
      icon?: string;
    };
  };
}

export default function CustomNode({ data }: CustomNodeProps) {
  const { label, inputs = [], outputs = [], config = {} } = data;
  const { color = '#ff6b6b', icon = '⚡' } = config;

  return (
    <div className="p-4 rounded-lg shadow-lg" style={{ borderColor: color }}>
      {/* Input Handles */}
      {inputs.map((input, index) => (
        <Handle
          key={\`input-\${index}\`}
          type="target"
          position={Position.Left}
          id={input.name}
          className="w-3 h-3 bg-blue-500"
          style={{ top: \`\${(index + 1) * 25}%\` }}
        />
      ))}

      <div className="text-center">
        <div className="text-2xl mb-2">{icon}</div>
        <h3 className="text-lg font-semibold">{label}</h3>
        
        {/* Input Fields */}
        {inputs.length > 0 && (
          <div className="mt-2 space-y-1">
            {inputs.map((input, index) => (
              <div key={\`input-\${index}\`} className="text-sm">
                <span className="text-gray-500">{input.name}:</span>{' '}
                <span className="font-mono">{input.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Output Handles */}
      {outputs.map((output, index) => (
        <Handle
          key={\`output-\${index}\`}
          type="source"
          position={Position.Right}
          id={output.name}
          className="w-3 h-3 bg-green-500"
          style={{ top: \`\${(index + 1) * 25}%\` }}
        />
      ))}
    </div>
  );
}`;

// Update node types to include custom nodes
const nodeTypes = {
  sendtoken: SendToken,
  inputtext: InputText,
  inputnumber: InputNumber,
  custom: CustomNode,
  ethTransaction: EthTransaction,
};

// Update edge types to include custom node edges
const edgeTypes = {
  default: CustomEdge,
  "sendtoken-edge": CustomEdge,
  "inputtext-edge": CustomEdge,
  "inputnumber-edge": CustomEdge,
  "custom-edge": CustomEdge,
  "ethTransaction-edge": CustomEdge,
};

// Update NodeType to include custom nodes
type NodeType =
  | "sendtoken"
  | "ethTransaction"
  | "inputtext"
  | "inputnumber"
  | "custom";

// Update NodeDefinition interface to include category
interface NodeDefinition {
  type: NodeType;
  name: string;
  icon: string;
  category?: string;
  config?: CustomNodeConfig;
  metadata?: {
    category?: string;
    tags?: string[];
    icon?: string;
  };
}

interface NodeWithCategory extends NodeDefinition {
  category: string;
  isCustom?: boolean;
  customNodeId?: string;
  description?: string;
}

// Memoize the node categories since they don't change
const NODE_CATEGORIES: Record<string, NodeDefinition[]> = {
  web3: [
    { type: "sendtoken", name: "Send Token", icon: "→" },
    { type: "ethTransaction", name: "Eth Transaction", icon: "↔" },
  ],
  inputs: [
    { type: "inputtext", name: "Input Text", icon: "T" },
    { type: "inputnumber", name: "Input Number", icon: "#" },
  ],
  custom: [{ type: "custom", name: "Custom Node", icon: "⚡" }],
};

// Memoized Node Button component
const NodeButton = memo(
  ({
    node,
    onAdd,
    showCategory = false,
  }: {
    node: NodeWithCategory;
    onAdd: (type: NodeType, name: string) => void;
    showCategory?: boolean;
  }) => (
    <button
      onClick={() => onAdd(node.type, node.name)}
      className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-50 text-zinc-600 
      hover:bg-zinc-100 hover:text-zinc-900 transition-all duration-200 
      cursor-pointer border border-zinc-200"
    >
      <span className="w-6 h-6 flex items-center justify-center text-zinc-400 bg-zinc-100 rounded">
        {node.icon}
      </span>
      <span>{node.name}</span>
      {showCategory && node.category && (
        <span className="text-xs text-zinc-400 ml-auto capitalize">
          {node.category}
        </span>
      )}
      <Plus size={16} className="ml-auto text-zinc-400" />
    </button>
  )
);

NodeButton.displayName = "NodeButton";

// Memoized Category Button component
const CategoryButton = memo(
  ({
    category,
    isOpen,
    onToggle,
  }: {
    category: string;
    isOpen: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors"
    >
      <span className="capitalize">{category}</span>
      <ChevronDown
        size={16}
        className={`transform transition-transform text-zinc-400 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  )
);

CategoryButton.displayName = "CategoryButton";

// Add custom node types
interface CustomNodeConfig {
  inputs?: {
    name: string;
    type: string;
    description?: string;
    required?: boolean;
  }[];
  outputs?: {
    name: string;
    type: string;
    description?: string;
  }[];
  category?: string;
  tags?: string[];
}

// Add a CreateCustomNodeButton component
const CreateCustomNodeButton = memo(({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 text-orange-600 
    hover:bg-orange-100 hover:text-orange-700 transition-all duration-200 
    cursor-pointer border border-orange-200 mb-4"
  >
    <Plus size={16} className="text-orange-500" />
    <span>Create Custom Node</span>
  </button>
));

CreateCustomNodeButton.displayName = "CreateCustomNodeButton";

// ImportExportButtons component with proper typing
const ImportExportButtons = memo<{
  nodes: FlowNode<NodeData>[];
  edges: FlowEdge<EdgeData>[];
  onImport: (data: {
    nodes: FlowNode<NodeData>[];
    edges: FlowEdge<EdgeData>[];
  }) => void;
}>(({ nodes, edges, onImport }) => {
  const handleExport = () => {
    const data: WorkflowData = {
      id: "export-" + Date.now(),
      name: "Exported Workflow",
      version: 1,
      nodes: nodes as FlowNode<NodeData>[],
      edges: edges as FlowEdge<EdgeData>[],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "draft",
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "workflow-export-" + new Date().toISOString() + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as WorkflowData;
        if (data.nodes && data.edges) {
          onImport({
            nodes: data.nodes as FlowNode<NodeData>[],
            edges: data.edges as FlowEdge<EdgeData>[],
          });
          toast.success("Workflow imported successfully!");
        } else {
          toast.error("Invalid workflow file format");
        }
      } catch (error) {
        toast.error("Failed to import workflow");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
      >
        <Download size={16} />
        Export Workflow
      </button>
      <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
        <Upload size={16} />
        Import Workflow
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </label>
    </div>
  );
});

ImportExportButtons.displayName = "ImportExportButtons";

export function ProjectPageContent({ projectId }: { projectId: string }) {
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
  } = workFlow() as WorkflowStore;
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
      console.log("Initializing workflow:", { workflowData });

      // Clear existing nodes and edges first
      setNodes({ type: "remove", id: "all" });
      setEdges({ type: "clear" });

      // Small delay to ensure clearing is complete
      setTimeout(() => {
        // Add nodes
        workflowData.nodes.forEach((node) => {
          console.log("Adding node:", node);
          setNodes({ type: "add", node });
        });

        // Add edges
        workflowData.edges.forEach((edge) => {
          console.log("Adding edge:", edge);
          setEdges(edge);
        });
      }, 100);
    }
  }, [workflowData, isWorkflowLoading]);

  // Debounced update for any changes
  useEffect(() => {
    if (project && nodes.length > 0 && workflowData && !isWorkflowLoading) {
      const hasChanges =
        JSON.stringify(nodes) !== JSON.stringify(workflowData.nodes) ||
        JSON.stringify(edges) !== JSON.stringify(workflowData.edges);

      // console.log("Checking for changes:", {
      //   hasChanges,
      //   nodesLength: nodes.length,
      //   edgesLength: edges.length,
      //   workflowNodesLength: workflowData.nodes.length,
      //   workflowEdgesLength: workflowData.edges.length,
      // });

      if (hasChanges) {
        console.log("Changes detected, updating workflow");
        debouncedUpdate(() => {
          console.log("Executing update with:", { nodes, edges });
          updateWorkflow.mutate(
            { projectId, nodes, edges },
            {
              onSuccess: () => {
                console.log("Workflow updated successfully");
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleImport = useCallback(
    (data: { nodes: any[]; edges: any[] }) => {
      // Clear existing nodes and edges
      setNodes({ type: "remove", id: "all" });
      setEdges({ type: "clear" });

      // Small delay to ensure clearing is complete
      setTimeout(() => {
        // Add imported nodes
        data.nodes.forEach((node) => {
          setNodes({ type: "add", node });
        });

        // Add imported edges
        data.edges.forEach((edge) => {
          setEdges(edge);
        });

        // Update the workflow in the database
        updateWorkflow.mutate(
          { projectId, nodes: data.nodes, edges: data.edges },
          {
            onSuccess: () => {
              toast.success("Workflow imported and saved successfully");
            },
            onError: (error) => {
              toast.error("Failed to save imported workflow");
              console.error(error);
            },
          }
        );
      }, 100);
    },
    [projectId, setNodes, setEdges, updateWorkflow]
  );

  return (
    <div>
      {/* Top bar  */}
      <div className="w-full flex items-center justify-between gap-2 p-4">
        <div className="flex flex-row items-center gap-8">
          <Link to="/projects">
            <div className="flex flex-row items-center gap-2">
              <ArrowLeft size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground text-sm">Projects</span>
            </div>
          </Link>
          <div>
            <span className="font-bold text-2xl hover:underline">
              {(project as Project)?.name}
            </span>
            <EnvModalButton />
          </div>{" "}
        </div>
        <div className="flex items-center gap-4">
          <ImportExportButtons
            nodes={nodes}
            edges={edges}
            onImport={handleImport}
          />
          <InputBox />
          <div className="flex flex-row items-center gap-2">
            <ClearButton />
            <SaveButton />
          </div>
        </div>
        <div />
      </div>

      {/* Main content  */}
      <div
        style={{ height: "100vh", width: "100vw" }}
        className="flex flex-row"
      >
        <div className="w-full">
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
        <div className="absolute top-4 right-40">
          <div className="flex flex-row items-center gap-2 outline outline-2 outline-zinc-200 rounded-full animate-pulse cursor-pointer">
            <button
              className={cn(
                "bg-white p-2 rounded-full transition-all duration-300",
                isSidebarOpen ? "rotate-270" : "rotate-0"
              )}
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
              }}
            >
              <ArrowDownAz />
            </button>
          </div>
        </div>
        <div
          className={cn(
            "w-2/9 transition-all",
            isSidebarOpen ? "w-2/9" : "w-0"
          )}
        >
          <NodePalette />
        </div>
      </div>
    </div>
  );
}

export function ClearButton() {
  const { nodes, setNodes, setEdges, debouncedUpdate } =
    workFlow() as WorkflowStore;
  const { projectId } = useParams();
  const updateWorkflow = useUpdateWorkflow();

  const handleClear = async () => {
    if (!projectId) return;

    console.log("Starting clear operation");

    try {
      // First update the database
      await updateWorkflow.mutateAsync(
        { projectId, nodes: [], edges: [] },
        {
          onSuccess: () => {
            console.log("Database cleared successfully");
            // Then clear the UI
            setNodes({ type: "remove", id: "all" });
            setEdges({ type: "clear" });
          },
          onError: (error) => {
            console.error("Failed to clear database:", error);
          },
        }
      );
    } catch (error) {
      console.error("Error during clear operation:", error);
    }
  };

  return (
    <button
      onClick={handleClear}
      className="bg-red-100 text-red-600 px-2 py-0.5 rounded-lg flex flex-row items-center gap-2 hover:bg-red-200 transition-colors duration-200"
    >
      Clear
      <Trash size={16} />
    </button>
  );
}

export function SaveButton() {
  const { loading, setLoading } = workFlow() as WorkflowStore;
  const updateWorkflow = useUpdateWorkflow();
  const { nodes, edges } = workFlow() as WorkflowStore;
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
      className={`bg-green-100 text-green-600 px-2 py-0.5 rounded-lg flex flex-row items-center gap-2 ${
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

// NodePalette component with proper typing
export const NodePalette = memo(function NodePalette() {
  const { projectId } = useParams();
  const workflow = workFlow();
  const updateWorkflow = useUpdateWorkflow();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [code, setCode] = useState("");

  // Add custom nodes to the categories
  const { data: customNodes, refetch: refetchCustomNodes } = useCustomNodes(
    projectId as string
  );
  const createMutation = useCreateCustomNode(projectId as string);
  const updateMutation = useUpdateCustomNode(
    projectId as string,
    editingNodeId as string
  );

  // Group nodes by category
  const nodesByCategory = useMemo(() => {
    if (!customNodes) return {};
    return customNodes.reduce<Record<string, CustomNodeDefinition[]>>(
      (acc, node) => {
        const category = node.metadata?.category || "uncategorized";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(node);
        return acc;
      },
      {}
    );
  }, [customNodes]);

  const handleCreateNode = useCallback(() => {
    refetchCustomNodes();
    setIsOpen(false);
    setCode("");
    setEditingNodeId(null);
  }, [refetchCustomNodes]);

  const handleUpdateNode = useCallback(() => {
    refetchCustomNodes();
    setIsOpen(false);
    setCode("");
    setEditingNodeId(null);
  }, [refetchCustomNodes]);

  // Update addNode function with proper typing
  const addNode = useCallback(
    (type: string, name: string) => {
      if (type === "custom") {
        setIsOpen(true);
        return;
      }

      const customNode = customNodes?.find((n) => n.id === type);
      if (customNode) {
        const nodeId =
          "node-" +
          Date.now() +
          "-" +
          Math.random().toString(36).substring(2, 9);
        const newNode: FlowNode<NodeData> = {
          id: nodeId,
          type: "custom",
          position: { x: 200, y: 200 },
          data: {
            label: name,
            type: "custom",
            config: {
              inputs: {
                value: null,
                updatedAt: new Date(),
              },
              outputs: {
                value: null,
                updatedAt: new Date(),
              },
            },
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              category: customNode.metadata?.category || "custom",
              tags: customNode.metadata?.tags || [],
              description: customNode.description,
            },
          },
        };

        workflow.setNodes({ type: "add", node: newNode });

        if (updateWorkflow) {
          updateWorkflow.mutate(
            {
              projectId: projectId as string,
              nodes: [...workflow.nodes, newNode],
              edges: workflow.edges,
            },
            {
              onSuccess: () => {
                toast.success("Node added successfully");
              },
              onError: (error) => {
                toast.error("Failed to save node");
                console.error(error);
              },
            }
          );
        }
        return;
      }

      // Handle built-in nodes
      const nodeId =
        "node-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
      const newNode: FlowNode<NodeData> = {
        id: nodeId,
        type: type as NodeType,
        position: { x: 200, y: 200 },
        data: {
          label: name,
          type: type,
          config: {
            inputs: {
              value: null,
              updatedAt: new Date(),
            },
            outputs: {
              value: null,
              updatedAt: new Date(),
            },
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            category: NODE_CATEGORIES[type]?.[0]?.category || "other",
          },
        },
      };

      workflow.setNodes({ type: "add", node: newNode });

      if (updateWorkflow) {
        updateWorkflow.mutate(
          {
            projectId: projectId as string,
            nodes: [...workflow.nodes, newNode],
            edges: workflow.edges,
          },
          {
            onSuccess: () => {
              toast.success("Node added successfully");
            },
            onError: (error) => {
              toast.error("Failed to save node");
              console.error(error);
            },
          }
        );
      }
    },
    [workflow, customNodes, projectId, updateWorkflow]
  );

  // Update the node categories to include custom nodes
  const allNodes = useMemo(() => {
    const builtInNodes = Object.entries(NODE_CATEGORIES).flatMap(
      ([category, nodes]) => nodes.map((node) => ({ ...node, category }))
    );

    const customNodesList =
      customNodes?.map((node: any) => ({
        type: node.id,
        name: node.name,
        icon: node.metadata?.icon || "⚡",
        category: node.metadata?.category || "custom",
        description: node.description,
        isCustom: true,
        customNodeId: node.id,
        config: node.config,
        metadata: node.metadata,
      })) || [];

    // Group custom nodes by category
    const customNodesByCategory = customNodesList.reduce<
      Record<string, NodeWithCategory[]>
    >((acc, node) => {
      const category = node.category || "custom";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(node);
      return acc;
    }, {});

    // Merge built-in and custom nodes
    const mergedCategories = {
      ...NODE_CATEGORIES,
      ...customNodesByCategory,
    };

    return Object.entries(mergedCategories).flatMap(([category, nodes]) =>
      (nodes as NodeWithCategory[]).map((node) => ({
        ...node,
        category,
        type: node.isCustom ? node.type : node.type,
      }))
    );
  }, [customNodes]);

  // Memoize the filtered nodes
  const filteredNodes = useMemo(
    () =>
      searchQuery
        ? allNodes.filter((node) =>
            node.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [],
    [searchQuery, allNodes]
  );

  // Memoize the category toggle handler
  const handleCategoryToggle = useCallback((category: string) => {
    setOpenCategory((prev) => (prev === category ? null : category));
  }, []);

  // Debounced search handler
  const debouncedSetSearchQuery = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 1500),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [debouncedSetSearchQuery]);

  // Add a type for the categorized nodes
  type CategorizedNodes = Record<string, NodeWithCategory[]>;

  return (
    <div className="top-2 right-4 ring-2 rounded-lg ring-zinc-300 h-full bg-white">
      <div className="p-4 border-b border-zinc-200">
        <span className="text-2xl font-bold">Nodes</span>
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search nodes..."
            defaultValue={searchQuery}
            onChange={(e) => debouncedSetSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
          />
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Add Create Custom Node button at the top */}
        <CreateCustomNodeButton onClick={() => setIsOpen(true)} />

        {searchQuery ? (
          // Show filtered nodes directly when searching
          <div className="space-y-2">
            {filteredNodes.map((node) => (
              <NodeButton
                key={node.type}
                node={node}
                onAdd={addNode}
                showCategory
              />
            ))}
            {filteredNodes.length === 0 && (
              <div className="text-center text-zinc-400 py-4">
                No nodes found
              </div>
            )}
          </div>
        ) : (
          // Show categorized nodes when not searching
          Object.entries(
            (allNodes as NodeWithCategory[]).reduce(
              (
                acc: CategorizedNodes,
                node: NodeWithCategory
              ): CategorizedNodes => {
                const category = node.category || "other";
                if (!acc[category]) {
                  acc[category] = [];
                }
                acc[category].push(node);
                return acc;
              },
              {} as CategorizedNodes
            )
          ).map(([category, nodes]) => (
            <div key={category} className="space-y-2">
              <CategoryButton
                category={category}
                isOpen={openCategory === category}
                onToggle={() => handleCategoryToggle(category)}
              />
              {openCategory === category && (
                <div className="space-y-2 pl-4">
                  {nodes.map((node) => (
                    <NodeButton key={node.type} node={node} onAdd={addNode} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <CustomNodeModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        code={code}
        setCode={setCode}
        onCreate={handleCreateNode}
        onUpdate={handleUpdateNode}
        editingNodeId={editingNodeId || undefined}
      />
    </div>
  );
});

NodePalette.displayName = "NodePalette";
