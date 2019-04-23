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
}

export interface FilterClause {
  filter: Condition[]
}

export interface BoolQuery {
  query: {
    bool: {
      must?: Condition[]
      must_not?: Condition[]
      should?: Condition[]
      filter?: Condition[]
      minimum_should_match?: number
    }
  }
}

export type BoolQueryOptions = MustClause | MustNotClause | ShouldClause | FilterClause

export type AnyQuery = BoolQuery | MustClause | MustNotClause | ShouldClause | FilterClause | Condition

export type Falsy = false | null | undefined

export interface Aggregation {
  [key: string]: {
    [key: string]: {
      [key: string]: any
    }
  }
}
