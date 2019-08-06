/* eslint camelcase: 0 */

export interface Condition {
  [key: string]: any
}

export interface QueryBlock {
  query: {
    [key: string]: any
  }
}

export interface MustClause {
  must: Condition[]
}

export interface MustNotClause {
  must_not: Condition[]
}

export interface ShouldClause {
  should: Condition[]
  minimum_should_match?: number
}

export interface FilterClause {
  filter: Condition[]
}

export interface BoolQuery<TOptions = BoolQueryOptions> {
  query: {
    bool: TOptions
  }
}

export interface BoolBlock {
  bool: BoolQueryOptions
}

export interface BoolQueryOptions {
  must?: Condition[] | BoolBlock[]
  must_not?: Condition[] | BoolBlock[]
  should?: Condition[] | BoolBlock[]
  filter?: Condition[] | BoolBlock[]
  minimum_should_match?: number
  _name?: string
}

export type AnyQuery = BoolQuery | BoolQueryOptions | Condition | Condition[]

export type Falsy = false | null | undefined

export interface Aggregation {
  [key: string]: any
}
