import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlaceholderNode } from "./placeholder-node";

vi.mock("@xyflow/react", () => ({
  Handle: vi.fn(({ type, position, style, isConnectable }) => (
    <div 
      data-testid={`handle-${type}`}
      data-position={position}
      data-connectable={isConnectable?.toString()}
      style={style}
    />
  )),
  Position: {
    Top: "top",
    Bottom: "bottom",
    Left: "left",
    Right: "right",
  },
}));

describe("PlaceholderNode", () => {
  it("should render children", () => {
    render(
      <PlaceholderNode>
        <div>Placeholder Content</div>
      </PlaceholderNode>
    );
    
    expect(screen.getByText("Placeholder Content")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();
    render(
      <PlaceholderNode onClick={handleClick}>
        <div>Click me</div>
      </PlaceholderNode>
    );
    
    const node = screen.getByText("Click me").parentElement;
    fireEvent.click(node!);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render target handle with hidden visibility", () => {
    render(
      <PlaceholderNode>
        <div>Content</div>
      </PlaceholderNode>
    );
    
    const targetHandle = screen.getByTestId("handle-target");
    expect(targetHandle).toBeInTheDocument();
    expect(targetHandle.style.visibility).toBe("hidden");
  });

  it("should render source handle with hidden visibility", () => {
    render(
      <PlaceholderNode>
        <div>Content</div>
      </PlaceholderNode>
    );
    
    const sourceHandle = screen.getByTestId("handle-source");
    expect(sourceHandle).toBeInTheDocument();
    expect(sourceHandle.style.visibility).toBe("hidden");
  });

  it("should have both handles not connectable", () => {
    render(
      <PlaceholderNode>
        <div>Content</div>
      </PlaceholderNode>
    );
    
    const targetHandle = screen.getByTestId("handle-target");
    const sourceHandle = screen.getByTestId("handle-source");
    
    expect(targetHandle.dataset.connectable).toBe("false");
    expect(sourceHandle.dataset.connectable).toBe("false");
  });

  it("should apply dashed border styling", () => {
    const { container } = render(
      <PlaceholderNode>
        <div>Content</div>
      </PlaceholderNode>
    );
    
    const baseNode = container.querySelector('[class*="border-dashed"]');
    expect(baseNode).toBeInTheDocument();
  });

  it("should forward ref", () => {
    const ref = { current: null };
    render(
      <PlaceholderNode ref={ref}>
        <div>Content</div>
      </PlaceholderNode>
    );
    
    expect(ref.current).not.toBeNull();
  });

  it("should not trigger onClick if not provided", () => {
    const { container } = render(
      <PlaceholderNode>
        <div>Content</div>
      </PlaceholderNode>
    );
    
    const node = screen.getByText("Content").parentElement;
    expect(() => fireEvent.click(node!)).not.toThrow();
  });

  it("should render without children", () => {
    render(<PlaceholderNode />);
    
    expect(screen.getByTestId("handle-target")).toBeInTheDocument();
    expect(screen.getByTestId("handle-source")).toBeInTheDocument();
  });
});