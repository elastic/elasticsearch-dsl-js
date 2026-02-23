/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { escapeValue } from '@elastic/elasticsearch-query-builder'
import { ESQLBase } from './base'
import { formatIdentifier } from './identifier'

class MetadataCommand extends ESQLBase {
  private readonly _fields: string[]

  constructor(parent: ESQLBase, fields: string[]) {
    super()
    this.setParent(parent)
    this._fields = fields
  }

  protected _renderInternal(): string {
    const formatted = this._fields.map((f) => formatIdentifier(f)).join(', ')
    return `METADATA ${formatted}`
  }
}

export class FromCommand extends ESQLBase {
  private readonly _indices: string[]

  constructor(indices: string[]) {
    super()
    this._indices = indices
  }

  protected _renderInternal(): string {
    const formatted = this._indices
      .map((i) => formatIdentifier(i, { allowPatterns: true }))
      .join(', ')
    return `FROM ${formatted}`
  }

  metadata(...fields: string[]): MetadataCommand {
    return new MetadataCommand(this, fields)
  }
}

export class RowCommand extends ESQLBase {
  private readonly _values: Record<string, unknown>

  constructor(values: Record<string, unknown>) {
    super()
    this._values = values
  }

  protected _renderInternal(): string {
    const pairs = Object.entries(this._values).map(
      ([k, v]) => `${formatIdentifier(k)} = ${escapeValue(v)}`
    )
    return `ROW ${pairs.join(', ')}`
  }
}

export class ShowCommand extends ESQLBase {
  private readonly _item: 'INFO' | 'FUNCTIONS'

  constructor(item: 'INFO' | 'FUNCTIONS') {
    super()
    this._item = item
  }

  protected _renderInternal(): string {
    return `SHOW ${this._item}`
  }
}

export class TsCommand extends ESQLBase {
  private readonly _indices: string[]

  constructor(indices: string[]) {
    super()
    this._indices = indices
  }

  protected _renderInternal(): string {
    const formatted = this._indices
      .map((i) => formatIdentifier(i, { allowPatterns: true }))
      .join(', ')
    return `TS ${formatted}`
  }

  metadata(...fields: string[]): MetadataCommand {
    return new MetadataCommand(this, fields)
  }
}

export class BranchCommand extends ESQLBase {
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
