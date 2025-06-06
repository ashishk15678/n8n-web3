import {
  Position,
  XYPosition,
  Node as FlowNode,
  Edge as FlowEdge,
} from "@xyflow/react";

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
  config: {
    inputs?: Record<string, any>;
    outputs?: Record<string, any>;
    settings?: Record<string, any>;
  };
  // Node metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    tags?: string[];
    description?: string;
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
