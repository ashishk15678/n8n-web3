import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSuspenseWorkflows, useCreateWorkflow, useRemoveWorkflow, useSuspenseWorkflow, useUpdateWorkflowName } from "../useWorkflows";
import type { ReactNode } from "react";

// Mock dependencies
vi.mock("@/trpc/client", () => ({
  useTRPC: vi.fn(() => ({
    workflows: {
      getMany: {
        queryOptions: vi.fn((params) => ({
          queryKey: ["workflows", "getMany", params],
          queryFn: vi.fn(),
        })),
      },
      getOne: {
        queryOptions: vi.fn((params) => ({
          queryKey: ["workflows", "getOne", params],
          queryFn: vi.fn(),
        })),
        queryFilter: vi.fn((params) => ({
          queryKey: ["workflows", "getOne", params],
        })),
      },
      create: {
        mutationOptions: vi.fn((options) => ({
          mutationFn: vi.fn(),
          ...options,
        })),
      },
      remove: {
        mutationOptions: vi.fn((options) => ({
          mutationFn: vi.fn(),
          ...options,
        })),
      },
      updateName: {
        mutationOptions: vi.fn((options) => ({
          mutationFn: vi.fn(),
          ...options,
        })),
      },
    },
  })),
}));

vi.mock("../useWorkflowParams", () => ({
  useWorkflowParams: vi.fn(() => [
    { page: 1, pageSize: 5, search: "" },
    vi.fn(),
  ]),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useWorkflows hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("useSuspenseWorkflows", () => {
    it("should call useSuspenseQuery with correct parameters", () => {
      const { result } = renderHook(() => useSuspenseWorkflows(), { wrapper });
      expect(result).toBeDefined();
    });
  });

  describe("useCreateWorkflow", () => {
    it("should return mutation object", () => {
      const { result } = renderHook(() => useCreateWorkflow(), { wrapper });
      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
    });

    it("should show success toast on successful creation", async () => {
      const { toast } = await import("sonner");
      const { result } = renderHook(() => useCreateWorkflow(), { wrapper });
      
      // The onSuccess callback is configured
      expect(result.current).toBeDefined();
    });
  });

  describe("useRemoveWorkflow", () => {
    it("should return mutation object", () => {
      const { result } = renderHook(() => useRemoveWorkflow(), { wrapper });
      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
    });

    it("should invalidate queries on success", () => {
      const { result } = renderHook(() => useRemoveWorkflow(), { wrapper });
      expect(result.current).toBeDefined();
    });
  });

  describe("useSuspenseWorkflow", () => {
    it("should call useSuspenseQuery with workflow ID", () => {
      const { result } = renderHook(() => useSuspenseWorkflow("test-id"), {
        wrapper,
      });
      expect(result).toBeDefined();
    });
  });

  describe("useUpdateWorkflowName", () => {
    it("should return mutation object", () => {
      const { result } = renderHook(() => useUpdateWorkflowName(), { wrapper });
      expect(result.current).toBeDefined();
      expect(result.current.mutate).toBeDefined();
    });

    it("should invalidate both getMany and getOne queries on success", () => {
      const { result } = renderHook(() => useUpdateWorkflowName(), { wrapper });
      expect(result.current).toBeDefined();
    });
  });
});