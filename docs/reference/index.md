# Elasticsearch DSL for JavaScript/TypeScript

Fluent, type-safe DSL libraries for building Elasticsearch queries in JavaScript and TypeScript.

## Packages

| Package | Description |
|---------|-------------|
| [@elastic/elasticsearch-esql-dsl](https://www.npmjs.com/package/@elastic/elasticsearch-esql-dsl) | ES\|QL query builder |
| [@elastic/elasticsearch-query-builder](https://www.npmjs.com/package/@elastic/elasticsearch-query-builder) | Shared query builder utilities |
| [@elastic/elasticsearch-search-dsl](https://www.npmjs.com/package/@elastic/elasticsearch-search-dsl) | Search DSL (coming soon) |

## Getting started

Install the package you need:

```bash
npm install @elastic/elasticsearch-esql-dsl
```

Then build and execute queries:


```typescript
import { Client } from '@elastic/elasticsearch'
import { ESQL, E } from '@elastic/elasticsearch-esql-dsl'

const client = new Client({ node: 'http://localhost:9200' })

const query = ESQL.from('employees')
  .where(E('still_hired').eq(true))
  .sort(E('last_name').asc())
  .limit(10)

const response = await client.esql.query({ query: query.render() })
```


## Guides

- [ES|QL query builder](esql-query-builder.md) — Build ES|QL queries using JavaScript/TypeScript syntax
