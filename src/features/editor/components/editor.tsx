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
  useUpdateWorkflowName,
} from "@/features/workflow/hooks/useWorkflows";
import { SaveIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export const EditorLoading = () => <LoadingView message="Loading Editor..." />;

export const EditorError = () => <ErrorView message="Error loading editor." />;

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  return <pre>{JSON.stringify(workflow, null, 2)}</pre>;
};

export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background ">
        <SidebarTrigger />
        <div className="flex flex-row items-center justify-between w-full">
          <EditorBreadCrumbs workflowId={workflowId} />
          <EditorSaveButton workflowId={workflowId} />
        </div>
      </header>
    </>
  );
};

export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
  return (
    <>
      <div className="ml-auto">
        <Button onClick={() => {}} disabled={false} size="sm">
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
