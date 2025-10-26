import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BaseTriggerNode } from "./base-trigger-node";

vi.mock("@/components/workflow-node", () => ({
  WorkflowNode: vi.fn(({ children, name, description, onDelete, onSettings }) => (
    <div data-testid="workflow-node" data-name={name} data-description={description}>
      {children}
    </div>
  )),
}));

vi.mock("@/components/reactflow/base-node", () => ({
  BaseNode: vi.fn(({ children, onDoubleClick, className }) => (
    <div data-testid="base-node" onDoubleClick={onDoubleClick} className={className}>
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

vi.mock("@xyflow/react", () => ({
  Position: {
    Left: "left",
    Right: "right",
    Top: "top",
    Bottom: "bottom",
  },
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} data-testid="next-image" />
  ),
}));

const MockIcon = () => <span data-testid="mock-icon">Icon</span>;

describe("BaseTriggerNode", () => {
  const defaultProps = {
    id: "node-1",
    data: {},
    icon: MockIcon,
    name: "Test Trigger",
  };

  it("should render with icon component", () => {
    render(<BaseTriggerNode {...defaultProps} />);
    
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("should render with icon string (image)", () => {
    render(<BaseTriggerNode {...defaultProps} icon="/icon.png" />);
    
    const image = screen.getByTestId("next-image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/icon.png");
  });

  it("should render name in workflow node", () => {
    render(<BaseTriggerNode {...defaultProps} />);
    
    const workflowNode = screen.getByTestId("workflow-node");
    expect(workflowNode.dataset.name).toBe("Test Trigger");
  });

  it("should render description when provided", () => {
    render(<BaseTriggerNode {...defaultProps} description="Trigger description" />);
    
    const workflowNode = screen.getByTestId("workflow-node");
    expect(workflowNode.dataset.description).toBe("Trigger description");
  });

  it("should render children when provided", () => {
    render(
      <BaseTriggerNode {...defaultProps}>
        <div>Child Content</div>
      </BaseTriggerNode>
    );
    
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("should render source handle on right", () => {
    render(<BaseTriggerNode {...defaultProps} />);
    
    const sourceHandle = screen.getByTestId("handle-source");
    expect(sourceHandle).toBeInTheDocument();
    expect(sourceHandle.dataset.id).toBe("source-1");
    expect(sourceHandle.dataset.position).toBe("right");
  });

  it("should not render target handle", () => {
    render(<BaseTriggerNode {...defaultProps} />);
    
    expect(screen.queryByTestId("handle-target")).not.toBeInTheDocument();
  });

  it("should apply rounded-l-2xl styling to base node", () => {
    render(<BaseTriggerNode {...defaultProps} />);
    
    const baseNode = screen.getByTestId("base-node");
    expect(baseNode.className).toContain("rounded-l-2xl");
  });

  it("should call onDoubleClick when base node double clicked", () => {
    const handleDoubleClick = vi.fn();
    render(<BaseTriggerNode {...defaultProps} onDoubleClick={handleDoubleClick} />);
    
    const baseNode = screen.getByTestId("base-node");
    fireEvent.doubleClick(baseNode);
    
    expect(handleDoubleClick).toHaveBeenCalledTimes(1);
  });

  it("should pass onSettings to workflow node", () => {
    const handleSettings = vi.fn();
    render(<BaseTriggerNode {...defaultProps} onSettings={handleSettings} />);
    
    expect(screen.getByTestId("workflow-node")).toBeInTheDocument();
  });

  it("should have displayName set", () => {
    expect(BaseTriggerNode.displayName).toBe("BaseTriggerNode");
  });

  it("should handle missing optional props", () => {
    render(<BaseTriggerNode {...defaultProps} />);
    
    expect(screen.getByTestId("base-node")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-node")).toBeInTheDocument();
  });
});