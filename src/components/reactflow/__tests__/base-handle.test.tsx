import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { BaseHandle } from '../base-handle'
import { Position } from '@xyflow/react'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe('BaseHandle', () => {
  it('should render without crashing', () => {
    render(
      <BaseHandle type="source" position={Position.Right} />,
      { wrapper }
    )
  })

  it('should accept and pass through position prop', () => {
    const { container } = render(
      <BaseHandle type="source" position={Position.Right} />,
      { wrapper }
    )
    expect(container.querySelector('.react-flow__handle')).toBeInTheDocument()
  })

  it('should render with target type', () => {
    const { container } = render(
      <BaseHandle type="target" position={Position.Left} />,
      { wrapper }
    )
    expect(container.querySelector('.react-flow__handle-left')).toBeInTheDocument()
  })

  it('should render with source type', () => {
    const { container } = render(
      <BaseHandle type="source" position={Position.Right} />,
      { wrapper }
    )
    expect(container.querySelector('.react-flow__handle-right')).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    const customClass = 'custom-handle-class'
    const { container } = render(
      <BaseHandle
        type="source"
        position={Position.Right}
        className={customClass}
      />,
      { wrapper }
    )
    const handle = container.querySelector('.react-flow__handle')
    expect(handle).toHaveClass(customClass)
  })

  it('should render children when provided', () => {
    render(
      <BaseHandle type="source" position={Position.Right}>
        <span>Handle Content</span>
      </BaseHandle>,
      { wrapper }
    )
    expect(screen.getByText('Handle Content')).toBeInTheDocument()
  })

  it('should support all position values', () => {
    const positions = [Position.Top, Position.Bottom, Position.Left, Position.Right]
    
    positions.forEach((position) => {
      const { container } = render(
        <BaseHandle type="source" position={position} />,
        { wrapper }
      )
      expect(container.querySelector('.react-flow__handle')).toBeInTheDocument()
    })
  })

  it('should accept id prop', () => {
    const handleId = 'custom-handle-id'
    const { container } = render(
      <BaseHandle
        type="source"
        position={Position.Right}
        id={handleId}
      />,
      { wrapper }
    )
    const handle = container.querySelector(`[data-handleid="${handleId}"]`)
    expect(handle).toBeInTheDocument()
  })

  it('should have default styling classes', () => {
    const { container } = render(
      <BaseHandle type="source" position={Position.Right} />,
      { wrapper }
    )
    const handle = container.querySelector('.react-flow__handle')
    expect(handle?.className).toContain('rounded-full')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(
      <BaseHandle
        ref={ref as any}
        type="source"
        position={Position.Right}
      />,
      { wrapper }
    )
    expect(ref).toHaveBeenCalled()
  })
})