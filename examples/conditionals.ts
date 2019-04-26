import { Client } from '@elastic/elasticsearch'
import { Q } from '../lib'

async function run () {
  const client = new Client({ node: 'http://localhost:9200' })

  // you can handle conditionals parts of the query inline
  // by using the 'and' operator
  const query = Q.bool(
    Q.must(Q.match('description', 'fix')),
    Q.filter(
      // the term query will be present
      // only if 'condition()' returns 'true'
      condition() && Q.term('author.name', 'delvedor')
    )
  )

  const { body } = await client.search({
    index: 'git',
    body: query
  })

  console.log(body.hits.hits)
}

run().catch(console.log)

function condition (): boolean {
  return Math.random() >= 0.6
}
