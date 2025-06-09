import { create } from "zustand";
import { Project, User } from "./generated/prisma";
import { NodeData, CustomNode, CustomEdge, WorkflowData } from "./types";
import path from "path";
import { Connection } from "@xyflow/react";

// Update the debounce helper to handle immediate updates
let updateTimeout: NodeJS.Timeout;
let pendingUpdate: (() => void) | null = null;

const debounceUpdate = (
  callback: () => void,
  delay: number = 2000,
  immediate: boolean = false
) => {
  if (immediate) {
    callback();
    return;
  }

  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  pendingUpdate = callback;
  updateTimeout = setTimeout(() => {
    if (pendingUpdate) {
      pendingUpdate();
      pendingUpdate = null;
    }
  }, delay);
};

// Add edge type mapping
const NODE_EDGE_TYPES = {
  sendtoken: "sendtoken-edge",
  inputtext: "inputtext-edge",
  inputnumber: "inputnumber-edge",
  custom: "custom-edge",
} as const;

export const useUser = create<{
  user: User | null;
  setUser: (user: User) => void;
}>((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
}));

export const useProject = create<{
  project: Project | null;
  setProject: (project: Project) => void;
  projectLoading: boolean;
  setProjectLoading: (projectLoading: boolean) => void;
}>((set) => ({
  project: null,
  setProject: (project: Project) => set({ project }),
  projectLoading: false,
  setProjectLoading: (projectLoading: boolean) => set({ projectLoading }),
}));

export const loading = create<{
  loading: boolean;
  setLoading: (loading: boolean) => void;
}>((set) => ({
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
}));

export const useEnv = create<{
  isEnvModalOpen: boolean;
  setIsEnvModalOpen: (isEnvModalOpen: boolean) => void;
}>((set) => ({
  isEnvModalOpen: false,
  setIsEnvModalOpen: (isEnvModalOpen: boolean) => set({ isEnvModalOpen }),
}));

// Update helper to initialize node data with config
function initializeNodeData(data: Partial<NodeData> = {}): NodeData {
  const baseData: NodeData = {
    label: data.label || "Node",
    type: data.type || "default",
    value: data.value || null,
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
    },
  };

  // Deep merge config and metadata
  if (data.config) {
    baseData.config = {
      ...baseData.config,
      ...data.config,
      inputs: {
        ...baseData.config.inputs,
        ...data.config.inputs,
      },
      outputs: {
        ...baseData.config.outputs,
        ...data.config.outputs,
      },
    };
  }

  if (data.metadata) {
    baseData.metadata = {
      ...baseData.metadata,
      ...data.metadata,
    };
  }

  // Merge remaining properties
  return {
    ...baseData,
    ...Object.fromEntries(
      Object.entries(data).filter(
        ([key]) => !["config", "metadata"].includes(key)
      )
    ),
  };
}

// Update getNodeValue to use config
function getNodeValue(node: CustomNode): any {
  if (!node.data?.config) return null;

  switch (node.type) {
    case "sendtoken":
      return (
        node.data.config.inputs?.value ||
        node.data.amount ||
        node.data.tokenAddress ||
        node.data.recipient
      );
    case "inputtext":
    case "inputnumber":
    case "custom":
    default:
      return node.data.config.inputs?.value;
  }
}

// Update setNodeValue to handle config properly
function setNodeValue(node: CustomNode, value: any): CustomNode {
  const updatedNode = { ...node };
  const now = new Date();

  if (!updatedNode.data) {
    updatedNode.data = initializeNodeData();
  }

  const baseConfig = {
    inputs: { value: null, updatedAt: now },
    outputs: { value: null, updatedAt: now },
  };

  if (!updatedNode.data.config) {
    updatedNode.data.config = baseConfig;
  }

  switch (node.type) {
    case "sendtoken":
      if (typeof value === "number") {
        updatedNode.data = {
          ...node.data,
          amount: value,
          config: {
            ...node.data.config,
            inputs: {
              ...node.data.config.inputs,
              value,
              updatedAt: now,
            },
          },
        };
      } else if (typeof value === "string" && value.startsWith("0x")) {
        const field = node.data.tokenAddress ? "recipient" : "tokenAddress";
        updatedNode.data = {
          ...node.data,
          [field]: value,
          config: {
            ...node.data.config,
            inputs: {
              ...node.data.config.inputs,
              value,
              updatedAt: now,
            },
          },
        };
      }
      break;
    default:
      updatedNode.data = {
        ...node.data,
        value,
        config: {
          ...node.data.config,
          inputs: {
            ...node.data.config.inputs,
            value,
            updatedAt: now,
          },
        },
      };
  }

  return updatedNode;
}

export const workFlow = create<{
  nodes: CustomNode[];
  setNodes: (change: any) => void;
  edges: CustomEdge[];
  setEdges: (
    edge:
      | CustomEdge
      | { type: "clear" }
      | Connection
      | { type: "remove"; id: string }
  ) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  debouncedUpdate: (callback: () => void, immediate?: boolean) => void;
  workflowData: WorkflowData | null;
  setWorkflowData: (data: WorkflowData) => void;
}>((set, get) => ({
  nodes: [],
  setNodes: (change: any) =>
    set((state) => {
      const nodes = [...state.nodes];
      const edges = [...state.edges];

      // Handle immediate updates for clearing all nodes
      if (change.type === "remove" && change.id === "all") {
        // Clear edges immediately when clearing all nodes
        get().setEdges({ type: "clear" });
        return { nodes: [], edges: [] };
      }

      if (change.type === "position") {
        const nodeIndex = nodes.findIndex((n) => n.id === change.id);
        if (nodeIndex !== -1) {
          nodes[nodeIndex] = {
            ...nodes[nodeIndex],
            position: change.position,
            data: {
              ...nodes[nodeIndex].data,
              config: {
                ...nodes[nodeIndex].data.config,
                inputs: {
                  ...nodes[nodeIndex].data.config.inputs,
                  updatedAt: new Date(),
                },
              },
              metadata: {
                ...nodes[nodeIndex].data.metadata,
                updatedAt: new Date(),
              },
            },
          };
        }
        return { nodes };
      }

      if (change.type === "remove") {
        if (change.id === "all") {
          return { nodes: [], edges: [] };
        }
        // When removing a node, also remove connected edges and update connected nodes
        const connectedEdges = edges.filter(
          (e) => e.source === change.id || e.target === change.id
        );

        // Reset values of nodes that were connected to the removed node
        connectedEdges.forEach((edge) => {
          const connectedNodeId =
            edge.source === change.id ? edge.target : edge.source;
          const connectedNodeIndex = nodes.findIndex(
            (n) => n.id === connectedNodeId
          );
          if (connectedNodeIndex !== -1) {
            nodes[connectedNodeIndex] = setNodeValue(
              nodes[connectedNodeIndex],
              null
            );
          }
        });

        return {
          nodes: nodes.filter((n) => n.id !== change.id),
          edges: edges.filter(
            (e) => e.source !== change.id && e.target !== change.id
          ),
        };
      }

      if (change.type === "add") {
        const nodeIndex = nodes.findIndex((n) => n.id === change.node.id);
        const newNode: CustomNode = {
          ...change.node,
          data: initializeNodeData(change.node.data),
        };

        if (nodeIndex !== -1) {
          const oldNode = nodes[nodeIndex];
          const oldValue = getNodeValue(oldNode);
          const newValue = getNodeValue(newNode);

          if (oldValue !== newValue) {
            const outgoingEdges = edges.filter((e) => e.source === newNode.id);
            outgoingEdges.forEach((edge) => {
              const targetNodeIndex = nodes.findIndex(
                (n) => n.id === edge.target
              );
              if (targetNodeIndex !== -1) {
                nodes[targetNodeIndex] = setNodeValue(
                  nodes[targetNodeIndex],
                  newValue
                );
              }
            });
          }

          nodes[nodeIndex] = newNode;
        } else {
          nodes.push(newNode);
        }
        return { nodes };
      }

      return state;
    }),
  edges: [],
  setEdges: (
    edge:
      | CustomEdge
      | { type: "clear" }
      | Connection
      | { type: "remove"; id: string }
  ) =>
    set((state) => {
      const edges = [...state.edges];
      const nodes = [...state.nodes];

      // Handle immediate updates for clearing all edges
      if ("type" in edge && edge.type === "clear") {
        // Reset values of all nodes that were connected
        nodes.forEach((node, index) => {
          if (node.data?.config) {
            nodes[index] = setNodeValue(node, null);
          }
        });
        return { edges: [], nodes };
      }

      if ("type" in edge) {
        if (edge.type === "remove") {
          // When removing an edge, reset the target node's value
          const edgeToRemove = edges.find((e) => e.id === edge.id);
          if (edgeToRemove) {
            const targetNodeIndex = nodes.findIndex(
              (n) => n.id === edgeToRemove.target
            );
            if (targetNodeIndex !== -1) {
              const targetNode = nodes[targetNodeIndex];
              nodes[targetNodeIndex] = setNodeValue(targetNode, null);
            }
          }

          return { edges: edges.filter((e) => e.id !== edge.id), nodes };
        }
      }

      if ("source" in edge && "target" in edge) {
        const connection = edge as Connection;
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);

        if (!sourceNode || !targetNode) {
          console.error("Source or target node not found");
          return { edges };
        }

        const sourceValue = getNodeValue(sourceNode);
        const targetNodeIndex = nodes.findIndex(
          (n) => n.id === connection.target
        );

        if (targetNodeIndex !== -1) {
          nodes[targetNodeIndex] = setNodeValue(targetNode, sourceValue);
        }

        const edgeType =
          NODE_EDGE_TYPES[sourceNode.type as keyof typeof NODE_EDGE_TYPES] ||
          "default";
        const newEdge: CustomEdge = {
          id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
          type: edgeType,
          data: {
            type: edgeType,
            sourceType: sourceNode.type,
            sourceValue: sourceValue,
            targetType: targetNode.type,
            value: sourceValue,
            config: {
              inputs: { value: connection.source, updatedAt: new Date() },
              outputs: {
                value: connection.target,
                updatedAt: new Date(),
              },
            },
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        };
        console.log({ newEdge }, { data: newEdge.data });

        const existingEdgeIndex = edges.findIndex(
          (e) =>
            e.source === connection.source && e.target === connection.target
        );

        if (existingEdgeIndex === -1) {
          edges.push(newEdge);
        } else {
          edges[existingEdgeIndex] = newEdge;
        }

        return { edges, nodes };
      }

      return { edges };
    }),
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  debouncedUpdate: (callback: () => void, immediate: boolean = false) =>
    debounceUpdate(callback, 2000, immediate),
  workflowData: null,
  setWorkflowData: (data: WorkflowData) => set({ workflowData: data }),
}));

export const workFlowExecutionStatus = create<{
  workFlowExecutionStatus: string | null;
  setWorkFlowExecutionStatus: (workFlowExecutionStatus: string | null) => void;
}>((set) => ({
  workFlowExecutionStatus: null,
  setWorkFlowExecutionStatus: (workFlowExecutionStatus: string | null) =>
    set({ workFlowExecutionStatus }),
}));

// TODO : Make Env
const ENV_FILE_PATH = path.join(process.cwd(), "frontend", "environment.txt");
export const useEnvironment = create<{
  environment: { name: string; value: string }[];
  setEnvironment: (environment: { name: string; value: string }) => void;
  // loadEnvironment: () => void;
}>((set) => ({
  environment: [],
  setEnvironment: (environment: { name: string; value: string }) =>
    set((state) => ({
      environment: [...state.environment, environment],
    })),
  // loadEnvironment: () => {
  //   set({ environment: JSON.parse(environment) });
  // },
}));
