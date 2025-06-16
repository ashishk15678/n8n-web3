import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NodeData } from "@/types";

// Types
export interface CustomNode {
  id: string;
  name: string;
  description: string;
  code: string;
  metadata?: {
    category?: string;
    tags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// API endpoints
const API = {
  customNodes: {
    list: (projectId: string) => `/api/projects/${projectId}/custom-nodes`,
    create: (projectId: string) => `/api/projects/${projectId}/custom-nodes`,
    update: (projectId: string, nodeId: string) =>
      `/api/projects/${projectId}/custom-nodes/${nodeId}`,
    delete: (projectId: string, nodeId: string) =>
      `/api/projects/${projectId}/custom-nodes/${nodeId}`,
  },
};

// API client functions
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }

  return response.json();
}

// Hook to fetch custom nodes
export function useCustomNodes(projectId: string) {
  return useQuery({
    queryKey: ["customNodes", projectId],
    queryFn: () => fetchAPI<CustomNode[]>(API.customNodes.list(projectId)),
    enabled: !!projectId,
  });
}

// Hook to create a custom node
export function useCreateCustomNode(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<CustomNode, "id" | "createdAt" | "updatedAt">
    ) => {
      return fetchAPI<CustomNode>(API.customNodes.create(projectId), {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customNodes", projectId] });
      toast.success("Custom node created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create custom node");
      console.error(error);
    },
  });
}

// Hook to update a custom node
export function useUpdateCustomNode(projectId: string, nodeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Partial<Omit<CustomNode, "id" | "createdAt" | "updatedAt">>
    ) => {
      return fetchAPI<CustomNode>(API.customNodes.update(projectId, nodeId), {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customNodes", projectId] });
      toast.success("Custom node updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update custom node");
      console.error(error);
    },
  });
}

// Hook to delete a custom node
export function useDeleteCustomNode(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nodeId: string) => {
      return fetchAPI<void>(API.customNodes.delete(projectId, nodeId), {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customNodes", projectId] });
      toast.success("Custom node deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete custom node");
      console.error(error);
    },
  });
}
