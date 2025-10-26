import { NodeType } from "@/generated/prisma";
import type { Workflow, Node as PrismaNode, Connection } from "@/generated/prisma";
import type { Node, Edge } from "@xyflow/react";

export const createMockWorkflow = (overrides?: Partial<Workflow>): Workflow => ({
  id: "test-workflow-id",
  userId: "test-user-id",
  name: "Test Workflow",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

export const createMockPrismaNode = (
  overrides?: Partial<PrismaNode>
): PrismaNode => ({
  id: "test-node-id",
  workflowId: "test-workflow-id",
  name: "Test Node",
  type: NodeType.INITIAL,
  position: { x: 0, y: 0 },
  data: {},
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

export const createMockConnection = (
  overrides?: Partial<Connection>
): Connection => ({
  id: "test-connection-id",
  workflowId: "test-workflow-id",
  fromNodeId: "node-1",
  toNodeId: "node-2",
  fromOutput: "main",
  toInput: "main",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

export const createMockReactFlowNode = (overrides?: Partial<Node>): Node => ({
  id: "test-node-id",
  type: NodeType.INITIAL,
  position: { x: 0, y: 0 },
  data: {},
  ...overrides,
});

export const createMockReactFlowEdge = (overrides?: Partial<Edge>): Edge => ({
  id: "test-edge-id",
  source: "node-1",
  target: "node-2",
  sourceHandle: "main",
  targetHandle: "main",
  ...overrides,
});

export const createMockWorkflowWithDetails = () => {
  const workflow = createMockWorkflow();
  const nodes = [
    createMockPrismaNode({ id: "node-1", type: NodeType.INITIAL }),
    createMockPrismaNode({ id: "node-2", type: NodeType.MANUAL_TRIGGER }),
  ];
  const connections = [
    createMockConnection({ fromNodeId: "node-1", toNodeId: "node-2" }),
  ];
  
  return { workflow, nodes, connections };
};