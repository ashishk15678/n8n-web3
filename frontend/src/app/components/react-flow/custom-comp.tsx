import {
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

import { Trash, Plus, CloudLightning, Play, X, Copy } from "lucide-react";
import { workFlow } from "@/store";
import { NodeData } from "@/types";
import { WrapperWithTrigger } from "./wrapper";
import { Wrapper } from "./wrapper";

// Types for our data flow system
type FlowValue = string | number;
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
  connections: FlowConnection[];
  addConnection: (connection: FlowConnection) => void;
  removeConnection: (sourceId: string, targetId: string) => void;
  getValue: (id: string) => FlowValue | undefined;
}

const FlowContext = createContext<FlowContextType | null>(null);

// Provider component
export function FlowProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<FlowConnection[]>([]);

  const addConnection = useCallback((connection: FlowConnection) => {
    setConnections((prev) => [...prev, connection]);
  }, []);

  const removeConnection = useCallback((sourceId: string, targetId: string) => {
    setConnections((prev) =>
      prev.filter(
        (conn) => !(conn.sourceId === sourceId && conn.targetId === targetId)
      )
    );
  }, []);

  const getValue = useCallback(
    (id: string) => {
      const connection = connections.find((conn) => conn.targetId === id);
      return connection?.value;
    },
    [connections]
  );

  return (
    <FlowContext.Provider
      value={{ connections, addConnection, removeConnection, getValue }}
    >
      {children}
    </FlowContext.Provider>
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

// HOC for creating flow-aware components
export function withFlow<T extends object>(
  WrappedComponent: React.ComponentType<
    T & {
      value?: FlowValue;
      onChange?: (value: FlowValue) => void;
      isConnected?: boolean;
    }
  >,
  options: {
    id: string;
    type: "input" | "output";
    position: Position;
  }
) {
  return function FlowComponent(props: T) {
    const { id, type, position } = options;
    const { getValue } = useFlow();
    const [isConnected, setIsConnected] = useState(false);
    const [localValue, setLocalValue] = useState<FlowValue | undefined>(
      undefined
    );

    // Get value from flow context
    const flowValue = getValue(id);

    // Update local value when flow value changes
    useEffect(() => {
      if (flowValue !== undefined) {
        setLocalValue(flowValue);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    }, [flowValue]);

    return (
      <div className="relative">
        <Handle
          type={type === "input" ? "target" : "source"}
          position={position}
          id={id}
          className={`w-3 h-3 ${
            isConnected ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
          } transition-colors duration-200`}
          onConnect={() => setIsConnected(true)}
        />
        <WrappedComponent
          {...props}
          value={localValue}
          isConnected={isConnected}
          onChange={(value) => {
            if (!isConnected) {
              setLocalValue(value);
              (props as any).onChange?.(value);
            }
          }}
        />
      </div>
    );
  };
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

// Example usage of the HOC
export const FlowTextInput = withFlow(TextInput, {
  id: "text-input",
  type: "input",
  position: Position.Left,
});

export const FlowNumberInput = withFlow(NumberInput, {
  id: "number-input",
  type: "input",
  position: Position.Left,
});

// export function Wrapper({
//   children,
//   id,
//   onDelete,
//   showDelete = true,
//   showActions = true,
// }: {
//   children: ReactNode;
//   id: string;
//   onDelete?: () => void;
//   showDelete?: boolean;
//   showActions?: boolean;
// }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [x, setX] = useState(0);
//   const [y, setY] = useState(0);
//   const { setNodes } = workFlow();

//   const handleDelete = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (onDelete) {
//       onDelete();
//     } else {
//       setNodes({ type: "remove", id });
//     }
//   };

//   const actions = {
//     delete: {
//       label: "Delete",
//       icon: <Trash size={16} />,
//       onClick: handleDelete,
//     },
//     execute: {
//       label: "Execute",
//       icon: <Play size={16} />,
//       onClick: () => setIsOpen(false),
//     },
//     duplicate: {
//       label: "Duplicate",
//       icon: <Copy size={16} />,
//       onClick: () => setIsOpen(false),
//     },
//   };

//   return (
//     <div
//       onClick={() => setIsOpen(false)}
//       className="flex flex-col gap-4 relative group"
//       onContextMenu={(e) => {
//         if (showActions) {
//           e.preventDefault();
//           e.stopPropagation();
//           setIsOpen(!isOpen);
//           setX(e.clientX);
//           setY(e.clientY);
//         }
//       }}
//     >
//       {showDelete && (
//         <div className="absolute top-2 -right-6 group-hover:opacity-100 opacity-0 transition-opacity duration-200 flex flex-col gap-1">
//           {Object.entries(actions).map(([key, action]) => (
//             <button
//               key={key}
//               onClick={action.onClick}
//               className="text-zinc-400 cursor-pointer hover:translate-x-2 transition-all duration-200
//             focus:opacity-100 z-50 text-xl"
//               title={action.label}
//             >
//               {action.icon}
//             </button>
//           ))}
//         </div>
//       )}
//       {children}
//       {isOpen && showActions && (
//         <div
//           onClick={() => setIsOpen(false)}
//           style={{
//             top: y,
//             left: x,
//           }}
//           className="absolute w-full h-full"
//         >
//           {/*
//           // TODO : Create Context Menu
//           <div className="w-[120px] h-[200px] rounded-lg shadow-md border border-zinc-400 bg-zinc-100 px-2 gap-y-1 overflow-y-auto">
//             {actions.map((action) => (
//               <button
//                 key={action.label}
//                 onClick={action.onClick}
//                 className="w-full text-sm text-zinc-500 rounded-md bg-white cursor-pointer flex flex-row items-center justify-between
//                 gap-2 mt-2 px-4 hover:bg-blue-100 hover:text-blue-500 hover:ring-1 hover:ring-blue-500 hover:shadow-xl hover:shadow-blue-500/20
//                 transition-all duration-200"
//               >
//                 {action.label}
//                 {action.icon}
//               </button>
//             ))} */}
//         </div>
//       )}
//     </div>
//   );
// }

// export function WrapperWithTrigger({
//   children,
//   onTrigger,
//   id,
// }: {
//   children: ReactNode;
//   onTrigger: () => void;
//   id: string;
// }) {
//   const { nodes, edges } = workFlow();
//   const [isTriggered, setIsTriggered] = useState(false);

//   const handleTrigger = useCallback((e: React.MouseEvent) => {
//     onTrigger();
//   }, []);

//   // Clone children with additional props
//   const childrenWithProps = isValidElement(children)
//     ? cloneElement(children as React.ReactElement<WrapperChildProps>, {
//         isTriggered,
//         onTrigger: handleTrigger,
//       })
//     : children;

//   return (
//     <div className="flex flex-row">
//       <Wrapper id={id}>
//         <div className="flex flex-row items-center -z-1 justify-between absolute -ml-10 hover:-ml-22 transition-all duration-200 mt-8">
//           <button
//             onClick={handleTrigger}
//             className={`${
//               isTriggered
//                 ? "bg-orange-200 text-orange-600"
//                 : "bg-orange-100 text-orange-500"
//             } rounded-lg px-2 cursor-pointer flex flex-row items-center gap-1 transition-all duration-200`}
//           >
//             Trigger{" "}
//             <CloudLightning
//               size={12}
//               className={isTriggered ? "animate-pulse" : ""}
//             />
//           </button>
//         </div>

//         <div>{childrenWithProps}</div>
//       </Wrapper>
//     </div>
//   );
// }

// Add a helper hook for node updates
function useNodeUpdate(nodeId: string, initialData: any) {
  const { nodes, setNodes, debouncedUpdate } = workFlow();
  const [nodeData, setNodeData] = useState(initialData);

  const updateNodeData = useCallback(
    (newData: any) => {
      setNodeData(newData);
      setNodes({
        type: "add",
        node: {
          id: nodeId,
          type: nodes.find((n) => n.id === nodeId)?.type || "default",
          position: nodes.find((n) => n.id === nodeId)?.position || {
            x: 0,
            y: 0,
          },
          data: {
            ...nodes.find((n) => n.id === nodeId)?.data,
            ...newData,
          },
        },
      });
      debouncedUpdate(() => {
        console.log("Node updated:", { id: nodeId, data: newData });
      });
    },
    [nodeId, nodes, setNodes, debouncedUpdate]
  );

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
  const ref = useRef<HTMLButtonElement>(null);
  // // Update node data when flow values change
  // useEffect(() => {
  //   if (amountValue !== undefined) {
  //     updateNodeData({ ...nodeData, amount: Number(amountValue) });
  //   }
  // }, [amountValue]);

  // useEffect(() => {
  //   if (tokenAddressValue !== undefined) {
  //     updateNodeData({ ...nodeData, tokenAddress: String(tokenAddressValue) });
  //   }
  // }, [tokenAddressValue]);

  // useEffect(() => {
  //   if (recipientValue !== undefined) {
  //     updateNodeData({ ...nodeData, recipient: String(recipientValue) });
  //   }
  // }, [recipientValue]);

  return (
    <div className={`relative ${selected ? "ring-2 ring-orange-500" : ""}`}>
      <div className="absolute -top-6 left-0 text-xs text-gray-500 font-mono">
        {id}
      </div>

      <Wrapper id={id as string}>
        {/* @ts-ignore */}
        <WrapperWithTrigger id={id as string} ref={ref}>
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
        </WrapperWithTrigger>
      </Wrapper>
    </div>
  );
}

// Update InputText to handle automatic data flow
export const InputText = (props: NodeProps) => {
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
      updateNodeData({ ...nodeData, value: String(flowValue) });
    }
  }, [flowValue]);

  return (
    <div className={`relative ${selected ? "ring-2 ring-orange-500" : ""}`}>
      <div className="absolute -top-6 left-0 text-xs text-gray-500 font-mono">
        {id}
      </div>

      <Wrapper id={id as string}>
        <div className="p-4 rounded-lg shadow-lg bg-white">
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-blue-500"
          />
          <FlowTextInput
            value={nodeData.value}
            onChange={(value) => {
              updateNodeData({ ...nodeData, value });
            }}
            isConnected={flowValue !== undefined}
          />
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 bg-green-500"
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
      updateNodeData({ ...nodeData, value: Number(flowValue) });
    }
  }, [flowValue]);

  return (
    <div className={`relative ${selected ? "ring-2 ring-orange-500" : ""}`}>
      <div className="absolute -top-6 left-0 text-xs text-gray-500 font-mono">
        {id}
      </div>

      <Wrapper id={id as string}>
        <div className="p-4 rounded-lg shadow-lg bg-white">
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-blue-500"
          />
          <FlowNumberInput
            value={nodeData.value}
            onChange={(value) => {
              updateNodeData({ ...nodeData, value: Number(value) });
            }}
            isConnected={flowValue !== undefined}
          />
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 bg-green-500"
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
