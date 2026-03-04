/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseExpression, escapeValue } from '@elastic/elasticsearch-query-builder'
import { ESQLBase } from './base'
import { formatIdentifier } from './identifier'
import { renderWhereOptions, type WhereOptions } from './where-options'

export type { WhereOptions }

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
  where(expression: ExpressionArg): ESQLQuery
  where(options: WhereOptions): ESQLQuery
  where(expressionOrOptions: ExpressionArg | WhereOptions): ESQLQuery {
    if (typeof expressionOrOptions === 'string') {
      return new WhereCommand(this, expressionOrOptions)
    }
    if (expressionOrOptions instanceof BaseExpression) {
      return new WhereCommand(this, expressionOrOptions)
    }
    return new WhereCommand(this, renderWhereOptions(expressionOrOptions as WhereOptions))
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

  enrich(policy: string): EnrichCommand {
    return new EnrichCommand(this, policy)
  }

  dissect(input: ExpressionArg, pattern: string, appendSeparator?: string): ESQLQuery {
    return new DissectCommand(this, renderExpressionArg(input), pattern, appendSeparator)
  }

  grok(input: ExpressionArg, pattern: string): ESQLQuery {
    return new GrokCommand(this, renderExpressionArg(input), pattern)
  }

  rename(mappings: Record<string, string>): ESQLQuery {
    return new RenameCommand(this, mappings)
  }

  mvExpand(field: string): ESQLQuery {
    return new MvExpandCommand(this, field)
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

class EnrichCommand extends ESQLQuery {
  private readonly _policy: string
  private _onField: string | null = null
  private _withFields: string[] | null = null

  constructor(parent: ESQLBase, policy: string) {
    super()
    this.setParent(parent)
    this._policy = policy
  }

  on(field: string): EnrichCommand {
    const result = new EnrichCommand(this._parent as ESQLBase, this._policy)
    result._onField = field
    result._withFields = this._withFields
    return result
  }

  with(...fields: string[]): EnrichCommand {
    const result = new EnrichCommand(this._parent as ESQLBase, this._policy)
    result._onField = this._onField
    result._withFields = fields
    return result
  }

  protected _renderInternal(): string {
    let cmd = `ENRICH ${this._policy}`
    if (this._onField) {
      cmd += ` ON ${formatIdentifier(this._onField)}`
    }
    if (this._withFields && this._withFields.length > 0) {
      cmd += ` WITH ${this._withFields.map((f) => formatIdentifier(f)).join(', ')}`
    }
    return cmd
  }
}

class DissectCommand extends ESQLQuery {
  private readonly _input: string
  private readonly _pattern: string
  private readonly _appendSeparator: string | undefined

  constructor(parent: ESQLBase, input: string, pattern: string, appendSeparator?: string) {
    super()
    this.setParent(parent)
    this._input = input
    this._pattern = pattern
    this._appendSeparator = appendSeparator
  }

  protected _renderInternal(): string {
    let cmd = `DISSECT ${this._input} ${escapeValue(this._pattern)}`
    if (this._appendSeparator !== undefined) {
      cmd += ` APPEND_SEPARATOR=${escapeValue(this._appendSeparator)}`
    }
    return cmd
  }
}

class GrokCommand extends ESQLQuery {
  private readonly _input: string
  private readonly _pattern: string

  constructor(parent: ESQLBase, input: string, pattern: string) {
    super()
    this.setParent(parent)
    this._input = input
    this._pattern = pattern
  }

  protected _renderInternal(): string {
    return `GROK ${this._input} ${escapeValue(this._pattern)}`
  }
}

class RenameCommand extends ESQLQuery {
  private readonly _mappings: Record<string, string>

  constructor(parent: ESQLBase, mappings: Record<string, string>) {
    super()
    this.setParent(parent)
    this._mappings = mappings
  }

  protected _renderInternal(): string {
    const pairs = Object.entries(this._mappings)
      .map(([old, renamed]) => `${formatIdentifier(old)} AS ${formatIdentifier(renamed)}`)
      .join(', ')
    return `RENAME ${pairs}`
  }
}

class MvExpandCommand extends ESQLQuery {
  private readonly _field: string

  constructor(parent: ESQLBase, field: string) {
    super()
    this.setParent(parent)
    this._field = field
  }

  protected _renderInternal(): string {
    return `MV_EXPAND ${formatIdentifier(this._field)}`
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
