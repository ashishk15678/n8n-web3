import { describe, it, expect, vi, beforeEach } from "vitest";
import { prefetchWorkFlows, prefetchWorkFlow } from "./prefetch";

// Mock the tRPC server module
vi.mock("@/trpc/server", () => ({
  prefetch: vi.fn(),
  trpc: {
    workflows: {
      getMany: {
        queryOptions: vi.fn((params) => ({ queryKey: ["workflows.getMany", params] })),
      },
      getOne: {
        queryOptions: vi.fn((params) => ({ queryKey: ["workflows.getOne", params] })),
      },
    },
  },
}));

describe("prefetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("prefetchWorkFlows", () => {
    it("should call prefetch with correct query options for default params", async () => {
      const { prefetch, trpc } = await import("@/trpc/server");
      const params = { page: 1, pageSize: 5, search: "" };
      
      await prefetchWorkFlows(params);
      
      expect(trpc.workflows.getMany.queryOptions).toHaveBeenCalledWith(params);
      expect(prefetch).toHaveBeenCalledWith({ queryKey: ["workflows.getMany", params] });
    });

    it("should handle custom page parameter", async () => {
      const { prefetch, trpc } = await import("@/trpc/server");
      const params = { page: 3, pageSize: 10, search: "test" };
      
      await prefetchWorkFlows(params);
      
      expect(trpc.workflows.getMany.queryOptions).toHaveBeenCalledWith(params);
    });

    it("should handle search parameter", async () => {
      const { prefetch, trpc } = await import("@/trpc/server");
      const params = { page: 1, pageSize: 5, search: "workflow name" };
      
      await prefetchWorkFlows(params);
      
      expect(trpc.workflows.getMany.queryOptions).toHaveBeenCalledWith(params);
    });

    it("should handle empty search string", async () => {
      const { prefetch, trpc } = await import("@/trpc/server");
      const params = { page: 1, pageSize: 5, search: "" };
      
      await prefetchWorkFlows(params);
      
      expect(trpc.workflows.getMany.queryOptions).toHaveBeenCalledWith(params);
    });

    it("should handle maximum page size", async () => {
      const { prefetch, trpc } = await import("@/trpc/server");
      const params = { page: 1, pageSize: 100, search: "" };
      
      await prefetchWorkFlows(params);
      
      expect(trpc.workflows.getMany.queryOptions).toHaveBeenCalledWith(params);
    });
  });

  describe("prefetchWorkFlow", () => {
    it("should call prefetch with correct query options for single workflow", async () => {
      const { prefetch, trpc } = await import("@/trpc/server");
      const workflowId = "test-workflow-123";
      
      await prefetchWorkFlow(workflowId);
      
      expect(trpc.workflows.getOne.queryOptions).toHaveBeenCalledWith({ id: workflowId });
      expect(prefetch).toHaveBeenCalledWith({ 
        queryKey: ["workflows.getOne", { id: workflowId }] 
      });
    });

    it("should handle different workflow IDs", async () => {
      const { prefetch, trpc } = await import("@/trpc/server");
      const workflowIds = ["id-1", "id-2", "workflow-xyz"];
      
      for (const id of workflowIds) {
        await prefetchWorkFlow(id);
        expect(trpc.workflows.getOne.queryOptions).toHaveBeenCalledWith({ id });
      }
    });

    it("should handle CUID format workflow IDs", async () => {
      const { prefetch, trpc } = await import("@/trpc/server");
      const cuidId = "clxyz123456789";
      
      await prefetchWorkFlow(cuidId);
      
      expect(trpc.workflows.getOne.queryOptions).toHaveBeenCalledWith({ id: cuidId });
    });
  });

  describe("edge cases", () => {
    it("should handle special characters in search", async () => {
      const { trpc } = await import("@/trpc/server");
      const params = { page: 1, pageSize: 5, search: "test-workflow @#$%" };
      
      await prefetchWorkFlows(params);
      
      expect(trpc.workflows.getMany.queryOptions).toHaveBeenCalledWith(params);
    });

    it("should handle very long search strings", async () => {
      const { trpc } = await import("@/trpc/server");
      const longSearch = "a".repeat(1000);
      const params = { page: 1, pageSize: 5, search: longSearch };
      
      await prefetchWorkFlows(params);
      
      expect(trpc.workflows.getMany.queryOptions).toHaveBeenCalledWith(params);
    });
  });
});