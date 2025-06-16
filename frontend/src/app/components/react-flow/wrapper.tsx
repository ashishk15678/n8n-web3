import { cn } from "@/lib/utils";
import { workFlow } from "@/store";
import { Trash, Plus, Play, Lightbulb, Loader2, X, Check } from "lucide-react";
import { ReactNode } from "react";
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
        <div className="absolute top-2 bg-zinc-100/60 rounded-md px-1 py-2 -right-6 group-hover:opacity-100 opacity-0 transition-opacity duration-200 flex flex-col gap-1">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="text-zinc-400 cursor-pointer hover:translate-x-2 transition-all duration-200
              focus:opacity-100 z-50 text-xl"
              title={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

export function WrapperTrigger({
  id,
  children,
  showActions = true,
  showDelete = true,
  onTrigger,
  onSuccess,
  onError,
}: {
  id: string;
  showActions?: boolean;
  showDelete?: boolean;
  children: ReactNode;
  onTrigger?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}) {
  const { setNodes } = workFlow();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  return (
    <div>
      <Wrapper
        id={id}
        onDelete={() => setNodes({ type: "remove", id })}
        showActions={showActions}
        showDelete={showDelete}
      >
        <div
          className={cn(
            "absolute top-6 -left-6 hover:-left-22 transition-all duration-200 px-2 -z-1  rounded-xl flex items-center justify-center gap-1 cursor-pointer",
            state === "idle" &&
              "text-orange-500 bg-orange-100/50 hover:bg-orange-100",
            state === "loading" &&
              "animate-pulse text-blue-500 bg-blue-100/50 hover:bg-blue-100",
            state === "success" &&
              "text-green-500 bg-green-100/50 hover:bg-green-100",
            state === "error" && "text-red-500 bg-red-100/50 hover:bg-red-100"
          )}
          onClick={() => {
            setState("loading");
            try {
              onTrigger?.();
              setState("success");
              onSuccess?.();
            } catch (error) {
              console.error(error);
              setState("error");
              onError?.();
            } finally {
              setTimeout(() => {
                setState("idle");
              }, 5000);
            }
          }}
        >
          {state === "idle" && (
            <>
              Trigger <Lightbulb size={14} />
            </>
          )}
          {state === "loading" && (
            <>
              Triggering <Loader2 size={14} className="animate-spin" />
            </>
          )}
          {state === "success" && (
            <>
              Success <Check size={14} className="text-green-500" />
            </>
          )}
          {state === "error" && (
            <>
              Error <X size={14} className="text-red-500" />
            </>
          )}
        </div>
        {children}
      </Wrapper>
    </div>
  );
}
