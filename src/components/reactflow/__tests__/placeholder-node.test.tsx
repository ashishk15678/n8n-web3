import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlaceholderNode } from "../placeholder-node";
import { ReactFlowProvider } from "@xyflow/react";

// Mock Handle component
vi.mock("@xyflow/react", async () => {
  const actual = await vi.importActual("@xyflow/react");
  return {
    ...actual,
    Handle: vi.fn(({ type, position, style }) => (
      <div data-testid={`handle-${type}`} style={style} />
    )),
    Position: {
      Top: "top",
      Bottom: "bottom",
      Left: "left",
      Right: "right",
    },
  };
});

describe("PlaceholderNode", () => {
  it("should render without crashing", () => {
    render(
      <ReactFlowProvider>
        <PlaceholderNode />
      </ReactFlowProvider>
    );
    expect(screen.getByTestId("handle-target")).toBeInTheDocument();
    expect(screen.getByTestId("handle-source")).toBeInTheDocument();
  });

  it("should render children", () => {
    render(
      <ReactFlowProvider>
        <PlaceholderNode>
          <div>Placeholder Content</div>
        </PlaceholderNode>
      </ReactFlowProvider>
    );
    expect(screen.getByText("Placeholder Content")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();
    const { container } = render(
      <ReactFlowProvider>
        <PlaceholderNode onClick={handleClick}>
          <div>Click me</div>
        </PlaceholderNode>
      </ReactFlowProvider>
    );
    
    const node = container.querySelector('[class*="border-dashed"]');
    if (node) {
      fireEvent.click(node);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it("should have dashed border styling", () => {
    const { container } = render(
      <ReactFlowProvider>
        <PlaceholderNode>Content</PlaceholderNode>
      </ReactFlowProvider>
    );
    
    const node = container.querySelector('[class*="border-dashed"]');
    expect(node).toBeInTheDocument();
  });

  it("should have hidden handles", () => {
    render(
      <ReactFlowProvider>
        <PlaceholderNode />
      </ReactFlowProvider>
    );
    
    const targetHandle = screen.getByTestId("handle-target");
    const sourceHandle = screen.getByTestId("handle-source");
    
    expect(targetHandle).toHaveStyle({ visibility: "hidden" });
    expect(sourceHandle).toHaveStyle({ visibility: "hidden" });
  });

  it("should forward ref correctly", () => {
    const ref = vi.fn();
    render(
      <ReactFlowProvider>
        <PlaceholderNode ref={ref}>Content</PlaceholderNode>
      </ReactFlowProvider>
    );
    expect(ref).toHaveBeenCalled();
  });

  it("should not trigger onClick when not provided", () => {
    const { container } = render(
      <ReactFlowProvider>
        <PlaceholderNode>Content</PlaceholderNode>
      </ReactFlowProvider>
    );
    
    const node = container.querySelector('[class*="border-dashed"]');
    expect(() => {
      if (node) fireEvent.click(node);
    }).not.toThrow();
  });
});