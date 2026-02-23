/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { escapeIdentifier } from '@elastic/elasticsearch-query-builder'

export function formatIdentifier(name: string, opts?: { allowPatterns?: boolean }): string {
  if (opts?.allowPatterns && name.includes('*')) {
    return name
  }
  return escapeIdentifier(name)
}
