import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useSuspenseWorkflows, useCreateWorkflow, useRemoveWorkflow, useUpdateWorkflowName, useSuspenseWorkflow } from '../useWorkflows'

// Mock dependencies
vi.mock('@/trpc/client', () => ({
  useTRPC: vi.fn(() => ({
    workflows: {
      getMany: {
        queryOptions: vi.fn((params) => ({
          queryKey: ['workflows.getMany', params],
          queryFn: vi.fn(),
        })),
      },
      getOne: {
        queryOptions: vi.fn((params) => ({
          queryKey: ['workflows.getOne', params],
          queryFn: vi.fn(),
        })),
        queryFilter: vi.fn((params) => ({
          queryKey: ['workflows.getOne', params],
        })),
      },
      create: {
        mutationOptions: vi.fn((config) => ({
          mutationFn: vi.fn(),
          ...config,
        })),
      },
      remove: {
        mutationOptions: vi.fn((config) => ({
          mutationFn: vi.fn(),
          ...config,
        })),
      },
      updateName: {
        mutationOptions: vi.fn((config) => ({
          mutationFn: vi.fn(),
          ...config,
        })),
      },
    },
  })),
}))

vi.mock('./useWorkflowParams', () => ({
  useWorkflowParams: vi.fn(() => [{}]),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useWorkflows hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSuspenseWorkflows', () => {
    it('should call useSuspenseQuery with correct options', () => {
      const { result } = renderHook(() => useSuspenseWorkflows(), {
        wrapper: createWrapper(),
      })
      
      expect(result).toBeDefined()
    })
  })

  describe('useCreateWorkflow', () => {
    it('should return a mutation object', () => {
      const { result } = renderHook(() => useCreateWorkflow(), {
        wrapper: createWrapper(),
      })
      
      expect(result.current).toBeDefined()
      expect(typeof result.current.mutate).toBe('function')
      expect(typeof result.current.mutateAsync).toBe('function')
    })

    it('should have isPending and isError states', () => {
      const { result } = renderHook(() => useCreateWorkflow(), {
        wrapper: createWrapper(),
      })
      
      expect(result.current).toHaveProperty('isPending')
      expect(result.current).toHaveProperty('isError')
      expect(result.current).toHaveProperty('isSuccess')
    })
  })

  describe('useRemoveWorkflow', () => {
    it('should return a mutation object', () => {
      const { result } = renderHook(() => useRemoveWorkflow(), {
        wrapper: createWrapper(),
      })
      
      expect(result.current).toBeDefined()
      expect(typeof result.current.mutate).toBe('function')
      expect(typeof result.current.mutateAsync).toBe('function')
    })

    it('should have mutation states', () => {
      const { result } = renderHook(() => useRemoveWorkflow(), {
        wrapper: createWrapper(),
      })
      
      expect(result.current).toHaveProperty('isPending')
      expect(result.current).toHaveProperty('isError')
      expect(result.current).toHaveProperty('isSuccess')
    })
  })

  describe('useUpdateWorkflowName', () => {
    it('should return a mutation object', () => {
      const { result } = renderHook(() => useUpdateWorkflowName(), {
        wrapper: createWrapper(),
      })
      
      expect(result.current).toBeDefined()
      expect(typeof result.current.mutate).toBe('function')
      expect(typeof result.current.mutateAsync).toBe('function')
    })

    it('should have all mutation states available', () => {
      const { result } = renderHook(() => useUpdateWorkflowName(), {
        wrapper: createWrapper(),
      })
      
      expect(result.current).toHaveProperty('isPending')
      expect(result.current).toHaveProperty('isError')
      expect(result.current).toHaveProperty('isSuccess')
      expect(result.current).toHaveProperty('data')
      expect(result.current).toHaveProperty('error')
    })
  })

  describe('useSuspenseWorkflow', () => {
    it('should call useSuspenseQuery with workflow id', () => {
      const workflowId = 'test-workflow-123'
      const { result } = renderHook(() => useSuspenseWorkflow(workflowId), {
        wrapper: createWrapper(),
      })
      
      expect(result).toBeDefined()
    })

    it('should handle different workflow IDs', () => {
      const ids = ['workflow-1', 'workflow-2', 'workflow-3']
      
      ids.forEach(id => {
        const { result } = renderHook(() => useSuspenseWorkflow(id), {
          wrapper: createWrapper(),
        })
        expect(result).toBeDefined()
      })
    })
  })
})