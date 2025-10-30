import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
  BaseNodeContent,
  BaseNodeFooter,
} from "../base-node";

describe("BaseNode", () => {
  it("should render without crashing", () => {
    render(<BaseNode data-testid="base-node">Content</BaseNode>);
    expect(screen.getByTestId("base-node")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(
      <BaseNode data-testid="base-node" className="custom-class">
        Content
      </BaseNode>
    );
    expect(screen.getByTestId("base-node")).toHaveClass("custom-class");
  });

  it("should render children", () => {
    render(
      <BaseNode>
        <div>Child Content</div>
      </BaseNode>
    );
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("should be focusable with tabIndex", () => {
    render(<BaseNode data-testid="base-node">Content</BaseNode>);
    const node = screen.getByTestId("base-node");
    expect(node).toHaveAttribute("tabIndex", "0");
  });

  it("should forward ref correctly", () => {
    const ref = vi.fn();
    render(<BaseNode ref={ref}>Content</BaseNode>);
    expect(ref).toHaveBeenCalled();
  });

  it("should apply default styling classes", () => {
    render(<BaseNode data-testid="base-node">Content</BaseNode>);
    const node = screen.getByTestId("base-node");
    expect(node.className).toContain("rounded-md");
    expect(node.className).toContain("border");
  });
});

describe("BaseNodeHeader", () => {
  it("should render without crashing", () => {
    render(<BaseNodeHeader data-testid="header">Header</BaseNodeHeader>);
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(
      <BaseNodeHeader data-testid="header" className="custom-header">
        Header
      </BaseNodeHeader>
    );
    expect(screen.getByTestId("header")).toHaveClass("custom-header");
  });

  it("should render as header element", () => {
    const { container } = render(<BaseNodeHeader>Header</BaseNodeHeader>);
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
  });

  it("should apply flexbox layout classes", () => {
    render(<BaseNodeHeader data-testid="header">Header</BaseNodeHeader>);
    const header = screen.getByTestId("header");
    expect(header.className).toContain("flex");
  });
});

describe("BaseNodeHeaderTitle", () => {
  it("should render without crashing", () => {
    render(<BaseNodeHeaderTitle>Title</BaseNodeHeaderTitle>);
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("should render as h3 element", () => {
    const { container } = render(<BaseNodeHeaderTitle>Title</BaseNodeHeaderTitle>);
    const title = container.querySelector("h3");
    expect(title).toBeInTheDocument();
  });

  it("should apply font-semibold class", () => {
    render(<BaseNodeHeaderTitle data-testid="title">Title</BaseNodeHeaderTitle>);
    const title = screen.getByTestId("title");
    expect(title.className).toContain("font-semibold");
  });

  it("should have user-select-none class", () => {
    render(<BaseNodeHeaderTitle data-testid="title">Title</BaseNodeHeaderTitle>);
    const title = screen.getByTestId("title");
    expect(title.className).toContain("user-select-none");
  });

  it("should have data-slot attribute", () => {
    render(<BaseNodeHeaderTitle data-testid="title">Title</BaseNodeHeaderTitle>);
    const title = screen.getByTestId("title");
    expect(title).toHaveAttribute("data-slot", "base-node-title");
  });
});

describe("BaseNodeContent", () => {
  it("should render without crashing", () => {
    render(<BaseNodeContent data-testid="content">Content</BaseNodeContent>);
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(
      <BaseNodeContent data-testid="content" className="custom-content">
        Content
      </BaseNodeContent>
    );
    expect(screen.getByTestId("content")).toHaveClass("custom-content");
  });

  it("should have flex-col class", () => {
    render(<BaseNodeContent data-testid="content">Content</BaseNodeContent>);
    const content = screen.getByTestId("content");
    expect(content.className).toContain("flex-col");
  });

  it("should have data-slot attribute", () => {
    render(<BaseNodeContent data-testid="content">Content</BaseNodeContent>);
    const content = screen.getByTestId("content");
    expect(content).toHaveAttribute("data-slot", "base-node-content");
  });

  it("should render multiple children", () => {
    render(
      <BaseNodeContent>
        <div>Child 1</div>
        <div>Child 2</div>
      </BaseNodeContent>
    );
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
  });
});

describe("BaseNodeFooter", () => {
  it("should render without crashing", () => {
    render(<BaseNodeFooter data-testid="footer">Footer</BaseNodeFooter>);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(
      <BaseNodeFooter data-testid="footer" className="custom-footer">
        Footer
      </BaseNodeFooter>
    );
    expect(screen.getByTestId("footer")).toHaveClass("custom-footer");
  });

  it("should have border-t class", () => {
    render(<BaseNodeFooter data-testid="footer">Footer</BaseNodeFooter>);
    const footer = screen.getByTestId("footer");
    expect(footer.className).toContain("border-t");
  });

  it("should have data-slot attribute", () => {
    render(<BaseNodeFooter data-testid="footer">Footer</BaseNodeFooter>);
    const footer = screen.getByTestId("footer");
    expect(footer).toHaveAttribute("data-slot", "base-node-footer");
  });

  it("should have flex-col layout", () => {
    render(<BaseNodeFooter data-testid="footer">Footer</BaseNodeFooter>);
    const footer = screen.getByTestId("footer");
    expect(footer.className).toContain("flex-col");
  });
});