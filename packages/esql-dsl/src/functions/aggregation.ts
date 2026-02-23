/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpressionLike } from '@elastic/elasticsearch-query-builder'
import { InstrumentedExpression } from '../expression'
import { fn, renderArg } from '../fn'

export function avg(field: ExpressionLike): InstrumentedExpression {
  return fn('AVG', field)
}

export function count(field: ExpressionLike = '*'): InstrumentedExpression {
  if (field === '*') {
    return new InstrumentedExpression('COUNT(*)')
  }
  return fn('COUNT', field)
}

export function countDistinct(field: ExpressionLike, precision?: number): InstrumentedExpression {
  if (precision !== undefined) {
    return fn('COUNT_DISTINCT', field, precision)
  }
  return fn('COUNT_DISTINCT', field)
}

export function max(field: ExpressionLike): InstrumentedExpression {
  return fn('MAX', field)
}

export function min(field: ExpressionLike): InstrumentedExpression {
  return fn('MIN', field)
}

export function sum(field: ExpressionLike): InstrumentedExpression {
  return fn('SUM', field)
}

export function median(field: ExpressionLike): InstrumentedExpression {
  return fn('MEDIAN', field)
}

export function medianAbsoluteDeviation(field: ExpressionLike): InstrumentedExpression {
  return fn('MEDIAN_ABSOLUTE_DEVIATION', field)
}

export function percentile(field: ExpressionLike, p: number): InstrumentedExpression {
  return fn('PERCENTILE', field, p)
}

export function values(field: ExpressionLike): InstrumentedExpression {
  return fn('VALUES', field)
}

export function top(
  field: ExpressionLike,
  limit: number,
  order: 'ASC' | 'DESC'
): InstrumentedExpression {
  return new InstrumentedExpression(`TOP(${renderArg(field)}, ${limit}, ${order})`)
}

export function stCentroidAgg(field: ExpressionLike): InstrumentedExpression {
  return fn('ST_CENTROID_AGG', field)
}
