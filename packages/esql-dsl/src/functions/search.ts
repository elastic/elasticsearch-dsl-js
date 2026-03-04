/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExpressionLike } from '@elastic/elasticsearch-query-builder'
import { InstrumentedExpression } from '../expression'
import { fn, fnLiteral, renderArg, renderLiteralArg } from '../fn'

export function match(field: ExpressionLike, query: ExpressionLike): InstrumentedExpression {
  return new InstrumentedExpression(`MATCH(${renderArg(field)}, ${renderLiteralArg(query)})`)
}

export function matchPhrase(field: ExpressionLike, query: ExpressionLike): InstrumentedExpression {
  return new InstrumentedExpression(`MATCH_PHRASE(${renderArg(field)}, ${renderLiteralArg(query)})`)
}

export function multiMatch(
  query: ExpressionLike,
  ...fields: ExpressionLike[]
): InstrumentedExpression {
  const args = [renderLiteralArg(query), ...fields.map(renderArg)]
  return new InstrumentedExpression(`MULTI_MATCH(${args.join(', ')})`)
}

export function term(field: ExpressionLike, value: ExpressionLike): InstrumentedExpression {
  return new InstrumentedExpression(`TERM(${renderArg(field)}, ${renderLiteralArg(value)})`)
}

export function kql(query: string): InstrumentedExpression {
  return fnLiteral('KQL', query)
}

export function qstr(query: string): InstrumentedExpression {
  return fnLiteral('QSTR', query)
}

export function knn(
  field: ExpressionLike,
  k: ExpressionLike,
  ...rest: ExpressionLike[]
): InstrumentedExpression {
  return fn('KNN', field, k, ...rest)
}

export function score(): InstrumentedExpression {
  return new InstrumentedExpression('SCORE()')
}

export function decay(
  func: ExpressionLike,
  field: ExpressionLike,
  ...rest: ExpressionLike[]
): InstrumentedExpression {
  return new InstrumentedExpression(
    `DECAY(${renderLiteralArg(func)}, ${[field, ...rest].map(renderArg).join(', ')})`
  )
}

export function textEmbedding(
  inferenceId: ExpressionLike,
  input: ExpressionLike
): InstrumentedExpression {
  return fnLiteral('TEXT_EMBEDDING', inferenceId, input)
}

export function topSnippets(
  field: ExpressionLike,
  ...rest: ExpressionLike[]
): InstrumentedExpression {
  return fn('TOP_SNIPPETS', field, ...rest)
}
