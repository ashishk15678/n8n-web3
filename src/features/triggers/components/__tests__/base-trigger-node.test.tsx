import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BaseTriggerNode } from "../base-trigger-node";
import { ReactFlowProvider } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";

// Mock dependencies
vi.mock("@/components/workflow-node", () => ({
  WorkflowNode: vi.fn(({ children }) => (
    <div data-testid="workflow-node">{children}</div>
  )),
}));

vi.mock("@/components/reactflow/base-node", () => ({
  BaseNode: vi.fn(({ children, className, onDoubleClick }) => (
    <div data-testid="base-node" className={className} onDoubleClick={onDoubleClick}>
      {children}
    </div>
  )),
  BaseNodeContent: vi.fn(({ children }) => (
    <div data-testid="base-node-content">{children}</div>
  )),
}));

vi.mock("@/components/reactflow/base-handle", () => ({
  BaseHandle: vi.fn(({ id, type, position }) => (
    <div data-testid={`handle-${type}`} data-id={id} data-position={position} />
  )),
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

describe("BaseTriggerNode", () => {
  const defaultProps = {
    id: "trigger-1",
    type: "MANUAL_TRIGGER" as const,
    data: {},
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    icon: MousePointerIcon,
    name: "Manual Trigger",
  };

  it("should render without crashing", () => {
    render(
      <ReactFlowProvider>
        <BaseTriggerNode {...defaultProps} />
      </ReactFlowProvider>
    );
    
    expect(screen.getByTestId("workflow-node")).toBeInTheDocument();
    expect(screen.getByTestId("base-node")).toBeInTheDocument();
  });

  it("should render with LucideIcon", () => {
    render(
      <ReactFlowProvider>
        <BaseTriggerNode {...defaultProps} />
      </ReactFlowProvider>
    );
    
    const content = screen.getByTestId("base-node-content");
    expect(content).toBeInTheDocument();
  });

  it("should render with string icon (image path)", () => {
    render(
      <ReactFlowProvider>
        <BaseTriggerNode {...defaultProps} icon="/icon.png" />
      </ReactFlowProvider>
    );
    
    const image = screen.getByAltText("Manual Trigger");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/icon.png");
  });

  it("should render children when provided", () => {
    render(
      <ReactFlowProvider>
        <BaseTriggerNode {...defaultProps}>
          <div>Custom Content</div>
        </BaseTriggerNode>
      </ReactFlowProvider>
    );
    
    expect(screen.getByText("Custom Content")).toBeInTheDocument();
  });

  it("should only render source handle (no target)", () => {
    render(
      <ReactFlowProvider>
        <BaseTriggerNode {...defaultProps} />
      </ReactFlowProvider>
    );
    
    expect(screen.getByTestId("handle-source")).toBeInTheDocument();
    expect(screen.queryByTestId("handle-target")).not.toBeInTheDocument();
  });

  it("should apply rounded-l-2xl class to BaseNode", () => {
    render(
      <ReactFlowProvider>
        <BaseTriggerNode {...defaultProps} />
      </ReactFlowProvider>
    );
    
    const baseNode = screen.getByTestId("base-node");
    expect(baseNode).toHaveClass("rounded-l-2xl");
  });

  it("should have displayName", () => {
    expect(BaseTriggerNode.displayName).toBe("BaseTriggerNode");
  });

  it("should pass name to WorkflowNode", () => {
    const WorkflowNodeMock = vi.mocked(
      require("@/components/workflow-node").WorkflowNode
    );
    
    render(
      <ReactFlowProvider>
        <BaseTriggerNode {...defaultProps} name="Test Trigger" />
      </ReactFlowProvider>
    );
    
    expect(WorkflowNodeMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Test Trigger" }),
      expect.anything()
    );
  });

  it("should pass description to WorkflowNode", () => {
    const WorkflowNodeMock = vi.mocked(
      require("@/components/workflow-node").WorkflowNode
    );
    
    render(
      <ReactFlowProvider>
        <BaseTriggerNode {...defaultProps} description="Test Description" />
      </ReactFlowProvider>
    );
    
    expect(WorkflowNodeMock).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Test Description" }),
      expect.anything()
    );
  });
});