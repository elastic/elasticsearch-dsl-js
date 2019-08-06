import { Client } from '@elastic/elasticsearch'
import { Q } from '../lib'

async function run () {
  const client = new Client({ node: 'http://localhost:9200' })

  // the result must be fixes done by delvedor
  let query = Q.bool(
    Q.must(Q.match('description', 'fix')),
    Q.filter(Q.term('author.name', 'delvedor'))
  )

  // Based on a condition, we want to enrich our query
  if (Math.random() >= 0.5) {
    // the results must be fixes done by delvedor
    // on test or do files
    const should = Q.should(
      Q.term('files', 'test'),
      Q.term('files', 'docs')
    )
    query = Q.and(query, should)
  } else {
    // the results must be fixes or features done by delvedor
    const must = Q.must(
      Q.match('description', 'feature')
    )
    query = Q.or(query, must)
  }

  const { body } = await client.search({
    index: 'git',
    body: query
  })

  console.log(body.hits.hits)
}

run().catch(console.log)
