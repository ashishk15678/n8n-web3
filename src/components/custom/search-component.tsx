"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { useSuspenseWorkflows } from "@/features/workflow/hooks/useWorkflows";
import { ChevronRight, ChevronRightIcon } from "lucide-react";
export function SearchComponent() {
  const [isOpen, setOpen] = useState(false);
  const ref = useRef(null);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "k" || event.key === "K") {
      const isModifierPressed = event.ctrlKey || event.metaKey;

      if (isModifierPressed) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        ref && ref.current && ref.current.focus();
        setOpen(true);
      }
    }

    if (event.key == "Esc" && isOpen) setOpen(false);
  };

  useEffect(() => {
    if (window.document != undefined && window.document != null)
      document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setOpen]);

  const workflow = useSuspenseWorkflows();
  return (
    <>
      <div className=" w-full h-full flex items-center justify-center">
        <Input
          ref={ref}
          onClick={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          className="w-[400px] placeholder:text-center text-center"
          placeholder="Search or trigger some action (Ctrl + k)"
        />
      </div>
      {isOpen && (
        <div
          className={cn(
            " p-8 absolute z-1 top-10 transition-all  w-full flex items-center justify-center backdrop:blur-md",
            isOpen || "hidden",
          )}
        >
          <div className="bg-primary/20 ring ring-primary w-1/3 h-full py-2 text-sm rounded-b-2xl">
            <Suspense fallback={<div className="p-4">Loading...</div>}>
              {workflow.data.items.map((w) => (
                <div className="flex flex-row w-full py-2 px-6 text-center items-center justify-start">
                  <span className="flex flex-row">
                    {" "}
                    Workflow <ChevronRightIcon className="size-4" />{" "}
                  </span>{" "}
                  {w.name}
                </div>
              ))}
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}
