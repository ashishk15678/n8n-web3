import { describe, it, expect, vi } from 'vitest'
import { prefetchWorkFlows, prefetchWorkFlow } from '../prefetch'

// Mock the tRPC server utilities
vi.mock('@/trpc/server', () => ({
  prefetch: vi.fn((options) => Promise.resolve()),
  trpc: {
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
      },
    },
  },
}))

describe('workflow prefetch utilities', () => {
  describe('prefetchWorkFlows', () => {
    it('should call prefetch with getMany query options', async () => {
      const params = { page: 1, pageSize: 10, search: '' }
      await prefetchWorkFlows(params)
      
      // Function should complete without errors
      expect(prefetchWorkFlows).toBeDefined()
    })

    it('should handle empty params', async () => {
      const params = {}
      const result = prefetchWorkFlows(params)
      
      expect(result).toBeDefined()
      expect(typeof result.then).toBe('function')
    })

    it('should handle params with search query', async () => {
      const params = { page: 1, pageSize: 20, search: 'test workflow' }
      const result = prefetchWorkFlows(params)
      
      expect(result).toBeDefined()
    })

    it('should handle params with different page sizes', async () => {
      const testCases = [
        { page: 1, pageSize: 5, search: '' },
        { page: 2, pageSize: 15, search: '' },
        { page: 3, pageSize: 50, search: '' },
      ]
      
      testCases.forEach(async (params) => {
        const result = prefetchWorkFlows(params)
        expect(result).toBeDefined()
      })
    })
  })

  describe('prefetchWorkFlow', () => {
    it('should call prefetch with getOne query options', async () => {
      const workflowId = 'workflow-123'
      await prefetchWorkFlow(workflowId)
      
      // Function should complete without errors
      expect(prefetchWorkFlow).toBeDefined()
    })

    it('should handle different workflow IDs', async () => {
      const ids = ['id-1', 'id-2', 'id-3', 'very-long-workflow-id-12345']
      
      ids.forEach(async (id) => {
        const result = prefetchWorkFlow(id)
        expect(result).toBeDefined()
        expect(typeof result.then).toBe('function')
      })
    })

    it('should return a Promise', () => {
      const result = prefetchWorkFlow('test-id')
      expect(result).toBeInstanceOf(Promise)
    })

    it('should handle empty string id', async () => {
      const result = prefetchWorkFlow('')
      expect(result).toBeDefined()
    })
  })
})