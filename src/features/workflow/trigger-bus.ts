type TriggerPayload = {
  data?: unknown;
  error?: string;
  sourceId: string;
};

type TriggerHandler = (payload: TriggerPayload) => void;

const subscribers = new Map<string, Set<TriggerHandler>>();

export function subscribeToTrigger(nodeId: string, handler: TriggerHandler) {
  const set = subscribers.get(nodeId) ?? new Set<TriggerHandler>();
  set.add(handler);
  subscribers.set(nodeId, set);
}

export function unsubscribeFromTrigger(
  nodeId: string,
  handler: TriggerHandler
) {
  const set = subscribers.get(nodeId);
  if (!set) return;
  set.delete(handler);
  if (set.size === 0) subscribers.delete(nodeId);
}

export function emitTrigger(nodeId: string, payload: TriggerPayload) {
  const set = subscribers.get(nodeId);
  if (!set) return;
  for (const handler of set) handler(payload);
}

// Helper to fan-out to connected nodes using reactflow instance methods
export function emitToConnected(
  sourceId: string,
  payload: Omit<TriggerPayload, "sourceId">,
  reactflow: { getEdges: () => Array<{ source: string; target: string }> }
) {
  const edges = reactflow.getEdges();
  for (const edge of edges) {
    if (edge.source === sourceId) {
      emitTrigger(edge.target, { ...payload, sourceId });
    }
  }
}
