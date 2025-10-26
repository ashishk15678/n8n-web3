import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkflowNode } from "./workflow-node";

vi.mock("@xyflow/react", () => ({
  NodeToolbar: vi.fn(({ children, position, isVisible, className }) => (
    <div 
      data-testid="node-toolbar" 
      data-position={position}
      data-visible={isVisible?.toString()}
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

vi.mock("./ui/button", () => ({
  Button: vi.fn(({ children, onClick, size, variant }) => (
    <button 
      data-testid={`button-${children?.type?.name || 'unknown'}`}
      onClick={onClick}
      data-size={size}
      data-variant={variant}
    >
      {children}
    </button>
  )),
}));

vi.mock("lucide-react", () => ({
  SettingsIcon: () => <span data-testid="settings-icon">Settings</span>,
  TrashIcon: () => <span data-testid="trash-icon">Trash</span>,
}));

describe("WorkflowNode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic rendering", () => {
    it("should render children", () => {
      render(
        <WorkflowNode>
          <div>Node Content</div>
        </WorkflowNode>
      );
      
      expect(screen.getByText("Node Content")).toBeInTheDocument();
    });

    it("should render toolbar by default", () => {
      render(
        <WorkflowNode>
          <div>Content</div>
        </WorkflowNode>
      );
      
      const toolbars = screen.getAllByTestId("node-toolbar");
      expect(toolbars.length).toBeGreaterThan(0);
    });

    it("should not render toolbar when showToolBar is false", () => {
      render(
        <WorkflowNode showToolBar={false}>
          <div>Content</div>
        </WorkflowNode>
      );
      
      const toolbars = screen.queryAllByTestId("node-toolbar");
      // Should only have the name/description toolbar if provided
      expect(toolbars.length).toBe(0);
    });
  });

  describe("toolbar actions", () => {
    it("should render settings button", () => {
      render(
        <WorkflowNode>
          <div>Content</div>
        </WorkflowNode>
      );
      
      expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
    });

    it("should render delete button", () => {
      render(
        <WorkflowNode>
          <div>Content</div>
        </WorkflowNode>
      );
      
      expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
    });

    it("should call onSettings when settings button clicked", () => {
      const handleSettings = vi.fn();
      render(
        <WorkflowNode onSettings={handleSettings}>
          <div>Content</div>
        </WorkflowNode>
      );
      
      const settingsButton = screen.getByTestId("settings-icon").closest("button");
      fireEvent.click(settingsButton!);
      
      expect(handleSettings).toHaveBeenCalledTimes(1);
    });

    it("should call onDelete when delete button clicked", () => {
      const handleDelete = vi.fn();
      render(
        <WorkflowNode onDelete={handleDelete}>
          <div>Content</div>
        </WorkflowNode>
      );
      
      const deleteButton = screen.getByTestId("trash-icon").closest("button");
      fireEvent.click(deleteButton!);
      
      expect(handleDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe("name and description display", () => {
    it("should render name when provided", () => {
      render(
        <WorkflowNode name="Test Node">
          <div>Content</div>
        </WorkflowNode>
      );
      
      expect(screen.getByText("Test Node")).toBeInTheDocument();
    });

    it("should render description when provided", () => {
      render(
        <WorkflowNode name="Test Node" description="Node description">
          <div>Content</div>
        </WorkflowNode>
      );
      
      expect(screen.getByText("Node description")).toBeInTheDocument();
    });

    it("should not render description if name is not provided", () => {
      render(
        <WorkflowNode description="Description only">
          <div>Content</div>
        </WorkflowNode>
      );
      
      expect(screen.queryByText("Description only")).not.toBeInTheDocument();
    });

    it("should render name toolbar at bottom position", () => {
      render(
        <WorkflowNode name="Test Node">
          <div>Content</div>
        </WorkflowNode>
      );
      
      const toolbars = screen.getAllByTestId("node-toolbar");
      const nameToolbar = toolbars.find(toolbar => 
        toolbar.textContent?.includes("Test Node")
      );
      
      expect(nameToolbar).toBeInTheDocument();
      expect(nameToolbar?.dataset.position).toBe("bottom");
    });

    it("should make name toolbar always visible", () => {
      render(
        <WorkflowNode name="Test Node">
          <div>Content</div>
        </WorkflowNode>
      );
      
      const toolbars = screen.getAllByTestId("node-toolbar");
      const nameToolbar = toolbars.find(toolbar => 
        toolbar.textContent?.includes("Test Node")
      );
      
      expect(nameToolbar?.dataset.visible).toBe("true");
    });
  });

  describe("edge cases", () => {
    it("should handle missing callbacks gracefully", () => {
      render(
        <WorkflowNode>
          <div>Content</div>
        </WorkflowNode>
      );
      
      const settingsButton = screen.getByTestId("settings-icon").closest("button");
      const deleteButton = screen.getByTestId("trash-icon").closest("button");
      
      expect(() => {
        fireEvent.click(settingsButton!);
        fireEvent.click(deleteButton!);
      }).not.toThrow();
    });

    it("should handle all props together", () => {
      const handleSettings = vi.fn();
      const handleDelete = vi.fn();
      
      render(
        <WorkflowNode
          showToolBar={true}
          onSettings={handleSettings}
          onDelete={handleDelete}
          name="Complete Node"
          description="Full description"
        >
          <div>Content</div>
        </WorkflowNode>
      );
      
      expect(screen.getByText("Content")).toBeInTheDocument();
      expect(screen.getByText("Complete Node")).toBeInTheDocument();
      expect(screen.getByText("Full description")).toBeInTheDocument();
      expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
      expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
    });
  });
});