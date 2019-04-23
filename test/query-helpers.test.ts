'use strict'

import { test } from 'tap'
/* eslint-disable no-unused-vars */
import * as t from '../lib/types'
/* eslint-enable no-unused-vars */
import { Q } from '../lib'

test('Q is a function that creates the final query object', t => {
  t.type(Q, 'function')

  t.test('Basic', t => {
    t.deepEqual(Q({ a: 1 }, { b: 2 }, { c: 3 }), {
      a: 1,
      b: 2,
      c: 3
    })
    t.end()
  })

  t.test('Should discard falsy values', t => {
    t.deepEqual(Q({ a: 1 }, false, { b: 2 }, null, { c: 3 }), {
      a: 1,
      b: 2,
      c: 3
    })
    t.end()
  })

  t.end()
})

test('match returns a match query', t => {
  t.type(Q.match, 'function')

  t.test('simple query', t => {
    t.deepEqual(Q.match('foo', 'bar'), {
      match: { foo: 'bar' }
    })
    t.end()
  })

  t.test('complex query', t => {
    t.deepEqual(Q.match('foo', 'bar', { operator: 'and' }), {
      match: {
        foo: {
          query: 'bar',
          operator: 'and'
        }
      }
    })
    t.end()
  })

  t.end()
})

test('matchPhrase returns a match_phrase query', t => {
  t.type(Q.matchPhrase, 'function')

  t.test('simple query', t => {
    t.deepEqual(Q.matchPhrase('foo', 'bar'), {
      match_phrase: { foo: 'bar' }
    })
    t.end()
  })

  t.test('complex query', t => {
    t.deepEqual(Q.matchPhrase('foo', 'bar', { analyzer: 'test' }), {
      match_phrase: {
        foo: {
          query: 'bar',
          analyzer: 'test'
        }
      }
    })
    t.end()
  })

  t.end()
})

test('matchPhrasePrefix returns a match_phrase_prefix query', t => {
  t.type(Q.matchPhrasePrefix, 'function')

  t.test('simple query', t => {
    t.deepEqual(Q.matchPhrasePrefix('foo', 'bar'), {
      match_phrase_prefix: { foo: 'bar' }
    })
    t.end()
  })

  t.test('complex query', t => {
    t.deepEqual(Q.matchPhrasePrefix('foo', 'bar', { max_expansions: 10 }), {
      match_phrase_prefix: {
        foo: {
          query: 'bar',
          max_expansions: 10
        }
      }
    })
    t.end()
  })

  t.end()
})

test('multiMatch returns a multi_match query', t => {
  t.type(Q.multiMatch, 'function')

  t.deepEqual(Q.multiMatch(['foo', 'baz'], 'bar', { type: 'best_fields' }), {
    multi_match: {
      query: 'bar',
      fields: ['foo', 'baz'],
      type: 'best_fields'
    }
  })

  t.end()
})

test('matchAll returns a match_all query', t => {
  t.type(Q.matchAll, 'function')

  t.deepEqual(Q.matchAll({ boost: 1.2 }), {
    match_all: { boost: 1.2 }
  })

  t.end()
})

test('matchNone returns a match_none query', t => {
  t.type(Q.matchNone, 'function')

  t.deepEqual(Q.matchNone(), {
    match_none: {}
  })

  t.end()
})

test('common returns a common query', t => {
  t.type(Q.common, 'function')

  t.deepEqual(Q.common('foo', 'bar', { cutoff_frequency: 0.001 }), {
    common: {
      foo: {
        query: 'bar',
        cutoff_frequency: 0.001
      }
    }
  })

  t.end()
})

test('queryString returns a query_string query', t => {
  t.type(Q.queryString, 'function')

  t.deepEqual(Q.queryString('foo', { default_field: 'content' }), {
    query_string: {
      query: 'foo',
      default_field: 'content'
    }
  })

  t.end()
})

test('simpleQueryString returns a simple_query_string query', t => {
  t.type(Q.simpleQueryString, 'function')

  t.deepEqual(Q.simpleQueryString('foo', { default_field: 'content' }), {
    simple_query_string: {
      query: 'foo',
      default_field: 'content'
    }
  })

  t.end()
})

test('term returns a term query', t => {
  t.type(Q.term, 'function')

  t.test('simple query', t => {
    t.deepEqual(Q.term('foo', 'bar'), {
      term: { foo: 'bar' }
    })
    t.end()
  })

  t.test('complex query', t => {
    t.deepEqual(Q.term('foo', 'bar', { boost: 2.0 }), {
      term: {
        foo: {
          value: 'bar',
          boost: 2.0
        }
      }
    })
    t.end()
  })

  t.end()
})

test('terms returns a terms query', t => {
  t.type(Q.terms, 'function')

  t.deepEqual(Q.terms('foo', ['bar', 'baz']), {
    terms: { foo: ['bar', 'baz'] }
  })

  t.end()
})

test('termsSet returns a terms_set query', t => {
  t.type(Q.termsSet, 'function')

  t.deepEqual(Q.termsSet('foo', ['bar', 'baz'], { minimum_should_match_field: 'required_matches' }), {
    terms_set: {
      foo: {
        terms: ['bar', 'baz'],
        minimum_should_match_field: 'required_matches'
      }
    }
  })

  t.end()
})

test('range returns a range query', t => {
  t.type(Q.range, 'function')

  t.deepEqual(Q.range('foo', { gte: 2 }), {
    range: { foo: { gte: 2 } }
  })

  t.end()
})

test('exists returns a exists query', t => {
  t.type(Q.exists, 'function')

  t.deepEqual(Q.exists('foo'), {
    exists: { field: 'foo' }
  })

  t.end()
})

test('prefix returns a prefix query', t => {
  t.type(Q.prefix, 'function')

  t.test('simple query', t => {
    t.deepEqual(Q.prefix('foo', 'bar'), {
      prefix: { foo: 'bar' }
    })
    t.end()
  })

  t.test('complex query', t => {
    t.deepEqual(Q.prefix('foo', 'bar', { boost: 2.0 }), {
      prefix: {
        foo: {
          value: 'bar',
          boost: 2.0
        }
      }
    })
    t.end()
  })

  t.end()
})

test('wildcard returns a wildcard query', t => {
  t.type(Q.wildcard, 'function')

  t.test('simple query', t => {
    t.deepEqual(Q.wildcard('foo', 'bar'), {
      wildcard: { foo: 'bar' }
    })
    t.end()
  })

  t.test('complex query', t => {
    t.deepEqual(Q.wildcard('foo', 'bar', { boost: 2.0 }), {
      wildcard: {
        foo: {
          value: 'bar',
          boost: 2.0
        }
      }
    })
    t.end()
  })

  t.end()
})

test('regexp returns a regexp query', t => {
  t.type(Q.regexp, 'function')

  t.test('simple query', t => {
    t.deepEqual(Q.regexp('foo', 'bar'), {
      regexp: { foo: 'bar' }
    })
    t.end()
  })

  t.test('complex query', t => {
    t.deepEqual(Q.regexp('foo', 'bar', { boost: 2.0 }), {
      regexp: {
        foo: {
          value: 'bar',
          boost: 2.0
        }
      }
    })
    t.end()
  })

  t.end()
})

test('fuzzy returns a fuzzy query', t => {
  t.type(Q.fuzzy, 'function')

  t.test('simple query', t => {
    t.deepEqual(Q.fuzzy('foo', 'bar'), {
      fuzzy: { foo: 'bar' }
    })
    t.end()
  })

  t.test('complex query', t => {
    t.deepEqual(Q.fuzzy('foo', 'bar', { boost: 2.0 }), {
      fuzzy: {
        foo: {
          value: 'bar',
          boost: 2.0
        }
      }
    })
    t.end()
  })

  t.end()
})

test('ids returns a ids query', t => {
  t.type(Q.ids, 'function')

  t.deepEqual(Q.ids('foo', ['bar', 'baz'], { type: '_doc' }), {
    ids: {
      foo: {
        values: ['bar', 'baz'],
        type: '_doc'
      }
    }
  })

  t.end()
})

test('must returns a must block', t => {
  t.type(Q.must, 'function')

  t.deepEqual(Q.must(c('foo'), c('bar'), c('baz')), {
    must: [c('foo'), c('bar'), c('baz')]
  })

  t.deepEqual(Q.must(c('foo'), false, c('bar'), null, c('baz')), {
    must: [c('foo'), c('bar'), c('baz')]
  })

  // should flat arrays
  t.deepEqual(Q.must(c('foo'), [false, c('bar')], null, c('baz')), {
    must: [c('foo'), c('bar'), c('baz')]
  })

  t.end()
})

test('should returns a should block', t => {
  t.type(Q.should, 'function')

  t.deepEqual(Q.should(c('foo'), c('bar'), c('baz')), {
    should: [c('foo'), c('bar'), c('baz')]
  })

  t.deepEqual(Q.should(c('foo'), false, c('bar'), null, c('baz')), {
    should: [c('foo'), c('bar'), c('baz')]
  })

  // should flat arrays
  t.deepEqual(Q.should(c('foo'), [false, c('bar')], null, c('baz')), {
    should: [c('foo'), c('bar'), c('baz')]
  })

  t.end()
})

test('mustNot returns a must_not block', t => {
  t.type(Q.mustNot, 'function')

  t.deepEqual(Q.mustNot(c('foo'), c('bar'), c('baz')), {
    must_not: [c('foo'), c('bar'), c('baz')]
  })

  t.deepEqual(Q.mustNot(c('foo'), false, c('bar'), null, c('baz')), {
    must_not: [c('foo'), c('bar'), c('baz')]
  })

  // should flat arrays
  t.deepEqual(Q.mustNot(c('foo'), [false, c('bar')], null, c('baz')), {
    must_not: [c('foo'), c('bar'), c('baz')]
  })

  t.end()
})

test('filter returns a filter block', t => {
  t.type(Q.filter, 'function')

  t.deepEqual(Q.filter(c('foo'), c('bar'), c('baz')), {
    filter: [c('foo'), c('bar'), c('baz')]
  })

  t.deepEqual(Q.filter(c('foo'), false, c('bar'), null, c('baz')), {
    filter: [c('foo'), c('bar'), c('baz')]
  })

  // should flat arrays
  t.deepEqual(Q.filter(c('foo'), [false, c('bar')], null, c('baz')), {
    filter: [c('foo'), c('bar'), c('baz')]
  })

  t.end()
})

test('bool returns a bool query block', t => {
  t.type(Q.bool, 'function')

  t.deepEqual(Q.bool(Q.must(c('foo')), Q.should(c('bar')), Q.filter(c('baz'))), {
    query: {
      bool: {
        must: [c('foo')],
        should: [c('bar')],
        filter: [c('baz')]
      }
    }
  })

  t.deepEqual(Q.bool(Q.must(c('foo')), false, Q.should(c('bar')), null, Q.filter(c('baz'))), {
    query: {
      bool: {
        must: [c('foo')],
        should: [c('bar')],
        filter: [c('baz')]
      }
    }
  })

  t.deepEqual(Q.bool(), { query: { bool: {} } })

  t.end()
})

test('nested returns a nested query block', t => {
  t.type(Q.nested, 'function')

  const query = Q.bool(Q.must(c('foo')), Q.should(c('bar')), Q.filter(c('baz')))
  t.deepEqual(Q.nested('foo', query, { score_mode: 'max' }), {
    query: {
      nested: {
        path: 'foo',
        score_mode: 'max',
        ...query
      }
    }
  })

  t.end()
})

test('constantScore returns a constant_score query block', t => {
  t.type(Q.constantScore, 'function')

  const query = Q.bool(Q.must(c('foo')), Q.should(c('bar')), Q.filter(c('baz')))
  t.deepEqual(Q.constantScore(query, 2.0), {
    query: {
      constant_score: {
        boost: 2.0,
        ...query
      }
    }
  })

  t.end()
})

test('disMax returns a dis_max query block', t => {
  t.type(Q.disMax, 'function')

  t.test('simple query', t => {
    t.deepEqual(Q.disMax([{ a: 1 }, { b: 2 }, { c: 3 }]), {
      query: {
        dis_max: {
          queries: [{ a: 1 }, { b: 2 }, { c: 3 }]
        }
      }
    })
    t.end()
  })

  t.test('complex query', t => {
    t.deepEqual(Q.disMax([{ a: 1 }, { b: 2 }, { c: 3 }], { tie_breaker: 1.0, boost: 1.0 }), {
      query: {
        dis_max: {
          tie_breaker: 1.0,
          boost: 1.0,
          queries: [{ a: 1 }, { b: 2 }, { c: 3 }]
        }
      }
    })
    t.end()
  })

  t.end()
})

test('functionScore returns a function_score query block', t => {
  t.type(Q.functionScore, 'function')

  t.deepEqual(Q.functionScore({ foo: 'bar' }), {
    query: { function_score: { foo: 'bar' } }
  })

  t.end()
})

test('boosting returns a boosting query block', t => {
  t.type(Q.boosting, 'function')

  t.deepEqual(Q.boosting({ foo: 'bar' }), {
    query: { boosting: { foo: 'bar' } }
  })

  t.end()
})

test('sort returns a sort block', t => {
  t.type(Q.sort, 'function')

  t.test('simple sort', t => {
    t.deepEqual(Q.sort('foo', { order: 'asc' }), {
      sort: [{ foo: { order: 'asc' } }]
    })
    t.end()
  })

  t.test('multiple sorts', t => {
    t.deepEqual(Q.sort([{ foo: { order: 'asc' } }, { bar: { order: 'desc' } }]), {
      sort: [
        { foo: { order: 'asc' } },
        { bar: { order: 'desc' } }
      ]
    })
    t.end()
  })

  t.end()
})

// build a condition bloc
function c (key: string): t.Condition {
  return { [key]: key }
}
