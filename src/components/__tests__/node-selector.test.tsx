import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NodeSelector } from "../node-selector";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { NodeType } from "@/generated/prisma";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@paralleldrive/cuid2", () => ({
  createId: vi.fn(() => "test-id-123"),
}));

const mockSetNodes = vi.fn();
const mockGetNodes = vi.fn(() => []);
const mockScreenToFlowPosition = vi.fn((pos) => pos);

vi.mock("@xyflow/react", async () => {
  const actual = await vi.importActual("@xyflow/react");
  return {
    ...actual,
    useReactFlow: vi.fn(() => ({
      setNodes: mockSetNodes,
      getNodes: mockGetNodes,
      screenToFlowPosition: mockScreenToFlowPosition,
    })),
  };
});

describe("NodeSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetNodes.mockReturnValue([]);
    global.window = {
      ...global.window,
      innerWidth: 1920,
      innerHeight: 1080,
    } as any;
  });

  it("should render trigger when open is true", () => {
    render(
      <ReactFlowProvider>
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Add Node</button>
        </NodeSelector>
      </ReactFlowProvider>
    );
    
    expect(screen.getByText("Add Node")).toBeInTheDocument();
  });

  it("should render sheet content when open", () => {
    render(
      <ReactFlowProvider>
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Add Node</button>
        </NodeSelector>
      </ReactFlowProvider>
    );
    
    expect(screen.getByText("What triggers this workflow ?")).toBeInTheDocument();
  });

  it("should display trigger nodes section", () => {
    render(
      <ReactFlowProvider>
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Add Node</button>
        </NodeSelector>
      </ReactFlowProvider>
    );
    
    expect(screen.getByText("Trigger Manually.")).toBeInTheDocument();
    expect(screen.getByText("Trigger manually your workflow")).toBeInTheDocument();
  });

  it("should display execution nodes section", () => {
    render(
      <ReactFlowProvider>
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Add Node</button>
        </NodeSelector>
      </ReactFlowProvider>
    );
    
    expect(screen.getByText("Http Request")).toBeInTheDocument();
    expect(screen.getByText("Make http requests with ease.")).toBeInTheDocument();
  });

  it("should call onOpenChange when sheet changes", () => {
    const handleOpenChange = vi.fn();
    render(
      <ReactFlowProvider>
        <NodeSelector open={true} onOpenChange={handleOpenChange}>
          <button>Add Node</button>
        </NodeSelector>
      </ReactFlowProvider>
    );
    
    // Verify the component is controlled by the open prop
    expect(screen.getByText("What triggers this workflow ?")).toBeInTheDocument();
  });

  it("should add node when trigger node is selected", async () => {
    const handleOpenChange = vi.fn();
    
    render(
      <ReactFlowProvider>
        <NodeSelector open={true} onOpenChange={handleOpenChange}>
          <button>Add Node</button>
        </NodeSelector>
      </ReactFlowProvider>
    );
    
    const manualTrigger = screen.getByText("Trigger Manually.");
    fireEvent.click(manualTrigger);
    
    await waitFor(() => {
      expect(mockSetNodes).toHaveBeenCalled();
    });
  });

  it("should prevent multiple manual triggers", async () => {
    const { toast } = await import("sonner");
    mockGetNodes.mockReturnValue([
      { id: "1", type: NodeType.MANUAL_TRIGGER, position: { x: 0, y: 0 }, data: {} }
    ]);
    
    render(
      <ReactFlowProvider>
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Add Node</button>
        </NodeSelector>
      </ReactFlowProvider>
    );
    
    const manualTrigger = screen.getByText("Trigger Manually.");
    fireEvent.click(manualTrigger);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Only one manual trigger allowed per workflow"
      );
    });
  });

  it("should add HTTP request node", async () => {
    const handleOpenChange = vi.fn();
    
    render(
      <ReactFlowProvider>
        <NodeSelector open={true} onOpenChange={handleOpenChange}>
          <button>Add Node</button>
        </NodeSelector>
      </ReactFlowProvider>
    );
    
    const httpRequest = screen.getByText("Http Request");
    fireEvent.click(httpRequest);
    
    await waitFor(() => {
      expect(mockSetNodes).toHaveBeenCalled();
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("should replace initial node if present", async () => {
    mockGetNodes.mockReturnValue([
      { id: "initial-1", type: NodeType.INITIAL, position: { x: 0, y: 0 }, data: {} }
    ]);
    
    render(
      <ReactFlowProvider>
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Add Node</button>
        </NodeSelector>
      </ReactFlowProvider>
    );
    
    const httpRequest = screen.getByText("Http Request");
    fireEvent.click(httpRequest);
    
    await waitFor(() => {
      expect(mockSetNodes).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  it("should generate random position for new node", async () => {
    render(
      <ReactFlowProvider>
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Add Node</button>
        </NodeSelector>
      </ReactFlowProvider>
    );
    
    const httpRequest = screen.getByText("Http Request");
    fireEvent.click(httpRequest);
    
    await waitFor(() => {
      expect(mockScreenToFlowPosition).toHaveBeenCalledWith(
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    });
  });

  it("should use center of window for node position calculation", async () => {
    render(
      <ReactFlowProvider>
        <NodeSelector open={true} onOpenChange={vi.fn()}>
          <button>Add Node</button>
        </NodeSelector>
      </ReactFlowProvider>
    );
    
    const httpRequest = screen.getByText("Http Request");
    fireEvent.click(httpRequest);
    
    await waitFor(() => {
      const callArgs = mockScreenToFlowPosition.mock.calls[0][0];
      expect(callArgs.x).toBeCloseTo(960, 200); // Center ± random offset
      expect(callArgs.y).toBeCloseTo(540, 200);
    });
  });
});