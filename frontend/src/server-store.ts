import { useMutation, useQuery } from "@tanstack/react-query";
import { Project, User } from "./generated/prisma";
import { Edge, Node } from "@xyflow/react";
import { prisma } from "./lib/db";

// API endpoints
const API = {
  projects: {
    list: () => `/api/projects`,
    create: "/api/projects",
    get: (projectId: string) => `/api/projects?projectId=${projectId}`,
    update: (projectId: string) => `/api/projects/${projectId}/workflow`,
  },
  users: {
    get: () => `/api/user`,
    create: "/api/users",
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

// Direct database update function
async function updateProjectNodesAndEdges(
  projectId: string,
  nodes: Node[],
  edges: Edge[]
) {
  if (!prisma) throw new Error("Prisma client not initialized");

  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      nodes: nodes as any,
      edges: edges as any,
    },
  });
}

// Single mutation hook for updating workflow
export function useUpdateWorkflow() {
  return useMutation({
    mutationFn: async ({
      projectId,
      nodes,
      edges,
    }: {
      projectId: string;
      nodes: Node[];
      edges: Edge[];
    }) => {
      return fetchAPI(API.projects.update(projectId), {
        method: "PUT",
        body: JSON.stringify({ nodes, edges }),
      });
    },
  });
}

// Query hooks
export function useProject(projectId: string | undefined) {
  if (projectId == undefined) {
    return useQuery({
      queryKey: ["projects"],
      queryFn: () => fetchAPI<Project[]>(API.projects.list()),
    });
  }

  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchAPI<Project>(API.projects.get(projectId)),
  });
}

// New hook to fetch workflow data
export function useWorkflow(projectId: string | undefined) {
  return useQuery({
    queryKey: ["workflow", projectId],
    queryFn: () =>
      fetchAPI<{ nodes: Node[]; edges: Edge[] }>(
        API.projects.update(projectId!)
      ),
    enabled: !!projectId,
  });
}

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => fetchAPI<User>(API.users.get()),
  });
}

// Mutation hooks
export function useCreateProject() {
  return useMutation({
    mutationFn: async ({
      userId,
      project,
    }: {
      userId: string;
      project: Project;
    }) => {
      return fetchAPI<Project>(API.projects.create, {
        method: "POST",
        body: JSON.stringify({ userId, project }),
      });
    },
  });
}

export function useCreateUser() {
  return useMutation({
    mutationFn: async (user: User) => {
      return fetchAPI<User>(API.users.create, {
        method: "POST",
        body: JSON.stringify(user),
      });
    },
  });
}
