/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpressionLike } from '@elastic/elasticsearch-query-builder'
import { InstrumentedExpression } from '../expression'
import { fn, renderArg, renderLiteralArg } from '../fn'

export function now(): InstrumentedExpression {
  return new InstrumentedExpression('NOW()')
}

export function dateDiff(
  unit: string,
  start: ExpressionLike,
  end: ExpressionLike
): InstrumentedExpression {
  return new InstrumentedExpression(
    `DATE_DIFF(${renderLiteralArg(unit)}, ${renderArg(start)}, ${renderArg(end)})`
  )
}

export function dateExtract(part: string, date: ExpressionLike): InstrumentedExpression {
  return new InstrumentedExpression(`DATE_EXTRACT(${renderLiteralArg(part)}, ${renderArg(date)})`)
}

export function dateFormat(date: ExpressionLike, format?: string): InstrumentedExpression {
  if (format !== undefined) {
    return new InstrumentedExpression(
      `DATE_FORMAT(${renderArg(date)}, ${renderLiteralArg(format)})`
    )
  }
  return fn('DATE_FORMAT', date)
}

export function dateParse(date: ExpressionLike, format: string): InstrumentedExpression {
  return new InstrumentedExpression(
    `DATE_PARSE(${renderLiteralArg(date)}, ${renderLiteralArg(format)})`
  )
}

export function dateTrunc(date: ExpressionLike, interval: string): InstrumentedExpression {
  return new InstrumentedExpression(`DATE_TRUNC(${renderArg(date)}, ${renderLiteralArg(interval)})`)
}

export function toDatetime(value: ExpressionLike): InstrumentedExpression {
  return fn('TO_DATETIME', value)
}

export function dateAdd(
  date: ExpressionLike,
  amount: ExpressionLike,
  unit: string
): InstrumentedExpression {
  return new InstrumentedExpression(
    `DATE_ADD(${renderArg(date)}, ${renderArg(amount)}, ${renderLiteralArg(unit)})`
  )
}
