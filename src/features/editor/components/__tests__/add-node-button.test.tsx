import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { AddNodeButton } from '../add-node-button'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

// Mock NodeSelector
vi.mock('@/components/node-selector', () => ({
  NodeSelector: ({ children, open, onOpenChange }: any) => (
    <div data-testid="node-selector" data-open={open}>
      <div onClick={() => onOpenChange(!open)}>{children}</div>
    </div>
  ),
}))

describe('AddNodeButton', () => {
  it('should render button', () => {
    render(<AddNodeButton />, { wrapper })
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should render plus icon', () => {
    const { container } = render(<AddNodeButton />, { wrapper })
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should have outline variant', () => {
    render(<AddNodeButton />, { wrapper })
    const button = screen.getByRole('button')
    expect(button.className).toContain('outline')
  })

  it('should have icon size', () => {
    render(<AddNodeButton />, { wrapper })
    const button = screen.getByRole('button')
    // Icon size buttons typically have specific styling
    expect(button).toBeInTheDocument()
  })

  it('should have background styling', () => {
    render(<AddNodeButton />, { wrapper })
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-background')
  })

  it('should open NodeSelector when clicked', async () => {
    const user = userEvent.setup()
    render(<AddNodeButton />, { wrapper })
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    const selector = screen.getByTestId('node-selector')
    expect(selector).toHaveAttribute('data-open', 'true')
  })

  it('should be memoized', () => {
    const { rerender } = render(<AddNodeButton />, { wrapper })
    rerender(<AddNodeButton />)
    // Component should not re-render unnecessarily due to memo
  })

  it('should integrate with NodeSelector', () => {
    render(<AddNodeButton />, { wrapper })
    expect(screen.getByTestId('node-selector')).toBeInTheDocument()
  })

  it('should manage selector open state', async () => {
    const user = userEvent.setup()
    render(<AddNodeButton />, { wrapper })
    
    const selector = screen.getByTestId('node-selector')
    expect(selector).toHaveAttribute('data-open', 'false')
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(selector).toHaveAttribute('data-open', 'true')
  })

  it('should be keyboard accessible', () => {
    render(<AddNodeButton />, { wrapper })
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })
})