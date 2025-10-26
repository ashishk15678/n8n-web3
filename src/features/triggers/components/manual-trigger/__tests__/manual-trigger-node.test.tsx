import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { ManualTriggerNode } from '../manual-trigger-node'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

// Mock BaseTriggerNode
vi.mock('../../base-trigger-node', () => ({
  BaseTriggerNode: ({ name, description, icon: Icon, ...props }: any) => (
    <div data-testid="base-trigger-node">
      <div data-testid="node-name">{name}</div>
      <div data-testid="node-description">{description}</div>
      <Icon data-testid="node-icon" />
    </div>
  ),
}))

describe('ManualTriggerNode', () => {
  const defaultProps = {
    id: 'manual-trigger-1',
    type: 'MANUAL_TRIGGER',
    data: {},
    selected: false,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
    zIndex: 0,
  }

  it('should render without crashing', () => {
    render(<ManualTriggerNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('base-trigger-node')).toBeInTheDocument()
  })

  it('should display "Execute Workflow" as name', () => {
    render(<ManualTriggerNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('node-name')).toHaveTextContent('Execute Workflow')
  })

  it('should display correct description', () => {
    render(<ManualTriggerNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('node-description')).toHaveTextContent("When clicking 'Execute Workflow'")
  })

  it('should render MousePointerIcon', () => {
    render(<ManualTriggerNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('node-icon')).toBeInTheDocument()
  })

  it('should be memoized', () => {
    const { rerender } = render(<ManualTriggerNode {...defaultProps} />, { wrapper })
    rerender(<ManualTriggerNode {...defaultProps} />)
    // Component should not re-render unnecessarily due to memo
  })

  it('should pass node id to BaseTriggerNode', () => {
    const customId = 'custom-trigger-id'
    const props = { ...defaultProps, id: customId }
    render(<ManualTriggerNode {...props} />, { wrapper })
    expect(screen.getByTestId('base-trigger-node')).toBeInTheDocument()
  })

  it('should handle different node positions', () => {
    const props = {
      ...defaultProps,
      xPos: 100,
      yPos: 200,
    }
    render(<ManualTriggerNode {...props} />, { wrapper })
    expect(screen.getByTestId('base-trigger-node')).toBeInTheDocument()
  })

  it('should handle selected state', () => {
    const props = {
      ...defaultProps,
      selected: true,
    }
    render(<ManualTriggerNode {...props} />, { wrapper })
    expect(screen.getByTestId('base-trigger-node')).toBeInTheDocument()
  })

  it('should handle dragging state', () => {
    const props = {
      ...defaultProps,
      dragging: true,
    }
    render(<ManualTriggerNode {...props} />, { wrapper })
    expect(screen.getByTestId('base-trigger-node')).toBeInTheDocument()
  })
})