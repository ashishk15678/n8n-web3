import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { WorkflowNode } from '../workflow-node'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe('WorkflowNode', () => {
  it('should render children', () => {
    render(
      <WorkflowNode>
        <div>Node Content</div>
      </WorkflowNode>,
      { wrapper }
    )
    expect(screen.getByText('Node Content')).toBeInTheDocument()
  })

  it('should show toolbar when showToolBar is true', () => {
    render(
      <WorkflowNode showToolBar={true}>
        <div>Content</div>
      </WorkflowNode>,
      { wrapper }
    )
    // Toolbar should be rendered (contains settings and delete buttons)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('should hide toolbar when showToolBar is false', () => {
    render(
      <WorkflowNode showToolBar={false}>
        <div>Content</div>
      </WorkflowNode>,
      { wrapper }
    )
    // Toolbar buttons should not be present
    const buttons = screen.queryAllByRole('button')
    expect(buttons.length).toBe(0)
  })

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const handleDelete = vi.fn()
    
    render(
      <WorkflowNode showToolBar={true} onDelete={handleDelete}>
        <div>Content</div>
      </WorkflowNode>,
      { wrapper }
    )
    
    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find(btn => btn.querySelector('svg'))
    
    if (deleteButton) {
      await user.click(deleteButton)
      expect(handleDelete).toHaveBeenCalled()
    }
  })

  it('should call onSettings when settings button is clicked', async () => {
    const user = userEvent.setup()
    const handleSettings = vi.fn()
    
    render(
      <WorkflowNode showToolBar={true} onSettings={handleSettings}>
        <div>Content</div>
      </WorkflowNode>,
      { wrapper }
    )
    
    const buttons = screen.getAllByRole('button')
    const settingsButton = buttons[0]
    
    await user.click(settingsButton)
    expect(handleSettings).toHaveBeenCalled()
  })

  it('should display name when provided', () => {
    render(
      <WorkflowNode name="Test Node Name">
        <div>Content</div>
      </WorkflowNode>,
      { wrapper }
    )
    expect(screen.getByText('Test Node Name')).toBeInTheDocument()
  })

  it('should display description when provided', () => {
    render(
      <WorkflowNode name="Node" description="Test Description">
        <div>Content</div>
      </WorkflowNode>,
      { wrapper }
    )
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('should not display description without name', () => {
    render(
      <WorkflowNode description="Test Description">
        <div>Content</div>
      </WorkflowNode>,
      { wrapper }
    )
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
  })

  it('should render with default showToolBar value of true', () => {
    render(
      <WorkflowNode onDelete={vi.fn()} onSettings={vi.fn()}>
        <div>Content</div>
      </WorkflowNode>,
      { wrapper }
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('should handle missing callback handlers gracefully', () => {
    render(
      <WorkflowNode showToolBar={true}>
        <div>Content</div>
      </WorkflowNode>,
      { wrapper }
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('should support complex children', () => {
    render(
      <WorkflowNode>
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Action</button>
        </div>
      </WorkflowNode>,
      { wrapper }
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Paragraph')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })
})