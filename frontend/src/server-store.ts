import { useMutation, useQuery } from "@tanstack/react-query";
import { Project, User } from "./generated/prisma";

// API endpoints
const API = {
  projects: {
    list: () => `/api/projects`,
    create: "/api/projects",
    get: (projectId: string) => `/api/projects?projectId=${projectId}`,
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
