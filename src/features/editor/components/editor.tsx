"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  ErrorView,
  LoadingView,
} from "@/features/workflow/components/entity-components";
import {
  useSuspenseWorkflow,
  useUpdateWorkflow,
  useUpdateWorkflowName,
} from "@/features/workflow/hooks/useWorkflows";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Edge,
  Node,
  type EdgeChange,
  type NodeChange,
  type Connection,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "./add-node-button";
import { useAtomValue, useSetAtom } from "jotai";
import { editorAtom } from "../store/atom";
import { toast } from "sonner";
import { SearchComponent } from "@/components/custom/search-component";

export const EditorLoading = () => <LoadingView message="Loading Editor..." />;

export const EditorError = () => <ErrorView message="Error loading editor." />;

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);

  const setEditor = useSetAtom(editorAtom);

  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents}
        onInit={setEditor}
        fitView
        snapGrid={[10, 10]}
        snapToGrid
        panOnScroll
        selectionOnDrag
        panOnDrag={false}
      >
        <Background className="stroke-1 opacity-100  dark:opacity-50" />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <AddNodeButton />
        </Panel>
      </ReactFlow>
    </div>
  );
};

export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background ">
        <SidebarTrigger />
        <div className="flex flex-row items-center justify-between w-full">
          <EditorBreadCrumbs workflowId={workflowId} />
          <SearchComponent />
          <EditorSaveButton workflowId={workflowId} />
        </div>
      </header>
    </>
  );
};

export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
  const editor = useAtomValue(editorAtom);
  const saveWorkflow = useUpdateWorkflow();
  const handleSave = () => {
    if (!editor) {
      toast.error("Cannot update editor");
      return;
    }
    const nodes = editor.getNodes();
    const edges = editor.getEdges();

    saveWorkflow.mutate({
      id: workflowId,
      nodes,
      edges,
    });
  };

  return (
    <>
      <div className="ml-auto">
        <Button
          onClick={handleSave}
          disabled={saveWorkflow.isPending}
          size="sm"
        >
          <SaveIcon className="size-4" />
          Save
        </Button>
      </div>
    </>
  );
};

export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const updateWorkflowName = useUpdateWorkflowName();

  const [name, setName] = useState(workflow.name);
  const [isEditing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workflow.name) {
      setName(workflow.name);
    }
  }, [workflow.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (name == workflow.name) {
      setEditing(false);
      return;
    }

    try {
      await updateWorkflowName.mutateAsync({
        id: workflowId,
        newName: name,
      });
    } catch {
      setName(workflow.name);
    } finally {
      setEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key == "Enter") {
      handleSave();
    } else if (e.key == "Escape") {
      setName(workflow.name);
      setEditing(false);
    }
  };

  if (isEditing)
    return (
      <Input
        disabled={updateWorkflowName.isPending}
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 w-auto min-w-[100px] px-2"
      />
    );

  return (
    <BreadcrumbItem
      onClick={() => setEditing(true)}
      className="cursor-pointer hover:text-foreground transition-colors"
    >
      {workflow.name}
    </BreadcrumbItem>
  );
};

export const EditorBreadCrumbs = ({ workflowId }: { workflowId: string }) => {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link prefetch href="/workflows">
                Workflows
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <EditorNameInput workflowId={workflowId} />
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
};
