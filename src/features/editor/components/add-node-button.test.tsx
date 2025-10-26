import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddNodeButton } from "./add-node-button";

vi.mock("@/components/node-selector", () => ({
  NodeSelector: vi.fn(({ children, open, onOpenChange }) => (
    <div data-testid="node-selector" data-open={open?.toString()}>
      <div onClick={() => onOpenChange(!open)}>{children}</div>
    </div>
  )),
}));

vi.mock("@/components/ui/button", () => ({
  Button: vi.fn(({ children, onClick, size, variant, className }) => (
    <button 
      data-testid="add-button"
      onClick={onClick}
      data-size={size}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  )),
}));

vi.mock("lucide-react", () => ({
  PlusIcon: () => <span data-testid="plus-icon">+</span>,
}));

describe("AddNodeButton", () => {
  it("should render button with plus icon", () => {
    render(<AddNodeButton />);
    
    expect(screen.getByTestId("add-button")).toBeInTheDocument();
    expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
  });

  it("should wrap button in NodeSelector", () => {
    render(<AddNodeButton />);
    
    expect(screen.getByTestId("node-selector")).toBeInTheDocument();
  });

  it("should start with selector closed", () => {
    render(<AddNodeButton />);
    
    const selector = screen.getByTestId("node-selector");
    expect(selector.dataset.open).toBe("false");
  });

  it("should open selector when button clicked", () => {
    render(<AddNodeButton />);
    
    const button = screen.getByTestId("add-button");
    fireEvent.click(button);
    
    const selector = screen.getByTestId("node-selector");
    expect(selector.dataset.open).toBe("true");
  });

  it("should have icon size variant", () => {
    render(<AddNodeButton />);
    
    const button = screen.getByTestId("add-button");
    expect(button.dataset.size).toBe("icon");
  });

  it("should have outline variant", () => {
    render(<AddNodeButton />);
    
    const button = screen.getByTestId("add-button");
    expect(button.dataset.variant).toBe("outline");
  });

  it("should have background styling", () => {
    render(<AddNodeButton />);
    
    const button = screen.getByTestId("add-button");
    expect(button.className).toContain("bg-background");
  });

  it("should be memoized", () => {
    const { rerender } = render(<AddNodeButton />);
    const firstButton = screen.getByTestId("add-button");
    
    rerender(<AddNodeButton />);
    const secondButton = screen.getByTestId("add-button");
    
    expect(firstButton).toBeInTheDocument();
    expect(secondButton).toBeInTheDocument();
  });

  it("should have displayName set", () => {
    expect(AddNodeButton.displayName).toBe("AddNodeButton");
  });
});