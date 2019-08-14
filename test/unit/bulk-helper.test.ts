'use strict'

import { createReadStream } from 'fs'
import { join } from 'path'
import split from 'split2'
import { test } from 'tap'
import { Client, errors } from '@elastic/elasticsearch'
import { buildServer } from '../utils'
import { helper } from '../../src'

const dataset = [
  { user: 'jon', age: 23 },
  { user: 'arya', age: 18 },
  { user: 'tyrion', age: 39 }
]

test('bulk index', t => {
  t.test('datasource as array', t => {
    t.test('Should perform a bulk request', t => {
      t.plan(14)

      let count = 0
      async function handler (req, res) {
        t.strictEqual(req.url, '/_bulk')
        t.match(req.headers, { 'content-type': 'application/x-ndjson' })

        let body = ''
        req.setEncoding('utf8')
        for await (const chunk of req) {
          body += chunk
        }
        const [action, payload] = body.split('\n')

        t.deepEqual(JSON.parse(action), { index: { _index: 'test' } })
        t.deepEqual(JSON.parse(payload), dataset[count++])

        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({
          took: 0,
          errors: false,
          items: []
        }))
      }

      buildServer(handler, async (port, server) => {
        const client = new Client({ node: `http://localhost:${port}` })
        const { bulk } = helper({ client })
        const b = bulk({
          datasource: dataset.slice(),
          bulkSize: 1
        })

        t.teardown(server.stop)

        b.onDrop(doc => {
          t.fail('This should never be called')
        })

        const result = await b.index({ _index: 'test' })
        t.type(result.time, 'number')
        t.match(result, {
          total: 3,
          successful: 3,
          failed: 0,
          aborted: false
        })
      })
    })

    t.test('Should perform a bulk request (custom action)', t => {
      t.plan(14)

      let count = 0
      async function handler (req, res) {
        t.strictEqual(req.url, '/_bulk')
        t.match(req.headers, { 'content-type': 'application/x-ndjson' })

        let body = ''
        req.setEncoding('utf8')
        for await (const chunk of req) {
          body += chunk
        }
        const [action, payload] = body.split('\n')

        t.deepEqual(JSON.parse(action), { index: { _index: 'test', _id: count } })
        t.deepEqual(JSON.parse(payload), dataset[count++])

        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({
          took: 0,
          errors: false,
          items: []
        }))
      }

      buildServer(handler, async (port, server) => {
        const client = new Client({ node: `http://localhost:${port}` })
        const { bulk } = helper({ client })
        const b = bulk({
          datasource: dataset.slice(),
          bulkSize: 1
        })

        t.teardown(server.stop)

        b.onDrop(doc => {
          t.fail('This should never be called')
        })

        let id = 0
        const result = await b.index({ _index: 'test' }, doc => ({ _id: id++ }))
        t.type(result.time, 'number')
        t.match(result, {
          total: 3,
          successful: 3,
          failed: 0,
          aborted: false
        })
      })
    })

    t.test('Should perform a bulk request (retry)', t => {
      t.plan(13)

      async function handler (req, res) {
        t.strictEqual(req.url, '/_bulk')
        t.match(req.headers, { 'content-type': 'application/x-ndjson' })

        let body = ''
        req.setEncoding('utf8')
        for await (const chunk of req) {
          body += chunk
        }
        const [, payload] = body.split('\n')

        res.setHeader('content-type', 'application/json')

        if (JSON.parse(payload).user === 'arya') {
          res.end(JSON.stringify({
            took: 0,
            errors: true,
            items: [{
              index: {
                status: 429
              }
            }]
          }))
        } else {
          res.end(JSON.stringify({
            took: 0,
            errors: false,
            items: []
          }))
        }
      }

      buildServer(handler, async (port, server) => {
        const client = new Client({ node: `http://localhost:${port}` })
        const { bulk } = helper({ client })
        const b = bulk({
          datasource: dataset.slice(),
          bulkSize: 1,
          wait: 10
        })

        t.teardown(server.stop)

        b.onDrop(doc => {
          t.deepEqual(doc, {
            status: 429,
            error: null,
            operation: { index: { _index: 'test' } },
            document: { user: 'arya', age: 18 },
            retried: true
          })
        })

        const result = await b.index({ _index: 'test' })
        t.type(result.time, 'number')
        t.match(result, {
          total: 3,
          successful: 2,
          failed: 1,
          aborted: false
        })
      })
    })

    t.test('Should perform a bulk request (failure)', t => {
      t.plan(9)

      async function handler (req, res) {
        t.strictEqual(req.url, '/_bulk')
        t.match(req.headers, { 'content-type': 'application/x-ndjson' })

        let body = ''
        req.setEncoding('utf8')
        for await (const chunk of req) {
          body += chunk
        }
        const [, payload] = body.split('\n')

        res.setHeader('content-type', 'application/json')

        if (JSON.parse(payload).user === 'arya') {
          res.end(JSON.stringify({
            took: 0,
            errors: true,
            items: [{
              index: {
                status: 400,
                error: { something: 'went wrong' }
              }
            }]
          }))
        } else {
          res.end(JSON.stringify({
            took: 0,
            errors: false,
            items: []
          }))
        }
      }

      buildServer(handler, async (port, server) => {
        const client = new Client({ node: `http://localhost:${port}` })
        const { bulk } = helper({ client })
        const b = bulk({
          datasource: dataset.slice(),
          bulkSize: 1,
          wait: 10
        })

        t.teardown(server.stop)

        b.onDrop(doc => {
          t.deepEqual(doc, {
            status: 400,
            error: { something: 'went wrong' },
            operation: { index: { _index: 'test' } },
            document: { user: 'arya', age: 18 },
            retried: false
          })
        })

        const result = await b.index({ _index: 'test' })
        t.type(result.time, 'number')
        t.match(result, {
          total: 3,
          successful: 2,
          failed: 1,
          aborted: false
        })
      })
    })

    t.test('Server error', t => {
      t.plan(1)

      async function handler (req, res) {
        res.statusCode = 500
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ something: 'went wrong' }))
      }

      buildServer(handler, async (port, server) => {
        const client = new Client({ node: `http://localhost:${port}` })
        const { bulk } = helper({ client })
        const b = bulk({
          datasource: dataset.slice(),
          bulkSize: 1
        })

        t.teardown(server.stop)

        b.onDrop(doc => {
          t.fail('This should never be called')
        })

        try {
          await b.index({ _index: 'test' })
          t.fail('Should throw')
        } catch (err) {
          t.true(err instanceof errors.ResponseError)
        }
      })
    })

    t.test('Should abort a bulk request', t => {
      t.plan(6)

      async function handler (req, res) {
        t.strictEqual(req.url, '/_bulk')
        t.match(req.headers, { 'content-type': 'application/x-ndjson' })

        let body = ''
        req.setEncoding('utf8')
        for await (const chunk of req) {
          body += chunk
        }
        const [, payload] = body.split('\n')

        res.setHeader('content-type', 'application/json')

        if (JSON.parse(payload).user === 'arya') {
          res.end(JSON.stringify({
            took: 0,
            errors: true,
            items: [{
              index: {
                status: 400,
                error: { something: 'went wrong' }
              }
            }]
          }))
        } else {
          res.end(JSON.stringify({
            took: 0,
            errors: false,
            items: []
          }))
        }
      }

      buildServer(handler, async (port, server) => {
        const client = new Client({ node: `http://localhost:${port}` })
        const { bulk } = helper({ client })
        const b = bulk({
          datasource: dataset.slice(),
          bulkSize: 1,
          wait: 10
        })

        t.teardown(server.stop)

        b.onDrop(doc => {
          b.abort()
        })

        const result = await b.index({ _index: 'test' })
        t.type(result.time, 'number')
        t.match(result, {
          total: 2,
          successful: 1,
          failed: 1,
          aborted: true
        })
      })
    })

    t.end()
  })

  t.test('datasource as stream', t => {
    t.test('Should perform a bulk request', t => {
      t.plan(14)

      let count = 0
      async function handler (req, res) {
        t.strictEqual(req.url, '/_bulk')
        t.match(req.headers, { 'content-type': 'application/x-ndjson' })

        let body = ''
        req.setEncoding('utf8')
        for await (const chunk of req) {
          body += chunk
        }
        const [action, payload] = body.split('\n')

        t.deepEqual(JSON.parse(action), { index: { _index: 'test', _id: count } })
        t.deepEqual(JSON.parse(payload), dataset[count++])

        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({
          took: 0,
          errors: false,
          items: []
        }))
      }

      buildServer(handler, async (port, server) => {
        const dataset = createReadStream(join(__dirname, '..', 'fixtures', 'small-dataset.ndjson'), 'utf8')
        const client = new Client({ node: `http://localhost:${port}` })
        const { bulk } = helper({ client })
        const b = bulk({
          datasource: dataset.pipe(split()),
          bulkSize: 1
        })

        t.teardown(server.stop)

        b.onDrop(doc => {
          t.fail('This should never be called')
        })

        let id = 0
        const result = await b.index({ _index: 'test' }, doc => ({ _id: id++ }))
        t.type(result.time, 'number')
        t.match(result, {
          total: 3,
          successful: 3,
          failed: 0,
          aborted: false
        })
      })
    })

    t.end()
  })

  t.end()
})

test('bulk create', t => {
  t.test('Should perform a bulk request', t => {
    t.plan(14)

    let count = 0
    async function handler (req, res) {
      t.strictEqual(req.url, '/_bulk')
      t.match(req.headers, { 'content-type': 'application/x-ndjson' })

      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) {
        body += chunk
      }
      const [action, payload] = body.split('\n')

      t.deepEqual(JSON.parse(action), { create: { _index: 'test', _id: count } })
      t.deepEqual(JSON.parse(payload), dataset[count++])

      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({
        took: 0,
        errors: false,
        items: []
      }))
    }

    buildServer(handler, async (port, server) => {
      const client = new Client({ node: `http://localhost:${port}` })
      const { bulk } = helper({ client })
      const b = bulk({
        datasource: dataset.slice(),
        bulkSize: 1
      })

      t.teardown(server.stop)

      b.onDrop(doc => {
        t.fail('This should never be called')
      })

      let id = 0
      const result = await b.create({ _index: 'test' }, doc => {
        return { _id: id++ }
      })
      t.type(result.time, 'number')
      t.match(result, {
        total: 3,
        successful: 3,
        failed: 0,
        aborted: false
      })
    })
  })
  t.end()
})

test('bulk update', t => {
  t.test('Should perform a bulk request', t => {
    t.plan(14)

    let count = 0
    async function handler (req, res) {
      t.strictEqual(req.url, '/_bulk')
      t.match(req.headers, { 'content-type': 'application/x-ndjson' })

      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) {
        body += chunk
      }
      const [action, payload] = body.split('\n')

      t.deepEqual(JSON.parse(action), { update: { _index: 'test', _id: count } })
      t.deepEqual(JSON.parse(payload), { doc: dataset[count++], doc_as_upsert: true })

      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({
        took: 0,
        errors: false,
        items: []
      }))
    }

    buildServer(handler, async (port, server) => {
      const client = new Client({ node: `http://localhost:${port}` })
      const { bulk } = helper({ client })
      const b = bulk({
        datasource: dataset.slice(),
        bulkSize: 1
      })

      t.teardown(server.stop)

      b.onDrop(doc => {
        t.fail('This should never be called')
      })

      let id = 0
      const result = await b.update({ _index: 'test' }, doc => {
        return [{ _id: id++ }, { doc_as_upsert: true }]
      })
      t.type(result.time, 'number')
      t.match(result, {
        total: 3,
        successful: 3,
        failed: 0,
        aborted: false
      })
    })
  })
  t.end()
})

test('bulk delete', t => {
  t.test('Should perform a bulk request', t => {
    t.plan(11)

    let count = 0
    async function handler (req, res) {
      t.strictEqual(req.url, '/_bulk')
      t.match(req.headers, { 'content-type': 'application/x-ndjson' })

      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) {
        body += chunk
      }

      t.deepEqual(JSON.parse(body), { delete: { _index: 'test', _id: count++ } })

      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({
        took: 0,
        errors: false,
        items: []
      }))
    }

    buildServer(handler, async (port, server) => {
      const client = new Client({ node: `http://localhost:${port}` })
      const { bulk } = helper({ client })
      const b = bulk({
        datasource: dataset.slice(),
        bulkSize: 1
      })

      t.teardown(server.stop)

      b.onDrop(doc => {
        t.fail('This should never be called')
      })

      let id = 0
      const result = await b.delete({ _index: 'test' }, doc => {
        return { _id: id++ }
      })
      t.type(result.time, 'number')
      t.match(result, {
        total: 3,
        successful: 3,
        failed: 0,
        aborted: false
      })
    })
  })

  t.test('Should perform a bulk request (failure)', t => {
    t.plan(9)

    async function handler (req, res) {
      t.strictEqual(req.url, '/_bulk')
      t.match(req.headers, { 'content-type': 'application/x-ndjson' })

      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) {
        body += chunk
      }

      res.setHeader('content-type', 'application/json')

      if (JSON.parse(body).delete._id === 1) {
        res.end(JSON.stringify({
          took: 0,
          errors: true,
          items: [{
            index: {
              status: 400,
              error: { something: 'went wrong' }
            }
          }]
        }))
      } else {
        res.end(JSON.stringify({
          took: 0,
          errors: false,
          items: []
        }))
      }
    }

    buildServer(handler, async (port, server) => {
      const client = new Client({ node: `http://localhost:${port}` })
      const { bulk } = helper({ client })
      const b = bulk({
        datasource: dataset.slice(),
        bulkSize: 1,
        wait: 10
      })

      t.teardown(server.stop)

      b.onDrop(doc => {
        t.deepEqual(doc, {
          status: 400,
          error: { something: 'went wrong' },
          operation: { delete: { _index: 'test', _id: 1 } },
          document: null,
          retried: false
        })
      })

      let id = 0
      const result = await b.delete({ _index: 'test' }, doc => {
        return { _id: id++ }
      })
      t.type(result.time, 'number')
      t.match(result, {
        total: 3,
        successful: 2,
        failed: 1,
        aborted: false
      })
    })
  })

  t.end()
})
