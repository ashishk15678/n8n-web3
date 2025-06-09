import { workFlow } from "@/store";
import { CloudLightning, Play, Plus, Trash } from "lucide-react";
import { ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import { useCallback } from "react";
import { useState } from "react";

export function Wrapper({
  children,
  id,
  onDelete,
  showDelete = true,
  showActions = true,
}: {
  children: ReactNode;
  id: string;
  onDelete?: () => void;
  showDelete?: boolean;
  showActions?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const { setNodes } = workFlow();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    } else {
      setNodes({ type: "remove", id });
    }
  };

  const actions = [
    {
      label: "Remove",
      icon: <Trash size={12} />,
      onClick: handleDelete,
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
      className="flex flex-col gap-4 relative group"
      onContextMenu={(e) => {
        if (showActions) {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
          setX(e.clientX);
          setY(e.clientY);
        }
      }}
    >
      {showDelete && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 bg-red-500 text-red-500 
            hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100
            focus:opacity-100 focus:outline-none z-50"
          title="Delete node"
        >
          <Trash size={10} />
        </button>
      )}
      {children}
      {isOpen && showActions && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            top: y,
            left: x,
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

// Add this type near the top of the file with other types
type WrapperChildProps = {
  isTriggered?: boolean;
  onTrigger?: (e: React.MouseEvent) => void;
};

export function WrapperWithTrigger({
  children,
  ref,
  id,
}: {
  children: ReactNode;
  ref: React.RefObject<HTMLButtonElement>;
  id: string;
}) {
  const { nodes, edges } = workFlow();
  const [isTriggered, setIsTriggered] = useState(false);

  const handleTrigger = useCallback((e: React.MouseEvent) => {
    ref.current?.click();
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
            ref={ref}
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
