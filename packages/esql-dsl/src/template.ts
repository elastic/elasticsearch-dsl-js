/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseExpression, escapeValue } from '@elastic/elasticsearch-query-builder'
import { InstrumentedExpression } from './expression'

export function esql(strings: TemplateStringsArray, ...values: unknown[]): InstrumentedExpression {
  const parts: string[] = []
  for (let i = 0; i < strings.length; i++) {
    parts.push(strings[i] as string)
    if (i < values.length) {
      const value = values[i]
      parts.push(BaseExpression.isExpression(value) ? value.toString() : escapeValue(value))
    }
  }
  return new InstrumentedExpression(parts.join(''))
}
