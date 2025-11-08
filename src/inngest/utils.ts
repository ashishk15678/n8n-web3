import toposort from "toposort";
import { Node, Connection } from "@/generated/prisma";
import { inngest } from "./client";
export const topoLogicalSort = ({
  nodes,
  connections,
}: {
  nodes: Node[];
  connections: Connection[];
}): Node[] => {
  if (connections.length == 0) return nodes;
  const edges: [string, string][] = connections.map((connection) => [
    connection.fromNodeId,
    connection.toNodeId,
  ]);

  const connectedIds = new Set<string>();
  for (const conn of connections) {
    connectedIds.add(conn.fromNodeId);
    connectedIds.add(conn.toNodeId);
  }

  for (const node of nodes) {
    if (!connectedIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  let sortedNodeIds: string[];
  try {
    sortedNodeIds = toposort(edges);
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic"))
      throw new Error("Workflow contains cycle");
    throw error;
  }
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: any;
}) => {
  return inngest.send({
    name: "workflow/execute.workflow",
    data,
  });
};
