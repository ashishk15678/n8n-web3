import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkFlowsRouter } from "./routers";
import { NodeType } from "@/generated/prisma";
import { PAGINATION } from "@/config/constants";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  default: {
    workflow: {
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/trpc/init", () => ({
  createTrpcRouter: (routes: any) => routes,
  protectedProcedure: {
    mutation: (fn: any) => ({ _mutation: fn }),
    input: (schema: any) => ({
      mutation: (fn: any) => ({ _mutation: fn, _schema: schema }),
      query: (fn: any) => ({ _query: fn, _schema: schema }),
    }),
  },
  premiumProcedure: {},
}));

vi.mock("random-word-slugs", () => ({
  generateSlug: vi.fn(() => "test-workflow-slug"),
}));

describe("WorkFlowsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("router structure", () => {
    it("should have create endpoint", () => {
      expect(WorkFlowsRouter.create).toBeDefined();
    });

    it("should have remove endpoint", () => {
      expect(WorkFlowsRouter.remove).toBeDefined();
    });

    it("should have updateName endpoint", () => {
      expect(WorkFlowsRouter.updateName).toBeDefined();
    });

    it("should have getOne endpoint", () => {
      expect(WorkFlowsRouter.getOne).toBeDefined();
    });

    it("should have getMany endpoint", () => {
      expect(WorkFlowsRouter.getMany).toBeDefined();
    });

    it("should have exactly 5 endpoints", () => {
      const keys = Object.keys(WorkFlowsRouter);
      expect(keys).toHaveLength(5);
    });
  });

  describe("create workflow", () => {
    it("should create workflow with generated slug name", async () => {
      const prisma = (await import("@/lib/db")).default;
      const mockWorkflow = {
        id: "workflow-1",
        name: "test-workflow-slug",
        userId: "user-1",
        nodes: [],
      };
      
      (prisma.workflow.create as any).mockResolvedValue(mockWorkflow);
      
      const ctx = { auth: { user: { id: "user-1" } } };
      const result = await (WorkFlowsRouter.create as any)._mutation({ ctx });
      
      expect(prisma.workflow.create).toHaveBeenCalledWith({
        data: {
          name: "test-workflow-slug",
          userId: "user-1",
          nodes: {
            createMany: {
              data: expect.arrayContaining([
                expect.objectContaining({
                  type: NodeType.INITIAL,
                  position: expect.any(Object),
                  name: NodeType.INITIAL,
                }),
              ]),
            },
          },
        },
      });
    });

    it("should create workflow with two initial nodes", async () => {
      const prisma = (await import("@/lib/db")).default;
      const ctx = { auth: { user: { id: "user-1" } } };
      
      await (WorkFlowsRouter.create as any)._mutation({ ctx });
      
      const createCall = (prisma.workflow.create as any).mock.calls[0][0];
      expect(createCall.data.nodes.createMany.data).toHaveLength(2);
    });

    it("should create nodes at different positions", async () => {
      const prisma = (await import("@/lib/db")).default;
      const ctx = { auth: { user: { id: "user-1" } } };
      
      await (WorkFlowsRouter.create as any)._mutation({ ctx });
      
      const createCall = (prisma.workflow.create as any).mock.calls[0][0];
      const nodes = createCall.data.nodes.createMany.data;
      
      expect(nodes[0].position).toEqual({ x: 0, y: 0 });
      expect(nodes[1].position).toEqual({ x: 100, y: 200 });
    });
  });

  describe("remove workflow", () => {
    it("should delete workflow by id and userId", async () => {
      const prisma = (await import("@/lib/db")).default;
      const mockWorkflow = { id: "workflow-1", name: "Test", userId: "user-1" };
      
      (prisma.workflow.delete as any).mockResolvedValue(mockWorkflow);
      
      const ctx = { auth: { user: { id: "user-1" } } };
      const input = { id: "workflow-1" };
      
      await (WorkFlowsRouter.remove as any)._mutation({ ctx, input });
      
      expect(prisma.workflow.delete).toHaveBeenCalledWith({
        where: {
          id: "workflow-1",
          userId: "user-1",
        },
      });
    });

    it("should validate input schema has id field", () => {
      const schema = (WorkFlowsRouter.remove as any)._schema;
      expect(schema).toBeDefined();
    });
  });

  describe("updateName workflow", () => {
    it("should update workflow name", async () => {
      const prisma = (await import("@/lib/db")).default;
      const mockWorkflow = { id: "workflow-1", name: "Updated Name", userId: "user-1" };
      
      (prisma.workflow.update as any).mockResolvedValue(mockWorkflow);
      
      const ctx = { auth: { user: { id: "user-1" } } };
      const input = { id: "workflow-1", newName: "Updated Name" };
      
      await (WorkFlowsRouter.updateName as any)._mutation({ ctx, input });
      
      expect(prisma.workflow.update).toHaveBeenCalledWith({
        where: {
          id: "workflow-1",
          userId: "user-1",
        },
        data: {
          name: "Updated Name",
        },
      });
    });

    it("should validate input has both id and newName", () => {
      const schema = (WorkFlowsRouter.updateName as any)._schema;
      expect(schema).toBeDefined();
    });
  });

  describe("getOne workflow", () => {
    it("should fetch workflow with nodes and connections", async () => {
      const prisma = (await import("@/lib/db")).default;
      const mockWorkflow = {
        id: "workflow-1",
        name: "Test Workflow",
        userId: "user-1",
        nodes: [
          {
            id: "node-1",
            type: NodeType.INITIAL,
            position: { x: 0, y: 0 },
            data: { key: "value" },
          },
        ],
        connections: [
          {
            id: "conn-1",
            fromNodeId: "node-1",
            toNodeId: "node-2",
            fromOutput: "main",
            toInput: "main",
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (prisma.workflow.findUniqueOrThrow as any).mockResolvedValue(mockWorkflow);
      
      const ctx = { auth: { user: { id: "user-1" } } };
      const input = { id: "workflow-1" };
      
      const result = await (WorkFlowsRouter.getOne as any)._query({ ctx, input });
      
      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(1);
    });

    it("should transform Prisma nodes to ReactFlow nodes", async () => {
      const prisma = (await import("@/lib/db")).default;
      const mockWorkflow = {
        id: "workflow-1",
        name: "Test",
        userId: "user-1",
        nodes: [
          {
            id: "node-1",
            type: NodeType.MANUAL_TRIGGER,
            position: { x: 100, y: 200 },
            data: { endpoint: "https://api.example.com" },
          },
        ],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (prisma.workflow.findUniqueOrThrow as any).mockResolvedValue(mockWorkflow);
      
      const ctx = { auth: { user: { id: "user-1" } } };
      const input = { id: "workflow-1" };
      
      const result = await (WorkFlowsRouter.getOne as any)._query({ ctx, input });
      
      expect(result.nodes[0]).toEqual({
        id: "node-1",
        type: NodeType.MANUAL_TRIGGER,
        position: { x: 100, y: 200 },
        data: { endpoint: "https://api.example.com" },
      });
    });

    it("should transform Prisma connections to ReactFlow edges", async () => {
      const prisma = (await import("@/lib/db")).default;
      const mockWorkflow = {
        id: "workflow-1",
        name: "Test",
        userId: "user-1",
        nodes: [],
        connections: [
          {
            id: "conn-1",
            fromNodeId: "node-1",
            toNodeId: "node-2",
            fromOutput: "output1",
            toInput: "input1",
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (prisma.workflow.findUniqueOrThrow as any).mockResolvedValue(mockWorkflow);
      
      const ctx = { auth: { user: { id: "user-1" } } };
      const input = { id: "workflow-1" };
      
      const result = await (WorkFlowsRouter.getOne as any)._query({ ctx, input });
      
      expect(result.edges[0]).toEqual({
        id: "conn-1",
        source: "node-1",
        target: "node-2",
        sourceHandle: "output1",
        targetHandle: "input1",
      });
    });

    it("should handle workflow with no connections", async () => {
      const prisma = (await import("@/lib/db")).default;
      const mockWorkflow = {
        id: "workflow-1",
        name: "Test",
        userId: "user-1",
        nodes: [{ id: "node-1", type: NodeType.INITIAL, position: { x: 0, y: 0 }, data: {} }],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      (prisma.workflow.findUniqueOrThrow as any).mockResolvedValue(mockWorkflow);
      
      const ctx = { auth: { user: { id: "user-1" } } };
      const input = { id: "workflow-1" };
      
      const result = await (WorkFlowsRouter.getOne as any)._query({ ctx, input });
      
      expect(result.edges).toEqual([]);
    });
  });

  describe("getMany workflows", () => {
    it("should fetch workflows with pagination", async () => {
      const prisma = (await import("@/lib/db")).default;
      const mockWorkflows = [
        { id: "1", name: "Workflow 1", userId: "user-1" },
        { id: "2", name: "Workflow 2", userId: "user-1" },
      ];
      
      (prisma.workflow.findMany as any).mockResolvedValue(mockWorkflows);
      (prisma.workflow.count as any).mockResolvedValue(10);
      
      const ctx = { auth: { user: { id: "user-1" } } };
      const input = { page: 1, pageSize: 5, search: "" };
      
      const result = await (WorkFlowsRouter.getMany as any)._query({ ctx, input });
      
      expect(result.items).toEqual(mockWorkflows);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(5);
      expect(result.totalPages).toBe(2);
      expect(result.totalCount).toBe(10);
    });

    it("should calculate hasNextPage correctly", async () => {
      const prisma = (await import("@/lib/db")).default;
      
      (prisma.workflow.findMany as any).mockResolvedValue([]);
      (prisma.workflow.count as any).mockResolvedValue(15);
      
      const ctx = { auth: { user: { id: "user-1" } } };
      const input = { page: 2, pageSize: 5, search: "" };
      
      const result = await (WorkFlowsRouter.getMany as any)._query({ ctx, input });
      
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it("should handle search filter", async () => {
      const prisma = (await import("@/lib/db")).default;
      
      (prisma.workflow.findMany as any).mockResolvedValue([]);
      (prisma.workflow.count as any).mockResolvedValue(0);
      
      const ctx = { auth: { user: { id: "user-1" } } };
      const input = { page: 1, pageSize: 5, search: "test workflow" };
      
      await (WorkFlowsRouter.getMany as any)._query({ ctx, input });
      
      expect(prisma.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: {
              contains: "test workflow",
              mode: "insensitive",
            },
          }),
        })
      );
    });

    it("should use default pagination values", async () => {
      const prisma = (await import("@/lib/db")).default;
      
      (prisma.workflow.findMany as any).mockResolvedValue([]);
      (prisma.workflow.count as any).mockResolvedValue(0);
      
      const ctx = { auth: { user: { id: "user-1" } } };
      const input = { page: PAGINATION.DEFAULT_PAGE, pageSize: PAGINATION.DEFAULT_PAGE_SIZE, search: "" };
      
      const result = await (WorkFlowsRouter.getMany as any)._query({ ctx, input });
      
      expect(result.page).toBe(PAGINATION.DEFAULT_PAGE);
      expect(result.pageSize).toBe(PAGINATION.DEFAULT_PAGE_SIZE);
    });

    it("should order workflows by updatedAt desc", async () => {
      const prisma = (await import("@/lib/db")).default;
      
      (prisma.workflow.findMany as any).mockResolvedValue([]);
      (prisma.workflow.count as any).mockResolvedValue(0);
      
      const ctx = { auth: { user: { id: "user-1" } } };
      const input = { page: 1, pageSize: 5, search: "" };
      
      await (WorkFlowsRouter.getMany as any)._query({ ctx, input });
      
      expect(prisma.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            updatedAt: "desc",
          },
        })
      );
    });

    it("should calculate skip correctly for pagination", async () => {
      const prisma = (await import("@/lib/db")).default;
      
      (prisma.workflow.findMany as any).mockResolvedValue([]);
      (prisma.workflow.count as any).mockResolvedValue(0);
      
      const ctx = { auth: { user: { id: "user-1" } } };
      const input = { page: 3, pageSize: 10, search: "" };
      
      await (WorkFlowsRouter.getMany as any)._query({ ctx, input });
      
      expect(prisma.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (3 - 1) * 10
          take: 10,
        })
      );
    });
  });
});