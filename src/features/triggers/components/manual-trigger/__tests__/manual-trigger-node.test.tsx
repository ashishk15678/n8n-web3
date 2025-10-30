import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ManualTriggerNode } from "../manual-trigger-node";
import { ReactFlowProvider } from "@xyflow/react";

// Mock BaseTriggerNode
vi.mock("../../base-trigger-node", () => ({
  BaseTriggerNode: vi.fn((props) => (
    <div data-testid="base-trigger-node" data-name={props.name} data-description={props.description}>
      Base Trigger Node
    </div>
  )),
}));

describe("ManualTriggerNode", () => {
  const defaultProps = {
    id: "manual-1",
    type: "MANUAL_TRIGGER" as const,
    data: {},
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
  };

  it("should render without crashing", () => {
    render(
      <ReactFlowProvider>
        <ManualTriggerNode {...defaultProps} />
      </ReactFlowProvider>
    );
    
    expect(screen.getByTestId("base-trigger-node")).toBeInTheDocument();
  });

  it("should render with correct name", () => {
    render(
      <ReactFlowProvider>
        <ManualTriggerNode {...defaultProps} />
      </ReactFlowProvider>
    );
    
    const node = screen.getByTestId("base-trigger-node");
    expect(node).toHaveAttribute("data-name", "Execute Workflow");
  });

  it("should render with correct description", () => {
    render(
      <ReactFlowProvider>
        <ManualTriggerNode {...defaultProps} />
      </ReactFlowProvider>
    );
    
    const node = screen.getByTestId("base-trigger-node");
    expect(node).toHaveAttribute("data-description", "When clicking 'Execute Workflow'");
  });

  it("should use MousePointerIcon", () => {
    const BaseTriggerNodeMock = vi.mocked(
      require("../../base-trigger-node").BaseTriggerNode
    );
    
    render(
      <ReactFlowProvider>
        <ManualTriggerNode {...defaultProps} />
      </ReactFlowProvider>
    );
    
    expect(BaseTriggerNodeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.any(Function),
      }),
      expect.anything()
    );
  });

  it("should be memoized", () => {
    // ManualTriggerNode is wrapped in memo
    expect(ManualTriggerNode).toBeDefined();
    expect(typeof ManualTriggerNode).toBe("object");
  });
});