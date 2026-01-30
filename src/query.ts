/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  MatchQueryOptions,
  QueryDsl,
  QueryOptions,
  RangeQueryOptions,
  TermQueryOptions,
} from './types'

/**
 * Base Query class for building Elasticsearch queries
 *
 * @example
 * ```typescript
 * const query = Query.match('title', 'elasticsearch')
 * console.log(query.toJSON())
 * // { match: { title: { query: 'elasticsearch' } } }
 * ```
 */
export class Query {
  protected _query: QueryDsl

  constructor(query: QueryDsl = {}) {
    this._query = query
  }

  /**
   * Convert the query to a JSON-serializable object
   */
  toJSON(): QueryDsl {
    return this._query
  }

  /**
   * Create a match query
   */
  static match(field: string, value: string, options: MatchQueryOptions = {}): Query {
    return new Query({
      match: {
        [field]: {
          query: value,
          ...options,
        },
      },
    })
  }

  /**
   * Create a term query
   */
  static term(
    field: string,
    value: string | number | boolean,
    options: TermQueryOptions = {}
  ): Query {
    return new Query({
      term: {
        [field]: {
          value,
          ...options,
        },
      },
    })
  }

  /**
   * Create a terms query
   */
  static terms(field: string, values: Array<string | number>, options: QueryOptions = {}): Query {
    return new Query({
      terms: {
        [field]: values,
        ...options,
      },
    })
  }

  /**
   * Create a range query
   */
  static range(field: string, options: RangeQueryOptions): Query {
    return new Query({
      range: {
        [field]: options,
      },
    })
  }

  /**
   * Create a bool query with must clauses
   */
  static bool(clauses: {
    must?: Query[]
    should?: Query[]
    must_not?: Query[]
    filter?: Query[]
  }): Query {
    const boolQuery: Record<string, QueryDsl[]> = {}

    if (clauses.must?.length) {
      boolQuery.must = clauses.must.map((q) => q.toJSON())
    }
    if (clauses.should?.length) {
      boolQuery.should = clauses.should.map((q) => q.toJSON())
    }
    if (clauses.must_not?.length) {
      boolQuery.must_not = clauses.must_not.map((q) => q.toJSON())
    }
    if (clauses.filter?.length) {
      boolQuery.filter = clauses.filter.map((q) => q.toJSON())
    }

    return new Query({ bool: boolQuery })
  }

  /**
   * Create a match_all query
   */
  static matchAll(options: QueryOptions = {}): Query {
    return new Query({
      match_all: options,
    })
  }

  /**
   * Create an exists query
   */
  static exists(field: string): Query {
    return new Query({
      exists: { field },
    })
  }

  /**
   * Create a prefix query
   */
  static prefix(field: string, value: string, options: QueryOptions = {}): Query {
    return new Query({
      prefix: {
        [field]: {
          value,
          ...options,
        },
      },
    })
  }

  /**
   * Create a wildcard query
   */
  static wildcard(field: string, value: string, options: QueryOptions = {}): Query {
    return new Query({
      wildcard: {
        [field]: {
          value,
          ...options,
        },
      },
    })
  }

  /**
   * Create a match_phrase query
   */
  static matchPhrase(field: string, value: string, options: QueryOptions = {}): Query {
    return new Query({
      match_phrase: {
        [field]: {
          query: value,
          ...options,
        },
      },
    })
  }
}
