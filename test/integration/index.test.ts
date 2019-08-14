'use strict'

import { join } from 'path'
import tap from 'tap'
import * as es5 from 'es-client-5'
import * as es6 from 'es-client-6'
import * as es7 from 'es-client-7'
import runner from './runner'

const matrix = [
  { docker: join(__dirname, '..', 'docker', 'es-docker-5.sh'), client: es5, version: 5 },
  { docker: join(__dirname, '..', 'docker', 'es-docker-6.sh'), client: es6, version: 6 },
  { docker: join(__dirname, '..', 'docker', 'es-docker-7.sh'), client: es7, version: 7 }
]

tap.jobs = matrix.length
for (const line of matrix) {
  tap.test(`Test with client v${line.version}`, t => {
    runner(t, line)
    t.end()
  })
}
