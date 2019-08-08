'use strict'

import { test } from 'tap'
import { Client } from '@elastic/elasticsearch'
import { buildServer } from '../utils'
import { helper } from '../../src'

test('Search should have an additional documents property', t => {
  t.plan(5)

  async function handler (req, res) {
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      hits: {
        hits: [
          { _source: { one: 'one' } },
          { _source: { two: 'two' } },
          { _source: { three: 'three' } }
        ]
      }
    }))
  }

  buildServer(handler, async (port, server) => {
    t.teardown(server.stop)
    const client = new Client({ node: `http://localhost:${port}` })
    const { search } = helper({ client })
    const result = await search({
      index: 'test',
      body: { foo: 'bar' }
    })
    t.ok(result.body !== undefined)
    t.ok(result.statusCode !== undefined)
    t.ok(result.headers !== undefined)
    t.ok(result.warnings !== undefined)
    t.deepEqual(result.documents, [
      { one: 'one' },
      { two: 'two' },
      { three: 'three' }
    ])
  })
})
