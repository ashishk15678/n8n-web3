import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { NodeSelector } from '../node-selector'
import { NodeType } from '@/generated/prisma'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

// Mock createId
vi.mock('@paralleldrive/cuid2', () => ({
  createId: vi.fn(() => 'test-cuid-123'),
}))

describe('NodeSelector', () => {
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render when open', () => {
    render(
      <NodeSelector open={true} onOpenChange={mockOnOpenChange}>
        <button>Trigger</button>
      </NodeSelector>,
      { wrapper }
    )
    
    expect(screen.getByText(/What triggers this workflow/i)).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(
      <NodeSelector open={false} onOpenChange={mockOnOpenChange}>
        <button>Trigger</button>
      </NodeSelector>,
      { wrapper }
    )
    
    expect(screen.queryByText(/What triggers this workflow/i)).not.toBeInTheDocument()
  })

  it('should render trigger nodes section', () => {
    render(
      <NodeSelector open={true} onOpenChange={mockOnOpenChange}>
        <button>Trigger</button>
      </NodeSelector>,
      { wrapper }
    )
    
    expect(screen.getByText(/Trigger Manually/i)).toBeInTheDocument()
  })

  it('should render execution nodes section', () => {
    render(
      <NodeSelector open={true} onOpenChange={mockOnOpenChange}>
        <button>Trigger</button>
      </NodeSelector>,
      { wrapper }
    )
    
    expect(screen.getByText(/Http Request/i)).toBeInTheDocument()
  })

  it('should display trigger node description', () => {
    render(
      <NodeSelector open={true} onOpenChange={mockOnOpenChange}>
        <button>Trigger</button>
      </NodeSelector>,
      { wrapper }
    )
    
    expect(screen.getByText(/Trigger manually your workflow/i)).toBeInTheDocument()
  })

  it('should display execution node description', () => {
    render(
      <NodeSelector open={true} onOpenChange={mockOnOpenChange}>
        <button>Trigger</button>
      </NodeSelector>,
      { wrapper }
    )
    
    expect(screen.getByText(/Make http requests with ease/i)).toBeInTheDocument()
  })

  it('should render separator between sections', () => {
    const { container } = render(
      <NodeSelector open={true} onOpenChange={mockOnOpenChange}>
        <button>Trigger</button>
      </NodeSelector>,
      { wrapper }
    )
    
    // Separator component should be rendered
    expect(container.querySelector('[role="separator"]')).toBeInTheDocument()
  })

  it('should call onOpenChange when selection is made', async () => {
    const user = userEvent.setup()
    render(
      <NodeSelector open={true} onOpenChange={mockOnOpenChange}>
        <button>Trigger</button>
      </NodeSelector>,
      { wrapper }
    )
    
    const httpRequestNode = screen.getByText(/Http Request/i)
    await user.click(httpRequestNode.closest('div')!)
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('should render icons for nodes', () => {
    const { container } = render(
      <NodeSelector open={true} onOpenChange={mockOnOpenChange}>
        <button>Trigger</button>
      </NodeSelector>,
      { wrapper }
    )
    
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('should have hover effect on node options', () => {
    const { container } = render(
      <NodeSelector open={true} onOpenChange={mockOnOpenChange}>
        <button>Trigger</button>
      </NodeSelector>,
      { wrapper }
    )
    
    const nodeOptions = container.querySelectorAll('.cursor-pointer')
    expect(nodeOptions.length).toBeGreaterThan(0)
  })

  it('should render children as trigger', () => {
    render(
      <NodeSelector open={false} onOpenChange={mockOnOpenChange}>
        <button data-testid="custom-trigger">Custom Trigger</button>
      </NodeSelector>,
      { wrapper }
    )
    
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument()
  })
})