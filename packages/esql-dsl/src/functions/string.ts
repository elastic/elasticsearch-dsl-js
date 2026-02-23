/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpressionLike } from '@elastic/elasticsearch-query-builder'
import type { InstrumentedExpression } from '../expression'
import { fn, fnLiteral } from '../fn'

export function concat(...args: ExpressionLike[]): InstrumentedExpression {
  return fnLiteral('CONCAT', ...args)
}

export function length(str: ExpressionLike): InstrumentedExpression {
  return fn('LENGTH', str)
}

export function toUpper(str: ExpressionLike): InstrumentedExpression {
  return fn('TO_UPPER', str)
}

export function toLower(str: ExpressionLike): InstrumentedExpression {
  return fn('TO_LOWER', str)
}

export function trim(str: ExpressionLike): InstrumentedExpression {
  return fn('TRIM', str)
}

export function ltrim(str: ExpressionLike): InstrumentedExpression {
  return fn('LTRIM', str)
}

export function rtrim(str: ExpressionLike): InstrumentedExpression {
  return fn('RTRIM', str)
}

export function substring(
  str: ExpressionLike,
  start: ExpressionLike,
  len?: ExpressionLike
): InstrumentedExpression {
  if (len !== undefined) {
    return fn('SUBSTRING', str, start, len)
  }
  return fn('SUBSTRING', str, start)
}

export function left(str: ExpressionLike, len: ExpressionLike): InstrumentedExpression {
  return fn('LEFT', str, len)
}

export function right(str: ExpressionLike, len: ExpressionLike): InstrumentedExpression {
  return fn('RIGHT', str, len)
}

export function replace(
  str: ExpressionLike,
  pattern: ExpressionLike,
  replacement: ExpressionLike
): InstrumentedExpression {
  return fnLiteral('REPLACE', str, pattern, replacement)
}

export function split(str: ExpressionLike, delimiter: string): InstrumentedExpression {
  return fnLiteral('SPLIT', str, delimiter)
}

export function startsWith(str: ExpressionLike, prefix: ExpressionLike): InstrumentedExpression {
  return fnLiteral('STARTS_WITH', str, prefix)
}

export function endsWith(str: ExpressionLike, suffix: ExpressionLike): InstrumentedExpression {
  return fnLiteral('ENDS_WITH', str, suffix)
}

export function locate(str: ExpressionLike, substr: ExpressionLike): InstrumentedExpression {
  return fnLiteral('LOCATE', str, substr)
}

export function repeat(str: ExpressionLike, count: ExpressionLike): InstrumentedExpression {
  return fn('REPEAT', str, count)
}

export function reverse(str: ExpressionLike): InstrumentedExpression {
  return fn('REVERSE', str)
}

export function space(count: ExpressionLike): InstrumentedExpression {
  return fn('SPACE', count)
}

export function toBase64(str: ExpressionLike): InstrumentedExpression {
  return fn('TO_BASE64', str)
}

export function fromBase64(str: ExpressionLike): InstrumentedExpression {
  return fn('FROM_BASE64', str)
}
