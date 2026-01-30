# Elasticsearch DSL for JavaScript/TypeScript

[![CI](https://github.com/elastic/elasticsearch-dsl-js/actions/workflows/ci.yml/badge.svg)](https://github.com/elastic/elasticsearch-dsl-js/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@elastic/elasticsearch-dsl)](https://www.npmjs.com/package/@elastic/elasticsearch-dsl)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A fluent, type-safe query builder for Elasticsearch in JavaScript and TypeScript.

## Installation

```bash
npm install @elastic/elasticsearch-dsl
```

## Quick Start

```typescript
import { Query, Search } from '@elastic/elasticsearch-dsl'
import { Client } from '@elastic/elasticsearch'

// Create a search query
const search = new Search()
  .query(
    Query.bool({
      must: [Query.match('title', 'elasticsearch')],
      filter: [Query.range('date', { gte: '2024-01-01' })],
    })
  )
  .size(10)
  .sort('date', 'desc')

// Use with the Elasticsearch client
const client = new Client({ node: 'http://localhost:9200' })
const response = await client.search({
  index: 'my-index',
  body: search.toJSON(),
})
```

## Features

- **Type-safe**: Full TypeScript support with autocompletion
- **Fluent API**: Chainable methods for building queries
- **Lightweight**: Zero runtime dependencies
- **Compatible**: Works with `@elastic/elasticsearch` client

## Query Types

### Match Query

```typescript
Query.match('title', 'elasticsearch')
Query.match('title', 'elasticsearch', { operator: 'and', fuzziness: 'AUTO' })
```

### Term Query

```typescript
Query.term('status', 'published')
Query.terms('status', ['published', 'draft'])
```

### Range Query

```typescript
Query.range('date', { gte: '2024-01-01', lte: '2024-12-31' })
Query.range('price', { gte: 10, lt: 100 })
```

### Bool Query

```typescript
Query.bool({
  must: [Query.match('title', 'elasticsearch')],
  should: [Query.term('featured', true)],
  must_not: [Query.term('status', 'deleted')],
  filter: [Query.range('date', { gte: '2024-01-01' })],
})
```

### Other Queries

```typescript
Query.matchAll()
Query.matchPhrase('description', 'quick brown fox')
Query.exists('email')
Query.prefix('title', 'elast')
Query.wildcard('title', 'elast*')
```

## Search Builder

```typescript
const search = new Search()
  .query(Query.match('title', 'elasticsearch'))
  .size(10)
  .from(0)
  .sort('date', 'desc')
  .source(['title', 'date'])
  .highlight({ title: {}, body: { fragment_size: 150 } })

console.log(search.toJSON())
```

## Node.js Version Support

| Node.js Version | Supported |
| --------------- | --------- |
| 20.x            | ✅        |
| 22.x            | ✅        |
| 24.x            | ✅        |

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

[Apache 2.0](LICENSE) © Elasticsearch B.V.
