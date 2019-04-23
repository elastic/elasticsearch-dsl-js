'use strict'

/* eslint camelcase: 0 */

import deepMerge from 'deepmerge'
/* eslint-disable no-unused-vars */
import * as t from './types'
/* eslint-enable no-unused-vars */

function Q (...blocks: any[]): any {
  blocks = flatten(blocks)
  return Object.assign.apply({}, blocks.filter(falsy))
}

Q.match = function match (key: string, val: string, opts?: any): t.Condition {
  return generateQueryObject('match', key, val, opts)
}

Q.matchPhrase = function matchPhrase (key: string, val: string, opts?: any): t.Condition {
  return generateQueryObject('match_phrase', key, val, opts)
}

Q.matchPhrasePrefix = function matchPhrasePrefix (key: string, val: string, opts?: any): t.Condition {
  return generateQueryObject('match_phrase_prefix', key, val, opts)
}

Q.multiMatch = function multiMatch (keys: string[], val: string, opts?: any): t.Condition {
  return {
    multi_match: {
      query: val,
      fields: keys,
      ...opts
    }
  }
}

Q.matchAll = function matchAll (opts?: any): t.Condition {
  return { match_all: { ...opts } }
}

Q.matchNone = function matchNone (): t.Condition {
  return { match_none: {} }
}

Q.common = function common (key: string, val: string, opts: any): t.Condition {
  return {
    common: {
      [key]: {
        query: val,
        ...opts
      }
    }
  }
}

Q.queryString = function queryString (val: string, opts: any): t.Condition {
  return {
    query_string: {
      query: val,
      ...opts
    }
  }
}

Q.simpleQueryString = function simpleQueryString (val: string, opts: any): t.Condition {
  return {
    simple_query_string: {
      query: val,
      ...opts
    }
  }
}

Q.term = function term (key: string, val: string, opts?: any): t.Condition {
  if (opts == null) {
    return { term: { [key]: val } }
  }
  return {
    term: {
      [key]: {
        value: val,
        ...opts
      }
    }
  }
}

Q.terms = function terms (key: string, val: any): t.Condition {
  return { terms: { [key]: val } }
}

Q.termsSet = function termsSet (key: string, val: string[], opts: any): t.Condition {
  return {
    terms_set: {
      [key]: {
        terms: val,
        ...opts
      }
    }
  }
}

Q.range = function range (key: string, val: any): t.Condition {
  return { range: { [key]: val } }
}

Q.exists = function exists (key: string): t.Condition {
  return { exists: { field: key } }
}

Q.prefix = function prefix (key: string, val: string, opts?: any): t.Condition {
  if (opts == null) {
    return { prefix: { [key]: val } }
  }
  return {
    prefix: {
      [key]: {
        value: val,
        ...opts
      }
    }
  }
}

Q.wildcard = function wildcard (key: string, val: string, opts?: any): t.Condition {
  if (opts == null) {
    return { wildcard: { [key]: val } }
  }
  return {
    wildcard: {
      [key]: {
        value: val,
        ...opts
      }
    }
  }
}

Q.regexp = function regexp (key: string, val: string, opts?: any): t.Condition {
  if (opts == null) {
    return { regexp: { [key]: val } }
  }
  return {
    regexp: {
      [key]: {
        value: val,
        ...opts
      }
    }
  }
}

Q.fuzzy = function fuzzy (key: string, val: string, opts?: any): t.Condition {
  if (opts == null) {
    return { fuzzy: { [key]: val } }
  }
  return {
    fuzzy: {
      [key]: {
        value: val,
        ...opts
      }
    }
  }
}

Q.ids = function ids (key: string, val: string[], opts: any): t.Condition {
  return {
    ids: {
      [key]: {
        values: val,
        ...opts
      }
    }
  }
}

Q.must = function must (...queries: (t.Condition | t.Falsy)[]): t.MustClause {
  queries = flatten(queries)
  return { must: queries.filter(falsy).map(removeQueryKey) }
}

Q.should = function should (...queries: (t.Condition | t.Falsy)[]): t.ShouldClause {
  queries = flatten(queries)
  return { should: queries.filter(falsy).map(removeQueryKey) }
}

Q.mustNot = function mustNot (...queries: (t.Condition | t.Falsy)[]): t.MustNotClause {
  queries = flatten(queries)
  return { must_not: queries.filter(falsy).map(removeQueryKey) }
}

Q.filter = function filter (...queries: (t.Condition | t.Falsy)[]): t.FilterClause {
  queries = flatten(queries)
  return { filter: queries.filter(falsy).map(removeQueryKey) }
}

Q.bool = function bool (...queries: (t.BoolQueryOptions | t.Falsy)[]): t.BoolQuery {
  if (queries.length === 0) {
    return { query: { bool: {} } }
  }

  return {
    query: {
      bool: Object.assign.apply(null, queries.filter(falsy))
    }
  }
}

Q.nested = function nested (path: string, query: any, opts: any): t.QueryBlock {
  return {
    query: {
      nested: {
        path,
        ...opts,
        ...query
      }
    }
  }
}

Q.constantScore = function constantScore (query: any, boost: number): t.QueryBlock {
  return {
    query: {
      constant_score: {
        ...query,
        boost
      }
    }
  }
}

Q.disMax = function disMax (queries: any[], opts?: any): t.QueryBlock {
  queries = flatten(queries)
  return {
    query: {
      dis_max: {
        ...opts,
        queries
      }
    }
  }
}

Q.functionScore = function functionScore (function_score: any): t.QueryBlock {
  return { query: { function_score } }
}

Q.boosting = function boosting (boostOpts: any): t.QueryBlock {
  return { query: { boosting: boostOpts } }
}

Q.sort = function sort (key: string | any[], opts?: any): t.Condition {
  if (Array.isArray(key) === true) {
    return { sort: key }
  }
  return {
    // @ts-ignore
    sort: [{ [key]: opts }]
  }
}

Q.size = function size (s: number): t.Condition {
  return { size: s }
}

function _and (q1: t.AnyQuery, ...queries: any[]): t.BoolQuery
function _and (q1: t.AnyQuery, q2: t.AnyQuery, ...queries: any[]): t.BoolQuery {
  const q: t.BoolQuery = andOp(q1, q2)
  if (queries.length === 0) return q
  return Q.and(q, ...queries)
}
Q.and = _and

function andOp (q1: t.AnyQuery, q2: t.AnyQuery): t.BoolQuery {
  const b1: t.BoolQuery = normalize('must', q1)
  const b2: t.BoolQuery = normalize('must', q2)
  if (b1.query.bool.should === undefined && b2.query.bool.should === undefined) {
    return deepMerge(b1, b2)
  } else {
    b1.query.bool.must!.push(b2.query)
    return b1
  }
}

function _or (q1: t.AnyQuery, ...queries: any[]): t.BoolQuery
function _or (q1: t.AnyQuery, q2: t.AnyQuery, ...queries: any[]): t.BoolQuery {
  const q: t.BoolQuery = orOp(q1, q2)
  if (queries.length === 0) return q
  return Q.or(q, ...queries)
}
Q.or = _or

function orOp (q1: t.AnyQuery, q2: t.AnyQuery): t.BoolQuery {
  const b1: t.BoolQuery = normalize('should', q1)
  const b2: t.BoolQuery = normalize('should', q2)
  // both does not have should clauses
  if (b1.query.bool.should === undefined && b2.query.bool.should === undefined) {
    return Q.bool(Q.should(b1, b2))
  // both have only should clauses with no minimum_should_match
  } else if (onlyShould(b1) && onlyShould(b2) &&
    (b1.query.bool.minimum_should_match === undefined &&
     b2.query.bool.minimum_should_match === undefined)) {
    return deepMerge(b1, b2)
  // q1 has only should clause
  } else if (onlyShould(b1)) {
    b1.query.bool.should!.push(b2.query)
    return b1
  // q2 has only should clause
  } else if (onlyShould(b2)) {
    b2.query.bool.should!.push(b1.query)
    return b2
  } else {
    return Q.bool(Q.should(b1, b2))
  }
}

Q.not = function not (q: t.AnyQuery): t.BoolQuery {
  if (isBool(q) && onlyMust(q)) {
    return Q.bool(Q.mustNot(...q.query.bool.must!))
  }
  return Q.bool(Q.mustNot(isBool(q) ? q.query : q))
}

function generateQueryObject (queryType: string, key: string, val: any, opts?: any): t.Condition {
  if (opts === undefined) {
    return { [queryType]: { [key]: val } }
  }
  return {
    [queryType]: {
      [key]: {
        query: val,
        ...opts
      }
    }
  }
}

function isBool (q: any): q is t.BoolQuery {
  return q.query && q.query.bool
}

function onlyShould (q: t.BoolQuery): boolean {
  const { bool } = q.query
  if (bool.must !== undefined) return false
  if (bool.must_not !== undefined) return false
  if (bool.filter !== undefined) return false
  return true
}

function onlyMust (q: t.BoolQuery): boolean {
  const { bool } = q.query
  if (bool.should !== undefined) return false
  if (bool.must_not !== undefined) return false
  if (bool.filter !== undefined) return false
  return true
}

function falsy (val: any): boolean {
  return !!val
}

// for a given query it always return a bool query:
//  - if is a bool query returns the query
//  - if is a clause, wraps the query in a bool block
//  - if is condition, wraps the query into the specified
//    clause and then in a bool block
function normalize (type: 'must' | 'should', query: any): t.BoolQuery {
  if (isBool(query)) {
    query.query.bool[type] = query.query.bool[type] || []
    return query
  }

  if (query.must || query.should || query.must_not || query.filter) {
    if (query[type] === undefined) {
      return Q.bool(Q[type](), query)
    }
    return Q.bool(query)
  }

  return Q.bool(Q[type](query))
}

function flatten (arr: any[] = []): any[] {
  const flat: any[] = []
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i]
    if (Array.isArray(element)) {
      flat.push.apply(flat, element)
    } else {
      flat.push(element)
    }
  }
  return flat
}

function removeQueryKey (q: t.QueryBlock): any {
  return q.query ? q.query : q
}

export default Q
