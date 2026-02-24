/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpressionLike } from '@elastic/elasticsearch-query-builder'
import type { InstrumentedExpression } from '../expression'
import { fn } from '../fn'

export function stDistance(geo1: ExpressionLike, geo2: ExpressionLike): InstrumentedExpression {
  return fn('ST_DISTANCE', geo1, geo2)
}

export function stIntersects(geo1: ExpressionLike, geo2: ExpressionLike): InstrumentedExpression {
  return fn('ST_INTERSECTS', geo1, geo2)
}

export function stContains(geo1: ExpressionLike, geo2: ExpressionLike): InstrumentedExpression {
  return fn('ST_CONTAINS', geo1, geo2)
}

export function stWithin(geo1: ExpressionLike, geo2: ExpressionLike): InstrumentedExpression {
  return fn('ST_WITHIN', geo1, geo2)
}

export function stX(point: ExpressionLike): InstrumentedExpression {
  return fn('ST_X', point)
}

export function stY(point: ExpressionLike): InstrumentedExpression {
  return fn('ST_Y', point)
}

export function stDisjoint(geo1: ExpressionLike, geo2: ExpressionLike): InstrumentedExpression {
  return fn('ST_DISJOINT', geo1, geo2)
}
