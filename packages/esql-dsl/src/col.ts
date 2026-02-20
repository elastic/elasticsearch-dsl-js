/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { escapeIdentifier } from '@elastic/elasticsearch-query-builder'
import { InstrumentedExpression } from './expression'

export function col(name: string): InstrumentedExpression {
  return new InstrumentedExpression(escapeIdentifier(name))
}
