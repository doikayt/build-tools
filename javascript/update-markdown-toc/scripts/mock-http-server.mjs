#!/usr/bin/env node
/**
 * Minimal mock HTTP server for link validation integration tests.
 * Each path returns a specific status code for deterministic testing.
 *
 * Usage: node mock-http-server.mjs <port>
 *
 * Routes:
 *   /ok          → 200
 *   /not-found   → 404
 *   /forbidden   → 403
 *   /moved       → 301
 *   /slow        → delays 10s (for timeout testing)
 */

import http from 'node:http'

const port = parseInt(process.argv[2] ?? '0', 10)

const server = http.createServer((req, res) => {
  const path = req.url ?? '/'

  if (path === '/ok') {
    res.writeHead(200)
    res.end('OK')
    return
  }

  if (path === '/not-found') {
    res.writeHead(404)
    res.end('Not Found')
    return
  }

  if (path === '/forbidden') {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  if (path === '/moved') {
    res.writeHead(301, { Location: `http://localhost:${server.address().port}/ok` })
    res.end()
    return
  }

  if (path === '/slow') {
    // Never responds — used to test timeout
    return
  }

  res.writeHead(404)
  res.end('Unknown route')
})

server.listen(port, '127.0.0.1', () => {
  // Print port to stdout so the shell script can read it
  console.log(server.address().port)
})

process.on('SIGTERM', () => {
  server.close(() => process.exit(0))
})
