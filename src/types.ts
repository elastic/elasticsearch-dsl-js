/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base query interface
 */
export interface QueryDsl {
  [key: string]: unknown
}

/**
 * Search request body interface
 */
export interface SearchBody {
  query?: QueryDsl
  size?: number
  from?: number
  sort?: Array<string | Record<string, unknown>>
  _source?: boolean | string[] | { includes?: string[]; excludes?: string[] }
  aggs?: Record<string, unknown>
  highlight?: Record<string, unknown>
}

/**
 * Query builder options
 */
export interface QueryOptions {
  boost?: number
  name?: string
}

/**
 * Match query options
 */
export interface MatchQueryOptions extends QueryOptions {
  operator?: 'and' | 'or'
  fuzziness?: string | number
  prefix_length?: number
  max_expansions?: number
  analyzer?: string
}

/**
 * Term query options
 */
export interface TermQueryOptions extends QueryOptions {
  case_insensitive?: boolean
}

/**
 * Range query options
 */
export interface RangeQueryOptions extends QueryOptions {
  gte?: number | string
  gt?: number | string
  lte?: number | string
  lt?: number | string
  format?: string
  time_zone?: string
}
