import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BaseHandle } from "../base-handle";
import { Position } from "@xyflow/react";
import { ReactFlowProvider } from "@xyflow/react";

// Mock ReactFlow's Handle component
vi.mock("@xyflow/react", async () => {
  const actual = await vi.importActual("@xyflow/react");
  return {
    ...actual,
    Handle: vi.fn(({ children, className, ...props }) => (
      <div data-testid="handle" className={className} {...props}>
        {children}
      </div>
    )),
  };
});

describe("BaseHandle", () => {
  it("should render without crashing", () => {
    render(
      <ReactFlowProvider>
        <BaseHandle type="source" position={Position.Right} />
      </ReactFlowProvider>
    );
    expect(screen.getByTestId("handle")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(
      <ReactFlowProvider>
        <BaseHandle
          type="source"
          position={Position.Right}
          className="custom-class"
        />
      </ReactFlowProvider>
    );
    const handle = screen.getByTestId("handle");
    expect(handle).toHaveClass("custom-class");
  });

  it("should render children", () => {
    render(
      <ReactFlowProvider>
        <BaseHandle type="source" position={Position.Right}>
          <span>Test Child</span>
        </BaseHandle>
      </ReactFlowProvider>
    );
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should forward ref correctly", () => {
    const ref = vi.fn();
    render(
      <ReactFlowProvider>
        <BaseHandle ref={ref} type="source" position={Position.Right} />
      </ReactFlowProvider>
    );
    expect(ref).toHaveBeenCalled();
  });

  it("should pass through additional props", () => {
    render(
      <ReactFlowProvider>
        <BaseHandle
          type="target"
          position={Position.Left}
          id="custom-handle"
          isConnectable={true}
        />
      </ReactFlowProvider>
    );
    const handle = screen.getByTestId("handle");
    expect(handle).toHaveAttribute("id", "custom-handle");
  });

  it("should apply default styling classes", () => {
    render(
      <ReactFlowProvider>
        <BaseHandle type="source" position={Position.Right} />
      </ReactFlowProvider>
    );
    const handle = screen.getByTestId("handle");
    expect(handle.className).toContain("rounded-full");
  });
});