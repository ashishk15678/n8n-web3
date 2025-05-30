import { create } from "zustand";
import { Project, User } from "./generated/prisma";
import { Workflow } from "./types";

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
}>((set) => ({
  project: null,
  setProject: (project: Project) => set({ project }),
}));

export const appStore = create<{
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;
  ethAddress: string | null;
  setEthAddress: (ethAddress: string | null) => void;
  solanaAddress: string | null;
  setSolanaAddress: (solanaAddress: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}>((set) => ({
  isConnected: false,
  setIsConnected: (isConnected: boolean) => set({ isConnected }),
  ethAddress: null,
  setEthAddress: (ethAddress: string | null) => set({ ethAddress }),
  solanaAddress: null,
  setSolanaAddress: (solanaAddress: string | null) => set({ solanaAddress }),
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  error: null,
  setError: (error: string | null) => set({ error }),
}));

export const workFlowStatus = create<{
  curWorkFlow: Workflow | null;
  setCurWorkFlow: (curWorkFlow: Workflow) => void;

  workFlowLoading: boolean;
  setWorkFlowLoading: (workFlowLoading: boolean) => void;

  workflowsList: Workflow[];
  setWorkflowsList: (workflowsList: Workflow[]) => void;

  workFlowStatus: string | null;
  setWorkFlowStatus: (workFlowStatus: string | null) => void;

  workflowError: string | null;
  setWorkflowError: (workflowError: string | null) => void;
}>((set) => ({
  curWorkFlow: null,
  setCurWorkFlow: (curWorkFlow: Workflow) => set({ curWorkFlow }),

  workFlowLoading: false,
  setWorkFlowLoading: (workFlowLoading: boolean) => set({ workFlowLoading }),

  workFlowStatus: null,
  setWorkFlowStatus: (workFlowStatus: string | null) => set({ workFlowStatus }),

  workflowsList: [],
  setWorkflowsList: (workflowsList: Workflow[]) => set({ workflowsList }),

  workflowError: null,
  setWorkflowError: (workflowError: string | null) => set({ workflowError }),
}));

export const workFlowExecutionStatus = create<{
  workFlowExecutionStatus: string | null;
  setWorkFlowExecutionStatus: (workFlowExecutionStatus: string | null) => void;
}>((set) => ({
  workFlowExecutionStatus: null,
  setWorkFlowExecutionStatus: (workFlowExecutionStatus: string | null) =>
    set({ workFlowExecutionStatus }),
}));
