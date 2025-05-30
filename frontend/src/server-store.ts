import { useMutation, useQuery } from "@tanstack/react-query";
import { Project, User } from "./generated/prisma";

// API endpoints
const API = {
  projects: {
    list: (userId: string) => `/api/projects?userId=${userId}`,
    create: "/api/projects",
  },
  users: {
    get: (id: string) => `/api/users/${id}`,
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
export function useProject(userId: string) {
  return useQuery({
    queryKey: ["project", userId],
    queryFn: () => fetchAPI<Project[]>(API.projects.list(userId)),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchAPI<User>(API.users.get(userId)),
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
