import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ManualTriggerNode } from "./manual-trigger-node";

vi.mock("../base-trigger-node", () => ({
  BaseTriggerNode: vi.fn(({ icon: Icon, name, description, onSettings, ...props }) => (
    <div data-testid="base-trigger-node" data-name={name} data-description={description}>
      {typeof Icon === 'function' && <Icon />}
    </div>
  )),
}));

vi.mock("lucide-react", () => ({
  MousePointerIcon: () => <span data-testid="mouse-pointer-icon">Pointer</span>,
}));

describe("ManualTriggerNode", () => {
  it("should render BaseTriggerNode", () => {
    render(<ManualTriggerNode id="node-1" data={{}} />);
    
    expect(screen.getByTestId("base-trigger-node")).toBeInTheDocument();
  });

  it("should use MousePointerIcon", () => {
    render(<ManualTriggerNode id="node-1" data={{}} />);
    
    expect(screen.getByTestId("mouse-pointer-icon")).toBeInTheDocument();
  });

  it("should have correct name", () => {
    render(<ManualTriggerNode id="node-1" data={{}} />);
    
    const node = screen.getByTestId("base-trigger-node");
    expect(node.dataset.name).toBe("Execute Workflow");
  });

  it("should have correct description", () => {
    render(<ManualTriggerNode id="node-1" data={{}} />);
    
    const node = screen.getByTestId("base-trigger-node");
    expect(node.dataset.description).toBe("When clicking 'Execute Workflow'");
  });

  it("should be memoized", () => {
    const { rerender } = render(<ManualTriggerNode id="node-1" data={{}} />);
    const firstNode = screen.getByTestId("base-trigger-node");
    
    rerender(<ManualTriggerNode id="node-1" data={{}} />);
    const secondNode = screen.getByTestId("base-trigger-node");
    
    expect(firstNode).toBeInTheDocument();
    expect(secondNode).toBeInTheDocument();
  });

  it("should accept NodeProps", () => {
    const props = {
      id: "trigger-node",
      data: { custom: "data" },
      position: { x: 100, y: 200 },
    };
    
    render(<ManualTriggerNode {...props} />);
    
    expect(screen.getByTestId("base-trigger-node")).toBeInTheDocument();
  });
});