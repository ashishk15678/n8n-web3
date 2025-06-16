import React, {
  useCallback,
  createContext,
  useContext,
  useState,
  ReactNode,
  cloneElement,
  isValidElement,
  useReducer,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  Handle,
  NodeProps,
  Position,
  Node,
  EdgeProps,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Trash } from "lucide-react";
import { workFlow } from "@/store";
import { NodeData } from "@/types";
import { Wrapper, WrapperTrigger } from "./wrapper";
import { sendSol } from "../../../../web3";

// Types for our data flow system
type FlowValue = {
  value: string | number;
  isConnected: boolean;
};

type FlowConnection = {
  sourceId: string;
  targetId: string;
  value: FlowValue;
};

// Add this type near the top of the file with other types
type WrapperChildProps = {
  isTriggered?: boolean;
  onTrigger?: (e: React.MouseEvent) => void;
};

// Context for managing flow connections
interface FlowContextType {
  connections: Map<string, FlowConnection>; // Use Map for O(1) lookups
  addConnection: (connection: FlowConnection) => void;
  removeConnection: (sourceId: string, targetId: string) => void;
  getValue: (id: string) => FlowValue | undefined;
}

const FlowContext = createContext<FlowContextType | null>(null);

// Provider component
export function FlowProvider({ children }: { children: ReactNode }) {
  const [connections] = useState(() => new Map<string, FlowConnection>());

  const addConnection = useCallback(
    (connection: FlowConnection) => {
      const key = `${connection.sourceId}-${connection.targetId}`;
      connections.set(key, connection);
    },
    [connections]
  );

  const removeConnection = useCallback(
    (sourceId: string, targetId: string) => {
      const key = `${sourceId}-${targetId}`;
      connections.delete(key);
    },
    [connections]
  );

  const getValue = useCallback(
    (id: string) => {
      for (const [_, connection] of connections) {
        if (connection.targetId === id) {
          return connection.value;
        }
      }
      return undefined;
    },
    [connections]
  );

  const contextValue = useMemo(
    () => ({
      connections,
      addConnection,
      removeConnection,
      getValue,
    }),
    [connections, addConnection, removeConnection, getValue]
  );

  return (
    <FlowContext.Provider value={contextValue}>{children}</FlowContext.Provider>
  );
}

// Hook to use the flow context
export function useFlow() {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlow must be used within a FlowProvider");
  }
  return context;
}

// Update component props types
interface FlowInputProps {
  value: string | number;
  onChange: (value: string | number) => void;
  isConnected?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

// Update withFlow HOC to use proper types
export function withFlow<T extends FlowInputProps>(
  WrappedComponent: React.ComponentType<T>,
  options: {
    id: string;
    type: "input" | "output";
    position: Position;
  }
) {
  return React.memo(function FlowComponent(props: T) {
    const { id, type, position } = options;
    const { getValue } = useFlow();
    const [localState, setLocalState] = useState<{
      value: string | number;
      isConnected: boolean;
    }>(() => ({
      value: props.value || (typeof props.value === "number" ? 0 : ""),
      isConnected: false,
    }));

    // Get value from flow context
    const flowValue = getValue(id);

    // Update local state when flow value changes
    useEffect(() => {
      if (flowValue) {
        setLocalState({
          value: flowValue.value,
          isConnected: flowValue.isConnected,
        });
      } else {
        setLocalState((prev) => ({
          ...prev,
          isConnected: false,
        }));
      }
    }, [flowValue]);

    const handleChange = useCallback(
      (value: string | number) => {
        if (!localState.isConnected) {
          setLocalState((prev) => ({ ...prev, value }));
          props.onChange(value);
        }
      },
      [localState.isConnected, props]
    );

    return (
      <div className="relative">
        <Handle
          type={type === "input" ? "target" : "source"}
          position={position}
          id={id}
          className={`w-3 h-3 ${
            localState.isConnected
              ? "bg-green-500"
              : "bg-blue-500 hover:bg-blue-600"
          } transition-colors duration-200`}
        />
        <WrappedComponent
          {...props}
          value={localState.value}
          isConnected={localState.isConnected}
          onChange={handleChange}
        />
      </div>
    );
  });
}

// Example input components that can be wrapped
export function TextInput({
  value = "",
  onChange,
  isConnected,
  placeholder = "Enter text...",
}: {
  value?: string;
  onChange?: (value: string) => void;
  isConnected?: boolean;
  placeholder?: string;
}) {
  const [localValue, setLocalValue] = useState(value);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (!isConnected) {
      onChange?.(newValue);
    }
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      disabled={isConnected}
      placeholder={placeholder}
      className={`w-full px-3 py-1 border rounded-md ${
        isConnected
          ? "bg-gray-100 cursor-not-allowed"
          : "bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      } transition-all duration-200`}
    />
  );
}

export function NumberInput({
  value = 0,
  onChange,
  isConnected,
  min,
  max,
  step = 1,
}: {
  value?: number;
  onChange?: (value: number) => void;
  isConnected?: boolean;
  min?: number;
  max?: number;
  step?: number;
}) {
  const [localValue, setLocalValue] = useState(value);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    if (!isConnected) {
      onChange?.(newValue);
    }
  };

  return (
    <input
      type="number"
      value={localValue}
      onChange={handleChange}
      disabled={isConnected}
      min={min}
      max={max}
      step={step}
      className={`w-full px-3 py-1 border rounded-md ${
        isConnected
          ? "bg-gray-100 cursor-not-allowed"
          : "bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      } transition-all duration-200`}
    />
  );
}

// Update FlowTextInput with proper types
export const FlowTextInput = React.memo(
  withFlow<FlowInputProps>(
    ({ value, onChange, isConnected, placeholder }) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
      };

      return (
        <div className="relative">
          <input
            type="text"
            value={value || ""}
            onChange={handleChange}
            disabled={isConnected}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-md ${
              isConnected
                ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                : "bg-white text-gray-900 hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            } transition-colors duration-200`}
          />
          {isConnected && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              Connected
            </div>
          )}
        </div>
      );
    },
    { id: "text-input", type: "input", position: Position.Left }
  )
);

// Update FlowNumberInput with proper types
export const FlowNumberInput = React.memo(
  withFlow<FlowInputProps>(
    ({ value, onChange, isConnected, min, max, step }) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        onChange(newValue);
      };

      return (
        <div className="relative">
          <input
            type="number"
            value={value || 0}
            onChange={handleChange}
            disabled={isConnected}
            min={min}
            max={max}
            step={step}
            className={`w-full px-3 py-2 border rounded-md ${
              isConnected
                ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                : "bg-white text-gray-900 hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            } transition-colors duration-200`}
          />
          {isConnected && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              Connected
            </div>
          )}
        </div>
      );
    },
    { id: "number-input", type: "input", position: Position.Left }
  )
);

// Add a helper hook for node updates
function useNodeUpdate(nodeId: string, initialData: any) {
  const { nodes, setNodes, debouncedUpdate } = workFlow();
  const [nodeData, setNodeData] = useState(initialData);

  const updateNodeData = useCallback(
    (newData: any) => {
      // Update local state immediately for responsive UI
      setNodeData(newData);

      // Update node in the flow state
      const updatedNode = {
        id: nodeId,
        type: nodes.find((n) => n.id === nodeId)?.type || "default",
        position: nodes.find((n) => n.id === nodeId)?.position || {
          x: 0,
          y: 0,
        },
        data: {
          ...nodes.find((n) => n.id === nodeId)?.data,
          ...newData,
          metadata: {
            ...nodes.find((n) => n.id === nodeId)?.data?.metadata,
            updatedAt: new Date(),
          },
        },
      };

      // Update the node in the flow state
      setNodes({
        type: "add",
        node: updatedNode,
      });

      // Debounce the database update
      debouncedUpdate(() => {
        // The actual database update will be handled by the backend
        // when the workflow is saved
        console.log("Node data updated and queued for database sync:", {
          id: nodeId,
          data: newData,
          timestamp: new Date().toISOString(),
        });
      });
    },
    [nodeId, nodes, setNodes, debouncedUpdate]
  );

  // Update local state when node data changes from outside
  useEffect(() => {
    const currentNode = nodes.find((n) => n.id === nodeId);
    if (currentNode?.data) {
      setNodeData(currentNode.data);
    }
  }, [nodes, nodeId]);

  return [nodeData, updateNodeData] as const;
}

// Update SendToken to handle automatic data flow
export function SendToken(props: NodeProps) {
  const { id, data, selected } = props;
  const { getValue } = useFlow();
  const initialData = {
    amount: 0,
    tokenAddress: "",
    recipient: "",
    network: "Sol",
    ...(data as any),
  };
  const [nodeData, updateNodeData] = useNodeUpdate(id as string, initialData);

  // Get values from flow context
  const amountValue = getValue(`${id}-amount`);
  const tokenAddressValue = getValue(`${id}-tokenAddress`);
  const recipientValue = getValue(`${id}-recipient`);

  return (
    <div className={`relative ${selected ? "ring-2 ring-orange-500" : ""}`}>
      <div className="absolute -top-6 left-0 text-xs text-gray-500 font-mono">
        {id}
      </div>

      <WrapperTrigger
        id={id as string}
        onTrigger={async () => {
          console.log({ nodeData });
          const tx = await sendSol();
          console.log({ tx });
        }}
      >
        <div className="w-[300px] p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-row items-center justify-between">
            <h3 className="text-lg font-medium mb-4">Send Token</h3>
            <div className="bg-zinc-100 rounded-lg px-2">
              <select
                value={nodeData.network}
                onChange={(e) => {
                  updateNodeData({ ...nodeData, network: e.target.value });
                }}
              >
                <option value="Sol">Sol</option>
                <option value="Eth">Eth</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <FlowNumberInput
                min={0}
                step={0.01}
                value={nodeData.amount}
                onChange={(value) => {
                  updateNodeData({ ...nodeData, amount: Number(value) });
                }}
                isConnected={amountValue !== undefined}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Token Address
              </label>
              <FlowTextInput
                placeholder="0x..."
                value={nodeData.tokenAddress}
                onChange={(value) => {
                  updateNodeData({
                    ...nodeData,
                    tokenAddress: value as string,
                  });
                }}
                isConnected={tokenAddressValue !== undefined}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Recipient
              </label>
              <FlowTextInput
                placeholder="0x..."
                value={nodeData.recipient}
                onChange={(value) => {
                  updateNodeData({ ...nodeData, recipient: value as string });
                }}
                isConnected={recipientValue !== undefined}
              />
              <Handle
                id="block-hash"
                title="Block hash"
                type="source"
                position={Position.Right}
              />
            </div>
          </div>
        </div>
      </WrapperTrigger>
    </div>
  );
}

export const InputText = (props: NodeProps) => {
  // Update InputText to handle automatic data flow
  const { id, data, selected } = props;
  const { getValue } = useFlow();
  const initialData = {
    value: (data as NodeData).value || "",
    ...(data as any),
  };
  const [nodeData, updateNodeData] = useNodeUpdate(id as string, initialData);
  const flowValue = getValue(id as string);

  // Update node data when flow value changes
  useEffect(() => {
    if (flowValue !== undefined) {
      updateNodeData({
        ...nodeData,
        value: String(flowValue.value),
        config: {
          ...nodeData.config,
          inputs: {
            ...nodeData.config.inputs,
            isConnected: flowValue.isConnected,
          },
        },
      });
    }
  }, [flowValue]);

  return (
    <div className={`relative ${selected ? "ring-2 ring-orange-500" : ""}`}>
      <div className="absolute -top-6 left-0 text-xs text-gray-500 font-mono">
        {id}
      </div>

      <Wrapper id={id as string}>
        <div className="p-4 rounded-lg shadow-lg bg-white">
          <FlowTextInput
            value={nodeData.value}
            onChange={(value) => {
              updateNodeData({
                ...nodeData,
                value,
                config: {
                  ...nodeData.config,
                  inputs: {
                    ...nodeData.config.inputs,
                    isConnected: false,
                  },
                },
              });
            }}
            isConnected={flowValue?.isConnected}
          />
          <Handle
            type="source"
            position={Position.Right}
            className={`w-3 h-3 ${
              nodeData.value ? "bg-green-500" : "bg-blue-500"
            }`}
          />
        </div>
      </Wrapper>
    </div>
  );
};

// Update InputNumber to handle automatic data flow
export const InputNumber = (props: NodeProps) => {
  const { id, data, selected } = props;
  const { getValue } = useFlow();
  const initialData = {
    value: (data as NodeData).value || 0,
    ...(data as any),
  };
  const [nodeData, updateNodeData] = useNodeUpdate(id as string, initialData);
  const flowValue = getValue(id as string);

  // Update node data when flow value changes
  useEffect(() => {
    if (flowValue !== undefined) {
      updateNodeData({
        ...nodeData,
        value: Number(flowValue.value),
        config: {
          ...nodeData.config,
          inputs: {
            ...nodeData.config.inputs,
            isConnected: flowValue.isConnected,
          },
        },
      });
    }
  }, [flowValue]);

  return (
    <div className={`relative ${selected ? "ring-2 ring-orange-500" : ""}`}>
      <div className="absolute -top-6 left-0 text-xs text-gray-500 font-mono">
        {id}
      </div>

      <Wrapper id={id as string}>
        <div className="p-4 rounded-lg shadow-lg bg-white">
          <FlowNumberInput
            value={nodeData.value}
            onChange={(value) => {
              updateNodeData({
                ...nodeData,
                value: Number(value),
                config: {
                  ...nodeData.config,
                  inputs: {
                    ...nodeData.config.inputs,
                    isConnected: false,
                  },
                },
              });
            }}
            isConnected={flowValue?.isConnected}
          />
          <Handle
            type="source"
            position={Position.Right}
            className={`w-3 h-3 ${
              nodeData.value ? "bg-green-500" : "bg-blue-500"
            }`}
          />
        </div>
      </Wrapper>
    </div>
  );
};

// Define the data type for custom nodes
type CustomNodeData = {
  label: string;
  type: string;
  value?: string | number;
  code?: string;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    tags?: string[];
    description?: string;
  };
};

// Update CustomNode component with proper typing
export function CustomNode(props: NodeProps) {
  const { id, data, selected } = props;
  const nodeData = data as CustomNodeData;
  const shortId = typeof id === "string" ? id.split("-").slice(-1)[0] : "";

  return (
    <div className={`relative ${selected ? "ring-2 ring-orange-500" : ""}`}>
      <div className="absolute -top-6 left-0 text-xs text-gray-500 font-mono">
        {shortId}
      </div>

      <Wrapper id={id as string}>
        <div className="p-4 rounded-lg shadow-lg bg-white">
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-blue-500"
          />
          <div className="text-center">
            <h3 className="text-lg font-semibold">
              {nodeData.label || "Custom Node"}
            </h3>
            <p className="text-sm text-gray-600">
              Type: {nodeData.type || "custom"}
            </p>
            {nodeData.value && (
              <p className="mt-2 text-sm font-mono bg-gray-100 p-1 rounded">
                {String(nodeData.value)}
              </p>
            )}
          </div>
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 bg-green-500"
          />
        </div>
      </Wrapper>
    </div>
  );
}

// Custom edge component with disconnect button
export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges } = workFlow();
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = useCallback(
    (evt: React.MouseEvent) => {
      evt.stopPropagation();
      setEdges({ type: "remove", id });
      console.log("Edge removed:", id);
    },
    [id, setEdges]
  );

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isHovered ? 2 : 1,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            cursor: "pointer",
          }}
          className="nodrag nopan button-edge__label"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* {isHovered && ( */}
          <button
            onClick={onEdgeClick}
            className="button-edge__label-button bg-zinc-100 hover:bg-red-200 hover:text-red-600
             text-zinc-600 p-0.5 rounded-full transition-colors duration-200 shadow-sm"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <Trash size={12} />
          </button>
          {/* )} */}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
