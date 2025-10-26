# Test Utilities

This directory contains shared test utilities and setup files.

## Files

### setup.ts
Global test setup that runs before all tests:
- Extends expect with jest-dom matchers
- Configures cleanup after each test
- Mocks Next.js modules (Image, Link, navigation)

### test-utils.tsx
Custom render utilities:
- `createTestQueryClient()`: Creates a test-configured QueryClient
- `AllTheProviders`: Wrapper component with all providers
- `renderWithProviders()`: Custom render with automatic provider wrapping

### mock-factories.ts
Factory functions for creating mock data:
- `createMockWorkflow()`: Create mock Workflow objects
- `createMockPrismaNode()`: Create mock Prisma Node objects
- `createMockConnection()`: Create mock Connection objects
- `createMockReactFlowNode()`: Create mock ReactFlow Node objects
- `createMockReactFlowEdge()`: Create mock ReactFlow Edge objects
- `createMockWorkflowWithDetails()`: Create complete mock workflow with nodes and connections

## Usage Examples

### Basic Component Test
```typescript
import { render, screen } from '@/test/test-utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Hook Test with Query Client
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { createTestQueryClient } from '@/test/test-utils';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should fetch data', async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useMyHook(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

### Using Mock Factories
```typescript
import { createMockWorkflow, createMockReactFlowNode } from '@/test/mock-factories';

describe('WorkflowService', () => {
  it('should process workflow', () => {
    const workflow = createMockWorkflow({ name: 'Test Workflow' });
    const node = createMockReactFlowNode({ type: NodeType.MANUAL_TRIGGER });
    
    // Your test logic here
  });
});
```