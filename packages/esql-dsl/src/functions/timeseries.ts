/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpressionLike } from '@elastic/elasticsearch-query-builder'
import type { AggregationExpression } from '../expression'
import type { InstrumentedExpression } from '../expression'
import { aggFn, fn } from '../fn'

export function rate(field: ExpressionLike): AggregationExpression {
  return aggFn('RATE', field)
}

export function delta(field: ExpressionLike): AggregationExpression {
  return aggFn('DELTA', field)
}

export function deriv(field: ExpressionLike): AggregationExpression {
  return aggFn('DERIV', field)
}

export function idelta(field: ExpressionLike): AggregationExpression {
  return aggFn('IDELTA', field)
}

export function increase(field: ExpressionLike): AggregationExpression {
  return aggFn('INCREASE', field)
}

export function irate(field: ExpressionLike): AggregationExpression {
  return aggFn('IRATE', field)
}

export function tbucket(
  timestamp: ExpressionLike,
  interval: ExpressionLike
): InstrumentedExpression {
  return fn('TBUCKET', timestamp, interval)
}

export function trange(
  timestamp: ExpressionLike,
  range: ExpressionLike
): InstrumentedExpression {
  return fn('TRANGE', timestamp, range)
}

export function avgOverTime(field: ExpressionLike): AggregationExpression {
  return aggFn('AVG_OVER_TIME', field)
}

export function countOverTime(field: ExpressionLike): AggregationExpression {
  return aggFn('COUNT_OVER_TIME', field)
}

export function countDistinctOverTime(field: ExpressionLike): AggregationExpression {
  return aggFn('COUNT_DISTINCT_OVER_TIME', field)
}

export function sumOverTime(field: ExpressionLike): AggregationExpression {
  return aggFn('SUM_OVER_TIME', field)
}

export function minOverTime(field: ExpressionLike): AggregationExpression {
  return aggFn('MIN_OVER_TIME', field)
}

export function maxOverTime(field: ExpressionLike): AggregationExpression {
  return aggFn('MAX_OVER_TIME', field)
}

export function firstOverTime(field: ExpressionLike): AggregationExpression {
  return aggFn('FIRST_OVER_TIME', field)
}

export function lastOverTime(field: ExpressionLike): AggregationExpression {
  return aggFn('LAST_OVER_TIME', field)
}

export function percentileOverTime(
  field: ExpressionLike,
  p: number
): AggregationExpression {
  return aggFn('PERCENTILE_OVER_TIME', field, p)
}

export function absentOverTime(field: ExpressionLike): AggregationExpression {
  return aggFn('ABSENT_OVER_TIME', field)
}

export function presentOverTime(field: ExpressionLike): AggregationExpression {
  return aggFn('PRESENT_OVER_TIME', field)
}

export function stddevOverTime(field: ExpressionLike): AggregationExpression {
  return aggFn('STDDEV_OVER_TIME', field)
}

export function varianceOverTime(field: ExpressionLike): AggregationExpression {
  return aggFn('VARIANCE_OVER_TIME', field)
}
