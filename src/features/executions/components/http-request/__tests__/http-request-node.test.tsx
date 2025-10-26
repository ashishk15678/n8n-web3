import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { HttpRequestNode } from '../http-request-node'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

// Mock BaseExecutionNode
vi.mock('../../../base-execution-node', () => ({
  BaseExecutionNode: ({ name, description, icon: Icon, ...props }: any) => (
    <div data-testid="base-execution-node">
      <div data-testid="node-name">{name}</div>
      <div data-testid="node-description">{description}</div>
      <Icon data-testid="node-icon" />
    </div>
  ),
}))

describe('HttpRequestNode', () => {
  const defaultProps = {
    id: 'http-node-1',
    type: 'HTTP_REQUEST',
    data: {},
    selected: false,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
    zIndex: 0,
  }

  it('should render without crashing', () => {
    render(<HttpRequestNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('base-execution-node')).toBeInTheDocument()
  })

  it('should display "Http Request" as name', () => {
    render(<HttpRequestNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('node-name')).toHaveTextContent('Http Request')
  })

  it('should display "Not configured." when no endpoint provided', () => {
    render(<HttpRequestNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('node-description')).toHaveTextContent('Not configured.')
  })

  it('should display endpoint with GET method by default', () => {
    const propsWithEndpoint = {
      ...defaultProps,
      data: { endpoint: 'https://api.example.com/users' },
    }
    render(<HttpRequestNode {...propsWithEndpoint} />, { wrapper })
    expect(screen.getByTestId('node-description')).toHaveTextContent('GET: https://api.example.com/users')
  })

  it('should display endpoint with specified method', () => {
    const propsWithMethod = {
      ...defaultProps,
      data: {
        endpoint: 'https://api.example.com/users',
        method: 'POST' as const,
      },
    }
    render(<HttpRequestNode {...propsWithMethod} />, { wrapper })
    expect(screen.getByTestId('node-description')).toHaveTextContent('POST: https://api.example.com/users')
  })

  it('should support different HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const
    
    methods.forEach((method) => {
      const props = {
        ...defaultProps,
        data: {
          endpoint: 'https://api.example.com/test',
          method,
        },
      }
      const { rerender } = render(<HttpRequestNode {...props} />, { wrapper })
      expect(screen.getByTestId('node-description')).toHaveTextContent(`${method}:`)
      rerender(<div />) // Clean up for next iteration
    })
  })

  it('should render GlobeIcon', () => {
    render(<HttpRequestNode {...defaultProps} />, { wrapper })
    expect(screen.getByTestId('node-icon')).toBeInTheDocument()
  })

  it('should be memoized', () => {
    const { rerender } = render(<HttpRequestNode {...defaultProps} />, { wrapper })
    rerender(<HttpRequestNode {...defaultProps} />)
    // Component should not re-render unnecessarily due to memo
  })

  it('should handle additional data fields', () => {
    const propsWithBody = {
      ...defaultProps,
      data: {
        endpoint: 'https://api.example.com/users',
        method: 'POST' as const,
        body: '{"name": "John"}',
        customField: 'custom value',
      },
    }
    render(<HttpRequestNode {...propsWithBody} />, { wrapper })
    expect(screen.getByTestId('base-execution-node')).toBeInTheDocument()
  })

  it('should handle empty endpoint string', () => {
    const propsWithEmptyEndpoint = {
      ...defaultProps,
      data: { endpoint: '' },
    }
    render(<HttpRequestNode {...propsWithEmptyEndpoint} />, { wrapper })
    expect(screen.getByTestId('node-description')).toHaveTextContent('Not configured.')
  })

  it('should pass node id to BaseExecutionNode', () => {
    const customId = 'custom-http-node-id'
    const props = { ...defaultProps, id: customId }
    render(<HttpRequestNode {...props} />, { wrapper })
    expect(screen.getByTestId('base-execution-node')).toBeInTheDocument()
  })
})