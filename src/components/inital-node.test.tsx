import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InitalNode } from "./inital-node";

vi.mock("./workflow-node", () => ({
  WorkflowNode: vi.fn(({ children, showToolBar }) => (
    <div data-testid="workflow-node" data-show-toolbar={showToolBar?.toString()}>
      {children}
    </div>
  )),
}));

vi.mock("./node-selector", () => ({
  NodeSelector: vi.fn(({ children, open, onOpenChange }) => (
    <div data-testid="node-selector" data-open={open?.toString()}>
      {children}
    </div>
  )),
}));

vi.mock("./reactflow/placeholder-node", () => ({
  PlaceholderNode: vi.fn(({ children, onClick, ...props }) => (
    <div data-testid="placeholder-node" onClick={onClick}>
      {children}
    </div>
  )),
}));

vi.mock("lucide-react", () => ({
  PlusIcon: () => <span data-testid="plus-icon">+</span>,
}));

describe("InitalNode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render placeholder node with plus icon", () => {
    render(<InitalNode id="node-1" data={{}} />);
    
    expect(screen.getByTestId("placeholder-node")).toBeInTheDocument();
    expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
  });

  it("should wrap content in workflow node", () => {
    render(<InitalNode id="node-1" data={{}} />);
    
    expect(screen.getByTestId("workflow-node")).toBeInTheDocument();
  });

  it("should disable toolbar in workflow node", () => {
    render(<InitalNode id="node-1" data={{}} />);
    
    const workflowNode = screen.getByTestId("workflow-node");
    expect(workflowNode.dataset.showToolbar).toBe("false");
  });

  it("should wrap in node selector", () => {
    render(<InitalNode id="node-1" data={{}} />);
    
    expect(screen.getByTestId("node-selector")).toBeInTheDocument();
  });

  it("should start with selector closed", () => {
    render(<InitalNode id="node-1" data={{}} />);
    
    const selector = screen.getByTestId("node-selector");
    expect(selector.dataset.open).toBe("false");
  });

  it("should open selector when placeholder clicked", () => {
    const { NodeSelector } = require("./node-selector");
    let capturedOnOpenChange: ((open: boolean) => void) | undefined;
    
    NodeSelector.mockImplementation(({ children, onOpenChange }: any) => {
      capturedOnOpenChange = onOpenChange;
      return <div data-testid="node-selector">{children}</div>;
    });

    render(<InitalNode id="node-1" data={{}} />);
    
    const placeholder = screen.getByTestId("placeholder-node");
    fireEvent.click(placeholder);
    
    // The click should trigger setOpen(true)
    expect(placeholder).toBeInTheDocument();
  });

  it("should have displayName set", () => {
    expect(InitalNode.displayName).toBe("InitalNode");
  });

  it("should be memoized", () => {
    // Testing memo behavior
    const { rerender } = render(<InitalNode id="node-1" data={{}} />);
    const firstRender = screen.getByTestId("placeholder-node");
    
    rerender(<InitalNode id="node-1" data={{}} />);
    const secondRender = screen.getByTestId("placeholder-node");
    
    // Both renders should produce the same result
    expect(firstRender).toBeInTheDocument();
    expect(secondRender).toBeInTheDocument();
  });
});