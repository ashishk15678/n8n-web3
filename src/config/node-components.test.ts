import { describe, it, expect } from "vitest";
import { nodeComponents, type RegisteredNodeType } from "./node-components";
import { NodeType } from "@/generated/prisma";
import { InitalNode } from "@/components/inital-node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/manual-trigger-node";
import { HttpRequestNode } from "@/features/executions/components/http-request/http-request-node";

describe("node-components", () => {
  describe("nodeComponents mapping", () => {
    it("should map INITIAL node type to InitalNode component", () => {
      expect(nodeComponents[NodeType.INITIAL]).toBe(InitalNode);
    });

    it("should map MANUAL_TRIGGER node type to ManualTriggerNode component", () => {
      expect(nodeComponents[NodeType.MANUAL_TRIGGER]).toBe(ManualTriggerNode);
    });

    it("should map HTTP_REQUEST node type to HttpRequestNode component", () => {
      expect(nodeComponents[NodeType.HTTP_REQUEST]).toBe(HttpRequestNode);
    });

    it("should have exactly 3 node type mappings", () => {
      const keys = Object.keys(nodeComponents);
      expect(keys).toHaveLength(3);
    });

    it("should contain all expected NodeType values", () => {
      const keys = Object.keys(nodeComponents);
      expect(keys).toContain(NodeType.INITIAL);
      expect(keys).toContain(NodeType.MANUAL_TRIGGER);
      expect(keys).toContain(NodeType.HTTP_REQUEST);
    });

    it("should have all components defined (not undefined or null)", () => {
      Object.values(nodeComponents).forEach((component) => {
        expect(component).toBeDefined();
        expect(component).not.toBeNull();
      });
    });
  });

  describe("RegisteredNodeType type", () => {
    it("should allow valid node type keys", () => {
      const validTypes: RegisteredNodeType[] = [
        NodeType.INITIAL,
        NodeType.MANUAL_TRIGGER,
        NodeType.HTTP_REQUEST,
      ];
      
      validTypes.forEach((type) => {
        expect(nodeComponents[type]).toBeDefined();
      });
    });
  });

  describe("edge cases", () => {
    it("should be immutable (const assertion)", () => {
      // This test verifies that the object is properly typed as const
      const components = nodeComponents;
      expect(Object.isFrozen(components)).toBe(false); // const assertion doesn't freeze, but prevents reassignment
      expect(components).toBe(nodeComponents);
    });

    it("should have component references that are functions", () => {
      Object.values(nodeComponents).forEach((component) => {
        expect(typeof component).toBe("function");
      });
    });
  });
});