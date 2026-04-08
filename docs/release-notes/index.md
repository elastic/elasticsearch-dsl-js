---
navigation_title: "Elasticsearch JavaScript/TypeScript DSL"
---

# Elasticsearch JavaScript/TypeScript DSL release notes [elasticsearch-dsl-js-release-notes]

Review the changes, fixes, and more in each version of the Elasticsearch JavaScript/TypeScript DSL.

To check for security updates, go to [Security announcements for the Elastic stack](https://discuss.elastic.co/c/announcements/security-announcements/31).

% Release notes include only features, enhancements, and fixes. Add breaking changes, deprecations, and known issues to the applicable release notes sections.

% ## version.next [elasticsearch-dsl-js-next-release-notes]

% ### Features and enhancements [elasticsearch-dsl-js-next-features-enhancements]
% \*

% ### Fixes [elasticsearch-dsl-js-next-fixes]
% \*

## 1.0.0 [elasticsearch-dsl-js-1.0.0-release-notes]

### Features and enhancements [elasticsearch-dsl-js-1.0.0-features-enhancements]

- **Fluent, chainable ES|QL query building:** Construct queries using source commands (`FROM`, `ROW`, `SHOW`, `TS`) and processing commands (`WHERE`, `EVAL`, `STATS`, `SORT`, `LIMIT`, `KEEP`, `DROP`, `RENAME`, `ENRICH`, `DISSECT`, `GROK`, `MV_EXPAND`, `LOOKUP JOIN`, `FORK`, `SAMPLE`, `COMPLETION`, `RERANK`, and more) with a natural method-chaining API.
- **Expression builder:** Build ES|QL expressions with `E()` for field references with operator overloading (`eq`, `gt`, `lt`, `in`, `like`, `rlike`), POJO `where()` syntax with `Op` symbols, and the `esql` template tag for safe string interpolation.
- **Full ES|QL function coverage:** Access all ES|QL functions through the `f` namespace, including aggregation, string, date, math, conditional, search, multivalue, geo/spatial, conversion, IP, grouping, time series, hash, and vector functions.
- **Automatic value escaping and injection prevention:** All user-supplied values are automatically escaped, preventing ES|QL injection attacks. The `esql` template tag and expression builder handle quoting and escaping transparently.
- **Runtime argument validation:** All public methods and constructors validate their inputs at runtime, providing immediate, clear error messages for invalid arguments.
- **JSDoc coverage:** Every exported class, function, and method includes JSDoc documentation for IDE autocomplete and inline help.
- **Optional Elasticsearch client integration:** When `@elastic/elasticsearch` is installed as a peer dependency, queries can be executed directly with `query.execute(client)`.
