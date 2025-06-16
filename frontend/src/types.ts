import {
  Position,
  XYPosition,
  Node as FlowNode,
  Edge as FlowEdge,
} from "@xyflow/react";

export interface NodeConfig {
  inputs: {
    value: any;
    updatedAt: Date;
    [key: string]: any;
  };
  outputs: {
    value: any;
    updatedAt: Date;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface NodeData extends Record<string, unknown> {
  label: string;
  type: string;
  value?: any;
  color?: string;
  // Node execution data
  status?: "idle" | "running" | "success" | "error";
  lastRun?: Date;
  executionCount?: number;
  // Node configuration
  config: NodeConfig;
  // Node metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    tags?: string[];
    description?: string;
    [key: string]: any;

    // if the block is connected to another block

    // from source
    inputs?: {
      id: string;
      value?: any;
    };
    // to handle
    return?: any;
    isConnected?: boolean;
  };
  [key: string]: unknown;
}

export interface EdgeData extends Record<string, unknown> {
  type?: string;
  label?: string;
  validation?: {
    required: boolean;
    type: string;
    custom?: (value: any) => boolean;
  };
  [key: string]: unknown;
}

export interface NodeState {
  isSelected: boolean;
  isDragging: boolean;
  isExecuting: boolean;
  error?: string;
}

export interface EdgeState {
  isSelected: boolean;
  isHovered: boolean;
}

export type CustomNode = FlowNode<NodeData>;
export type CustomEdge = FlowEdge<EdgeData>;

export interface WorkflowData {
  id: string;
  name: string;
  version: number;
  nodes: CustomNode[];
  edges: CustomEdge[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    lastRun?: Date;
    status: "draft" | "active" | "archived";
  };
}

// Keep existing types for backward compatibility
// export type { Workflow } from "@xyflow/react";
