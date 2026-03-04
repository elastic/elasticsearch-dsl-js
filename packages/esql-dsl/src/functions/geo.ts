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

export function stEnvelope(geo: ExpressionLike): InstrumentedExpression {
  return fn('ST_ENVELOPE', geo)
}

export function stExtentAgg(field: ExpressionLike): InstrumentedExpression {
  return fn('ST_EXTENT_AGG', field)
}

export function stNpoints(geo: ExpressionLike): InstrumentedExpression {
  return fn('ST_NPOINTS', geo)
}

export function stSimplify(geo: ExpressionLike, tolerance: ExpressionLike): InstrumentedExpression {
  return fn('ST_SIMPLIFY', geo, tolerance)
}

export function stGeohash(geo: ExpressionLike, precision: ExpressionLike): InstrumentedExpression {
  return fn('ST_GEOHASH', geo, precision)
}

export function stGeohashToLong(hash: ExpressionLike): InstrumentedExpression {
  return fn('ST_GEOHASH_TO_LONG', hash)
}

export function stGeohashToString(hash: ExpressionLike): InstrumentedExpression {
  return fn('ST_GEOHASH_TO_STRING', hash)
}

export function stGeohex(geo: ExpressionLike, precision: ExpressionLike): InstrumentedExpression {
  return fn('ST_GEOHEX', geo, precision)
}

export function stGeohexToLong(hex: ExpressionLike): InstrumentedExpression {
  return fn('ST_GEOHEX_TO_LONG', hex)
}

export function stGeohexToString(hex: ExpressionLike): InstrumentedExpression {
  return fn('ST_GEOHEX_TO_STRING', hex)
}

export function stGeotile(geo: ExpressionLike, precision: ExpressionLike): InstrumentedExpression {
  return fn('ST_GEOTILE', geo, precision)
}

export function stGeotileToLong(tile: ExpressionLike): InstrumentedExpression {
  return fn('ST_GEOTILE_TO_LONG', tile)
}

export function stGeotileToString(tile: ExpressionLike): InstrumentedExpression {
  return fn('ST_GEOTILE_TO_STRING', tile)
}

export function stXmax(geo: ExpressionLike): InstrumentedExpression {
  return fn('ST_XMAX', geo)
}

export function stXmin(geo: ExpressionLike): InstrumentedExpression {
  return fn('ST_XMIN', geo)
}

export function stYmax(geo: ExpressionLike): InstrumentedExpression {
  return fn('ST_YMAX', geo)
}

export function stYmin(geo: ExpressionLike): InstrumentedExpression {
  return fn('ST_YMIN', geo)
}
