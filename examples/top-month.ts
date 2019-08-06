import { Client } from '@elastic/elasticsearch'
import { Q, A } from '../lib'

async function run () {
  const client = new Client({ node: 'http://localhost:9200' })

  const committers = A.committers.terms(
    { field: 'committer.name.keyword' },
    A.insertions.sum({ field: 'stat.insertions' })
  )
  const topCommittersPerMonth = A.top_committer_per_month.maxBucket(
    { bucket_path: 'committers>insertions' }
  )
  const commitsPerMonth = A.commits_per_month.dateHistogram(
    {
      field: 'committed_date',
      interval: 'day',
      min_doc_count: 1,
      order: { _count: 'desc' }
    },
    // nested aggregations
    committers,
    topCommittersPerMonth
  )
  const topCommittersPerMonthGlobal = A.top_committer_per_month.maxBucket(
    { bucket_path: 'commits_per_month>top_committer_per_month' }
  )

  const { body: topMonths } = await client.search({
    index: 'git',
    body: Q(
      // we want to know the top month for 'delvedor'
      Q.bool(Q.filter(Q.term('author', 'delvedor'))),
      Q.size(0),
      A(commitsPerMonth, topCommittersPerMonthGlobal)
    )
  })

  console.log(topMonths)
}

run().catch(console.log)
