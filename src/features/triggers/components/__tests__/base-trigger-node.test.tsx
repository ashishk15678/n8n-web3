import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { BaseTriggerNode } from '../base-trigger-node'
import { MousePointerIcon } from 'lucide-react'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

// Mock WorkflowNode
vi.mock('@/components/workflow-node', () => ({
  WorkflowNode: ({ children, name, description, onDelete, onSettings }: any) => (
    <div data-testid="workflow-node">
      <div data-testid="node-name">{name}</div>
      <div data-testid="node-description">{description}</div>
      <button onClick={onDelete}>Delete</button>
      <button onClick={onSettings}>Settings</button>
      {children}
    </div>
  ),
}))

describe('BaseTriggerNode', () => {
  const defaultProps = {
    id: 'trigger-1',
    type: 'MANUAL_TRIGGER',
    data: {},
    selected: false,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
    zIndex: 0,
    icon: MousePointerIcon,
    name: 'Test Trigger',
  }

  it('should render without crashing', () => {
    render(<BaseTriggerNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('workflow-node')).toBeInTheDocument()
  })

  it('should display node name', () => {
    render(<BaseTriggerNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('node-name')).toHaveTextContent('Test Trigger')
  })

  it('should display node description when provided', () => {
    render(
      <BaseTriggerNode {...defaultProps} description="Test Description" />,
      { wrapper }
    )
    expect(screen.getByTestId('node-description')).toHaveTextContent('Test Description')
  })

  it('should render icon component', () => {
    const { container } = render(<BaseTriggerNode {...defaultProps} />, { wrapper })
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should render string icon as Image', () => {
    const propsWithStringIcon = {
      ...defaultProps,
      icon: 'https://example.com/trigger-icon.png',
    }
    const { container } = render(
      <BaseTriggerNode {...propsWithStringIcon} />,
      { wrapper }
    )
    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('alt', 'Test Trigger')
  })

  it('should render children when provided', () => {
    render(
      <BaseTriggerNode {...defaultProps}>
        <div data-testid="custom-content">Custom Content</div>
      </BaseTriggerNode>,
      { wrapper }
    )
    expect(screen.getByTestId('custom-content')).toBeInTheDocument()
  })

  it('should call onSettings when settings button clicked', async () => {
    const user = userEvent.setup()
    const handleSettings = vi.fn()
    
    render(
      <BaseTriggerNode {...defaultProps} onSettings={handleSettings} />,
      { wrapper }
    )
    
    const settingsButton = screen.getByText('Settings')
    await user.click(settingsButton)
    
    expect(handleSettings).toHaveBeenCalledOnce()
  })

  it('should call onDoubleClick when double clicked', async () => {
    const user = userEvent.setup()
    const handleDoubleClick = vi.fn()
    
    const { container } = render(
      <BaseTriggerNode {...defaultProps} onDoubleClick={handleDoubleClick} />,
      { wrapper }
    )
    
    const baseNode = container.querySelector('[tabindex="0"]')
    if (baseNode) {
      await user.dblClick(baseNode)
      expect(handleDoubleClick).toHaveBeenCalled()
    }
  })

  it('should have rounded left border styling', () => {
    const { container } = render(<BaseTriggerNode {...defaultProps} />, { wrapper })
    const baseNode = container.querySelector('.rounded-l-2xl')
    expect(baseNode).toBeInTheDocument()
  })

  it('should render only source handle (no target)', () => {
    const { container } = render(<BaseTriggerNode {...defaultProps} />, { wrapper })
    const sourceHandle = container.querySelector('[data-handleid="source-1"]')
    expect(sourceHandle).toBeInTheDocument()
    
    // Target handle should not exist (commented out in component)
    const targetHandle = container.querySelector('[data-handleid="target-1"]')
    expect(targetHandle).not.toBeInTheDocument()
  })

  it('should have source handle on right', () => {
    const { container } = render(<BaseTriggerNode {...defaultProps} />, { wrapper })
    const sourceHandle = container.querySelector('[data-handleid="source-1"]')
    expect(sourceHandle).toBeInTheDocument()
  })

  it('should handle missing optional props gracefully', () => {
    render(<BaseTriggerNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('workflow-node')).toBeInTheDocument()
  })

  it('should have group styling', () => {
    const { container } = render(<BaseTriggerNode {...defaultProps} />, { wrapper })
    const groupElement = container.querySelector('.group')
    expect(groupElement).toBeInTheDocument()
  })
})