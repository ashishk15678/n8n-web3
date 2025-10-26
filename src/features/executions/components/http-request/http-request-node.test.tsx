import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HttpRequestNode } from "./http-request-node";

vi.mock("../../base-execution-node", () => ({
  BaseExecutionNode: vi.fn(({ icon: Icon, name, description, onSettings, onDoubleClick, id }) => (
    <div 
      data-testid="base-execution-node" 
      data-name={name} 
      data-description={description}
      data-id={id}
    >
      {typeof Icon === 'function' && <Icon />}
    </div>
  )),
}));

vi.mock("lucide-react", () => ({
  GlobeIcon: () => <span data-testid="globe-icon">Globe</span>,
}));

describe("HttpRequestNode", () => {
  const defaultData = {};

  it("should render BaseExecutionNode", () => {
    render(<HttpRequestNode id="node-1" data={defaultData} />);
    
    expect(screen.getByTestId("base-execution-node")).toBeInTheDocument();
  });

  it("should use GlobeIcon", () => {
    render(<HttpRequestNode id="node-1" data={defaultData} />);
    
    expect(screen.getByTestId("globe-icon")).toBeInTheDocument();
  });

  it("should have correct name", () => {
    render(<HttpRequestNode id="node-1" data={defaultData} />);
    
    const node = screen.getByTestId("base-execution-node");
    expect(node.dataset.name).toBe("Http Request");
  });

  it("should show 'Not configured.' when no endpoint provided", () => {
    render(<HttpRequestNode id="node-1" data={defaultData} />);
    
    const node = screen.getByTestId("base-execution-node");
    expect(node.dataset.description).toBe("Not configured.");
  });

  it("should display endpoint with GET method by default", () => {
    const data = {
      endpoint: "https://api.example.com/users",
    };
    
    render(<HttpRequestNode id="node-1" data={data} />);
    
    const node = screen.getByTestId("base-execution-node");
    expect(node.dataset.description).toBe("GET: https://api.example.com/users");
  });

  it("should display endpoint with specified method", () => {
    const data = {
      endpoint: "https://api.example.com/users",
      method: "POST" as const,
    };
    
    render(<HttpRequestNode id="node-1" data={data} />);
    
    const node = screen.getByTestId("base-execution-node");
    expect(node.dataset.description).toBe("POST: https://api.example.com/users");
  });

  it("should handle different HTTP methods", () => {
    const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as const;
    
    methods.forEach((method) => {
      const { unmount } = render(
        <HttpRequestNode 
          id="node-1" 
          data={{ endpoint: "/api/test", method }} 
        />
      );
      
      const node = screen.getByTestId("base-execution-node");
      expect(node.dataset.description).toBe(`${method}: /api/test`);
      unmount();
    });
  });

  it("should pass node id correctly", () => {
    render(<HttpRequestNode id="http-node-123" data={defaultData} />);
    
    const node = screen.getByTestId("base-execution-node");
    expect(node.dataset.id).toBe("http-node-123");
  });

  it("should be memoized", () => {
    const { rerender } = render(<HttpRequestNode id="node-1" data={defaultData} />);
    const firstNode = screen.getByTestId("base-execution-node");
    
    rerender(<HttpRequestNode id="node-1" data={defaultData} />);
    const secondNode = screen.getByTestId("base-execution-node");
    
    expect(firstNode).toBeInTheDocument();
    expect(secondNode).toBeInTheDocument();
  });

  it("should have displayName set", () => {
    expect(HttpRequestNode.displayName).toBe("HttpRequestNode");
  });

  it("should handle additional data fields", () => {
    const data = {
      endpoint: "/api/test",
      method: "POST" as const,
      body: '{"key": "value"}',
      customField: "custom",
    };
    
    render(<HttpRequestNode id="node-1" data={data} />);
    
    const node = screen.getByTestId("base-execution-node");
    expect(node).toBeInTheDocument();
  });

  it("should handle empty string endpoint", () => {
    const data = {
      endpoint: "",
    };
    
    render(<HttpRequestNode id="node-1" data={data} />);
    
    const node = screen.getByTestId("base-execution-node");
    // Empty string is falsy, so should show "Not configured."
    expect(node.dataset.description).toBe("Not configured.");
  });

  it("should handle URL with query parameters", () => {
    const data = {
      endpoint: "https://api.example.com/users?page=1&limit=10",
      method: "GET" as const,
    };
    
    render(<HttpRequestNode id="node-1" data={data} />);
    
    const node = screen.getByTestId("base-execution-node");
    expect(node.dataset.description).toBe("GET: https://api.example.com/users?page=1&limit=10");
  });
});