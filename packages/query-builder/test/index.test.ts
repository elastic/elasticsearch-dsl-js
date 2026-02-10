/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest'
import { Op, type OpType, VERSION } from '../src/index'

describe('query-builder', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBe('0.0.1')
  })

  it('should export Op from index', () => {
    expect(Op.eq).toBeDefined()
    expect(Op.gt).toBeDefined()
    expect(typeof Op.eq).toBe('symbol')
  })

  it('OpType is usable as type', () => {
    const _op: OpType = Op
    expect(_op).toBe(Op)
  })
})
