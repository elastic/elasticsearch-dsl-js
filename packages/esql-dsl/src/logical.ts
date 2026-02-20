/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InstrumentedExpression } from './expression'

export function and_(...expressions: InstrumentedExpression[]): InstrumentedExpression {
  const joined = expressions.map((e) => `(${e.toString()})`).join(' AND ')
  return new InstrumentedExpression(joined)
}

export function or_(...expressions: InstrumentedExpression[]): InstrumentedExpression {
  const joined = expressions.map((e) => `(${e.toString()})`).join(' OR ')
  return new InstrumentedExpression(joined)
}

export function not_(expression: InstrumentedExpression): InstrumentedExpression {
  return new InstrumentedExpression(`NOT (${expression.toString()})`)
}
