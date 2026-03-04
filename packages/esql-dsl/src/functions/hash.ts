/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpressionLike } from '@elastic/elasticsearch-query-builder'
import { InstrumentedExpression } from '../expression'
import { fn, renderArg, renderLiteralArg } from '../fn'

export function hash(algorithm: ExpressionLike, field: ExpressionLike): InstrumentedExpression {
  return new InstrumentedExpression(`HASH(${renderLiteralArg(algorithm)}, ${renderArg(field)})`)
}

export function md5(field: ExpressionLike): InstrumentedExpression {
  return fn('MD5', field)
}

export function sha1(field: ExpressionLike): InstrumentedExpression {
  return fn('SHA1', field)
}

export function sha256(field: ExpressionLike): InstrumentedExpression {
  return fn('SHA256', field)
}

export function urlDecode(field: ExpressionLike): InstrumentedExpression {
  return fn('URL_DECODE', field)
}

export function urlEncode(field: ExpressionLike): InstrumentedExpression {
  return fn('URL_ENCODE', field)
}

export function urlEncodeComponent(field: ExpressionLike): InstrumentedExpression {
  return fn('URL_ENCODE_COMPONENT', field)
}
