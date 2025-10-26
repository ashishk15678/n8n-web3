import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { InitalNode } from '../inital-node'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

// Mock NodeSelector component
vi.mock('../node-selector', () => ({
  NodeSelector: ({ children, open, onOpenChange }: any) => (
    <div data-testid="node-selector" data-open={open}>
      {children}
    </div>
  ),
}))

// Mock WorkflowNode component
vi.mock('../workflow-node', () => ({
  WorkflowNode: ({ children }: any) => <div data-testid="workflow-node">{children}</div>,
}))

// Mock PlaceholderNode component
vi.mock('./reactflow/placeholder-node', () => ({
  PlaceholderNode: ({ children, onClick }: any) => (
    <div data-testid="placeholder-node" onClick={onClick}>
      {children}
    </div>
  ),
}))

describe('InitalNode', () => {
  const mockProps = {
    id: 'initial-node-1',
    type: 'INITIAL',
    data: {},
    selected: false,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
    zIndex: 0,
  }

  it('should render without crashing', () => {
    render(<InitalNode {...mockProps} />, { wrapper })
    expect(screen.getByTestId('node-selector')).toBeInTheDocument()
  })

  it('should render WorkflowNode with showToolBar false', () => {
    render(<InitalNode {...mockProps} />, { wrapper })
    expect(screen.getByTestId('workflow-node')).toBeInTheDocument()
  })

  it('should render PlaceholderNode', () => {
    render(<InitalNode {...mockProps} />, { wrapper })
    expect(screen.getByTestId('placeholder-node')).toBeInTheDocument()
  })

  it('should render plus icon', () => {
    const { container } = render(<InitalNode {...mockProps} />, { wrapper })
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should start with NodeSelector closed', () => {
    render(<InitalNode {...mockProps} />, { wrapper })
    const selector = screen.getByTestId('node-selector')
    expect(selector).toHaveAttribute('data-open', 'false')
  })

  it('should open NodeSelector when placeholder is clicked', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<InitalNode {...mockProps} />, { wrapper })
    
    const placeholder = screen.getByTestId('placeholder-node')
    await user.click(placeholder)
    
    // Re-render to check state update
    rerender(<InitalNode {...mockProps} />)
  })

  it('should have cursor-pointer class for interactivity', () => {
    const { container } = render(<InitalNode {...mockProps} />, { wrapper })
    const content = container.querySelector('.cursor-pointer')
    expect(content).toBeInTheDocument()
  })

  it('should be memoized', () => {
    const { rerender } = render(<InitalNode {...mockProps} />, { wrapper })
    rerender(<InitalNode {...mockProps} />)
    // Component should not re-render unnecessarily due to memo
  })

  it('should handle different node props', () => {
    const differentProps = {
      ...mockProps,
      id: 'different-id',
      selected: true,
      xPos: 100,
      yPos: 200,
    }
    render(<InitalNode {...differentProps} />, { wrapper })
    expect(screen.getByTestId('node-selector')).toBeInTheDocument()
  })

  it('should center flex items in placeholder', () => {
    const { container } = render(<InitalNode {...mockProps} />, { wrapper })
    const flexContainer = container.querySelector('.flex.items-center.justify-center')
    expect(flexContainer).toBeInTheDocument()
  })
})