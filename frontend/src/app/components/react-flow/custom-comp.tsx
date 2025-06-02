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
import { Handle, NodeProps, Position, Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Trash, Plus, CloudLightning, Play } from "lucide-react";
import { workFlow } from "@/store";

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
      onConnect?: () => void;
      onDisconnect?: () => void;
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
    const { getValue, addConnection, removeConnection } = useFlow();
    const [localValue, setLocalValue] = useState<FlowValue>("");
    const [isConnected, setIsConnected] = useState(false);

    const handleConnect = useCallback(() => {
      setIsConnected(true);
    }, []);

    const handleDisconnect = useCallback(() => {
      setIsConnected(false);
      setLocalValue("");
    }, []);

    const handleChange = useCallback(
      (value: FlowValue) => {
        if (!isConnected) {
          setLocalValue(value);
        }
      },
      [isConnected]
    );

    const flowValue = getValue(id);
    const displayValue = isConnected ? flowValue : localValue;

    return (
      <div className="relative">
        <Handle
          type={type === "input" ? "target" : "source"}
          position={position}
          id={id}
          className="w-3 h-3 bg-blue-500 hover:bg-blue-600"
          onConnect={handleConnect}
        />
        <WrappedComponent
          {...props}
          value={displayValue}
          onChange={handleChange}
          isConnected={isConnected}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
        {!isConnected && (
          <button
            onClick={handleConnect}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 p-2 rounded-full"
          >
            +
          </button>
        )}
        {isConnected && (
          <button
            onClick={handleDisconnect}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-2 rounded-full"
          >
            -
          </button>
        )}
      </div>
    );
  };
}

// Example input components that can be wrapped
export function TextInput({
  value,
  onChange,
  isConnected,
  placeholder = "Enter text...",
}: {
  value?: FlowValue;
  onChange?: (value: FlowValue) => void;
  isConnected?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={isConnected}
      placeholder={placeholder}
      className={`w-full px-3 py-1 border rounded-md ${
        isConnected ? "bg-gray-100" : "bg-white"
      }`}
    />
  );
}

export function NumberInput({
  value,
  onChange,
  isConnected,
  min,
  max,
  step = 1,
}: {
  value?: FlowValue;
  onChange?: (value: FlowValue) => void;
  isConnected?: boolean;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="text"
      accept="number"
      value={value || ""}
      onChange={(e) => onChange?.(Number(e.target.value))}
      disabled={isConnected}
      min={min}
      max={max}
      step={step}
      className={`w-full px-3 py-1 border rounded-md ${
        isConnected ? "bg-gray-100" : "bg-white"
      }`}
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

export function Wrapper({ children, id }: { children: ReactNode; id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const { nodes, setNodes } = workFlow();
  const actions = [
    {
      label: "Remove",
      icon: <Trash size={12} />,
      onClick: () => {
        setNodes({
          type: "remove",
          id: id,
        });
      },
    },
    {
      label: "Add",
      icon: <Plus size={12} />,
      onClick: () => setIsOpen(false),
    },
    {
      label: "Execute",
      icon: <Play size={12} />,
      onClick: () => setIsOpen(false),
    },
  ];

  return (
    <div
      onClick={() => setIsOpen(false)}
      className="flex flex-col gap-4"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
        setX(e.clientX);
        setY(e.clientY);
      }}
    >
      {children}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            top: y - 300,
            left: x - 600,
          }}
          className="absolute w-full h-full"
        >
          <div className="w-[120px] h-[200px] rounded-lg shadow-md border border-zinc-400 bg-zinc-100 px-2 gap-y-1 overflow-y-auto">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="w-full text-sm text-zinc-500 rounded-md bg-white cursor-pointer flex flex-row items-center justify-between 
                gap-2 mt-2 px-4 hover:bg-blue-100 hover:text-blue-500 hover:ring-1 hover:ring-blue-500 hover:shadow-xl hover:shadow-blue-500/20
                transition-all duration-200"
              >
                {action.label}
                {action.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function WrapperWithTrigger({
  children,
  onTrigger,
  id,
}: {
  children: ReactNode;
  onTrigger: () => void;
  id: string;
}) {
  const { nodes, edges } = workFlow();
  const [isTriggered, setIsTriggered] = useState(false);

  const handleTrigger = useCallback((e: React.MouseEvent) => {
    onTrigger();
  }, []);

  // Clone children with additional props
  const childrenWithProps = isValidElement(children)
    ? cloneElement(children as React.ReactElement<WrapperChildProps>, {
        isTriggered,
        onTrigger: handleTrigger,
      })
    : children;

  return (
    <div className="flex flex-row">
      <Wrapper id={id}>
        <div className="flex flex-row items-center -z-1 justify-between absolute -ml-10 hover:-ml-22 transition-all duration-200 mt-8">
          <button
            onClick={handleTrigger}
            className={`${
              isTriggered
                ? "bg-orange-200 text-orange-600"
                : "bg-orange-100 text-orange-500"
            } rounded-lg px-2 cursor-pointer flex flex-row items-center gap-1 transition-all duration-200`}
          >
            Trigger{" "}
            <CloudLightning
              size={12}
              className={isTriggered ? "animate-pulse" : ""}
            />
          </button>
        </div>

        <div>{childrenWithProps}</div>
      </Wrapper>
    </div>
  );
}

// Example SendToken component using the flow-aware inputs
export function SendToken({}: NodeProps<Node>) {
  const [data, setData] = useState({
    amount: 0,
    tokenAddress: "",
    recipient: "",
    network: "Sol",
  });

  const dataRef = useRef(data);

  useEffect(() => {
    console.log(data);
    dataRef.current = data;
  }, [data]);
  const id = useMemo(() => {
    return crypto.randomUUID();
  }, []);
  return (
    <WrapperWithTrigger
      onTrigger={() => {
        console.log(dataRef.current);
      }}
      id={id}
    >
      <div
        id={id}
        className="w-[300px] p-4 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <div className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-medium mb-4">Send Token</h3>
          <div className="bg-zinc-100 rounded-lg px-2">
            <select
              className=""
              onChange={(e) => {
                setData({ ...data, network: e.target.value });
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
              value={data.amount}
              onChange={(value) => {
                console.log(value);
                setData({ ...data, amount: Number(value) });
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Token Address
            </label>
            <FlowTextInput
              placeholder="0x..."
              value={data.tokenAddress}
              onChange={(value) => {
                setData({ ...data, tokenAddress: value as string });
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Recipient</label>
            <FlowTextInput
              placeholder="0x..."
              value={data.recipient}
              onChange={(value) => {
                setData({ ...data, recipient: value as string });
              }}
            />
          </div>
        </div>
      </div>
    </WrapperWithTrigger>
  );
}
