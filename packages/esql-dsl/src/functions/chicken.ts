/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InstrumentedExpression } from '../expression'

export function chicken(): InstrumentedExpression {
  return new InstrumentedExpression('\u{1F414}')
}
