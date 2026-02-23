#!/usr/bin/env npx tsx
/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  and_,
  col,
  E,
  ESQL,
  esql,
  formatIdentifier,
  not_,
  Op,
  or_,
} from '../packages/esql-dsl/src/index'

let passed = 0
let failed = 0

function assert(label: string, actual: string, expected: string) {
  if (actual === expected) {
    console.log(`  ✓ ${label}`)
    passed++
  } else {
    console.error(`  ✗ ${label}`)
    console.error(`    expected: ${expected}`)
    console.error(`    actual:   ${actual}`)
    failed++
  }
}

console.log('=== ES|QL DSL Smoke Test ===\n')

// --- 1. Source commands ---
console.log('Source commands:')

assert('FROM single index', ESQL.from('employees').render(), 'FROM employees')

assert('FROM with wildcard', ESQL.from('logs-*').render(), 'FROM logs-*')

assert('FROM multiple indices', ESQL.from('logs-1', 'logs-2').render(), 'FROM `logs-1`, `logs-2`')

assert(
  'FROM with METADATA',
  ESQL.from('logs').metadata('_id', '_version').render(),
  'FROM logs\n| METADATA _id, _version'
)

assert('ROW', ESQL.row({ x: 1, y: 'hello' }).render(), 'ROW x = 1, y = "hello"')

assert('SHOW INFO', ESQL.show('INFO').render(), 'SHOW INFO')

assert('TS', ESQL.ts('metrics-*').render(), 'TS metrics-*')

// --- 2. InstrumentedExpression (E) ---
console.log('\nExpressions:')

assert('E().gt()', E('salary').gt(50000).toString(), 'salary > 50000')

assert('E().between()', E('age').between(18, 65).toString(), 'age >= 18 AND age <= 65')

assert('E().like()', E('name').like('%john%').toString(), 'name LIKE "%john%"')

assert('E().in()', E('dept').in(['A', 'B']).toString(), 'dept IN ("A", "B")')

assert('E arithmetic chain', E('price').mul(E('quantity')).toString(), 'price * quantity')

// --- 3. col() helper ---
console.log('\ncol() helper:')

assert('col() returns expression', col('salary').gt(50000).toString(), 'salary > 50000')

// --- 4. esql template tag ---
console.log('\nesql template tag:')

const minSalary = 50000
const nameExpr = E('first_name')
assert(
  'esql tag with mixed values',
  esql`${nameExpr} LIKE ${'%john%'} AND salary > ${minSalary}`.toString(),
  'first_name LIKE "%john%" AND salary > 50000'
)

// --- 5. Logical operators ---
console.log('\nLogical operators:')

assert('and_()', and_(E('x').gt(1), E('y').lt(10)).toString(), '(x > 1) AND (y < 10)')

assert(
  'or_()',
  or_(E('status').eq('active'), E('status').eq('pending')).toString(),
  '(status == "active") OR (status == "pending")'
)

assert('not_()', not_(E('deleted').eq(true)).toString(), 'NOT (deleted == true)')

// --- 6. Processing commands ---
console.log('\nProcessing commands:')

assert(
  'WHERE with expression',
  ESQL.from('employees').where(E('salary').gt(50000)).render(),
  'FROM employees\n| WHERE salary > 50000'
)

assert(
  'WHERE with string',
  ESQL.from('employees').where('salary > 50000').render(),
  'FROM employees\n| WHERE salary > 50000'
)

assert(
  'EVAL with named columns',
  ESQL.from('employees').eval({ bonus: 'salary * 0.1' }).render(),
  'FROM employees\n| EVAL bonus = salary * 0.1'
)

assert(
  'STATS with BY',
  ESQL.from('employees').stats({ avg_sal: 'AVG(salary)' }).by('dept').render(),
  'FROM employees\n| STATS avg_sal = AVG(salary) BY dept'
)

assert(
  'SORT',
  ESQL.from('employees').sort('salary DESC').render(),
  'FROM employees\n| SORT salary DESC'
)

assert('LIMIT', ESQL.from('employees').limit(10).render(), 'FROM employees\n| LIMIT 10')

assert(
  'KEEP with wildcards',
  ESQL.from('employees').keep('emp_no', 'first_*').render(),
  'FROM employees\n| KEEP emp_no, first_*'
)

assert('DROP', ESQL.from('employees').drop('temp').render(), 'FROM employees\n| DROP temp')

// --- 7. POJO where ---
console.log('\nPOJO where():')

assert(
  'implicit equality',
  ESQL.from('t').where({ status: 'active' }).render(),
  'FROM t\n| WHERE status == "active"'
)

assert(
  'Op.gt',
  ESQL.from('t')
    .where({ salary: { [Op.gt]: 50000 } })
    .render(),
  'FROM t\n| WHERE salary > 50000'
)

assert(
  'Op.or at top level',
  ESQL.from('t')
    .where({ [Op.or]: [{ x: 1 }, { y: 2 }] })
    .render(),
  'FROM t\n| WHERE (x == 1) OR (y == 2)'
)

// --- 8. Full pipeline ---
console.log('\nFull pipeline:')

const fullQuery = ESQL.from('employees')
  .where(E('salary').gt(50000))
  .eval({ bonus: E('salary').mul(0.1) })
  .stats({ avg_bonus: 'AVG(bonus)' })
  .by('department')
  .sort('avg_bonus DESC')
  .limit(10)

assert(
  'multi-step pipeline',
  fullQuery.render(),
  'FROM employees\n| WHERE salary > 50000\n| EVAL bonus = salary * 0.1\n| STATS avg_bonus = AVG(bonus) BY department\n| SORT avg_bonus DESC\n| LIMIT 10'
)

// --- 9. Immutability ---
console.log('\nImmutability:')

const base = ESQL.from('logs').where('level = "ERROR"')
const branch1 = base.limit(10)
const branch2 = base.limit(100)

assert('branch1 is independent', branch1.render(), 'FROM logs\n| WHERE level = "ERROR"\n| LIMIT 10')
assert(
  'branch2 is independent',
  branch2.render(),
  'FROM logs\n| WHERE level = "ERROR"\n| LIMIT 100'
)

// --- 10. toJSON ---
console.log('\ntoJSON:')

const jsonResult = ESQL.from('logs').limit(5).toJSON()
assert('toJSON output', JSON.stringify(jsonResult), '{"query":"FROM logs\\n| LIMIT 5"}')

// --- 11. formatIdentifier ---
console.log('\nformatIdentifier:')

assert('simple identifier', formatIdentifier('name'), 'name')
assert('wildcard passthrough', formatIdentifier('logs-*', { allowPatterns: true }), 'logs-*')

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`)
if (failed > 0) {
  process.exit(1)
}
