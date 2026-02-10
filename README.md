# Elasticsearch DSL Libraries for JavaScript/TypeScript

[![CI](https://github.com/elastic/elasticsearch-dsl-js/actions/workflows/ci.yml/badge.svg)](https://github.com/elastic/elasticsearch-dsl-js/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A collection of fluent, type-safe DSL libraries for Elasticsearch in JavaScript and TypeScript.

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| [@elastic/elasticsearch-query-builder](./packages/query-builder) | Query builder for Elasticsearch | [![npm](https://img.shields.io/npm/v/@elastic/elasticsearch-query-builder)](https://www.npmjs.com/package/@elastic/elasticsearch-query-builder) |
| [@elastic/elasticsearch-esql-dsl](./packages/esql-dsl) | ES\|QL DSL for Elasticsearch | [![npm](https://img.shields.io/npm/v/@elastic/elasticsearch-esql-dsl)](https://www.npmjs.com/package/@elastic/elasticsearch-esql-dsl) |
| [@elastic/elasticsearch-search-dsl](./packages/search-dsl) | Search DSL for Elasticsearch | [![npm](https://img.shields.io/npm/v/@elastic/elasticsearch-search-dsl)](https://www.npmjs.com/package/@elastic/elasticsearch-search-dsl) |

## Installation

Install individual packages as needed:

```bash
# Query Builder
npm install @elastic/elasticsearch-query-builder

# ES|QL DSL
npm install @elastic/elasticsearch-esql-dsl

# Search DSL
npm install @elastic/elasticsearch-search-dsl
```

## Development

### Prerequisites

- Node.js 20 or later
- pnpm 9 or later

### Getting Started

```bash
# Clone the repository
git clone https://github.com/elastic/elasticsearch-dsl-js.git
cd elasticsearch-dsl-js

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Run linting
pnpm run lint
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run build` | Build all packages |
| `pnpm run test` | Run tests for all packages |
| `pnpm run test:watch` | Run tests in watch mode |
| `pnpm run test:coverage` | Run tests with coverage |
| `pnpm run lint` | Lint all packages |
| `pnpm run lint:fix` | Fix linting errors |
| `pnpm run typecheck` | TypeScript type checking |
| `pnpm run ci` | Run full CI pipeline |
| `pnpm run clean` | Clean all build artifacts |

### Working with Individual Packages

```bash
# Build a specific package
pnpm --filter @elastic/elasticsearch-query-builder build

# Test a specific package
pnpm --filter @elastic/elasticsearch-esql-dsl test

# Run tests in watch mode for a package
pnpm --filter @elastic/elasticsearch-search-dsl test:watch
```

## Node.js Version Support

| Node.js Version | Supported |
|-----------------|-----------|
| 20.x            | ✅        |
| 22.x            | ✅        |
| 24.x            | ✅        |
| 25.x            | ✅        |

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

[Apache 2.0](LICENSE) © Elasticsearch B.V.
