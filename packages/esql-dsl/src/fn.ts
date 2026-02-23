/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BaseExpression,
  type ExpressionLike,
  escapeIdentifier,
  escapeValue,
} from '@elastic/elasticsearch-query-builder'
import { InstrumentedExpression } from './expression'

export function renderArg(value: ExpressionLike): string {
  if (BaseExpression.isExpression(value)) {
    return value.toString()
  }
  if (typeof value === 'string') {
    return escapeIdentifier(value)
  }
  return escapeValue(value)
}

export function renderLiteralArg(value: ExpressionLike): string {
  if (BaseExpression.isExpression(value)) {
    return value.toString()
  }
  return escapeValue(value)
}

export function fn(name: string, ...args: ExpressionLike[]): InstrumentedExpression {
  return new InstrumentedExpression(`${name}(${args.map(renderArg).join(', ')})`)
}

export function fnLiteral(name: string, ...args: ExpressionLike[]): InstrumentedExpression {
  return new InstrumentedExpression(`${name}(${args.map(renderLiteralArg).join(', ')})`)
}
