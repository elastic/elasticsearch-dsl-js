/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpressionLike } from '@elastic/elasticsearch-query-builder'
import type { InstrumentedExpression } from '../expression'
import { fn } from '../fn'

export function bucket(field: ExpressionLike, ...rest: ExpressionLike[]): InstrumentedExpression {
  return fn('BUCKET', field, ...rest)
}

export function categorize(field: ExpressionLike): InstrumentedExpression {
  return fn('CATEGORIZE', field)
}
