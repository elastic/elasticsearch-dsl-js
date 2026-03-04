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

function renderValue(value: ExpressionLike): string {
  if (BaseExpression.isExpression(value)) {
    return value.toString()
  }
  return escapeValue(value)
}

export class InstrumentedExpression extends BaseExpression {
  protected readonly _expr: string

  constructor(expr: string) {
    super()
    this._expr = expr
  }

  eq(value: ExpressionLike): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} == ${renderValue(value)}`)
  }

  ne(value: ExpressionLike): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} != ${renderValue(value)}`)
  }

  gt(value: ExpressionLike): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} > ${renderValue(value)}`)
  }

  gte(value: ExpressionLike): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} >= ${renderValue(value)}`)
  }

  lt(value: ExpressionLike): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} < ${renderValue(value)}`)
  }

  lte(value: ExpressionLike): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} <= ${renderValue(value)}`)
  }

  isNull(): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} IS NULL`)
  }

  isNotNull(): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} IS NOT NULL`)
  }

  in(values: ExpressionLike[]): InstrumentedExpression {
    const rendered = values.map(renderValue).join(', ')
    return new InstrumentedExpression(`${this._expr} IN (${rendered})`)
  }

  between(low: ExpressionLike, high: ExpressionLike): InstrumentedExpression {
    return new InstrumentedExpression(
      `${this._expr} >= ${renderValue(low)} AND ${this._expr} <= ${renderValue(high)}`
    )
  }

  like(pattern: string): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} LIKE ${escapeValue(pattern)}`)
  }

  rlike(pattern: string): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} RLIKE ${escapeValue(pattern)}`)
  }

  startsWith(prefix: string): InstrumentedExpression {
    return new InstrumentedExpression(`STARTS_WITH(${this._expr}, ${escapeValue(prefix)})`)
  }

  endsWith(suffix: string): InstrumentedExpression {
    return new InstrumentedExpression(`ENDS_WITH(${this._expr}, ${escapeValue(suffix)})`)
  }

  add(value: ExpressionLike): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} + ${renderValue(value)}`)
  }

  sub(value: ExpressionLike): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} - ${renderValue(value)}`)
  }

  mul(value: ExpressionLike): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} * ${renderValue(value)}`)
  }

  div(value: ExpressionLike): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} / ${renderValue(value)}`)
  }

  mod(value: ExpressionLike): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} % ${renderValue(value)}`)
  }

  asc(): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} ASC`)
  }

  desc(): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} DESC`)
  }

  nullsFirst(): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} NULLS FIRST`)
  }

  nullsLast(): InstrumentedExpression {
    return new InstrumentedExpression(`${this._expr} NULLS LAST`)
  }

  toString(): string {
    return this._expr
  }
}

export class AggregationExpression extends InstrumentedExpression {
  where(condition: ExpressionLike): AggregationExpression {
    return new AggregationExpression(`${this._expr} WHERE ${renderValue(condition)}`)
  }
}

export function E(field: string): InstrumentedExpression {
  return new InstrumentedExpression(escapeIdentifier(field))
}
