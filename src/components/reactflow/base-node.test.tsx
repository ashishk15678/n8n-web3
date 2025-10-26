import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
  BaseNodeContent,
  BaseNodeFooter,
} from "./base-node";

describe("BaseNode components", () => {
  describe("BaseNode", () => {
    it("should render with children", () => {
      render(
        <BaseNode>
          <div>Node Content</div>
        </BaseNode>
      );
      
      expect(screen.getByText("Node Content")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <BaseNode className="custom-node-class">
          <div>Content</div>
        </BaseNode>
      );
      
      const node = container.firstChild as HTMLElement;
      expect(node.className).toContain("custom-node-class");
    });

    it("should have default styling classes", () => {
      const { container } = render(
        <BaseNode>
          <div>Content</div>
        </BaseNode>
      );
      
      const node = container.firstChild as HTMLElement;
      expect(node.className).toContain("rounded-md");
      expect(node.className).toContain("border");
    });

    it("should be focusable with tabIndex", () => {
      const { container } = render(
        <BaseNode>
          <div>Content</div>
        </BaseNode>
      );
      
      const node = container.firstChild as HTMLElement;
      expect(node.tabIndex).toBe(0);
    });

    it("should forward ref", () => {
      const ref = { current: null };
      render(
        <BaseNode ref={ref}>
          <div>Content</div>
        </BaseNode>
      );
      
      expect(ref.current).not.toBeNull();
    });

    it("should pass through HTML attributes", () => {
      render(
        <BaseNode data-testid="base-node" aria-label="Test Node">
          <div>Content</div>
        </BaseNode>
      );
      
      const node = screen.getByTestId("base-node");
      expect(node).toHaveAttribute("aria-label", "Test Node");
    });
  });

  describe("BaseNodeHeader", () => {
    it("should render header content", () => {
      render(
        <BaseNodeHeader>
          <h3>Header Title</h3>
        </BaseNodeHeader>
      );
      
      expect(screen.getByText("Header Title")).toBeInTheDocument();
    });

    it("should apply header-specific styling", () => {
      const { container } = render(
        <BaseNodeHeader>
          <h3>Header</h3>
        </BaseNodeHeader>
      );
      
      const header = container.firstChild as HTMLElement;
      expect(header.tagName).toBe("HEADER");
      expect(header.className).toContain("flex");
    });

    it("should forward ref", () => {
      const ref = { current: null };
      render(
        <BaseNodeHeader ref={ref}>
          <h3>Header</h3>
        </BaseNodeHeader>
      );
      
      expect(ref.current).not.toBeNull();
    });
  });

  describe("BaseNodeHeaderTitle", () => {
    it("should render title text", () => {
      render(<BaseNodeHeaderTitle>Node Title</BaseNodeHeaderTitle>);
      
      expect(screen.getByText("Node Title")).toBeInTheDocument();
    });

    it("should be a heading element", () => {
      const { container } = render(
        <BaseNodeHeaderTitle>Title</BaseNodeHeaderTitle>
      );
      
      const title = container.firstChild as HTMLElement;
      expect(title.tagName).toBe("H3");
    });

    it("should have data-slot attribute", () => {
      render(
        <BaseNodeHeaderTitle data-testid="node-title">
          Title
        </BaseNodeHeaderTitle>
      );
      
      const title = screen.getByTestId("node-title");
      expect(title).toHaveAttribute("data-slot", "base-node-title");
    });

    it("should apply font styling", () => {
      const { container } = render(
        <BaseNodeHeaderTitle>Title</BaseNodeHeaderTitle>
      );
      
      const title = container.firstChild as HTMLElement;
      expect(title.className).toContain("font-semibold");
    });
  });

  describe("BaseNodeContent", () => {
    it("should render content children", () => {
      render(
        <BaseNodeContent>
          <p>Node content here</p>
        </BaseNodeContent>
      );
      
      expect(screen.getByText("Node content here")).toBeInTheDocument();
    });

    it("should have data-slot attribute", () => {
      render(
        <BaseNodeContent data-testid="node-content">
          <p>Content</p>
        </BaseNodeContent>
      );
      
      const content = screen.getByTestId("node-content");
      expect(content).toHaveAttribute("data-slot", "base-node-content");
    });

    it("should apply flex column layout", () => {
      const { container } = render(
        <BaseNodeContent>
          <p>Content</p>
        </BaseNodeContent>
      );
      
      const content = container.firstChild as HTMLElement;
      expect(content.className).toContain("flex");
      expect(content.className).toContain("flex-col");
    });
  });

  describe("BaseNodeFooter", () => {
    it("should render footer content", () => {
      render(
        <BaseNodeFooter>
          <button>Footer Button</button>
        </BaseNodeFooter>
      );
      
      expect(screen.getByText("Footer Button")).toBeInTheDocument();
    });

    it("should have data-slot attribute", () => {
      render(
        <BaseNodeFooter data-testid="node-footer">
          <div>Footer</div>
        </BaseNodeFooter>
      );
      
      const footer = screen.getByTestId("node-footer");
      expect(footer).toHaveAttribute("data-slot", "base-node-footer");
    });

    it("should have border-top styling", () => {
      const { container } = render(
        <BaseNodeFooter>
          <div>Footer</div>
        </BaseNodeFooter>
      );
      
      const footer = container.firstChild as HTMLElement;
      expect(footer.className).toContain("border-t");
    });
  });

  describe("component composition", () => {
    it("should work together as a complete node", () => {
      render(
        <BaseNode data-testid="complete-node">
          <BaseNodeHeader>
            <BaseNodeHeaderTitle>My Node</BaseNodeHeaderTitle>
          </BaseNodeHeader>
          <BaseNodeContent>
            <p>Node content</p>
          </BaseNodeContent>
          <BaseNodeFooter>
            <button>Action</button>
          </BaseNodeFooter>
        </BaseNode>
      );
      
      expect(screen.getByTestId("complete-node")).toBeInTheDocument();
      expect(screen.getByText("My Node")).toBeInTheDocument();
      expect(screen.getByText("Node content")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
    });
  });
});