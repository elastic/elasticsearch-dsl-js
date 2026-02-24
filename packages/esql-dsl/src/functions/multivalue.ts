/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpressionLike } from '@elastic/elasticsearch-query-builder'
import type { InstrumentedExpression } from '../expression'
import { fn, fnLiteral } from '../fn'

export function mvAvg(field: ExpressionLike): InstrumentedExpression {
  return fn('MV_AVG', field)
}

export function mvConcat(field: ExpressionLike, separator: string): InstrumentedExpression {
  return fnLiteral('MV_CONCAT', field, separator)
}

export function mvCount(field: ExpressionLike): InstrumentedExpression {
  return fn('MV_COUNT', field)
}

export function mvDedupe(field: ExpressionLike): InstrumentedExpression {
  return fn('MV_DEDUPE', field)
}

export function mvFirst(field: ExpressionLike): InstrumentedExpression {
  return fn('MV_FIRST', field)
}

export function mvLast(field: ExpressionLike): InstrumentedExpression {
  return fn('MV_LAST', field)
}

export function mvMax(field: ExpressionLike): InstrumentedExpression {
  return fn('MV_MAX', field)
}

export function mvMin(field: ExpressionLike): InstrumentedExpression {
  return fn('MV_MIN', field)
}

export function mvSum(field: ExpressionLike): InstrumentedExpression {
  return fn('MV_SUM', field)
}

export function mvSort(field: ExpressionLike, order?: 'ASC' | 'DESC'): InstrumentedExpression {
  if (order) {
    return fn('MV_SORT', field, order)
  }
  return fn('MV_SORT', field)
}

export function mvSlice(
  field: ExpressionLike,
  start: ExpressionLike,
  end?: ExpressionLike
): InstrumentedExpression {
  if (end !== undefined) {
    return fn('MV_SLICE', field, start, end)
  }
  return fn('MV_SLICE', field, start)
}

export function mvMedian(field: ExpressionLike): InstrumentedExpression {
  return fn('MV_MEDIAN', field)
}

export function mvExpand(field: ExpressionLike): InstrumentedExpression {
  return fn('MV_EXPAND', field)
}

export function mvZip(
  left: ExpressionLike,
  right: ExpressionLike,
  separator?: string
): InstrumentedExpression {
  if (separator !== undefined) {
    return fnLiteral('MV_ZIP', left, right, separator)
  }
  return fn('MV_ZIP', left, right)
}

export function mvAppend(left: ExpressionLike, right: ExpressionLike): InstrumentedExpression {
  return fn('MV_APPEND', left, right)
}
