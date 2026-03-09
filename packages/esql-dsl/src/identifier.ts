/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { escapeIdentifier } from '@elastic/elasticsearch-query-builder'

/**
 * Formats a name as an ES|QL identifier, escaping with backticks when necessary.
 * When `allowPatterns` is true, names containing `*` are passed through unescaped
 * to support wildcard patterns (e.g. `logs-*`).
 *
 * @param name - The identifier to format.
 * @param opts - Options. Set `allowPatterns: true` to allow wildcards.
 */
export function formatIdentifier(name: string, opts?: { allowPatterns?: boolean }): string {
  if (opts?.allowPatterns && name.includes('*')) {
    return name
  }
  return escapeIdentifier(name)
}
