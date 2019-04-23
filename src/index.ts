'use strict'

import Q from './query-helpers'
import A from './aggregation-helpers'

function DSL (opts) {
  const { client, includeMeta } = opts

  return {
    search,
    scrollSearch
  }

  async function search (params, options, query) {
    if (query === undefined) {
      query = options
      options = {}
    }

    // use filter_path for speed up deserialization
    const { body } = await client.search(
      { ...params, body: query },
      options
    )

    if (includeMeta === true) {
      return body
    }

    if (body.aggregations !== undefined) {
      return {
        hits: body.hits.hits.map(d => d._source),
        aggregations: body.aggregations
      }
    }
    return body.hits.hits.map(d => d._source)
  }

  async function * scrollSearch (params, options) {
    let response = await client.search(params, options)

    while (true) {
      const sourceHits = response.body.hits.hits

      if (sourceHits.length === 0) {
        break
      }

      for (const hit of sourceHits) {
        yield hit._source
      }

      if (!response.body._scroll_id) {
        break
      }

      response = await client.scroll({
        scrollId: response.body._scroll_id,
        scroll: params.scroll
      })
    }
  }
}

export { A, Q, DSL }
