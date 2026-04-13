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


## Elasticsearch version compatibility

The DSL generates ES|QL query strings and does not depend on any specific Elasticsearch version at runtime. However, individual ES|QL commands were introduced in different Elasticsearch versions. The table below shows the minimum Elasticsearch version required for each command.

Core commands available since ES|QL GA (Elasticsearch 8.11+):

| Command | Method |
|---------|--------|
| `FROM` | `ESQL.from()` |
| `ROW` | `ESQL.row()` |
| `SHOW INFO` | `ESQL.show('INFO')` |
| `WHERE` | `.where()` |
| `EVAL` | `.eval()` |
| `STATS ... BY` | `.stats().by()` |
| `SORT` | `.sort()` |
| `LIMIT` | `.limit()` |
| `KEEP` | `.keep()` |
| `DROP` | `.drop()` |
| `RENAME` | `.rename()` |
| `ENRICH` | `.enrich()` |
| `DISSECT` | `.dissect()` |
| `GROK` | `.grok()` |
| `MV_EXPAND` | `.mvExpand()` |

Commands introduced in later versions:

| Command | Method | Minimum ES version |
|---------|--------|--------------------|
| `TS` | `ESQL.ts()` | 8.15 |
| `INLINESTATS` | `.inlineStats()` | 8.16 |
| `CHANGE_POINT` | `.changePoint()` | 8.18 |
| `LOOKUP JOIN` | `.lookupJoin()` | 8.18 |
| `FORK` | `.fork()` | 9.0 |
| `SAMPLE` | `.sample()` | 9.1 |
| `COMPLETION` | `.completion()` | 9.1 |
| `RERANK` | `.rerank()` | 9.1 |
| `FUSE` | `.fuse()` | 9.1 |

:::{note}
This DSL was integration-tested against Elasticsearch 9.3.3. Commands marked with a minimum version were verified against the [ES|QL command reference](https://www.elastic.co/docs/reference/query-languages/esql/esql-commands). If a command is not supported by your Elasticsearch version, the server will return a `parsing_exception`.
:::

## Guides

- [ES|QL query builder](esql-query-builder.md) — Build ES|QL queries using JavaScript/TypeScript syntax
