'use strict'

import { createReadStream } from 'fs'
import { join } from 'path'
import split from 'split2'
import { test, beforeEach } from 'tap'
import { Client } from '@elastic/elasticsearch'
import { helper } from '../../src'

const node = process.env.TEST_ES_SERVER || 'http://localhost:9200'

beforeEach(async () => {
  const client = new Client({ node })

  const { body: exists } = await client.indices.exists({ index: 'stackoverflow' })
  if (!exists) {
    // create index and mappings
    await client.indices.create({
      index: 'stackoverflow',
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            title: { type: 'text' },
            body: { type: 'text' },
            answer_count: { type: 'integer' },
            comment_count: { type: 'integer' },
            creation_date: { type: 'date' },
            last_activity_date: { type: 'date' },
            last_editor_display_name: { type: 'text' },
            owner_display_name: { type: 'text' },
            owner_user_id: { type: 'keyword' },
            post_type_id: { type: 'keyword' },
            score: { type: 'integer' },
            tags: { type: 'keyword' },
            view_count: { type: 'integer' }
          }
        }
      }
    })
  }

  const { body } = await client.count({ index: 'stackoverflow' })
  if (body.count === 0) {
    // prepare dataset
    const dataset = createReadStream(join(__dirname, '..', 'fixtures', 'stackoverflow.ndjson'))
    const stream = dataset.pipe(split(chunk => {
      const doc = JSON.parse(chunk)
      doc.answer_count = Number(doc.answer_count)
      doc.comment_count = Number(doc.comment_count)
      doc.score = Number(doc.score)
      doc.view_count = Number(doc.view_count)
      doc.tags = doc.tags.split('|')
      doc.last_activity_date = new Date(doc.last_activity_date)
      doc.creation_date = new Date(doc.creation_date)
      return doc
    }))

    // instance bulk helper and index the data
    const { bulk } = helper({ client })
    await bulk({ datasource: stream })
      .onDrop(() => { throw new Error('Index operation failed' ) })
      .index({ _index: 'stackoverflow' }, doc => ({ _id: doc.id }))
  }
})

test('Scroll search', t => {
  t.test('The result should have all the search properties and a clear method', async t => {
    const client = new Client({ node })
    const { scrollSearch } = helper({ client })

    const params = {
      index: 'stackoverflow',
      scroll: '30s',
      size: 10,
      body: {
        query: { match_all: {} }
      }
    }

    const result = await scrollSearch(params).next()
    t.ok(result.value.body)
    t.ok(result.value.statusCode)
    t.ok(result.value.headers)
    t.ok(result.value.warnings === null)
    t.ok(result.value.documents)
    t.ok(result.value.clear)

    result.value.clear()
  })

  t.test('for loop', async t => {
    const client = new Client({ node })
    const { scrollSearch } = helper({ client })

    const params = {
      index: 'stackoverflow',
      scroll: '30s',
      size: 10,
      body: {
        query: { term: { tags: 'javascript' } }
      }
    }

    // this scroll will return 50 search results
    for await (const result of scrollSearch(params)) {
      t.true(result.documents.length > 0)
    }
  })

  t.end()
})

test('Scroll documents', t => {
  t.test('for loop', async t => {
    const client = new Client({ node })
    const { scrollDocuments } = helper({ client })

    const params = {
      index: 'stackoverflow',
      scroll: '30s',
      size: 10,
      body: {
        query: { term: { tags: 'javascript' } }
      }
    }

    // this scroll will return ~500 documents
    for await (const result of scrollDocuments(params)) {
      t.true(result.tags.includes('javascript'))
    }
  })

  t.end()
})
