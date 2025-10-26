import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { PlaceholderNode } from '../placeholder-node'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe('PlaceholderNode', () => {
  it('should render without crashing', () => {
    const { container } = render(<PlaceholderNode />, { wrapper })
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render children', () => {
    render(
      <PlaceholderNode>
        <span>Placeholder Content</span>
      </PlaceholderNode>,
      { wrapper }
    )
    expect(screen.getByText('Placeholder Content')).toBeInTheDocument()
  })

  it('should call onClick handler when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    const { container } = render(
      <PlaceholderNode onClick={handleClick}>Click Me</PlaceholderNode>,
      { wrapper }
    )
    
    const node = container.firstChild as HTMLElement
    await user.click(node)
    
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('should have dashed border styling', () => {
    const { container } = render(<PlaceholderNode />, { wrapper })
    const node = container.firstChild as HTMLElement
    expect(node.className).toContain('border-dashed')
  })

  it('should have gray color scheme', () => {
    const { container } = render(<PlaceholderNode />, { wrapper })
    const node = container.firstChild as HTMLElement
    expect(node.className).toContain('border-gray-400')
    expect(node.className).toContain('text-gray-400')
  })

  it('should have no shadow styling', () => {
    const { container } = render(<PlaceholderNode />, { wrapper })
    const node = container.firstChild as HTMLElement
    expect(node.className).toContain('shadow-none')
  })

  it('should render with target handle', () => {
    const { container } = render(<PlaceholderNode />, { wrapper })
    const handles = container.querySelectorAll('.react-flow__handle')
    expect(handles.length).toBeGreaterThanOrEqual(1)
  })

  it('should render with source handle', () => {
    const { container } = render(<PlaceholderNode />, { wrapper })
    const handles = container.querySelectorAll('.react-flow__handle')
    expect(handles.length).toBeGreaterThanOrEqual(1)
  })

  it('should have hidden handles', () => {
    const { container } = render(<PlaceholderNode />, { wrapper })
    const handles = container.querySelectorAll('.react-flow__handle')
    handles.forEach(handle => {
      const style = (handle as HTMLElement).style
      expect(style.visibility).toBe('hidden')
    })
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<PlaceholderNode ref={ref as any} />, { wrapper })
    expect(ref).toHaveBeenCalled()
  })

  it('should handle multiple clicks', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    const { container } = render(
      <PlaceholderNode onClick={handleClick} />,
      { wrapper }
    )
    
    const node = container.firstChild as HTMLElement
    await user.click(node)
    await user.click(node)
    await user.click(node)
    
    expect(handleClick).toHaveBeenCalledTimes(3)
  })
})