#!/usr/bin/env npx tsx
/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Integration test that runs DSL-generated ES|QL queries against a live
 * Elasticsearch instance. Requires ES running at http://localhost:9200
 * (or set ELASTICSEARCH_URL).
 *
 * Usage:
 *   npx tsx scripts/integration-test.ts
 */

import { Client } from '@elastic/elasticsearch'
import { E, ESQL, Op, and_, or_, not_, f, esql, col, VERSION, formatIdentifier, formatSourceName } from '../packages/esql-dsl/src/index'

const esUrl = process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200'
const client = new Client({
  node: esUrl,
  auth: process.env.ELASTICSEARCH_API_KEY
    ? { apiKey: process.env.ELASTICSEARCH_API_KEY }
    : { username: 'elastic', password: process.env.ELASTICSEARCH_PASSWORD ?? 'Z8jeosJK' },
})
const INDEX = 'dsl-integration-test'

let passed = 0
let failed = 0

async function test(label: string, fn: () => Promise<void>) {
  try {
    await fn()
    console.log(`  ✓ ${label}`)
    passed++
  } catch (err: any) {
    console.error(`  ✗ ${label}`)
    console.error(`    ${err.message}`)
    failed++
  }
}

function assert(actual: unknown, expected: unknown, msg?: string) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a !== e) {
    throw new Error(`${msg ?? 'Assertion failed'}: expected ${e}, got ${a}`)
  }
}

async function setup() {
  console.log(`\nConnecting to ${esUrl}...`)
  const info = await client.info()
  console.log(`Elasticsearch ${info.version.number}\n`)

  await client.indices.delete({ index: INDEX }).catch(() => {})
  await client.indices.create({
    index: INDEX,
    mappings: {
      properties: {
        name: { type: 'keyword' },
        department: { type: 'keyword' },
        salary: { type: 'integer' },
        hired: { type: 'boolean' },
        start_date: { type: 'date' },
        tags: { type: 'keyword' },
      },
    },
  })

  const docs = [
    { name: 'Alice', department: 'Engineering', salary: 120000, hired: true, start_date: '2020-01-15', tags: ['senior', 'lead'] },
    { name: 'Bob', department: 'Engineering', salary: 95000, hired: true, start_date: '2021-06-01', tags: ['mid'] },
    { name: 'Charlie', department: 'Sales', salary: 80000, hired: true, start_date: '2022-03-10', tags: ['junior'] },
    { name: 'Diana', department: 'Sales', salary: 110000, hired: false, start_date: '2019-11-20', tags: ['senior'] },
    { name: 'Eve', department: 'Engineering', salary: 140000, hired: true, start_date: '2018-05-30', tags: ['senior', 'architect'] },
    { name: "Frank O'Brien", department: 'Marketing', salary: 75000, hired: true, start_date: '2023-01-05', tags: ['junior'] },
  ]

  await client.helpers.bulk({
    datasource: docs,
    onDocument: () => ({ index: { _index: INDEX } }),
    refreshOnCompletion: INDEX,
  })

  console.log(`Indexed ${docs.length} documents into ${INDEX}\n`)
}

async function teardown() {
  await client.indices.delete({ index: INDEX }).catch(() => {})
}

async function runQuery(queryStr: string): Promise<{ columns: any[]; values: any[][] }> {
  const response = await client.esql.query({ query: queryStr, format: 'json' }) as any
  return response
}

async function runTests() {
  // --- Basic FROM ---
  console.log('Source commands:')

  await test('FROM returns all rows', async () => {
    const q = ESQL.from(INDEX)
    const result = await runQuery(q.render())
    assert(result.values.length, 6, 'row count')
  })

  await test('ROW produces literal values', async () => {
    const q = ESQL.row({ x: 1, greeting: 'hello' })
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'row count')
    assert(result.columns.map((c: any) => c.name).sort(), ['greeting', 'x'], 'column names')
  })

  // --- WHERE with expressions ---
  console.log('\nWHERE clause:')

  await test('WHERE E().gt() filters correctly', async () => {
    const q = ESQL.from(INDEX).where(E('salary').gt(100000))
    const result = await runQuery(q.render())
    assert(result.values.length, 3, 'row count')
  })

  await test('WHERE E().eq() with boolean', async () => {
    const q = ESQL.from(INDEX).where(E('hired').eq(false))
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'row count')
  })

  await test('WHERE E().between()', async () => {
    const q = ESQL.from(INDEX).where(E('salary').between(90000, 120000))
    const result = await runQuery(q.render())
    assert(result.values.length, 3, 'row count')
  })

  await test('WHERE E().in()', async () => {
    const q = ESQL.from(INDEX).where(E('department').in(['Engineering', 'Marketing']))
    const result = await runQuery(q.render())
    assert(result.values.length, 4, 'row count')
  })

  await test('WHERE E().like()', async () => {
    const q = ESQL.from(INDEX).where(E('name').like('*li*'))
    const result = await runQuery(q.render())
    assert(result.values.length >= 1, true, 'at least one match')
  })

  // --- POJO where ---
  console.log('\nPOJO WHERE:')

  await test('POJO implicit equality', async () => {
    const q = ESQL.from(INDEX).where({ department: 'Sales' })
    const result = await runQuery(q.render())
    assert(result.values.length, 2, 'row count')
  })

  await test('POJO Op.gte', async () => {
    const q = ESQL.from(INDEX).where({ salary: { [Op.gte]: 110000 } })
    const result = await runQuery(q.render())
    assert(result.values.length, 3, 'row count')
  })

  await test('POJO Op.or', async () => {
    const q = ESQL.from(INDEX).where({
      [Op.or]: [{ department: 'Sales' }, { department: 'Marketing' }],
    })
    const result = await runQuery(q.render())
    assert(result.values.length, 3, 'row count')
  })

  // --- Logical operators ---
  console.log('\nLogical operators:')

  await test('and_() combines conditions', async () => {
    const q = ESQL.from(INDEX).where(
      and_(E('department').eq('Engineering'), E('salary').gt(100000))
    )
    const result = await runQuery(q.render())
    assert(result.values.length, 2, 'row count')
  })

  await test('or_() combines conditions', async () => {
    const q = ESQL.from(INDEX).where(
      or_(E('salary').gt(130000), E('department').eq('Marketing'))
    )
    const result = await runQuery(q.render())
    assert(result.values.length, 2, 'row count')
  })

  // --- Processing commands ---
  console.log('\nProcessing commands:')

  await test('SORT and LIMIT', async () => {
    const q = ESQL.from(INDEX)
      .sort(E('salary').desc())
      .limit(3)
    const result = await runQuery(q.render())
    assert(result.values.length, 3, 'row count')
  })

  await test('KEEP selects columns', async () => {
    const q = ESQL.from(INDEX).keep('name', 'salary')
    const result = await runQuery(q.render())
    const colNames = result.columns.map((c: any) => c.name).sort()
    assert(colNames, ['name', 'salary'], 'column names')
  })

  await test('DROP removes columns', async () => {
    const q = ESQL.from(INDEX).drop('tags', 'start_date')
    const result = await runQuery(q.render())
    const colNames = result.columns.map((c: any) => c.name)
    assert(colNames.includes('tags'), false, 'tags removed')
    assert(colNames.includes('start_date'), false, 'start_date removed')
  })

  await test('EVAL computes new column', async () => {
    const q = ESQL.from(INDEX)
      .eval({ bonus: E('salary').mul(0.1) })
      .keep('name', 'salary', 'bonus')
      .sort(E('salary').desc())
      .limit(1)
    const result = await runQuery(q.render())
    const bonusIdx = result.columns.findIndex((c: any) => c.name === 'bonus')
    assert(result.values[0][bonusIdx], 14000.0, 'bonus = 140000 * 0.1')
  })

  await test('STATS with BY', async () => {
    const q = ESQL.from(INDEX)
      .stats({ avg_salary: f.avg('salary') })
      .by('department')
    const result = await runQuery(q.render())
    assert(result.values.length >= 3, true, 'at least 3 departments')
    const colNames = result.columns.map((c: any) => c.name).sort()
    assert(colNames, ['avg_salary', 'department'], 'column names')
  })

  await test('STATS count', async () => {
    const q = ESQL.from(INDEX)
      .stats({ total: f.count('name') })
    const result = await runQuery(q.render())
    assert(result.values[0][0], 6, 'total count')
  })

  // --- esql template tag ---
  console.log('\nesql template tag:')

  await test('template tag with interpolation', async () => {
    const dept = 'Engineering'
    const minSalary = 100000
    const q = ESQL.from(INDEX).where(
      esql`department == ${dept} AND salary > ${minSalary}`
    )
    const result = await runQuery(q.render())
    assert(result.values.length, 2, 'row count')
  })

  // --- Injection prevention ---
  console.log('\nInjection prevention:')

  await test('string values are escaped in POJO where', async () => {
    const q = ESQL.from(INDEX).where({ name: 'Alice"; DROP TABLE users--' })
    const result = await runQuery(q.render())
    assert(result.values.length, 0, 'no matches for injected string')
  })

  await test('esql tag escapes interpolated strings', async () => {
    const malicious = '" OR 1==1 OR name=="'
    const q = ESQL.from(INDEX).where(esql`name == ${malicious}`)
    const result = await runQuery(q.render())
    assert(result.values.length, 0, 'no matches for injected string')
  })

  await test("names with apostrophes work", async () => {
    const q = ESQL.from(INDEX).where({ name: "Frank O'Brien" })
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'row count')
  })

  // --- Full pipeline ---
  console.log('\nFull pipeline:')

  await test('multi-step query', async () => {
    const q = ESQL.from(INDEX)
      .where(E('hired').eq(true))
      .eval({ bonus: E('salary').mul(0.1) })
      .stats({ avg_bonus: f.avg('bonus') })
      .by('department')
      .sort('avg_bonus DESC')
      .limit(5)
    const result = await runQuery(q.render())
    assert(result.values.length >= 1, true, 'has results')
    const colNames = result.columns.map((c: any) => c.name).sort()
    assert(colNames, ['avg_bonus', 'department'], 'column names')
  })

  // --- Functions ---
  console.log('\nES|QL functions:')

  await test('f.count()', async () => {
    const q = ESQL.from(INDEX).stats({ n: f.count('name') })
    const result = await runQuery(q.render())
    assert(result.values[0][0], 6, 'count')
  })

  await test('f.max() and f.min()', async () => {
    const q = ESQL.from(INDEX).stats({ hi: f.max('salary'), lo: f.min('salary') })
    const result = await runQuery(q.render())
    assert(result.values[0][0], 140000, 'max')
    assert(result.values[0][1], 75000, 'min')
  })

  await test('f.length() in EVAL', async () => {
    const q = ESQL.from(INDEX)
      .eval({ name_len: f.length('name') })
      .keep('name', 'name_len')
      .where(E('name').eq('Alice'))
    const result = await runQuery(q.render())
    const lenIdx = result.columns.findIndex((c: any) => c.name === 'name_len')
    assert(result.values[0][lenIdx], 5, 'length of Alice')
  })

  // --- RENAME ---
  console.log('\nRENAME:')

  await test('RENAME renames a column', async () => {
    const q = ESQL.from(INDEX).rename({ name: 'employee_name' }).keep('employee_name', 'salary')
    const result = await runQuery(q.render())
    const colNames = result.columns.map((c: any) => c.name).sort()
    assert(colNames, ['employee_name', 'salary'], 'column names')
    assert(result.values.length, 6, 'row count')
  })

  // --- Multiple WHERE chains ---
  console.log('\nMultiple WHERE chains:')

  await test('chained WHERE clauses are ANDed', async () => {
    const q = ESQL.from(INDEX)
      .where(E('department').eq('Engineering'))
      .where(E('salary').gt(100000))
    const result = await runQuery(q.render())
    assert(result.values.length, 2, 'row count')
  })

  // --- MV_EXPAND ---
  console.log('\nMV_EXPAND:')

  await test('MV_EXPAND expands multivalued field', async () => {
    const q = ESQL.from(INDEX)
      .where(E('name').eq('Alice'))
      .mvExpand('tags')
    const result = await runQuery(q.render())
    assert(result.values.length, 2, 'expanded rows for Alice (senior + lead)')
  })

  // --- SHOW ---
  console.log('\nSHOW:')

  await test('SHOW INFO returns cluster info', async () => {
    const q = ESQL.show('INFO')
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'one row')
    const colNames = result.columns.map((c: any) => c.name)
    assert(colNames.includes('version'), true, 'has version column')
  })

  // --- Additional functions ---
  console.log('\nAdditional functions:')

  await test('f.sum()', async () => {
    const q = ESQL.from(INDEX).stats({ total_salary: f.sum('salary') })
    const result = await runQuery(q.render())
    assert(result.values[0][0], 620000, 'sum of all salaries')
  })

  await test('f.avg()', async () => {
    const q = ESQL.from(INDEX)
      .where(E('department').eq('Engineering'))
      .stats({ avg_sal: f.avg('salary') })
    const result = await runQuery(q.render())
    const avg = Math.round(result.values[0][0] as number)
    assert(avg, 118333, 'avg engineering salary')
  })

  await test('f.trim() in EVAL', async () => {
    const q = ESQL.row({ padded: '  hello  ' }).eval({ trimmed: f.trim('padded') })
    const result = await runQuery(q.render())
    const trimIdx = result.columns.findIndex((c: any) => c.name === 'trimmed')
    assert(result.values[0][trimIdx], 'hello', 'trimmed value')
  })

  await test('f.toUpper() and f.toLower()', async () => {
    const q = ESQL.row({ s: 'Hello' })
      .eval({ up: f.toUpper('s'), lo: f.toLower('s') })
    const result = await runQuery(q.render())
    const upIdx = result.columns.findIndex((c: any) => c.name === 'up')
    const loIdx = result.columns.findIndex((c: any) => c.name === 'lo')
    assert(result.values[0][upIdx], 'HELLO', 'upper')
    assert(result.values[0][loIdx], 'hello', 'lower')
  })

  await test('f.concat() in EVAL', async () => {
    const q = ESQL.from(INDEX)
      .eval({ full: f.concat(E('name'), ' - ', E('department')) })
      .keep('full')
      .where(E('full').like('Alice*'))
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'one row')
    assert(result.values[0][0], 'Alice - Engineering', 'concat result')
  })

  await test('f.abs() and f.round()', async () => {
    const q = ESQL.row({ val: -3.14159 })
      .eval({ a: f.abs('val'), r: f.round('val', 2) })
    const result = await runQuery(q.render())
    const aIdx = result.columns.findIndex((c: any) => c.name === 'a')
    const rIdx = result.columns.findIndex((c: any) => c.name === 'r')
    assert(result.values[0][aIdx], 3.14159, 'abs')
    assert(result.values[0][rIdx], -3.14, 'round')
  })

  // --- Complex pipelines ---
  console.log('\nComplex pipelines:')

  await test('WHERE + EVAL + STATS + SORT', async () => {
    const q = ESQL.from(INDEX)
      .where(E('hired').eq(true))
      .eval({ monthly: E('salary').div(12) })
      .stats({ avg_monthly: f.avg('monthly'), headcount: f.count('name') })
      .by('department')
      .sort('avg_monthly DESC')
    const result = await runQuery(q.render())
    assert(result.values.length >= 2, true, 'at least 2 departments')
    const colNames = result.columns.map((c: any) => c.name).sort()
    assert(colNames, ['avg_monthly', 'department', 'headcount'], 'column names')
  })

  await test('nested function calls in EVAL', async () => {
    const q = ESQL.row({ val: '  42  ' })
      .eval({ n: f.toInteger(f.trim('val')) })
    const result = await runQuery(q.render())
    const nIdx = result.columns.findIndex((c: any) => c.name === 'n')
    assert(result.values[0][nIdx], 42, 'trimmed then converted')
  })

  // --- Expression builder: untested methods ---
  console.log('\nExpression builder (additional methods):')

  await test('E().ne() not equal', async () => {
    const q = ESQL.from(INDEX).where(E('department').ne('Engineering')).keep('name', 'department')
    const result = await runQuery(q.render())
    assert(result.values.length, 3, 'non-engineering count')
  })

  await test('E().gte() greater or equal', async () => {
    const q = ESQL.from(INDEX).where(E('salary').gte(120000))
    const result = await runQuery(q.render())
    assert(result.values.length, 2, 'salary >= 120000')
  })

  await test('E().lt() less than', async () => {
    const q = ESQL.from(INDEX).where(E('salary').lt(80000))
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'salary < 80000')
  })

  await test('E().lte() less or equal', async () => {
    const q = ESQL.from(INDEX).where(E('salary').lte(80000))
    const result = await runQuery(q.render())
    assert(result.values.length, 2, 'salary <= 80000')
  })

  await test('E().isNull()', async () => {
    const q = ESQL.from(INDEX)
      .eval({ x: E('salary').mul(0) })
      .where(E('x').isNull())
    const result = await runQuery(q.render())
    assert(result.values.length, 0, 'no nulls in salary*0')
  })

  await test('E().isNotNull()', async () => {
    const q = ESQL.from(INDEX).where(E('salary').isNotNull())
    const result = await runQuery(q.render())
    assert(result.values.length, 6, 'all have salary')
  })

  await test('E().rlike() regex match', async () => {
    const q = ESQL.from(INDEX).where(E('name').rlike('A.*e'))
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'Alice matches A.*e')
  })

  await test('E().startsWith()', async () => {
    const q = ESQL.from(INDEX).where(E('name').startsWith('Al'))
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'Alice starts with Al')
  })

  await test('E().endsWith()', async () => {
    const q = ESQL.from(INDEX).where(E('name').endsWith('ob'))
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'Bob ends with ob')
  })

  await test('E().add() arithmetic', async () => {
    const q = ESQL.row({ a: 10 }).eval({ b: E('a').add(5) })
    const result = await runQuery(q.render())
    const bIdx = result.columns.findIndex((c: any) => c.name === 'b')
    assert(result.values[0][bIdx], 15, '10 + 5')
  })

  await test('E().sub() arithmetic', async () => {
    const q = ESQL.row({ a: 10 }).eval({ b: E('a').sub(3) })
    const result = await runQuery(q.render())
    const bIdx = result.columns.findIndex((c: any) => c.name === 'b')
    assert(result.values[0][bIdx], 7, '10 - 3')
  })

  await test('E().mod() modulo', async () => {
    const q = ESQL.row({ a: 10 }).eval({ b: E('a').mod(3) })
    const result = await runQuery(q.render())
    const bIdx = result.columns.findIndex((c: any) => c.name === 'b')
    assert(result.values[0][bIdx], 1, '10 % 3')
  })

  await test('E().asc() sort', async () => {
    const q = ESQL.from(INDEX).sort(E('salary').asc()).limit(1).keep('name', 'salary')
    const result = await runQuery(q.render())
    const nameIdx = result.columns.findIndex((c: any) => c.name === 'name')
    assert(result.values[0][nameIdx], "Frank O'Brien", 'lowest salary first')
  })

  await test('E().desc().nullsLast() sort', async () => {
    const q = ESQL.from(INDEX).sort(E('salary').desc().nullsLast()).limit(1).keep('name')
    const result = await runQuery(q.render())
    assert(result.values[0][0], 'Eve', 'highest salary first')
  })

  // --- not_() ---
  console.log('\nnot_():')

  await test('not_() negates condition', async () => {
    const q = ESQL.from(INDEX).where(not_(E('department').eq('Engineering')))
    const result = await runQuery(q.render())
    assert(result.values.length, 3, 'non-engineering')
  })

  // --- col() alias ---
  console.log('\ncol() alias:')

  await test('col() is an alias for E()', async () => {
    const q = ESQL.from(INDEX).where(col('salary').gt(100000))
    const result = await runQuery(q.render())
    assert(result.values.length, 3, 'same as E()')
  })

  // --- VERSION export ---
  console.log('\nVERSION:')

  await test('VERSION is exported and valid', async () => {
    assert(typeof VERSION, 'string', 'VERSION is a string')
    assert(VERSION.length > 0, true, 'VERSION is non-empty')
  })

  // --- formatIdentifier / formatSourceName ---
  console.log('\nIdentifier formatting:')

  await test('formatIdentifier escapes hyphens', async () => {
    assert(formatIdentifier('my-field'), '`my-field`', 'backtick-escaped')
  })

  await test('formatSourceName allows hyphens', async () => {
    assert(formatSourceName('my-index'), 'my-index', 'no escaping')
  })

  await test('formatSourceName allows wildcards', async () => {
    assert(formatSourceName('logs-*'), 'logs-*', 'wildcard preserved')
  })

  // --- SHOW FUNCTIONS ---
  console.log('\nSHOW FUNCTIONS:')

  // SHOW FUNCTIONS was removed from ES|QL in recent versions.
  // The DSL should be updated to remove this option.

  // --- POJO WHERE with additional Op types ---
  console.log('\nPOJO WHERE (additional Ops):')

  await test('POJO Op.gt', async () => {
    const q = ESQL.from(INDEX).where({ salary: { [Op.gt]: 130000 } })
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'only Eve > 130000')
  })

  await test('POJO Op.lt', async () => {
    const q = ESQL.from(INDEX).where({ salary: { [Op.lt]: 80000 } })
    const result = await runQuery(q.render())
    assert(result.values.length, 1, "only Frank < 80000")
  })

  await test('POJO Op.lte', async () => {
    const q = ESQL.from(INDEX).where({ salary: { [Op.lte]: 80000 } })
    const result = await runQuery(q.render())
    assert(result.values.length, 2, 'Charlie + Frank <= 80000')
  })

  await test('POJO Op.ne', async () => {
    const q = ESQL.from(INDEX).where({ department: { [Op.ne]: 'Engineering' } })
    const result = await runQuery(q.render())
    assert(result.values.length, 3, 'non-engineering')
  })

  await test('POJO Op.like', async () => {
    const q = ESQL.from(INDEX).where({ name: { [Op.like]: 'A*' } })
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'Alice matches A*')
  })

  await test('POJO Op.and', async () => {
    const q = ESQL.from(INDEX).where({
      [Op.and]: [{ department: 'Engineering' }, { salary: { [Op.gt]: 100000 } }],
    })
    const result = await runQuery(q.render())
    assert(result.values.length, 2, 'engineering > 100000')
  })

  // --- DISSECT ---
  console.log('\nDISSECT:')

  await test('DISSECT extracts fields from text', async () => {
    const q = ESQL.row({ msg: '2024-01-15 Alice joined' })
      .dissect('msg', '%{date} %{who} %{action}')
      .keep('date', 'who', 'action')
    const result = await runQuery(q.render())
    assert(result.values[0][0], '2024-01-15', 'date')
    assert(result.values[0][1], 'Alice', 'who')
    assert(result.values[0][2], 'joined', 'action')
  })

  // --- GROK ---
  console.log('\nGROK:')

  await test('GROK extracts structured fields', async () => {
    const q = ESQL.row({ msg: '55.3.244.1 GET /index.html' })
      .grok('msg', '%{IP:client_ip} %{WORD:method} %{URIPATHPARAM:path}')
      .keep('client_ip', 'method', 'path')
    const result = await runQuery(q.render())
    assert(result.values[0][0], '55.3.244.1', 'ip')
    assert(result.values[0][1], 'GET', 'method')
    assert(result.values[0][2], '/index.html', 'path')
  })

  // --- EVAL with string expressions ---
  console.log('\nEVAL string form:')

  await test('eval(...strings) raw expressions', async () => {
    const q = ESQL.from(INDEX)
      .eval('bonus = salary * 0.1')
      .keep('name', 'bonus')
      .sort(E('bonus').desc())
      .limit(1)
    const result = await runQuery(q.render())
    const bonusIdx = result.columns.findIndex((c: any) => c.name === 'bonus')
    assert(result.values[0][bonusIdx], 14000.0, 'bonus')
  })

  // --- WHERE with raw string ---
  console.log('\nWHERE raw string:')

  await test('where(string) raw expression', async () => {
    const q = ESQL.from(INDEX).where('salary > 130000')
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'only Eve')
  })

  // --- INLINESTATS ---
  console.log('\nINLINESTATS:')

  await test('inlineStats with by()', async () => {
    const q = ESQL.from(INDEX)
      .inlineStats({ dept_avg: f.avg('salary') })
      .by('department')
      .keep('name', 'salary', 'department', 'dept_avg')
      .sort(E('name').asc())
      .limit(1)
    const result = await runQuery(q.render())
    const colNames = result.columns.map((c: any) => c.name).sort()
    assert(colNames, ['department', 'dept_avg', 'name', 'salary'], 'columns')
    assert(result.values.length, 1, 'limited to 1')
  })

  // --- FROM METADATA ---
  console.log('\nFROM METADATA:')

  await test('FROM with METADATA _id', async () => {
    const q = ESQL.from(INDEX).metadata('_id').keep('_id', 'name').limit(1)
    const result = await runQuery(q.render())
    const colNames = result.columns.map((c: any) => c.name).sort()
    assert(colNames.includes('_id'), true, 'has _id column')
  })

  // --- toJSON / toString ---
  console.log('\nSerialization:')

  await test('toJSON() wraps render in {query}', async () => {
    const q = ESQL.from(INDEX).where(E('salary').gt(100000)).limit(5)
    const json = q.toJSON()
    assert(json.query, q.render(), 'toJSON().query equals render')
  })

  await test('toString() matches render()', async () => {
    const q = ESQL.from(INDEX).where(E('salary').gt(100000)).limit(5)
    assert(q.toString(), q.render(), 'toString equals render')
  })

  // --- Additional string functions ---
  console.log('\nAdditional string functions:')

  await test('f.substring()', async () => {
    const q = ESQL.row({ s: 'Hello World' }).eval({ sub: f.substring('s', 0, 5) })
    const result = await runQuery(q.render())
    const subIdx = result.columns.findIndex((c: any) => c.name === 'sub')
    assert(result.values[0][subIdx], 'Hello', 'substring')
  })

  await test('f.left() and f.right()', async () => {
    const q = ESQL.row({ s: 'Hello' })
      .eval({ l: f.left('s', 2), r: f.right('s', 2) })
    const result = await runQuery(q.render())
    const lIdx = result.columns.findIndex((c: any) => c.name === 'l')
    const rIdx = result.columns.findIndex((c: any) => c.name === 'r')
    assert(result.values[0][lIdx], 'He', 'left')
    assert(result.values[0][rIdx], 'lo', 'right')
  })

  await test('f.replace()', async () => {
    const q = ESQL.row({ s: 'foo bar foo' })
      .eval({ r: f.replace(E('s'), 'foo', 'baz') })
    const result = await runQuery(q.render())
    const rIdx = result.columns.findIndex((c: any) => c.name === 'r')
    assert(result.values[0][rIdx], 'baz bar baz', 'regex replaces all occurrences')
  })

  await test('f.ltrim() and f.rtrim()', async () => {
    const q = ESQL.row({ s: '  hello  ' })
      .eval({ l: f.ltrim('s'), r: f.rtrim('s') })
    const result = await runQuery(q.render())
    const lIdx = result.columns.findIndex((c: any) => c.name === 'l')
    const rIdx = result.columns.findIndex((c: any) => c.name === 'r')
    assert(result.values[0][lIdx], 'hello  ', 'ltrim')
    assert(result.values[0][rIdx], '  hello', 'rtrim')
  })

  await test('f.reverse()', async () => {
    const q = ESQL.row({ s: 'hello' }).eval({ r: f.reverse('s') })
    const result = await runQuery(q.render())
    const rIdx = result.columns.findIndex((c: any) => c.name === 'r')
    assert(result.values[0][rIdx], 'olleh', 'reversed')
  })

  await test('f.repeat()', async () => {
    const q = ESQL.row({ s: 'ab' }).eval({ r: f.repeat('s', 3) })
    const result = await runQuery(q.render())
    const rIdx = result.columns.findIndex((c: any) => c.name === 'r')
    assert(result.values[0][rIdx], 'ababab', 'repeated')
  })

  await test('f.startsWith() function', async () => {
    const q = ESQL.from(INDEX)
      .where(E('name').eq('Alice'))
      .eval({ sw: f.startsWith(E('name'), 'Al') })
      .keep('sw')
    const result = await runQuery(q.render())
    assert(result.values[0][0], true, 'starts with Al')
  })

  await test('f.endsWith() function', async () => {
    const q = ESQL.from(INDEX)
      .where(E('name').eq('Bob'))
      .eval({ ew: f.endsWith(E('name'), 'ob') })
      .keep('ew')
    const result = await runQuery(q.render())
    assert(result.values[0][0], true, 'ends with ob')
  })

  // --- Additional math functions ---
  console.log('\nAdditional math functions:')

  await test('f.ceil() and f.floor()', async () => {
    const q = ESQL.row({ v: 3.7 })
      .eval({ c: f.ceil('v'), fl: f.floor('v') })
    const result = await runQuery(q.render())
    const cIdx = result.columns.findIndex((c: any) => c.name === 'c')
    const fIdx = result.columns.findIndex((c: any) => c.name === 'fl')
    assert(result.values[0][cIdx], 4, 'ceil')
    assert(result.values[0][fIdx], 3, 'floor')
  })

  await test('f.sqrt()', async () => {
    const q = ESQL.row({ v: 16 }).eval({ r: f.sqrt('v') })
    const result = await runQuery(q.render())
    const rIdx = result.columns.findIndex((c: any) => c.name === 'r')
    assert(result.values[0][rIdx], 4.0, 'sqrt(16)')
  })

  await test('f.pow()', async () => {
    const q = ESQL.row({ v: 2 }).eval({ r: f.pow('v', 3) })
    const result = await runQuery(q.render())
    const rIdx = result.columns.findIndex((c: any) => c.name === 'r')
    assert(result.values[0][rIdx], 8.0, 'pow(2,3)')
  })

  await test('f.log10()', async () => {
    const q = ESQL.row({ v: 100 }).eval({ r: f.log10('v') })
    const result = await runQuery(q.render())
    const rIdx = result.columns.findIndex((c: any) => c.name === 'r')
    assert(result.values[0][rIdx], 2.0, 'log10(100)')
  })

  await test('f.pi() and f.e()', async () => {
    const q = ESQL.row({ x: 1 })
      .eval({ pi: f.pi(), euler: f.e() })
      .keep('pi', 'euler')
    const result = await runQuery(q.render())
    const piIdx = result.columns.findIndex((c: any) => c.name === 'pi')
    const eIdx = result.columns.findIndex((c: any) => c.name === 'euler')
    const piVal = Math.round((result.values[0][piIdx] as number) * 10000)
    const eVal = Math.round((result.values[0][eIdx] as number) * 10000)
    assert(piVal, 31416, 'pi ~3.1416')
    assert(eVal, 27183, 'e ~2.7183')
  })

  // --- Additional conversion functions ---
  console.log('\nConversion functions:')

  await test('f.toDouble()', async () => {
    const q = ESQL.row({ s: '3.14' }).eval({ d: f.toDouble('s') })
    const result = await runQuery(q.render())
    const dIdx = result.columns.findIndex((c: any) => c.name === 'd')
    assert(result.values[0][dIdx], 3.14, 'toDouble')
  })

  await test('f.toLong()', async () => {
    const q = ESQL.row({ s: '42' }).eval({ n: f.toLong('s') })
    const result = await runQuery(q.render())
    const nIdx = result.columns.findIndex((c: any) => c.name === 'n')
    assert(result.values[0][nIdx], 42, 'toLong')
  })

  await test('f.toBoolean()', async () => {
    const q = ESQL.row({ s: 'true' }).eval({ b: f.toBoolean('s') })
    const result = await runQuery(q.render())
    const bIdx = result.columns.findIndex((c: any) => c.name === 'b')
    assert(result.values[0][bIdx], true, 'toBoolean')
  })

  await test('f.toString_()', async () => {
    const q = ESQL.row({ n: 42 }).eval({ s: f.toString_('n') })
    const result = await runQuery(q.render())
    const sIdx = result.columns.findIndex((c: any) => c.name === 's')
    assert(result.values[0][sIdx], '42', 'toString_')
  })

  // --- Conditional functions ---
  console.log('\nConditional functions:')

  await test('f.coalesce()', async () => {
    const q = ESQL.row({ a: null, b: 42 }).eval({ c: f.coalesce('a', 'b') })
    const result = await runQuery(q.render())
    const cIdx = result.columns.findIndex((c: any) => c.name === 'c')
    assert(result.values[0][cIdx], 42, 'coalesce picks non-null')
  })

  await test('f.greatest() and f.least()', async () => {
    const q = ESQL.row({ a: 10, b: 20, c: 5 })
      .eval({ g: f.greatest('a', 'b', 'c'), l: f.least('a', 'b', 'c') })
    const result = await runQuery(q.render())
    const gIdx = result.columns.findIndex((c: any) => c.name === 'g')
    const lIdx = result.columns.findIndex((c: any) => c.name === 'l')
    assert(result.values[0][gIdx], 20, 'greatest')
    assert(result.values[0][lIdx], 5, 'least')
  })

  // --- Aggregation: additional ---
  console.log('\nAdditional aggregation functions:')

  await test('f.countDistinct()', async () => {
    const q = ESQL.from(INDEX).stats({ n: f.countDistinct('department') })
    const result = await runQuery(q.render())
    assert(result.values[0][0], 3, 'distinct departments')
  })

  await test('f.median()', async () => {
    const q = ESQL.from(INDEX).stats({ m: f.median('salary') })
    const result = await runQuery(q.render())
    assert(typeof result.values[0][0], 'number', 'median is a number')
  })

  await test('f.percentile()', async () => {
    const q = ESQL.from(INDEX).stats({ p: f.percentile('salary', 50) })
    const result = await runQuery(q.render())
    assert(typeof result.values[0][0], 'number', 'percentile is a number')
  })

  await test('f.values()', async () => {
    const q = ESQL.from(INDEX)
      .where(E('department').eq('Marketing'))
      .stats({ names: f.values('name') })
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'one row')
  })

  // --- Date functions ---
  console.log('\nDate functions:')

  await test('f.now()', async () => {
    const q = ESQL.row({ x: 1 }).eval({ t: f.now() }).keep('t')
    const result = await runQuery(q.render())
    assert(typeof result.values[0][0], 'string', 'now returns date string')
  })

  // --- Multivalue functions ---
  console.log('\nMultivalue functions:')

  await test('f.mvCount()', async () => {
    const q = ESQL.from(INDEX)
      .where(E('name').eq('Alice'))
      .eval({ tag_count: f.mvCount('tags') })
      .keep('name', 'tag_count')
    const result = await runQuery(q.render())
    const tcIdx = result.columns.findIndex((c: any) => c.name === 'tag_count')
    assert(result.values[0][tcIdx], 2, 'Alice has 2 tags')
  })

  await test('f.mvSort()', async () => {
    const q = ESQL.from(INDEX)
      .where(E('name').eq('Alice'))
      .eval({ sorted_tags: f.mvSort('tags') })
      .keep('sorted_tags')
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'one row')
  })

  await test('f.mvFirst() and f.mvLast()', async () => {
    const q = ESQL.from(INDEX)
      .where(E('name').eq('Alice'))
      .eval({ first_tag: f.mvFirst('tags'), last_tag: f.mvLast('tags') })
      .keep('first_tag', 'last_tag')
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'one row')
  })

  await test('f.mvDedupe()', async () => {
    const q = ESQL.row({ arr: [1, 2, 2, 3] })
      .eval({ d: f.mvDedupe('arr') })
      .keep('d')
    const result = await runQuery(q.render())
    assert(result.values.length, 1, 'one row')
  })

  // --- Hash functions ---
  console.log('\nHash functions:')

  await test('f.md5()', async () => {
    const q = ESQL.row({ s: 'hello' }).eval({ h: f.md5('s') }).keep('h')
    const result = await runQuery(q.render())
    assert(result.values[0][0], '5d41402abc4b2a76b9719d911017c592', 'md5')
  })

  await test('f.sha256()', async () => {
    const q = ESQL.row({ s: 'hello' }).eval({ h: f.sha256('s') }).keep('h')
    const result = await runQuery(q.render())
    assert(typeof result.values[0][0], 'string', 'sha256 is string')
  })

  // --- Immutability ---
  console.log('\nImmutability:')

  await test('branching produces independent queries', async () => {
    const base = ESQL.from(INDEX).where(E('department').eq('Engineering'))
    const branch1 = base.limit(1)
    const branch2 = base.limit(2)
    const r1 = await runQuery(branch1.render())
    const r2 = await runQuery(branch2.render())
    assert(r1.values.length, 1, 'branch1 limit')
    assert(r2.values.length, 2, 'branch2 limit')
  })
}

async function main() {
  console.log('=== ES|QL DSL Integration Test ===')
  try {
    await setup()
    await runTests()
  } catch (err: any) {
    console.error(`\nSetup error: ${err.message}`)
    process.exit(1)
  } finally {
    await teardown()
    console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`)
    if (failed > 0) process.exit(1)
  }
}

main()
