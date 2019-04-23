import { Client } from '@elastic/elasticsearch'
import { Q } from '../lib'

async function run () {
  const client = new Client({ node: 'http://localhost:9200' })

  // search commits that contains 'fix' but do not changes test files
  const { body } = await client.search({
    index: 'git',
    body: Q.bool(
      Q.must(Q.match('description', 'fix')),
      Q.mustNot(Q.terms('files', 'test'))
    )
  })

  console.log(body.hits.hits)
}

run().catch(console.log)
