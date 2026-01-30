/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest'
import { Query } from '../src/query'
import { Search } from '../src/search'

describe('Search', () => {
  describe('basic search', () => {
    it('should create an empty search', () => {
      const search = new Search()
      expect(search.toJSON()).toEqual({})
    })

    it('should create a search with query', () => {
      const search = new Search().query(Query.match('title', 'elasticsearch'))
      expect(search.toJSON()).toEqual({
        query: {
          match: {
            title: {
              query: 'elasticsearch',
            },
          },
        },
      })
    })
  })

  describe('pagination', () => {
    it('should set size', () => {
      const search = new Search().size(10)
      expect(search.toJSON()).toEqual({ size: 10 })
    })

    it('should set from', () => {
      const search = new Search().from(20)
      expect(search.toJSON()).toEqual({ from: 20 })
    })

    it('should set both size and from', () => {
      const search = new Search().size(10).from(20)
      expect(search.toJSON()).toEqual({ size: 10, from: 20 })
    })
  })

  describe('sorting', () => {
    it('should add a sort clause', () => {
      const search = new Search().sort('date', 'desc')
      expect(search.toJSON()).toEqual({
        sort: [{ date: { order: 'desc' } }],
      })
    })

    it('should add multiple sort clauses', () => {
      const search = new Search().sort('date', 'desc').sort('_score', 'desc')
      expect(search.toJSON()).toEqual({
        sort: [{ date: { order: 'desc' } }, { _score: { order: 'desc' } }],
      })
    })

    it('should default to ascending order', () => {
      const search = new Search().sort('name')
      expect(search.toJSON()).toEqual({
        sort: [{ name: { order: 'asc' } }],
      })
    })
  })

  describe('source filtering', () => {
    it('should disable source', () => {
      const search = new Search().source(false)
      expect(search.toJSON()).toEqual({ _source: false })
    })

    it('should include specific fields', () => {
      const search = new Search().source(['title', 'date'])
      expect(search.toJSON()).toEqual({ _source: ['title', 'date'] })
    })

    it('should use includes/excludes', () => {
      const search = new Search().source({
        includes: ['title', 'date'],
        excludes: ['body'],
      })
      expect(search.toJSON()).toEqual({
        _source: {
          includes: ['title', 'date'],
          excludes: ['body'],
        },
      })
    })
  })

  describe('highlight', () => {
    it('should add highlight configuration', () => {
      const search = new Search().highlight({
        title: {},
        body: { fragment_size: 150 },
      })
      expect(search.toJSON()).toEqual({
        highlight: {
          fields: {
            title: {},
            body: { fragment_size: 150 },
          },
        },
      })
    })
  })

  describe('chaining', () => {
    it('should support method chaining', () => {
      const search = new Search()
        .query(Query.match('title', 'elasticsearch'))
        .size(10)
        .from(0)
        .sort('date', 'desc')
        .source(['title', 'date'])

      expect(search.toJSON()).toEqual({
        query: {
          match: {
            title: {
              query: 'elasticsearch',
            },
          },
        },
        size: 10,
        from: 0,
        sort: [{ date: { order: 'desc' } }],
        _source: ['title', 'date'],
      })
    })
  })

  describe('static create', () => {
    it('should create a new instance via static method', () => {
      const search = Search.create().size(5)
      expect(search.toJSON()).toEqual({ size: 5 })
    })
  })
})
