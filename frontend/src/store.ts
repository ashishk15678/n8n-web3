import { create } from "zustand";
import { Project, User } from "./generated/prisma";
import { Workflow } from "./types";
import path from "path";
import { Edge, Node } from "@xyflow/react";

// Debounce helper
let updateTimeout: NodeJS.Timeout;
let pendingUpdate: (() => void) | null = null;

const debounceUpdate = (callback: () => void, delay: number = 10000) => {
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

export const workFlow = create<{
  nodes: Node[];
  setNodes: (change: any) => void;
  edges: Edge[];
  setEdges: (edge: Edge | { type: "clear" }) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  debouncedUpdate: (callback: () => void) => void;
}>((set) => ({
  nodes: [],
  setNodes: (change: any) =>
    set((state) => {
      if (change.type === "position") {
        return {
          nodes: state.nodes.map((node) =>
            node.id === change.id
              ? { ...node, position: change.position }
              : node
          ),
        };
      }
      if (change.type === "remove") {
        return {
          nodes: state.nodes.filter((node) => node.id !== change.id),
        };
      }
      if (change.type === "add") {
        return { nodes: [...state.nodes, change.node] };
      }
      return state;
    }),
  edges: [],
  setEdges: (edge: Edge | { type: "clear" }) =>
    set((state) => {
      if (edge.type === "clear") {
        return { edges: [] };
      }
      return { edges: [...state.edges, edge as Edge] };
    }),
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  debouncedUpdate: (callback: () => void) => debounceUpdate(callback),
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
