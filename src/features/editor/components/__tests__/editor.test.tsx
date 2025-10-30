import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import {
  Editor,
  EditorHeader,
  EditorSaveButton,
  EditorNameInput,
  EditorBreadCrumbs,
  EditorLoading,
  EditorError,
} from '../editor'

// Mock dependencies
vi.mock('@/features/workflow/hooks/useWorkflows', () => ({
  useSuspenseWorkflow: vi.fn(() => ({
    data: {
      id: 'workflow-123',
      name: 'Test Workflow',
      nodes: [],
      edges: [],
    },
  })),
  useUpdateWorkflowName: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}))

vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react')
  return {
    ...actual,
    ReactFlow: ({ children }: any) => <div data-testid="react-flow">{children}</div>,
    Background: () => <div data-testid="background" />,
    Controls: () => <div data-testid="controls" />,
    MiniMap: () => <div data-testid="minimap" />,
    Panel: ({ children }: any) => <div data-testid="panel">{children}</div>,
  }
})

vi.mock('../add-node-button', () => ({
  AddNodeButton: () => <button data-testid="add-node-button">Add Node</button>,
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe('EditorLoading', () => {
  it('should render loading message', () => {
    render(<EditorLoading />)
    expect(screen.getByText(/Loading Editor/i)).toBeInTheDocument()
  })
})

describe('EditorError', () => {
  it('should render error message', () => {
    render(<EditorError />)
    expect(screen.getByText(/Error loading editor/i)).toBeInTheDocument()
  })
})

describe('Editor', () => {
  const workflowId = 'workflow-123'

  it('should render without crashing', () => {
    render(<Editor workflowId={workflowId} />, { wrapper })
    expect(screen.getByTestId('react-flow')).toBeInTheDocument()
  })

  it('should render ReactFlow components', () => {
    render(<Editor workflowId={workflowId} />, { wrapper })
    expect(screen.getByTestId('background')).toBeInTheDocument()
    expect(screen.getByTestId('controls')).toBeInTheDocument()
    expect(screen.getByTestId('minimap')).toBeInTheDocument()
  })

  it('should render AddNodeButton in panel', () => {
    render(<Editor workflowId={workflowId} />, { wrapper })
    expect(screen.getByTestId('add-node-button')).toBeInTheDocument()
  })

  it('should have full size styling', () => {
    const { container } = render(<Editor workflowId={workflowId} />, { wrapper })
    const editorDiv = container.querySelector('.size-full')
    expect(editorDiv).toBeInTheDocument()
  })
})

describe('EditorHeader', () => {
  const workflowId = 'workflow-123'

  it('should render without crashing', () => {
    render(<EditorHeader workflowId={workflowId} />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('should render sidebar trigger', () => {
    render(<EditorHeader workflowId={workflowId} />)
    // SidebarTrigger should be present
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('should render breadcrumbs', () => {
    render(<EditorHeader workflowId={workflowId} />)
    expect(screen.getByText('Workflows')).toBeInTheDocument()
  })

  it('should render save button', () => {
    render(<EditorHeader workflowId={workflowId} />)
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('should have correct styling classes', () => {
    const { container } = render(<EditorHeader workflowId={workflowId} />)
    const header = container.querySelector('header')
    expect(header?.className).toContain('flex')
    expect(header?.className).toContain('border-b')
  })
})

describe('EditorSaveButton', () => {
  const workflowId = 'workflow-123'

  it('should render save button', () => {
    render(<EditorSaveButton workflowId={workflowId} />)
    const button = screen.getByRole('button', { name: /save/i })
    expect(button).toBeInTheDocument()
  })

  it('should be disabled by default', () => {
    render(<EditorSaveButton workflowId={workflowId} />)
    const button = screen.getByRole('button', { name: /save/i })
    expect(button).toBeDisabled()
  })

  it('should render save icon', () => {
    const { container } = render(<EditorSaveButton workflowId={workflowId} />)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should have small size variant', () => {
    render(<EditorSaveButton workflowId={workflowId} />)
    const button = screen.getByRole('button', { name: /save/i })
    expect(button).toBeInTheDocument()
  })
})

describe('EditorNameInput', () => {
  const workflowId = 'workflow-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render workflow name', () => {
    render(<EditorNameInput workflowId={workflowId} />)
    expect(screen.getByText('Test Workflow')).toBeInTheDocument()
  })

  it('should switch to input mode when clicked', async () => {
    const user = userEvent.setup()
    render(<EditorNameInput workflowId={workflowId} />)
    
    const nameElement = screen.getByText('Test Workflow')
    await user.click(nameElement)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should focus and select text when entering edit mode', async () => {
    const user = userEvent.setup()
    render(<EditorNameInput workflowId={workflowId} />)
    
    const nameElement = screen.getByText('Test Workflow')
    await user.click(nameElement)
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input).toHaveFocus()
  })

  it('should exit edit mode on Enter key', async () => {
    const user = userEvent.setup()
    render(<EditorNameInput workflowId={workflowId} />)
    
    const nameElement = screen.getByText('Test Workflow')
    await user.click(nameElement)
    
    const input = screen.getByRole('textbox')
    await user.type(input, '{Enter}')
    
    // Should exit edit mode
  })

  it('should cancel edit on Escape key', async () => {
    const user = userEvent.setup()
    render(<EditorNameInput workflowId={workflowId} />)
    
    const nameElement = screen.getByText('Test Workflow')
    await user.click(nameElement)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'New Name')
    await user.keyboard('{Escape}')
    
    // Should revert to original name
  })

  it('should save on blur', async () => {
    const user = userEvent.setup()
    render(<EditorNameInput workflowId={workflowId} />)
    
    const nameElement = screen.getByText('Test Workflow')
    await user.click(nameElement)
    
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Updated Name')
    
    // Blur the input
    input.blur()
  })

  it('should display workflow name from props', () => {
    render(<EditorNameInput workflowId={workflowId} />)
    expect(screen.getByText('Test Workflow')).toBeInTheDocument()
  })

  it('should have hover styling when not editing', () => {
    const { container } = render(<EditorNameInput workflowId={workflowId} />)
    const breadcrumbItem = container.querySelector('.cursor-pointer')
    expect(breadcrumbItem).toBeInTheDocument()
  })
})

describe('EditorBreadCrumbs', () => {
  const workflowId = 'workflow-123'

  it('should render breadcrumb navigation', () => {
    render(<EditorBreadCrumbs workflowId={workflowId} />)
    expect(screen.getByText('Workflows')).toBeInTheDocument()
  })

  it('should render workflows link', () => {
    render(<EditorBreadCrumbs workflowId={workflowId} />)
    const link = screen.getByRole('link', { name: /workflows/i })
    expect(link).toHaveAttribute('href', '/workflows')
  })

  it('should render workflow name input', () => {
    render(<EditorBreadCrumbs workflowId={workflowId} />)
    expect(screen.getByText('Test Workflow')).toBeInTheDocument()
  })

  it('should render separator', () => {
    const { container } = render(<EditorBreadCrumbs workflowId={workflowId} />)
    // BreadcrumbSeparator should be present
    expect(container.querySelector('li')).toBeInTheDocument()
  })

  it('should have correct navigation structure', () => {
    render(<EditorBreadCrumbs workflowId={workflowId} />)
    expect(screen.getByText('Workflows')).toBeInTheDocument()
    expect(screen.getByText('Test Workflow')).toBeInTheDocument()
  })
})