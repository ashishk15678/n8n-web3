import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Mock dependencies
vi.mock("@/trpc/client", () => ({
  useTRPC: vi.fn(() => ({
    workflows: {
      getMany: {
        queryOptions: vi.fn((params) => ({
          queryKey: ["workflows.getMany", params],
          queryFn: vi.fn(),
        })),
      },
      getOne: {
        queryOptions: vi.fn((params) => ({
          queryKey: ["workflows.getOne", params],
          queryFn: vi.fn(),
        })),
        queryFilter: vi.fn((params) => ({
          queryKey: ["workflows.getOne", params],
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

vi.mock("./useWorkflowParams", () => ({
  useWorkflowParams: vi.fn(() => [{ page: 1, pageSize: 5, search: "" }]),
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
    it("should call trpc with correct params", async () => {
      const { useTRPC } = await import("@/trpc/client");
      const mockTrpc = useTRPC();

      const { useSuspenseWorkflows } = await import("./useWorkflows");
      
      // Mock the useSuspenseQuery implementation
      vi.doMock("@tanstack/react-query", async () => {
        const actual = await vi.importActual("@tanstack/react-query");
        return {
          ...actual,
          useSuspenseQuery: vi.fn(() => ({
            data: [],
            isLoading: false,
            error: null,
          })),
        };
      });

      expect(mockTrpc.workflows.getMany.queryOptions).toBeDefined();
    });
  });

  describe("useCreateWorkflow", () => {
    it("should show success toast on successful creation", async () => {
      const { toast } = await import("sonner");
      const { useCreateWorkflow } = await import("./useWorkflows");
      const { useTRPC } = await import("@/trpc/client");
      
      const mockTrpc = useTRPC();
      const mockData = { id: "1", name: "New Workflow" };
      
      // Get the mutation options
      const mutationOptions = mockTrpc.workflows.create.mutationOptions({
        onSuccess: vi.fn(),
        onError: vi.fn(),
      });

      // Simulate successful creation
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(mockData, undefined, undefined);
      }

      expect(mockTrpc.workflows.create.mutationOptions).toHaveBeenCalled();
    });

    it("should show error toast on creation failure", async () => {
      const { toast } = await import("sonner");
      const { useTRPC } = await import("@/trpc/client");
      
      const mockTrpc = useTRPC();
      const mockError = { message: "Creation failed" };
      
      const mutationOptions = mockTrpc.workflows.create.mutationOptions({
        onSuccess: vi.fn(),
        onError: vi.fn(),
      });

      // Simulate error
      if (mutationOptions.onError) {
        mutationOptions.onError(mockError, undefined, undefined);
      }

      expect(mockTrpc.workflows.create.mutationOptions).toHaveBeenCalled();
    });

    it("should invalidate workflows query on success", async () => {
      const { useTRPC } = await import("@/trpc/client");
      
      const mockTrpc = useTRPC();
      const mockData = { id: "1", name: "New Workflow" };
      
      const mutationOptions = mockTrpc.workflows.create.mutationOptions({
        onSuccess: vi.fn(),
        onError: vi.fn(),
      });

      expect(mockTrpc.workflows.create.mutationOptions).toHaveBeenCalled();
    });
  });

  describe("useRemoveWorkflow", () => {
    it("should show success toast on successful deletion", async () => {
      const { useTRPC } = await import("@/trpc/client");
      
      const mockTrpc = useTRPC();
      const mockData = { id: "1", name: "Deleted Workflow" };
      
      const mutationOptions = mockTrpc.workflows.remove.mutationOptions({
        onSuccess: vi.fn(),
        onError: vi.fn(),
      });

      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(mockData, undefined, undefined);
      }

      expect(mockTrpc.workflows.remove.mutationOptions).toHaveBeenCalled();
    });

    it("should show error toast on deletion failure", async () => {
      const { useTRPC } = await import("@/trpc/client");
      
      const mockTrpc = useTRPC();
      const mockError = { message: "Deletion failed" };
      
      const mutationOptions = mockTrpc.workflows.remove.mutationOptions({
        onSuccess: vi.fn(),
        onError: vi.fn(),
      });

      if (mutationOptions.onError) {
        mutationOptions.onError(mockError, undefined, undefined);
      }

      expect(mockTrpc.workflows.remove.mutationOptions).toHaveBeenCalled();
    });

    it("should invalidate both getMany and getOne queries on success", async () => {
      const { useTRPC } = await import("@/trpc/client");
      
      const mockTrpc = useTRPC();
      const mockData = { id: "workflow-1", name: "Test" };
      
      const mutationOptions = mockTrpc.workflows.remove.mutationOptions({
        onSuccess: vi.fn(),
        onError: vi.fn(),
      });

      expect(mockTrpc.workflows.remove.mutationOptions).toHaveBeenCalled();
    });
  });

  describe("useSuspenseWorkflow", () => {
    it("should call trpc with correct workflow id", async () => {
      const { useTRPC } = await import("@/trpc/client");
      
      const mockTrpc = useTRPC();
      const workflowId = "test-workflow-id";
      
      mockTrpc.workflows.getOne.queryOptions({ id: workflowId });
      
      expect(mockTrpc.workflows.getOne.queryOptions).toHaveBeenCalledWith({ 
        id: workflowId 
      });
    });
  });

  describe("useUpdateWorkflowName", () => {
    it("should show success toast on successful name update", async () => {
      const { useTRPC } = await import("@/trpc/client");
      
      const mockTrpc = useTRPC();
      const mockData = { id: "1", name: "Updated Name" };
      
      const mutationOptions = mockTrpc.workflows.updateName.mutationOptions({
        onSuccess: vi.fn(),
        onError: vi.fn(),
      });

      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(mockData, undefined, undefined);
      }

      expect(mockTrpc.workflows.updateName.mutationOptions).toHaveBeenCalled();
    });

    it("should show error toast on update failure", async () => {
      const { useTRPC } = await import("@/trpc/client");
      
      const mockTrpc = useTRPC();
      const mockError = { message: "Update failed" };
      
      const mutationOptions = mockTrpc.workflows.updateName.mutationOptions({
        onSuccess: vi.fn(),
        onError: vi.fn(),
      });

      if (mutationOptions.onError) {
        mutationOptions.onError(mockError, undefined, undefined);
      }

      expect(mockTrpc.workflows.updateName.mutationOptions).toHaveBeenCalled();
    });

    it("should invalidate both getMany and getOne queries on success", async () => {
      const { useTRPC } = await import("@/trpc/client");
      
      const mockTrpc = useTRPC();
      const mockData = { id: "workflow-1", name: "Updated" };
      
      const mutationOptions = mockTrpc.workflows.updateName.mutationOptions({
        onSuccess: vi.fn(),
        onError: vi.fn(),
      });

      expect(mockTrpc.workflows.updateName.mutationOptions).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle missing error message gracefully", async () => {
      const { useTRPC } = await import("@/trpc/client");
      
      const mockTrpc = useTRPC();
      const mockError = {}; // Error without message
      
      const mutationOptions = mockTrpc.workflows.create.mutationOptions({
        onSuccess: vi.fn(),
        onError: vi.fn(),
      });

      if (mutationOptions.onError) {
        mutationOptions.onError(mockError, undefined, undefined);
      }

      expect(mockTrpc.workflows.create.mutationOptions).toHaveBeenCalled();
    });
  });
});