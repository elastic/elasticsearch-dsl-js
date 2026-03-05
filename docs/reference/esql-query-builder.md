# ES|QL query builder

> **Warning:** This functionality is in technical preview and may be changed or removed in a future release. Elastic will work to fix any issues, but features in technical preview are not subject to the support SLA of official GA features.

The ES|QL query builder allows you to construct ES|QL queries using JavaScript/TypeScript syntax. Consider the following example:

```typescript
import { ESQL, E } from '@elastic/elasticsearch-esql-dsl'

const query = ESQL.from('employees')
  .sort(E('emp_no'))
  .keep('first_name', 'last_name', 'height')
  .eval({
    height_feet: E('height').mul(3.281),
    height_cm: E('height').mul(100),
  })
  .limit(3)
```

You can then see the assembled ES|QL query by printing the resulting query object:

```typescript
console.log(query.render())
// FROM employees
// | SORT emp_no
// | KEEP first_name, last_name, height
// | EVAL height_feet = height * 3.281, height_cm = height * 100
// | LIMIT 3
```

To execute this query, pass it to the `client.esql.query()` endpoint:

```typescript
import { Client } from '@elastic/elasticsearch'

const client = new Client({ node: process.env.ELASTICSEARCH_URL })
const response = await client.esql.query({ query: query.render() })
```

The response body contains a `columns` attribute with the list of columns included in the results, and a `values` attribute with the list of results for the query, each given as an array of column values. Here is a possible response body returned by the example query given above:

```json
{
  "columns": [
    { "name": "first_name", "type": "text" },
    { "name": "last_name", "type": "text" },
    { "name": "height", "type": "double" },
    { "name": "height_feet", "type": "double" },
    { "name": "height_cm", "type": "double" }
  ],
  "is_partial": false,
  "took": 11,
  "values": [
    ["Adrian", "Wells", 2.424, 7.953144, 242.4],
    ["Aaron", "Gonzalez", 1.584, 5.1971, 158.4],
    ["Miranda", "Kramer", 1.55, 5.08555, 155]
  ]
}
```

You can also use the built-in helper for typed records:

```typescript
const { records } = await client.helpers
  .esql({ query: query.render() })
  .toRecords<{ first_name: string; last_name: string; height: number }>()
```

## Creating an ES|QL query

To construct an ES|QL query you start from one of the ES|QL source commands:

### `ESQL.from()`

The `FROM` command selects the indices, data streams, or aliases to be queried.

Examples:

```typescript
import { ESQL } from '@elastic/elasticsearch-esql-dsl'

// FROM employees
const q1 = ESQL.from('employees')

// FROM employees-00001, other-employees-*
const q2 = ESQL.from('employees-00001', 'other-employees-*')

// FROM cluster_one:employees-00001, cluster_two:other-employees-*
const q3 = ESQL.from('cluster_one:employees-00001', 'cluster_two:other-employees-*')

// FROM employees METADATA _id
const q4 = ESQL.from('employees').metadata('_id')

// FROM employees METADATA _id, _score
const q5 = ESQL.from('employees').metadata('_id', '_score')
```

Note how in the last examples the optional `METADATA` clause of the `FROM` command is added as a chained method.

### `ESQL.row()`

The `ROW` command produces a row with one or more columns, with the values that you specify.

Examples:

```typescript
import { ESQL, f } from '@elastic/elasticsearch-esql-dsl'

// ROW a = 1, b = "two", c = null
const q1 = ESQL.row({ a: 1, b: 'two', c: null })

// ROW a = [1, 2]
const q2 = ESQL.row({ a: [1, 2] })

// ROW a = ROUND(1.23, 0)
const q3 = ESQL.row({ a: f.round(1.23, 0) })
```

### `ESQL.show()`

The `SHOW` command returns information about the deployment and its capabilities.

Example:

```typescript
import { ESQL } from '@elastic/elasticsearch-esql-dsl'

// SHOW INFO
const q = ESQL.show('INFO')
```

### `ESQL.ts()`

The `TS` command is the source command for time-series indices.

Example:

```typescript
import { ESQL } from '@elastic/elasticsearch-esql-dsl'

// TS metrics METADATA _tsid
const q = ESQL.ts('metrics').metadata('_tsid')
```

## Adding processing commands

Once you have a query object, you can add one or more processing commands to it. The following
example shows how to create a query that uses the `WHERE` and `LIMIT` commands to filter the
results:

```typescript
import { ESQL, E } from '@elastic/elasticsearch-esql-dsl'

// FROM employees
// | WHERE still_hired == true
// | LIMIT 10
const query = ESQL.from('employees')
  .where(E('still_hired').eq(true))
  .limit(10)
```

### Immutability and branching

All queries are **immutable** — each method call returns a new query object. This means you can safely branch from a common base:

```typescript
const base = ESQL.from('employees')
  .where(E('still_hired').eq(true))

const byName = base.sort(E('last_name').asc()).limit(10)
const topEarners = base.sort(E('salary').desc()).limit(5)

// `base`, `byName`, and `topEarners` are three independent queries
```

### Available processing commands

| Method | ES\|QL Command |
|--------|----------------|
| `.where(expr)` | `WHERE` |
| `.eval(assignments)` | `EVAL` |
| `.stats(aggs).by(fields)` | `STATS ... BY` |
| `.sort(fields)` | `SORT` |
| `.limit(n)` | `LIMIT` |
| `.keep(fields)` | `KEEP` |
| `.drop(fields)` | `DROP` |
| `.rename(mapping)` | `RENAME` |
| `.mvExpand(field)` | `MV_EXPAND` |
| `.enrich(policy).on(field).with(fields)` | `ENRICH ... ON ... WITH` |
| `.dissect(field, pattern)` | `DISSECT` |
| `.grok(field, pattern)` | `GROK` |
| `.lookupJoin(index).on(field)` | `LOOKUP JOIN ... ON` |
| `.inlineStats(aggs).by(fields)` | `INLINESTATS ... BY` |
| `.changePoint(field).on(key).as_(t, p)` | `CHANGE_POINT ... ON ... AS` |
| `.sample(ratio)` | `SAMPLE` |
| `.fork(branches)` | `FORK` |
| `.fuse(method)` | `FUSE` |
| `.completion(prompt).with(opts)` | `COMPLETION ... WITH` |
| `.rerank(query).on(fields).with(opts)` | `RERANK ... ON ... WITH` |

## Creating ES|QL expressions and conditions

The ES|QL query builder for JavaScript/TypeScript provides multiple ways to create expressions and conditions in ES|QL queries.

### String expressions

The simplest option is to provide all ES|QL expressions and conditionals as strings. The following example uses this approach to add two calculated columns to the results using the `EVAL` command:

```typescript
import { ESQL } from '@elastic/elasticsearch-esql-dsl'

// FROM employees
// | SORT emp_no
// | KEEP first_name, last_name, height
// | EVAL height_feet = height * 3.281, height_cm = height * 100
const query = ESQL.from('employees')
  .sort('emp_no')
  .keep('first_name', 'last_name', 'height')
  .eval('height_feet = height * 3.281', 'height_cm = height * 100')
```

### The `E()` expression builder

A more advanced alternative is to replace the strings with the `E()` helper function, which creates `InstrumentedExpression` objects that support method chaining for comparisons, arithmetic, and more. The following example is functionally equivalent to the one above:

```typescript
import { ESQL, E } from '@elastic/elasticsearch-esql-dsl'

// FROM employees
// | SORT emp_no
// | KEEP first_name, last_name, height
// | EVAL height_feet = height * 3.281, height_cm = height * 100
const query = ESQL.from('employees')
  .sort(E('emp_no'))
  .keep('first_name', 'last_name', 'height')
  .eval({
    height_feet: E('height').mul(3.281),
    height_cm: E('height').mul(100),
  })
```

Here the `E()` helper function is used as a wrapper around column names that initiates an ES|QL expression. The resulting object can be chained with comparison methods (`.eq()`, `.gt()`, `.lt()`, etc.), arithmetic methods (`.add()`, `.mul()`, etc.), and sort modifiers (`.asc()`, `.desc()`, `.nullsFirst()`, `.nullsLast()`).

Here is a second example, which uses a conditional expression in the `WHERE` command:

```typescript
import { ESQL } from '@elastic/elasticsearch-esql-dsl'

// FROM employees
// | KEEP first_name, last_name, height
// | WHERE first_name == "Larry"
const query = ESQL.from('employees')
  .keep('first_name', 'last_name', 'height')
  .where('first_name == "Larry"')
```

Using the `E()` expression builder:

```typescript
import { ESQL, E } from '@elastic/elasticsearch-esql-dsl'

// FROM employees
// | KEEP first_name, last_name, height
// | WHERE first_name == "Larry"
const query = ESQL.from('employees')
  .keep('first_name', 'last_name', 'height')
  .where(E('first_name').eq('Larry'))
```

### The `esql` template tag

For mixing literal ES|QL with dynamic values, the `esql` template tag provides safe interpolation:

```typescript
import { esql, E } from '@elastic/elasticsearch-esql-dsl'

const minSalary = 50000
const dept = 'Engineering'

// salary > 50000 AND department == "Engineering"
const condition = esql`salary > ${minSalary} AND department == ${dept}`
```

Values are automatically escaped. `InstrumentedExpression` objects pass through without escaping, so you can freely mix them:

```typescript
const expr = E('salary').gt(50000)
const condition = esql`${expr} AND department == ${dept}`
```

### POJO syntax for `where()`

For complex conditions, you can pass a plain object using `Op` symbols:

```typescript
import { ESQL, Op } from '@elastic/elasticsearch-esql-dsl'

const query = ESQL.from('employees')
  .where({
    department: 'Engineering',
    salary: { [Op.gt]: 50000 },
    [Op.or]: {
      level: { [Op.in]: ['senior', 'staff'] },
    },
  })
```

Available operators: `Op.eq`, `Op.ne`, `Op.gt`, `Op.gte`, `Op.lt`, `Op.lte`, `Op.in`, `Op.like`, `Op.rlike`, `Op.and`, `Op.or`, `Op.not`.

### Logical operators

Combine expressions with standalone functions:

```typescript
import { and_, or_, not_, E } from '@elastic/elasticsearch-esql-dsl'

const condition = and_(
  E('salary').gt(50000),
  or_(E('dept').eq('Engineering'), E('dept').eq('Sales')),
  not_(E('status').eq('inactive'))
)

const query = ESQL.from('employees').where(condition)
```

### Preventing injection attacks

ES|QL, like most query languages, is vulnerable to [code injection attacks](https://en.wikipedia.org/wiki/Code_injection) if untrusted data provided by users is added to a query. To eliminate this risk, ES|QL allows untrusted data to be given separately from the query as parameters.

Continuing with the example above, let's assume that the application needs a `findEmployeeByName()` function that searches for the name given as an argument. If this argument is received by the application from users, then it is considered untrusted and should not be added to the query directly. Here is how to code the function in a secure manner:

```typescript
function findEmployeeByName(name: string) {
  const query = ESQL.from('employees')
    .keep('first_name', 'last_name', 'height')
    .where(E('first_name').eq(E('?')))

  return client.esql.query({
    query: query.render(),
    params: [name],
  })
}
```

Here the part of the query in which the untrusted data needs to be inserted is replaced with a parameter, which in ES|QL is defined by the question mark. When using the expression builder, the parameter must be given as `E('?')` so that it is treated as an expression and not as a literal string.

The list of values given in the `params` argument to the query endpoint are assigned in order to the parameters defined in the query.

## Using ES|QL functions

The ES|QL language includes a rich set of functions that can be used in expressions and conditionals. These can be included in expressions given as strings, as shown in the example below:

```typescript
import { ESQL } from '@elastic/elasticsearch-esql-dsl'

// FROM employees
// | KEEP first_name, last_name, height
// | WHERE LENGTH(first_name) < 4
const query = ESQL.from('employees')
  .keep('first_name', 'last_name', 'height')
  .where('LENGTH(first_name) < 4')
```

All available ES|QL functions have JavaScript/TypeScript wrappers in the `f` namespace, which can be used when building expressions. Below is the example above coded using the function wrappers:

```typescript
import { ESQL, f } from '@elastic/elasticsearch-esql-dsl'

// FROM employees
// | KEEP first_name, last_name, height
// | WHERE LENGTH(first_name) < 4
const query = ESQL.from('employees')
  .keep('first_name', 'last_name', 'height')
  .where(f.length('first_name').lt(4))
```

Arguments passed to functions are assumed to be field references (identifiers). When passing literal string values, they are treated as such in the appropriate argument positions based on the function's semantics.

### Function categories

The `f` namespace includes 150+ function wrappers organized across the following categories:

#### Aggregation functions

```typescript
f.avg('salary')              // AVG(salary)
f.count()                    // COUNT(*)
f.countDistinct('dept')      // COUNT_DISTINCT(dept)
f.max('height')              // MAX(height)
f.min('height')              // MIN(height)
f.sum('hours')               // SUM(hours)
f.median('salary')           // MEDIAN(salary)
f.medianAbsoluteDeviation('salary')  // MEDIAN_ABSOLUTE_DEVIATION(salary)
f.percentile('latency', 99)  // PERCENTILE(latency, 99)
f.top('salary', 5, 'DESC')   // TOP(salary, 5, DESC)
f.values('tags')             // VALUES(tags)
f.stdDev('salary')           // STD_DEV(salary)
f.variance('salary')         // VARIANCE(salary)
f.weightedAvg('val', 'wt')   // WEIGHTED_AVG(val, wt)
f.first('ts')                // FIRST(ts)
f.last('ts')                 // LAST(ts)
```

Aggregation functions return `AggregationExpression`, which extends `InstrumentedExpression` and adds a `.where()` method for conditional aggregations:

```typescript
const query = ESQL.from('employees')
  .stats({
    eng_avg: f.avg('salary').where(E('dept').eq('Engineering')),
    total: f.count(),
  })
```

#### String functions

```typescript
f.concat('first_name', ' ', 'last_name')  // CONCAT(first_name, " ", last_name)
f.length('name')                            // LENGTH(name)
f.toUpper('name')                           // TO_UPPER(name)
f.toLower('name')                           // TO_LOWER(name)
f.substring('msg', 0, 100)                 // SUBSTRING(msg, 0, 100)
f.trim('name')                              // TRIM(name)
f.left('name', 5)                           // LEFT(name, 5)
f.right('name', 3)                          // RIGHT(name, 3)
f.replace('msg', 'old', 'new')             // REPLACE(msg, "old", "new")
f.repeat('star', 5)                         // REPEAT(star, 5)
f.startsWith('name', 'prefix')             // STARTS_WITH(name, "prefix")
f.endsWith('name', 'suffix')               // ENDS_WITH(name, "suffix")
f.contains('message', 'error')             // CONTAINS(message, "error")
f.split('tags', ',')                        // SPLIT(tags, ",")
f.reverse('name')                           // REVERSE(name)
f.locate('msg', 'error')                   // LOCATE(msg, "error")
f.space(10)                                 // SPACE(10)
f.byteLength('data')                        // BYTE_LENGTH(data)
f.bitLength('data')                         // BIT_LENGTH(data)
f.lpad('val', 10, '0')                     // LPAD(val, 10, "0")
f.rpad('val', 10, ' ')                     // RPAD(val, 10, " ")
```

#### Date functions

```typescript
f.now()                                    // NOW()
f.dateDiff('day', 'hire_date', f.now())    // DATE_DIFF("day", hire_date, NOW())
f.dateTrunc('date', '1 month')            // DATE_TRUNC(date, "1 month")
f.dateExtract('year', 'hire_date')         // DATE_EXTRACT("year", hire_date)
f.dateParse('date_str', 'yyyy-MM-dd')     // DATE_PARSE(date_str, "yyyy-MM-dd")
f.dateFormat('ts', 'yyyy-MM-dd')          // DATE_FORMAT(ts, "yyyy-MM-dd")
```

#### Math functions

```typescript
f.abs('change')       // ABS(change)
f.round('salary', -3) // ROUND(salary, -3)
f.ceil('price')       // CEIL(price)
f.floor('price')      // FLOOR(price)
f.sqrt('area')        // SQRT(area)
f.pow('base', 2)      // POW(base, 2)
f.log('value')        // LOG(value)
f.log10('value')      // LOG10(value)
f.pi()                // PI()
f.e_()                // E()
f.tau()               // TAU()
f.clamp('val', 0, 100) // CLAMP(val, 0, 100)
f.greatest('a', 'b')  // GREATEST(a, b)
f.least('a', 'b')     // LEAST(a, b)
f.signum('val')        // SIGNUM(val)
f.cbrt('val')          // CBRT(val)
f.hypot('a', 'b')     // HYPOT(a, b)
```

#### Conditional functions

```typescript
f.coalesce('nickname', 'first_name')  // COALESCE(nickname, first_name)

// CASE WHEN age < 18 THEN "minor" WHEN age < 65 THEN "adult" ELSE "senior" END
f.case_()
  .when(E('age').lt(18), 'minor')
  .when(E('age').lt(65), 'adult')
  .else_('senior')

f.greatest('a', 'b')   // GREATEST(a, b)
f.least('a', 'b')      // LEAST(a, b)
```

#### Search and full-text functions

```typescript
f.match('title', 'search')           // MATCH(title, "search")
f.matchPhrase('title', 'exact phrase')  // MATCH_PHRASE(title, "exact phrase")
f.multiMatch('query', 'f1', 'f2')   // MULTI_MATCH("query", f1, f2)
f.term('status', 'active')          // TERM(status, "active")
f.kql('status: active')             // KQL("status: active")
f.qstr('title:search')              // QSTR("title:search")
f.knn('embedding', 10)              // KNN(embedding, 10)
f.score()                            // SCORE()
```

#### Multivalue functions

```typescript
f.mvAvg('values')          // MV_AVG(values)
f.mvCount('values')        // MV_COUNT(values)
f.mvMin('values')          // MV_MIN(values)
f.mvMax('values')          // MV_MAX(values)
f.mvSum('values')          // MV_SUM(values)
f.mvMedian('values')       // MV_MEDIAN(values)
f.mvFirst('values')        // MV_FIRST(values)
f.mvLast('values')         // MV_LAST(values)
f.mvConcat('tags', ', ')   // MV_CONCAT(tags, ", ")
f.mvSort('values')         // MV_SORT(values)
f.mvDedupe('values')       // MV_DEDUPE(values)
f.mvSlice('values', 0, 5)  // MV_SLICE(values, 0, 5)
f.mvZip('keys', 'values')  // MV_ZIP(keys, values)
f.mvContains('tags', 'x')  // MV_CONTAINS(tags, "x")
f.mvAppend('a', 'b')       // MV_APPEND(a, b)
```

#### Geo functions

```typescript
f.stX('point')                         // ST_X(point)
f.stY('point')                         // ST_Y(point)
f.stDistance('a', 'b')                 // ST_DISTANCE(a, b)
f.stIntersects('geo', 'shape')         // ST_INTERSECTS(geo, shape)
f.stContains('geo', 'point')           // ST_CONTAINS(geo, point)
f.stDisjoint('geo', 'shape')           // ST_DISJOINT(geo, shape)
f.stWithin('geo', 'boundary')          // ST_WITHIN(geo, boundary)
f.stCentroidAgg('location')           // ST_CENTROID_AGG(location)
f.stExtentAgg('location')             // ST_EXTENT_AGG(location)
f.stEnvelope('geo')                    // ST_ENVELOPE(geo)
```

#### Conversion functions

```typescript
f.toBoolean('val')    // TO_BOOLEAN(val)
f.toInteger('val')    // TO_INTEGER(val)
f.toLong('val')       // TO_LONG(val)
f.toDouble('val')     // TO_DOUBLE(val)
f.toString('val')     // TO_STRING(val)
f.toDatetime('val')   // TO_DATETIME(val)
f.toIp('val')         // TO_IP(val)
f.toVersion('val')    // TO_VERSION(val)
f.toGeopoint('val')   // TO_GEOPOINT(val)
f.toGeoshape('val')   // TO_GEOSHAPE(val)
f.toCartesianPoint('val')  // TO_CARTESIANPOINT(val)
f.toCartesianShape('val')  // TO_CARTESIANSHAPE(val)
f.toUnsignedLong('val')    // TO_UNSIGNED_LONG(val)
f.toDateNanos('val')       // TO_DATE_NANOS(val)
```

#### IP and network functions

```typescript
f.cidrMatch('ip', '10.0.0.0/8', '172.16.0.0/12')  // CIDR_MATCH(ip, "10.0.0.0/8", "172.16.0.0/12")
f.ipPrefix('ip', 24, 0)                             // IP_PREFIX(ip, 24, 0)
f.networkDirection('src', 'dst', '10.0.0.0/8')      // NETWORK_DIRECTION(src, dst, "10.0.0.0/8")
```

#### Grouping functions

```typescript
f.bucket('salary', 10000)   // BUCKET(salary, 10000)
f.categorize('message')     // CATEGORIZE(message)
```

#### Time series functions

```typescript
f.rate('bytes')                       // RATE(bytes)
f.delta('counter')                    // DELTA(counter)
f.deriv('counter')                    // DERIV(counter)
f.tbucket('@timestamp', '1h')        // TBUCKET(@timestamp, 1h)
f.trange('@timestamp', '24h')        // TRANGE(@timestamp, 24h)
f.avgOverTime('cpu')                  // AVG_OVER_TIME(cpu)
f.minOverTime('cpu')                  // MIN_OVER_TIME(cpu)
f.maxOverTime('cpu')                  // MAX_OVER_TIME(cpu)
f.sumOverTime('bytes')                // SUM_OVER_TIME(bytes)
f.countOverTime('events')             // COUNT_OVER_TIME(events)
```

#### Hash and URL functions

```typescript
f.hash('algorithm', 'input')  // HASH("algorithm", input)
f.md5('input')                // MD5(input)
f.sha1('input')               // SHA1(input)
f.sha256('input')             // SHA256(input)
f.urlDecode('url')            // URL_DECODE(url)
f.urlEncode('url')            // URL_ENCODE(url)
f.urlEncodeComponent('str')   // URL_ENCODE_COMPONENT(str)
```

#### Vector functions

```typescript
f.vCosine('a', 'b')       // V_COSINE(a, b)
f.vDotProduct('a', 'b')   // V_DOT_PRODUCT(a, b)
f.vHamming('a', 'b')      // V_HAMMING(a, b)
f.vL1Norm('a', 'b')       // V_L1_NORM(a, b)
f.vL2Norm('a', 'b')       // V_L2_NORM(a, b)
f.vMagnitude('vec')        // V_MAGNITUDE(vec)
```

## Advanced query patterns

### Aggregation with `STATS ... BY`

The `stats()` method accepts an object mapping output column names to aggregation expressions. Chain `.by()` to group the aggregation:

```typescript
import { ESQL, E, f } from '@elastic/elasticsearch-esql-dsl'

// FROM employees
// | STATS avg_salary = AVG(salary), headcount = COUNT(*) BY department
// | SORT avg_salary DESC
const query = ESQL.from('employees')
  .stats({
    avg_salary: f.avg('salary'),
    headcount: f.count(),
  })
  .by('department')
  .sort(E('avg_salary').desc())
```

### Hybrid search with FORK and FUSE

Use `fork()` to run multiple sub-queries in parallel, then `fuse()` to merge the results:

```typescript
import { ESQL, E, f } from '@elastic/elasticsearch-esql-dsl'

const query = ESQL.from('articles')
  .fork(
    ESQL.branch()
      .where(f.match('title', 'elasticsearch'))
      .sort(E('_score').desc())
      .limit(50),
    ESQL.branch()
      .where(f.knn('embedding', 10))
      .sort(E('_score').desc())
      .limit(50),
  )
  .fuse('RRF')
  .limit(10)
```

### Data enrichment

```typescript
const query = ESQL.from('logs')
  .enrich('ip_lookup')
  .on('client.ip')
  .with('geo.city', 'geo.country')
  .keep('message', 'geo.city', 'geo.country')
```

### Log parsing

```typescript
// Using DISSECT
const q1 = ESQL.from('logs')
  .dissect('message', '%{timestamp} %{level} %{msg}')
  .keep('timestamp', 'level', 'msg')

// Using GROK
const q2 = ESQL.from('logs')
  .grok('message', '%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level}')
  .keep('timestamp', 'level')
```

### AI/ML integration

```typescript
// LLM completion
const q1 = ESQL.from('docs')
  .completion('Summarize this document')
  .with({ inferenceId: 'my-llm' })

// Semantic reranking
const q2 = ESQL.from('docs')
  .rerank('user query')
  .on('title', 'body')
  .with({ inferenceId: 'my-reranker', topN: 10 })
```

### Time series analysis

```typescript
const query = ESQL.ts('metrics')
  .stats({
    bytes_rate: f.rate('bytes'),
    avg_cpu: f.avgOverTime('cpu'),
  })
  .by('host')
```

### Change point detection

```typescript
const query = ESQL.from('metrics')
  .changePoint('cpu_usage')
  .on('host')
  .as_('change_type', 'change_pvalue')
```

### Serialization

Every query object supports `render()`, `toString()`, and `toJSON()`:

```typescript
const query = ESQL.from('employees')
  .where(E('salary').gt(50000))
  .limit(10)

query.render()    // "FROM employees\n| WHERE salary > 50000\n| LIMIT 10"
query.toString()  // same as render()
query.toJSON()    // { query: "FROM employees\n| WHERE salary > 50000\n| LIMIT 10" }
```
