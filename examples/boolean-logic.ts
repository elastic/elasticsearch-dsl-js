import { Client } from '@elastic/elasticsearch'
import { Q } from '../lib'

async function run () {
  const client = new Client({ node: 'http://localhost:9200' })

  // define the query clauses
  const fixDescription = Q.must(Q.match('description', 'fix'))
  const files = Q.should(Q.term('files', 'test'), Q.term('files', 'docs'))
  const author = Q.filter(Q.term('author.name', 'delvedor'))
  const { body } = await client.search({
    index: 'git',
    // use the boolean utilities to craft the final query
    body: Q.and(fixDescription, files, author)
  })

  console.log(body.hits.hits)
}

run().catch(console.log)
