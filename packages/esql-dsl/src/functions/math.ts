/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpressionLike } from '@elastic/elasticsearch-query-builder'
import { InstrumentedExpression } from '../expression'
import { fn } from '../fn'

export function abs(value: ExpressionLike): InstrumentedExpression {
  return fn('ABS', value)
}

export function ceil(value: ExpressionLike): InstrumentedExpression {
  return fn('CEIL', value)
}

export function floor(value: ExpressionLike): InstrumentedExpression {
  return fn('FLOOR', value)
}

export function round(value: ExpressionLike, decimals?: number): InstrumentedExpression {
  if (decimals !== undefined) {
    return fn('ROUND', value, decimals)
  }
  return fn('ROUND', value)
}

export function sqrt(value: ExpressionLike): InstrumentedExpression {
  return fn('SQRT', value)
}

export function pow(base: ExpressionLike, exp: ExpressionLike): InstrumentedExpression {
  return fn('POW', base, exp)
}

export function log(value: ExpressionLike, base?: ExpressionLike): InstrumentedExpression {
  if (base !== undefined) {
    return fn('LOG', value, base)
  }
  return fn('LOG', value)
}

export function log10(value: ExpressionLike): InstrumentedExpression {
  return fn('LOG10', value)
}

export function exp(value: ExpressionLike): InstrumentedExpression {
  return fn('EXP', value)
}

export function sin(angle: ExpressionLike): InstrumentedExpression {
  return fn('SIN', angle)
}

export function cos(angle: ExpressionLike): InstrumentedExpression {
  return fn('COS', angle)
}

export function tan(angle: ExpressionLike): InstrumentedExpression {
  return fn('TAN', angle)
}

export function asin(value: ExpressionLike): InstrumentedExpression {
  return fn('ASIN', value)
}

export function acos(value: ExpressionLike): InstrumentedExpression {
  return fn('ACOS', value)
}

export function atan(value: ExpressionLike): InstrumentedExpression {
  return fn('ATAN', value)
}

export function atan2(y: ExpressionLike, x: ExpressionLike): InstrumentedExpression {
  return fn('ATAN2', y, x)
}

export function pi(): InstrumentedExpression {
  return new InstrumentedExpression('PI()')
}

export function tau(): InstrumentedExpression {
  return new InstrumentedExpression('TAU()')
}

export function e(): InstrumentedExpression {
  return new InstrumentedExpression('E()')
}

export function signum(value: ExpressionLike): InstrumentedExpression {
  return fn('SIGNUM', value)
}

export function cbrt(value: ExpressionLike): InstrumentedExpression {
  return fn('CBRT', value)
}

export function hypot(a: ExpressionLike, b: ExpressionLike): InstrumentedExpression {
  return fn('HYPOT', a, b)
}

export function cosh(value: ExpressionLike): InstrumentedExpression {
  return fn('COSH', value)
}

export function sinh(value: ExpressionLike): InstrumentedExpression {
  return fn('SINH', value)
}

export function tanh(value: ExpressionLike): InstrumentedExpression {
  return fn('TANH', value)
}

export function clamp(
  value: ExpressionLike,
  min: ExpressionLike,
  max: ExpressionLike
): InstrumentedExpression {
  return fn('CLAMP', value, min, max)
}

export function clampMax(value: ExpressionLike, max: ExpressionLike): InstrumentedExpression {
  return fn('CLAMP_MAX', value, max)
}

export function clampMin(value: ExpressionLike, min: ExpressionLike): InstrumentedExpression {
  return fn('CLAMP_MIN', value, min)
}

export function copySign(magnitude: ExpressionLike, sign: ExpressionLike): InstrumentedExpression {
  return fn('COPY_SIGN', magnitude, sign)
}

export function scalb(value: ExpressionLike, exp: ExpressionLike): InstrumentedExpression {
  return fn('SCALB', value, exp)
}

export function toDegrees(radians: ExpressionLike): InstrumentedExpression {
  return fn('TO_DEGREES', radians)
}

export function toRadians(degrees: ExpressionLike): InstrumentedExpression {
  return fn('TO_RADIANS', degrees)
}

export function roundTo(value: ExpressionLike, ...rest: ExpressionLike[]): InstrumentedExpression {
  return fn('ROUND_TO', value, ...rest)
}
