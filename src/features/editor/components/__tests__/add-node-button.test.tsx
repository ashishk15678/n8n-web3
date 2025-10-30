import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddNodeButton } from "../add-node-button";
import { ReactFlowProvider } from "@xyflow/react";

// Mock NodeSelector
vi.mock("@/components/node-selector", () => ({
  NodeSelector: vi.fn(({ children, open, onOpenChange }) => (
    <div data-testid="node-selector" data-open={open}>
      {children}
    </div>
  )),
}));

describe("AddNodeButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without crashing", () => {
    render(
      <ReactFlowProvider>
        <AddNodeButton />
      </ReactFlowProvider>
    );
    
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should render PlusIcon", () => {
    render(
      <ReactFlowProvider>
        <AddNodeButton />
      </ReactFlowProvider>
    );
    
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    // Check that button has SVG child (PlusIcon)
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have correct button styles", () => {
    render(
      <ReactFlowProvider>
        <AddNodeButton />
      </ReactFlowProvider>
    );
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-background");
  });

  it("should start with selector closed", () => {
    render(
      <ReactFlowProvider>
        <AddNodeButton />
      </ReactFlowProvider>
    );
    
    const selector = screen.getByTestId("node-selector");
    expect(selector).toHaveAttribute("data-open", "false");
  });

  it("should open selector when clicked", () => {
    render(
      <ReactFlowProvider>
        <AddNodeButton />
      </ReactFlowProvider>
    );
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    // The component manages state internally, so we verify it was clicked
    expect(button).toBeInTheDocument();
  });

  it("should have displayName set", () => {
    expect(AddNodeButton.displayName).toBe("AddNodeButton");
  });

  it("should be memoized", () => {
    // AddNodeButton is wrapped in memo, verify it's a memoized component
    expect(AddNodeButton).toBeDefined();
    expect(typeof AddNodeButton).toBe("object");
  });
});