/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpressionLike } from '@elastic/elasticsearch-query-builder'
import type { InstrumentedExpression } from '../expression'
import { fn } from '../fn'

export function vCosine(v1: ExpressionLike, v2: ExpressionLike): InstrumentedExpression {
  return fn('V_COSINE', v1, v2)
}

export function vDotProduct(v1: ExpressionLike, v2: ExpressionLike): InstrumentedExpression {
  return fn('V_DOT_PRODUCT', v1, v2)
}

export function vHamming(v1: ExpressionLike, v2: ExpressionLike): InstrumentedExpression {
  return fn('V_HAMMING', v1, v2)
}

export function vL1Norm(v1: ExpressionLike, v2: ExpressionLike): InstrumentedExpression {
  return fn('V_L1_NORM', v1, v2)
}

export function vL2Norm(v1: ExpressionLike, v2: ExpressionLike): InstrumentedExpression {
  return fn('V_L2_NORM', v1, v2)
}

export function vMagnitude(v: ExpressionLike): InstrumentedExpression {
  return fn('V_MAGNITUDE', v)
}
