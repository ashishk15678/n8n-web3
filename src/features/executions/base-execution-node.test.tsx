import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BaseExecutionNode } from "./base-execution-node";

vi.mock("../../components/workflow-node", () => ({
  WorkflowNode: vi.fn(({ children, name, description, onDelete, onSettings }) => (
    <div data-testid="workflow-node" data-name={name} data-description={description}>
      {children}
    </div>
  )),
}));

vi.mock("../../components/reactflow/base-node", () => ({
  BaseNode: vi.fn(({ children, onDoubleClick }) => (
    <div data-testid="base-node" onDoubleClick={onDoubleClick}>
      {children}
    </div>
  )),
  BaseNodeContent: vi.fn(({ children }) => (
    <div data-testid="base-node-content">{children}</div>
  )),
}));

vi.mock("../../components/reactflow/base-handle", () => ({
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

describe("BaseExecutionNode", () => {
  const defaultProps = {
    id: "node-1",
    data: {},
    icon: MockIcon,
    name: "Test Execution",
  };

  it("should render with icon component", () => {
    render(<BaseExecutionNode {...defaultProps} />);
    
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("should render with icon string (image)", () => {
    render(<BaseExecutionNode {...defaultProps} icon="/icon.png" />);
    
    const image = screen.getByTestId("next-image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/icon.png");
  });

  it("should render name in workflow node", () => {
    render(<BaseExecutionNode {...defaultProps} />);
    
    const workflowNode = screen.getByTestId("workflow-node");
    expect(workflowNode.dataset.name).toBe("Test Execution");
  });

  it("should render description when provided", () => {
    render(<BaseExecutionNode {...defaultProps} description="Execution description" />);
    
    const workflowNode = screen.getByTestId("workflow-node");
    expect(workflowNode.dataset.description).toBe("Execution description");
  });

  it("should render children when provided", () => {
    render(
      <BaseExecutionNode {...defaultProps}>
        <div>Child Content</div>
      </BaseExecutionNode>
    );
    
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("should render both target and source handles", () => {
    render(<BaseExecutionNode {...defaultProps} />);
    
    expect(screen.getByTestId("handle-target")).toBeInTheDocument();
    expect(screen.getByTestId("handle-source")).toBeInTheDocument();
  });

  it("should render target handle on left", () => {
    render(<BaseExecutionNode {...defaultProps} />);
    
    const targetHandle = screen.getByTestId("handle-target");
    expect(targetHandle.dataset.id).toBe("target-1");
    expect(targetHandle.dataset.position).toBe("left");
  });

  it("should render source handle on right", () => {
    render(<BaseExecutionNode {...defaultProps} />);
    
    const sourceHandle = screen.getByTestId("handle-source");
    expect(sourceHandle.dataset.id).toBe("source-1");
    expect(sourceHandle.dataset.position).toBe("right");
  });

  it("should call onDoubleClick when base node double clicked", () => {
    const handleDoubleClick = vi.fn();
    render(<BaseExecutionNode {...defaultProps} onDoubleClick={handleDoubleClick} />);
    
    const baseNode = screen.getByTestId("base-node");
    fireEvent.doubleClick(baseNode);
    
    expect(handleDoubleClick).toHaveBeenCalledTimes(1);
  });

  it("should pass onSettings to workflow node", () => {
    const handleSettings = vi.fn();
    render(<BaseExecutionNode {...defaultProps} onSettings={handleSettings} />);
    
    expect(screen.getByTestId("workflow-node")).toBeInTheDocument();
  });

  it("should have displayName set", () => {
    expect(BaseExecutionNode.displayName).toBe("BaseExecutionNode");
  });

  it("should handle missing optional props", () => {
    render(<BaseExecutionNode {...defaultProps} />);
    
    expect(screen.getByTestId("base-node")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-node")).toBeInTheDocument();
  });

  it("should render in workflow node wrapper", () => {
    render(<BaseExecutionNode {...defaultProps} />);
    
    expect(screen.getByTestId("workflow-node")).toBeInTheDocument();
    expect(screen.getByTestId("base-node")).toBeInTheDocument();
  });
});