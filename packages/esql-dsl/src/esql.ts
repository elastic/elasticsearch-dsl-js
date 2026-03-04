/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseExpression, escapeValue } from '@elastic/elasticsearch-query-builder'
import { formatIdentifier } from './identifier'
import { ESQLQuery } from './query'

function renderRowValue(value: unknown): string {
  if (BaseExpression.isExpression(value)) {
    return value.toString()
  }
  return escapeValue(value)
}

export class FromCommand extends ESQLQuery {
  private readonly _indices: string[]
  private readonly _metadata: string[] | null

  constructor(indices: string[], metadata?: string[]) {
    super()
    this._indices = indices
    this._metadata = metadata ?? null
  }

  protected _renderInternal(): string {
    const formatted = this._indices
      .map((i) => formatIdentifier(i, { allowPatterns: true }))
      .join(', ')
    let cmd = `FROM ${formatted}`
    if (this._metadata && this._metadata.length > 0) {
      cmd += ` METADATA ${this._metadata.map((f) => formatIdentifier(f)).join(', ')}`
    }
    return cmd
  }

  metadata(...fields: string[]): FromCommand {
    return new FromCommand(this._indices, fields)
  }
}

export class RowCommand extends ESQLQuery {
  private readonly _values: Record<string, unknown>

  constructor(values: Record<string, unknown>) {
    super()
    this._values = values
  }

  protected _renderInternal(): string {
    const pairs = Object.entries(this._values).map(
      ([k, v]) => `${formatIdentifier(k)} = ${renderRowValue(v)}`
    )
    return `ROW ${pairs.join(', ')}`
  }
}

export class ShowCommand extends ESQLQuery {
  private readonly _item: 'INFO' | 'FUNCTIONS'

  constructor(item: 'INFO' | 'FUNCTIONS') {
    super()
    this._item = item
  }

  protected _renderInternal(): string {
    return `SHOW ${this._item}`
  }
}

export class TsCommand extends ESQLQuery {
  private readonly _indices: string[]
  private readonly _metadata: string[] | null

  constructor(indices: string[], metadata?: string[]) {
    super()
    this._indices = indices
    this._metadata = metadata ?? null
  }

  protected _renderInternal(): string {
    const formatted = this._indices
      .map((i) => formatIdentifier(i, { allowPatterns: true }))
      .join(', ')
    let cmd = `TS ${formatted}`
    if (this._metadata && this._metadata.length > 0) {
      cmd += ` METADATA ${this._metadata.map((f) => formatIdentifier(f)).join(', ')}`
    }
    return cmd
  }

  metadata(...fields: string[]): TsCommand {
    return new TsCommand(this._indices, fields)
  }
}

export class BranchCommand extends ESQLQuery {
  protected _renderInternal(): string {
    return ''
  }
}

export const ESQL = {
  from(...indices: string[]): FromCommand {
    return new FromCommand(indices)
  },

  row(values: Record<string, unknown>): RowCommand {
    return new RowCommand(values)
  },

  show(item: 'INFO' | 'FUNCTIONS'): ShowCommand {
    return new ShowCommand(item)
  },

  ts(...indices: string[]): TsCommand {
    return new TsCommand(indices)
  },

  branch(): BranchCommand {
    return new BranchCommand()
  },
}
