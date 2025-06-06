import { create } from "zustand";
import { Project, User } from "./generated/prisma";
import {
  NodeData,
  EdgeData,
  CustomNode,
  CustomEdge,
  WorkflowData,
} from "./types";
import path from "path";
import { Edge, Node, Connection } from "@xyflow/react";

// Debounce helper
let updateTimeout: NodeJS.Timeout;
let pendingUpdate: (() => void) | null = null;

const debounceUpdate = (callback: () => void, delay: number = 2000) => {
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

// Add utility function for generating unique IDs
const generateUniqueId = (prefix: string = "node"): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
};

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
  debouncedUpdate: (callback: () => void) => void;
  workflowData: WorkflowData | null;
  setWorkflowData: (data: WorkflowData) => void;
}>((set, get) => ({
  nodes: [],
  setNodes: (change: any) =>
    set((state) => {
      const nodes = [...state.nodes];

      if (change.type === "position") {
        const nodeIndex = nodes.findIndex((n) => n.id === change.id);
        if (nodeIndex !== -1) {
          nodes[nodeIndex] = {
            ...nodes[nodeIndex],
            position: change.position,
            data: {
              ...nodes[nodeIndex].data,
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
          return { nodes: [] };
        }
        return { nodes: nodes.filter((n) => n.id !== change.id) };
      }

      if (change.type === "add") {
        const nodeIndex = nodes.findIndex((n) => n.id === change.node.id);
        const now = new Date();

        const newNode: CustomNode = {
          ...change.node,
          data: {
            ...change.node.data,
            metadata: {
              createdAt: now,
              updatedAt: now,
              ...change.node.data?.metadata,
            },
            onDelete: () => {
              get().setNodes({ type: "remove", id: change.node.id });
            },
          },
        };

        if (nodeIndex !== -1) {
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

      if ("type" in edge) {
        if (edge.type === "clear") {
          return { edges: [] };
        }
        if (edge.type === "remove") {
          return { edges: edges.filter((e) => e.id !== edge.id) };
        }
      }

      if ("source" in edge && "target" in edge) {
        const connection = edge as Connection;
        const sourceNode = state.nodes.find((n) => n.id === connection.source);
        const targetNode = state.nodes.find((n) => n.id === connection.target);

        if (!sourceNode || !targetNode) {
          console.error("Source or target node not found");
          return { edges };
        }

        const edgeType =
          NODE_EDGE_TYPES[sourceNode.type as keyof typeof NODE_EDGE_TYPES] ||
          "custom-edge";
        const newEdge: CustomEdge = {
          id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
          type: "custom-edge",
          data: {
            type: "custom-edge",
            sourceType: sourceNode.type,
            targetType: targetNode.type,
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        };

        const existingEdgeIndex = edges.findIndex(
          (e) =>
            e.source === connection.source && e.target === connection.target
        );

        if (existingEdgeIndex === -1) {
          edges.push(newEdge);
        } else {
          edges[existingEdgeIndex] = newEdge;
        }
      }

      return { edges };
    }),
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  debouncedUpdate: (callback: () => void) => debounceUpdate(callback),
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
