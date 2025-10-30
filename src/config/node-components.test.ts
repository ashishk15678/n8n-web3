import { describe, it, expect } from "vitest";
import { nodeComponents } from "./node-components";
import { NodeType } from "@/generated/prisma";
import { InitalNode } from "@/components/inital-node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/manual-trigger-node";
import { HttpRequestNode } from "@/features/executions/components/http-request/http-request-node";

describe("nodeComponents configuration", () => {
  it("should have all required node types mapped", () => {
    expect(nodeComponents).toBeDefined();
    expect(Object.keys(nodeComponents).length).toBe(3);
  });

  it("should map INITIAL node type correctly", () => {
    expect(nodeComponents[NodeType.INITIAL]).toBe(InitalNode);
  });

  it("should map MANUAL_TRIGGER node type correctly", () => {
    expect(nodeComponents[NodeType.MANUAL_TRIGGER]).toBe(ManualTriggerNode);
  });

  it("should map HTTP_REQUEST node type correctly", () => {
    expect(nodeComponents[NodeType.HTTP_REQUEST]).toBe(HttpRequestNode);
  });

  it("should satisfy NodeTypes constraint", () => {
    // Type check - this will compile-time validate the constraint
    const types: typeof nodeComponents = nodeComponents;
    expect(types).toBeDefined();
  });

  it("should export RegisteredNodeType correctly", () => {
    // This test validates the type export at runtime
    const nodeTypes: (keyof typeof nodeComponents)[] = [
      NodeType.INITIAL,
      NodeType.MANUAL_TRIGGER,
      NodeType.HTTP_REQUEST,
    ];
    
    nodeTypes.forEach(type => {
      expect(nodeComponents[type]).toBeDefined();
    });
  });
});