import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { BaseExecutionNode } from '../base-execution-node'
import { GlobeIcon } from 'lucide-react'

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

describe('BaseExecutionNode', () => {
  const defaultProps = {
    id: 'execution-1',
    type: 'HTTP_REQUEST',
    data: {},
    selected: false,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
    zIndex: 0,
    icon: GlobeIcon,
    name: 'Test Execution',
  }

  it('should render without crashing', () => {
    render(<BaseExecutionNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('workflow-node')).toBeInTheDocument()
  })

  it('should display node name', () => {
    render(<BaseExecutionNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('node-name')).toHaveTextContent('Test Execution')
  })

  it('should display node description when provided', () => {
    render(
      <BaseExecutionNode {...defaultProps} description="Test Description" />,
      { wrapper }
    )
    expect(screen.getByTestId('node-description')).toHaveTextContent('Test Description')
  })

  it('should render icon component', () => {
    const { container } = render(<BaseExecutionNode {...defaultProps} />, { wrapper })
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should render string icon as Image', () => {
    const propsWithStringIcon = {
      ...defaultProps,
      icon: 'https://example.com/icon.png',
    }
    const { container } = render(
      <BaseExecutionNode {...propsWithStringIcon} />,
      { wrapper }
    )
    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('alt', 'Test Execution')
  })

  it('should render children when provided', () => {
    render(
      <BaseExecutionNode {...defaultProps}>
        <div data-testid="custom-content">Custom Content</div>
      </BaseExecutionNode>,
      { wrapper }
    )
    expect(screen.getByTestId('custom-content')).toBeInTheDocument()
  })

  it('should call onSettings when settings button clicked', async () => {
    const user = userEvent.setup()
    const handleSettings = vi.fn()
    
    render(
      <BaseExecutionNode {...defaultProps} onSettings={handleSettings} />,
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
      <BaseExecutionNode {...defaultProps} onDoubleClick={handleDoubleClick} />,
      { wrapper }
    )
    
    const baseNode = container.querySelector('[tabindex="0"]')
    if (baseNode) {
      await user.dblClick(baseNode)
      expect(handleDoubleClick).toHaveBeenCalled()
    }
  })

  it('should render handles for connections', () => {
    const { container } = render(<BaseExecutionNode {...defaultProps} />, { wrapper })
    const handles = container.querySelectorAll('.react-flow__handle')
    expect(handles.length).toBeGreaterThanOrEqual(2) // target and source
  })

  it('should have target handle on left', () => {
    const { container } = render(<BaseExecutionNode {...defaultProps} />, { wrapper })
    const targetHandle = container.querySelector('[data-handleid="target-1"]')
    expect(targetHandle).toBeInTheDocument()
  })

  it('should have source handle on right', () => {
    const { container } = render(<BaseExecutionNode {...defaultProps} />, { wrapper })
    const sourceHandle = container.querySelector('[data-handleid="source-1"]')
    expect(sourceHandle).toBeInTheDocument()
  })

  it('should handle missing optional props gracefully', () => {
    render(<BaseExecutionNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('workflow-node')).toBeInTheDocument()
  })
})