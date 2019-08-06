import { Client } from '@elastic/elasticsearch'
import { Q, A } from '../lib'

async function run () {
  const client = new Client({ node: 'http://localhost:9200' })

  // get the day where the most commits were made
  const { body } = await client.search({
    index: 'git',
    body: Q(
      Q.size(0),
      // 'day_most_commits' is the name of the aggregation
      A(A.day_most_commits.dateHistogram({
        field: 'committed_date',
        interval: 'day',
        min_doc_count: 1,
        order: { _count: 'desc' }
      }))
    )
  })

  console.log(body.aggregations)
}

run().catch(console.log)
