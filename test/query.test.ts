/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest'
import { Query } from '../src/query'

describe('Query', () => {
  describe('match', () => {
    it('should create a basic match query', () => {
      const query = Query.match('title', 'elasticsearch')
      expect(query.toJSON()).toEqual({
        match: {
          title: {
            query: 'elasticsearch',
          },
        },
      })
    })

    it('should create a match query with options', () => {
      const query = Query.match('title', 'elasticsearch', {
        operator: 'and',
        fuzziness: 'AUTO',
      })
      expect(query.toJSON()).toEqual({
        match: {
          title: {
            query: 'elasticsearch',
            operator: 'and',
            fuzziness: 'AUTO',
          },
        },
      })
    })
  })

  describe('term', () => {
    it('should create a term query', () => {
      const query = Query.term('status', 'published')
      expect(query.toJSON()).toEqual({
        term: {
          status: {
            value: 'published',
          },
        },
      })
    })

    it('should handle numeric values', () => {
      const query = Query.term('priority', 5)
      expect(query.toJSON()).toEqual({
        term: {
          priority: {
            value: 5,
          },
        },
      })
    })
  })

  describe('terms', () => {
    it('should create a terms query', () => {
      const query = Query.terms('status', ['published', 'draft'])
      expect(query.toJSON()).toEqual({
        terms: {
          status: ['published', 'draft'],
        },
      })
    })
  })

  describe('range', () => {
    it('should create a range query', () => {
      const query = Query.range('date', {
        gte: '2024-01-01',
        lte: '2024-12-31',
      })
      expect(query.toJSON()).toEqual({
        range: {
          date: {
            gte: '2024-01-01',
            lte: '2024-12-31',
          },
        },
      })
    })

    it('should handle numeric ranges', () => {
      const query = Query.range('price', { gte: 10, lt: 100 })
      expect(query.toJSON()).toEqual({
        range: {
          price: {
            gte: 10,
            lt: 100,
          },
        },
      })
    })
  })

  describe('bool', () => {
    it('should create a bool query with must clauses', () => {
      const query = Query.bool({
        must: [Query.match('title', 'elasticsearch'), Query.term('status', 'published')],
      })
      expect(query.toJSON()).toEqual({
        bool: {
          must: [
            { match: { title: { query: 'elasticsearch' } } },
            { term: { status: { value: 'published' } } },
          ],
        },
      })
    })

    it('should create a bool query with multiple clause types', () => {
      const query = Query.bool({
        must: [Query.match('title', 'elasticsearch')],
        should: [Query.term('featured', true)],
        must_not: [Query.term('status', 'deleted')],
        filter: [Query.range('date', { gte: '2024-01-01' })],
      })

      const result = query.toJSON()
      expect(result).toHaveProperty('bool.must')
      expect(result).toHaveProperty('bool.should')
      expect(result).toHaveProperty('bool.must_not')
      expect(result).toHaveProperty('bool.filter')
    })
  })

  describe('matchAll', () => {
    it('should create a match_all query', () => {
      const query = Query.matchAll()
      expect(query.toJSON()).toEqual({
        match_all: {},
      })
    })

    it('should create a match_all query with boost', () => {
      const query = Query.matchAll({ boost: 1.5 })
      expect(query.toJSON()).toEqual({
        match_all: { boost: 1.5 },
      })
    })
  })

  describe('exists', () => {
    it('should create an exists query', () => {
      const query = Query.exists('email')
      expect(query.toJSON()).toEqual({
        exists: { field: 'email' },
      })
    })
  })

  describe('prefix', () => {
    it('should create a prefix query', () => {
      const query = Query.prefix('title', 'elast')
      expect(query.toJSON()).toEqual({
        prefix: {
          title: {
            value: 'elast',
          },
        },
      })
    })
  })

  describe('wildcard', () => {
    it('should create a wildcard query', () => {
      const query = Query.wildcard('title', 'elast*')
      expect(query.toJSON()).toEqual({
        wildcard: {
          title: {
            value: 'elast*',
          },
        },
      })
    })
  })

  describe('matchPhrase', () => {
    it('should create a match_phrase query', () => {
      const query = Query.matchPhrase('description', 'quick brown fox')
      expect(query.toJSON()).toEqual({
        match_phrase: {
          description: {
            query: 'quick brown fox',
          },
        },
      })
    })
  })
})
