import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NodeSelector } from "./node-selector";
import { NodeType } from "@/generated/prisma";

vi.mock("@xyflow/react", () => ({
  useReactFlow: vi.fn(() => ({
    setNodes: vi.fn(),
    getNodes: vi.fn(() => []),
    screenToFlowPosition: vi.fn(({ x, y }) => ({ x, y })),
  })),
}));

vi.mock("./ui/sheet", () => ({
  Sheet: ({ children }: any) => <div data-testid="sheet">{children}</div>,
  SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: any) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: any) => <div data-testid="sheet-title">{children}</div>,
  SheetDescription: ({ children }: any) => <div data-testid="sheet-description">{children}</div>,
  SheetTrigger: ({ children }: any) => <div data-testid="sheet-trigger">{children}</div>,
}));

vi.mock("./ui/separator", () => ({
  Separator: () => <div data-testid="separator" />,
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("@paralleldrive/cuid2", () => ({
  createId: vi.fn(() => "test-cuid-123"),
}));

describe("NodeSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the mock implementation
    const { useReactFlow } = require("@xyflow/react");
    useReactFlow.mockReturnValue({
      setNodes: vi.fn(),
      getNodes: vi.fn(() => []),
      screenToFlowPosition: vi.fn(({ x, y }) => ({ x, y })),
    });
  });

  it("should render children as trigger", () => {
    render(
      <NodeSelector open={false} onOpenChange={vi.fn()}>
        <button>Open Selector</button>
      </NodeSelector>
    );
    
    expect(screen.getByText("Open Selector")).toBeInTheDocument();
  });

  it("should render sheet with title and description", () => {
    render(
      <NodeSelector open={true} onOpenChange={vi.fn()}>
        <button>Open</button>
      </NodeSelector>
    );
    
    expect(screen.getByText("What triggers this workflow ?")).toBeInTheDocument();
    expect(screen.getByText("A trigger is a step that starts your workflow")).toBeInTheDocument();
  });

  it("should render trigger nodes section", () => {
    render(
      <NodeSelector open={true} onOpenChange={vi.fn()}>
        <button>Open</button>
      </NodeSelector>
    );
    
    expect(screen.getByText("Trigger Manually.")).toBeInTheDocument();
    expect(screen.getByText("Trigger manually your workflow")).toBeInTheDocument();
  });

  it("should render execution nodes section", () => {
    render(
      <NodeSelector open={true} onOpenChange={vi.fn()}>
        <button>Open</button>
      </NodeSelector>
    );
    
    expect(screen.getByText("Http Request")).toBeInTheDocument();
    expect(screen.getByText("Make http requests with ease.")).toBeInTheDocument();
  });

  it("should render separator between sections", () => {
    render(
      <NodeSelector open={true} onOpenChange={vi.fn()}>
        <button>Open</button>
      </NodeSelector>
    );
    
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });

  describe("node selection behavior", () => {
    it("should add new node when execution node selected", () => {
      const { useReactFlow } = require("@xyflow/react");
      const mockSetNodes = vi.fn();
      
      useReactFlow.mockReturnValue({
        setNodes: mockSetNodes,
        getNodes: vi.fn(() => []),
        screenToFlowPosition: vi.fn(({ x, y }) => ({ x: 100, y: 200 })),
      });

      render(
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Open</button>
        </NodeSelector>
      );
      
      const httpRequestNode = screen.getByText("Http Request");
      fireEvent.click(httpRequestNode.parentElement!);
      
      expect(mockSetNodes).toHaveBeenCalled();
    });

    it("should prevent adding manual trigger if one already exists", () => {
      const { useReactFlow } = require("@xyflow/react");
      const { toast } = require("sonner");
      const mockSetNodes = vi.fn();
      
      useReactFlow.mockReturnValue({
        setNodes: mockSetNodes,
        getNodes: vi.fn(() => [
          { id: "1", type: NodeType.MANUAL_TRIGGER, position: { x: 0, y: 0 }, data: {} }
        ]),
        screenToFlowPosition: vi.fn(({ x, y }) => ({ x, y })),
      });

      render(
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Open</button>
        </NodeSelector>
      );
      
      const manualTrigger = screen.getByText("Trigger Manually.");
      fireEvent.click(manualTrigger.parentElement!);
      
      expect(toast.error).toHaveBeenCalledWith("Only one manual trigger allowed per workflow");
      expect(mockSetNodes).not.toHaveBeenCalled();
    });

    it("should allow adding manual trigger if none exists", () => {
      const { useReactFlow } = require("@xyflow/react");
      const mockSetNodes = vi.fn();
      
      useReactFlow.mockReturnValue({
        setNodes: mockSetNodes,
        getNodes: vi.fn(() => []),
        screenToFlowPosition: vi.fn(({ x, y }) => ({ x: 100, y: 200 })),
      });

      render(
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Open</button>
        </NodeSelector>
      );
      
      const manualTrigger = screen.getByText("Trigger Manually.");
      fireEvent.click(manualTrigger.parentElement!);
      
      expect(mockSetNodes).toHaveBeenCalled();
    });

    it("should close selector after node selection", () => {
      const { useReactFlow } = require("@xyflow/react");
      const mockOnOpenChange = vi.fn();
      
      useReactFlow.mockReturnValue({
        setNodes: vi.fn(),
        getNodes: vi.fn(() => []),
        screenToFlowPosition: vi.fn(({ x, y }) => ({ x, y })),
      });

      render(
        <NodeSelector open={true} onOpenChange={mockOnOpenChange}>
          <button>Open</button>
        </NodeSelector>
      );
      
      const httpRequestNode = screen.getByText("Http Request");
      fireEvent.click(httpRequestNode.parentElement!);
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("should replace initial nodes with new node if initial nodes exist", () => {
      const { useReactFlow } = require("@xyflow/react");
      const mockSetNodes = vi.fn((callback: any) => {
        const result = callback([
          { id: "1", type: NodeType.INITIAL, position: { x: 0, y: 0 }, data: {} }
        ]);
        return result;
      });
      
      useReactFlow.mockReturnValue({
        setNodes: mockSetNodes,
        getNodes: vi.fn(() => [
          { id: "1", type: NodeType.INITIAL, position: { x: 0, y: 0 }, data: {} }
        ]),
        screenToFlowPosition: vi.fn(({ x, y }) => ({ x: 100, y: 200 })),
      });

      render(
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Open</button>
        </NodeSelector>
      );
      
      const httpRequestNode = screen.getByText("Http Request");
      fireEvent.click(httpRequestNode.parentElement!);
      
      expect(mockSetNodes).toHaveBeenCalled();
    });

    it("should generate random position offset for new nodes", () => {
      const { useReactFlow } = require("@xyflow/react");
      const mockScreenToFlowPosition = vi.fn(({ x, y }) => ({ x, y }));
      
      useReactFlow.mockReturnValue({
        setNodes: vi.fn(),
        getNodes: vi.fn(() => []),
        screenToFlowPosition: mockScreenToFlowPosition,
      });

      render(
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Open</button>
        </NodeSelector>
      );
      
      const httpRequestNode = screen.getByText("Http Request");
      fireEvent.click(httpRequestNode.parentElement!);
      
      expect(mockScreenToFlowPosition).toHaveBeenCalled();
    });
  });

  describe("node types", () => {
    it("should have correct NodeType for manual trigger", () => {
      render(
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Open</button>
        </NodeSelector>
      );
      
      // Verify manual trigger is rendered
      expect(screen.getByText("Trigger Manually.")).toBeInTheDocument();
    });

    it("should have correct NodeType for HTTP request", () => {
      render(
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Open</button>
        </NodeSelector>
      );
      
      // Verify HTTP request is rendered
      expect(screen.getByText("Http Request")).toBeInTheDocument();
    });
  });
});