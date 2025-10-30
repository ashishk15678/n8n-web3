import { describe, it, expect } from 'vitest'
import { nodeComponents } from '../node-components'
import { NodeType } from '@/generated/prisma'
import { InitalNode } from '@/components/inital-node'
import { ManualTriggerNode } from '@/features/triggers/components/manual-trigger/manual-trigger-node'
import { HttpRequestNode } from '@/features/executions/components/http-request/http-request-node'

describe('nodeComponents', () => {
  it('should export an object with all registered node types', () => {
    expect(nodeComponents).toBeDefined()
    expect(typeof nodeComponents).toBe('object')
  })

  it('should map INITIAL node type to InitalNode component', () => {
    expect(nodeComponents[NodeType.INITIAL]).toBe(InitalNode)
  })

  it('should map MANUAL_TRIGGER node type to ManualTriggerNode component', () => {
    expect(nodeComponents[NodeType.MANUAL_TRIGGER]).toBe(ManualTriggerNode)
  })

  it('should map HTTP_REQUEST node type to HttpRequestNode component', () => {
    expect(nodeComponents[NodeType.HTTP_REQUEST]).toBe(HttpRequestNode)
  })

  it('should have exactly 3 node types registered', () => {
    expect(Object.keys(nodeComponents)).toHaveLength(3)
  })

  it('should contain all NodeType enum values as keys', () => {
    expect(nodeComponents).toHaveProperty(NodeType.INITIAL)
    expect(nodeComponents).toHaveProperty(NodeType.MANUAL_TRIGGER)
    expect(nodeComponents).toHaveProperty(NodeType.HTTP_REQUEST)
  })

  it('should have function components as values', () => {
    Object.values(nodeComponents).forEach((component) => {
      expect(typeof component).toBe('function')
    })
  })
})