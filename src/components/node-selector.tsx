"use client";

import { NodeType } from "@/generated/prisma";
import { GlobeIcon, MousePointerIcon, UploadIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { toast } from "sonner";
import { createId } from "@paralleldrive/cuid2";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
};

const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Trigger Manually.",
    description: "Trigger manually your workflow",
    icon: MousePointerIcon,
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: "Google Form.",
    description: "Runs the flow when a google form is submitted",
    icon: "/Google_Forms_Logo.svg",
  },
];

const executionNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "Http Request",
    description: "Make http requests with ease.",
    icon: GlobeIcon,
  },
];

const aiNodes: NodeTypeOption[] = [
  {
    type: NodeType.AI_GOOGLE,
    label: "Google AI Node",
    description: "Add gemini model and work with it at ease",
    icon: GlobeIcon,
  },
  {
    type: NodeType.AI_ANTHROPIC,
    label: "Anthropic AI Node",
    description: "Use Claude models for text generation",
    icon: GlobeIcon,
  },
  {
    type: NodeType.AI_OPENAI,
    label: "OpenAI Node",
    description: "Use GPT models for text generation",
    icon: GlobeIcon,
  },
];

const uploadNodes: NodeTypeOption[] = [
  {
    type: NodeType.UPLOAD_ALL,
    label: "Upload all type of content",
    description: "Upload content of your liking to this node",
    icon: UploadIcon,
  },
  {
    type: NodeType.UPLOAD_IMAGE,
    label: "Upload Image",
    description: "Upload image to this node",
    icon: UploadIcon,
  },
  {
    type: NodeType.UPLOAD_VIDEO,
    label: "Upload video",
    description: "Upload video/s to this node",
    icon: UploadIcon,
  },
  {
    type: NodeType.UPLOAD_TEXT,
    label: "Upload text content",
    description: "Upload text to this node",
    icon: UploadIcon,
  },
  {
    type: NodeType.UPLOAD_PDF,
    label: "Upload PDF",
    description: "Upload PDF to this node",
    icon: UploadIcon,
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const NodeSelector = ({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) => {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();

  const handleNodeSelect = useCallback(
    (selection: NodeTypeOption) => {
      const nodes = getNodes();
      if (selection.type == NodeType.MANUAL_TRIGGER) {
        const hasManualTrigger = nodes.some(
          (node) => node.type == NodeType.MANUAL_TRIGGER,
        );
        if (hasManualTrigger) {
          toast.error("Only one manual trigger allowed per workflow");
          return;
        }
      }
      setNodes((node) => {
        const hasInitalNodeTrigger = nodes.some(
          (node) => node.type == NodeType.INITIAL,
        );

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });
        const newNode = {
          id: createId(),
          data: {},
          position: flowPosition,
          type: selection.type,
        };

        if (hasInitalNodeTrigger) return [newNode];
        return [...node, newNode];
      });
      onOpenChange(false);
    },
    [setNodes, getNodes, onOpenChange, screenToFlowPosition],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>What triggers this workflow ?</SheetTitle>
          <SheetDescription>
            A trigger is a step that starts your workflow
          </SheetDescription>
        </SheetHeader>
        <div>
          {triggerNodes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary hover:bg-primary/5"
                onClick={() => handleNodeSelect(node)}
              >
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof node.icon == "string" ? (
                    <img
                      src={node.icon}
                      className="size-5 object-contain rounded-sm"
                      alt={node.label}
                    />
                  ) : (
                    <Icon className="size-5" />
                  )}
                  <div className="flex flex-col items-start text-left ">
                    <span className="text-sm font-medium">{node.label}</span>
                    {node.description && (
                      <span className="text-xs font-muted-foreground">
                        {node.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        <div>
          {executionNodes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary  hover:bg-primary/5 "
                onClick={() => handleNodeSelect(node)}
              >
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof node.icon == "string" ? (
                    <img
                      src={node.icon}
                      className="size-5 object-contain rounded-sm"
                      alt={node.label}
                    />
                  ) : (
                    <Icon className="size-5" />
                  )}
                  <div className="flex flex-col items-start text-left ">
                    <span className="text-sm font-medium">{node.label}</span>
                    {node.description && (
                      <span className="text-xs font-muted-foreground">
                        {node.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        <div>
          {aiNodes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary  hover:bg-primary/5 "
                onClick={() => handleNodeSelect(node)}
              >
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof node.icon == "string" ? (
                    <img
                      src={node.icon}
                      className="size-5 object-contain rounded-sm"
                      alt={node.label}
                    />
                  ) : (
                    <Icon className="size-5" />
                  )}
                  <div className="flex flex-col items-start text-left ">
                    <span className="text-sm font-medium">{node.label}</span>
                    {node.description && (
                      <span className="text-xs font-muted-foreground">
                        {node.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        <div>
          {uploadNodes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary  hover:bg-primary/5 "
                onClick={() => handleNodeSelect(node)}
              >
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof node.icon == "string" ? (
                    <img
                      src={node.icon}
                      className="size-5 object-contain rounded-sm"
                      alt={node.label}
                    />
                  ) : (
                    <Icon className="size-5" />
                  )}
                  <div className="flex flex-col items-start text-left ">
                    <span className="text-sm font-medium">{node.label}</span>
                    {node.description && (
                      <span className="text-xs font-muted-foreground">
                        {node.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
