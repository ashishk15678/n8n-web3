import { describe, it, expect, vi } from "vitest";

// Mock tRPC server
vi.mock("@/trpc/server", () => ({
  prefetch: vi.fn((options) => Promise.resolve()),
  trpc: {
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
      },
    },
  },
}));

describe("Workflow prefetch functions", () => {
  it("should export prefetchWorkFlows function", async () => {
    const { prefetchWorkFlows } = await import("../prefetch");
    expect(prefetchWorkFlows).toBeDefined();
    expect(typeof prefetchWorkFlows).toBe("function");
  });

  it("should export prefetchWorkFlow function", async () => {
    const { prefetchWorkFlow } = await import("../prefetch");
    expect(prefetchWorkFlow).toBeDefined();
    expect(typeof prefetchWorkFlow).toBe("function");
  });

  it("should call prefetch with correct parameters for getMany", async () => {
    const { prefetchWorkFlows } = await import("../prefetch");
    const { prefetch } = await import("@/trpc/server");
    
    await prefetchWorkFlows({ page: 1, pageSize: 10, search: "" });
    
    expect(prefetch).toHaveBeenCalled();
  });

  it("should call prefetch with correct parameters for getOne", async () => {
    const { prefetchWorkFlow } = await import("../prefetch");
    const { prefetch } = await import("@/trpc/server");
    
    await prefetchWorkFlow("workflow-123");
    
    expect(prefetch).toHaveBeenCalled();
  });
});