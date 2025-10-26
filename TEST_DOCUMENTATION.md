# Test Suite Documentation

This document provides an overview of the comprehensive test suite created for the workflow editor feature.

## Test Infrastructure

### Setup Files
- **`vitest.config.ts`**: Vitest configuration with React support and jsdom environment
- **`src/test/setup.ts`**: Global test setup with mocks for Next.js modules
- **`src/test/test-utils.tsx`**: Custom render utilities with React Query provider
- **`src/test/mock-factories.ts`**: Factory functions for creating mock data

### Testing Stack
- **Vitest**: Fast, modern test runner
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **jsdom**: Browser environment simulation

## Test Files Created

### 1. Configuration Tests
**File**: `src/config/node-components.test.ts`
- ✅ Validates node type to component mappings
- ✅ Tests all three node types (INITIAL, MANUAL_TRIGGER, HTTP_REQUEST)
- ✅ Verifies component references are valid functions
- ✅ Ensures exactly 3 node types are registered

### 2. Server-Side Tests

#### Prefetch Functions
**File**: `src/features/workflow/server/prefetch.test.ts`
- ✅ Tests `prefetchWorkFlows` with various pagination parameters
- ✅ Tests `prefetchWorkFlow` for single workflow fetching
- ✅ Validates query options generation
- ✅ Tests edge cases (special characters, long strings)

#### Workflow Router
**File**: `src/features/workflow/server/routers.test.ts`
- ✅ Tests `create` endpoint - workflow creation with initial nodes
- ✅ Tests `remove` endpoint - workflow deletion with authorization
- ✅ Tests `updateName` endpoint - workflow name updates
- ✅ Tests `getOne` endpoint - fetching single workflow with transformation
- ✅ Tests `getMany` endpoint - paginated workflow listing with search
- ✅ Validates Prisma node to ReactFlow node transformation
- ✅ Validates Prisma connection to ReactFlow edge transformation
- ✅ Tests pagination calculations (hasNextPage, hasPreviousPage)

### 3. React Hook Tests

#### Workflow Hooks
**File**: `src/features/workflow/hooks/useWorkflows.test.ts`
- ✅ Tests `useSuspenseWorkflows` - fetching multiple workflows
- ✅ Tests `useCreateWorkflow` - successful creation and error toasts
- ✅ Tests `useRemoveWorkflow` - deletion with cache invalidation
- ✅ Tests `useSuspenseWorkflow` - fetching single workflow
- ✅ Tests `useUpdateWorkflowName` - name updates with cache invalidation
- ✅ Validates query invalidation on mutations
- ✅ Tests error handling with missing error messages

### 4. Base Component Tests

#### BaseHandle
**File**: `src/components/reactflow/base-handle.test.tsx`
- ✅ Tests rendering with source/target types
- ✅ Tests all position values (top, bottom, left, right)
- ✅ Tests custom className application
- ✅ Tests children rendering
- ✅ Tests ref forwarding
- ✅ Validates props pass-through

#### BaseNode Components
**File**: `src/components/reactflow/base-node.test.tsx`
- ✅ Tests `BaseNode` - main container with styling
- ✅ Tests `BaseNodeHeader` - header layout
- ✅ Tests `BaseNodeHeaderTitle` - title text styling
- ✅ Tests `BaseNodeContent` - content area flex layout
- ✅ Tests `BaseNodeFooter` - footer with border
- ✅ Tests component composition
- ✅ Tests ref forwarding for all components
- ✅ Validates accessibility attributes

#### PlaceholderNode
**File**: `src/components/reactflow/placeholder-node.test.tsx`
- ✅ Tests rendering with dashed border styling
- ✅ Tests onClick handler functionality
- ✅ Tests hidden handles (target and source)
- ✅ Tests non-connectable handles
- ✅ Tests ref forwarding
- ✅ Tests children rendering

### 5. Workflow Node Tests

#### WorkflowNode
**File**: `src/components/workflow-node.test.tsx`
- ✅ Tests toolbar visibility toggle
- ✅ Tests settings and delete buttons
- ✅ Tests button click handlers
- ✅ Tests name and description display
- ✅ Tests toolbar positioning (bottom for name/description)
- ✅ Tests toolbar visibility states
- ✅ Tests graceful handling of missing callbacks

#### InitialNode
**File**: `src/components/inital-node.test.tsx`
- ✅ Tests placeholder rendering with plus icon
- ✅ Tests NodeSelector integration
- ✅ Tests click to open selector
- ✅ Tests toolbar disabled state
- ✅ Tests memo optimization
- ✅ Validates displayName

### 6. Node Selector Tests

**File**: `src/components/node-selector.test.tsx`
- ✅ Tests sheet rendering with title and description
- ✅ Tests trigger nodes section rendering
- ✅ Tests execution nodes section rendering
- ✅ Tests separator between sections
- ✅ Tests node selection and addition to canvas
- ✅ Tests manual trigger duplicate prevention
- ✅ Tests selector close after selection
- ✅ Tests initial node replacement logic
- ✅ Tests random position generation
- ✅ Tests ReactFlow integration (setNodes, getNodes, screenToFlowPosition)

### 7. Editor Component Tests

#### AddNodeButton
**File**: `src/features/editor/components/add-node-button.test.tsx`
- ✅ Tests button rendering with plus icon
- ✅ Tests NodeSelector wrapping
- ✅ Tests open/close state management
- ✅ Tests button styling (icon size, outline variant)
- ✅ Tests memo optimization
- ✅ Validates displayName

### 8. Trigger Node Tests

#### BaseTriggerNode
**File**: `src/features/triggers/components/base-trigger-node.test.tsx`
- ✅ Tests icon component rendering
- ✅ Tests icon string (image) rendering
- ✅ Tests name and description display
- ✅ Tests children rendering
- ✅ Tests source handle on right (no target handle)
- ✅ Tests rounded-l-2xl styling
- ✅ Tests onDoubleClick handler
- ✅ Tests onSettings callback
- ✅ Validates displayName

#### ManualTriggerNode
**File**: `src/features/triggers/components/manual-trigger/manual-trigger-node.test.tsx`
- ✅ Tests BaseTriggerNode integration
- ✅ Tests MousePointerIcon usage
- ✅ Tests correct name: "Execute Workflow"
- ✅ Tests correct description
- ✅ Tests memo optimization
- ✅ Tests NodeProps acceptance

### 9. Execution Node Tests

#### BaseExecutionNode
**File**: `src/features/executions/base-execution-node.test.tsx`
- ✅ Tests icon component rendering
- ✅ Tests icon string (image) rendering
- ✅ Tests name and description display
- ✅ Tests children rendering
- ✅ Tests both target (left) and source (right) handles
- ✅ Tests onDoubleClick handler
- ✅ Tests onSettings callback
- ✅ Validates displayName

#### HttpRequestNode
**File**: `src/features/executions/components/http-request/http-request-node.test.tsx`
- ✅ Tests BaseExecutionNode integration
- ✅ Tests GlobeIcon usage
- ✅ Tests "Not configured" state when no endpoint
- ✅ Tests endpoint display with default GET method
- ✅ Tests all HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS)
- ✅ Tests URL with query parameters
- ✅ Tests empty endpoint handling
- ✅ Tests memo optimization
- ✅ Tests additional data fields
- ✅ Validates displayName

## Test Coverage Summary

### Total Test Files: 15
### Total Test Cases: 250+

### Coverage by Category:
- **Configuration**: 10 tests
- **Server-Side Logic**: 45 tests  
- **React Hooks**: 20 tests
- **Base Components**: 50 tests
- **Workflow Components**: 40 tests
- **Node Selector**: 20 tests
- **Trigger Nodes**: 25 tests
- **Execution Nodes**: 40 tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/config/node-components.test.ts

# Run tests matching pattern
npm test -- --grep "BaseNode"
```

## Test Patterns Used

### 1. Component Testing
- Rendering tests
- User interaction tests
- Props validation
- Children rendering
- Ref forwarding
- Memo optimization verification

### 2. Hook Testing
- Query/mutation option generation
- Success/error callback testing
- Cache invalidation verification
- State management testing

### 3. Pure Function Testing
- Input/output validation
- Edge case handling
- Type checking
- Transformation logic

### 4. Integration Testing
- Component composition
- ReactFlow integration
- tRPC integration
- Query client integration

## Best Practices Followed

1. **Comprehensive Coverage**: Each component/function has tests for:
   - Happy paths
   - Edge cases
   - Error conditions
   - Boundary values

2. **Descriptive Test Names**: All tests use clear, descriptive names following the pattern:
   - "should [expected behavior] when [condition]"

3. **Isolation**: Each test is independent and doesn't rely on other tests

4. **Mocking**: External dependencies are properly mocked:
   - Next.js modules (Image, Link)
   - ReactFlow hooks
   - tRPC client
   - Toast notifications

5. **Cleanup**: Automatic cleanup after each test to prevent memory leaks

6. **Type Safety**: All tests use TypeScript for type safety

7. **Accessibility**: Tests include accessibility attribute validation

## Key Testing Decisions

### Why Vitest?
- Faster than Jest (uses Vite's transformation pipeline)
- Native ESM support
- Better TypeScript support
- Compatible with React Testing Library
- Built-in coverage

### Why React Testing Library?
- Focuses on testing user behavior
- Encourages accessibility
- Avoids implementation details
- Industry standard for React testing

### Mocking Strategy
- Mock at module boundaries
- Use vi.mock for consistent mocking
- Reset mocks between tests with beforeEach
- Mock only what's necessary

## Future Enhancements

1. **Visual Regression Testing**: Add screenshot testing for UI components
2. **E2E Tests**: Add Playwright tests for complete user flows
3. **Performance Tests**: Add performance benchmarks
4. **Mutation Testing**: Use Stryker for mutation testing
5. **Contract Testing**: Add API contract tests with Pact

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
- **Solution**: Check tsconfig paths and vitest.config.ts alias configuration

**Issue**: Tests timeout
- **Solution**: Increase timeout in test or check for unresolved promises

**Issue**: Mock not working
- **Solution**: Ensure mock is hoisted with vi.mock at top of file

**Issue**: "window is not defined"
- **Solution**: Verify jsdom environment is configured in vitest.config.ts

## Contributing

When adding new tests:
1. Follow existing patterns and naming conventions
2. Group related tests with describe blocks
3. Use beforeEach for common setup
4. Mock external dependencies
5. Test both success and failure cases
6. Include edge cases
7. Update this documentation

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)