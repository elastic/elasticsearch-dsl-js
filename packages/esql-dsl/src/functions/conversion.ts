/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpressionLike } from '@elastic/elasticsearch-query-builder'
import type { InstrumentedExpression } from '../expression'
import { fn } from '../fn'

export function toBoolean(value: ExpressionLike): InstrumentedExpression {
  return fn('TO_BOOLEAN', value)
}

export function toDouble(value: ExpressionLike): InstrumentedExpression {
  return fn('TO_DOUBLE', value)
}

export function toInteger(value: ExpressionLike): InstrumentedExpression {
  return fn('TO_INTEGER', value)
}

export function toLong(value: ExpressionLike): InstrumentedExpression {
  return fn('TO_LONG', value)
}

export function toString_(value: ExpressionLike): InstrumentedExpression {
  return fn('TO_STRING', value)
}

export function toIp(value: ExpressionLike): InstrumentedExpression {
  return fn('TO_IP', value)
}

export function toVersion(value: ExpressionLike): InstrumentedExpression {
  return fn('TO_VERSION', value)
}

export function toUnsignedLong(value: ExpressionLike): InstrumentedExpression {
  return fn('TO_UNSIGNED_LONG', value)
}

export function toGeoPoint(value: ExpressionLike): InstrumentedExpression {
  return fn('TO_GEOPOINT', value)
}

export function toGeoShape(value: ExpressionLike): InstrumentedExpression {
  return fn('TO_GEOSHAPE', value)
}

export function toCartesianPoint(value: ExpressionLike): InstrumentedExpression {
  return fn('TO_CARTESIANPOINT', value)
}

export function toCartesianShape(value: ExpressionLike): InstrumentedExpression {
  return fn('TO_CARTESIANSHAPE', value)
}
