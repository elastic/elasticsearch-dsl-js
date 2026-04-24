# AGENTS.md

Development patterns, common pitfalls, and debugging guidance for AI coding agents working on this repository.

## Project Structure

- Monorepo using pnpm workspaces
- `packages/esql-dsl/` - the main `@elastic/elasticsearch-esql-dsl` package
- `packages/query-builder/` - shared `@elastic/elasticsearch-query-builder` utilities
- `scripts/integration-test.ts` - integration tests against a live Elasticsearch instance
- Unit tests live alongside source in `packages/esql-dsl/test/`

## Identifier vs Source Name Escaping

ES|QL has two different escaping rules. Using the wrong one is a common bug source.

- **`formatIdentifier(name)`** - for field/column names. Backtick-escapes names with special characters (hyphens, dots, etc.).
- **`formatSourceName(name)`** - for index/source names in `FROM`/`TS`. More permissive: hyphens, dots, wildcards, and date math are all valid unquoted.

```typescript
// BAD: FROM `my-index` - Elasticsearch rejects backtick-escaped index names
formatIdentifier('my-index') // produces `my-index`

// GOOD: FROM my-index
formatSourceName('my-index') // produces my-index
```

`FromCommand` and `TsCommand` must use `formatSourceName`. All other commands (EVAL, STATS, SORT, etc.) use `formatIdentifier` for column references.

## Function Helpers: `fn` vs `fnLiteral`

Functions in `packages/esql-dsl/src/functions.ts` use two helper factories:

- **`fn('FUNC_NAME')`** - arguments are treated as field references (identifiers)
- **`fnLiteral('FUNC_NAME')`** - arguments are treated as literal string values

```typescript
// f.concat uses fnLiteral, so string args become string literals
f.concat('name', ' - ')  // produces CONCAT("name", " - ")

// To reference a field in a fnLiteral function, wrap it with E()
f.concat(E('name'), ' - ', E('department'))  // produces CONCAT(name, " - ", department)
```

Functions using `fnLiteral` include: `concat`, `replace`, `startsWith`, `endsWith`, `left`, `right`, `repeat`, `dateFormat`, `dateParse`.

## ES|QL Reserved Words

ES|QL reserves certain words as keywords. Avoid using them as output column names in `eval()` or `stats()`:

- `first`, `last`, `like`, `in`, `is`, `not`, `and`, `or`, `null`, `true`, `false`, `info`, `functions`, `metadata`

```typescript
// BAD: "first" is a reserved keyword, causes parsing error
.eval({ first: f.mvFirst('tags') })

// GOOD: use a non-reserved name
.eval({ first_tag: f.mvFirst('tags') })
```

## SHOW Command - Only `INFO` Is Supported

`SHOW FUNCTIONS` was removed from Elasticsearch (no longer works as of ES 8.x/9.x). Only `SHOW INFO` is valid:

```typescript
// BAD: removed, causes parsing_exception
ESQL.show('FUNCTIONS')

// GOOD
ESQL.show('INFO')
```

## ES|QL REPLACE Uses Regex (Replaces All Matches)

ES|QL's `REPLACE` function takes a regex pattern, not a plain string. It replaces **all** occurrences, not just the first:

```
"foo bar foo" with REPLACE(s, "foo", "baz") produces "baz bar baz" (not "baz bar foo")
```

## Integration Testing

Run integration tests against a local Elasticsearch (use [start-local](https://github.com/elastic/start-local)):

```bash
ELASTICSEARCH_PASSWORD=<password> npx tsx scripts/integration-test.ts
# or
ELASTICSEARCH_API_KEY=<key> npx tsx scripts/integration-test.ts
```

Credentials must be provided via environment variables. Never hardcode them in source.

## Immutability

All query methods return new objects. The original query is never mutated:

```typescript
const base = ESQL.from('idx')
const q1 = base.where(E('x').gt(1))
const q2 = base.limit(10)
// base, q1, and q2 are all independent queries
```

## Version Compatibility

Newer ES|QL commands require minimum Elasticsearch versions. These are documented with `@since` JSDoc annotations in `query.ts` and `esql.ts`. Key version requirements:

| Command | DSL Method | Min ES Version |
|---------|-----------|----------------|
| `FROM`, `SHOW`, `ROW` | `ESQL.from()`, `ESQL.show()`, `ESQL.row()` | 8.11 |
| `TS` | `ESQL.ts()` | 8.15 |
| `INLINESTATS` | `.inlineStats()` | 8.16 |
| `LOOKUP JOIN` | `.lookupJoin()` | 8.18 |
| `CHANGE_POINT` | `.changePoint()` | 8.18 |
| `FORK` | `.fork()` | 9.0 |
| `SAMPLE` | `.sample()` | 9.1 |
| `COMPLETION` | `.completion()` | 9.1 |
| `RERANK` | `.rerank()` | 9.1 |
| `FUSE` | `.fuse()` | 9.1 |

## Releasing

- Version is tracked in three places that must stay in sync:
  1. `packages/esql-dsl/package.json` (`version` field)
  2. `packages/esql-dsl/src/index.ts` (`VERSION` constant)
  3. `packages/esql-dsl/test/index.test.ts` (assertion on `VERSION`)
- The publish GitHub Actions workflow creates a GitHub Release and publishes to npm
- Uses OIDC trusted publishing (no npm token needed for public repos)

## Catalog-Info / GitHub Repo Description

The repo description on GitHub is managed by Backstage via the central `elastic/catalog-info` repo. To persist the description:

- Set `description` in **both** `metadata` and `implementation.metadata` in `resources/github/engineering/search/elasticsearch-dsl-js.yaml` in the `catalog-info` repo
- Also set `description` in this repo's own `catalog-info.yaml`
- Without these, the Backstage hourly sync job will clear the GitHub description
