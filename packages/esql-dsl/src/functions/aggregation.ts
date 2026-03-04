/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpressionLike } from '@elastic/elasticsearch-query-builder'
import { AggregationExpression } from '../expression'
import { aggFn, renderArg } from '../fn'

export function avg(field: ExpressionLike): AggregationExpression {
  return aggFn('AVG', field)
}

export function count(field: ExpressionLike = '*'): AggregationExpression {
  if (field === '*') {
    return new AggregationExpression('COUNT(*)')
  }
  return aggFn('COUNT', field)
}

export function countDistinct(field: ExpressionLike, precision?: number): AggregationExpression {
  if (precision !== undefined) {
    return aggFn('COUNT_DISTINCT', field, precision)
  }
  return aggFn('COUNT_DISTINCT', field)
}

export function max(field: ExpressionLike): AggregationExpression {
  return aggFn('MAX', field)
}

export function min(field: ExpressionLike): AggregationExpression {
  return aggFn('MIN', field)
}

export function sum(field: ExpressionLike): AggregationExpression {
  return aggFn('SUM', field)
}

export function median(field: ExpressionLike): AggregationExpression {
  return aggFn('MEDIAN', field)
}

export function medianAbsoluteDeviation(field: ExpressionLike): AggregationExpression {
  return aggFn('MEDIAN_ABSOLUTE_DEVIATION', field)
}

export function percentile(field: ExpressionLike, p: number): AggregationExpression {
  return aggFn('PERCENTILE', field, p)
}

export function values(field: ExpressionLike): AggregationExpression {
  return aggFn('VALUES', field)
}

export function top(
  field: ExpressionLike,
  limit: number,
  order: 'ASC' | 'DESC'
): AggregationExpression {
  return new AggregationExpression(`TOP(${renderArg(field)}, ${limit}, ${order})`)
}

export function stCentroidAgg(field: ExpressionLike): AggregationExpression {
  return aggFn('ST_CENTROID_AGG', field)
}

export function absent(field: ExpressionLike): AggregationExpression {
  return aggFn('ABSENT', field)
}

export function present(field: ExpressionLike): AggregationExpression {
  return aggFn('PRESENT', field)
}

export function first(field: ExpressionLike): AggregationExpression {
  return aggFn('FIRST', field)
}

export function last(field: ExpressionLike): AggregationExpression {
  return aggFn('LAST', field)
}

export function stdDev(field: ExpressionLike): AggregationExpression {
  return aggFn('STD_DEV', field)
}

export function variance(field: ExpressionLike): AggregationExpression {
  return aggFn('VARIANCE', field)
}

export function weightedAvg(value: ExpressionLike, weight: ExpressionLike): AggregationExpression {
  return aggFn('WEIGHTED_AVG', value, weight)
}

export function sample_(field: ExpressionLike): AggregationExpression {
  return aggFn('SAMPLE', field)
}

export function allFirst(field: ExpressionLike): AggregationExpression {
  return aggFn('ALL_FIRST', field)
}

export function allLast(field: ExpressionLike): AggregationExpression {
  return aggFn('ALL_LAST', field)
}
