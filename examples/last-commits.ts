import { Client } from '@elastic/elasticsearch'
import { Q } from '../lib'

async function run () {
  const client = new Client({ node: 'http://localhost:9200' })

  // last 10 commits for 'elasticsearch-js' repo
  const { body } = await client.search({
    index: 'git',
    body: Q(
      Q.bool(
        Q.must(Q.term('repository', 'elasticsearch-js'))
      ),
      Q.sort('committed_date', { order: 'desc' }),
      Q.size(10)
    )
  })

  console.log(body.hits.hits)
}

run().catch(console.log)
