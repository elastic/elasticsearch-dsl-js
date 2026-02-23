/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest'
import { E, ESQL, f } from '../../src'

describe('aggregation functions', () => {
  it('avg', () => {
    expect(f.avg('salary').toString()).toBe('AVG(salary)')
    expect(f.avg(E('salary')).toString()).toBe('AVG(salary)')
  })

  it('count with default', () => {
    expect(f.count().toString()).toBe('COUNT(*)')
  })

  it('count with field', () => {
    expect(f.count('name').toString()).toBe('COUNT(name)')
    expect(f.count(E('name')).toString()).toBe('COUNT(name)')
  })

  it('count(*) literal', () => {
    expect(f.count('*').toString()).toBe('COUNT(*)')
  })

  it('countDistinct', () => {
    expect(f.countDistinct('dept').toString()).toBe('COUNT_DISTINCT(dept)')
  })

  it('countDistinct with precision', () => {
    expect(f.countDistinct('dept', 1000).toString()).toBe('COUNT_DISTINCT(dept, 1000)')
  })

  it('max', () => {
    expect(f.max('salary').toString()).toBe('MAX(salary)')
  })

  it('min', () => {
    expect(f.min('salary').toString()).toBe('MIN(salary)')
  })

  it('sum', () => {
    expect(f.sum('salary').toString()).toBe('SUM(salary)')
  })

  it('median', () => {
    expect(f.median('salary').toString()).toBe('MEDIAN(salary)')
  })

  it('medianAbsoluteDeviation', () => {
    expect(f.medianAbsoluteDeviation('salary').toString()).toBe('MEDIAN_ABSOLUTE_DEVIATION(salary)')
  })

  it('percentile', () => {
    expect(f.percentile('salary', 95).toString()).toBe('PERCENTILE(salary, 95)')
  })

  it('values', () => {
    expect(f.values('department').toString()).toBe('VALUES(department)')
  })

  it('top', () => {
    expect(f.top('salary', 5, 'DESC').toString()).toBe('TOP(salary, 5, DESC)')
  })

  it('stCentroidAgg', () => {
    expect(f.stCentroidAgg('location').toString()).toBe('ST_CENTROID_AGG(location)')
  })

  it('works inside stats()', () => {
    const q = ESQL.from('employees')
      .stats({ avg_sal: f.avg('salary') })
      .by('dept')
    expect(q.render()).toBe('FROM employees\n| STATS avg_sal = AVG(salary) BY dept')
  })

  it('works inside eval()', () => {
    const q = ESQL.from('employees').eval({ cnt: f.count('name') })
    expect(q.render()).toBe('FROM employees\n| EVAL cnt = COUNT(name)')
  })
})
