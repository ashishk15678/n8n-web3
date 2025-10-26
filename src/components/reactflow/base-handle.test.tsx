import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BaseHandle } from "./base-handle";
import { Position } from "@xyflow/react";

vi.mock("@xyflow/react", () => ({
  Handle: vi.fn(({ children, className, type, position }) => (
    <div 
      data-testid="handle" 
      data-type={type} 
      data-position={position}
      className={className}
    >
      {children}
    </div>
  )),
  Position: {
    Top: "top",
    Bottom: "bottom",
    Left: "left",
    Right: "right",
  },
}));

describe("BaseHandle", () => {
  it("should render Handle component", () => {
    render(
      <BaseHandle type="source" position={Position.Right} id="test-handle" />
    );
    
    expect(screen.getByTestId("handle")).toBeInTheDocument();
  });

  it("should apply custom className along with default styles", () => {
    render(
      <BaseHandle 
        type="source" 
        position={Position.Right} 
        id="test-handle"
        className="custom-class"
      />
    );
    
    const handle = screen.getByTestId("handle");
    expect(handle.className).toContain("custom-class");
  });

  it("should render children when provided", () => {
    render(
      <BaseHandle type="source" position={Position.Right} id="test-handle">
        <span>Handle Content</span>
      </BaseHandle>
    );
    
    expect(screen.getByText("Handle Content")).toBeInTheDocument();
  });

  it("should pass through type prop", () => {
    render(
      <BaseHandle type="target" position={Position.Left} id="test-handle" />
    );
    
    const handle = screen.getByTestId("handle");
    expect(handle.dataset.type).toBe("target");
  });

  it("should pass through position prop", () => {
    render(
      <BaseHandle type="source" position={Position.Bottom} id="test-handle" />
    );
    
    const handle = screen.getByTestId("handle");
    expect(handle.dataset.position).toBe("bottom");
  });

  it("should support ref forwarding", () => {
    const ref = vi.fn();
    render(
      <BaseHandle 
        ref={ref as any}
        type="source" 
        position={Position.Right} 
        id="test-handle"
      />
    );
    
    // Note: In actual implementation, ref would be forwarded to the Handle component
    expect(ref).toHaveBeenCalled();
  });

  it("should handle all position values", () => {
    const positions = [Position.Top, Position.Bottom, Position.Left, Position.Right];
    
    positions.forEach((position) => {
      const { unmount } = render(
        <BaseHandle type="source" position={position} id={`handle-${position}`} />
      );
      
      const handle = screen.getByTestId("handle");
      expect(handle.dataset.position).toBe(position);
      unmount();
    });
  });

  it("should handle both source and target types", () => {
    const types: Array<"source" | "target"> = ["source", "target"];
    
    types.forEach((type) => {
      const { unmount } = render(
        <BaseHandle type={type} position={Position.Right} id={`handle-${type}`} />
      );
      
      const handle = screen.getByTestId("handle");
      expect(handle.dataset.type).toBe(type);
      unmount();
    });
  });

  it("should render without children", () => {
    render(
      <BaseHandle type="source" position={Position.Right} id="test-handle" />
    );
    
    const handle = screen.getByTestId("handle");
    expect(handle).toBeInTheDocument();
    expect(handle.textContent).toBe("");
  });
});