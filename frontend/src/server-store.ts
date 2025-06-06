import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Project, User } from "./generated/prisma";
import { Edge, Node } from "@xyflow/react";
import { prisma } from "./lib/db";
import bcrypt from "bcryptjs";

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
  env: {
    get: () => `/api/env`,
    update: (envId: string) => `/api/env/`,
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

// Mutation hook for updating workflow
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
        body: JSON.stringify({
          projectId, // Include projectId in the request body
          nodes,
          edges,
        }),
      });
    },
  });
}

// Query hooks
export function useProject(projectId?: string) {
  if (projectId == undefined || projectId == null) {
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
  const queryClient = useQueryClient();
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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

export function getEnv() {
  return useQuery({
    queryKey: ["env"],
    queryFn: () => fetchAPI<{ env: string }>(API.env.get()),
  });
}

// Add a constant helper string for encryption
const ENCRYPTION_HELPER =
  process.env.ENCRYPTION_HELPER || "n8n-web3-secure-env-helper-2024";

export function encryptEnvValue(envValue: string): string {
  try {
    // Combine the helper string with the env value before encryption
    const combinedValue = `${ENCRYPTION_HELPER}:${envValue}`;
    // Use Buffer's built-in base64 encoding
    return Buffer.from(combinedValue).toString("base64");
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt environment value");
  }
}

export function decryptEnvValue(encryptedEnvValue: string): string {
  try {
    // Decode from base64 using Buffer
    const decrypted = Buffer.from(encryptedEnvValue, "base64").toString();

    // Verify and remove the helper string
    if (!decrypted.startsWith(ENCRYPTION_HELPER + ":")) {
      throw new Error("Invalid encrypted value format");
    }

    // Return the original value without the helper string
    return decrypted.slice(ENCRYPTION_HELPER.length + 1);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt environment value");
  }
}

// Create a separate function for the mutation logic
async function updateEnvMutation({
  envId,
  name,
  value,
}: {
  envId: string;
  name: string;
  value: string;
}) {
  return fetchAPI<{ env: string }>(API.env.update(envId), {
    method: "POST",
    body: JSON.stringify({ envId, name, value }),
  });
}

// Export a hook that can be used in components
export function useUpdateEnv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      envId,
      envName,
      envValue,
    }: {
      envId: string;
      envName: string;
      envValue: string;
    }) => {
      const encryptedEnvValue = encryptEnvValue(envValue);
      return updateEnvMutation({
        envId,
        name: envName,
        value: encryptedEnvValue,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch the env query
      queryClient.invalidateQueries({ queryKey: ["env"] });
    },
  });
}
