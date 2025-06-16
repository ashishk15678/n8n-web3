"use client";

import "@/app/globals.css";

import { Link, Navigate, useParams } from "react-router";
import React, { useCallback, useEffect, useState, useMemo, memo } from "react";
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
} from "lucide-react";
import { CodeEditor } from "@/app/components/code-editor/CodeEditor";
import { EnvModalButton } from "@/app/components/env";
import EthTransaction from "@/app/components/react-flow/eth/transaction";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";

const nodeTypes = {
  sendtoken: SendToken,
  inputtext: InputText,
  inputnumber: InputNumber,
  custom: CustomNode,
  ethTransaction: EthTransaction,
};

const edgeTypes = {
  default: CustomEdge,
  "sendtoken-edge": CustomEdge,
  "inputtext-edge": CustomEdge,
  "inputnumber-edge": CustomEdge,
  "custom-edge": CustomEdge,
  "ethTransaction-edge": CustomEdge,
};

// Define node types
type NodeType =
  | "sendtoken"
  | "ethTransaction"
  | "inputtext"
  | "inputnumber"
  | "custom";

interface NodeDefinition {
  type: NodeType;
  name: string;
  icon: string;
}

interface NodeWithCategory extends NodeDefinition {
  category?: string;
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
        <InputBox />
        <div className="flex flex-row items-center gap-2">
          <ClearButton />
          <SaveButton />
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
          <button
            className="bg-white p-2 rounded-full"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </button>
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
  const { nodes, setNodes, setEdges, debouncedUpdate } = workFlow();
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

export const NodePalette = memo(() => {
  const { setNodes } = workFlow();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
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

  // Memoize the flattened nodes array
  const allNodes = useMemo(
    () =>
      Object.entries(NODE_CATEGORIES).flatMap(([category, nodes]) =>
        nodes.map((node) => ({ ...node, category }))
      ),
    []
  );

  // Memoize filtered nodes
  const filteredNodes = useMemo(
    () =>
      searchQuery
        ? allNodes.filter((node) =>
            node.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [],
    [searchQuery, allNodes]
  );

  // Memoize the add node function
  const addNode = useCallback(
    (type: NodeType, name: string) => {
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
    },
    [setNodes]
  );

  // Memoize the custom node creation handler
  const handleCustomNodeCreate = useCallback(() => {
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
  }, [customCode, setNodes]);

  // Memoize category toggle handler
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
          Object.entries(NODE_CATEGORIES).map(([category, nodes]) => (
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
        code={customCode}
        setCode={setCustomCode}
        onCreate={handleCustomNodeCreate}
      />
    </div>
  );
});

NodePalette.displayName = "NodePalette";

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
