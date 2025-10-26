import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkflowNode } from "../workflow-node";
import { ReactFlowProvider } from "@xyflow/react";

// Mock NodeToolbar
vi.mock("@xyflow/react", async () => {
  const actual = await vi.importActual("@xyflow/react");
  return {
    ...actual,
    NodeToolbar: vi.fn(({ children, position, isVisible, className }) => (
      <div
        data-testid="node-toolbar"
        data-position={position}
        data-visible={isVisible}
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
  };
});

describe("WorkflowNode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children", () => {
    render(
      <ReactFlowProvider>
        <WorkflowNode>
          <div>Node Content</div>
        </WorkflowNode>
      </ReactFlowProvider>
    );
    expect(screen.getByText("Node Content")).toBeInTheDocument();
  });

  it("should show toolbar when showToolBar is true", () => {
    render(
      <ReactFlowProvider>
        <WorkflowNode showToolBar={true}>
          <div>Content</div>
        </WorkflowNode>
      </ReactFlowProvider>
    );
    
    const toolbars = screen.getAllByTestId("node-toolbar");
    expect(toolbars.length).toBeGreaterThan(0);
  });

  it("should hide toolbar when showToolBar is false", () => {
    render(
      <ReactFlowProvider>
        <WorkflowNode showToolBar={false}>
          <div>Content</div>
        </WorkflowNode>
      </ReactFlowProvider>
    );
    
    // Only the name/description toolbar should be present if name is not provided
    const toolbars = screen.queryAllByTestId("node-toolbar");
    expect(toolbars.length).toBeLessThanOrEqual(1);
  });

  it("should call onSettings when settings button is clicked", () => {
    const handleSettings = vi.fn();
    render(
      <ReactFlowProvider>
        <WorkflowNode showToolBar={true} onSettings={handleSettings}>
          <div>Content</div>
        </WorkflowNode>
      </ReactFlowProvider>
    );
    
    const settingsButton = screen.getByRole("button", { name: /settings/i });
    fireEvent.click(settingsButton);
    expect(handleSettings).toHaveBeenCalledTimes(1);
  });

  it("should call onDelete when delete button is clicked", () => {
    const handleDelete = vi.fn();
    render(
      <ReactFlowProvider>
        <WorkflowNode showToolBar={true} onDelete={handleDelete}>
          <div>Content</div>
        </WorkflowNode>
      </ReactFlowProvider>
    );
    
    const deleteButton = screen.getByRole("button", { name: /trash/i });
    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it("should display name in bottom toolbar", () => {
    render(
      <ReactFlowProvider>
        <WorkflowNode name="Test Node">
          <div>Content</div>
        </WorkflowNode>
      </ReactFlowProvider>
    );
    
    expect(screen.getByText("Test Node")).toBeInTheDocument();
  });

  it("should display description when provided", () => {
    render(
      <ReactFlowProvider>
        <WorkflowNode name="Test Node" description="Test Description">
          <div>Content</div>
        </WorkflowNode>
      </ReactFlowProvider>
    );
    
    expect(screen.getByText("Test Node")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("should not display description when not provided", () => {
    render(
      <ReactFlowProvider>
        <WorkflowNode name="Test Node">
          <div>Content</div>
        </WorkflowNode>
      </ReactFlowProvider>
    );
    
    const toolbars = screen.getAllByTestId("node-toolbar");
    const bottomToolbar = toolbars.find(
      toolbar => toolbar.getAttribute("data-position") === "bottom"
    );
    
    if (bottomToolbar) {
      expect(bottomToolbar.textContent).not.toContain("Test Description");
    }
  });

  it("should not show name toolbar when name is not provided", () => {
    render(
      <ReactFlowProvider>
        <WorkflowNode>
          <div>Content</div>
        </WorkflowNode>
      </ReactFlowProvider>
    );
    
    const toolbars = screen.queryAllByTestId("node-toolbar");
    const bottomToolbar = toolbars.find(
      toolbar => toolbar.getAttribute("data-position") === "bottom"
    );
    
    expect(bottomToolbar).toBeUndefined();
  });

  it("should render settings and delete buttons with correct icons", () => {
    render(
      <ReactFlowProvider>
        <WorkflowNode showToolBar={true}>
          <div>Content</div>
        </WorkflowNode>
      </ReactFlowProvider>
    );
    
    expect(screen.getByRole("button", { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /trash/i })).toBeInTheDocument();
  });
});