"use client";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/reactflow/base-node";
import { NodeStatus } from "@/components/reactflow/node-status-indicator";
import { NodeProps, Position, useReactFlow } from "@xyflow/react";
import { memo, useEffect, useMemo, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BaseHandle } from "@/components/reactflow/base-handle";
import { Switch } from "@/components/ui/switch";
import {
  emitToConnected,
  subscribeToTrigger,
  unsubscribeFromTrigger,
} from "@/features/workflow/trigger-bus";
import { generateText, streamText, generateObject, streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import Image from "next/image";
import { Icon, LucideIcon } from "lucide-react";
import { Credential } from "@/generated/prisma";
export type AiProviders = "GOOGLE" | "ANTHROPIC" | "OPENAI";

interface ModelOption {
  name: string;
}

interface AINodeProps {
  id: string;
  status: NodeStatus;
  from: AiProviders;
  models: ModelOption[];
  props: NodeProps;
  onTrigger?: (
    result: { text?: string; error?: string },
    onTrigger?: (handleRun?: () => void) => void,
  ) => void;
  image: string | LucideIcon;
  credential?: Credential;
  credentials?: Credential[];
}

export const AINode = memo(
  ({
    id,
    status = "initial",
    from,
    models,
    props,
    onTrigger,
    image,
    credential,
    credentials,
  }: AINodeProps) => {
    const rf = useReactFlow();

    const nodeData = (props as any).data || {};
    const selectedModel = nodeData.model as string | undefined;
    const prompt = nodeData.prompt as string | undefined;
    const stream = (nodeData.stream as boolean | undefined) ?? false;
    const useSchema = (nodeData.useSchema as boolean | undefined) ?? false;
    const schemaText = (nodeData.schema as string | undefined) ?? "";

    const modelOptions = useMemo(() => models, [models]);

    const updateNodeData = (partial: Record<string, unknown>) => {
      rf.setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                provider: from,
                ...partial,
              },
            };
          }
          return node;
        }),
      );
    };

    const setStatus = (newStatus: NodeStatus) => {
      rf.setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, status: newStatus } }
            : node,
        ),
      );
    };

    const resolveModel = () => {
      if (!selectedModel) return undefined;
      if (from === "OPENAI") return openai(selectedModel);
      if (from === "GOOGLE") return google(selectedModel);
      if (from === "ANTHROPIC") return anthropic(selectedModel);
      return undefined;
    };

    const lastResultRef = useRef<{ text?: string; error?: string } | null>(
      null,
    );

    const handleRun = async () => {
      if (!selectedModel || !prompt) return;
      try {
        setStatus("loading");
        updateNodeData({
          response: "",
          responseObject: undefined,
          error: undefined,
          lastRunAt: new Date().toISOString(),
        });
        const model = resolveModel();
        if (!model) throw new Error("Invalid model/provider");

        if (useSchema) {
          let schemaObj: unknown;
          try {
            schemaObj = schemaText ? JSON.parse(schemaText) : undefined;
            if (!schemaObj || typeof schemaObj !== "object") {
              throw new Error("Schema must be a valid JSON object");
            }
          } catch (e: any) {
            throw new Error(`Invalid JSON Schema: ${e?.message || String(e)}`);
          }

          if (stream) {
            const result = streamObject({
              model,
              schema: schemaObj as any,
              prompt,
            });
            for await (const partial of result.partialObjectStream) {
              updateNodeData({
                responseObject: partial,
                response: JSON.stringify(partial, null, 2),
              });
            }
            const full = await result.object;
            updateNodeData({
              responseObject: full,
              response: JSON.stringify(full, null, 2),
            });
            setStatus("success");
            lastResultRef.current = { text: JSON.stringify(full) };
          } else {
            const result = await generateObject({
              model,
              schema: schemaObj as any,
              prompt,
            });
            updateNodeData({
              responseObject: result.object,
              response: JSON.stringify(result.object, null, 2),
            });
            setStatus("success");
            lastResultRef.current = { text: JSON.stringify(result.object) };
          }
        } else {
          if (stream) {
            const result = streamText({ model, prompt });
            let full = "";
            for await (const delta of result.textStream) {
              full += delta;
              updateNodeData({ response: full });
            }
            setStatus("success");
            lastResultRef.current = { text: full };
          } else {
            const result = await generateText({ model, prompt });
            updateNodeData({ response: result.text });
            setStatus("success");
            lastResultRef.current = { text: result.text };
          }
        }
      } catch (e: any) {
        const message = e?.message || "Failed to run model";
        updateNodeData({ error: message });
        setStatus("error");
        lastResultRef.current = { error: message };
      }
    };

    useEffect(() => {
      const handler = async () => {
        await handleRun();
        const result = lastResultRef.current;
        emitToConnected(id, { data: result, error: result?.error }, rf as any);
      };
      subscribeToTrigger(id, handler);
      return () => unsubscribeFromTrigger(id, handler);
    }, [id, selectedModel, prompt, stream, useSchema, schemaText]);

    const schemaPlaceholder = `{
  "type": "object",
  "properties": {
    "answer": { "type": "string" }
  },
  "required": ["answer"]
}`;
    const Icon = image as LucideIcon;
    return (
      <BaseNode status={status} {...props}>
        <BaseNodeHeader>
          <div className="flex items-center gap-2 w-full rounded-l-2xl text-sm overflow-hidden">
            {typeof image === "string" ? (
              <Image
                src={image}
                alt={`${from} icon`}
                className="size-8 object-contain rounded-sm"
                width={16}
                height={16}
              />
            ) : (
              <Icon className="size-4 text-muted-foreground" />
            )}
            <BaseNodeHeaderTitle>AI Node</BaseNodeHeaderTitle>
            <div className="ml-auto text-[10px] text-muted-foreground">
              {selectedModel ? selectedModel : "Model: not selected"}
              {stream ? " • streaming" : ""}
            </div>
          </div>
        </BaseNodeHeader>
        <BaseNodeContent>
          <div className="flex flex-col gap-y-4 ">
            <div className="flex flex-col gap-2">
              <Label className="text-xs">Model</Label>
              <Select
                value={selectedModel}
                onValueChange={(value) => updateNodeData({ model: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((m) => (
                    <SelectItem key={m.name} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs">Prompt</Label>
              <Textarea
                disabled={true}
                value={prompt || ""}
                onChange={(e) => updateNodeData({ prompt: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={stream}
                    onCheckedChange={(v) => updateNodeData({ stream: v })}
                  />
                  <Label className="text-xs">Stream</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={useSchema}
                    onCheckedChange={(v) => updateNodeData({ useSchema: v })}
                  />
                  <Label className="text-xs">Use schema</Label>
                </div>
              </div>
            </div>
            {useSchema && (
              <div className="flex flex-col gap-2">
                <Label className="text-xs">JSON Schema</Label>
                <Textarea
                  placeholder={schemaPlaceholder}
                  value={schemaText}
                  onChange={(e) => updateNodeData({ schema: e.target.value })}
                />
              </div>
            )}
            {typeof (nodeData.response as string | undefined) === "string" && (
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Response</Label>
                <Textarea
                  value={(nodeData.response as string) || ""}
                  readOnly
                />
              </div>
            )}
            {typeof (nodeData.error as string | undefined) === "string" &&
              nodeData.error && (
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-red-600">Error</Label>
                  <Textarea value={(nodeData.error as string) || ""} readOnly />
                </div>
              )}
            {/*<BaseHandle id="target-1" type="target" position={Position.Left} />*/}
            <BaseHandle id="source-1" type="source" position={Position.Right} />

            <BaseHandle id="target-1" type="target" position={Position.Left} />
          </div>
        </BaseNodeContent>
      </BaseNode>
    );
  },
);
