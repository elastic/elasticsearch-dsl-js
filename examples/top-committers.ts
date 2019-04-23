import { Client } from '@elastic/elasticsearch'
import { Q, A } from '../lib'

async function run () {
  const client = new Client({ node: 'http://localhost:9200' })

  // top committers aggregation
  // 'committers' is the name of the aggregation
  const committersAgg = A.committers.terms(
    { field: 'committer.name.keyword' },
    // you can nest multiple aggregations by
    // passing them to the aggregation constructor
    // 'line_stats' is the name of the aggregation
    A.line_stats.stats({ field: 'stat.insertions' })
  )
  const { body } = await client.search({
    index: 'git',
    body: Q(
      Q.size(0),
      A(committersAgg)
    )
  })

  console.log(body.aggregations)
}

run().catch(console.log)
