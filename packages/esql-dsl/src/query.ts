/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BaseExpression } from '@elastic/elasticsearch-query-builder'
import { ESQLBase } from './base'
import { formatIdentifier } from './identifier'

type ExpressionArg = string | BaseExpression

function renderExpressionArg(value: ExpressionArg): string {
  if (typeof value === 'string') {
    return value
  }
  return value.toString()
}

function renderNamedExpressions(columns: Record<string, ExpressionArg>): string {
  return Object.entries(columns)
    .map(([k, v]) => `${formatIdentifier(k)} = ${renderExpressionArg(v)}`)
    .join(', ')
}

export abstract class ESQLQuery extends ESQLBase {
  where(expression: ExpressionArg): ESQLQuery {
    return new WhereCommand(this, expression)
  }

  eval(columns: Record<string, ExpressionArg>): ESQLQuery
  eval(...expressions: string[]): ESQLQuery
  eval(columnsOrFirst: Record<string, ExpressionArg> | string, ...rest: string[]): ESQLQuery {
    if (typeof columnsOrFirst === 'string') {
      const all = [columnsOrFirst, ...rest]
      return new EvalCommand(this, all.join(', '))
    }
    return new EvalCommand(this, renderNamedExpressions(columnsOrFirst))
  }

  stats(aggregations: Record<string, ExpressionArg>): StatsQuery {
    return new StatsCommandInternal(this, renderNamedExpressions(aggregations))
  }

  sort(...columns: ExpressionArg[]): ESQLQuery {
    return new SortCommand(this, columns.map(renderExpressionArg))
  }

  limit(n: number): ESQLQuery {
    return new LimitCommand(this, n)
  }

  keep(...columns: string[]): ESQLQuery {
    return new KeepCommand(this, columns)
  }

  drop(...columns: string[]): ESQLQuery {
    return new DropCommand(this, columns)
  }
}

class WhereCommand extends ESQLQuery {
  private readonly _expression: string

  constructor(parent: ESQLBase, expression: ExpressionArg) {
    super()
    this.setParent(parent)
    this._expression = renderExpressionArg(expression)
  }

  protected _renderInternal(): string {
    return `WHERE ${this._expression}`
  }
}

class EvalCommand extends ESQLQuery {
  private readonly _rendered: string

  constructor(parent: ESQLBase, rendered: string) {
    super()
    this.setParent(parent)
    this._rendered = rendered
  }

  protected _renderInternal(): string {
    return `EVAL ${this._rendered}`
  }
}

class SortCommand extends ESQLQuery {
  private readonly _columns: string[]

  constructor(parent: ESQLBase, columns: string[]) {
    super()
    this.setParent(parent)
    this._columns = columns
  }

  protected _renderInternal(): string {
    return `SORT ${this._columns.join(', ')}`
  }
}

class LimitCommand extends ESQLQuery {
  private readonly _n: number

  constructor(parent: ESQLBase, n: number) {
    super()
    this.setParent(parent)
    this._n = n
  }

  protected _renderInternal(): string {
    return `LIMIT ${this._n}`
  }
}

class KeepCommand extends ESQLQuery {
  private readonly _columns: string[]

  constructor(parent: ESQLBase, columns: string[]) {
    super()
    this.setParent(parent)
    this._columns = columns
  }

  protected _renderInternal(): string {
    const formatted = this._columns
      .map((c) => formatIdentifier(c, { allowPatterns: true }))
      .join(', ')
    return `KEEP ${formatted}`
  }
}

class DropCommand extends ESQLQuery {
  private readonly _columns: string[]

  constructor(parent: ESQLBase, columns: string[]) {
    super()
    this.setParent(parent)
    this._columns = columns
  }

  protected _renderInternal(): string {
    const formatted = this._columns
      .map((c) => formatIdentifier(c, { allowPatterns: true }))
      .join(', ')
    return `DROP ${formatted}`
  }
}

class StatsCommandInternal extends ESQLQuery {
  private readonly _aggs: string
  private _byClause: string | null = null

  constructor(parent: ESQLBase, aggs: string) {
    super()
    this.setParent(parent)
    this._aggs = aggs
  }

  by(...grouping: ExpressionArg[]): ESQLQuery {
    const parent = this._parent
    if (!parent) {
      throw new Error('StatsCommand must have a parent')
    }
    const result = new StatsCommandInternal(parent, this._aggs)
    result._byClause = grouping.map(renderExpressionArg).join(', ')
    return result
  }

  protected _renderInternal(): string {
    const byStr = this._byClause ? ` BY ${this._byClause}` : ''
    return `STATS ${this._aggs}${byStr}`
  }
}

export type StatsQuery = StatsCommandInternal
