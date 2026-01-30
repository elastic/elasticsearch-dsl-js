/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Query } from './query'
import type { SearchBody } from './types'

/**
 * Search class for building Elasticsearch search requests
 *
 * @example
 * ```typescript
 * const search = new Search()
 *   .query(Query.match('title', 'elasticsearch'))
 *   .size(10)
 *   .from(0)
 *   .sort('date', 'desc')
 *
 * const body = search.toJSON()
 * // Use with @elastic/elasticsearch client:
 * // client.search({ index: 'my-index', body })
 * ```
 */
export class Search {
  private _body: SearchBody = {}

  /**
   * Set the query for this search
   */
  query(query: Query): this {
    this._body.query = query.toJSON()
    return this
  }

  /**
   * Set the number of results to return
   */
  size(size: number): this {
    this._body.size = size
    return this
  }

  /**
   * Set the offset for pagination
   */
  from(from: number): this {
    this._body.from = from
    return this
  }

  /**
   * Add a sort clause
   */
  sort(field: string, order: 'asc' | 'desc' = 'asc'): this {
    if (!this._body.sort) {
      this._body.sort = []
    }
    this._body.sort.push({ [field]: { order } })
    return this
  }

  /**
   * Set source filtering
   */
  source(source: boolean | string[] | { includes?: string[]; excludes?: string[] }): this {
    this._body._source = source
    return this
  }

  /**
   * Add highlight configuration
   */
  highlight(fields: Record<string, unknown>): this {
    this._body.highlight = { fields }
    return this
  }

  /**
   * Convert the search to a JSON-serializable object
   */
  toJSON(): SearchBody {
    return { ...this._body }
  }

  /**
   * Create a new Search instance
   */
  static create(): Search {
    return new Search()
  }
}
