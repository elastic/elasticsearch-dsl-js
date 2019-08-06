'use strict'

import * as http from 'http'
import stoppable from 'stoppable'

function buildServer (handler, cb) {
  const server = stoppable(http.createServer())

  server.on('request', handler)
  server.on('error', err => {
    console.log('http server error', err)
    process.exit(1)
  })
  server.listen(0, () => {
    const port = server.address().port
    cb(port, server)
  })
}

export { buildServer }
