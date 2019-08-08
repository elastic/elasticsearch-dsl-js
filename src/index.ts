'use strict'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

type bulkIndexCallback = (document: any) => any
type bulkUpdateCallback = (document: any) => any[]
type onDropCallback = (document: any) => void

const bulkIndexNoop: bulkIndexCallback = (doc) => ({})
const bulkUpdateNoop: bulkUpdateCallback = (doc) => ([{}, {}])
const onDropNoop: onDropCallback = (doc) => {}

interface ElasticityOptions {
  client: any
}

function helper (opts: ElasticityOptions) {
  const { client } = opts

  return {
    search,
    scrollSearch,
    scrollDocuments,
    bulk
  }

  function getHits (body: any): any[] {
    if (body.hits && body.hits.hits) {
      return body.hits.hits.map(d => d._source)
    }
    return []
  }

  async function search (params: any, options?: any) {
    const response = await client.search(params, options)
    response.documents = getHits(response.body)
    return response
  }

  // TODO: study scroll search slices
  async function * scrollSearch (params: any, options?: any) {
    let response = await client.search(params, options)
    let scrollId = response.body._scroll_id

    while (response.body.hits.hits.length > 0) {
      scrollId = response.body._scroll_id
      response.clear = clear
      response.documents = getHits(response.body)

      yield response

      if (!scrollId) {
        break
      }

      response = await client.scroll({
        body: {
          scroll_id: scrollId,
          scroll: params.scroll
        }
      })
    }

    async function clear () {
      await client.clearScroll(
        { body: { scroll_id: scrollId } },
        { ignore: [400] }
      )
    }
  }

  async function * scrollDocuments (params: any, options?: any) {
    for await (const { documents } of scrollSearch(params)) {
      for (const document of documents) {
        yield document
      }
    }
  }

  function bulk (opts) {
    const datasource = opts.datasource
    const bulkSize = opts.bulkSize || 1000
    const retries = opts.retries || 2
    const wait = opts.wait || 5000
    // concurrent = 1
    let onDropFn = onDropNoop
    let shouldAbort = false

    const stats = {
      total: 0,
      failed: 0,
      successful: 0,
      time: 0,
      aborted: false
    }

    return {
      onDrop,
      index,
      create,
      update,
      abort,
      delete: _delete
    }

    function abort () {
      shouldAbort = true
      stats.aborted = true
      return this
    }

    function onDrop (fn) {
      onDropFn = fn
      return this
    }

    async function index (indexName: string, fn = bulkIndexNoop) {
      const bulkBody: any[] = []
      const startTime = Date.now()

      for await (const chunk of datasource) {
        if (shouldAbort) break
        const action = fn(chunk)
        bulkBody.push({ index: { _index: indexName, ...action } })
        bulkBody.push(chunk)
        stats.total++

        if (bulkBody.length === bulkSize * 2) {
          await bulkOperation(bulkBody)
          bulkBody.length = 0
        }
      }

      stats.time = Date.now() - startTime
      stats.successful = stats.total - stats.failed

      return stats
    }

    async function create (indexName: string, fn = bulkIndexNoop) {
      const bulkBody: any[] = []
      const startTime = Date.now()

      for await (const chunk of datasource) {
        if (shouldAbort) break
        const action = fn(chunk)
        bulkBody.push({ create: { _index: indexName, ...action } })
        bulkBody.push(chunk)
        stats.total++

        if (bulkBody.length === bulkSize * 2) {
          await bulkOperation(bulkBody)
          bulkBody.length = 0
        }
      }

      stats.time = Date.now() - startTime
      stats.successful = stats.total - stats.failed

      return stats
    }

    async function update (indexName: string, fn = bulkUpdateNoop) {
      const bulkBody: any[] = []
      const startTime = Date.now()

      for await (const chunk of datasource) {
        if (shouldAbort) break
        const [action, payload] = fn(chunk)
        bulkBody.push({ update: { _index: indexName, ...action } })
        bulkBody.push({ doc: chunk, ...payload })
        stats.total++

        if (bulkBody.length === bulkSize * 2) {
          await bulkOperation(bulkBody)
          bulkBody.length = 0
        }
      }

      stats.time = Date.now() - startTime
      stats.successful = stats.total - stats.failed

      return stats
    }

    async function _delete (indexName: string, fn = bulkIndexNoop) {
      const bulkBody: any[] = []
      const startTime = Date.now()

      for await (const chunk of datasource) {
        if (shouldAbort) break
        const action = fn(chunk)
        bulkBody.push({ delete: { _index: indexName, ...action } })
        stats.total++

        if (bulkBody.length === bulkSize) {
          await bulkOperation(bulkBody)
          bulkBody.length = 0
        }
      }

      stats.time = Date.now() - startTime
      stats.successful = stats.total - stats.failed

      return stats
    }

    async function bulkOperation (bulkBody: any[]) {
      const retry: any[] = []
      let retrySlice = retries
      let isRetrying = false

      await tryBulk(bulkBody)

      // TODO: are we ok with this retry method?
      while (retrySlice-- > 0) {
        if (retry.length === 0 || shouldAbort) break
        isRetrying = true
        const retryCopy = retry.slice()
        retry.length = 0
        await sleep(wait)
        await tryBulk(retryCopy)
      }

      if (retry.length > 0) {
        for (let i = 0, len = retry.length; i < len; i = i + 2) {
          const operation = Object.keys(retry[i])[0]
          onDropFn({
            status: 429,
            error: null,
            operation: retry[i],
            document: operation !== 'delete'
              ? bulkBody[i + 1]
              : null,
            retried: isRetrying
          })
          stats.failed++
        }
      }

      async function tryBulk (bulkBody) {
        const { body } = await client.bulk({ body: bulkBody })
        if (body.errors === false) return

        const { items } = body
        for (let i = 0, len = items.length; i < len; i++) {
          const action = items[i]
          const operation = Object.keys(action)[0]
          const { status } = action[operation]
          const indexSlice = operation !== 'delete' ? i * 2 : i

          if (status >= 400) {
            if (status === 429) {
              retry.push(bulkBody[indexSlice])
              if (operation !== 'delete') {
                retry.push(bulkBody[indexSlice + 1])
              }
            } else {
              onDropFn({
                status: status,
                error: action[operation].error,
                operation: bulkBody[indexSlice],
                document: operation !== 'delete'
                  ? bulkBody[indexSlice + 1]
                  : null,
                retried: isRetrying
              })
              stats.failed++
            }
          }
        }
      }
    }
  }
}

export { helper }
