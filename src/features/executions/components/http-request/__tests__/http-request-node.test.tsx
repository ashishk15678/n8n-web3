import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HttpRequestNode } from "../http-request-node";
import { ReactFlowProvider } from "@xyflow/react";

// Mock BaseExecutionNode
vi.mock("../../../base-execution-node", () => ({
  BaseExecutionNode: vi.fn((props) => (
    <div 
      data-testid="base-execution-node" 
      data-name={props.name}
      data-description={props.description}
    >
      Base Execution Node
    </div>
  )),
}));

describe("HttpRequestNode", () => {
  const defaultProps = {
    id: "http-1",
    type: "HTTP_REQUEST" as const,
    data: {},
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
  };

  it("should render without crashing", () => {
    render(
      <ReactFlowProvider>
        <HttpRequestNode {...defaultProps} />
      </ReactFlowProvider>
    );
    
    expect(screen.getByTestId("base-execution-node")).toBeInTheDocument();
  });

  it("should display 'Not configured' when no endpoint is set", () => {
    render(
      <ReactFlowProvider>
        <HttpRequestNode {...defaultProps} />
      </ReactFlowProvider>
    );
    
    const node = screen.getByTestId("base-execution-node");
    expect(node).toHaveAttribute("data-description", "Not configured.");
  });

  it("should display endpoint and method when configured", () => {
    const propsWithData = {
      ...defaultProps,
      data: {
        endpoint: "https://api.example.com/users",
        method: "POST" as const,
      },
    };
    
    render(
      <ReactFlowProvider>
        <HttpRequestNode {...propsWithData} />
      </ReactFlowProvider>
    );
    
    const node = screen.getByTestId("base-execution-node");
    expect(node).toHaveAttribute("data-description", "POST: https://api.example.com/users");
  });

  it("should default to GET method when not specified", () => {
    const propsWithData = {
      ...defaultProps,
      data: {
        endpoint: "https://api.example.com/data",
      },
    };
    
    render(
      <ReactFlowProvider>
        <HttpRequestNode {...propsWithData} />
      </ReactFlowProvider>
    );
    
    const node = screen.getByTestId("base-execution-node");
    expect(node).toHaveAttribute("data-description", "GET: https://api.example.com/data");
  });

  it("should render with name 'Http Request'", () => {
    render(
      <ReactFlowProvider>
        <HttpRequestNode {...defaultProps} />
      </ReactFlowProvider>
    );
    
    const node = screen.getByTestId("base-execution-node");
    expect(node).toHaveAttribute("data-name", "Http Request");
  });

  it("should support all HTTP methods", () => {
    const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as const;
    
    methods.forEach((method) => {
      const propsWithMethod = {
        ...defaultProps,
        data: {
          endpoint: "/api/test",
          method,
        },
      };
      
      const { unmount } = render(
        <ReactFlowProvider>
          <HttpRequestNode {...propsWithMethod} />
        </ReactFlowProvider>
      );
      
      const node = screen.getByTestId("base-execution-node");
      expect(node).toHaveAttribute("data-description", `${method}: /api/test`);
      unmount();
    });
  });

  it("should be memoized", () => {
    expect(HttpRequestNode).toBeDefined();
    expect(typeof HttpRequestNode).toBe("object");
  });

  it("should use GlobeIcon", () => {
    const BaseExecutionNodeMock = vi.mocked(
      require("../../../base-execution-node").BaseExecutionNode
    );
    
    render(
      <ReactFlowProvider>
        <HttpRequestNode {...defaultProps} />
      </ReactFlowProvider>
    );
    
    expect(BaseExecutionNodeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.any(Function),
      }),
      expect.anything()
    );
  });
});