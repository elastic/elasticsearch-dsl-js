#!/usr/bin/env node

/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Check that all source files have the correct SPDX license header
 */

const fs = require('fs')
const path = require('path')

const EXPECTED_HEADER = `/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */`

const EXTENSIONS = ['.ts', '.js', '.mjs']
const DIRECTORIES = ['src', 'test', 'scripts']

function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files)
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let normalizedContent = content.replace(/\r\n/g, '\n')

  if (normalizedContent.startsWith('#!')) {
    const lines = normalizedContent.split('\n')
    lines.shift()
    normalizedContent = lines.join('\n').trimStart()
  }

  if (!normalizedContent.startsWith(EXPECTED_HEADER)) {
    return false
  }

  return true
}

function main() {
  const root = path.resolve(__dirname, '..')
  const errors = []

  for (const dir of DIRECTORIES) {
    const dirPath = path.join(root, dir)
    const files = getAllFiles(dirPath)

    for (const file of files) {
      if (!checkFile(file)) {
        const relativePath = path.relative(root, file)
        errors.push(relativePath)
      }
    }
  }

  if (errors.length > 0) {
    console.error('The following files are missing the correct SPDX license header:\n')
    for (const error of errors) {
      console.error(`  - ${error}`)
    }
    console.error(`\nExpected header:\n${EXPECTED_HEADER}\n`)
    process.exit(1)
  }

  console.log('All files have the correct SPDX license header.')
}

main()
