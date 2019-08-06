import { Client } from '@elastic/elasticsearch'
import { Q, A } from '../lib'

async function run () {
  const client = new Client({ node: 'http://localhost:9200' })

  // 'committers' is the name of the aggregation
  let committersAgg = A.committers.terms('committer.name.keyword')
  // instead of pass other aggregations as parameter
  // to the parent aggregation, you can conditionally add them
  if (Math.random() >= 0.5) {
    committersAgg = A.committers.aggs(
      committersAgg, A.line_stats.stats('stat.insertions')
    )
  }

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
